#---imports------------------------------------------------------------------------------------------------------------------------------------------------------------------------
import json
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import base64
import os
from django.conf import settings
#----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

#---TOKEN UTIL---------------------------------------------------------------------------------------------------------------------------------------------------------------------

class JWETokenManager:
    def __init__(self):
        self.secret_key = settings.JWE_SECRET_KEY.encode()
        self.cipher_suite = self._get_cipher_suite()
    
    def _get_cipher_suite(self):
        
        # GENERATES FERNET KEY using SECRET KEY
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'appointment_salt',  
            iterations=100000,
            backend=default_backend()
        )
        key = base64.urlsafe_b64encode(kdf.derive(self.secret_key))
        return Fernet(key)
    
    def create_token(self, user_id, username, expires_in_hours=24):
        
        # GENERATES TOKEN FOR USER
        expiry = datetime.utcnow() + timedelta(hours=expires_in_hours)
        
        payload = {
            'user_id': user_id,
            'username': username,
            'exp': expiry.timestamp(),
            'iat': datetime.utcnow().timestamp()
        }
        
        # JSON CONVERTION THEN ENCRYPTS
        json_payload = json.dumps(payload).encode()
        encrypted_token = self.cipher_suite.encrypt(json_payload)
        
        return base64.urlsafe_b64encode(encrypted_token).decode()
    
    def verify_token(self, token):
        
        # TOKEN VERIFICATION
        try:
            # DECODES BASE64
            encrypted_data = base64.urlsafe_b64decode(token.encode())
            
            # DECRYPTS IT
            decrypted_data = self.cipher_suite.decrypt(encrypted_data)
            
            # PARSES TO JSON
            payload = json.loads(decrypted_data.decode())
            
            # CHECK LIFE SPAN / EXPIRY DATETIME
            if datetime.utcnow().timestamp() > payload['exp']:
                return None
            
            return payload
        except Exception as e:

            # IN THE EVENT OF ANY ERRORS
            return None

#----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# GLOBAL INSTANCE FOR USEABILITY
jwe_manager = JWETokenManager()