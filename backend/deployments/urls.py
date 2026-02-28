from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WebAppViewSet

router = DefaultRouter()
router.register(r'webapps', WebAppViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
