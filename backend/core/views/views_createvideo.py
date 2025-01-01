from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from pathlib import Path
import logging
import os
import uuid
import whisper
from gtts import gTTS
from core.models import Template
from core.serializers import TemplateSerializer
from b2sdk.v2 import InMemoryAccountInfo, B2Api, AuthInfoCache
import requests
from django.conf import settings
import math
import json
from functools import lru_cache
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class StorageService(ABC):
    @abstractmethod
    def upload_file(self, user_id: str, local_file_path: str):
        pass

class BackblazeStorage(StorageService):
    def __init__(self):
        self.count = 1
        
    @lru_cache(maxsize=1)
    def get_b2_api(self):
        info = InMemoryAccountInfo()
        print('gotten b2 api')
        return B2Api(info)

    def handle_backblaze_connection(self):
        try:
            b2_api = self.get_b2_api()
            b2_api.authorize_account('production', settings.B2_APPLICATION_KEY_ID, settings.B2_APPLICATION_KEY)
            bucket = b2_api.get_bucket_by_name(settings.B2_BUCKET_NAME)
            print('returning bucket')
            return bucket
        except Exception as e:
            return JsonResponse({
                "": {
                    "message": "Could not connect to storage service",
                    "details": str(e)
                }
            }, status=500)

    def upload_file(self, user_id: str, local_file_path: str):
        try:
            bucket = self.handle_backblaze_connection()
        except Exception as e:
            print("Error:", e)
            return JsonResponse({"error": {"message": "Unable to connect to storage."}}), 500

        base_path = f'audio/{user_id}'
        title = uuid.uuid4()
        file_name = f'{title}.mp3'
        b2_destination_path = f'{base_path}/{file_name}'

        try:
            files = bucket.ls(base_path, recursive=True)
            while any(file[0].file_name == b2_destination_path for file in files):
                b2_destination_path = f"{base_path}/{title} ({self.count}).mp3"
                self.count += 1

            if not os.path.isfile(local_file_path):
                print('file does not exist on this system')
                return {"error": {"message": "File does not exist on the server."}}

            print('Uploading file...')
            uploaded_file = bucket.upload_local_file(local_file=local_file_path, file_name=b2_destination_path)

            file_url = f'https://f005.backblazeb2.com/file/{settings.B2_BUCKET_NAME}/{b2_destination_path}'
            print(file_url)
            return {"data": file_url}
        except Exception as e:
            print(e)
            return {'error': {'message': "Something went wrong while uploading the file."}}

class AudioGenerator(ABC):
    @abstractmethod
    def generate(self, text: str, voice_id: str, audio_path: str):
        pass

class ElevenLabsAudioGenerator(AudioGenerator):
    def generate(self, text: str, voice_id: str, audio_path: str):
        if not audio_path or not isinstance(audio_path, str):
            raise ValueError("Invalid audio path provided.")

        if not os.path.exists(audio_path):
            print(f"Directory does not exist. Creating: {audio_path}")
            os.makedirs(audio_path, exist_ok=True)
            if not os.path.exists(audio_path):
                raise OSError(f"Failed to create directory: {audio_path}")
        else:
            print(f"Directory already exists: {audio_path}")

        TTS_ENDPOINT = "https://api.elevenlabs.io/v1/text-to-speech"
        headers = {
            "Content-Type": "application/json",
            "xi-api-key": settings.ELEVENLABS_API_KEY,
        }
        payload = {
            "text": text,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.8
            }
        }

        try:
            response = requests.post(
                f"{TTS_ENDPOINT}/{voice_id}",
                headers=headers,
                json=payload
            )
            print(response)

            if response.status_code == 200:
                with open(f"{audio_path}/output_audio.mp3", "wb") as audio_file:
                    audio_file.write(response.content)
                print("Audio generated and saved as output_audio.mp3")
                print("Writing audio file to b2")
                return f"{audio_path}/output_audio.mp3"
            else:
                print("Failed to generate audio:", response.status_code, response.text)
                return None
        except Exception as e:
            print(e)
            logger.error(f'Something went wrong in views create video: {e}')
            return None

class CaptionGenerator:
    def generate(self, text: str, voice_id: str):
        try:
            endpoint = f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps'
            headers = {
                'Content-Type': 'application/json',
                'xi-api-key': settings.ELEVENLABS_API_KEY
            }
            payload = {
                'text': text
            }
            return requests.post(endpoint, headers=headers, json=payload)
        except Exception as e:
            print(f"An error occurred: {e}")
            logger.error(f"An error occurred while generating captions: {e}")
            return None

