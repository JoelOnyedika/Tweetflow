import logging
from django.http import JsonResponse
import os
from django.middleware.csrf import get_token


def csrf_token_view(request):
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token})

