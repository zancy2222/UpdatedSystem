## File: Backend/appointment_nature/admin.py

from django.contrib import admin
from .models import AppointmentNature

@admin.register(AppointmentNature)
class AppointmentNatureAdmin(admin.ModelAdmin):
    list_display = ('nature', 'routing_option', 'description', 'created_at')
    list_filter = ('routing_option',)
    search_fields = ('nature', 'description')
    ordering = ('nature',)