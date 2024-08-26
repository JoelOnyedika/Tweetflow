from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from .models import Template, Video, Voice, ScheduledVideo
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login as auth_login
from django.views import View
import os
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from moviepy.editor import *

def index(request):
    return HttpResponse("Hello, World ".encode())

@csrf_exempt
def login(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        if not email or not password:
            return JsonResponse({'error': 'Username or password is missing'}, status=400)
        try:
            user = User.objects.get(email=email)
            user = authenticate(request, username = user.username, password=password)
            if user is not None:
                auth_login(request, user)
                return JsonResponse({'data': user, 'error': None}),
            
        except Exception as e:
            return JsonResponse({'error': str(e), 'data': None}, status=400)

@csrf_exempt
def signup(request):
    try:
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        if not username or not email or not password:
            return JsonResponse({'error': 'Please provide all the required fields.', 'data': None}, status=400)
        try:
            validate_email(email)
        except ValidationError:
            return JsonResponse({'error': 'Invalid email format.', 'data': None}, status=400)
        if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists.', 'data': None}, status=400)
        if  User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists.', 'data': None}, status=400)
        user = User.objects.create_user(username=username, email=email, password=make_password(password))
        return JsonResponse({'error': None, 'data': user}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e), 'data': None}, status=500)

class CreateVideo(View):
    def handle_create_video(self, request):
        tweet_text = request.data.get('tweetText')
    template_settings = request.data.get('templateSettings')
    
        
    def post(self, request):
        if request.method == 'POST':
            tweet_text = request.POST.get('tweetText')
            template = request.POST.get('template')
            if not tweet_text or not template:
                return JsonResponse({'error': 'Please provide all the required fields.', 'data': None}, status=400)
            try:
                handle_create_video()
                template_name = Template.objects.get(id=template)
                if not template_name:
                    return JsonResponse({'error': 'Template not found.', 'data': None}, status=400)
                handle_video_processing(tweet_text, template_name)
                video = Video.objects.create(title=tweet_text[0:20], tweet_text=tweet_text, template=template, video_url=None)
                return JsonResponse({'error': None, 'data': video}, status=201)
            except Exception as e:
                return JsonResponse({'error': str(e), 'data': None}, status=500)
            