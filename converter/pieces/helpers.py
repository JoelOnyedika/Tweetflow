from moviepy.editor import VideoFileClip, VideoClip, AudioFileClip, CompositeVideoClip
from flask import jsonify
from PIL import Image, ImageFilter
import numpy as np
from .voice_handler import generate_audio
from datetime import timedelta
import os
import shutil
from pydub import AudioSegment
import uuid
from typing import Optional, Tuple
import shutil

def split_text_into_segments(text, max_words=3):
    """Split text into segments with a maximum number of words."""
    words = text.split()
    segments = [' '.join(words[i:i + max_words]) for i in range(0, len(words), max_words)]
    print(segments)
    return segments

def split_audio_into_segments(segment: list[str], audio_path: str):
    increment = 0
    audio_segments = []
    if not os.path.exists(audio_path):
        os.makedirs(audio_path)
    else:
        shutil.rmtree(audio_path)
        os.makedirs(audio_path)

    for text in segment:
        path = audio_path + f'/AudioClip-{increment}.mp3'
        file = generate_audio(text, path)
        if file:
            print(f'saved auvdio {increment}, {path}', file)
            audio_file = AudioFileClip(path)
            increment += 1
            audio_segments.append(audio_file)
            print('ll')
    return audio_segments
    

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

# def resize_frame(frame, target_size):
#     try:
#         img = Image.fromarray(frame)
#         img.thumbnail(target_size, Image.LANCZOS)
#         new_img = Image.new("RGB", target_size, (0, 0, 0))
#         new_img.paste(img, ((target_size[0] - img.size[0]) // 2, (target_size[1] - img.size[1]) // 2))
#         print('resized')
#         return np.array(new_img)
#     except Exception as e:
#         print(e)

def adjust_audio(video_path: str, temp_audio_path: str):
    try:
        video_clip = VideoFileClip(video_path)
        audio = video_clip.audio
        id = uuid.uuid4()
        audio_path = f'{temp_audio_path}/audio_{id}.wav'
        print('Writing video audio')
        
        if not os.path.exists(temp_audio_path):
            os.makedirs(temp_audio_path)
        
        audio.write_audiofile(audio_path)
        audio_segment = AudioSegment.from_file(audio_path)
        
        target_dBFS = -14
        dB_difference = target_dBFS - audio_segment.dBFS
        adjustment_factor = 10 ** (dB_difference / 20)
        
        # Create a copy before modifying to avoid NoneType error
        video_clip.volumex(adjustment_factor)
        print('Adjusted video audio')
        
        # Clean up temp file
        # if os.path.exists(audio_path):
        #     os.remove(audio_path)
            
        return video_clip
        
    except Exception as e:
        print(f'Error processing video: {e}')
        return jsonify({'error': {'message': 'Something went wrong while processing video'}})
        

def center_video_in_tiktok_frame(temp_audio_path: str, video_path: str):
    tiktok_size = (1080, 1920)
    video = adjust_audio(video_path, temp_audio_path)
    
    if video is None:
        print("Error: video could not be loaded or adjusted.")
        return None
    
    try:
        video_width, video_height = video.size
        video_aspect_ratio = video_width / video_height
        tiktok_aspect_ratio = tiktok_size[0] / tiktok_size[1]
        
        if video_aspect_ratio > tiktok_aspect_ratio:
            resized_video = video.resize(width=tiktok_size[0])
        else:
            resized_video = video.resize(height=tiktok_size[1])
        
        def blur_frame(frame):
            pil_image = Image.fromarray(frame)
            pil_image = pil_image.resize(tiktok_size, Image.Resampling.LANCZOS)
            pil_image = pil_image.filter(ImageFilter.GaussianBlur(20))
            return np.array(pil_image)
        
        background = video.fl_image(blur_frame)
        centered_video = CompositeVideoClip([background, resized_video.set_position("center")])
        centered_video.audio = video.audio
        
        return centered_video
        
    except Exception as e:
        print(f"Error: {e}")
        return None



def locally_generate_subtitles(
    sentences: list[str], audio_clips: list[AudioFileClip]
) -> str:
    def convert_to_srt_time_format(total_seconds):
        # Convert total seconds to the SRT time format: HH:MM:SS,mmm
        if total_seconds == 0:
            return "0:00:00,0"
        return str(timedelta(seconds=total_seconds)).rstrip("0").replace(".", ",")

    start_time = 0
    subtitles = []

    for i, (sentence, audio_clip) in enumerate(
        zip(sentences, audio_clips), start=1
    ):
        duration = audio_clip.duration
        end_time = start_time + duration

        # Format: subtitle index, start time --> end time, sentence
        subtitle_entry = f"{i}\n{convert_to_srt_time_format(start_time)} --> {convert_to_srt_time_format(end_time)}\n{sentence}\n"
        subtitles.append(subtitle_entry)

        start_time += duration  # Update start time for the next subtitlw
        print('ggd')
    return subtitles