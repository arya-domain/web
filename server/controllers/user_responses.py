import os
import time

from flask import request, jsonify
import uuid
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.validate import validate_question_id
from db import execute_query, get_db

# @jwt_required()
# def save_audio():
#     try:
#         user_id = get_jwt_identity();

#         if 'audio' not in request.files:
#             return jsonify({"message": "Audio files are required"}), 400

#         audio_file = request.files['audio']
#         question_id = request.form.get("question_id")

#         if question_id is None:
#             return jsonify({"message": "question_id must be provided"}), 400
        
#         if not validate_question_id(question_id):
#             return jsonify({"error": "Invalid question_id"}), 400

#         if audio_file.filename == '':
#             return jsonify({"message": "audio files must be provided"}), 400
        
#         audio_folder = f'recordings/audio/{user_id}/'
#         os.makedirs(audio_folder, exist_ok=True)

#         audio_extension = os.path.splitext(audio_file.filename)[1].lstrip('.')
#         audio_filename = f"{uuid.uuid4().hex}_{int(time.time())}.{audio_extension}"

#         audio_file.save(os.path.join(audio_folder, audio_filename))

#         query = """
#             INSERT INTO response_recordings (user_id, question_id, audio_path)
#             VALUES (%s, %s, %s)
#             ON CONFLICT (user_id, question_id)
#             DO NOTHING
#             RETURNING id, created_at
#         """
#         values = (user_id, question_id, os.path.join(audio_folder, audio_filename))
        
#         result = execute_query(query, values, fetchone=True)

#         if not result:
#             # If the insert didn't happen (due to conflict), perform an update
#             query = """
#                 UPDATE response_recordings
#                 SET audio_path = %s
#                 WHERE user_id = %s AND question_id = %s
#                 RETURNING id, created_at
#             """
#             values = (os.path.join(audio_folder, audio_filename), user_id, question_id)

#             result = execute_query(query, values, fetchone=True)

#         get_db().commit()

#         return jsonify({"message": "Files uploaded successfully"}), 200

#     except Exception as e:
#         return jsonify({"message": str(e)}), 500
    
