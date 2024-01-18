from flask import Flask, render_template, Response, request, jsonify, g
import cv2
from datetime import timedelta
import threading
import os

# ====--------------------------
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import base64
import numpy as np
# ====--------------

from controllers.auth import register, login
from controllers.user_responses import save_audio, save_video
from controllers.quiz import get_quiz
from db import connect_db, close_db

app = Flask(__name__)

app.config['JWT_SECRET_KEY'] = 'random-string-which-should-not-be-visible-here'
app.config['JWT_EXPIRATION_DELTA'] = timedelta(hours=4)
jwt = JWTManager(app)

CORS(app)
# ------------------

app.before_request(connect_db)
app.teardown_request(close_db)


face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

@app.route("/api/detect", methods=["POST"])
def detect_faces_batch():
    try:
        data = request.get_json()

        # Extract and process multiple frames
        frames = [base64.b64decode(frame_data.split(",")[1]) for frame_data in data["frames"]]
        processed_frames = [process_frame(frame) for frame in frames]

        # Return the processed frames as a single response
        return jsonify({"processed_frames": processed_frames})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def process_frame(frame_data):
    # Decode and process a single frame
    npimg = np.frombuffer(frame_data, dtype=np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    # Perform face detection
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    # Draw rectangles around faces
    for x, y, w, h in faces:
        cv2.rectangle(img, (x, y), (x + w, y + h), (0, 0, 255), 2)

    _, img_encoded = cv2.imencode(".jpg", img)
    img_base64 = base64.b64encode(img_encoded).decode()

    return {"image": "data:image/jpeg;base64," + img_base64}

# @app.route("/api/detect", methods=["POST"])
# def detect_faces():
#     data = request.get_json()
#     img_data = base64.b64decode(data["image"].split(",")[1])
#     npimg = np.fromstring(img_data, np.uint8)
#     img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

#     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
#     faces = face_cascade.detectMultiScale(gray, 1.1, 4)

#     for x, y, w, h in faces:
#         cv2.rectangle(img, (x, y), (x + w, y + h), (0, 0, 255), 2)

#     _, img_encoded = cv2.imencode(".jpg", img)
#     img_base64 = base64.b64encode(img_encoded).decode()
#     return jsonify({"image": "data:image/jpeg;base64,"})


app.route('/user/register', methods=['POST'])(register)
app.route('/user/login', methods=['POST'])(login)
app.route('/user/user-responses/video', methods=['POST'])(save_video)
app.route('/user/user-responses/audio', methods=['POST'])(save_audio)

app.add_url_rule('/quiz', 'quiz', get_quiz, methods=['GET'])

if __name__ == "__main__":
    host = "127.0.0.1"
    port = 8000
    debug = True
    options = None
    app.run(host, port, debug, options)
