from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from core.models import CustomUser, Template
from django.contrib.auth import authenticate, login
from core.serializers import *
import logging
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import AllowAny
from pathlib import Path
from django.middleware.csrf import get_token


logger = logging.getLogger(__name__)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class LoginView(APIView):
    permission_classes = []  # Allow any, since we're handling authentication manually

    def get(self, request):
        # Return CSRF token for GET requests
        csrf_token = get_token(request)
        return Response({'csrfToken': csrf_token}, status=401)

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
                print("Session created for user session_key:", request.session.session_key)
                # request.session.save()
                response_data = UserSerializer(user).data
                
                csrf_token = get_token(request)

                response = Response({'data': response_data, 'error': None, 'sessionId': request.session.session_key}, status=status.HTTP_200_OK)
                
                # Set session cookie
                # response.set_cookie(settings.SESSION_COOKIE_NAME, request.session.session_key, max_age=3600 * 24 * 7, httponly=settings.SESSION_COOKIE_HTTPONLY, samesite='Lax', secure=settings.SESSION_COOKIE_SECURE)

                
                # Set CSRF token
                response['X-CSRFToken'] = csrf_token                
                
                response.set_cookie('user_id', str(user.id), samesite='None', secure=True, httponly=False, max_age=3600 * 24 * 7)
                response.set_cookie('username', user.username, samesite='None', secure=True, httponly=False, max_age=3600 * 24 * 7)
                response.set_cookie('plan', user.plan, samesite='None', secure=True, httponly=False, max_age=3600 * 24 * 7)

             # Set session cookie
                # response.set_cookie(settings.SESSION_COOKIE_NAME, request.session.session_key, max_age=3600 * 24 * 7, httponly=settings.SESSION_COOKIE_HTTPONLY, samesite='Lax', secure=settings.SESSION_COOKIE_SECURE)

                return response
            else:
                logger.warning(f"Failed login attempt for email: {email}")
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error in login view: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                try:
                    # Save the new user
                    user = serializer.save()

                    if user is None:
                        logger.error("User creation failed: save() returned None")
                        return Response({'error': 'Failed to create user'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                    # Prepare the response data
                    response_data = UserSerializer(user).data

                    # Fetch the user instance
                    user_instance = CustomUser.objects.get(username=user.username)
                    if not user_instance:
                        logger.error("User instance not found when creating the default templates")
                        return Response({'error': 'User instance not found'}, status=status.HTTP_404_NOT_FOUND)

                    # Create default templates
                    template1 = Template.objects.create(user=user_instance, template_name="Template 1", media="/")
                    template2 = Template.objects.create(user=user_instance, template_name="Template 2", media="/")
                    template3 = Template.objects.create(user=user_instance, template_name="Template 3", media="/")

                    user_instance.voices_id.append('JBFqnCBsd6RMkjVDRZzb')
                    user_instance.save()

                    # Authenticate and log the user in after signup to create a session
                    user = authenticate(username=user.username, password=request.data['password'])
                    if user is not None:
                        login(request, user)  # Logs in the user and creates the session (sets sessionid cookie)

                        # Get the CSRF token
                        csrf_token = get_token(request)

                        # Prepare the response
                        response = Response({'data': response_data, 'error': None}, status=status.HTTP_201_CREATED)

                        # Set CSRF token header
                        response['X-CSRFToken'] = csrf_token

                        # Set custom cookies (e.g., user_id and username)
                        response.set_cookie('user_id', str(user.id), samesite='None', secure=True, httponly=False, max_age=3600 * 24 * 7)
                        response.set_cookie('username', user.username, samesite='None', secure=True, httponly=False, max_age=3600 * 24 * 7)
                        response.set_cookie('plan', user.plan, samesite='None', secure=True, httponly=False, max_age=3600 * 24 * 7)

                        return response
                    else:
                        return Response({'error': 'Authentication failed after signup'}, status=status.HTTP_400_BAD_REQUEST)

                except Exception as e:
                    logger.error(f"Error during user creation: {str(e)}")
                    return Response({'error': 'User creation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Handle validation errors
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Unexpected error in signup view: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
