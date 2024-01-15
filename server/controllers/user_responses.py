from flask import request, jsonify

def save_audio():
    try:

        if 'audio' not in request.files:
            return jsonify({"error": "Audio files are required"}), 400

        audio_file = request.files['audio']

        if audio_file.filename == '':
            return jsonify({"error": "audio files must be provided"}), 400

        audio_file.save('./recordings/' + audio_file.filename)

        return jsonify({"message": "Files uploaded successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def save_video():
    try:

        if 'video' not in request.files:
            return jsonify({"error": "video files are required"}), 400

        video_file = request.files['video']

        if video_file.filename == '':
            return jsonify({"error": "Both audio and video files must be provided"}), 400

        video_file.save('./recordings/' + video_file.filename)

        return jsonify({"message": "Files uploaded successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
