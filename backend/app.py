# app.py
# SoulTalk backend server

import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv

# 🔥 Load environment variables
load_dotenv()

# 🔥 Initialize SocketIO globally with Eventlet
socketio = SocketIO(
    cors_allowed_origins="http://localhost:5173",
    async_mode="eventlet",
    logger=True,
    engineio_logger=True
)

def create_app():
    """Create and configure the Flask app."""
    app = Flask(__name__)
    
    # 🔥 Flask config
    app.config.from_mapping(
        SECRET_KEY=os.getenv('SECRET_KEY', 'soultalk-secret-key-2024'),
        DATABASE=os.getenv('DATABASE_PATH', os.path.join(app.instance_path, 'users.db'))
    )

    # 🔥 Ensure instance folder exists
    os.makedirs(app.instance_path, exist_ok=True)

    # 🔥 Initialize database
    from database import init_db, run_migrations, close_db
    with app.app_context():
        init_db()
        run_migrations()

    app.teardown_appcontext(close_db)

    # 🔥 Enable CORS
    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

    # 🔥 Attach SocketIO
    socketio.init_app(app)

    return app


# 🔥 Create Flask app
app = create_app()

# 🔥 Register blueprints
from routes import bp as main_bp
app.register_blueprint(main_bp)

from verification_routes import bp as verification_bp
app.register_blueprint(verification_bp)

# 🔥 Initialize socket handlers
from socket_handler import init_sockets
init_sockets(socketio)


if __name__ == "__main__":
    print("🚀 Starting SoulTalk server on http://0.0.0.0:5000 ...")
    # 🔥 Run server with Eventlet (supports WebSockets)
    import eventlet
    import eventlet.wsgi
    eventlet.monkey_patch()
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
