from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.conf import settings
import requests
import logging

logger = logging.getLogger(__name__)

def get_voice_models(request):
    """Fetches voice models from the Flask converter API."""
    permission_classes = [IsAuthenticated]
    try:
        if request.user.is_authenticated:
            headers = {
                'x-api-key': settings.CONVERTER_API_KEY, 
                'Content-Type': 'application/json'
            }
            
            response = requests.get(f'{settings.CONVERTER_SERVER_URL}/api/voice-models', headers=headers)
            print(response)

            result = response.json()

            print(result)
            
            if not result.get('error'):
                return JsonResponse({'data': result.get('data')}, status=200)
            else:
                return JsonResponse(result['error'], status=response.status_code)

            
        return JsonResponse({'error': {'message': 'You are not authenticated. Please login'}}, status=401)

    except Exception as e:
        logger.error(f"Get ElevenLabs voices error: {str(e)}")
        return JsonResponse({"error": {"message": "Something went wrong..."}}, status=500)