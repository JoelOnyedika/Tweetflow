# from moviepy.editor import ColorClip, TextClip, CompositeVideoClip

# # Create a background clip (black background)
# background = ColorClip(size=(1920, 1080), color=(0, 0, 0)).set_duration(5)

# # Create text clip
# text = TextClip(
#     txt="Hello World", 
#     fontsize=70, 
#     color='white'
# ).set_position('center').set_duration(5)

# # Combine clips
# final_clip = CompositeVideoClip([background, text])

# # Write video file
# final_clip.write_videofile(
#     "hello_world.mp4",
#     fps=24,
#     codec='libx264',
#     preset='medium'
# )

import asyncio


class Fire:
    @staticmethod
    def test():
        print('test')

    def gg():
        print('gg')

    def testf(self):
        Fire.test()
        Fire.gg()

i = Fire()
import re

f = '0:00:00,0'
h, m, s = re.split(r"[:]", f)
s = s.replace(',', '.')
print(s)

file1 = "video1.mp4"    # Might conflict if two users upload "video1.mp4"

# With hashing:
import hashlib
import os
import tempfile
# Create unique name based on time and user info
unique_name = hashlib.md5("user123_time456".encode()).hexdigest()
file1 = f"{unique_name}.mp4"    # Like 'a7b8c9
print(file1)

print(os.path.join(os.environ.get('TEMP', '.'), 'video_processor'))
print(tempfile.gettempdir())