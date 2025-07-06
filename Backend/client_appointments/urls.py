from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientAppointmentViewSet

router = DefaultRouter()
router.register(r'client-appointments', ClientAppointmentViewSet, basename='client_appointments')

urlpatterns = [
    path('', include(router.urls)),
]