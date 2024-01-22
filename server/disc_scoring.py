from flask import jsonify
import os 
from emotion_detection import detect_emotion
from speech_to_text import audio_data_to_text
from db import execute_query
# from flask_jwt_extended import jwt_required, get_jwt_identity
# Define scoring for each response
scoring = {
    'Strongly Disagree': 1,
    'Disagree': 2,
    'Neutral': 3,
    'Agree': 4,
    'Strongly Agree': 5
}

# Initialize trait scores
trait_scores = {'D': 0, 'I': 0, 'S': 0, 'C': 0}

def video_file_path():
    query="SELECT video_path FROM response_recordings"
    video_paths = execute_query(query)
    # print(video_paths)
    return video_paths

def emotion_mapping(emotion_values):
    emo_score = 0
    if emotion_values['happy'] >= 0.7:
        emotion_mapping = {
            'happy': 'Strongly Agree',
            'neutral': 'Disagree',
            'disgust': 'Strongly Disagree',
            'sad': 'Neutral',
            'angry': 'Strongly Disagree',
            'fear': 'Strongly Disagree'
        }
        for key in emotion_mapping:
            emo_score += emotion_values[key]*scoring[emotion_mapping[key]]            
    
    elif emotion_values['happy'] < 0.7 and emotion_values['happy'] >= 0.5:
        emotion_mapping = {
        'happy': 'Strongly Agree',
        'neutral': 'Neutral',
        'disgust': 'Strongly Disagree',
        'sad': 'Neutral',
        'angry': 'Strongly Disagree',
        'fear': 'Disagree'
        }
        for key in emotion_mapping:
            emo_score += emotion_values[key]*scoring[emotion_mapping[key]]         

    elif emotion_values['happy'] < 0.5:
        if emotion_values['neutral'] > 0.5:
            emo_score = scoring['Neutral']
        elif emotion_values['angry'] > 0.5 or emotion_values['angry']:
            emo_score = scoring['Strongly Disagree']
    

    return emo_score

def contains_substring(text):
    """
    Check if the given text contains any substring from the list of substrings.

    Parameters:
    - text: The text to be checked.

    Returns:
    - substring if any substring is found, False otherwise.
    """
    for substring in scoring.keys():
        if substring in text:
            return substring
    return False
# @jwt_required
def disc_score():
    '''Calculates disc_score by: 
    1. Mapping classified emotion and its respective score to a one-to-one disc_scoring scale per question.
    2. Mapping text data of the responses to a similar one-to-one disc_scoring scale per question.
    '''
    try:
        video_paths = video_file_path()
        # user_id = get_jwt_identity();
        for path in video_paths:
            str_path= os.path.join(os.getcwd(),path[0])
            # emotion_score = detect_emotion(str_path)
            response = audio_data_to_text(str_path)
            print("response")
            trait_scores['S'] += scoring[contains_substring(response[50])]  # Steadiness trait for both sets
            print("response below")
            # emotion_disc_score = emotion_mapping(emotion_score)
            # trait_scores['S'] += emotion_disc_score
            print(trait_scores['S'])
        return jsonify({"Score": trait_scores['S']}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": str(e)}), 500