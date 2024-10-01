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


logger = logging.getLogger(__name__)

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


class LoginView(APIView): 
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            
            if not email or not password:
                return JsonResponse({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:  # Fixed typo here
                logger.warning(f"Login attempt with non-existent email: {email}")
                return JsonResponse({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

            # Authenticate the user
            user = authenticate(request, username=user.username, password=password)
            
            if user is not None:
                login(request, user)  # Log the user in
                # Serialize user data for the response
                response_data = UserSerializer(user).data
                response = JsonResponse({'data': response_data, 'error': None}, status=status.HTTP_200_OK)
                
                # Set session cookies for authentication (if applicable)
                response.set_cookie('user_id', user.id, samesite='None', secure=True, max_age=3600 * 24 * 7)  # Cookie for 1 week
                response.set_cookie('username', user.username, samesite='None', secure=True, max_age=3600 * 24 * 7)
                
                
                return response
            else:
                logger.warning(f"Failed login attempt for email: {email}")
                return JsonResponse({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error in login view: {str(e)}")
            return JsonResponse({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SignupView(APIView):
    def post(self, request):
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

                    # Create a JsonResponse to set cookies
                    response = JsonResponse({'error': None, 'data': response_data}, status=status.HTTP_201_CREATED)

                    template1 = Template.objects.create(user=user_instance, template_name="Template 1", image_url="/", video_url="/")
                    template2 = Template.objects.create(user=user_instance, template_name="Template 2", image_url="/", video_url="/")
                    template3 = Template.objects.create(user=user_instance, template_name="Template 3", image_url="/", video_url="/")
                    print(template1, template2, template3)

                    return response
                except Exception as e:
                    logger.error(f"Error during user creation: {str(e)}")
                    return Response({'error': 'User creation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            logger.warning(f"Validation errors during signup: {serializer.errors}")
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error in signup view: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
