from pieces.video_config import VideoConfig
from pieces.media_processor import MediaProcessor
from pieces.srt_processor import SRTProcessor
from flask import Flask, request, jsonify
import os
from pieces.helpers import (
    split_text_into_segments,
    split_audio_into_segments,
    locally_generate_subtitles,
    hex_to_rgb,
)
from moviepy.editor import *
from typing import List, Tuple, Optional, Union
import shutil
from moviepy.config import change_settings

class TikTokVideoGenerator:
    def __init__(self):
        self.config = VideoConfig()
        self.media_processor = MediaProcessor(self.config)
        self.srt_processor = SRTProcessor()

    def generate(self, data: dict) -> dict:
        try:
            if not self._validate_input(data):
                return jsonify({"error": "Invalid input data"}), 400

            self._setup_environment(data)
            print('processing background_clip')
            try:
                background_clip = self._process_background(data)
                print('processing text and audio')
                text_clips, audio_clips = self._process_text_and_audio(data)
                print(text_clips, audio_clips)
                print('composing video')
                final_clip = self._compose_final_video(background_clip, text_clips, audio_clips)
                self._cleanup()
            except Exception as e:
                print(e)
                return jsonify({'error': {'message': 'Something went horribly wrong.'}})

            return jsonify({'data': {'message': 'Process Completed'}})

        except Exception as e:
            return jsonify({'error': {'message': str(e)}})

    def _validate_input(self, data: dict) -> bool:
        return 'text' in data and isinstance(data['text'], str)

    def _setup_environment(self, data: dict) -> None:
        IMAGEMAGICK_BINARY = r"C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe"
        FFMPEG_BINARY = r'C:\Users\USER\Desktop\ffmpeg\bin'
        change_settings({
            "IMAGEMAGICK_BINARY": IMAGEMAGICK_BINARY, 
            # 'FFMPEG_BINARY': FFMPEG_BINARY
            })
        if os.path.exists(self.config.output_filename):
            os.remove(self.config.output_filename)

    def _process_background(self, data: dict) -> Union[VideoClip, ImageClip, ColorClip]:
        if data['media'] is not None and data['media'] != 'None':
            file_ext = os.path.splitext(data['media'])[1].lower()
            background_color = hex_to_rgb(data["background_color"])

            if any(file_ext == ext for ext in self.config.vids_exts):
                return self.media_processor.process_video(data['media'], background_color, self.config.max_duration)
            elif any(file_ext == ext for ext in self.config.img_exts):
                return self.media_processor.process_image(data['media'], background_color, self.config.max_duration)
        
        return ColorClip(
            size=(self.config.screen_width, self.config.screen_height),
            color=hex_to_rgb(data["background_color"])
        ).set_duration(self.config.max_duration)

    def _process_text_and_audio(self, data: dict) -> Tuple[List[TextClip], List[AudioClip]]:
        segments = split_text_into_segments(data['text'])
        audio_segments = split_audio_into_segments(segments, self.config.temp_audio_dir)
        subtitles = locally_generate_subtitles(segments, audio_segments)

        print('gg')

        try:
            text_config = {
                "font_size": data["font_size"],
                "top_margin": data["top_margin"],
                "text_color": hex_to_rgb(data["text_color"]),
                "font_family": data["font_family"],
                "left_margin": data["left_margin"],
                "right_margin": data["right_margin"],
                "text_outline_color": hex_to_rgb(data['text_outline_color']) if data['text_outline_color'] else None
            }

            print(text_config)
        except Exception as e:
            print(e)
            return jsonify({'error': {'message': {"Invalid parameters"}}})

        print('processed and returned')
        return self.srt_processor.create_text_clips(subtitles, text_config, self.config)

    def _compose_final_video(
        self,
        background_clip: Union[VideoClip, ImageClip, ColorClip],
        text_clips: List[TextClip],
        audio_clips: List[AudioClip]
    ) -> None:
        print('composing final clip')
        try:
            composite_audio = CompositeAudioClip(audio_clips)
            final_clip = CompositeVideoClip(
                [background_clip, *text_clips],
                size=(self.config.screen_width, self.config.screen_height)
            )
            final_clip = final_clip.set_audio(composite_audio)
            final_clip = final_clip.subclip(0, composite_audio.duration)
            print('now writing')
            final_clip.write_videofile(
                self.config.output_filename,
                codec='libx264',
                fps=24,
                threads=4,
                preset='veryfast'
            )
        except Exception as e:
            print(e)
            return jsonify({'error': {'message': 'Something went wrong while composing video'}})

    def _cleanup(self) -> None:
        if os.path.exists(self.config.temp_audio_dir):
            shutil.rmtree(self.config.temp_audio_dir)
        if os.path.exists(self.config.temp_video_dir):
            shutil.rmtree(self.config.temp_video_dir)
        if os.path.exists(self.config.temp_dir):
            os.rmdir(self.config.temp_dir)
