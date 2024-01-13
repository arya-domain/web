from flask import Flask, render_template, Response, request, jsonify
import cv2
import threading
import os

# ====--------------------------
from flask_bcrypt import Bcrypt
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)
# ------------------


lock = threading.Lock()

stop_stream = False

# Create directory to store saved videos
SAVE_FOLDER = "saved_videos"
if not os.path.exists(SAVE_FOLDER):
    os.makedirs(SAVE_FOLDER)

video_path = os.path.join(SAVE_FOLDER, "captured_video.mp4")
fourcc = cv2.VideoWriter_fourcc(*"mp4v")
out = cv2.VideoWriter(video_path, fourcc, 20.0, (640, 480))

# Load the pre-trained face and eye detection models
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")


@app.route("/stream", methods=["GET"])
def stream():
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")


def generate():
    # grab global references to the lock variable
    global lock, stop_stream
    # initialize the video stream
    vc = cv2.VideoCapture(1)

    # check camera is open
    if vc.isOpened():
        rval, frame = vc.read()
    else:
        rval = False

    while rval:
        with lock:
            rval, frame = vc.read()
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.5, minNeighbors=5)
            for x, y, w, h in faces:
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
                roi_gray = gray[y : y + h, x : x + w]
                roi_color = frame[y : y + h, x : x + w]
                eyes = eye_cascade.detectMultiScale(roi_gray)
                for ex, ey, ew, eh in eyes:
                    cv2.rectangle(
                        roi_color, (ex, ey), (ex + ew, ey + eh), (0, 255, 0), 2
                    )

            if frame is None:
                continue
            out.write(frame)
            (flag, encodedImage) = cv2.imencode(".jpg", frame)

            if not flag:
                continue
            if stop_stream:
                out.release()
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + bytearray(encodedImage) + b"\r\n"
        )
    vc.release()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/stop_video", methods=["POST"])
def stop_video():
    global stop_stream
    stop_stream = True
    return render_template("index.html")


# ---------------------------------------------------------------------------------------

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
        return jsonify({"message": "Connection successful"})
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
    debug = False
    options = None
    app.run(host, port, debug, options)
