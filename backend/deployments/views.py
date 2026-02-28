from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import WebApp, Deployment, DeploymentLog, Instance
from .serializers import (
    WebAppCreateSerializer,
    WebAppListSerializer,
    DeploymentSerializer,
    DeploymentLogSerializer,
)


class WebAppViewSet(viewsets.ModelViewSet):
    """
    API endpoints for WebApps.

    list:    GET    /api/webapps/
    create:  POST   /api/webapps/
    detail:  GET    /api/webapps/<id>/
    deploy:  POST   /api/webapps/<id>/deploy/
    logs:    GET    /api/webapps/<id>/logs/
    """
    queryset = WebApp.objects.prefetch_related(
        'environments__env_variables',
        'environments__deployments__instance',
        'environments__deployments__logs',
    )

    def get_serializer_class(self):
        if self.action == 'create':
            return WebAppCreateSerializer
        return WebAppListSerializer

    @action(detail=True, methods=['post'])
    def deploy(self, request, pk=None):
        """
        Trigger a deployment for this webapp's first active environment.

        Accepts optional AWS credentials for real EC2 provisioning:
        {
            "triggered_by": "manual",
            "aws_access_key": "AKIA...",
            "aws_secret_key": "..."
        }

        If no AWS keys → runs simulated deployment with realistic delays.
        Either way, deployment runs in background — returns immediately.
        """
        webapp = self.get_object()
        environment = webapp.environments.filter(is_active=True).first()

        if not environment:
            return Response(
                {'error': 'No active environment found for this app.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Determine instance specs from plan type
        plan_specs = {
            'starter': {'cpu': '1 vCPU', 'ram': '1 GB', 'storage': '8 GB'},
            'pro': {'cpu': '2 vCPU', 'ram': '4 GB', 'storage': '20 GB'},
        }
        specs = plan_specs.get(webapp.plan_type, plan_specs['starter'])

        # Create deployment + instance
        deployment = Deployment.objects.create(
            environment=environment,
            triggered_by=request.data.get('triggered_by', 'api'),
        )
        Instance.objects.create(
            deployment=deployment,
            instance_type='t2.micro',
            **specs,
        )

        # Kick off background deploy (real or simulated)
        from django.conf import settings
        from .services import trigger_deploy
        trigger_deploy(
            deployment,
            aws_access_key=settings.AWS_ACCESS_KEY_ID,
            aws_secret_key=settings.AWS_SECRET_ACCESS_KEY,
        )

        serializer = DeploymentSerializer(deployment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        """Get all deployment logs for this webapp's latest deployment."""
        webapp = self.get_object()
        environment = webapp.environments.filter(is_active=True).first()

        if not environment:
            return Response(
                {'error': 'No active environment found.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        latest_deployment = environment.deployments.first()  # ordered by -started_at
        if not latest_deployment:
            return Response(
                {'error': 'No deployments found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        logs = latest_deployment.logs.all()
        serializer = DeploymentLogSerializer(logs, many=True)
        return Response(serializer.data)
