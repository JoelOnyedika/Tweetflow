import os
import re
from pieces.video_config import VideoConfig
from moviepy.editor import *
from typing import List, Tuple


class SRTProcessor:
    @staticmethod
    def srt_time_to_seconds(srt_time: str) -> float:
        print('triggered')
        h, m, s = re.split(r"[:]", srt_time)
        s = s.replace(',', '.')
        print(h, m, s, srt_time)
        return int(h) * 3600 + int(m) * 60 + float(s)

    @staticmethod
    def create_text_clips(subtitles: List[str], text_config: dict, screen_config: VideoConfig) -> Tuple[List[TextClip], List[AudioClip]]:
        text_clips = []
        audio_clips = []

        config = VideoConfig()

        print('create text clips is being triggered')

        for i, subtitle in enumerate(subtitles):
            parts = subtitle.split('\n')
            print(parts)
            
            timing = parts[1].split(' --> ')
            print(timing)
            print('i reached it')

            try:
                start_time = SRTProcessor.srt_time_to_seconds(timing[0].strip())
                end_time = SRTProcessor.srt_time_to_seconds(timing[1].strip())
                duration = end_time - start_time
                print(start_time, end_time)
                print('duration', duration)
            except Exception as e:
                print(e)

            text = parts[2]
            print(text_config)

            try:
                stroke_width = int(text_config['font_size'] * .01)
                text_clip = TextClip(
                    text,
                    fontsize=text_config["font_size"] * 2,
                    color=f"#{text_config['text_color'][0]:02x}{text_config['text_color'][1]:02x}{text_config['text_color'][2]:02x}",
                    font=text_config["font_family"],
                    method='caption',
                    size=(screen_config.screen_width - text_config["left_margin"] - text_config["right_margin"], None),
                    stroke_color=f'#{text_config['text_outline_color'][0]:02x}{text_config['text_outline_color'][1]:02x}{text_config['text_outline_color'][2]:02x}',
                    stroke_width=stroke_width
                ).set_position(('center', text_config['top_margin'])).set_start(start_time).set_duration(duration)

                text_clips.append(text_clip)
                print('appended ')
                audio_clip = AudioFileClip(f'{config.temp_audio_dir}/AudioClip-{i}.mp3').set_start(start_time).set_duration(duration)
                print('fire gg')
                audio_clips.append(audio_clip)
                print('appended')
            except Exception as e:
                print(e)
                return jsonify({'error': {'message': "Something went wrong while creating subtitles"}})
        print('end of create audio and text clip')
        print(text_clips, audio_clips)
        return text_clips, audio_clips

