from dataclasses import dataclass, field
import uuid
from typing import List

@dataclass
class VideoConfig:
    screen_width: int = 1080
    screen_height: int = 1920
    max_duration: int = 60
    output_path: str = f"generated_video/{uuid.uuid4()}"
    temp_dir: str = "temp_media"
    temp_audio_dir: str = f'temp_audio/{uuid.uuid4()}'
    temp_video_dir: str = f'temp_video/{uuid.uuid4()}'
    vids_exts: List[str] = field(default_factory=lambda: ['.mp4', '.mov', '.avi'])
    img_exts: List[str] = field(default_factory=lambda: ['.png', '.jpeg', '.jpg', '.webp', '.gif', '.svg'])