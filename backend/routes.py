from flask import Blueprint, request, jsonify
import smtplib
import ssl
from email.message import EmailMessage

from database import get_user, add_user, get_all_users, get_chat_partners
from config import EMAIL_HOST, EMAIL_PORT, EMAIL_ADDRESS, EMAIL_PASSWORD, FEEDBACK_TO_EMAIL
from translate import translate_text

bp = Blueprint('main', __name__, url_prefix='/api')


def send_feedback_email(to_email, username, sender_email, category, original_message, translated_message, sender_language='auto'):
    if not EMAIL_HOST or not EMAIL_PORT or not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print("Email credentials not fully set. Feedback email sending is disabled.")
        return False

    msg = EmailMessage()
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = to_email
    msg['Subject'] = f"SoulTalk Feedback: {category}"

    body = f"""
New feedback received from SoulTalk.

User: {username}
Sender email: {sender_email or 'Not provided'}
Category: {category}
Sender language: {sender_language}

Message (English):
{translated_message}

Original message:
{original_message}
"""
    msg.set_content(body)

    context = ssl.create_default_context()
    try:
        if EMAIL_PORT == 587:
            with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
                server.starttls(context=context)
                server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                server.send_message(msg)
        elif EMAIL_PORT == 465:
            with smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT, context=context) as server:
                server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                server.send_message(msg)
        else:
            print(f"Unsupported SMTP port {EMAIL_PORT}. Please use 465 or 587.")
            return False

        print(f"Feedback email sent to {to_email}.")
        return True
    except Exception as e:
        print(f"Error sending feedback email to {to_email}: {e}")
        return False

@bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        language = data.get('language')
        
        if not username or not language:
            return jsonify({'error': 'Username and language are required'}), 400
        
        # Check if username exists
        if get_user(username):
            return jsonify({'error': 'Username already exists'}), 400
        
        # Add new user
        user = {
            'username': username,
            'language': language,
            'online': True
        }
        add_user(user)
        
        # Retrieve the user to get the ID
        new_user = get_user(username)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': new_user['id'],
                'username': new_user['username'],
                'language': new_user['language']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/users', methods=['GET'])
def get_users():
    try:
        current_user = request.args.get('current_user')
        
        all_users = get_all_users()
        
        # Return all users except the current one
        filtered_users = [
            {key: user[key] for key in user.keys()} for user in all_users 
            if user['username'] != current_user
        ]
        
        return jsonify({'users': filtered_users}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/user/<username>', methods=['GET'])
def get_user_details(username):
    user = get_user(username)
    if user:
        return jsonify({key: user[key] for key in user.keys()})
    return jsonify({'error': 'User not found'}), 404

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'SoulTalk API is running!'}), 200


@bp.route('/chats', methods=['GET'])
def get_chats():
    try:
        current_user = request.args.get('current_user')
        if not current_user:
            return jsonify({'error': 'current_user is required'}), 400

        chats = get_chat_partners(current_user)
        return jsonify({'chats': chats}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.get_json() or {}
        message = (data.get('message') or '').strip()
        category = (data.get('category') or 'general').strip()
        email = (data.get('email') or '').strip()
        username = (data.get('username') or 'anonymous').strip()
        sender_language = (data.get('language') or 'auto').strip()

        if not message:
            return jsonify({'error': 'message is required'}), 400

        translated_message = translate_text(message, sender_language or 'auto', 'en')

        email_sent = send_feedback_email(
            to_email=FEEDBACK_TO_EMAIL,
            username=username,
            sender_email=email,
            category=category,
            original_message=message,
            translated_message=translated_message,
            sender_language=sender_language or 'auto'
        )

        print(
            "[FEEDBACK] "
            f"user={username} category={category} email={email} "
            f"language={sender_language} delivered={email_sent}"
        )

        if not email_sent:
            return jsonify({'error': 'Feedback could not be delivered by email'}), 500

        return jsonify({'message': 'Feedback sent successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
