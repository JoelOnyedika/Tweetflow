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
