from flask_socketio import emit, join_room, leave_room, SocketIO
from flask import request
from database import add_message, get_user, get_messages_between, update_user_status
from translate import translate_text

def init_sockets(socketio: SocketIO):
    sid_to_user = {}
    user_connection_counts = {}

    def set_user_online(username):
        update_user_status(username, True)
        emit('user_status', {'username': username, 'online': True}, broadcast=True)

    def set_user_offline(username):
        update_user_status(username, False)
        emit('user_status', {'username': username, 'online': False}, broadcast=True)

    def decrement_connection(username):
        current_count = user_connection_counts.get(username, 0) - 1
        if current_count <= 0:
            user_connection_counts.pop(username, None)
            set_user_offline(username)
        else:
            user_connection_counts[username] = current_count

    @socketio.on('connect')
    def handle_connect():
        print('Client connected')
        emit('connected', {'data': 'Connected to SoulTalk'})

    @socketio.on('disconnect')
    def handle_disconnect():
        sid = request.sid
        username = sid_to_user.pop(sid, None)
        if username:
            decrement_connection(username)
        print('Client disconnected')

    @socketio.on('join')
    def handle_join(data):
        username = data.get('username')
        sid = request.sid
        if not username:
            return

        previous_username = sid_to_user.get(sid)
        if previous_username and previous_username != username:
            decrement_connection(previous_username)

        sid_to_user[sid] = username
        join_room(username)

        current_count = user_connection_counts.get(username, 0) + 1
        user_connection_counts[username] = current_count
        if current_count == 1:
            set_user_online(username)

    @socketio.on('leave')
    def handle_leave(data):
        sid = request.sid
        username = data.get('username') or sid_to_user.get(sid)
        if not username:
            return

        leave_room(username)

        if sid_to_user.get(sid) == username:
            sid_to_user.pop(sid, None)

        decrement_connection(username)

    @socketio.on('send_message')
    def handle_message(data):
        try:
            from_user = data.get('from')
            to_user = data.get('to')
            message = data.get('message')
            message_id = data.get('messageId')
            
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
            
            # Store message in the database
            message_data = {
                'from': from_user,
                'to': to_user,
                'message': message, # Store original message
                'translated_message': translated_message # Store translated message
            }
            add_message(message_data)
            
            # Send translated message to receiver
            emit('receive_message', {
                'from': from_user,
                'to': to_user,
                'messageId': message_id,
                'message': translated_message, # Receiver gets translated message
                'originalMessage': message,
                'timestamp': 'now'
            }, room=to_user)
            
            # Send original message to sender
            emit('message_sent', {
                'from': from_user,
                'to': to_user,
                'messageId': message_id,
                'message': message, # Sender sees their original message
                'translatedMessage': translated_message, # But also gets the translated version for context
                'timestamp': 'now'
            }, room=from_user)

            # If receiver got the payload via socket, mark as delivered for sender UI.
            emit('message_delivered', {
                'from': from_user,
                'to': to_user,
                'messageId': message_id
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

    @socketio.on('request_message_history')
    def handle_request_message_history(data):
        try:
            user1 = data.get('user1')
            user2 = data.get('user2')
            
            if not user1 or not user2:
                emit('error', {'message': 'Both users are required to fetch message history'})
                return
            
            messages = get_messages_between(user1, user2)
            
            # Emit messages back to the requesting user (user1)
            emit('message_history', {'messages': messages, 'chatPartner': user2}, room=user1)
            
        except Exception as e:
            emit('error', {'message': str(e)})

    @socketio.on('mark_messages_read')
    def handle_mark_messages_read(data):
        try:
            reader = data.get('reader')
            sender = data.get('sender')
            if not reader or not sender:
                emit('error', {'message': 'reader and sender are required for read receipts'})
                return

            # Notify the original sender that their messages to `reader` were seen.
            emit('message_read', {
                'reader': reader,
                'sender': sender
            }, room=sender)
        except Exception as e:
            emit('error', {'message': str(e)})
