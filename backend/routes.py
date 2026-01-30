from flask import Blueprint, request, jsonify
from database import get_user, add_user, get_all_users

bp = Blueprint('main', __name__, url_prefix='/api')

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
