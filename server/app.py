from flask import Flask, render_template, Response, request, jsonify, g
from flask_socketio import SocketIO, emit
import cv2
from datetime import timedelta
import threading
import os
from fer import FER

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
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

app.config['JWT_SECRET_KEY'] = 'random-string-which-should-not-be-visible-here'
app.config['JWT_EXPIRATION_DELTA'] = timedelta(hours=4)
jwt = JWTManager(app)

# ------------------

app.before_request(connect_db)
app.teardown_request(close_db)

#emotion detection
emotion_detector=FER(mtcnn=True)
emotion_list,emotion_score=[],[]


face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

@socketio.on("connect")
def handle_connect():
    print("Socket connected")

@socketio.on("disconnect")
def handle_disconnect():
    print("Socket disconnected")


@socketio.on("image_data")
def handle_image(data):
    # img_data = base64.b64decode(data["image"].split(",")[1])
    # npimg = np.fromstring(img_data, np.uint8)
    # img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    # gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    # for x, y, w, h in faces:
    #     cv2.rectangle(img, (x, y), (x + w, y + h), (0, 0, 255), 2)

    # _, img_encoded = cv2.imencode(".jpg", img)
    # img_base64 = base64.b64encode(img_encoded).decode()

    # # Emit the processed image data back to the frontend
    # emit("processed_frames", {"image": "detected"})

    img_data = base64.b64decode(data["image"].split(",")[1])
    npimg = np.fromstring(img_data, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    features=emotion_detector.top_emotion(img) #get the emotion and its prob
    emotion_score.append(features[1])
    emotion_list.append(features[0])
    print(emotion_list,emotion_score)
    for x, y, w, h in faces:
        cv2.rectangle(img, (x, y), (x + w, y + h), (0, 0, 255), 2)

    _, img_encoded = cv2.imencode(".jpg", img)
    img_base64 = base64.b64encode(img_encoded).decode()
    return jsonify({"image": "data:image/jpeg;base64," + img_base64})

app.route('/user/register', methods=['POST'])(register)
app.route('/user/login', methods=['POST'])(login)
app.route('/user/user-responses/video', methods=['POST'])(save_video)
app.route('/user/user-responses/audio', methods=['POST'])(save_audio)

app.add_url_rule('/quiz', 'quiz', get_quiz, methods=['GET'])

if __name__ == "__main__":
    host = "127.0.0.1"
    port = 8000
    debug = True
    socketio.run(app, host=host, port=port, debug=debug)
