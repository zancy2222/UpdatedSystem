from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Personnel

class PersonnelAdmin(UserAdmin):
    list_display = ('id', 'username', 'email', 'firstname', 'lastname', 'position', 'is_staff')
    list_filter = ('position', 'sex', 'CivilStatus', 'is_staff')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('firstname', 'middlename', 'lastname', 'email', 'MobileNumber', 'address', 'birthplace', 'birthday', 'sex', 'CivilStatus')}),
        ('Professional Info', {'fields': ('position',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'firstname', 'lastname', 'email', 'position'),
        }),
    )
    search_fields = ('username', 'firstname', 'lastname', 'email')
    ordering = ('id',)
    filter_horizontal = ('groups', 'user_permissions',)

admin.site.register(Personnel, PersonnelAdmin)