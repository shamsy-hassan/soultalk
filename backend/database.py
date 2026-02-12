import sqlite3
import os
from flask import current_app, g

def get_db_connection():
    """Establishes a connection to the database."""
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

def init_db():
    """Initializes the database and creates the users table if it doesn't exist."""
    db = get_db_connection()
    cursor = db.cursor()

    # Ensure the instance directory exists
    db_dir = os.path.dirname(current_app.config['DATABASE'])
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)

    # Check if the 'users' table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    table_exists = cursor.fetchone()

    if not table_exists:
        print("Creating 'users' table as it doesn't exist.")
        cursor.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                language TEXT NOT NULL,
                online BOOLEAN NOT NULL,
                phone TEXT UNIQUE,
                email TEXT UNIQUE
            )
        ''')

        db.commit()

    # Check if the 'messages' table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='messages'")
    table_exists = cursor.fetchone()

    if not table_exists:
        print("Creating 'messages' table as it doesn't exist.")
        cursor.execute('''
            CREATE TABLE messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_user TEXT NOT NULL,
                to_user TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        db.commit()
        print("'messages' table created successfully.")
    
def add_user(user):
    """Adds a new user to the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            'INSERT INTO users (username, language, online) VALUES (?, ?, ?)',
            (user['username'], user['language'], user['online'])
        )
        conn.commit()
    except sqlite3.IntegrityError:
        # User already exists
        pass
    # No close_db here as it's handled by app context teardown

def get_user(username):
    """Retrieves a user from the database by username (case-insensitive)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username COLLATE NOCASE = ?', (username,))
    user = cursor.fetchone()
    # No close_db here as it's handled by app context teardown
    return user

def get_all_users():
    """Retrieves all users from the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()
    # No close_db here as it's handled by app context teardown
    return users

def add_message(message):
    """Adds a new message to the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            'INSERT INTO messages (from_user, to_user, message, translated_text) VALUES (?, ?, ?, ?)',
            (message['from'], message['to'], message['message'], message.get('translated_message'))
        )
        conn.commit()
    finally:
        # No close_db here as it's handled by app context teardown
        pass

def get_messages_between(user1, user2):
    """Retrieves all messages between two users from the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''SELECT * FROM messages 
           WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)
           ORDER BY timestamp ASC''',
        (user1, user2, user2, user1)
    )
    messages = cursor.fetchall()
    # No close_db here as it's handled by app context teardown
    return [dict(row) for row in messages]

def update_user_status(username, online):
    """Updates the online status of a user in the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET online = ? WHERE username = ?', (online, username))
    conn.commit()
    # No close_db here as it's handled by app context teardown

def update_user(username, language=None, phone=None, email=None):
    """Updates user details in the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    updates = []
    params = []

    if language is not None:
        updates.append('language = ?')
        params.append(language)
    if phone is not None:
        updates.append('phone = ?')
        params.append(phone)
    if email is not None:
        updates.append('email = ?')
        params.append(email)
    
    if not updates:
        # No close_db here as it's handled by app context teardown
        return False # No updates to perform

    query = f"UPDATE users SET {', '.join(updates)} WHERE username = ?"
    params.append(username)

    try:
        cursor.execute(query, tuple(params))
        conn.commit()
        return cursor.rowcount > 0
    except sqlite3.IntegrityError:
        # Handle cases where phone or email might already exist if UNIQUE constraint is violated
        return False
    finally:
        # No close_db here as it's handled by app context teardown
        pass

def delete_user(username):
    """Deletes a user from the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM users WHERE username = ?', (username,))
    conn.commit()
    # No close_db here as it's handled by app context teardown
    return cursor.rowcount > 0

def delete_message(message_id):
    """Deletes a message from the database by its ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM messages WHERE id = ?', (message_id,))
    conn.commit()
    # No close_db here as it's handled by app context teardown
    return cursor.rowcount > 0

def run_migrations():
    """Applies database schema migrations."""
    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if the 'users' table exists
    try:
        cursor.execute("PRAGMA table_info(users)")
        columns_info = cursor.fetchall()
        if not columns_info: # No table found
             # No close_db here as it's handled by app context teardown
             return
        columns = [row['name'] for row in columns_info]
    except sqlite3.OperationalError:
        # If the table doesn't exist, there's nothing to migrate.
        # No close_db here as it's handled by app context teardown
        return

    # Migration for 'phone' column
    if 'phone' not in columns:
        print("Applying migration: Adding 'phone' column to 'users' table.")
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN phone TEXT UNIQUE")
            conn.commit()
            print("Migration for 'phone' column successful.")
        except sqlite3.OperationalError as e:
            print(f"Error migrating 'phone' column: {e}")

    # Migration for 'email' column
    if 'email' not in columns:
        print("Applying migration: Adding 'email' column to 'users' table.")
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN email TEXT")
            conn.commit()
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email)")
            conn.commit()
            print("Migration for 'email' column successful.")
        except sqlite3.OperationalError as e:
            print(f"Error migrating 'email' column: {e}")

    # Migration for 'translated_text' column in 'messages' table
    try:
        cursor.execute("PRAGMA table_info(messages)")
        message_columns_info = cursor.fetchall()
        message_columns = [row['name'] for row in message_columns_info]

        if 'translated_text' not in message_columns:
            print("Applying migration: Adding 'translated_text' column to 'messages' table.")
            try:
                cursor.execute("ALTER TABLE messages ADD COLUMN translated_text TEXT")
                conn.commit()
                print("Migration for 'translated_text' column successful.")
            except sqlite3.OperationalError as e:
                print(f"Error migrating 'translated_text' column: {e}")
    except sqlite3.OperationalError:
        # If the table doesn't exist, there's nothing to migrate.
        pass
        
    # Close the connection is handled by app context teardown
