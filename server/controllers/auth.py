from flask import request, jsonify
import bcrypt
from psycopg2 import sql
import psycopg2
from werkzeug.security import generate_password_hash, check_password_hash

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
            return jsonify({"error": "Invalid user data"}), 400

        # triming and modifying
        email = email.strip()
        first_name = first_name.strip()
        last_name = last_name.strip()
        password = password.strip()
        password =  generate_password_hash(password, method='md5')

        print(email,first_name,password)

        conn=psycopg2.connect(
            user='postgres',
            password='abc',
            host='localhost',
            dbname='hr_app',
            port="5432"
        )
        cur=conn.cursor()
        # print(conn)
        # cur=conn.cursor()
        # print(cur)
        # existing_user=cur.execute("SELECT first_name FROM details WHERE email = %s",(email)).fetchone()
        # print(existing_user is None)
        # cur.close()
        # conn.close()
        # print(conn)
        # if existing_user:
        #     return jsonify({"error": "User with that email already exists"}), 409

        # Inserting
        cur.execute(
            """
                INSERT INTO details (email, password, first_name, last_name)
                VALUES (%s, %s, %s, %s)
            """,
            (email, password, first_name, last_name))
        conn.commit()
        cur.execute("select * from details")
        result=cur.fetchone()
        cur.close()
        conn.close()
        print(result)
        # # Commit changes
        # get_db().commit()

        if result:
            inserted_data = {
                "id": result[0],
                "email": result[1],
                "first_name": result[2],
                "last_name": result[3]
            }
            return jsonify({"result": inserted_data}), 201
        else:
            return jsonify({"error": "Registration failed"}), 500

    except Exception as e:
        get_db().rollback()
        return jsonify({"error": str(e)}), 500

def login():
    try:
        # Extract the data
        email = request.json.get("email")
        password = request.json.get("password")

        conn=psycopg2.connect(
            user='postgres',
            password='abc',
            host='localhost',
            dbname='hr_app',
            port="5432"
        )
        cur=conn.cursor()

        if not validate_email(email):
            return jsonify({"error": "Invalid Email"}), 400

        email = email.strip()

        cur.execute(f"SELECT email, password FROM details WHERE email = '{email}'")
        user=cur.fetchone()

        print(user)

        cur.close()
        conn.close()

        if check_password_hash(user[1], password):
            user_data = {
                "email": user[0],
            }
            return jsonify({"user": user_data}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500
