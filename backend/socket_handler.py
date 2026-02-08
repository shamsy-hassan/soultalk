from flask_socketio import emit, join_room, leave_room, SocketIO
from database import add_message, get_user
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
            print(f"User '{username}' attempting to join room.")
            join_room(username)
            print(f"User '{username}' joined room '{username}'.")
            # Update user status
            user = get_user(username)
            emit('user_status', {'username': username, 'online': True}, broadcast=True)

    @socketio.on('leave')
    def handle_leave(data):
        username = data.get('username')
        if username:
            leave_room(username)
            emit('user_status', {'username': username, 'online': False}, broadcast=True)

    @socketio.on('send_message')
    def handle_message(data):
        try:
            from_user = data.get('from')
            to_user = data.get('to')
            message = data.get('message')
            message_id = data.get('messageId') # Retrieve messageId
            
            print(f"Received message from '{from_user}' to '{to_user}': '{message}'")
            
            # Get sender and receiver info
            sender = get_user(from_user)
            receiver = get_user(to_user)
            
            print(f"Sender found: {sender is not None}, Receiver found: {receiver is not None}")

            if not sender or not receiver:
                error_message = ""
                if not sender:
                    error_message += f"Sender '{from_user}' not found. "
                if not receiver:
                    error_message += f"Receiver '{to_user}' not found. "
                print(f"Error: {error_message}")
                emit('error', {'message': error_message.strip()})
                return
            
            # Translate message
            translated_message = translate_text(
                text=message,
                from_lang=sender['language'],
                to_lang=receiver['language']
            )
            
            # Store message in the database
            message_data = {
                'from': from_user,
                'to': to_user,
                'message': message, # Store original message
                'translated_message': translated_message # Store translated message
            }
            add_message(message_data)
            
            # Send translated message to receiver
            print(f"Emitting 'receive_message' to room '{to_user}'")
            emit('receive_message', {
                'from': from_user,
                'message': translated_message, # Receiver gets translated message
                'originalMessage': message,
                'timestamp': 'now'
            }, room=to_user)
            
            # Send original message to sender
            print(f"Emitting 'message_sent' to room '{from_user}'")
            emit('message_sent', {
                'to': to_user,
                'message': message, # Sender sees their original message
                'translatedMessage': translated_message, # But also gets the translated version for context
                'timestamp': 'now',
                'messageId': message_id # Include messageId here
            }, room=from_user)
            
        except Exception as e:
            print(f"Error handling message: {e}")
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
