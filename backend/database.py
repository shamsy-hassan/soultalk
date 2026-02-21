import sqlite3
import os
from config import DB_PATH as CONFIG_DB_PATH

# Database path
DB_PATH = CONFIG_DB_PATH

def get_db_connection():
    """Establishes a connection to the database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database and creates the users table if it doesn't exist."""
    # Ensure the instance directory exists
    db_dir = os.path.dirname(DB_PATH)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)

    conn = get_db_connection()
    cursor = conn.cursor()

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

        conn.commit()

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
                translated_message TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        print("'messages' table created successfully.")
    
    conn.close()

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
    finally:
        conn.close()

def get_user(username):
    """Retrieves a user from the database by username."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    return user

def get_all_users():
    """Retrieves all users from the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()
    conn.close()
    return users

def add_message(message_data):
    """Adds a new message to the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            'INSERT INTO messages (from_user, to_user, message, translated_message) VALUES (?, ?, ?, ?)',
            (message_data['from'], message_data['to'], message_data['message'], message_data['translated_message'])
        )
        conn.commit()
    finally:
        conn.close()

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
    conn.close()
    return [dict(row) for row in messages]

def update_user_status(username, online):
    """Updates the online status of a user in the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET online = ? WHERE username = ?', (online, username))
    conn.commit()
    conn.close()

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
             conn.close()
             return
        columns = [row['name'] for row in columns_info]
    except sqlite3.OperationalError:
        # If the table doesn't exist, there's nothing to migrate.
        conn.close()
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

    # Migration for 'profile_picture_url' column
    if 'profile_picture_url' not in columns:
        print("Applying migration: Adding 'profile_picture_url' column to 'users' table.")
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN profile_picture_url TEXT")
            conn.commit()
            print("Migration for 'profile_picture_url' column successful.")
        except sqlite3.OperationalError as e:
            print(f"Error migrating 'profile_picture_url' column: {e}")

    # Check if the 'messages' table exists before attempting to migrate it
    try:
        cursor.execute("PRAGMA table_info(messages)")
        messages_columns_info = cursor.fetchall()
        messages_columns = [row['name'] for row in messages_columns_info]

        if 'translated_message' not in messages_columns:
            print("Applying migration: Adding 'translated_message' column to 'messages' table.")
            try:
                cursor.execute("ALTER TABLE messages ADD COLUMN translated_message TEXT")
                conn.commit()
                print("Migration for 'translated_message' column successful.")
            except sqlite3.OperationalError as e:
                print(f"Error migrating 'translated_message' column: {e}")
    except sqlite3.OperationalError:
        # If the messages table doesn't exist, init_db will create it with the new schema.
        pass

    # Close the connection
    conn.close()
