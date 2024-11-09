async def locally_generate_subtitles(
    self, sentences: list[str], audio_clips: list[AudioFileClip]
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

        start_time += duration  # Update start time for the next subtitle

    print('\n'.join(subtitles))

    return "\n".join(subtitles)