# client_appointments/models.py
from django.db import models
from clients.models import Client
from personnel.models import Personnel
from appointment_nature.models import AppointmentNature


class ClientAppointment(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'),
        ('Completed', 'Completed'),
    ]
    
    SENTIMENT_LABEL_CHOICES = [
        ('Positive', 'Positive'),
        ('Neutral', 'Neutral'),
        ('Negative', 'Negative'),
    ]
    
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='appointments')
    inquiry_type = models.ForeignKey(AppointmentNature, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    assigned_officer = models.ForeignKey(Personnel, on_delete=models.CASCADE, related_name='appointments')
    notes = models.TextField(blank=True, null=True)
    feedback = models.TextField(blank=True, null=True)
    translated_feedback = models.TextField(blank=True, null=True)  # Stores English translation
    feedback_language = models.CharField(max_length=10, blank=True, null=True)  # Original language code
    rating = models.PositiveSmallIntegerField(blank=True, null=True)
    sentiment_score = models.FloatField(blank=True, null=True)  # Sentiment score (-1 to 1)
    sentiment_label = models.CharField(
        max_length=10, 
        choices=SENTIMENT_LABEL_CHOICES, 
        blank=True, 
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.client.full_name} - {self.inquiry_type.nature} - {self.appointment_date}"
    
    @property
    def inquiry_display_name(self):
        return self.inquiry_type.nature

class AppointmentAttachment(models.Model):
    appointment = models.ForeignKey(ClientAppointment, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='appointment_attachments/')
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.appointment} - {self.filename}"