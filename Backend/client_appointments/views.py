# client_appointments/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
import os
from django.db.models import Count, Q
from datetime import date
from django.utils import timezone
from .models import ClientAppointment, AppointmentAttachment
from .serializers import (
    ClientAppointmentSerializer, 
    ClientAppointmentCreateSerializer,
    ClientAppointmentUpdateSerializer
)
from clients.models import Client
from googletrans import Translator
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

# Download VADER lexicon if not already present
try:
    nltk.data.find('sentiment/vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')
class ClientAppointmentViewSet(viewsets.ModelViewSet):
    queryset = ClientAppointment.objects.all()
    serializer_class = ClientAppointmentSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ClientAppointmentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ClientAppointmentUpdateSerializer
        return ClientAppointmentSerializer
    
    def create(self, request):
        """Create a new appointment with file attachments"""
        # Ensure officer_id is included in the data
        request_data = request.data.copy()
        if 'officer_id' not in request_data:
            return Response({
                'success': False,
                'message': 'officer_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request_data)
        
        if serializer.is_valid():
            appointment = serializer.save()
            
            # Handle file attachments
            uploaded_files = request.FILES.getlist('attachments')
            for file in uploaded_files:
                AppointmentAttachment.objects.create(
                    appointment=appointment,
                    file=file, 
                    filename=file.name,
                    file_size=file.size
                )
            
            full_serializer = ClientAppointmentSerializer(appointment)
            
            return Response({
                'success': True,
                'data': full_serializer.data,
                'message': 'Appointment created successfully'
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors,
            'message': 'Failed to create appointment'
        }, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['get'])
    def full_dates(self, request):
        """Return appointment dates that are already full (10 or more)"""
        full_dates = (
            ClientAppointment.objects
            .values('appointment_date')
            .annotate(total=Count('id'))
            .filter(total__gte=10)
            .values_list('appointment_date', flat=True)
        )

        return Response({
            'success': True,
            'data': list(full_dates)
        })
    
    @action(detail=True, methods=['post'])
    def upload_attachment(self, request, pk=None):
        """Upload additional attachments to an existing appointment"""
        appointment = get_object_or_404(ClientAppointment, pk=pk)
        
        uploaded_files = request.FILES.getlist('files')
        if not uploaded_files:
            return Response({
                'success': False,
                'message': 'No files provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        attachments_created = []
        for file in uploaded_files:
            # Create attachment record - the file will be saved automatically
            attachment = AppointmentAttachment.objects.create(
                appointment=appointment,
                file=file,  # Use the file directly
                filename=file.name,
                file_size=file.size
            )
            attachments_created.append({
                'id': attachment.id,
                'filename': attachment.filename,
                'file_size': attachment.file_size
            })
        
        return Response({
            'success': True,
            'data': attachments_created,
            'message': f'{len(attachments_created)} file(s) uploaded successfully'
        })
    
    @action(detail=True, methods=['get'])
    def download_attachment(self, request, pk=None):
        """Download an attachment file"""
        appointment = get_object_or_404(ClientAppointment, pk=pk)
        attachment_id = request.query_params.get('attachment_id')
        
        if not attachment_id:
            return Response({
                'success': False,
                'message': 'attachment_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            attachment = AppointmentAttachment.objects.get(
                id=attachment_id, 
                appointment=appointment
            )
            
            # Return file URL for viewing in new tab
            if attachment.file:
                file_url = request.build_absolute_uri(attachment.file.url)
                return Response({
                    'success': True,
                    'data': {
                        'filename': attachment.filename,
                        'file_size': attachment.file_size,
                        'file_url': file_url,
                        'content_type': attachment.file.content_type if hasattr(attachment.file, 'content_type') else 'application/octet-stream'
                    }
                })
            else:
                return Response({
                    'success': False,
                    'message': 'File not found on server'
                }, status=status.HTTP_404_NOT_FOUND)
                
        except AppointmentAttachment.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Attachment not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    
    def list(self, request):
        """Get all appointments or filter by client"""
        client_id = request.query_params.get('client_id')
        
        if client_id:
            appointments = self.queryset.filter(client_id=client_id)
        else:
            appointments = self.queryset.all()
        
        serializer = self.get_serializer(appointments, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Appointments retrieved successfully'
        })
    
    def retrieve(self, request, pk=None):
        """Get a specific appointment"""
        appointment = get_object_or_404(ClientAppointment, pk=pk)
        serializer = self.get_serializer(appointment)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Appointment retrieved successfully'
        })
    
    def update(self, request, pk=None):
        """Update an appointment"""
        appointment = get_object_or_404(ClientAppointment, pk=pk)
        serializer = self.get_serializer(appointment, data=request.data, partial=True)
        
        if serializer.is_valid():
            updated_appointment = serializer.save()
            
            # Return full appointment data
            full_serializer = ClientAppointmentSerializer(updated_appointment)
            
            return Response({
                'success': True,
                'data': full_serializer.data,
                'message': 'Appointment updated successfully'
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors,
            'message': 'Failed to update appointment'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, pk=None):
        """Delete an appointment"""
        appointment = get_object_or_404(ClientAppointment, pk=pk)
        appointment.delete()
        
        return Response({
            'success': True,
            'message': 'Appointment deleted successfully'
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        appointment = get_object_or_404(ClientAppointment, pk=pk)
        
        if appointment.status in ['Cancelled', 'Completed']:
            return Response({
                'success': False,
                'message': f'Cannot cancel appointment that is already {appointment.status.lower()}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        appointment.status = 'Cancelled'
        appointment.save()
        
        serializer = ClientAppointmentSerializer(appointment)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Appointment cancelled successfully'
        })
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm an appointment"""
        appointment = get_object_or_404(ClientAppointment, pk=pk)
        
        if appointment.status != 'Pending':
            return Response({
                'success': False,
                'message': 'Only pending appointments can be confirmed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        appointment.status = 'Confirmed'
        appointment.save()
        
        serializer = ClientAppointmentSerializer(appointment)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Appointment confirmed successfully'
        })
    
    @action(detail=False, methods=['get'])
    def by_client(self, request):
        """Get appointments for a specific client"""
        client_id = request.query_params.get('client_id')
        
        if not client_id:
            return Response({
                'success': False,
                'message': 'client_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            client = Client.objects.get(id=client_id)
        except Client.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Client not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        appointments = ClientAppointment.objects.filter(client=client)
        serializer = ClientAppointmentSerializer(appointments, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'client': {
                'id': client.id,
                'name': client.full_name,
                'username': client.username
            },
            'message': f'Appointments for {client.full_name} retrieved successfully'
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get appointment statistics"""
        total_appointments = ClientAppointment.objects.count()
        pending_appointments = ClientAppointment.objects.filter(status='Pending').count()
        confirmed_appointments = ClientAppointment.objects.filter(status='Confirmed').count()
        cancelled_appointments = ClientAppointment.objects.filter(status='Cancelled').count()
        completed_appointments = ClientAppointment.objects.filter(status='Completed').count()
        
        return Response({
            'success': True,
            'data': {
                'total': total_appointments,
                'pending': pending_appointments,
                'confirmed': confirmed_appointments,
                'cancelled': cancelled_appointments,
                'completed': completed_appointments
            },
            'message': 'Appointment statistics retrieved successfully'
        })
        

    @action(detail=True, methods=['post'])
    def feedback(self, request, pk=None):
        """Submit feedback for a completed appointment with translation and sentiment analysis"""
        appointment = get_object_or_404(ClientAppointment, pk=pk)
        
        # Validate appointment status
        if appointment.status != 'Completed':
            return Response({
                'success': False,
                'message': 'Feedback can only be submitted for completed appointments'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate required fields
        feedback_text = request.data.get('feedback')
        rating = request.data.get('rating')
        
        
        if not feedback_text or not rating:
            return Response({
                'success': False,
                'message': 'Both feedback text and rating are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                raise ValueError
        except (ValueError, TypeError):
            return Response({
                'success': False,
                'message': 'Rating must be an integer between 1 and 5'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            translated_feedback, detected_language = self.translate_text(feedback_text)
        except Exception as e:
            print(f"Translation failed: {str(e)}")
            translated_feedback = feedback_text
            detected_language = 'unknown'
        
        # Perform sentiment analysis on translated text
        sentiment_score, sentiment_label = self.analyze_sentiment(translated_feedback)
        
        # Update the appointment with feedback and sentiment
        appointment.feedback = feedback_text
        appointment.translated_feedback = translated_feedback
        appointment.rating = rating
        appointment.sentiment_score = sentiment_score
        appointment.sentiment_label = sentiment_label
        appointment.feedback_language = detected_language

        appointment.save()
        
        serializer = ClientAppointmentSerializer(appointment)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'sentiment': {
                'score': sentiment_score,
                'label': sentiment_label
            },
            'translated_feedback': translated_feedback if detected_language != 'en' else None,
            'message': 'Feedback submitted successfully'
        })

    def translate_text(self, text):
        """Automatically detect the language and translate to English using Google Translate"""
        translator = Translator()
        try:
            detected = translator.detect(text)
            detected_lang = detected.lang

            if detected_lang == 'en':
                return text, detected_lang  # No need to translate

            translation = translator.translate(text, src=detected_lang, dest='en')
            return translation.text, detected_lang

        except Exception as e:
            print(f"Translation error: {str(e)}")
            return text, 'unknown'


    def analyze_sentiment(self, text):
        """Analyze sentiment of English text"""
        sia = SentimentIntensityAnalyzer()
        sentiment = sia.polarity_scores(text)
        score = sentiment['compound']
        
        # Determine label based on score
        if score >= 0.05:
            label = 'Positive'
        elif score <= -0.05:
            label = 'Negative'
        else:
            label = 'Neutral'
        
        return score, label
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for gender, age, occupation, civil status, and consultation topics"""
        
        # Number of males and females
        gender_stats = Client.objects.values('sex').annotate(count=Count('id')).order_by()
        
        # Age distribution
        today = date.today()
        age_groups = [
            {'name': '18-25', 'min_age': 18, 'max_age': 25},
            {'name': '26-35', 'min_age': 26, 'max_age': 35},
            {'name': '36-45', 'min_age': 36, 'max_age': 45},
            {'name': '46-55', 'min_age': 46, 'max_age': 55},
            {'name': '56+', 'min_age': 56, 'max_age': 150},
        ]
        age_stats = []
        for group in age_groups:
            min_birth_year = today.year - group['max_age']
            max_birth_year = today.year - group['min_age']
            count = Client.objects.filter(
                birthday__year__gte=min_birth_year,
                birthday__year__lte=max_birth_year
            ).count()
            age_stats.append({'name': group['name'], 'value': count})

        # Occupation distribution
        occupation_stats = Client.objects.values('occupation').annotate(count=Count('id')).exclude(occupation__isnull=True).order_by('-count')

        # Civil status distribution
        civil_status_stats = Client.objects.values('civil_status').annotate(count=Count('id')).order_by()

        # Most common consultation topics
        consultation_stats = ClientAppointment.objects.values('inquiry_type__nature').annotate(count=Count('id')).order_by('-count')[:5]

        return Response({
            'success': True,
            'data': {
                'gender': [
                    {'name': g['sex'], 'value': g['count']}
                    for g in gender_stats
                ],
                'age': age_stats,
                'occupation': [
                    {'name': o['occupation'], 'value': o['count']}
                    for o in occupation_stats
                ],
                'civil_status': [
                    {'name': c['civil_status'], 'value': c['count']}
                    for c in civil_status_stats
                ],
                'consultation_topics': [
                    {'name': c['inquiry_type__nature'], 'value': c['count']}
                    for c in consultation_stats
                ]
            },
            'message': 'Dashboard statistics retrieved successfully'
        })    