import psycopg2
from flask import g
from psycopg2 import sql
from psycopg2.errors import OperationalError
user = 'postgres'
password = '1234'
host = 'localhost'
dbname = 'hr_app'

def db_exists():
    try:
        conn = psycopg2.connect(
            user=user,
            password=password,
            host=host,
            dbname=dbname
        )

        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname='hr_app'")
        exists = cur.fetchone()

        cur.close()
        conn.close()

        return exists is not None

    except OperationalError as e:
        print(f"Error: {e}")
        return False


def create_db(exists=False):
    try:
        if not exists:
            # Establish a new connection to PostgreSQL without specifying a database
            conn = psycopg2.connect(
                user=user,
                password=password,
                host=host,
            )

            # Create a cursor for the new connection
            cur = conn.cursor()
            conn.autocommit = True

            # Create the 'hr_app' database
            cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier('hr_app')))
            print("Database 'hr_app' created successfully.")

            cur.close()
            conn.close()

            conn = psycopg2.connect(
                user=user,
                password=password,
                host=host,
                dbname = 'hr_app'
            )
            
            cur = conn.cursor()            

            with open('db.psql', 'r') as file:
                sql_queries = file.read()

            cur.execute(sql_queries)
            print("Tables created successfully.")

            # Commit the changes and close the connection
            conn.commit()
            cur.close()
            conn.close()

    except OperationalError as e:
        print(f"Error: {e}")


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        g._database = db = psycopg2.connect(
             user=user,
            password=password,
            host=host,
            dbname=dbname
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
exists = db_exists()
if not exists:
    create_db()

