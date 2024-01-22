from flask import Flask, render_template, Response, request, jsonify
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

app = Flask(__name__)
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

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
    emit("processed_frames", {"image": "data:image/jpeg;base64," + img_base64})
    return
    # return jsonify({"image": "data:image/jpeg;base64," + img_base64})

if __name__ == "__main__":
    host = "127.0.0.1"
    port = 8001
    debug = True
    socketio.run(app, host=host, port=port, debug=debug)
