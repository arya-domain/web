from flask import Flask, render_template, Response, request, jsonify, g
import cv2
import threading
import os

# ====--------------------------
from flask_cors import CORS
import json
import base64
import numpy as np
import psycopg2
# ====--------------

from controllers.auth import register, login
from db import connect_db, close_db

app = Flask(__name__)
CORS(app)
# ------------------

conn=psycopg2.connect(
            user='postgres',
            password='abc',
            host='localhost',
            dbname='hr_app',
            port="5432"
        )

cur=conn.cursor()

cur.execute(
    """ CREATE TABLE IF NOT EXISTS users (email varchar(255),first_name char(255), last_name char(255),password varchar(255) )"""
)

conn.commit()

cur.close()
conn.close()



face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

@app.route("/api/detect", methods=["POST"])
def detect_faces():
    data = request.get_json()
    img_data = base64.b64decode(data["image"].split(",")[1])
    npimg = np.fromstring(img_data, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    for x, y, w, h in faces:
        cv2.rectangle(img, (x, y), (x + w, y + h), (0, 0, 255), 2)

    _, img_encoded = cv2.imencode(".jpg", img)
    img_base64 = base64.b64encode(img_encoded).decode()
    return jsonify({"image": "data:image/jpeg;base64," + img_base64})


app.route('/user/register', methods=['POST'])(register)
app.route('/user/login', methods=['POST'])(login)


@app.route("/quiz", methods=["GET"])
def get_quiz():
    with open("./quiz.json") as f:
        data = json.load(f)
    print(jsonify(data))
    return jsonify(data)

if __name__ == "__main__":
    host = "127.0.0.1"
    port = 8000
    debug = True
    options = None
    app.run(host, port, debug, options)
