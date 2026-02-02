from flask import Flask, jsonify, request, session
import mysql.connector
import smtplib
import random
from email.mime.text import MIMEText
import redis
from flask_cors import CORS


app = Flask(__name__)
app.secret_key = 'super-secret-key'
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
database = 'notable_db'

app.config.update(
    SESSION_COOKIE_SAMESITE='None',   # 'None' if you have frontend on a different domain
    SESSION_COOKIE_SECURE=False       # True only if HTTPS
)

r = redis.Redis(
    host='localhost',
    port = 6379,
    db = 0,
    decode_responses = True
)

print(r.ping())


# ---------------------------LOGIN/REGISTER ROUTES------------------------------#
# ==============================================================================#

def generate_otp():
    return str(random.randint(10000, 99999))

def store_otp(to_email, otp):
    r.set(f'otp:{to_email}', otp, ex=300)

def send_email(to_email, otp):
    my_email = 'medaleon2026@gmail.com'
    my_password = 'fcjp clcy iqzl klhd'

    message = MIMEText(f'Your Verification code is : {otp}')
    message['Subject'] = 'Verification code for Notable'
    message['From'] = my_email
    message['To'] = to_email

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(my_email, my_password)
        server.send_message(message)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data['email']
    otp = generate_otp()

    send_email(email, otp)
    store_otp(email, otp)
    
    return jsonify({'success' : True})

@app.route('/verifyemail', methods=['POST'])
def verifyemail():
    data = request.get_json()
    email = data['email']
    user_otp = data['code']
    stored_otp = r.get(f'otp:{email}')
    print(stored_otp)
    print(user_otp)

    if(stored_otp == user_otp):
        r.delete(f'otp:{email}')
        return jsonify({'success' : True})
    else:
        return jsonify({'success' : False})

@app.route('/checkemail', methods=['POST'])
def check_email():
    data = request.get_json()
    email = data['email']
    sql = f'''
        SELECT * FROM users 
        WHERE email = %s
    '''

    result = getprocess(sql, [email])

    return jsonify({'exists' : len(result) > 0})

@app.route('/checkusername', methods=['POST'])
def check_username():
    data = request.get_json()
    username = data['username']

    sql = f'''
        SELECT username from users
        WHERE username = %s
    '''

    results = getprocess(sql, [username])

    return jsonify({'exists': len(results) > 0})

@app.route('/createaccount', methods=['POST'])
def create_account():
    data = request.get_json()
    keyvalue = dict(data)
    print(keyvalue)
    keys = list(keyvalue.keys())
    values = list(keyvalue.values())
    placeholders = ['%s']*len(keys)
    stringifiedph = ','.join(placeholders)
    print(f'{len(stringifiedph)} hellow' )

    sql = f'''
            INSERT into users
            (category_id, birthday, first_name, last_name, gender, email, username, user_password)
            values ({stringifiedph})
        '''

    result = postprocess(sql, values)

    return jsonify(result)

@app.route('/get_enduser_categ_id', methods=['GET'])
def get_enduser_categ_id():
    sql = f'''
            SELECT category_id as id from user_categories
            WHERE category_name = 'end_users'
        '''
    result= getprocess(sql, [])

    return jsonify(result)

@app.route('/verifylogin', methods=['POST'])
def verify_login():
    data = request.get_json()
    username = data['username']
    user_password = data['user_password']

    username_sql = f'''
        SELECT * from users
        WHERE username = %s
    '''

    username_exists = getprocess(username_sql, [username])
    if (len(username_exists) == 0):
        return jsonify({'username_exists' : False, 'correct_password' : False})

    password_sql = f'''
        SELECT * FROM users
        WHERE username = %s AND user_password = %s
    '''

    correct_password = getprocess(password_sql, [username, user_password])
    print(correct_password[0]['user_id'])
    print('hi')
    session['user_id'] = correct_password[0]['user_id']
    user = session.get('user_id')

    print("Session contents:", dict(session))

    return jsonify({'username_exists' : True, 'correct_password' : len(correct_password) > 0, 'user_id' : correct_password[0]['user_id']})


@app.route('/isloggedin', methods=['POST'])
def is_logged_in():
    user_id = session.get('user_id')
    print(f'Session: {session.get('user_id')}')

    return jsonify(user_id)

@app.route('/test-session', methods=['GET'])
def test_session():
    session['user_id'] = 123
    return jsonify({'message': 'session set'})

# -------------------------CREATE FOLDER/ MY STACKS  ROUTES---------------------------#
# ==============================================================================#

@app.route('/getstacks', methods=['POST'])
def get_stacks():
    data = request.get_json()
    user_id = data['user_id']

    sql = f'''
        SELECT * FROM card_stack
        WHERE user_id = %s
    '''

    result = getprocess(sql, [user_id])

    return jsonify(result)

@app.route('/deletestack', methods=['POST'])
def delete_stack():
    data = request.get_json()
    stack_id = data['stack_id']
    user_id = data['user_id']

    sql = f'''
        DELETE FROM card_stack
        WHERE stack_id = %s AND user_id = %s
    '''

    result = postprocess(sql, [stack_id, user_id])

    return jsonify(result)

