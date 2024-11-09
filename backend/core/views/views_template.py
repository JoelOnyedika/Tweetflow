from rest_framework.views import APIView
from core.models import Template
from core.serializers import *
import logging
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import IsAuthenticated
import uuid
from b2sdk.v2 import InMemoryAccountInfo, B2Api
import mimetypes
import os
import base64
from rest_framework import status
from functools import lru_cache


logger = logging.getLogger(__name__)

B2_APPLICATION_KEY_ID = os.getenv('B2_APPLICATION_KEY_ID')
B2_APPLICATION_KEY = os.getenv('B2_APPLICATION_KEY')
B2_BUCKET_NAME = os.getenv('B2_BUCKET_NAME')


info = InMemoryAccountInfo()
b2_api = B2Api(info)

@lru_cache(maxsize=1)
def get_b2_api():
    """Create and return a cached B2Api instance"""
    info = InMemoryAccountInfo()
    return B2Api(info)


def get_templates(request, pk):
    permission_classes = [IsAuthenticated]
    print(request.user.is_authenticated)
    try:
        if request.user.is_authenticated and request.user.id == pk:
            # Fetch the templates associated with the given user ID (pk)
            templates = Template.objects.filter(user=pk)
            
            serializer = TemplateSerializer(templates, many=True).data  # Serialize the queryset
            if serializer is None:
                return JsonResponse({"error": {"message": "No templates found"}}, status=status.HTTP_404_NOT_FOUND)
            return JsonResponse({"data": serializer}, status=status.HTTP_200_OK)  # Return serialized data

            
    
    except Exception as e:
        logger.error(f"Get templates error: {str(e)}")
        return JsonResponse({"error": {"message": "Something went wrong..."}}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_templates_by_id(request, pk):
    permission_classes = [IsAuthenticated]
    try:
        if request.user.is_authenticated:
            # Fetch the templates associated with the given user ID (pk)
            templates = Template.objects.filter(id=pk)
            
            serializer = TemplateByIdSerializer(templates, many=True).data  # Serialize the queryset
            print(serializer)
            if serializer is None:
                return JsonResponse({"error": {"message": "This template does not exist"}}, status=status.HTTP_404_NOT_FOUND)
            return JsonResponse({"data": serializer}, status=status.HTTP_200_OK)  # Return serialized data

            
        return JsonResponse({ 'error': {'message': 'You are not authenticated please login'}}, status=401)
    
    except Exception as e:
        logger.error(f"Get templates error: {str(e)}")
        return JsonResponse({"error": {"message": "Something went wrong..."}}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
import uuid
import json
import logging
from django.http import JsonResponse
from rest_framework import status

logger = logging.getLogger(__name__)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class UploadTemplatesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Get the settings JSON from form data
            settings_json = request.POST.get('settings')
            if not settings_json:
                return JsonResponse({'error': {'message': 'No template settings provided'}}, status=400)

            # Parse the settings
            settings = json.loads(settings_json)
            
            template_id = settings.get('id', str(uuid.uuid4()))
            user_id = settings.get('userId')
            template_name = settings.get('templateName')

            # Handle file upload if present
            media_url = None
            if 'media' in request.FILES:
                media_file = request.FILES['media']
                
                # Validate file type
                file_type = media_file.content_type.split('/')[0]
                if file_type not in ['image', 'video']:
                    return JsonResponse({
                        'error': {'message': 'Invalid file type. Only images and videos are allowed.'}
                    }, status=400)

                # Initialize B2 connection
                bucket = self.handle_backblaze_connection()
                if isinstance(bucket, JsonResponse):
                    return bucket

                # Clear existing files
                self.clear_folder(bucket, f'templates/{user_id}/{template_id}/')

                try:
                    # Generate unique filename
                    file_extension = media_file.name.split('.')[-1]
                    random_uuid = str(uuid.uuid4())
                    file_path = f'templates/{user_id}/{template_id}/{random_uuid}.{file_extension}'

                    # Upload file to B2
                    uploaded_file = bucket.upload_bytes(
                        media_file.read(),
                        file_path,
                        content_type=media_file.content_type
                    )

                    media_url = f'https://f005.backblazeb2.com/file/{B2_BUCKET_NAME}/{file_path}'

                except Exception as e:
                    logger.error(f"Media upload error: {str(e)}")
                    return JsonResponse({
                        'error': {'message': 'Failed to upload media file'}
                    }, status=500)

            # Check if template name exists (except for updates)
            if Template.objects.filter(template_name=template_name).exclude(id=template_id).exists():
                return JsonResponse({
                    'error': {'message': 'A template with this name already exists.'}
                }, status=400)

            # Prepare template data
            template_data = {
                'text': settings.get('text', ''),
                'user_id': user_id,
                'template_name': template_name,
                'font_family': settings.get('fontFamily', 'Arial'),
                'text_animation': settings.get('textAnimation', 'None'),
                'font_size': settings.get('fontSize', 30),
                'line_height': settings.get('lineHeight', 1.5),
                'text_color': settings.get('textColor', '#000000'),
                'background_color': settings.get('backgroundColor', '#ffffff'),
                'text_outline_color': settings.get('textOutlineColor', '#ffffff'),
                'top_margin': settings.get('marginTop', 10),
                'left_margin': settings.get('marginLeft', 20),
                'right_margin': settings.get('marginRight', 30),
            }

            if media_url:
                template_data['media'] = media_url

            # Create or update template
            template, created = Template.objects.update_or_create(
                id=template_id,
                defaults=template_data
            )

            return JsonResponse({
                'message': 'Template saved successfully!',
                'template_id': str(template.id),
                'created': created
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        except json.JSONDecodeError:
            return JsonResponse({
                'error': {'message': 'Invalid JSON in settings'}
            }, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in template upload: {str(e)}")
            return JsonResponse({
                "error": {"message": "Something went wrong while processing the template"}
            }, status=500)

    def handle_backblaze_connection(self):
        """Initialize connection to Backblaze B2"""
        try:
            b2_api = get_b2_api()
            b2_api.authorize_account('production', B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY)
            bucket = b2_api.get_bucket_by_name(B2_BUCKET_NAME)
            return bucket
        except Exception as e:
            logger.error(f"Backblaze connection error: {str(e)}")
            return JsonResponse({
                "error": {
                    "message": "Could not connect to storage service",
                    "details": str(e)
                }
            }, status=500)

    def clear_folder(self, bucket, folder_path):
        """Clear existing files in the specified folder"""
        try:
            file_versions = bucket.ls(folder_path)
            for file_info, _ in file_versions:
                bucket.delete_file_version(file_info.id_, file_info.file_name)
            return True
        except Exception as e:
            logger.error(f"Error clearing folder: {str(e)}")
            return False

def delete_template(request, pk):
    permission_classes = [IsAuthenticated]
    try:
        if request.user.is_authenticated:
            template = Template.objects.get(id=pk)
            template.delete()
            return JsonResponse({ 'data': True }, status=status.HTTP_200_OK)
        else:
            return JsonResponse({ 'error': {'message': 'You are not authenticated please login'}}, status=401)
    except Exception as e:
        logger.error(f"Delete templates error: {str(e)}")
        return JsonResponse({"error": {"message": "Something went wrong..."}}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
