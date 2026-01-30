from flask_socketio import emit, join_room, leave_room, SocketIO
from database import messages_db, add_message, get_user
from translate import translate_text

def init_sockets(socketio: SocketIO):
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')
        emit('connected', {'data': 'Connected to SoulTalk'})

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    @socketio.on('join')
    def handle_join(data):
        username = data.get('username')
        if username:
            join_room(username)
            # Update user status
            user = get_user(username)
            if user:
                user['online'] = True
            emit('user_status', {'username': username, 'online': True}, broadcast=True)

    @socketio.on('leave')
    def handle_leave(data):
        username = data.get('username')
        if username:
            leave_room(username)
            # Update user status
            user = get_user(username)
            if user:
                user['online'] = False
            emit('user_status', {'username': username, 'online': False}, broadcast=True)

    @socketio.on('send_message')
    def handle_message(data):
        try:
            from_user = data.get('from')
            to_user = data.get('to')
            message = data.get('message')
            
            # Get sender and receiver info
            sender = get_user(from_user)
            receiver = get_user(to_user)
            
            if not sender or not receiver:
                emit('error', {'message': 'User not found'})
                return
            
            # Translate message
            translated_message = translate_text(
                text=message,
                from_lang=sender['language'],
                to_lang=receiver['language']
            )
            
            # Store message
            message_data = {
                'id': len(messages_db) + 1,
                'from': from_user,
                'to': to_user,
                'originalText': message,
                'translatedText': translated_message,
                'fromLanguage': sender['language'],
                'toLanguage': receiver['language'],
                'timestamp': 'now'
            }
            add_message(message_data)
            
            # Send translated message to receiver
            emit('receive_message', {
                'from': from_user,
                'message': translated_message,
                'originalMessage': message,
                'timestamp': 'now'
            }, room=to_user)
            
            # Send original message to sender
            emit('message_sent', {
                'to': to_user,
                'message': message,
                'translatedMessage': translated_message,
                'timestamp': 'now'
            }, room=from_user)
            
        except Exception as e:
            emit('error', {'message': str(e)})

    @socketio.on('typing')
    def handle_typing(data):
        from_user = data.get('from')
        to_user = data.get('to')
        is_typing = data.get('is_typing')
        
        emit('user_typing', {
            'from': from_user,
            'is_typing': is_typing
        }, room=to_user)
