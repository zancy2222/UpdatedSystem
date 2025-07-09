# client_appointments/serializers.py
from rest_framework import serializers
from .models import ClientAppointment, AppointmentAttachment
from clients.models import Client
from personnel.models import Personnel
from appointment_nature.models import AppointmentNature
from datetime import date
from utils.sms import send_sms 

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
        print("[DEBUG] Starting appointment creation...")

        officer_id = validated_data.pop('officer_id')
        try:
            officer = Personnel.objects.get(id=officer_id)
        except Personnel.DoesNotExist:
            print("[ERROR] Officer not found.")
            raise serializers.ValidationError({"officer_id": "Officer not found"})

        client = validated_data.get('client')

        status = 'Confirmed' if client.is_pwd or client.is_pregnant or client.age >= 60 else 'Pending'
        print(f"[DEBUG] Appointment status: {status}")

        appointment = ClientAppointment.objects.create(
            **validated_data,
            assigned_officer=officer,
            status=status
        )
        print(f"[DEBUG] Appointment created: {appointment}")

        if status == 'Confirmed' and client.contact_number:
            message = f"Hi {client.full_name}, your appointment on {appointment.appointment_date} has been CONFIRMED."
            print(f"[DEBUG] Sending SMS to {client.contact_number}: {message}")
            response = send_sms(client.contact_number, message)
            print(f"[DEBUG] Semaphore response: {response.status_code} {response.text}")
        else:
            print("[DEBUG] No SMS sent (status not confirmed or no contact number).")

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
        print("[DEBUG] Starting update for ClientAppointment ID:", instance.id)

        previous_status = instance.status
        print(f"[DEBUG] Previous status: {previous_status}")

        officer_id = validated_data.pop('officer_id', None)
        if officer_id:
            print(f"[DEBUG] Updating assigned officer to ID: {officer_id}")
            try:
                officer = Personnel.objects.get(id=officer_id)
                instance.assigned_officer = officer
                print(f"[DEBUG] Officer set to: {officer.firstname} {officer.lastname}")
            except Personnel.DoesNotExist:
                print("[ERROR] Officer not found with ID:", officer_id)
                raise serializers.ValidationError({"officer_id": "Officer not found"})

        # Perform the actual update
        instance = super().update(instance, validated_data)
        new_status = instance.status
        print(f"[DEBUG] New status: {new_status}")

        # Check and send SMS if status changed to Confirmed or Cancelled
        if previous_status != new_status and new_status in ['Confirmed', 'Cancelled']:
            client = instance.client
            phone = client.contact_number
            print(f"[DEBUG] Status changed — preparing to send SMS to: {phone}")

            if phone:
                if new_status == 'Confirmed':
                    message = f"Hi {client.full_name}, your appointment on {instance.appointment_date} has been CONFIRMED."
                elif new_status == 'Cancelled':
                    message = f"Hi {client.full_name}, your appointment on {instance.appointment_date} has been CANCELLED."

                print(f"[DEBUG] Sending SMS to {phone}: {message}")
                response = send_sms(phone, message)
                print(f"[DEBUG] Semaphore response: {response.status_code} - {response.text}")
            else:
                print("[DEBUG] No phone number provided — skipping SMS.")
        else:
            print("[DEBUG] No status change requiring SMS.")

        print("[DEBUG] Update complete for ClientAppointment ID:", instance.id)
        return instance
