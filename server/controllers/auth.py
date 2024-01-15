from flask import request, jsonify
from psycopg2 import sql
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token

from db import execute_query, get_db
from utils.validate import validate_user_data , validate_email

def register():
    try:
        # Extracting data
        email = request.json.get("email")
        password = request.json.get("password")
        first_name = request.json.get("firstName")
        last_name = request.json.get("lastName")

        # Validating the data
        if not validate_user_data(email, password, first_name, last_name):
            return jsonify({"message": "Invalid user data"}), 400

        # triming and modifying
        email = email.strip()
        first_name = first_name.strip()
        last_name = last_name.strip()
        password = password.strip()
        password =  generate_password_hash(password, method='sha256')

        # Check if email already exists
        existing_user = execute_query(sql.SQL("SELECT id FROM users WHERE email = %s"), (email,), fetchone=True)

        if existing_user:
            return jsonify({"message": "User with that email already exists"}), 409

        # Inserting
        result = execute_query(
            sql.SQL("""
                INSERT INTO users (email, password, first_name, last_name)
                VALUES (%s, %s, %s, %s)
                RETURNING id, email, first_name, last_name, created_at, updated_at
            """),
            (email, password, first_name, last_name),
            fetchone=True
        )

        # Commit changes
        get_db().commit()

        if result:
            inserted_data = {
                "id": result[0],
                "email": result[1],
                "firstName": result[2],
                "lastName": result[3],
                "created_at": result[4],
                "updated_at": result[5]
            }
            return jsonify({"result": inserted_data}), 201
        else:
            return jsonify({"message": "Registration failed"}), 500

    except Exception as e:
        get_db().rollback()
        return jsonify({"message": str(e)}), 500

def login():
    try:
        # Extract the data
        email = request.json.get("email")
        password = request.json.get("password")

        if not validate_email(email):
            return jsonify({"message": "Invalid Email"}), 400

        email = email.strip()

        # Check if user exists!
        user = execute_query(sql.SQL("SELECT * FROM users WHERE email = %s"), (email,), fetchone=True)

        if user == None:
            return jsonify({"message": "Invalid credentials"}), 401
        
        access_token = create_access_token(identity=user[0])

        if check_password_hash(user[2], password):
            user_data = {
                "id": user[0],
                "email": user[1],
                "firstName":user[3],
                "lastName":user[4],
                "token": access_token
            }
            return jsonify(user_data), 200
        else:
            return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        print(e)
        return jsonify({"message": str(e)}), 500
