"""
Deployment service — handles the full deploy lifecycle.

Flow:
1. Create Deployment + Instance records (status: pending)
2. Run deploy in a background thread
3. Status transitions: pending → deploying → active (or failed)
4. Each step logged to DeploymentLog
5. If AWS keys provided → real EC2, otherwise → simulated
"""

import threading
import time
from datetime import timezone, datetime

import boto3
from botocore.exceptions import ClientError

from .models import Deployment, Instance, DeploymentLog


def _log(deployment, message, level='info'):
    """Write a log entry for this deployment."""
    DeploymentLog.objects.create(
        deployment=deployment,
        log_level=level,
        message=message,
    )


def _update_status(deployment, new_status):
    """Update deployment status and log the transition."""
    old_status = deployment.status
    deployment.status = new_status
    if new_status in ('active', 'failed', 'terminated'):
        deployment.finished_at = datetime.now(timezone.utc)
    deployment.save()
    _log(deployment, f'Status changed: {old_status} → {new_status}')


# ---------------------
# AWS EC2 provisioning
# ---------------------

# AMI IDs for Amazon Linux 2023 (free tier eligible) per region
REGION_AMI_MAP = {
    'us-east-1': 'ami-0c02fb55956c7d316',
    'us-west-2': 'ami-0892d3c7ee96c0bf7',
    'eu-west-1': 'ami-0d71ea30463e0ff8d',
    'ap-south-1': 'ami-0614680123427b75e',
    'ap-southeast-1': 'ami-0b89f7b3f054b957e',
}


def _provision_ec2(deployment, instance, webapp, aws_access_key, aws_secret_key):
    """Actually create an EC2 instance via boto3."""
    region = webapp.region
    ami_id = REGION_AMI_MAP.get(region, REGION_AMI_MAP['us-east-1'])

    _log(deployment, f'Connecting to AWS EC2 in {region}...')

    try:
        ec2_client = boto3.client(
            'ec2',
            region_name=region,
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
        )

        _log(deployment, f'Launching t3.micro instance (AMI: {ami_id})...')

        response = ec2_client.run_instances(
            ImageId=ami_id,
            InstanceType='t3.micro',
            MinCount=1,
            MaxCount=1,
            TagSpecifications=[
                {
                    'ResourceType': 'instance',
                    'Tags': [
                        {'Key': 'Name', 'Value': f'kuberns-{webapp.name}'},
                        {'Key': 'Project', 'Value': 'kuberns'},
                        {'Key': 'DeploymentId', 'Value': str(deployment.pk)},
                    ],
                },
            ],
        )

        ec2_instance_id = response['Instances'][0]['InstanceId']
        instance.ec2_instance_id = ec2_instance_id
        instance.save()

        _log(deployment, f'EC2 instance created: {ec2_instance_id}')
        _log(deployment, 'Waiting for instance to enter running state...')

        # Wait for the instance to be running (polls every 15s, ~2-3 min)
        waiter = ec2_client.get_waiter('instance_running')
        waiter.wait(InstanceIds=[ec2_instance_id])

        # Get the public IP
        desc = ec2_client.describe_instances(InstanceIds=[ec2_instance_id])
        public_ip = desc['Reservations'][0]['Instances'][0].get('PublicIpAddress')

        instance.public_ip = public_ip
        instance.status = 'running'
        instance.save()

        _log(deployment, f'Instance running! Public IP: {public_ip or "no public IP assigned"}')
        return True

    except ClientError as e:
        error_msg = str(e)
        _log(deployment, f'AWS Error: {error_msg}', level='error')
        return False
    except Exception as e:
        _log(deployment, f'Unexpected error: {str(e)}', level='error')
        return False


# ---------------------
# Simulated provisioning
# ---------------------

def _simulate_provisioning(deployment, instance):
    """Simulate EC2 provisioning with realistic delays."""
    steps = [
        ('Initializing deployment environment...', 2),
        ('Allocating compute resources (t2.micro)...', 3),
        ('Configuring network and security groups...', 2),
        ('Launching instance...', 4),
        ('Waiting for instance health check...', 3),
        ('Assigning public IP address...', 1),
    ]

    for message, delay in steps:
        _log(deployment, message)
        time.sleep(delay)

    # Simulate a public IP
    instance.public_ip = '13.234.176.42'
    instance.ec2_instance_id = 'i-0sim1234567890abc'
    instance.status = 'running'
    instance.save()

    _log(deployment, 'Instance running! Public IP: 13.234.176.42 (simulated)')
    return True


# ---------------------
# Main deploy function
# ---------------------

def _run_deploy(deployment_id, aws_access_key=None, aws_secret_key=None):
    """
    Background deploy task. Runs in a separate thread.
    If AWS keys are provided → real EC2. Otherwise → simulated.
    """
    deployment = Deployment.objects.select_related(
        'instance', 'environment__webapp'
    ).get(pk=deployment_id)
    instance = deployment.instance
    webapp = deployment.environment.webapp

    try:
        # Step 1: pending → deploying
        _update_status(deployment, 'deploying')
        _log(deployment, f'Starting deployment for {webapp.name} ({webapp.region})')

        # Step 2: provision
        use_real_aws = aws_access_key and aws_secret_key
        if use_real_aws:
            _log(deployment, 'AWS credentials provided — using real EC2 provisioning')
            success = _provision_ec2(
                deployment, instance, webapp,
                aws_access_key, aws_secret_key,
            )
        else:
            _log(deployment, 'No AWS credentials — running simulated deployment')
            success = _simulate_provisioning(deployment, instance)

        # Step 3: deploying → active or failed
        if success:
            _update_status(deployment, 'active')
            _log(deployment, f'Deployment complete! App is live.')
        else:
            _update_status(deployment, 'failed')
            _log(deployment, 'Deployment failed.', level='error')

    except Exception as e:
        _update_status(deployment, 'failed')
        _log(deployment, f'Fatal error: {str(e)}', level='error')


def trigger_deploy(deployment, aws_access_key=None, aws_secret_key=None):
    """
    Public API — call this from the view.
    Kicks off the deployment in a background thread.
    """
    _log(deployment, f'Deployment #{deployment.pk} queued')

    thread = threading.Thread(
        target=_run_deploy,
        args=(deployment.pk,),
        kwargs={
            'aws_access_key': aws_access_key,
            'aws_secret_key': aws_secret_key,
        },
        daemon=True,
    )
    thread.start()
