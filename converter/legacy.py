import os
from moviepy.config import change_settings


IMAGEMAGICK_BINARY = r"C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe"
FFMPEG_BINARY = r"C:\Users\USER\Desktop\ffmpeg\bin"
change_settings(
    {
        "IMAGEMAGICK_BINARY": IMAGEMAGICK_BINARY,
        # 'FFMPEG_BINARY': FFMPEG_BINARY
    }
)

from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip, AudioFileClip
from gtts import gTTS
import numpy as np
from pydub import AudioSegment

# Step 1: Create your video or image clips using MoviePy (just a color clip example here)
clip = VideoFileClip("Saying.mp4")  # This can be an image or video

# Step 2: Generate audio with GTTS
text = "Hello world, welcome to the karaoke effect!"
tts = gTTS(text)
tts.save("output.mp3")

# Step 3: Use PyDub to get the timing of words
audio = AudioSegment.from_mp3("output.mp3")
audio_length = len(audio)  # Total duration in milliseconds

# Example text to display
words = text.split()
word_timings = np.linspace(0, audio_length, len(words) + 1).astype(
    int
)  # Divide audio into word segments


# Step 4: Create TextClips with progressive highlighting
def create_highlighted_text(word, start_time, end_time):
    # Create the text clip with a white background and black text
    txt_clip = TextClip(
        word,
        fontsize=50,
        color="white",
        font="Arial",
        bg_color="black",
        size=(1280, 720),
        print_cmd=True,
    )
    txt_clip = txt_clip.set_start(start_time / 1000).set_end(
        end_time / 1000
    )  # Convert ms to seconds
    return txt_clip


# Step 5: Create clips for each word with time-based highlighting
text_clips = []
for i, word in enumerate(words):
    start_time = word_timings[i]
    end_time = word_timings[i + 1]
    text_clip = create_highlighted_text(word, start_time, end_time)
    text_clips.append(text_clip)

# Step 6: Combine the video and text clips
composite = CompositeVideoClip([clip] + text_clips)  # The background clip + text clips

# Step 7: Set the final audio to sync with the video and captions
final_audio = AudioFileClip("output.mp3")
composite = composite.set_audio(final_audio)

# Step 8: Export the final video
composite.write_videofile("output_with_karaoke.mp4", codec="libx264", fps=24)
