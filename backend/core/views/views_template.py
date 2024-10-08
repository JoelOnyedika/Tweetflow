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


logger = logging.getLogger(__name__)

B2_APPLICATION_KEY_ID = os.getenv('B2_APPLICATION_KEY_ID')
B2_APPLICATION_KEY = os.getenv('B2_APPLICATION_KEY')
B2_BUCKET_NAME = os.getenv('B2_BUCKET_NAME')


info = InMemoryAccountInfo()
b2_api = B2Api(info)


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


@method_decorator(ensure_csrf_cookie, name='dispatch')
class UploadTemplatesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            csrf_token = request.META.get('HTTP_X_CSRFTOKEN')
            # logger.info(f"Received CSRF token: {csrf_token}")

            data = request.data
            print(data)
            template_id = data.get('id', uuid.uuid4()) 
            user_id = data.get('userId')  
            text = data.get('text')
            template_name = data.get('templateName')
            font_family = data.get('fontFamily', 'Arial')  
            text_animation = data.get('textAnimation', 'None')
            font_size = data.get('fontSize', 30)
            line_height = data.get('lineHeight', 1.5)
            text_color = data.get('textColor', '#ff0000')
            background_color = data.get('backgroundColor', '#708090')
            text_outline_color = data.get('textOutline', '#ffffff')
            top_margin = data.get('marginTop', 10)
            left_margin = data.get('marginLeft', 20)
            right_margin = data.get('marginRight', 30)
            media = data.get('media')

            def upload_media(type: str, user_id: str, template_id: str, file: any):
                if not file:
                    return JsonResponse({'error': {'message': 'No file provided'}}, status=400)

                randomUUID = uuid.uuid4()
                file_path = f'{type}s/{user_id}/{template_id}/{randomUUID}'

                if type not in ['image', 'video']:
                    return JsonResponse({'error': {'message': 'Invalid media type'}}, status=400)

                try:
                    mime_type, base64_data = file.split(';base64,')
                    mime_type = mime_type.split(':')[1]
                    file_bytes = base64.b64decode(base64_data)

                    file_extension = mimetypes.guess_extension(mime_type)
                    if file_extension:
                        file_path += file_extension

                    # Upload file to Backblaze
                    uploaded_file = bucket.upload_bytes(
                        file_bytes, 
                        file_path,
                        content_type=mime_type
                    )
                    return uploaded_file.id_
                except Exception as e:
                    logger.error(f"Media upload error: {str(e)}")
                    return JsonResponse({'error': {'message': 'Failed to upload media'}}, status=500)

            def handle_backblaze_connection():
                try:
                    # Authorize Backblaze B2 account
                    b2_api.authorize_account('production', B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY)
                    bucket = b2_api.get_bucket_by_name(B2_BUCKET_NAME)
                    print("Successfully authorized Backblaze B2 account")
                    return bucket
                except Exception as e:
                    logger.error(f"Backblaze connection error: {str(e)}")
                    return JsonResponse({"error": {"message": "Could not connect to Backblaze B2"}}, status=500)

            bucket = None
            if media:
                bucket = handle_backblaze_connection()
                if isinstance(bucket, JsonResponse):
                    return bucket  # Return error response if connection failed

            def handle_upload():
                if media:
                    file_type, _ = mimetypes.guess_type(media)
                    if not file_type:
                        return JsonResponse({"error": {"message": "Unsupported file type"}}, status=400)

                    if file_type.startswith('video/'):
                        video_url = upload_media('video', user_id, template_id, media)
                        if isinstance(video_url, JsonResponse):
                            return video_url
                        media_url = video_url
                    elif file_type.startswith('image/'):
                        image_url = upload_media('image', user_id, template_id, media)
                        if isinstance(image_url, JsonResponse):
                            return image_url
                        media_url = image_url
                    else:
                        return JsonResponse({"error": {"message": "Unsupported file type"}}, status=400)
                else:
                    media_url = None

                template, created = Template.objects.update_or_create(
                    id=template_id,
                    defaults={
                        'text': text,
                        'user_id': user_id,
                        'media': media_url,
                        'template_name': template_name,
                        'font_family': font_family,
                        'text_animation': text_animation,
                        'font_size': font_size,
                        'line_height': line_height,
                        'text_color': text_color,
                        'background_color': background_color,
                        'text_outline_color': text_outline_color,
                        'top_margin': top_margin,
                        'left_margin': left_margin,
                        'right_margin': right_margin,
                    }
                )
                if created:
                    return JsonResponse({'message': 'Template created successfully!', 'template_id': str(template.id)}, status=status.HTTP_201_CREATED)
                else:
                    return JsonResponse({'message': 'Template updated successfully!', 'template_id': str(template.id)}, status=status.HTTP_200_OK)

            does_template_name_exist = Template.objects.filter(template_name=template_name).exists()
            does_template_id_exist = Template.objects.filter(id=template_id).exists()

            if does_template_name_exist and does_template_id_exist:
                return handle_upload()
            elif does_template_name_exist:
                return JsonResponse({'error': {'message':'A template with this name already exists.'}}, status=400)
            else:
                return handle_upload()

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return JsonResponse({"error": {"message": "Something went wrong"}}, status=500)


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
    
