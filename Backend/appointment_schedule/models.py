# appointment_schedule/models.py
from django.db import models
from personnel.models import Personnel

class Appointment(models.Model):
    date = models.DateField()
    time_slot = models.CharField(max_length=50, default='2:00 - 3:30 PM')
    head_of_office = models.ForeignKey(
        Personnel, 
        on_delete=models.CASCADE, 
        related_name='head_appointments',
        limit_choices_to={'position': 'Head of Office'}
    )
    deputy = models.ForeignKey(
        Personnel, 
        on_delete=models.CASCADE, 
        related_name='deputy_appointments',
        limit_choices_to={'position': 'Deputy'},
        null=True, 
        blank=True
    )
    admin_officer = models.ForeignKey(
        Personnel, 
        on_delete=models.CASCADE, 
        related_name='admin_appointments',
        limit_choices_to={'position': 'Administrative Officer'},
        null=True, 
        blank=True
    )
    examiner = models.ForeignKey(
        Personnel, 
        on_delete=models.CASCADE, 
        related_name='examiner_appointments',
        limit_choices_to={'position': 'Examiner'},
        null=True, 
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('date', 'time_slot')
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"Appointment on {self.date} at {self.time_slot}"