from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.conf import settings
import requests
import logging
from core.models import CustomUser, VoiceTier
from django.conf import settings 
from django.views import View
import uuid
from core.serializers import VoiceTierSerializer


logger = logging.getLogger(__name__)

url = f'https://api.elevenlabs.io'


# BASICALLY THIS CODE WAS USED TO PUSH THE DEFAULT VOICE TIER TO THE DB

basic = [
  { 'name': 'Aria', 'id': '9BWtsMINqrJLrRacOk9x' },
  { 'name': 'Sarah', 'id': 'EXAVITQu4vr4xnSDxMaL' },
  { 'name': 'Charlie', 'id': 'IKne3meq5aSn9XLyUdCD' },
  { 'name': 'Alice', 'id': 'Xb7hH8MSUJpSbSDYk0k2' },
  { 'name': 'Eric', 'id': 'cjVigY5qzO86Huf0OWal' }
];

moderate = [
  { 'name': 'Roger', 'id': 'CwhRBWXzGAHq8TQ4Fs17' },
  { 'name': 'Laura', 'id': 'FGY2WhTYpPnrIDTdsKH5' },
  { 'name': 'Callum', 'id': 'N2lVS1w4EtoT3dr4eOWO' },
  { 'name': 'Liam', 'id': 'TX3LPaxmHKxFdv7VOQHJ' },
  { 'name': 'Charlotte', 'id': 'XB0fDUnXU5powFXDhCwa' },
  { 'name': 'Chris', 'id': 'iP95p4xoKVk53GoZ742B' },
  { 'name': 'Daniel', 'id': 'onwK4e9ZLuTAKqWW03F9' },
  { 'name': 'Bill', 'id': 'pqHfZKP75CvOlQylNhV4' }
];

standard = [
  { 'name': 'River', 'id': 'SAz9YHcvj6GT2YYXdXww' },
  { 'name': 'Matilda', 'id': 'XrExE9yKIg1WjnnlVkGX' },
  { 'name': 'Will', 'id': 'bIHbv24MWmeRgasZH58o' },
  { 'name': 'Jessica', 'id': 'cgSgspJ2msm6clMCkdW9' },
  { 'name': 'Brian', 'id': 'nPczCjzI2devNBz1zQrb' }
];

def determine_plan(voice_id):
    if any(voice['id'] == voice_id for voice in basic):
        return ['Basic', 4.99]
    elif any(voice['id'] == voice_id for voice in moderate):
        return ['Moderate', 3.99]
    elif any(voice['id'] == voice_id for voice in standard):
        return ['Standard', 2.99]
    return None

def get_voice_models(request):
    """Fetches voice models from the Flask converter API."""
    permission_classes = [IsAuthenticated]
    try:
        if request.user.is_authenticated:
            headers = {
                'Content-Type': 'application/json'
            }

            # Use the correct syntax for credentials, if needed.
            response = requests.get(
                f'{settings.CONVERTER_SERVER_URL}/api/voice-models', 
                headers=headers
            )
            
            result = response.json()

            if not result.get('error'):
                try:
                    voices = VoiceTier.objects.all()
                    print('voiceslistorobj', voices)
                    if len(voices) == 0:
                        for voice in result.get('data', []):
                            voice_id = voice.get('voice_id')
                            print(voice_id)
                            plan = determine_plan(voice_id)
                            
                            if plan == None:
                                continue

                            if plan:
                                # Create a new VoiceTier object
                                data = VoiceTier.objects.create(
                                    id=uuid.uuid4(),
                                    name=voice.get('name'),
                                    plan=plan[0],
                                    price=plan[1],
                                    preview_url=voice.get('preview_url'),
                                    voice_id=voice_id,
                                    image_url=voice.get('image_url')
                                )
                            else:
                                print('false for voiceid')
                                continue
                        voices = VoiceTier.objects.all()
                        serializer = VoiceTierSerializer(voices, many=True).data
                        return JsonResponse({ 'data': serializer }, status=200)
                    else:
                        serializer = VoiceTierSerializer(voices, many=True).data
                        return JsonResponse({ 'data': serializer }, status=200)
                except Exception as e:
                    logger.error(f"Get VoiceTier error: {str(e)}")
                    return JsonResponse({ 'error': "Error while getting voice models. Please refresh." })
            else:
                return JsonResponse(result['error'], status=response.status_code)

        return JsonResponse({'error': {'message': 'You are not authenticated. Please login'}}, status=401)

    except Exception as e:
        logger.error(f"Get ElevenLabs voices error: {str(e)}")
        return JsonResponse({"error": {"message": "Something went wrong..."}}, status=500)


# def get_voice_models(request):
#     permission_classes = [IsAuthenticated]
#     try:
#         if request.user.is_authenticated:
#             voices = VoiceTier.objects.all()

#             serializer = VoiceTierSerializer(voices, many=True).data
#             if serializer is None:
#                 return JsonResponse({ 'error': {'message': "Could not find the voices in the voice store"} }, status=404)
#             else:
#                 return JsonResponse({ 'data': serializer }, status=200)

#         return JsonResponse({'error': {'message': 'You are not authenticated. Please login'}}, status=401)

#     except Exception as e:
#         logger.error(f"Get VoiceTier voices error: {str(e)}")
#         return JsonResponse({"error": {"message": "Something went wrong..."}}, status=500)



def get_voice_models_by_id(request, pk):
    permission_classes = [IsAuthenticated]    
    try:
        if request.user.is_authenticated:
            user = CustomUser.objects.get(id=pk)        
            voice_ids = user.voices_id  
            print(voice_ids)
            voice_data_list = []            
            api_key = settings.ELEVENLABS_API_KEY
            base_url = 'https://api.elevenlabs.io/v1/voices/'
            headers = {
                'Accept': 'application/json',
                'xi-api-key': api_key,
            }            
            for voice_id in voice_ids:
                url = f'{base_url}{voice_id}'
                try:
                    response = requests.get(url, headers=headers)
                    response.raise_for_status()  
                    voice_data = response.json()
                    voice_data_list.append(voice_data)                
                except requests.RequestException as e:
                    print(f"Error fetching voice ID {voice_id}: {e}")
                    return JsonResponse({'error': {'message': "Error fetching your voice models."}}, status=500)

            return JsonResponse({'data': voice_data_list}, status=200)        
        return JsonResponse({'error': {'message': 'You are not authenticated.'}}, status=401)

    except CustomUser.DoesNotExist:
        return JsonResponse({'error': {'message': 'User not found.'}}, status=404)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        logger.error(f"Get ElevenLabs id voices error: {str(e)}")
        return JsonResponse({'error': {'message': 'An unexpected error occurred.'}}, status=500)

