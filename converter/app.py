from moviepy.editor import *
import os
from gtts import gTTS
from moviepy.editor import *
from datetime import datetime
from moviepy.video.tools.segmenting import findObjects
from PIL import ImageColor, Image
# import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import mimetypes
from b2sdk.v2 import InMemoryAccountInfo, B2Api
import uuid
from dotenv import load_dotenv
from pathlib import Path
from pieces.helpers import split_text_into_segments, hex_to_rgb, resize_frame, center_video_in_tiktok_frame
from pieces.voice_handler import generate_audio, get_models
from pieces.upload_handler import upload_media
# from flask_socketio import SocketIO

load_dotenv(dotenv_path=Path(__file__).resolve().parent / '.env')

app = Flask(__name__)

API_KEY = os.getenv('CONVERTER_API_KEY')

CORS(app)
# socketio = SocketIO(app)

# @app.before_request
# def require_api_key():
#     api_key = request.headers.get('x-api-key')  # Use a custom header for API key
#     if api_key != API_KEY:
#         return jsonify({"error": "Unauthorized access"}), 403 

@app.route('/api/voice-models', methods=['GET'])
def get_voice_models():
    data = get_models()
    return jsonify(data)


@app.route('/api/create-video', methods=['POST'])
def generate_tiktok_video():
    data = request.get_json()
    print(data)
    # TikTok screen resolution (9:16 ratio)
    screen_width = 1080
    screen_height = 1920
    max_duration = 60  # Maximum duration for both video and audio in seconds
    output_filename="output.mp4"

    print('shit')

    # Remove any previous video file with the same name
    if os.path.exists(output_filename):
        os.remove(output_filename)

    # Generate audio from text
    generate_audio(data['text'])
    print('generating audio')

    # Load the generated audio
    audio_clip = AudioFileClip("audio.mp3")
    text_duration = min(audio_clip.duration, max_duration)  # Cap the audio duration at 60 seconds

    # Background clip: Color, Image, or Video
    try:
        if 'text' not in data or not isinstance(data['text'], str):
            return jsonify({"error": "Invalid text input"}), 400

        if not data['media'] is None or data['media'] == 'None':
            file_type, _ = mimetypes.guess_type(data['media'])
            if file_type is None:
                return jsonify({ "error": {"message": "Unsupported file type"} })
            if file_type.startswith('data:video/'):
                video_url = upload_media('video', data['user_id'], data['id'], data['media'])
                print(video_url)
                background_clip = center_video_in_tiktok_frame(video_url, background_color=hex_to_rgb(data["background_color"]))
                video_duration = min(background_clip.duration, max_duration)  # Cap the video duration at 60 seconds

                # If the video is shorter than the audio, duplicate the video until it matches the audio duration
                if video_duration < text_duration:
                    loop_clips = []
                    while sum([clip.duration for clip in loop_clips]) < text_duration:
                        loop_clips.append(background_clip)
                    background_clip = concatenate_videoclips(loop_clips).subclip(0, text_duration)
            elif file_type.startswith('data:image/'):
                image_url = upload_media('image', data['userId'], data['id'], data['media'])
                print(image_url)
                img = Image.open(image_url)
                img.thumbnail((screen_width, screen_height), Image.LANCZOS)
                new_img = Image.new("RGB", (screen_width, screen_height), hex_to_rgb(data["background_color"]))
                new_img.paste(img, ((screen_width - img.size[0]) // 2, (screen_height - img.size[1]) // 2))
                background_clip = ImageClip(np.array(new_img)).set_duration(text_duration)
            else:
                return jsonify({ "error": {"message": "Unsupported file type"} })             
        else:
            print('Using bg colour', data["background_color"])
            background_color = hex_to_rgb(data["background_color"])
            print(background_color, data['background_color'])
            background_clip = ColorClip(size=(screen_width, screen_height), color=background_color).set_duration(text_duration)
            print('Using bg color 2')
    except Exception as e:
        print(e)
        return jsonify({ 'error': {'message': "something went wrong"} })

    try:
        # Extract and convert text color and outline color
        print('text color type shit')
        text_color = hex_to_rgb(data["text_color"])
        text_outline_color = hex_to_rgb(data['text_outline_color']) if data['text_outline_color'] else None
        segments = split_text_into_segments(data['text'])
        segment_duration = text_duration / len(segments)

        # Create TextClips for each segment
        text_clips = []
        for i, text_segment in enumerate(segments):
            txt_clip = TextClip(
                txt=text_segment,
                fontsize=data["font_size"]*2,
                color=f"#{text_color[0]:02x}{text_color[1]:02x}{text_color[2]:02x}",
                font=data["font_family"],
                method='caption',
                size=(screen_width - data["left_margin"] - data["right_margin"], None),
                stroke_color=f"#{text_outline_color[0]:02x}{text_outline_color[1]:02x}{text_outline_color[2]:02x}" if text_outline_color else None,
                stroke_width=3
            ).set_start(i * segment_duration).set_duration(min(segment_duration, text_duration - i * segment_duration))

            # Position the text on the screen
            txt_clip = txt_clip.set_position(("center", data['top_margin']))
            text_clips.append(txt_clip)

        # Composite the final video
        print('composing video')
        final_clip = CompositeVideoClip([background_clip, *text_clips], size=(screen_width, screen_height))

        # Add audio
        final_clip = final_clip.set_audio(audio_clip)

        # Write the video to a file
        print('writing video')
        final_clip = final_clip.subclip(0, text_duration)  # Ensure the final video doesn't exceed the text duration
        final_clip.write_videofile(output_filename, codec="libx264", fps=24, threads=4, preset='ultrafast')

        # Clean up the generated audio file
        os.remove("audio.mp3")
        return jsonify({'data': {'message':'Process Completeted'}})
    except Exception as e:
        print(e)
        return jsonify({ 'error': {'message': "something went wrong"} })
    

@app.errorhandler(500)
def handle_internal_error(error):
    # Log the error for debugging purposes
    app.logger.error(f"Internal Server Error: {error}")

    # You can check for CORS-related messages or other exceptions
    if "CORS" in str(error):  
        return jsonify({"error": {"message": "CORS error occurred"}}), 500

    # Return a generic response for all other 500 errors
    return jsonify({"error": {"message":"Internal server error occurred"}}), 500

if __name__ == '__main__':
    app.run(debug=True)