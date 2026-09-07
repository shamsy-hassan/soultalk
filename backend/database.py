import sqlite3
import os
import datetime
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
                email TEXT UNIQUE,
                profile_picture_url TEXT,
                bio TEXT
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
                message_type TEXT NOT NULL DEFAULT 'text',
                media_url TEXT,
                edited_at DATETIME,
                deleted INTEGER NOT NULL DEFAULT 0,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        print("'messages' table created successfully.")

    # Check if the 'otp_codes' table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='otp_codes'")
    otp_table_exists = cursor.fetchone()

    if not otp_table_exists:
        print("Creating 'otp_codes' table as it doesn't exist.")
        cursor.execute('''
            CREATE TABLE otp_codes (
                phone TEXT PRIMARY KEY,
                otp TEXT NOT NULL,
                expires_at INTEGER NOT NULL
            )
        ''')
        conn.commit()
        print("'otp_codes' table created successfully.")

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            favorite_username TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(username, favorite_username)
        )
    ''')
    conn.commit()
    
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
            '''
            INSERT INTO messages (
                from_user,
                to_user,
                message,
                translated_message,
                message_type,
                media_url
            ) VALUES (?, ?, ?, ?, ?, ?)
            ''',
            (
                message_data['from'],
                message_data['to'],
                message_data.get('message', '') or '',
                message_data.get('translated_message', '') or '',
                message_data.get('message_type', 'text') or 'text',
                message_data.get('media_url'),
            )
        )
        conn.commit()
        inserted_id = cursor.lastrowid
        cursor.execute('SELECT * FROM messages WHERE id = ?', (inserted_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
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

def get_message_by_id(message_id):
    """Retrieves a single message by id."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM messages WHERE id = ?', (message_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_message_text(message_id, new_message, new_translated_message):
    """Edits the message text/translation and sets edited_at."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''
        UPDATE messages
        SET message = ?, translated_message = ?, edited_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted = 0
        ''',
        (new_message, new_translated_message, message_id),
    )
    conn.commit()
    cursor.execute('SELECT * FROM messages WHERE id = ?', (message_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def mark_message_deleted(message_id):
    """Marks a message as deleted."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''
        UPDATE messages
        SET deleted = 1, message = '', translated_message = '', media_url = NULL, edited_at = NULL
        WHERE id = ?
        ''',
        (message_id,),
    )
    conn.commit()
    cursor.execute('SELECT * FROM messages WHERE id = ?', (message_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_image_media(username, limit=200):
    """Returns recent image messages sent or received by the user (excluding deleted)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''
        SELECT *
        FROM messages
        WHERE deleted = 0
          AND message_type = 'image'
          AND (from_user = ? OR to_user = ?)
        ORDER BY timestamp DESC, id DESC
        LIMIT ?
        ''',
        (username, username, limit),
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def _parse_sqlite_timestamp(ts):
    if not ts:
        return None
    # SQLite CURRENT_TIMESTAMP is "YYYY-MM-DD HH:MM:SS" in UTC.
    try:
        return datetime.datetime.strptime(ts, "%Y-%m-%d %H:%M:%S").replace(tzinfo=datetime.timezone.utc)
    except Exception:
        return None

def is_message_editable(message_row, window_seconds=60):
    """True if message is within the edit window and not deleted."""
    if not message_row or message_row.get('deleted'):
        return False
    sent_at = _parse_sqlite_timestamp(message_row.get('timestamp'))
    if not sent_at:
        return False
    now = datetime.datetime.now(datetime.timezone.utc)
    return (now - sent_at).total_seconds() <= float(window_seconds)


def get_chat_partners(username):
    """Returns users that have message history with the provided username."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''
        SELECT
            u.id,
            u.username,
            u.language,
            u.online,
            u.phone,
            u.email,
            u.profile_picture_url,
            u.bio,
            (
                SELECT
                    CASE
                        WHEN COALESCE(m2.deleted, 0) = 1 THEN '[Deleted]'
                        WHEN COALESCE(m2.message_type, 'text') = 'image' THEN '[Image]'
                        ELSE m2.message
                    END
                FROM messages m2
                WHERE (
                    (m2.from_user = ? AND m2.to_user = u.username)
                    OR (m2.from_user = u.username AND m2.to_user = ?)
                )
                ORDER BY m2.timestamp DESC, m2.id DESC
                LIMIT 1
            ) AS last_message,
            (
                SELECT m2.from_user
                FROM messages m2
                WHERE (
                    (m2.from_user = ? AND m2.to_user = u.username)
                    OR (m2.from_user = u.username AND m2.to_user = ?)
                )
                ORDER BY m2.timestamp DESC, m2.id DESC
                LIMIT 1
            ) AS last_message_from,
            MAX(m.timestamp) as last_message_at
        FROM messages m
        JOIN users u
          ON u.username = CASE
              WHEN m.from_user = ? THEN m.to_user
              ELSE m.from_user
          END
        WHERE m.from_user = ? OR m.to_user = ?
        GROUP BY u.id, u.username, u.language, u.online, u.phone, u.email, u.profile_picture_url, u.bio
        ORDER BY last_message_at DESC
        ''',
        (username, username, username, username, username, username, username)
    )
    partners = cursor.fetchall()
    conn.close()
    return [dict(row) for row in partners]

def get_favorite_users(username):
    """Returns the user's saved favorite contacts with current profile data."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''
        SELECT u.id, u.username, u.language, u.online, u.phone, u.email,
               u.profile_picture_url, u.bio, f.created_at
        FROM favorites f
        JOIN users u ON u.username = f.favorite_username
        WHERE f.username = ?
        ORDER BY f.created_at DESC
        ''',
        (username,),
    )
    favorites = cursor.fetchall()
    conn.close()
    return [dict(row) for row in favorites]

def set_favorite_user(username, favorite_username, is_favorite):
    """Adds or removes a saved favorite contact."""
    if username == favorite_username:
        raise ValueError('You cannot favorite yourself')

    conn = get_db_connection()
    cursor = conn.cursor()
    if is_favorite:
        cursor.execute(
            'INSERT OR IGNORE INTO favorites (username, favorite_username) VALUES (?, ?)',
            (username, favorite_username),
        )
    else:
        cursor.execute(
            'DELETE FROM favorites WHERE username = ? AND favorite_username = ?',
            (username, favorite_username),
        )
    conn.commit()
    conn.close()

def update_user_status(username, online):
    """Updates the online status of a user in the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET online = ? WHERE username = ?', (online, username))
    conn.commit()
    conn.close()


def reset_all_user_statuses():
    """Marks all users offline. Useful on server start to clear stale presence."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET online = 0')
    conn.commit()
    conn.close()

def run_migrations():
    """Applies database schema migrations."""
    # Connect to the database
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            favorite_username TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(username, favorite_username)
        )
    ''')
    conn.commit()

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

    # Migration for 'bio' column
    if 'bio' not in columns:
        print("Applying migration: Adding 'bio' column to 'users' table.")
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN bio TEXT")
            conn.commit()
            print("Migration for 'bio' column successful.")
        except sqlite3.OperationalError as e:
            print(f"Error migrating 'bio' column: {e}")

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

        if 'message_type' not in messages_columns:
            print("Applying migration: Adding 'message_type' column to 'messages' table.")
            try:
                cursor.execute("ALTER TABLE messages ADD COLUMN message_type TEXT NOT NULL DEFAULT 'text'")
                conn.commit()
                print("Migration for 'message_type' column successful.")
            except sqlite3.OperationalError as e:
                print(f"Error migrating 'message_type' column: {e}")

        if 'media_url' not in messages_columns:
            print("Applying migration: Adding 'media_url' column to 'messages' table.")
            try:
                cursor.execute("ALTER TABLE messages ADD COLUMN media_url TEXT")
                conn.commit()
                print("Migration for 'media_url' column successful.")
            except sqlite3.OperationalError as e:
                print(f"Error migrating 'media_url' column: {e}")

        if 'edited_at' not in messages_columns:
            print("Applying migration: Adding 'edited_at' column to 'messages' table.")
            try:
                cursor.execute("ALTER TABLE messages ADD COLUMN edited_at DATETIME")
                conn.commit()
                print("Migration for 'edited_at' column successful.")
            except sqlite3.OperationalError as e:
                print(f"Error migrating 'edited_at' column: {e}")

        if 'deleted' not in messages_columns:
            print("Applying migration: Adding 'deleted' column to 'messages' table.")
            try:
                cursor.execute("ALTER TABLE messages ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0")
                conn.commit()
                print("Migration for 'deleted' column successful.")
            except sqlite3.OperationalError as e:
                print(f"Error migrating 'deleted' column: {e}")
    except sqlite3.OperationalError:
        # If the messages table doesn't exist, init_db will create it with the new schema.
        pass

    # Migration for 'otp_codes' table
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='otp_codes'")
    otp_table_exists = cursor.fetchone()
    if not otp_table_exists:
        print("Applying migration: Creating 'otp_codes' table.")
        try:
            cursor.execute(
                '''
                CREATE TABLE otp_codes (
                    phone TEXT PRIMARY KEY,
                    otp TEXT NOT NULL,
                    expires_at INTEGER NOT NULL
                )
                '''
            )
            conn.commit()
            print("Migration for 'otp_codes' table successful.")
        except sqlite3.OperationalError as e:
            print(f"Error creating 'otp_codes' table: {e}")

    # Close the connection
    conn.close()
