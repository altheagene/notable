import json
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
import os
import mysql.connector
import smtplib
import random
from email.mime.text import MIMEText
import redis
from flask_cors import CORS

load_dotenv()
API_KEY = os.getenv('OPENROUTER_API_KEY')
client = OpenAI(api_key=API_KEY, base_url='https://openrouter.ai/api/v1')
completion = client.chat.completions.create(
    model="meta-llama/llama-3.1-8b-instruct",
    messages=[{'role': 'user', 'content': 'Hello AI!'}]
)

print(completion.choices[0].message.content)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials = True,
    allow_methods=['*'],
    allow_headers=['*']
)

database = 'notable_db'

r = redis.Redis(
    host='localhost',
    port = 6379,
    db = 0,
    decode_responses = True
)



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

@app.post('/register')
async def register(request:Request):
    data = await request.json()
    email = data['email']
    otp = generate_otp()

    send_email(email, otp)
    store_otp(email, otp)
    
    return {'success' : True}

@app.post('/verifyemail')
async def verifyemail(request:Request):
    data = await request.json()
    email = data['email']
    user_otp = data['code']
    stored_otp = r.get(f'otp:{email}')
    print(stored_otp)
    print(user_otp)

    if(stored_otp == user_otp):
        r.delete(f'otp:{email}')
        return {'success' : True}
    else:
        return {'success' : False}

@app.post('/checkemail')
async def check_email(request : Request):
    data = await request.json()
    email = data['email']
    sql = f'''
        SELECT * FROM users 
        WHERE email = %s
    '''

    result = getprocess(sql, [email])

    return {'exists' : len(result) > 0}

@app.post('/checkusername')
async def check_username(request : Request):
    data = await request.json()
    username = data['username']

    sql = f'''
        SELECT username from users
        WHERE username = %s
    '''

    results = getprocess(sql, [username])

    return {'exists': len(results) > 0}

@app.post('/createaccount')
async def create_account(request : Request):
    data = await request.json()
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

    return result

@app.get('/get_enduser_categ_id')
def get_enduser_categ_id():
    sql = f'''
            SELECT category_id as id from user_categories
            WHERE category_name = 'end_users'
        '''
    result= getprocess(sql, [])

    return result

@app.post('/verifylogin')
async def verify_login(request : Request):
    data = await request.json()
    username = data['username']
    user_password = data['user_password']

    username_sql = f'''
        SELECT * from users
        WHERE username = %s
    '''

    username_exists = getprocess(username_sql, [username])
    if (len(username_exists) == 0):
        return {'username_exists' : False, 'correct_password' : False}

    password_sql = f'''
        SELECT * FROM users
        WHERE username = %s AND user_password = %s
    '''

    correct_password = getprocess(password_sql, [username, user_password])
    print(correct_password[0]['user_id'])
    # print('hi')
    # session['user_id'] = correct_password[0]['user_id']
    # user = session.get('user_id')

    # print("Session contents:", dict(session))

    return {'username_exists' : True, 'correct_password' : len(correct_password) > 0, 'user_id' : correct_password[0]['user_id']}


# -------------------------CREATE FOLDER/ MY STACKS  ROUTES---------------------------#
# ==============================================================================#

@app.post('/api/ai')
async def ask_api(request : Request):
    data = await request.json()
    prompt = data['prompt']
    object_prompt = (
    "STRICTLY reply in valid JSON only. "
    "The JSON must have the following top-level keys: "
    "`stackTitle` (string), `stackDescription` (string), `cards` (array of objects). "
    "Each object in `cards` must have exactly two string keys: `question` and `answer`. "
    "Do not include any text outside the JSON. "
    "Generate flashcards for the topic: "
)

    completion = client.chat.completions.create(
        model="meta-llama/llama-3.1-8b-instruct",
        messages=[{'role': 'user', 'content': object_prompt + prompt}]
    )

    response = completion.choices[0].message.content
    json_str = json.loads(response)
    return {'response' : json_str}

@app.post('/getstacks')
async def get_stacks(request : Request):
    data = await request.json()
    user_id = data['user_id']

    sql = f'''
        SELECT * FROM card_stack
        WHERE user_id = %s
    '''

    result = getprocess(sql, [user_id])

    return result

@app.post('/deletestack')
async def delete_stack(request : Request):
    data = await request.json()
    stack_id = data['stack_id']
    user_id = data['user_id']

    sql=f'''

        DELETE from card_stack_questions
        WHERE stack_id = %s
    '''

    postprocess(sql, [stack_id])

    sql = f'''
        DELETE FROM card_stack
        WHERE stack_id = %s AND user_id = %s
    '''

    result = postprocess(sql, [stack_id, user_id])

    return result

