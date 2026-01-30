import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv

def create_app():
    load_dotenv()

    # Initialize the database and run migrations
    from database import init_db, run_migrations
    init_db()
    run_migrations()

    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'soultalk-secret-key-2024')

    # Configure CORS
    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

    # Initialize SocketIO
    socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173")

    # Import and register blueprints
    from routes import bp as main_bp
    app.register_blueprint(main_bp)

    from verification_routes import bp as verification_bp
    app.register_blueprint(verification_bp)

    # Initialize socket handlers
    from socket_handler import init_sockets
    init_sockets(socketio)

    return app, socketio

if __name__ == '__main__':
    app, socketio = create_app()
    print("Starting server...")
    socketio.run(app, debug=True, port=5000)
