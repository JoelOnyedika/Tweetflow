from moviepy.editor import VideoFileClip, VideoClip
from flask import jsonify
from PIL import Image
import numpy as np


def split_text_into_segments(text, max_words=3):
    """Split text into segments with a maximum number of words."""
    words = text.split()
    segments = [' '.join(words[i:i + max_words]) for i in range(0, len(words), max_words)]
    return segments
    

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

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
