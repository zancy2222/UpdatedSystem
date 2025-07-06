## File: Backend/appointment_nature/serializers.py
from rest_framework import serializers
from .models import AppointmentNature

class AppointmentNatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentNature
        fields = ['id', 'nature', 'routing_option', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']