import os
from flask import Flask, send_from_directory # Import send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv

from verification_routes import UPLOAD_FOLDER # Import UPLOAD_FOLDER

def create_app():
    load_dotenv()

    # Initialize the database and run migrations
    from database import init_db, run_migrations, reset_all_user_statuses
    init_db()
    run_migrations()
    reset_all_user_statuses()

    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'soultalk-secret-key-2024')
    cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173')

    # Configure CORS
    CORS(app, resources={r"/*": {"origins": cors_origins}})

    # Initialize SocketIO
    socketio = SocketIO(app, cors_allowed_origins=cors_origins)

    # Import and register blueprints
    from routes import bp as main_bp
    app.register_blueprint(main_bp)

    from verification_routes import bp as verification_bp
    app.register_blueprint(verification_bp)

    # Serve uploaded profile pictures statically
    @app.route(f'/{UPLOAD_FOLDER}/<filename>')
    def uploaded_file(filename):
        return send_from_directory(os.path.join(app.root_path, UPLOAD_FOLDER), filename)

    # Initialize socket handlers
    from socket_handler import init_sockets
    init_sockets(socketio)

    return app, socketio

if __name__ == '__main__':
    app, socketio = create_app()
    print("Starting server...")
    debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    port = int(os.getenv('PORT', '5000'))
    socketio.run(app, host='0.0.0.0', port=port, debug=debug)