@app.post('/createfolder')
async def create_folder(request : Request):
    data = await request.json()
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

    return {'success' : result}

@app.post('/getfolders')
async def get_folders(request : Request):
    data = await request.json()
    user_id = data['user_id']

    sql = f'''
        SELECT * from folders
        WHERE user_id = %s
    '''

    result = getprocess(sql, [user_id])

    return {'response': result}

# -------------------------- CREATE STACK ROUTES -----------------------------
# ============================================================================

@app.post('/editstack')
async def edit_stack(request : Request):
    data = await request.json()
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

        return {'updated' : result}
    return {'exists' : False}

@app.post("/createstack")
async def save_stack(request : Request):

    data = await request.json()
    user_id = data['user_id']
    stack_title = data['stack_title']
    stack_description = data['stack_description']
    sql = f'''
        INSERT into card_stack
        (stack_title, stack_description, user_id)
        VALUES (%s , %s, %s)
    '''

    result = postprocess(sql, [stack_title, stack_description, user_id])
    
    #fetch and return the most recent addition
    sql = f'''
        SELECT stack_id from card_stack
        WHERE user_id = %s
        ORDER by stack_id DESC
        LIMIT 1
    '''

    result = getprocess(sql, [user_id])

    return {'id' : result[0]['stack_id']}

@app.post('/getstack')
async def get_stack(request : Request):
    try:
        data = await request.json()
        stack_id = data['stack_id']
        user_id = data['user_id']

        sql = f'''
            SELECT stack_title, stack_description FROM card_stack
            WHERE stack_id = %s AND user_id  = %s
        '''

        result = getprocess(sql, [stack_id, user_id])

        return result
    except Exception as e:
        print(e)

@app.post('/add_multiple_cards')
async def add_multiple_cards(request : Request):
    try:
        data = await request.json()
        cards = data['cards']
        stack_id = data['stack_id']
        values: list = []

        for card in cards:
            row = (stack_id, card['question'], card['answer'])
            values.append(row)
    
        
        sql = f'''
                INSERT INTO card_stack_questions
                (stack_id, question, answer)
                VALUES (%s, %s, %s)
            '''
        
        bulkpostprocess(sql, values)
        
        return {'success' : True}
    except Exception as e:
        print(e)
        return {'success' : False}
    

@app.post('/addcard')
async def add_card(request : Request):
    data = await request.json()
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

    return {'card_id' : result[0]['card_id']}

@app.post('/editcard')
async def edit_card(request : Request):
    data = request.json()
    card_id = data['card_id']
    type = data['type']
    value = data['value']

    sql = f'''
        UPDATE card_stack_questions
        SET `{type}` = %s 
        WHERE card_id = %s
    '''

    result = postprocess(sql, [value, card_id])

    return {'success' : result}

@app.post('/edit_color')
async def edit_color(request : Request):
    data = await request.json()
    bg_color = data['bg_color']
    border_color = data['border_color']
    stack_id = data['stack_id']

    sql = f'''
        UPDATE card_stack
        SET  bg_color = %s, border_color = %s
        WHERE stack_id = %s
    '''

    result = postprocess(sql, [bg_color, border_color, stack_id])

    return result

@app.post('/getcards')
async def get_cards(request : Request):
    data = await request.json()
    stack_id = data['stack_id']

    sql = f'''
        SELECT * FROM card_stack_questions
        WHERE stack_id = %s
    '''

    result = getprocess(sql, [stack_id])

    return result

@app.post('/deletecard')
async def delete_card(request : Request):
    data = await request.json()
    card_id = data['card_id']

    sql = f'''
        DELETE FROM card_stack_questions
        WHERE card_id = %s
    '''

    result = postprocess(sql, [card_id])

    return result

# ========================= STUDY ROUTES ============================
# ===================================================================

@app.post('/studystack')
async def study_stack(request : Request):
    data = await request.json()
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

    return {'stack_details' : stack_details[0], 'cards' : cards}

def connect_db() -> any:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='Soraya128!',
        database = database
    )

    return conn

def bulkpostprocess(sql, values):
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.executemany(sql, values)
        conn.commit()

        return cursor.rowcount > 0
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()

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
   import uvicorn
   uvicorn.run(app, host='127.0.0.1', reload=True, port=8000)