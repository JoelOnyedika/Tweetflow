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

load_dotenv(dotenv_path=Path(__file__).resolve().parent / '.env')

app = Flask(__name__)


B2_APPLICATION_KEY_ID = os.getenv('B2_APPLICATION_KEY_ID')
B2_APPLICATION_KEY = os.getenv('B2_APPLICATION_KEY')
B2_BUCKET_NAME = os.getenv('B2_BUCKET_NAME')

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limi

info = InMemoryAccountInfo()
b2_api = B2Api(info)

try:
    # Authorize account using application key ID and key
    b2_api.authorize_account('production', B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY)
    print("Successfully authorized Backblaze B2 account!")
    
    # Get the bucket by name and print its details
    bucket = b2_api.get_bucket_by_name(B2_BUCKET_NAME)
    print(f"Bucket found: {bucket.name}")

except Exception as e:
    print("Error:", e)
    # return jsonify({ "error": {"message": "Unable to connect to storage."} })


CORS(app)

def upload_media(type: str, user_id: str, template_id: str, file: any):
    randomUUID = uuid.uuid4()
    file_path = f'{type}s/{user_id}/{template_id}/{randomUUID}'

    if type not in ['image', 'video']:
        return jsonify({'error': {'message': 'Invalid type'}}), 400

    try:
        # Upload the file to Backblaze
        uploaded_file = bucket.upload_bytes(file.read(), file_path)

        # Get the file URL
        file_url = b2_api.get_download_url_for_fileId(uploaded_file.id_)
        return jsonify({"data": file_url}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': {'message': "Something went wrong while uploading file"}}), 500


def resize_frame(frame, target_size):
    img = Image.fromarray(frame)
    img.thumbnail(target_size, Image.LANCZOS)
    new_img = Image.new("RGB", target_size, (0, 0, 0))
    new_img.paste(img, ((target_size[0] - img.size[0]) // 2, (target_size[1] - img.size[1]) // 2))
    return np.array(new_img)


def center_video_in_tiktok_frame(video_path, background_color=(0, 0, 0)):
    tiktok_size = (1080, 1920)
    video = VideoFileClip(video_path)

    try:
        video_width, video_height = video.size
        video_aspect_ratio = video_width / video_height
        tiktok_aspect_ratio = tiktok_size[0] / tiktok_size[1]

        if abs(video_aspect_ratio - tiktok_aspect_ratio) < 0.1:
            return video.resize(height=tiktok_size[1]).set_position(("center", "center")).on_color(
                size=tiktok_size, color=background_color, pos=("center", "center"))

        def make_frame(t):
            frame = video.get_frame(t)
            return resize_frame(frame, tiktok_size)

        centered_video = VideoClip(make_frame, duration=video.duration)
        return centered_video
    except Exception as e:
        return jsonify({ 'error': {'message': "something went wrong while centering video"} })

    finally:
        video.reader.close()
        video.audio.reader.close_proc()


def generate_audio(text, audio_filename="audio.mp3"):
    try:
        """Generate audio from text using gTTS."""
        tts = gTTS(text=text, lang='en')
        tts.save(audio_filename)
    except Exception as e:
        return jsonify({ 'error': {'message': "something went wrong while genrerating audio"} })


def split_text_into_segments(text, max_words=3):
    """Split text into segments with a maximum number of words."""
    words = text.split()
    segments = [' '.join(words[i:i + max_words]) for i in range(0, len(words), max_words)]
    return segments
    

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

@app.route('/api/create-template', methods=['POST'])
def generate_tiktok_video():
    data = request.get_json()
    print(data)
    # TikTok screen resolution (9:16 ratio)
    screen_width = 1080
    screen_height = 1920
    max_duration = 60  # Maximum duration for both video and audio in seconds
    output_filename="output.mp4"

    # Remove any previous video file with the same name
    if os.path.exists(output_filename):
        os.remove(output_filename)

    # Generate audio from text
    generate_audio(data['text'])

    # Load the generated audio
    audio_clip = AudioFileClip("audio.mp3")
    text_duration = min(audio_clip.duration, max_duration)  # Cap the audio duration at 60 seconds

    # Background clip: Color, Image, or Video
    try:
        if 'text' not in data or not isinstance(data['text'], str):
            return jsonify({"error": "Invalid text input"}), 400

        if data['media']:
            file_type, _ = mimetypes.guess_type(data['media'])
            if file_type is None:
                return jsonify({ "error": {"message": "Unsupported file type"} })
            if file_type.startswith('data:video/'):
                video_url = upload_media('video', data['userId'], data['id'], data['media'])
                print(video_url)
                background_clip = center_video_in_tiktok_frame(video_url, background_color=hex_to_rgb(data["backgroundColor"]))
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
                new_img = Image.new("RGB", (screen_width, screen_height), hex_to_rgb(data["backgroundColor"]))
                new_img.paste(img, ((screen_width - img.size[0]) // 2, (screen_height - img.size[1]) // 2))
                background_clip = ImageClip(np.array(new_img)).set_duration(text_duration)
            else:
                return jsonify({ "error": {"message": "Unsupported file type"} })             
        else:
            background_color = hex_to_rgb(data["backgroundColor"])
            background_clip = ColorClip(size=(screen_width, screen_height), color=background_color).set_duration(text_duration)
    except Exception as e:
        print(e)
        return jsonify({ 'error': {'message': "something went wrong"} })

    try:
        # Extract and convert text color and outline color
        text_color = hex_to_rgb(data["textColor"])
        text_outline_color = hex_to_rgb(data['textOutline']) if data['textOutline'] else None
        segments = split_text_into_segments(data['text'])
        segment_duration = text_duration / len(segments)

        # Create TextClips for each segment
        text_clips = []
        for i, text_segment in enumerate(segments):
            txt_clip = TextClip(
                txt=text_segment,
                fontsize=data["fontSize"],
                color=f"#{text_color[0]:02x}{text_color[1]:02x}{text_color[2]:02x}",
                font=data["fontFamily"],
                method='caption',
                size=(screen_width - data["marginLeft"] - data["marginRight"], None),
                stroke_color=f"#{text_outline_color[0]:02x}{text_outline_color[1]:02x}{text_outline_color[2]:02x}" if text_outline_color else None,
                stroke_width=3
            ).set_start(i * segment_duration).set_duration(min(segment_duration, text_duration - i * segment_duration))

            # Position the text on the screen
            txt_clip = txt_clip.set_position(("center", data['marginTop']))
            text_clips.append(txt_clip)

        # Composite the final video
        final_clip = CompositeVideoClip([background_clip, *text_clips], size=(screen_width, screen_height))

        # Add audio
        final_clip = final_clip.set_audio(audio_clip)

        # Write the video to a file
        final_clip = final_clip.subclip(0, text_duration)  # Ensure the final video doesn't exceed the text duration
        final_clip.write_videofile(output_filename, codec="libx264", fps=24, threads=4)

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