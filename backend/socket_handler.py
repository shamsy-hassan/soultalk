import os

from flask_socketio import emit, join_room, leave_room, SocketIO
from flask import request
from database import (
    add_message,
    get_message_by_id,
    get_messages_between,
    get_user,
    is_message_editable,
    mark_message_deleted,
    update_message_text,
    update_user_status,
)
from translate import translate_text

def init_sockets(socketio: SocketIO):
    log_connections = os.getenv('SOCKET_LOG_CONNECTIONS', 'false').lower() == 'true'
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
        if log_connections:
            print('Client connected', request.sid)
        emit('connected', {'data': 'Connected to HeyBuddy'})

    @socketio.on('disconnect')
    def handle_disconnect():
        sid = request.sid
        username = sid_to_user.pop(sid, None)
        if username:
            decrement_connection(username)
        if log_connections:
            print('Client disconnected', sid, username or '')

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
            message_id = data.get('messageId')
            message_type = (data.get('messageType') or 'text').lower()
            message = data.get('message')
            media_url = data.get('mediaUrl') or data.get('mediaURL') or data.get('mediaDataUrl')
            
            # Get sender and receiver info
            sender = get_user(from_user)
            receiver = get_user(to_user)
            
            if not sender or not receiver:
                emit('error', {'message': 'User not found'})
                return

            translated_message = ''
            stored_message = ''
            stored_translated = ''

            if message_type == 'image':
                if not media_url or not isinstance(media_url, str) or not media_url.startswith('data:image/'):
                    emit('error', {'message': 'Invalid image payload'})
                    return
                # Rough payload cap to avoid accidental huge DB writes.
                if len(media_url) > 2_500_000:
                    emit('error', {'message': 'Image too large'})
                    return
                stored_message = ''
                stored_translated = ''
            else:
                message_type = 'text'
                if not message or not isinstance(message, str) or not message.strip():
                    emit('error', {'message': 'Message is required'})
                    return
                stored_message = message
                translated_message = translate_text(
                    text=message,
                    from_lang=sender['language'],
                    to_lang=receiver['language']
                )
                stored_translated = translated_message

            # Store message in the database
            message_row = add_message({
                'from': from_user,
                'to': to_user,
                'message': stored_message,
                'translated_message': stored_translated,
                'message_type': message_type,
                'media_url': media_url if message_type == 'image' else None,
            })

            if not message_row:
                emit('error', {'message': 'Failed to store message'})
                return

            db_id = message_row.get('id')
            timestamp = message_row.get('timestamp')
            edited_at = message_row.get('edited_at')
            deleted = bool(message_row.get('deleted'))

            # Send message to receiver
            emit('receive_message', {
                'id': db_id,
                'from': from_user,
                'to': to_user,
                'messageId': message_id,
                'messageType': message_type,
                'mediaUrl': media_url if message_type == 'image' else None,
                'message': stored_translated if message_type == 'text' else '',
                'originalMessage': stored_message if message_type == 'text' else '',
                'timestamp': timestamp,
                'editedAt': edited_at,
                'deleted': deleted,
            }, room=to_user)
            
            # Send message to sender
            emit('message_sent', {
                'id': db_id,
                'from': from_user,
                'to': to_user,
                'messageId': message_id,
                'messageType': message_type,
                'mediaUrl': media_url if message_type == 'image' else None,
                'message': stored_message if message_type == 'text' else '',
                'translatedMessage': stored_translated if message_type == 'text' else '',
                'timestamp': timestamp,
                'editedAt': edited_at,
                'deleted': deleted,
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

    @socketio.on('delete_message')
    def handle_delete_message(data):
        try:
            requester = data.get('from') or data.get('requester')
            message_id = data.get('messageId') or data.get('id')
            if not requester or not message_id:
                emit('error', {'message': 'from and messageId are required'})
                return

            try:
                message_id_int = int(message_id)
            except Exception:
                emit('error', {'message': 'Invalid messageId'})
                return

            msg = get_message_by_id(message_id_int)
            if not msg:
                emit('error', {'message': 'Message not found'})
                return
            if msg.get('from_user') != requester:
                emit('error', {'message': 'Not allowed'})
                return

            updated = mark_message_deleted(message_id_int)
            if not updated:
                emit('error', {'message': 'Failed to delete message'})
                return

            payload = {
                'id': updated.get('id'),
                'from': updated.get('from_user'),
                'to': updated.get('to_user'),
            }
            emit('message_deleted', payload, room=updated.get('from_user'))
            emit('message_deleted', payload, room=updated.get('to_user'))
        except Exception as e:
            emit('error', {'message': str(e)})

    @socketio.on('edit_message')
    def handle_edit_message(data):
        try:
            requester = data.get('from') or data.get('requester')
            message_id = data.get('messageId') or data.get('id')
            new_message = data.get('message') or data.get('newMessage')
            if not requester or not message_id or new_message is None:
                emit('error', {'message': 'from, messageId and message are required'})
                return

            try:
                message_id_int = int(message_id)
            except Exception:
                emit('error', {'message': 'Invalid messageId'})
                return

            msg = get_message_by_id(message_id_int)
            if not msg:
                emit('error', {'message': 'Message not found'})
                return
            if msg.get('from_user') != requester:
                emit('error', {'message': 'Not allowed'})
                return
            if msg.get('message_type') != 'text':
                emit('error', {'message': 'Only text messages can be edited'})
                return
            if not is_message_editable(msg, window_seconds=60):
                emit('error', {'message': 'Edit window has expired'})
                return

            sender = get_user(msg.get('from_user'))
            receiver = get_user(msg.get('to_user'))
            if not sender or not receiver:
                emit('error', {'message': 'User not found'})
                return

            new_message = str(new_message).strip()
            if not new_message:
                emit('error', {'message': 'Message is required'})
                return

            new_translated = translate_text(
                text=new_message,
                from_lang=sender['language'],
                to_lang=receiver['language']
            )

            updated = update_message_text(message_id_int, new_message, new_translated)
            if not updated:
                emit('error', {'message': 'Failed to edit message'})
                return

            payload = {
                'id': updated.get('id'),
                'from': updated.get('from_user'),
                'to': updated.get('to_user'),
                'messageType': updated.get('message_type') or 'text',
                'message': updated.get('message') or '',
                'translatedMessage': updated.get('translated_message') or '',
                'timestamp': updated.get('timestamp'),
                'editedAt': updated.get('edited_at'),
                'deleted': bool(updated.get('deleted')),
            }
            emit('message_edited', payload, room=updated.get('from_user'))
            emit('message_edited', payload, room=updated.get('to_user'))
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
