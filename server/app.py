from flask import Flask
from flask_socketio import SocketIO, emit
from datetime import timedelta
# ====--------------------------
from flask_cors import CORS
from flask_jwt_extended import JWTManager
# ====--------------
from controllers.auth import register, login
from controllers.user_responses import save_video
from controllers.quiz import get_quiz
from db import connect_db, close_db, db_exists,create_db
from disc_scoring import disc_score

app = Flask(__name__)
CORS(app)

app.config['JWT_SECRET_KEY'] = 'random-string-which-should-not-be-visible-here'
app.config['JWT_EXPIRATION_DELTA'] = timedelta(hours=4)
jwt = JWTManager(app)


app.before_request(connect_db)
app.teardown_request(close_db)

app.route('/user/register', methods=['POST'])(register)
app.route('/user/login', methods=['POST'])(login)
app.route('/user/user-responses/video', methods=['POST'])(save_video)
# app.route('/user/user-responses/audio', methods=['POST'])(save_audio)

app.add_url_rule('/quiz', 'quiz', get_quiz, methods=['GET'])
# app.route('/')
app.route('/api/processing', methods=['POST'])(disc_score)
if __name__ == "__main__":
    host = "127.0.0.1"
    port = 8000
    debug = True
    app.run(host=host, port=port, debug=debug)