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
from flask_socketio import SocketIO, emit

app = Flask(__name__)

CORS(app)
socketio = SocketIO(app)


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

def progress_callback(current_frame, total_frames):
        progress = (current_frame / total_frames) * 100
        socketio.emit('video_progress', {'progress': progress})


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
        if data['media']:
            if data['media'].endswith(('mp4', 'mov', 'avi')):
                background_clip = center_video_in_tiktok_frame(data['media'], background_color=hex_to_rgb(data["backgroundColor"]))
                video_duration = min(background_clip.duration, max_duration)  # Cap the video duration at 60 seconds

                # If the video is shorter than the audio, duplicate the video until it matches the audio duration
                if video_duration < text_duration:
                    loop_clips = []
                    while sum([clip.duration for clip in loop_clips]) < text_duration:
                        loop_clips.append(background_clip)
                    background_clip = concatenate_videoclips(loop_clips).subclip(0, text_duration)
            else:
                img = Image.open(data['media'])
                img.thumbnail((screen_width, screen_height), Image.LANCZOS)
                new_img = Image.new("RGB", (screen_width, screen_height), hex_to_rgb(data["backgroundColor"]))
                new_img.paste(img, ((screen_width - img.size[0]) // 2, (screen_height - img.size[1]) // 2))
                background_clip = ImageClip(np.array(new_img)).set_duration(text_duration)
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
        final_clip.write_videofile(output_filename, codec="libx264", fps=24, callback=progress_callback, threads=4)

        # Clean up the generated audio file
        os.remove("audio.mp3")
    except Exception as e:
        print(e)
        return jsonify({ 'error': {'message': "something went wrong"} })
    return jsonify({'data', 'Process Completeted'})








# text = "This is a sample text that will be used to generate a video with text-to-speech audio. Tweet flow is still in development but will cook. Hopefully, it will be ready soon."
#generate_video_from_text(text)



# data = {
#     'media': './vid3.mp4',
#     "text": text,
#     "fontFamily": "Arial",
#     "fontSize": 80,
#     "lineHeight": 1.5,
#     "textColor": "#ff0000",
#     "textColorUnread": "#888888",
#     'textOutline': "#ffffff",
#     'marginTop': 900,
#     "marginLeft": 150,
#     "marginRight": 150,
#     "textAnim": None,
#     "templateName": "My Template",
#     "backgroundColor": "#708090",
# }

# generate_tiktok_video(data)

if __name__ == '__main__':
    socketio.run(app, debug=True)