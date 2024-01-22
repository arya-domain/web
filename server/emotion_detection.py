import tensorflow as tf
from fer import FER, Video
import cv2
import base64
import numpy as np


'''
Code which detects and classifies the most probable emotion and the probability score of that emotion
'''


gpu_devices = tf.config.list_physical_devices('GPU')
print(f'{gpu_devices}')

emotion_detector = FER()
emotion_score = {}
def detect_emotion(file_path):
    try:
        video = Video(file_path)
        # Analyze video for emotion detection
        vid = video.analyze(emotion_detector, frequency = 20)
        # Convert to pandas for analysis
        df = video.to_pandas(vid)
        df = video.get_emotions(df)
        for col in df.columns:
            emotion_score[col] = round(df.sum()[col]/len(vid),3)
        print(emotion_score)
        # Get emotion score and classification
        return emotion_score

    except Exception as e:
        print(f"Error in detect_emotion: {str(e)}")
        return None

