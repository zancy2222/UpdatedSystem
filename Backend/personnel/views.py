# personnel/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from .models import Personnel
from .serializers import PersonnelSerializer


class PersonnelViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Personnel.objects.all()
    serializer_class = PersonnelSerializer

    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    @action(detail=False, methods=['post'], url_path='login')
    def personnel_login(self, request):
        """
        Login endpoint for personnel authentication
        """
        try:
            username = request.data.get('username')
            password = request.data.get('password')

            if not username or not password:
                return Response({
                    'success': False,
                    'message': 'Username and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Try to find personnel by username or email
            personnel = None
            try:
                # First try by username
                personnel = Personnel.objects.get(username=username)
            except Personnel.DoesNotExist:
                try:
                    # Then try by email
                    personnel = Personnel.objects.get(email=username)
                except Personnel.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'Invalid credentials'
                    }, status=status.HTTP_401_UNAUTHORIZED)

            # Check password
            if personnel.check_password(password):
                # Generate a simple token (in production, use proper JWT or session)
                token = f"personnel_{personnel.id}_{personnel.username}"
                
                return Response({
                    'success': True,
                    'message': 'Login successful',
                    'data': {
                        'token': token,
                        'user_type': 'personnel',
                        'personnel': {
                            'id': personnel.id,
                            'username': personnel.username,
                            'email': personnel.email,
                            'first_name': personnel.firstname,
                            'last_name': personnel.lastname,
                            'position': personnel.position,
                            'full_name': f"{personnel.firstname} {personnel.lastname}"
                        }
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Login error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)