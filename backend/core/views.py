from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from .serializers import UserSerializer
import logging
from django.http import JsonResponse

logger = logging.getLogger(__name__)

@api_view(['GET'])
def index(request):
    try:
        return Response("Hello, World!", status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Unexpected error in index view: {str(e)}")
        return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    def post(self, request):
        try:
            print(request.data)
            email = request.data.get('email')
            password = request.data.get('password')
            if not email or not password:
                return JsonResponse({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                logger.warning(f"Login attempt with non-existent email: {email}")
                return JsonResponse({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = authenticate(request, username=user.username, password=password)
            if user is not None:
                login(request, user)
                response = JsonResponse({'data': UserSerializer(user).data, 'error': None}, status=status.HTTP_200_OK)
                response.set_cookie('user_id', user.id, max_age=3600 * 24 * 7)  # Cookie for 1 week
                response.set_cookie('username', user.username, max_age=3600 * 24 * 7)
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
                    if user is None:
                        logger.error("User creation failed: save() returned None")
                        return Response({'error': 'Failed to create user'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                    # Prepare the response data
                    response_data = UserSerializer(user).data

                    # Create a JsonResponse to set cookies
                    response = JsonResponse({'error': None, 'data': response_data}, status=status.HTTP_201_CREATED)

                    response.set_cookie('user_id', user.id, max_age=3600 * 24 * 7)  # Cookie for 1 week
                    response.set_cookie('username', user.username, max_age=3600 * 24 * 7)

                    return response
                except Exception as e:
                    logger.error(f"Error during user creation: {str(e)}")
                    return Response({'error': 'User creation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            logger.warning(f"Validation errors during signup: {serializer.errors}")
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error in signup view: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
