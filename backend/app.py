try:
    # If gevent is installed, patch standard library modules early so Socket.IO
    # and any network I/O (translation, email, requests, etc.) behave correctly.
    from gevent import monkey  # type: ignore

    monkey.patch_all()
except Exception:
    pass

import os
import sys
import argparse
import subprocess
from flask import Flask, jsonify, send_from_directory # Import send_from_directory
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
    cors_origins_env = os.getenv(
        'CORS_ORIGINS',
        'https://soultalk-liard.vercel.app,http://localhost:5173'
    )
    cors_origins = [origin.strip() for origin in cors_origins_env.split(',') if origin.strip()]

    # Configure CORS
    CORS(app, resources={r"/*": {"origins": cors_origins}})

    # Initialize SocketIO
    socketio = SocketIO(
        app,
        cors_allowed_origins=cors_origins,
        async_mode='gevent',
        ping_interval=25,
        ping_timeout=60,
    )

    # Import and register blueprints
    from routes import bp as main_bp
    app.register_blueprint(main_bp)

    from verification_routes import bp as verification_bp
    app.register_blueprint(verification_bp)

    @app.route('/')
    def root():
        return jsonify({"message": "SoulTalk backend is running"}), 200

    @app.route('/healthz')
    def healthz():
        return jsonify({"status": "ok"}), 200

    # Serve uploaded profile pictures statically
    @app.route(f'/{UPLOAD_FOLDER}/<filename>')
    def uploaded_file(filename):
        return send_from_directory(os.path.join(app.root_path, UPLOAD_FOLDER), filename)

    # Initialize socket handlers
    from socket_handler import init_sockets
    init_sockets(socketio)

    return app, socketio

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Run the SoulTalk backend server.")
    parser.add_argument('--host', default=os.getenv('HOST', '0.0.0.0'))
    parser.add_argument('--port', type=int, default=int(os.getenv('PORT', '5000')))
    debug_default = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    debug_group = parser.add_mutually_exclusive_group()
    debug_group.add_argument('--debug', dest='debug', action='store_true', default=debug_default)
    debug_group.add_argument('--no-debug', dest='debug', action='store_false')
    parser.add_argument(
        '--detach',
        action='store_true',
        help='Run in the background and return to the shell.',
    )
    parser.add_argument(
        '--log-file',
        default=os.getenv('SOULTALK_LOG_FILE', '/tmp/soultalk-backend.log'),
        help='Log file path when using --detach.',
    )
    parser.add_argument(
        '--log-connections',
        action='store_true',
        default=os.getenv('SOCKET_LOG_CONNECTIONS', 'false').lower() == 'true',
        help='Log Socket.IO connect/disconnect events.',
    )
    args = parser.parse_args()

    if args.detach and os.getenv('SOULTALK_DETACHED_CHILD') != '1':
        env = os.environ.copy()
        env['PYTHONUNBUFFERED'] = '1'
        env['SOULTALK_DETACHED_CHILD'] = '1'
        env['SOCKET_LOG_CONNECTIONS'] = 'true' if args.log_connections else 'false'

        with open(args.log_file, 'ab', buffering=0) as log_fp:
            proc = subprocess.Popen(
                [
                    sys.executable,
                    os.path.abspath(__file__),
                    '--host',
                    args.host,
                    '--port',
                    str(args.port),
                    '--debug' if args.debug else '--no-debug',
                ],
                stdin=subprocess.DEVNULL,
                stdout=log_fp,
                stderr=log_fp,
                env=env,
                cwd=os.getcwd(),
                close_fds=True,
                start_new_session=True,
            )

        print(f"Started SoulTalk backend in background (pid={proc.pid}).")
        print(f"Tailing logs: tail -f {args.log_file}")
        raise SystemExit(0)

    if args.log_connections:
        os.environ['SOCKET_LOG_CONNECTIONS'] = 'true'

    app, socketio = create_app()
    print("Starting server...")
    socketio.run(app, host=args.host, port=args.port, debug=args.debug)
