# client_appointments/serializers.py
from rest_framework import serializers
from .models import ClientAppointment, AppointmentAttachment
from clients.models import Client
from personnel.models import Personnel
from appointment_nature.models import AppointmentNature
from datetime import date

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
        read_only_fields = ['client', 'inquiry_type', 'created_at', 'updated_at']

class ClientAppointmentCreateSerializer(serializers.ModelSerializer):
    officer_id = serializers.IntegerField(write_only=True, required=True)
    
    class Meta:
        model = ClientAppointment
        fields = ['client', 'inquiry_type', 'appointment_date', 'notes', 'officer_id']
    
    def validate_appointment_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Appointment date cannot be in the past.")
        return value
    
    def validate(self, attrs):
        appointment_date = attrs.get('appointment_date')
        if appointment_date:
            # Exclude the current appointment (if updating) when counting
            count = ClientAppointment.objects.filter(appointment_date=appointment_date).count()
            if count >= 10:
                raise serializers.ValidationError({
                    'appointment_date': 'This schedule is already full. Please select another date.'
                })
        return attrs
    
    def validate_inquiry_type(self, value):
        try:
            AppointmentNature.objects.get(id=value.id)
        except AppointmentNature.DoesNotExist:
            raise serializers.ValidationError("Invalid appointment nature selected.")
        return value
    
    def validate_officer_id(self, value):
        try:
            Personnel.objects.get(id=value)
        except Personnel.DoesNotExist:
            raise serializers.ValidationError("Invalid officer selected.")
        return value
    
    def create(self, validated_data):
        officer_id = validated_data.pop('officer_id')
        officer = Personnel.objects.get(id=officer_id)
        client = validated_data.get('client')
        status = 'Confirmed' if client.is_pwd or client.is_pregnant or client.age >= 60 else 'Pending'
        appointment = ClientAppointment.objects.create(
            **validated_data,
            assigned_officer=officer,
            status=status
        )
        return appointment

class ClientAppointmentUpdateSerializer(serializers.ModelSerializer):
    officer_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = ClientAppointment
        fields = ['status', 'notes', 'feedback', 'rating', 'appointment_date', 'officer_id']
    
    def validate_appointment_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Appointment date cannot be in the past.")
        return value
    
    def validate(self, attrs):
        appointment_date = attrs.get('appointment_date')
        if appointment_date:
            # Exclude the current appointment when counting
            count = ClientAppointment.objects.filter(
                appointment_date=appointment_date
            ).exclude(id=self.instance.id).count()
            if count >= 10:
                raise serializers.ValidationError({
                    'appointment_date': 'This schedule is already full. Please select another date.'
                })
        return attrs
    
    def validate_officer_id(self, value):
        if value:
            try:
                Personnel.objects.get(id=value)
            except Personnel.DoesNotExist:
                raise serializers.ValidationError("Invalid officer selected.")
        return value
    
    def validate_status(self, value):
        valid_statuses = [choice[0] for choice in ClientAppointment.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid status. Choose from {valid_statuses}")
        return value
    
    def update(self, instance, validated_data):
        officer_id = validated_data.pop('officer_id', None)
        if officer_id:
            instance.assigned_officer = Personnel.objects.get(id=officer_id)
        return super().update(instance, validated_data)