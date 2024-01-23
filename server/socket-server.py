from flask import Flask
from flask_socketio import SocketIO, emit
# ====--------------------------
from flask_cors import CORS
# ====--------------
app = Flask(__name__)
CORS(app)


socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")
# from datetime import timedelta
# app.config['JWT_SECRET_KEY'] = 'random-string-which-should-not-be-visible-here'
# app.config['JWT_EXPIRATION_DELTA'] = timedelta(hours=4)
# jwt = JWTManager(app)

# ------------------

@socketio.on("connect")
def handle_connect():
    print("Socket connected")

@socketio.on("disconnect")
def handle_disconnect():
    print("Socket disconnected")

@socketio.on("image_data")
def face_detection(data):
    try:
        from facial_detection import handle_image
        img_base64 = handle_image(data)
        emit("processed_frames", {"image": "detected"+img_base64})

    except Exception as e:
        print(f"Error in face_detection: {str(e)}")



if __name__ == "__main__":
    host = "127.0.0.1"
    port = 8001
    debug = True
    socketio.run(app, host=host, port=port, debug=debug)

