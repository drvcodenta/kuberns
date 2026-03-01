from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_root(request):
    """Root endpoint — confirms the API is running."""
    return JsonResponse({
        'service': 'Kuberns API',
        'status': 'running',
        'endpoints': {
            'api': '/api/',
            'webapps': '/api/webapps/',
            'admin': '/admin/',
        }
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('deployments.urls')),
]
