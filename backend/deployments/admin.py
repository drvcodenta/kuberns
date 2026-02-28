from django.contrib import admin
from .models import (
    WebApp, Environment, EnvVariable,
    Deployment, Instance, DeploymentLog,
)


class EnvironmentInline(admin.TabularInline):
    model = Environment
    extra = 0


class EnvVariableInline(admin.TabularInline):
    model = EnvVariable
    extra = 0


@admin.register(WebApp)
class WebAppAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'region', 'framework', 'plan_type', 'created_at']
    list_filter = ['region', 'framework', 'plan_type']
    search_fields = ['name', 'owner']
    inlines = [EnvironmentInline]


@admin.register(Environment)
class EnvironmentAdmin(admin.ModelAdmin):
    list_display = ['webapp', 'name', 'branch', 'port', 'is_active']
    list_filter = ['is_active', 'name']
    inlines = [EnvVariableInline]


@admin.register(EnvVariable)
class EnvVariableAdmin(admin.ModelAdmin):
    list_display = ['key', 'environment', 'is_secret', 'updated_at']
    list_filter = ['is_secret']


@admin.register(Deployment)
class DeploymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'environment', 'status', 'triggered_by', 'started_at']
    list_filter = ['status']


@admin.register(Instance)
class InstanceAdmin(admin.ModelAdmin):
    list_display = ['deployment', 'instance_type', 'public_ip', 'ec2_instance_id', 'status']
    list_filter = ['status', 'instance_type']


@admin.register(DeploymentLog)
class DeploymentLogAdmin(admin.ModelAdmin):
    list_display = ['deployment', 'log_level', 'message', 'timestamp']
    list_filter = ['log_level']
