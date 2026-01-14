from flask import Flask, redirect, json, request, jsonify
import mysql.connector

app = Flask(__name__)
database = 'notable_db.db'

def connect_db() -> any:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='Soraya128!',
        database = 'notable_db'
    )

    return conn

def postprocess(sql, values):

    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute(sql, values)
        conn.commit()

        return cursor.rowcount > 0
    except Exception as e:
        print("Error: " + e)
    finally:
        cursor.close()
        conn.close()

def getprocess(sql, values):

    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute(sql, values)
        results = cursor.fetchall()

        return results
    
    except Exception as e:
        print('Error: ' + e)
    
    finally:
        cursor.close()
        conn.close()

@app.route('/verifylogin')
def verify_login():
    data = request.get_json
    username = data['username']
    user_password = data['user_password']

    sql = """
        SELECT 
        username, user_password
        FROM users
        WHERE username = %s AND user_password = %s
    """

    result = getprocess(sql,[username, user_password])

    return jsonify(result)