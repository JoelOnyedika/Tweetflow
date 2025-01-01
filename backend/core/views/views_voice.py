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

def get_models():
    try:
        api_key = settings.ELEVENLABS_API_KEY
        print(api_key)
        logger.error(api_key)
        url = "https://api.elevenlabs.io/v1/voices"

        headers = {
            "Content-Type": "application/json",
            'xi-api-key': api_key,
        }
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        voices = data.get('voices', [])
        
        voice_data = [
            {
                'voice_id': voice['voice_id'],
                'name': voice['name'],
                'category': voice.get('category', 'N/A'),
                'description': voice.get('description', 'N/A'),
                'preview_url': voice.get('preview_url', 'N/A')
            }
            for voice in voices
        ]
        
        print(f"Number of voices: {len(voice_data)}")
        print(voice_data)
        return {'data': voice_data, 'error': None}
    except requests.RequestException as e:
        print(f"An error occurred while fetching data: {e}")
        return {'error': {'message': "Something went wrong while getting voices"}, 'data': None}
    except KeyError as e:
        print(f"Unexpected data structure: {e}")
        return {'error': {'message': "Unexpected data structure in API response"}, 'data': None}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {'error': {'message': "An unexpected error occurred"}, 'data': None}
            


def get_voice_models(request):
    permission_classes = [IsAuthenticated]
    try:
        if request.user.is_authenticated:
            result = get_models()

            print('result', result['error'])
            logger.error(result)

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



def get_voice_models_by_id(request, pk):
    permission_classes = [IsAuthenticated]
    try:
        if request.user.is_authenticated:
            user = CustomUser.objects.get(id=pk)
            voice_ids = user.voices_id

            print(f"Voice IDs for user {pk}: {voice_ids}")
            voice_data_list = []

            api_key = settings.ELEVENLABS_API_KEY
            logger.error(api_key)
            base_url = 'https://api.elevenlabs.io/v1/voices/'
            headers = {
                'Content-Type': 'application/json',
                'xi-api-key': settings.ELEVENLABS_API_KEY,
            }

            for voice_id in voice_ids:
                url = f'{base_url}{voice_id}'
                try:
                    response = requests.get(url, headers=headers)
                    print(f"Fetching voice ID {voice_id}: {response.status_code}")

                    print(response.text)
                    logger.error(response.text)


                    if response.status_code == 401:
                        logger.error("Unauthorized: Invalid API key or permissions.")
                        return JsonResponse({'error': {'message': 'Unauthorized access. Please check your API key.'}}, status=401)
                    
                    response.raise_for_status()  # Raises HTTPError for 4xx/5xx errors
                    voice_data = response.json()
                    voice_data_list.append(voice_data)

                except requests.HTTPError as http_err:
                    logger.error(f"HTTP error for voice ID {voice_id}: {http_err}")
                    return JsonResponse({'error': {'message': f"Error fetching voice ID {voice_id}. HTTP Error: {http_err}"}}, status=response.status_code)
                except requests.RequestException as req_err:
                    logger.error(f"Request error for voice ID {voice_id}: {req_err}")
                    return JsonResponse({'error': {'message': "Error fetching your voice models."}}, status=500)
                except Exception as e:
                    logger.error(f"Unexpected error for voice ID {voice_id}: {e}")
                    return JsonResponse({'error': {'message': "Error fetching your voice models."}}, status=500)

            return JsonResponse({'data': voice_data_list}, status=200)

        return JsonResponse({'error': {'message': 'You are not authenticated.'}}, status=401)

    except CustomUser.DoesNotExist:
        logger.error(f"User with ID {pk} not found.")
        return JsonResponse({'error': {'message': 'User not found.'}}, status=404)
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        return JsonResponse({'error': {'message': 'An unexpected error occurred.'}}, status=500)

# views.py
import requests
from django.http import JsonResponse
from rest_framework.decorators import api_view

@api_view(['POST'])
def upload_voice(request):
    # Check for file in request data
    if 'voiceFile' not in request.FILES:
        return JsonResponse({'error': 'No audio file provided'}, status=400)
    if 'userId' not in request.FILES:
        return JsonResponse({'error': 'User id not provided. Please login'}, status=400)

    # Get the voice name and audio file
    voice_name = request.data.get('voiceName')
    user_id = request.data.get('userId')
    audio_file = request.FILES['voiceFile']

    # Send the file to Eleven Labs API without saving locally
    try:
        headers = {
            'Authorization': f'Bearer {settings.ELEVEN_LABS_API_KEY}',
        }
        data = {
            "voice_name": voice_name,
        }
        files = {
            'file': (audio_file.name, audio_file.read(), audio_file.content_type)
        }
        response = requests.post(
            'https://api.elevenlabs.io/voice', headers=headers, data=data, files=files
        )

        # Parse the response
        if response.status_code == 200:
            voice_id = response.json().get('voice_id')
            
            # Upload the voice to the db
            user = CustomUser.objects.get(id=user_id)
            if user.DoesNotExist:
                return JsonResponse({'error': {'message': 'Well, this user does not exist.'}})
            else:
                user.voices_id.append(voice_id)
                return JsonResponse({'voice_id': voice_id})


        else:
            return JsonResponse({'error': {'message':{'Voice cloning failed'}}}, status=response.status_code)
    except Exception as e:
        logger.log(f"Error in voice cloning for user {id}: ", e)    
        return JsonResponse({'error': {'message':{'Whoops something went wrong while connecting to the server.'}}}, status=500)
