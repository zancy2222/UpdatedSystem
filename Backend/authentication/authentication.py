# backend/authentication/authentication.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from .jwe_utils import jwe_manager

User = get_user_model()

class JWEAuthentication(BaseAuthentication):
    
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        payload = jwe_manager.verify_token(token)
        
        if not payload:
            raise AuthenticationFailed('Invalid or expired token')
        
        try:
            user = User.objects.get(id=payload['user_id'])
            if not user.is_active:
                raise AuthenticationFailed('User account is disabled')
            
            return (user, token)
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')