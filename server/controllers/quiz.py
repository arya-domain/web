from flask import jsonify
import json
from flask_jwt_extended import jwt_required

@jwt_required()
def get_quiz():
    with open("./quiz.json") as f:
        data = json.load(f)
    return jsonify(data)