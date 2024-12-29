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
from b2sdk.v2 import InMemoryAccountInfo, B2Api
import requests
from django.conf import settings
import math
import json


logger = logging.getLogger(__name__)


class VideoGenerator:
    def __init__(
        self,
        text: str,
        relative_audio_path,
        file_name: str = "output.mp3",
    ):
        self.text = text
        self.file_name = file_name
        self.audio_path = os.path.join(settings.BASE_DIR, relative_audio_path)
        self.generated_audio = None
        self.captions = None
        self.fps = 30

    def generate_audio(self):
        try:
            # Validate the audio path
            if not self.audio_path or not isinstance(self.audio_path, str):
                raise ValueError("Invalid audio path provided.")

            # Check if the directory exists, and create it if it doesn't
            if not os.path.exists(self.audio_path):
                print(f"Directory does not exist. Creating: {self.audio_path}")
                os.makedirs(self.audio_path, exist_ok=True)
                if not os.path.exists(self.audio_path):
                    raise OSError(f"Failed to create directory: {self.audio_path}")
            else:
                print(f"Directory already exists: {self.audio_path}")

            # Generate the audio file
            full_path = os.path.join(self.audio_path, self.file_name)
            audio = gTTS(text=self.text, lang="en")
            audio.save(full_path)

            # Save the generated file path and log success
            self.generated_audio = full_path
            print(f"Audio saved successfully at: {full_path}")
            logger.error(full_path)
            return {"data": full_path}

        except ValueError as val_error:
            error_message = f"Invalid input: {val_error}"
            print(error_message)
            logger.error(error_message)
            return {"error": {"message": error_message}}

        except Exception as e:
            error_message = f"An unexpected error occurred: {e}"
            print(error_message)
            logger.error(error_message)
            return {"error": {"message": error_message}}

    def generate_captions(self, max_words=1):
        """
        Generate captions with timestamps for use in tools like Remotion,
        splitting words into groups of max_words.
        """
        try:
            # Ensure max_words is an integer
            try:
                max_words = int(max_words)
                if max_words <= 0:
                    raise ValueError("max_words must be greater than 0.")
            except ValueError:
                raise ValueError(
                    f"max_words must be a valid positive integer, got {max_words}"
                )

            # Validate audio file existence
            if not self.generated_audio or not os.path.exists(self.generated_audio):
                raise FileNotFoundError("Audio file not found.")

            # Load the Whisper model
            model = whisper.load_model("tiny")

            # Transcribe the audio file
            result = model.transcribe(self.generated_audio)

            # Process transcription segments to split on words
            segments = result["segments"]
            captions = []

            for segment in segments:
                words = segment["text"].split()
                start = segment.get("start", 0)  # Start timestamp in seconds
                end = segment.get("end", 0)  # End timestamp in seconds

                # Duration per word
                duration_per_word = (end - start) / len(words) if words else 0

                # Group words into chunks of max_words
                for i in range(0, len(words), max_words):
                    word_group = words[i : i + max_words]
                    group_start = start + i * duration_per_word
                    group_end = group_start + len(word_group) * duration_per_word

                    captions.append(
                        {
                            "text": " ".join(word_group),  # Join words in the group
                            "startMs": int(group_start * 1000),
                            "endMs": int(group_end * 1000),
                            "confidence": None,  # Whisper doesn't provide confidence per group
                        }
                    )

            self.captions = captions

            # Return captions as JSON for easy use in JavaScript
            return {"data": captions}

        except FileNotFoundError as fnf_error:
            print(f"File error: {fnf_error}")
            logger.error(f"File error: {fnf_error}")
            return {"error": {"message": "Audio file not found."}}
        except Exception as e:
            print(f"An error occurred: {e}")
            logger.error(f"An error occurred while generating captions: {e}")
            return {
                "error": {"message": "Something went wrong while generating captions."}
            }

    def generate_duration_in_frames(self):
        lastCaption = self.captions[len(self.captions) - 1]
        duration = math.ceil((lastCaption["endMs"] / 1000) * self.fps)
        return duration

    def generate_video_data(self, data: dict):
        try:
            # Process the template and text
            the_template = Template.objects.get(id=data["template"])
            serializer = TemplateSerializer(the_template).data

            # Add data fields to serializer
            serializer["text"] = data["text"]
            serializer["title"] = data["title"]
            serializer["voice_id"] = data["voice"]
            serializer["user"] = data["user"]

            # Generate audio and captions
            audio_response = self.generate_audio()
            if "error" in audio_response:
                return audio_response

            captions_response = self.generate_captions()
            if "error" in captions_response:
                return captions_response

            serializer["captions"] = self.captions
            print(serializer)

            duration_in_frames = self.generate_duration_in_frames()
            
            serializer["duration_in_frames"] = duration_in_frames
            
            serializer["fps"] = self.fps

            try:
                json_data = json.dumps(serializer)  # Ensure it's serializable
            except TypeError as e:
                logger.error(f"Serialization Error: {e}")
                return JsonResponse({"error": {"message": "Serializer output is not valid JSON."}}, status=400)

            headers = {
                # "x-api-key": f"{settings.VIDEOMAKER_API_KEY}",
                "Content-Type": 'application/json'
            }

            try:
                # json_data = json.dumps(serializer)
                response = requests.post(
                    f"{settings.VIDEOMAKER_SERVER_URL}/api/create-video", 
                    json=serializer, 
                    headers=headers
                )
                response.raise_for_status()  # Raise an exception for HTTP errors
                result = response.json()
            except requests.exceptions.RequestException as e:
                logger.error(f"Request Error: {e}")
                print(f"Response content: {e.response.text if e.response else 'No response'}")
                return JsonResponse({"error": {'message': "Whoops something went wrong while creating your video."}}, status=500)

            if "data" in result:
                return JsonResponse({"data": result["data"]})
            else:
                return JsonResponse(result["error"], status=response.status_code)

            # return {"data": serializer}

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
        if data:
            data["user"] = str(request.user.id)
            video_generator = VideoGenerator(
                text=data["text"], relative_audio_path=f"media/{uuid.uuid4()}"
            )
            response = video_generator.generate_video_data(data)

            print(response)

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
