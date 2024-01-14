from flask import Flask, render_template, Response, request, jsonify, g
import cv2
import threading
import os

# ====--------------------------
from flask_bcrypt import Bcrypt
from pymongo.mongo_client import MongoClient
import psycopg2
from pymongo.server_api import ServerApi
from flask_cors import CORS
import json
import base64
import numpy as np

app = Flask(__name__)
CORS(app)
# ------------------

app.config['DATABASE'] = {
    'user': 'postgres',
    'password': '',
    'host': 'localhost',
    'dbname': ''
}


def connect_db():
    return psycopg2.connect(
        user=app.config['DATABASE']['user'],
        password=app.config['DATABASE']['password'],
        host=app.config['DATABASE']['host'],
        dbname=app.config['DATABASE']['dbname']
    )

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()


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
        cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)

    _, img_encoded = cv2.imencode(".jpg", img)
    img_base64 = base64.b64encode(img_encoded).decode()
    return jsonify({"image": "data:image/jpeg;base64," + img_base64})


uri = "mongodb://localhost:27017"
client = MongoClient(uri, server_api=ServerApi("1"))
db = client.get_database("users")
bcrypt = Bcrypt(app)


@app.route("/mongodb_test", methods=["GET"])
def mongodb_test():
    try:
        client.admin.command("ping")
        cursor = g.db.cursor()
        cursor.execute('SELECT * FROM users')
        result = cursor.fetchall()
        cursor.close();
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({"message": "Connection failed", "error": str(e)})


@app.route("/user/register", methods=["POST"])
def register():
    users = db.users
    email = request.json["email"]
    password = bcrypt.generate_password_hash(request.json["password"]).decode("utf-8")
    firstName = request.json["firstName"]
    lastName = request.json["lastName"]
    user_id = users.insert_one(
        {
            "email": email,
            "password": password,
            "firstName": firstName,
            "lastName": lastName,
        }
    ).inserted_id
    new_user = users.find_one({"_id": user_id})
    result = {
        "email": new_user["email"],
        "firstName": new_user["firstName"],
        "lastName": new_user["lastName"],
    }
    return jsonify({"result": result})


@app.route("/user/login", methods=["POST"])
def login():
    users = db.users
    email = request.json["email"]
    password = request.json["password"]
    user = users.find_one({"email": email})

    if user and bcrypt.check_password_hash(user["password"], password):
        return jsonify({"message": "Login successful", "email": user["email"]}), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401


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
