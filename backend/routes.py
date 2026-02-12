#backend/routes.py
from flask import Blueprint, request, jsonify
from database import get_user, add_user, get_all_users, get_messages_between, update_user, delete_user, delete_message

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

@bp.route('/user/<username>', methods=['PUT'])
def update_user_details(username):
    data = request.get_json()
    language = data.get('language')
    phone = data.get('phone')
    email = data.get('email')

    if not any([language, phone, email]):
        return jsonify({'error': 'No update data provided'}), 400

    success = update_user(username, language=language, phone=phone, email=email)
    if success:
        updated_user = get_user(username)
        return jsonify({
            'message': 'User updated successfully',
            'user': {key: updated_user[key] for key in updated_user.keys()}
        }), 200
    return jsonify({'error': 'User not found or update failed'}), 404

@bp.route('/user/<username>', methods=['DELETE'])
def delete_user_route(username):
    success = delete_user(username)
    if success:
        return jsonify({'message': 'User deleted successfully'}), 200
    return jsonify({'error': 'User not found or deletion failed'}), 404

@bp.route('/messages/<other_user>', methods=['GET'])
def get_user_messages(other_user):
    # TODO: Add authentication to get the current user
    current_user = request.args.get('current_user')
    if not current_user:
        return jsonify({'error': 'current_user parameter is required'}), 400

    messages = get_messages_between(current_user, other_user)
    return jsonify(messages)

@bp.route('/message/<int:message_id>', methods=['DELETE'])
def delete_message_route(message_id):
    success = delete_message(message_id)
    if success:
        return jsonify({'message': f'Message with ID {message_id} deleted successfully'}), 200
    return jsonify({'error': f'Message with ID {message_id} not found or deletion failed'}), 404

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'SoulTalk API is running!'}), 200
