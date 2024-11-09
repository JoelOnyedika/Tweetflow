from moviepy.editor import *
import logging
import hashlib
from concurrent.futures import ThreadPoolExecutor
import os
from flask import jsonify
from pathlib import Path
from pieces.helpers import (
    split_text_into_segments,
    split_audio_into_segments,
    locally_generate_subtitles,
    hex_to_rgb,
    center_video_in_tiktok_frame
)
import requests
import shutil
from io import BytesIO
from PIL import ImageColor, Image, ImageFilter
from pieces.video_config import VideoConfig
from typing import Tuple

class MediaProcessor:
    def __init__(self, config: VideoConfig, max_workers: int = 10):
        self.config = config
        self.temp_base = self.config.temp_video_dir

        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger('Logger')

        self.executor = ThreadPoolExecutor(max_workers=max_workers)


    def get_temp_path(self, media_url: str, file_ext: str) -> Path:
        url_hash = hashlib.md5(media_url.encode()).hexdigest()
        return f'{self.temp_base}/{url_hash}{file_ext}'

    def join_clips(clip: VideoFileClip):
        try:
            print(background_clip)
            if background_clip is not None:
                video_duration = min(background_clip.duration, self.config.max_duration)
                if video_duration < text_duration:
                    loop_clips = []
                    while sum([clip.duration for clip in loop_clips]) < text_duration:
                        loop_clips.append(background_clip)
                    background_clip = concatenate_videoclips(loop_clips).subclip(0, text_duration)
        except Exception as e:
            print(e)


    def process_video(self, media_url: str, background_color: Tuple[int, int, int], text_duration: float) -> VideoClip:
        print('triggered')
        print(media_url)
        file_ext = Path(media_url).suffix.lower()
        print(file_ext)
        temp_path = self.get_temp_path(media_url, file_ext)
        
        if not os.path.exists(temp_path):
            os.makedirs(self.temp_base)
        
        try:
            background_clip = None  # Initialize background_clip as None

            response = requests.get(media_url, stream=True)
            response.raise_for_status()
            
            file_size = int(response.headers.get('content-length', 0))
            self.logger.info(f'Processing file of size: {file_size} bytes')
            
            if file_size > 100 * 1024 * 1024:
                self.logger.info("Large file processing directly")
                background_clip = center_video_in_tiktok_frame(self.config.temp_audio_dir, media_url)
                if background_clip:
                    self.join_clips(background_clip)
            else:
                print('writing to dir')
                self.logger.info(f'Writing to temporary file: {temp_path}')
                
                with open(temp_path, 'wb', buffering=8192) as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                try:
                    background_clip = center_video_in_tiktok_frame(self.config.temp_audio_dir, str(temp_path))
                    print(background_clip)
                    if background_clip:
                        self.join_clips(background_clip)
                        print('background_clip', background_clip)
                except Exception as e:
                    print(e)

            if background_clip is None:
                raise ValueError("Failed to create background_clip")
            
            print(background_clip)
            return background_clip

        except Exception as e:
            print(f"Error processing ddd video: {e}")
            raise
        except requests.RequestException as e:
            self.logger.error(f"Failed to download video: {e}")
            print(e)
        except OSError as e:
            self.logger.error(f"File system error: {e}")
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error: {e}")
            raise



    def __del__(self):
        self.executor.shutdown(wait=True)

    def process_image(self, media_url: str, background_color: Tuple[int, int, int], text_duration: float) -> ImageClip:
        image_response = requests.get(media_url)
        image = Image.open(BytesIO(image_response.content))

        background = image.resize((self.config.screen_width, self.config.screen_height))
        background = background.filter(ImageFilter.GaussianBlur(20))  # Adjust blur radius as needed

        image.thumbnail((self.config.screen_width, self.config.screen_height), Image.LANCZOS)

        x = (self.config.screen_width - image.size[0]) // 2
        y = (self.config.screen_height - image.size[1]) // 2

        background.paste(image, (x, y))

        # Convert the background to an ImageClip and set the duration
        return ImageClip(np.array(background)).set_duration(text_duration)
