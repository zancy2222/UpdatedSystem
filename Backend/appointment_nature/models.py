## File: Backend/appointment_nature/models.py
from django.db import models

class AppointmentNature(models.Model):
    ROUTING_OPTIONS = [
        ('Head of Office', 'Head of Office'),
        ('Deputy', 'Deputy'),
        ('Administrative Officer', 'Administrative Officer'),
        ('Examiner', 'Examiner'),
    ]
    
    nature = models.CharField(max_length=100, unique=True)
    routing_option = models.CharField(max_length=50, choices=ROUTING_OPTIONS)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nature']

    def __str__(self):
        return self.nature