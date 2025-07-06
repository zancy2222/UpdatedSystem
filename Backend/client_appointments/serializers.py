# client_appointments/serializers.py
from rest_framework import serializers
from .models import ClientAppointment, AppointmentAttachment
from clients.models import Client
from personnel.models import Personnel
from appointment_nature.models import AppointmentNature

class AppointmentAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentAttachment
        fields = ['id', 'filename', 'file_size', 'uploaded_at']


class ClientAppointmentSerializer(serializers.ModelSerializer):
    attachments = AppointmentAttachmentSerializer(many=True, read_only=True)
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    assigned_officer_name = serializers.CharField(source='assigned_officer.firstname', read_only=True)
    inquiry_display_name = serializers.CharField(source='inquiry_type.nature', read_only=True)
    inquiry_description = serializers.CharField(source='inquiry_type.description', read_only=True)
    routing_option = serializers.CharField(source='inquiry_type.routing_option', read_only=True)
    
    class Meta:
        model = ClientAppointment
        fields = [
            'id', 'client', 'client_name', 'inquiry_type', 'inquiry_display_name', 
            'inquiry_description', 'routing_option', 'appointment_date', 'status', 
            'assigned_officer', 'assigned_officer_name', 'notes', 'feedback',
            'translated_feedback', 'feedback_language', 'rating', 'sentiment_score',
            'sentiment_label', 'attachments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['assigned_officer', 'created_at', 'updated_at']

class ClientAppointmentCreateSerializer(serializers.ModelSerializer):
    officer_id = serializers.IntegerField(write_only=True, required=True)
    
    class Meta:
        model = ClientAppointment
        fields = ['client', 'inquiry_type', 'appointment_date', 'notes', 'officer_id']
    
    def validate_appointment_date(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError("Appointment date cannot be in the past.")
        return value
    
    def validate_inquiry_type(self, value):
        """Ensure the appointment nature exists"""
        try:
            AppointmentNature.objects.get(id=value.id)
        except AppointmentNature.DoesNotExist:
            raise serializers.ValidationError("Invalid appointment nature selected.")
        return value
    
    def create(self, validated_data):
        officer_id = validated_data.pop('officer_id')
        try:
            officer = Personnel.objects.get(id=officer_id)
        except Personnel.DoesNotExist:
            raise serializers.ValidationError({"officer_id": "Officer not found"})

        client = validated_data.get('client')

        # Automatically confirm appointment if client is PWD or pregnant
        status = 'Confirmed' if client.is_pwd or client.is_pregnant or client.age >= 60 else 'Pending'

        appointment = ClientAppointment.objects.create(
            **validated_data,
            assigned_officer=officer,
            status=status
        )
        return appointment

class ClientAppointmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientAppointment
        fields = ['status', 'notes', 'feedback', 'rating']  
    
    def validate_status(self, value):
        return value