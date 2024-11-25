from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from core.models import CustomUser, Template, VoiceTier, Video, ScheduledVideo, UserSettings
import logging
from django.db import transaction

logger = logging.getLogger(__name__)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser 
        fields = ['id', 'username', 'email', 'password'] 
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


class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = '__all__'


class TemplateByIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = '__all__'

class CreditsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['credits']

class VoiceTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceTier
        fields = '__all__'

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = '__all__'

class ScheduledVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledVideo
        fields = '__all__'

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = '__all__'