class VideoGenerator:
    def __init__(
        self,
        text: str,
        relative_audio_path: str,
        voice_id: str,
        user_id: str,
    ):
        self.text = text
        self.voice_id = voice_id
        self.user_id = user_id
        self.audio_path = os.path.join(settings.BASE_DIR, relative_audio_path)
        self.generated_audio = None
        self.captions = None
        self.fps = 30
        self.storage_service = BackblazeStorage()
        self.audio_generator = ElevenLabsAudioGenerator()
        self.caption_generator = CaptionGenerator()

    def generate_audio(self):
        try:
            audio_file_path = self.audio_generator.generate(self.text, self.voice_id, self.audio_path)
            if audio_file_path:
                return self.storage_service.upload_file(self.user_id, audio_file_path)
            return {'error': {'message': "Something went wrong while generating audio"}}
        except Exception as e:
            error_message = f"An unexpected error occurred: {e}"
            print(error_message)
            logging.error(error_message)
            return {"error": {"message": error_message}}

    def generate_captions(self):
        response = self.caption_generator.generate(self.text, self.voice_id)
        if not response:
            return {"error": {"message": "Something went wrong while generating captions."}}
        result = response.json()
        self.captions = result['alignment']
        logger.error(self.captions)
        return self.captions

    def generate_duration_in_frames(self):
        lastCaption = self.captions[len(self.captions) - 1]
        duration = math.ceil((lastCaption["endMs"] / 1000) * self.fps)
        return duration

    def generate_video_data(self, data: dict):
        try:
            the_template = Template.objects.get(id=data["template"])
            serializer = TemplateSerializer(the_template).data

            serializer["text"] = data["text"]
            serializer["title"] = data["title"]
            serializer["voice_id"] = data["voice"]
            serializer["user"] = data["user"]

            audio_response = self.generate_audio()
            if "error" in audio_response:
                return audio_response

            captions_response = self.generate_captions()
            if "error" in captions_response:
                return captions_response

            serializer["captions"] = self.captions

            duration_in_frames = self.generate_duration_in_frames()
            serializer["duration_in_frames"] = duration_in_frames
            serializer["fps"] = self.fps

            try:
                json_data = json.dumps(serializer)
                logger.error(f"Data dumps .................. {serializer}")
            except TypeError as e:
                logger.error(f"Serialization Error: {e}")
                return JsonResponse({"error": {"message": "Serializer output is not valid JSON."}}, status=400)

            headers = {
                "Content-Type": 'application/json'
            }

            try:
                response = requests.post(
                    f"{settings.VIDEOMAKER_SERVER_URL}/api/create-video", 
                    json=serializer, 
                    headers=headers
                )
                response.raise_for_status()
                result = response.json()
            except requests.exceptions.RequestException as e:
                logger.error(f"Request Error: {e}")
                print(f"Response content: {e.response.text if e.response else 'No response'}")
                return JsonResponse({"error": {'message': "Whoops something went wrong while creating your video."}}, status=500)
            except Exception as e:
                logger.error(f"Error while making request to video creation server: {str(e)}")
                return {
                    "error": {
                        "message": "An error occurred while processing your video request."
                    }
                }    

            if "data" in result:
                return JsonResponse({"data": result["data"]})
            else:
                return JsonResponse(result["error"], status=response.status_code)

        except Template.DoesNotExist:
            return {"error": {"message": "Template not found. Please refresh."}}
        except Exception as e:
            logger.error(f"Error while processing video creation: {str(e)}")
            return {
                "error": {
                    "message": "An error occurred while processing your video request."
                }
            }

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_video(request):
    try:
        data = request.data
        print("ggs okay", data)
        if data:
            data["user"] = str(request.user.id)
            video_generator = VideoGenerator(
                text=data["text"], 
                relative_audio_path=f"media/{uuid.uuid4()}", 
                voice_id=data['voice'], 
                user_id=data['user']
            )
            response = video_generator.generate_video_data(data)

            print(f"Response {response}")

            if isinstance(response, JsonResponse):
                return response
            return JsonResponse(response, safe=isinstance(response, dict))

        return JsonResponse({"error": {"message": "No data provided"}}, status=400)
    except Exception as e:
        logger.error(f"Error while creating video: {str(e)}")
        return JsonResponse(
            {"error": {"message": "An error occurred while creating your video."}},
            status=500,
        )