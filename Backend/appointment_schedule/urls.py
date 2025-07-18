# appointment_schedule/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet

router = DefaultRouter()
router.register(r'appointment-schedules', AppointmentViewSet, basename='appointment-schedules')

urlpatterns = [
    path('', include(router.urls)),
]