import psycopg2
from flask import g
from psycopg2 import sql

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        g._database = db = psycopg2.connect(
             user='postgres',
            password='root',
            host='localhost',
            dbname='hr_app'
        )
    return db

def connect_db():
    get_db()

def close_db(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def execute_query(query, values=None, fetchone=False):
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(query, values)
        result = cursor.fetchone() if fetchone else cursor.fetchall()
    return result
