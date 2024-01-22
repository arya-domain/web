# import speech_recognition as sr
import whisper
from langdetect import detect

from moviepy.editor import VideoFileClip
from moviepy.Clip import Clip
from pathlib import Path,PurePath
import subprocess



def convert_video_to_audio(input_video):
    output_video = str(PurePath(input_video))+'_ffmpeg.mp4'
    try:
        subprocess.run(['ffmpeg', '-i', str(input_video), '-t', '60', str(output_video)])        
        # Load the video clip
        # print(input_video+"_duration")
        # print(type(input_video+"_duration"))
        video_clip = VideoFileClip(output_video)
        # video_clip = video_clip.Clip(0,60)
        # Extract audio from the video clip
        audio_clip = video_clip.audio

        # Save the audio clip as an MP3 file
        audio_clip.write_audiofile(str(input_video+'_audio.wav'), codec='pcm_s16le')

        # Close the video and audio clips
        video_clip.close()
        audio_clip.close()
        return str(input_video+'_audio.wav')
    except Exception as e:
        print(f"Error in converting video file to audio: {str(e)}")
        return None


def audio_data_to_text(file_path):
    ''' 1. Accessing audio files from their file paths (first will try on already saved audio files and the nmove to converting audio from video files)
        2. Converting audio files to speech
        3. Inserting transcribed text in database
        4. Sending the transcribed text to disc_scoring function for DISC scrore calculation
    '''
    audio_path = convert_video_to_audio(file_path)
    print(file_path)

    # Load the base model and transcribe the audio
    model = whisper.load_model("base")
    result = model.transcribe("audio.mp3")
    transcribed_text = result["text"]
    print(transcribed_text)

    # Detect the language
    language = detect(transcribed_text)
    print(f"Detected language: {language}")


    return transcribed_text