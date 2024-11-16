import logging
import json
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import IsAuthenticated
from core.models import UserSettings
from core.serializers import UserSettingsSerializer


logger = logging.getLogger(__name__)


@ensure_csrf_cookie
def save_settings(request):
    try:
        data = json.loads(request.body)
        print(request.user)

        try:
            user_settings = UserSettings.objects.get(user_id=request.user)

            user_settings.platform = data["platform"]
            user_settings.interval = data["interval"]
            user_settings.save()

            return JsonResponse(
                {
                    "data": {
                        "platform": user_settings.platform,
                        "interval": user_settings.interval,
                    }
                }
            )

        except UserSettings.DoesNotExist:
            return JsonResponse(
                {"error": {"message": "Whoops looks like this user does not exist."}}
            )

    except Exception as e:
        logger.error(
            "Error while handling save settings in user settings view", exc_info=e
        )  # Better logging
        return JsonResponse(
            {"error": {"message": "Something went wrong while saving settings."}}
        )


@ensure_csrf_cookie
def get_settings(request):
    try:
        user_settings = UserSettings.objects.filter(user=request.user)
        serializer = UserSettingsSerializer(user_settings, many=True).data
        if serializer is None:
            return JsonResponse(
                {"error": {"message": "Whoops looks like this settings does not exist"}}
            )
        else:
            return JsonResponse({"data": serializer})
    except Exception as e:
        logger.log("Error while handling get settings in user settings view", e)
        return JsonResponse(
            {"error": {"message": "Something went wrong while getting settings."}}
        )
