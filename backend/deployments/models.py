from django.db import models


# ---------------------
# Choices
# ---------------------

REGION_CHOICES = [
    ('us-east-1', 'US East (N. Virginia)'),
    ('us-west-2', 'US West (Oregon)'),
    ('eu-west-1', 'EU (Ireland)'),
    ('ap-south-1', 'Asia Pacific (Mumbai)'),
    ('ap-southeast-1', 'Asia Pacific (Singapore)'),
]

FRAMEWORK_CHOICES = [
    ('react', 'React'),
    ('vue', 'Vue'),
    ('angular', 'Angular'),
    ('nextjs', 'Next.js'),
    ('django', 'Django'),
    ('flask', 'Flask'),
    ('express', 'Express.js'),
]

PLAN_CHOICES = [
    ('starter', 'Starter'),
    ('pro', 'Pro'),
]

STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('deploying', 'Deploying'),
    ('active', 'Active'),
    ('failed', 'Failed'),
    ('terminated', 'Terminated'),
]

LOG_LEVEL_CHOICES = [
    ('info', 'Info'),
    ('warning', 'Warning'),
    ('error', 'Error'),
]


# ---------------------
# Models
# ---------------------

class WebApp(models.Model):
    """A web application configured for deployment."""

    name = models.CharField(max_length=100)
    owner = models.CharField(max_length=100)  # GitHub username
    region = models.CharField(max_length=50, choices=REGION_CHOICES)
    framework = models.CharField(max_length=50, choices=FRAMEWORK_CHOICES)
    plan_type = models.CharField(max_length=20, choices=PLAN_CHOICES)
    repo_url = models.URLField(blank=True)
    repo_name = models.CharField(max_length=200, blank=True)
    branch = models.CharField(max_length=100, default='main')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.owner})"


class Environment(models.Model):
    """An environment (dev/staging/prod) belonging to a WebApp."""

    webapp = models.ForeignKey(
        WebApp, on_delete=models.CASCADE, related_name='environments'
    )
    name = models.CharField(max_length=50)  # "dev", "staging", "production"
    branch = models.CharField(max_length=100, default='main')
    port = models.IntegerField(default=3000)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.webapp.name} — {self.name}"


class EnvVariable(models.Model):
    """A single environment variable (key-value pair)."""

    environment = models.ForeignKey(
        Environment, on_delete=models.CASCADE, related_name='env_variables'
    )
    key = models.CharField(max_length=255)
    value = models.TextField()
    is_secret = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['key']

    def __str__(self):
        return f"{self.key}={'***' if self.is_secret else self.value}"


class Deployment(models.Model):
    """A single deployment event for an environment."""

    environment = models.ForeignKey(
        Environment, on_delete=models.CASCADE, related_name='deployments'
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending'
    )
    triggered_by = models.CharField(max_length=100, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"Deploy #{self.pk} — {self.status}"


class Instance(models.Model):
    """The compute instance (EC2) provisioned by a deployment."""

    deployment = models.OneToOneField(
        Deployment, on_delete=models.CASCADE, related_name='instance'
    )
    instance_type = models.CharField(max_length=20, default='t2.micro')
    cpu = models.CharField(max_length=20)
    ram = models.CharField(max_length=20)
    storage = models.CharField(max_length=20)
    public_ip = models.GenericIPAddressField(null=True, blank=True)
    ec2_instance_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.instance_type} — {self.public_ip or 'no IP yet'}"


class DeploymentLog(models.Model):
    """A log entry generated during deployment."""

    deployment = models.ForeignKey(
        Deployment, on_delete=models.CASCADE, related_name='logs'
    )
    log_level = models.CharField(
        max_length=10, choices=LOG_LEVEL_CHOICES, default='info'
    )
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"[{self.log_level}] {self.message[:50]}"
