from django.contrib import admin
from .models import ClientAppointment, AppointmentAttachment

@admin.register(ClientAppointment)
class ClientAppointmentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'client', 'inquiry_type', 'appointment_date', 
        'status', 'assigned_officer', 'created_at'
    ]
    list_filter = ['status', 'inquiry_type', 'appointment_date', 'created_at']
    search_fields = [
        'client__firstname', 'client__lastname', 'client__username',
        'assigned_officer__firstname', 'assigned_officer__lastname'
    ]
    date_hierarchy = 'appointment_date'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Appointment Information', {
            'fields': ('client', 'inquiry_type', 'appointment_date', 'status')
        }),
        ('Assignment', {
            'fields': ('assigned_officer',)
        }),
        ('Additional Information', {
            'fields': ('notes', 'feedback'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def get_readonly_fields(self, request, obj=None):
        readonly = list(self.readonly_fields)
        if obj:  # Editing existing object
            readonly.extend(['client', 'inquiry_type'])
        return readonly

@admin.register(AppointmentAttachment)
class AppointmentAttachmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'appointment', 'filename', 'file_size', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['appointment__client__firstname', 'appointment__client__lastname', 'filename']
    ordering = ['-uploaded_at']