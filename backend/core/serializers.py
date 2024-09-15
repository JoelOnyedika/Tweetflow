from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from .models import CustomUser  # Import your custom user model
import logging
from django.db import transaction

logger = logging.getLogger(__name__)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser  # Use your custom user model here
        fields = ['id', 'username', 'email', 'password']  # Remove 'plan' from fields
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        try:
            validate_email(value)
        except ValidationError:
            logger.warning(f"Invalid email format: {value}")
            raise serializers.ValidationError("Invalid email format.")
        if CustomUser.objects.filter(email=value).exists():
            logger.warning(f"Signup attempt with existing email: {value}")
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            logger.warning(f"Signup attempt with existing username: {value}")
            raise serializers.ValidationError("Username already exists.")
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        try:
            user = CustomUser.objects.create_user(**validated_data)
            return user
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            raise serializers.ValidationError("Failed to create user.")
