from flask import request
from flask_socketio import emit, join_room, leave_room, SocketIO
from database import add_message, get_user, update_user_status
from translate import translate_text

# Store socket_id to username mapping
connected_users = {}  # {socket_id: username}
user_sockets = {}     # {username: set(socket_ids)}

def init_sockets(socketio: SocketIO):
    @socketio.on('connect')
    def handle_connect(auth=None):
        print(f'Client connected: {request.sid}')
        emit('connected', {'data': 'Connected to SoulTalk'})

    @socketio.on('disconnect')
    def handle_disconnect():
        socket_id = request.sid
        print(f'Client disconnected: {socket_id}')
        
        # Clean up user tracking
        username = connected_users.pop(socket_id, None)
        if username:
            # Remove socket from user's socket set
            if username in user_sockets:
                user_sockets[username].discard(socket_id)
                if not user_sockets[username]:  # No more sockets for this user
                    del user_sockets[username]
                    # Update user status to offline
                    update_user_status(username, False)
                    emit('user_status', {'username': username, 'online': False}, broadcast=True)
                    print(f"User '{username}' is now offline")

    @socketio.on('join')
    def handle_join(data):
        username = data.get('username')
        if username:
            socket_id = request.sid
            
            print(f"User '{username}' attempting to join. Socket: {socket_id}")
            
            # Track user-socket mapping
            connected_users[socket_id] = username
            
            if username not in user_sockets:
                user_sockets[username] = set()
            user_sockets[username].add(socket_id)
            
            # Join room for targeted messages
            join_room(username)
            
            # Update user status to online
            update_user_status(username, True)
            
            print(f"User '{username}' joined successfully. Active sockets: {len(user_sockets[username])}")
            emit('user_status', {'username': username, 'online': True}, broadcast=True)

    @socketio.on('leave')
    def handle_leave(data):
        username = data.get('username')
        socket_id = request.sid
        
        if username:
            # Clean up user tracking
            if socket_id in connected_users:
                del connected_users[socket_id]
            
            if username in user_sockets:
                user_sockets[username].discard(socket_id)
                if not user_sockets[username]:
                    del user_sockets[username]
                    update_user_status(username, False)
                    emit('user_status', {'username': username, 'online': False}, broadcast=True)
            
            leave_room(username)
            print(f"User '{username}' left room")

    @socketio.on('send_message')
    def handle_message(data):
        try:
            from_user = data.get('from')
            to_user = data.get('to')
            message = data.get('message')
            message_id = data.get('messageId')
            
            print(f"Received message from '{from_user}' to '{to_user}': '{message}'")
            print(f"Active users: {list(user_sockets.keys())}")
            
            # Get sender and receiver info
            sender = get_user(from_user)
            receiver = get_user(to_user)
            
            print(f"Sender found: {sender is not None}, Receiver found: {receiver is not None}")
            print(f"Receiver sockets: {user_sockets.get(to_user, set())}")

            if not sender or not receiver:
                error_message = ""
                if not sender:
                    error_message += f"Sender '{from_user}' not found. "
                if not receiver:
                    error_message += f"Receiver '{to_user}' not found. "
                print(f"Error: {error_message}")
                emit('error', {'message': error_message.strip()}, room=request.sid)
                return
            
            # Check if receiver is online
            if to_user not in user_sockets or not user_sockets[to_user]:
                print(f"Warning: Receiver '{to_user}' is not online. Message will be stored but not delivered.")
            
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
                'message': message,
                'translated_message': translated_message
            }
            add_message(message_data)
            
            # Send translated message to receiver (if online)
            if to_user in user_sockets and user_sockets[to_user]:
                print(f"Emitting 'receive_message' to room '{to_user}'")
                emit('receive_message', {
                    'from': from_user,
                    'message': translated_message,
                    'originalMessage': message,
                    'timestamp': 'now',
                    'messageId': message_id
                }, room=to_user)
            else:
                print(f"Receiver '{to_user}' is offline. Message stored but not delivered.")
            
            # Send confirmation to sender
            print(f"Emitting 'message_sent' to socket {request.sid}")
            emit('message_sent', {
                'to': to_user,
                'message': message,
                'translatedMessage': translated_message,
                'timestamp': 'now',
                'messageId': message_id
            }, room=request.sid)
            
        except Exception as e:
            print(f"Error handling message: {e}")
            emit('error', {'message': str(e)}, room=request.sid)

    @socketio.on('typing')
    def handle_typing(data):
        from_user = data.get('from')
        to_user = data.get('to')
        is_typing = data.get('is_typing')
        
        if to_user in user_sockets and user_sockets[to_user]:
            emit('user_typing', {
                'from': from_user,
                'is_typing': is_typing
            }, room=to_user)