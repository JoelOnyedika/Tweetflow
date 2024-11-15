import logging
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import IsAuthenticated
from core.models import UserSettings
from core.serializers import UserSettingsSerializer


logger = logging.getLogger(__name__)

@ensure_csrf_cookie
def save_settings(request, pk):
    try:
        data = request.body

        user_settings = UserSettings.objects.get(user=pk)
        if user_settings.DoesNotExist:
            return JsonResponse({'error': {'message': "Whoops looks like this user does not exist."}})
        else:
            user_settings.objects.update(platform=data.platform, interval=data.interval)
            user_settings.save()
            return JsonResponse({'data': user_settings})
    except Exception as e:
        logger.log("Error while handling save settings in user settings view", e)
        return JsonResponse({'error': {'message': 'Something went wrong while saving settings.'}})


@ensure_csrf_cookie
def get_settings(request, pk):
    try:
        user_settings = UserSettings.objects.filter(user=pk)
        serializer = UserSettingsSerializer(user_settings, many=True).data
        if serializer is None:
            return JsonResponse({'error': {'message': 'Whoops looks like this settings does not exist'}})
        else: 
            return JsonResponse({'data': serializer})
    except Exception as e:
        logger.log("Error while handling get settings in user settings view", e)
        return JsonResponse({'error': {'message': 'Something went wrong while getting settings.'}})