## File: Backend/appointment_nature/views.py

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import AppointmentNature
from .serializers import AppointmentNatureSerializer

class AppointmentNatureListCreateView(generics.ListCreateAPIView):
    queryset = AppointmentNature.objects.all()
    serializer_class = AppointmentNatureSerializer
    permission_classes = [permissions.AllowAny]  
    
     
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

class AppointmentNatureRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AppointmentNature.objects.all()
    serializer_class = AppointmentNatureSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]   
    
    
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"detail": "Appointment nature deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )