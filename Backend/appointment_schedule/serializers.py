# appointment_schedule/serializers.py
from rest_framework import serializers
from .models import Appointment
from personnel.models import Personnel

class PersonnelSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Personnel
        fields = ['id', 'firstname', 'lastname', 'position', 'full_name']
    
    def get_full_name(self, obj):
        # Use your custom fields firstname/lastname instead of first_name/last_name
        return f"{obj.firstname} {obj.lastname}"
    
class AppointmentSerializer(serializers.ModelSerializer):
    head_of_office_detail = PersonnelSerializer(source='head_of_office', read_only=True)
    deputy_detail = PersonnelSerializer(source='deputy', read_only=True)
    admin_officer_detail = PersonnelSerializer(source='admin_officer', read_only=True)
    examiner_detail = PersonnelSerializer(source='examiner', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'date', 'time_slot', 
            'head_of_office', 'deputy', 'admin_officer', 'examiner',
            'head_of_office_detail', 'deputy_detail', 'admin_officer_detail', 'examiner_detail',
            'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        # Check if appointment already exists for this date and time
        if self.instance is None:  # Creating new appointment
            if Appointment.objects.filter(date=data['date'], time_slot=data['time_slot']).exists():
                raise serializers.ValidationError("An appointment already exists for this date and time.")
        else:  # Updating existing appointment
            existing = Appointment.objects.filter(
                date=data['date'], 
                time_slot=data['time_slot']
            ).exclude(id=self.instance.id)
            if existing.exists():
                raise serializers.ValidationError("An appointment already exists for this date and time.")
        
        return data