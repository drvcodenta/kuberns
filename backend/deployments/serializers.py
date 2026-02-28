from rest_framework import serializers
from .models import (
    WebApp, Environment, EnvVariable,
    Deployment, Instance, DeploymentLog,
)


# ---------------------
# Read / flat serializers
# ---------------------

class EnvVariableSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnvVariable
        fields = ['id', 'key', 'value', 'is_secret', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DeploymentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeploymentLog
        fields = ['id', 'log_level', 'message', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class InstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instance
        fields = [
            'id', 'instance_type', 'cpu', 'ram', 'storage',
            'public_ip', 'ec2_instance_id', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'public_ip', 'ec2_instance_id', 'created_at']


class DeploymentSerializer(serializers.ModelSerializer):
    instance = InstanceSerializer(read_only=True)
    logs = DeploymentLogSerializer(many=True, read_only=True)

    class Meta:
        model = Deployment
        fields = [
            'id', 'status', 'triggered_by',
            'started_at', 'finished_at',
            'instance', 'logs',
        ]
        read_only_fields = ['id', 'status', 'started_at', 'finished_at']


class EnvironmentSerializer(serializers.ModelSerializer):
    env_variables = EnvVariableSerializer(many=True, read_only=True)
    deployments = DeploymentSerializer(many=True, read_only=True)

    class Meta:
        model = Environment
        fields = [
            'id', 'name', 'branch', 'port', 'is_active',
            'created_at', 'env_variables', 'deployments',
        ]
        read_only_fields = ['id', 'created_at']


# ---------------------
# Create serializer (nested write)
# ---------------------

class EnvVariableCreateSerializer(serializers.Serializer):
    """Lightweight serializer for env vars inside the create payload."""
    key = serializers.CharField(max_length=255)
    value = serializers.CharField()
    is_secret = serializers.BooleanField(default=False)


class WebAppCreateSerializer(serializers.ModelSerializer):
    """
    Handles the full form submission from the frontend.

    One POST creates: WebApp + Environment + EnvVariables.
    Instance and Deployment are created when deploy is triggered.

    Expected payload:
    {
        "name": "my-app",
        "owner": "github-user",
        "region": "ap-south-1",
        "framework": "react",
        "plan_type": "starter",
        "repo_url": "https://github.com/user/repo",
        "repo_name": "user/repo",
        "branch": "main",
        "environment": {
            "name": "production",
            "branch": "main",
            "port": 3000
        },
        "env_variables": [
            {"key": "API_KEY", "value": "abc123", "is_secret": true},
            {"key": "NODE_ENV", "value": "production", "is_secret": false}
        ]
    }
    """
    environment = serializers.DictField(write_only=True)
    env_variables = EnvVariableCreateSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = WebApp
        fields = [
            'id', 'name', 'owner', 'region', 'framework', 'plan_type',
            'repo_url', 'repo_name', 'branch', 'created_at', 'updated_at',
            'environment', 'env_variables',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_environment(self, value):
        """Ensure environment has at least a name."""
        if 'name' not in value:
            raise serializers.ValidationError("Environment must have a 'name' field.")
        return value

    def create(self, validated_data):
        env_data = validated_data.pop('environment')
        env_vars_data = validated_data.pop('env_variables', [])

        # 1. Create WebApp
        webapp = WebApp.objects.create(**validated_data)

        # 2. Create Environment
        environment = Environment.objects.create(
            webapp=webapp,
            name=env_data.get('name', 'production'),
            branch=env_data.get('branch', validated_data.get('branch', 'main')),
            port=env_data.get('port', 3000),
        )

        # 3. Create EnvVariables
        env_var_objects = [
            EnvVariable(
                environment=environment,
                key=var['key'],
                value=var['value'],
                is_secret=var.get('is_secret', False),
            )
            for var in env_vars_data
        ]
        if env_var_objects:
            EnvVariable.objects.bulk_create(env_var_objects)

        return webapp


class WebAppListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing webapps."""
    environments = EnvironmentSerializer(many=True, read_only=True)

    class Meta:
        model = WebApp
        fields = [
            'id', 'name', 'owner', 'region', 'framework', 'plan_type',
            'repo_url', 'repo_name', 'branch',
            'created_at', 'updated_at', 'environments',
        ]
