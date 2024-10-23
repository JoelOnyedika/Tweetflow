from gtts import gTTS
from flask import jsonify
import os
import requests

api_key = os.getenv('ELEVENLABS_API_KEY')
url = "https://api.elevenlabs.io/v1/voices"

def generate_audio(text, audio_filename="audio.mp3"):
    try:
        """Generate audio from text using gTTS."""
        tts = gTTS(text=text, lang='en')
        tts.save(audio_filename)
    except Exception as e:
        return jsonify({ 'error': {'message': "something went wrong while genrerating audio"} })



def get_models():
    try:
        headers = {
            "Content-Type": "application/json",
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