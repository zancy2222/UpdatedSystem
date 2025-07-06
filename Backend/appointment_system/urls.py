# Appointment System URL Configuration
#---IMPORTS------------------------------------------------------------------------------------------------------------------------------------------------------------------------
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
#----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

#---PROJECT URLS-------------------------------------------------------------------------------------------------------------------------------------------------------------------

urlpatterns = [

    # FOR DJANGO ADMIN
    path('admin/', admin.site.urls),

    # CLIENT URLS
    path('api/clients/', include('clients.urls')),
        # CLIENT APPOINTMENTS URLS
    path('api/', include('client_appointments.urls')),
     
     path('api/personnel/', include('personnel.urls')),  
    # path('api/personnel/', include('personnel.urls')),
       path('api/', include('appointment_schedule.urls')),
path('api/', include('appointment_nature.urls')),
    # APPOINTMENT URLS
  path('api/client_appointments/', include('client_appointments.urls')),
]

# SERVES MEDIA FILES FOR DEVELOPMENT / DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

#----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------