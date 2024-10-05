from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from .models import CustomUser, Template
from django.contrib.auth import authenticate, login
from .serializers import UserSerializer, TemplateSerializer
import logging
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
import json
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import AllowAny, IsAuthenticated
import uuid
from b2sdk.v2 import InMemoryAccountInfo, B2Api
import mimetypes
import os
from pathlib import Path
import base64

logger = logging.getLogger(__name__)

B2_APPLICATION_KEY_ID = os.getenv('B2_APPLICATION_KEY_ID')
B2_APPLICATION_KEY = os.getenv('B2_APPLICATION_KEY')
B2_BUCKET_NAME = os.getenv('B2_BUCKET_NAME')


info = InMemoryAccountInfo()
b2_api = B2Api(info)

@api_view(['GET'])
def index(request):
    try:
        return Response("Hello, World!", status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Unexpected error in index view: {str(e)}")
        return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# def verify_user(request):
#     try:
#         if not request.user.is_authenticated:
#             return JsonResponse({ "error": { "message": "User not authenticated" } }, status=401)
#         pass
#     except CustomUser.DoesNotExist:
        # return JsonResponse({"error": { "message": "User not found." }}, status=404)
    

def get_templates(request, pk):
    permission_classes = [AllowAny]
    try:
        # Fetch the templates associated with the given user ID (pk)
        templates = Template.objects.filter(user=pk)
        
        if templates.exists():  # Check if any templates were found
            serializer = TemplateSerializer(templates, many=True)  # Serialize the queryset
            return JsonResponse({"data": serializer.data}, status=status.HTTP_200_OK)  # Return serialized data
        
        # If no templates found, return an error response
        return JsonResponse({"error": {"message": "No templates found"}}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.error(f"Get templates error: {str(e)}")
        return JsonResponse({"error": {"message": "Something went wrong..."}}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class UploadTemplatesView(APIView):
    def post(self, request):
        try:
            permission_classes = [IsAuthenticated]
            csrf_token = request.META.get('HTTP_X_CSRFTOKEN')
            logger.info(f"Received CSRF token: {csrf_token}")
            data = request.data

            template_id = data.get('id', uuid.uuid4())  
            user_id = data.get('userId')  
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

            does_template_name_exist = Template.objects.filter(template_name=template_name).first()
            if does_template_name_exist:
                return JsonResponse({'error': 'Whoops a template with this name already exists.'}, status=200)                
            else:
                if not data.get('media'):
                    template = Template.objects.create(
                        id=template_id,
                        user_id=user_id,
                        template_name=template_name,
                        font_family=font_family,
                        text_animation=text_animation,
                        font_size=font_size,
                        line_height=line_height,
                        text_color=text_color,
                        background_color=background_color,
                        text_outline_color=text_outline_color,
                        top_margin=top_margin,
                        left_margin=left_margin,
                        right_margin=right_margin
                    )
                    return JsonResponse({'message': 'Template created successfully!', 'template_id': str(template.id)}, status=status.HTTP_201_CREATED)
                else:
                    try:
                        # media = request.FILES.get('media')
                        media = data.get('media')
                        # print(media2)

                        # Authorize Backblaze B2 account
                        b2_api.authorize_account('production', B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY)
                        print("Successfully authorized Backblaze B2 account!")

                        bucket = b2_api.get_bucket_by_name(B2_BUCKET_NAME)

                    except Exception as e:
                        print("Error:", e)
                        logger.error(f"Error in getting storage bucket: {str(e)}")
                        return JsonResponse({"error": {"message": "Whoops, could not connect to storage bucket"}}, status=500)

                    try:
                        def upload_media(type: str, user_id: str, template_id: str, file: any):
                            if not file:
                                return JsonResponse({'error': {'message': 'No file provided'}}, status=400)
                            randomUUID = uuid.uuid4()
                            file_path = f'{type}s/{user_id}/{template_id}/{randomUUID}'

                            if type not in ['image', 'video']:
                                return JsonResponse({'error': {'message': 'Invalid type'}}, status=400)

                            try:
                                mime_type, base64_data = file.split(';base64,')
                                mime_type = mime_type.split(':')[1]
                                file_bytes = base64.b64decode(base64_data)
                                
                                # Determine file extension
                                file_extension = mimetypes.guess_extension(mime_type)
                                if file_extension:
                                    file_path += file_extension
                                
                                # Upload the file to Backblaze with the correct content type
                                uploaded_file = bucket.upload_bytes(
                                    file_bytes, 
                                    file_path,
                                    content_type=mime_type
                                )

                                print(uploaded_file)

                                # Get the file URL
                                file_url = b2_api.get_download_url_for_fileId(uploaded_file.id_)
                                print('file_url', file_url)
                                return file_url
                            except Exception as e:
                                print(e)
                                return JsonResponse({'error': {'message': "Something went wrong while uploading file"}}, status=500)

                        file_type, _ = mimetypes.guess_type(media)
                        print(file_type)
                        if file_type is None:
                            return JsonResponse({"error": {"message": "Unsupported file type"}}, status=400)

                        if file_type.startswith('video/'):
                            video_url = upload_media('video', user_id, template_id, media)
                            if isinstance(video_url, JsonResponse):
                                return video_url  # This is an error response
                            print('video_url', video_url)
                        elif file_type.startswith('image/'):
                            image_url = upload_media('image', user_id, template_id, media)
                            if isinstance(image_url, JsonResponse):
                                return image_url  # This is an error response
                            print("image", image_url)
                        else:
                            return JsonResponse({"error": {"message": "Unsupported file type"}}, status=400)

                    except Exception as e:
                        print("Error 2:", e)
                        logger.error(f"Error in checking upload files: {str(e)}")
                        return JsonResponse({"error": {"message": "Whoops, something went wrong while confirming file"}}, status=500)

        except Exception as e:
            print(e)
            logger.error(f"Get templates error: {str(e)}")
            return JsonResponse({"error": {"message": "Something went wrong..."}}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class LoginView(APIView):
    permission_classes = []  # Allow any, since we're handling authentication manually

    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            if not email or not password:
                return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                logger.warning(f"Login attempt with non-existent email: {email}")
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = authenticate(request, username=user.username, password=password)
            if user is not None:
                login(request, user)
                response_data = UserSerializer(user).data
                
                csrf_token = get_token(request)

                response = Response({'data': response_data, 'error': None, 'csrfToken': csrf_token}, status=status.HTTP_200_OK)
                
                # Set CSRF token
                response['X-CSRFToken'] = csrf_token
                print(csrf_token, response['X-CSRFToken'])
                
                # Set session cookies
                # response.set_cookie('user_id', str(user.id), samesite='Lax', secure=True, httponly=False, max_age=3600 * 24 * 7)
                response.set_cookie('username', user.username, samesite='Lax', secure=True, httponly=False, max_age=3600 * 24 * 7)
                
                # Log the CSRF token for debugging (remove in production)
                logger.info(f"CSRF token set: {csrf_token}")
                
                return response
            else:
                logger.warning(f"Failed login attempt for email: {email}")
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error in login view: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SignupView(APIView):
    def post(self, request):
        permission_classes = [AllowAny]
        try:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                try:
                    user = serializer.save()
                    print(user)
                    if user is None:
                        logger.error("User creation failed: save() returned None")
                        return Response({'error': 'Failed to create user'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                    # Prepare the response data
                    response_data = UserSerializer(user).data

                    user_instance = CustomUser.objects.get(username=user)
                    if not user_instance:
                        logger.log("User instance was null when creating the default templates", user_instance)
                    
                    print(user_instance)

                    template1 = Template.objects.create(user=user_instance, template_name="Template 1", image_url="/", video_url="/")
                    template2 = Template.objects.create(user=user_instance, template_name="Template 2", image_url="/", video_url="/")
                    template3 = Template.objects.create(user=user_instance, template_name="Template 3", image_url="/", video_url="/")

                    csrf_token = get_token(request)

                    response = Response({'data': response_data, 'error': None, 'csrfToken': csrf_token}, status=status.HTTP_201_CREATED)
                    
                    # Set CSRF token
                    response['X-CSRFToken'] = csrf_token
                    print(csrf_token, response['X-CSRFToken'])
                    
                    # Set session cookies
                    # response.set_cookie('user_id', str(user.id), samesite='Lax', secure=True, httponly=False, max_age=3600 * 24 * 7)
                    response.set_cookie('username', user.username, samesite='Lax', secure=True, httponly=False, max_age=3600 * 24 * 7)

                    return response
                except Exception as e:
                    logger.error(f"Error during user creation: {str(e)}")
                    return Response({'error': 'User creation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            logger.warning(f"Validation errors during signup: {serializer.errors}")
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error in signup view: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
