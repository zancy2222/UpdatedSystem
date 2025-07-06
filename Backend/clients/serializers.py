#---IMPORTS------------------------------------------------------------------------------------------------------------------------------------------------------------------------
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from datetime import date
#----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

User = get_user_model()

#---CLIENT REG----------------------------------------------------------------------------------------------------------------------------------------------------------------------

class ClientRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirmPassword = serializers.CharField(write_only=True)
    age = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'password', 'confirmPassword', 'lastname', 'firstname', 
            'middlename', 'email', 'contact_number', 'province', 'city', 
            'barangay', 'street', 'civil_status', 'birthplace', 'birthday', 
            'sex', 'age', 'is_pwd', 'is_pregnant', 'occupation'
        ]

        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'province': {'required': True},
            'city': {'required': True},
            'barangay': {'required': True},
        }
    
    #--------------------------------------------------------------------------------------------
    def get_age(self, obj):
        if obj.birthday:
            today = date.today()
            return today.year - obj.birthday.year - ((today.month, today.day) < (obj.birthday.month, obj.birthday.day))
        return None
    
    #--------------------------------------------------------------------------------------------
    def validate(self, attrs):
        if attrs['password'] != attrs['confirmPassword']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    #--------------------------------------------------------------------------------------------
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    #--------------------------------------------------------------------------------------------
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    #--------------------------------------------------------------------------------------------
    def create(self, validated_data):
        # Remove confirmPassword from validated_data
        validated_data.pop('confirmPassword')
        
        # Create user
        user = User.objects.create_user(**validated_data)
        return user

#---CLIENT INFO--------------------------------------------------------------------------------------------

class ClientSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    full_address = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'lastname', 'firstname', 'middlename', 'full_name',
            'email', 'contact_number', 'province', 'city', 'barangay', 'street', 
            'full_address', 'civil_status', 'birthplace', 'date_joined', 'is_active',
            'birthday', 'sex', 'age', 'is_pwd', 'is_pregnant', 'occupation', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

#------------------------------------------------------------------------------------------------------------