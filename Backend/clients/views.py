# backend/clients/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.db import transaction
from .serializers import ClientRegistrationSerializer, ClientSerializer
from authentication.jwe_utils import jwe_manager
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_client(request):
    """
    Login client with username/email and password
    """
    try:
        username_or_email = request.data.get('username')
        password = request.data.get('password')
        
        if not username_or_email or not password:
            return Response({
                'success': False,
                'message': 'Username/email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Try to find user by username or email
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        user = None
        
        # Check if input is email or username
        if '@' in username_or_email:
            # It's an email
            try:
                user = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                pass
        else:
            # It's a username
            try:
                user = User.objects.get(username=username_or_email)
            except User.DoesNotExist:
                pass
        
        # If user not found, return error
        if not user:
            return Response({
                'success': False,
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check password
        if not user.check_password(password):
            return Response({
                'success': False,
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user is active
        if not user.is_active:
            return Response({
                'success': False,
                'message': 'Account is disabled'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate JWE token
        token = jwe_manager.create_token(
            user_id=user.id,
            username=user.username
        )
        
        # Return success response
        client_data = ClientSerializer(user).data
        
        return Response({
            'success': True,
            'message': 'Login successful',
            'data': {
                'client': client_data,
                'token': token,
                'user_type': 'client'  
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Client login error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred during login',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_client(request):
    """
    Register a new client
    """
    try:
        with transaction.atomic():
            serializer = ClientRegistrationSerializer(data=request.data)
            
            if serializer.is_valid():
                # Create the client
                client = serializer.save()
                
                # Generate JWE token
                token = jwe_manager.create_token(
                    user_id=client.id,
                    username=client.username
                )
                
                # Return success response
                client_data = ClientSerializer(client).data
                
                return Response({
                    'success': True,
                    'message': 'Client registration successful',
                    'data': {
                        'client': client_data,
                        'token': token
                    }
                }, status=status.HTTP_201_CREATED)
            
            else:
                return Response({
                    'success': False,
                    'message': 'Registration failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
    except Exception as e:
        logger.error(f"Client registration error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred during registration',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_client_profile(request):
    """
    Get current client's profile
    """
    try:
        serializer = ClientSerializer(request.user)
        return Response({
            'success': True,
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Error fetching profile',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def logout_client(request):
    """
    Logout client (mainly for frontend to clear token)
    """
    return Response({
        'success': True,
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)
    
@api_view(['GET'])
@permission_classes([AllowAny]) 
def get_all_clients(request):
    """
    Get all clients for display in table
    """
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Get all users (assuming they are your clients)
        clients = User.objects.all().order_by('id')
        
        # Serialize the data
        serializer = ClientSerializer(clients, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': clients.count()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error fetching clients: {str(e)}")
        return Response({
            'success': False,
            'message': 'Error fetching clients',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([AllowAny]) 
def update_client(request, client_id):
    """
    Update a client's information
    """
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            client = User.objects.get(id=client_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Client not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create serializer with partial update
        serializer = ClientSerializer(client, data=request.data, partial=True)
        
        if serializer.is_valid():
            # Handle password update separately if provided
            if 'password' in request.data:
                client.set_password(request.data['password'])
                client.save()
            
            # Update other fields
            updated_client = serializer.save()
            
            return Response({
                'success': True,
                'message': 'Client updated successfully',
                'data': ClientSerializer(updated_client).data
            }, status=status.HTTP_200_OK)
        
        else:
            return Response({
                'success': False,
                'message': 'Update failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Client update error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred during update',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([AllowAny])  
def delete_client(request, client_id):
    """
    Delete a client
    """
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            client = User.objects.get(id=client_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Client not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Store client name for response
        client_name = f"{client.firstname} {client.lastname}"
        
        # Delete the client
        client.delete()
        
        return Response({
            'success': True,
            'message': f'Client {client_name} deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Client deletion error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred during deletion',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)