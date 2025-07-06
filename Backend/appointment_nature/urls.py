## File: Backend/appointment_nature/urls.py

from django.urls import path
from .views import (
    AppointmentNatureListCreateView,
    AppointmentNatureRetrieveUpdateDestroyView
)

urlpatterns = [
    path('appointment-natures/', 
         AppointmentNatureListCreateView.as_view(), 
         name='appointment-nature-list-create'),
    path('appointment-natures/<int:id>/', 
         AppointmentNatureRetrieveUpdateDestroyView.as_view(), 
         name='appointment-nature-retrieve-update-destroy'),
]