@jwt_required()
def save_video():
    try:

        user_id = get_jwt_identity();

        if 'video' not in request.files:
            return jsonify({"message": "video files are required"}), 400

        video_file = request.files['video']
        question_id = request.form.get("question_id")

        if question_id is None:
            return jsonify({"message": "question_id must be provided"}), 400
        
        if not validate_question_id(question_id):
            return jsonify({"error": "Invalid question_id"}), 400

        if video_file.filename == '':
            return jsonify({"message": "video files must be provided"}), 400
        
        video_folder = f'recordings/videos/{user_id}/'
        os.makedirs(video_folder, exist_ok=True)

        video_extension = os.path.splitext(video_file.filename)[1].lstrip('.')
        video_filename = f"{uuid.uuid4().hex}_{int(time.time())}.{video_extension}"

        video_file.save(os.path.join(video_folder, video_filename))

        query = """
            INSERT INTO response_recordings (user_id, question_id, video_path)
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id, question_id)
            DO NOTHING
            RETURNING id, created_at
        """
        values = (user_id, question_id, os.path.join(video_folder, video_filename))
        
        result = execute_query(query, values, fetchone=True)

        if not result:
            # If the insert didn't happen (due to conflict), perform an update
            query = """
                UPDATE response_recordings
                SET video_path = %s
                WHERE user_id = %s AND question_id = %s
                RETURNING id, created_at
            """
            values = (os.path.join(video_folder, video_filename), user_id, question_id)

            result = execute_query(query, values, fetchone=True)

        get_db().commit()

        return jsonify({"message": "Files uploaded successfully"}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500

# import os
# import time

# from flask import request, jsonify
# import uuid
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from utils.validate import validate_question_id
# from db import execute_query, get_db

# @jwt_required()
# def save_audio():
#     try:
#         user_id = get_jwt_identity();

#         if 'audio' not in request.files:
#             return jsonify({"message": "Audio files are required"}), 400

#         audio_file = request.files['audio']
#         question_id = request.form.get("question_id")

#         if question_id is None:
#             return jsonify({"message": "question_id must be provided"}), 400
        
#         if not validate_question_id(question_id):
#             return jsonify({"error": "Invalid question_id"}), 400

#         if audio_file.filename == '':
#             return jsonify({"message": "audio files must be provided"}), 400
        
#         audio_folder = f'recordings/audio/{user_id}/'
#         os.makedirs(audio_folder, exist_ok=True)

#         audio_extension = os.path.splitext(audio_file.filename)[1].lstrip('.')
#         audio_filename = f"{uuid.uuid4().hex}_{int(time.time())}.{audio_extension}"

#         audio_file.save(os.path.join(audio_folder, audio_filename))

#         audio_path=os.path.join(audio_folder, audio_filename)

#         with sr.AudioFile(audio_path) as source:
#             audio_data=r.record(source)
#             text=r.recognize_google(audio_data)
#         print(text)
#         print()

#         query = """
#             INSERT INTO response_recordings (user_id, question_id, audio_path, transcribed_text)
#             VALUES (%s, %s, %s, %s)
#             ON CONFLICT (user_id, question_id)
#             DO NOTHING
#             RETURNING id, created_at
#         """
#         values = (user_id, question_id, os.path.join(audio_folder, audio_filename), text)
        
#         result = execute_query(query, values, fetchone=True)

#         if not result:
#             # If the insert didn't happen (due to conflict), perform an update
#             query = """
#                 UPDATE response_recordings
#                 SET audio_path = %s,
#                     transcribed_text = %s
#                 WHERE user_id = %s AND question_id = %s
#                 RETURNING id, created_at
#             """
#             values = (os.path.join(audio_folder, audio_filename), text, user_id, question_id)

#             result = execute_query(query, values, fetchone=True)

#         get_db().commit()

#         return jsonify({"message": "Files uploaded successfully"}), 200

#     except Exception as e:
#         return jsonify({"message": str(e)}), 500
    
# @jwt_required()
# def save_video():
#     try:

#         user_id = get_jwt_identity();
#         # user_id = 8;

#         if 'video' not in request.files:
#             return jsonify({"message": "video files are required"}), 400

#         video_file = request.files['video']
#         question_id = request.form.get("question_id")

#         if question_id is None:
#             return jsonify({"message": "question_id must be provided"}), 400
        
#         if not validate_question_id(question_id):
#             return jsonify({"error": "Invalid question_id"}), 400

#         if video_file.filename == '':
#             return jsonify({"message": "video files must be provided"}), 400
        
#         video_folder = f'recordings/videos/{user_id}/'
#         os.makedirs(video_folder, exist_ok=True)

#         video_extension = os.path.splitext(video_file.filename)[1].lstrip('.')
#         video_filename = f"{uuid.uuid4().hex}_{int(time.time())}.{video_extension}"

#         video_file.save(os.path.join(video_folder, video_filename))

#         query = """
#             INSERT INTO response_recordings (user_id, question_id, video_path)
#             VALUES (%s, %s, %s)
#             ON CONFLICT (user_id, question_id)
#             DO NOTHING
#             RETURNING id, created_at
#         """
#         values = (user_id, question_id, os.path.join(video_folder, video_filename))
        
#         result = execute_query(query, values, fetchone=True)

#         if not result:
#             # If the insert didn't happen (due to conflict), perform an update
#             query = """
#                 UPDATE response_recordings
#                 SET video_path = %s
#                 WHERE user_id = %s AND question_id = %s
#                 RETURNING id, created_at
#             """
#             values = (os.path.join(video_folder, video_filename), user_id, question_id)

#             result = execute_query(query, values, fetchone=True)

#         get_db().commit()

#         return jsonify({"message": "Files uploaded successfully"}), 200

#     except Exception as e:
#         return jsonify({"message": str(e)}), 500