@app.route('/createfolder', methods=['POST'])
def create_folder():
    data = request.get_json()
    user_id = data['user_id']
    print(user_id)
    folder_name = data['folder_name']
    folder_description = data['folder_description']

    sql = f'''
            INSERT INTO folders
            (user_id, folder_name, folder_description)
            VALUES ( %s, %s, %s)
        '''
    result = postprocess(sql, [user_id, folder_name, folder_description])

    return jsonify({'success' : result})

@app.route('/getfolders', methods=['POST'])
def get_folders():
    data = request.get_json()
    user_id = data['user_id']

    sql = f'''
        SELECT * from folders
        WHERE user_id = %s
    '''

    result = getprocess(sql, [user_id])
    print("HELLO", result)
    return jsonify({'response': result})

# -------------------------- CREATE STACK ROUTES -----------------------------
# ============================================================================

@app.route('/editstack', methods=['POST'])
def edit_stack():
    data = request.get_json()
    stack_id = data['stack_id']
    title = data['title']
    description = data['description']

    # find if this stack already exists in database
    sql = f'''
        SELECT * from card_stack
        WHERE stack_id = %s
    '''

    stack_exists = getprocess(sql, [stack_id])
    print(stack_exists, stack_id)
    if stack_exists:
        sql = f'''
            UPDATE card_stack
            SET stack_title = %s , stack_description = %s
            WHERE stack_id = %s
        '''

        result = postprocess(sql, [title, description, stack_id])

        return jsonify({'updated' : result})
    return jsonify({'exists' : False})

@app.route("/createstack", methods=['POST'])
def save_stack():

    data = request.get_json()
    user_id = data['user_id']
    sql = f'''
        INSERT into card_stack
        (stack_title, stack_description, user_id)
        VALUES ('' , '', %s)
    '''

    result = postprocess(sql, [user_id])
    
    #fetch and return the most recent addition
    sql = f'''
        SELECT stack_id from card_stack
        WHERE user_id = %s
        ORDER by stack_id DESC
        LIMIT 1
    '''

    result = getprocess(sql, [user_id])
    print(result)

    return jsonify({'id' : result[0]['stack_id']})

@app.route('/getstack', methods=['POST'])
def get_stack():
    print('HI')
    try:
        data = request.get_json()
        stack_id = data['stack_id']
        user_id = data['user_id']

        sql = f'''
            SELECT stack_title, stack_description FROM card_stack
            WHERE stack_id = %s AND user_id  = %s
        '''

        result = getprocess(sql, [stack_id, user_id])

        return jsonify(result)
    except Exception as e:
        print(e)

@app.route('/addcard', methods=['POST'])
def add_card():
    data = request.get_json()
    stack_id = data['stack_id']
    user_id = data['user_id']

    sql = f'''
        INSERT INTO card_stack_questions
        (stack_id)
        VALUES (%s)
    '''

    result = postprocess(sql, [stack_id])

    sql = f'''
        SELECT card_id FROM card_stack_questions
        WHERE stack_id = %s
        ORDER BY card_id DESC
        LIMIT 1
    '''
    result = getprocess(sql, [stack_id])
    print(result)

    return jsonify({'card_id' : result[0]['card_id']})

@app.route('/editcard', methods=['POST'])
def edit_card():
    data = request.get_json()
    card_id = data['card_id']
    type = data['type']
    value = data['value']

    sql = f'''
        UPDATE card_stack_questions
        SET `{type}` = %s 
        WHERE card_id = %s
    '''

    result = postprocess(sql, [value, card_id])

    return jsonify({'success' : result})

@app.route('/getcards', methods=['POST'])
def get_cards():
    data = request.get_json()
    stack_id = data['stack_id']

    sql = f'''
        SELECT * FROM card_stack_questions
        WHERE stack_id = %s
    '''

    result = getprocess(sql, [stack_id])

    return jsonify(result)

@app.route('/deletecard', methods=['POST'])
def delete_card():
    data = request.get_json()
    card_id = data['card_id']

    sql = f'''
        DELETE FROM card_stack_questions
        WHERE card_id = %s
    '''

    result = postprocess(sql, [card_id])

    return jsonify(result)

# ========================= STUDY ROUTES ============================
# ===================================================================

@app.route('/studystack', methods=['POST'])
def study_stack():
    data = request.get_json()
    stack_id = data['stack_id']

    sql = f'''
        SELECT stack_title, stack_description  FROM card_stack
        WHERE stack_id = %s
    '''

    stack_details = getprocess(sql, [stack_id])

    sql = f'''
        SELECT * FROM card_stack_questions
        WHERE stack_id = %s
    '''

    cards = getprocess(sql, [stack_id])

    return jsonify({'stack_details' : stack_details[0], 'cards' : cards})

def connect_db() -> any:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='Soraya128!',
        database = database
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
        print(f"Error:  {e}")
    finally:
        cursor.close()
        conn.close()

def getprocess(sql, values):

    try:
        conn = connect_db()
        cursor = conn.cursor(dictionary = True)
        cursor.execute(sql, values)
        results:list = cursor.fetchall()

        return results
    
    except Exception as e:
        print(f'Error: {e}')
    
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__' :
    app.run(debug=True, use_reloader=False)