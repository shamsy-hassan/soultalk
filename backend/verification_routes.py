# backend/verification_routes.py
# Handles API endpoints for phone verification

import os # Add os import
from flask import Blueprint, request, jsonify, current_app, send_from_directory # Add send_from_directory
import jwt
import datetime
import uuid
from werkzeug.utils import secure_filename # Add secure_filename
from otp_phone_manager import (
    generate_otp, verify_otp, get_user_by_phone, get_user_by_username,
    register_number, send_otp_email, update_profile_picture, update_profile_picture_by_username,
    update_language_by_username
)
from languages_catalog import list_languages

bp = Blueprint("verification", __name__, url_prefix="/api")

UPLOAD_FOLDER = 'profile_pictures' # Define UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'} # Define ALLOWED_EXTENSIONS

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route("/check-phone", methods=["POST"])
def check_phone():
    data = request.get_json()
    phone = data.get("phone")
    if not phone:
        return jsonify({"error": "Phone number required"}), 400
    
    user = get_user_by_phone(phone)
    if user:
        user_data = dict(user)
        return jsonify({
            "registered": True, 
            "email": user_data.get("email"), 
            "username": user_data.get("username")
        }), 200
    else:
        return jsonify({"registered": False}), 200

@bp.route("/request-otp", methods=["POST"])
def request_otp():
    data = request.get_json()
    phone = data.get("phone")
    email = data.get("email")

    if not phone:
        return jsonify({"error": "Phone number required"}), 400

    # If email is not provided, check if the user is registered
    if not email:
        user = get_user_by_phone(phone)
        if user:
            user_data = dict(user)
            email = user_data.get("email")

    otp = generate_otp(phone)
    
    if email:
        sent, error_reason = send_otp_email(email, otp)
        if not sent:
            return jsonify({
                "error": "Failed to send OTP email. Please try again.",
                "details": error_reason
            }), 503
        return jsonify({"message": f"OTP sent to {email} successfully"}), 200
    else:
        print(f"OTP for {phone}: {otp}")
        return jsonify({"message": "OTP printed to console (no email provided)"}), 200

@bp.route("/verify-otp", methods=["POST"])
def verify():
    data = request.get_json()
    phone = data.get("phone")
    otp = data.get("otp")
    username = data.get("username")
    language = data.get("language")
    email = data.get("email")
    profile_picture_url = data.get("profile_picture_url") # Get profile_picture_url

    if verify_otp(phone, otp):
        user = get_user_by_phone(phone)
        if not user:
            if not all([username, language, email]):
                return jsonify({"error": "Username, language, and email are required for new users"}), 400
            register_number(phone, username, language, email, profile_picture_url) # Pass profile_picture_url
            user = get_user_by_phone(phone)

        # Generate JWT
        token = jwt.encode({
            'user_id': user['id'],
            'username': user['username'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, current_app.config['SECRET_KEY'])

        return jsonify({
            "message": "Phone verified successfully",
            "token": token,
            "user": {
                "username": user["username"],
                "language": user["language"],
                "phone": user["phone"],
                "profile_picture_url": user["profile_picture_url"]
            }
        }), 200
        
    return jsonify({"error": "Invalid or expired OTP"}), 400

@bp.route("/upload-profile-picture", methods=["POST"])
def upload_profile_picture():
    # Check if the post request has the file part
    if 'profile_picture' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['profile_picture']
    # If the user does not select a file, the browser submits an
    # empty file without a filename.
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        original_filename = secure_filename(file.filename)
        extension = original_filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{extension}"
        # Ensure the upload folder exists
        upload_path = os.path.join(current_app.root_path, UPLOAD_FOLDER)
        os.makedirs(upload_path, exist_ok=True)
        
        file_path = os.path.join(upload_path, filename)
        file.save(file_path)
        
        # Construct the URL to access the image. Assuming static files are served from /profile_pictures
        # This will need to be configured in app.py
        file_url = f"/profile_pictures/{filename}" 
        return jsonify({"message": "File uploaded successfully", "profile_picture_url": file_url}), 200
    
    return jsonify({"error": "File type not allowed"}), 400

@bp.route("/update-user-profile", methods=["POST"])
def update_user_profile():
    data = request.get_json()
    phone = data.get("phone")
    username = data.get("username")
    profile_picture_url = data.get("profile_picture_url")

    if not profile_picture_url:
        return jsonify({"error": "Profile picture URL is required"}), 400
    if not phone and not username:
        return jsonify({"error": "Phone number or username is required"}), 400
    
    # Authenticate user if necessary (e.g., check JWT token)
    # For simplicity, we'll assume the phone number is sufficient for this update
    
    if phone:
        update_profile_picture(phone, profile_picture_url)
        user = get_user_by_phone(phone)
    else:
        update_profile_picture_by_username(username, profile_picture_url)
        user = get_user_by_username(username)

    return jsonify({
        "message": "Profile updated successfully",
        "user": {
            "username": user["username"],
            "language": user["language"],
            "phone": user["phone"],
            "profile_picture_url": user["profile_picture_url"]
        }
    }), 200


@bp.route("/languages", methods=["GET"])
def get_languages():
    country_code = request.args.get("country")
    ui_only_raw = request.args.get("ui_only", "false").lower()
    ui_only = ui_only_raw in ("1", "true", "yes")

    languages = list_languages(country_code=country_code, ui_only=ui_only)
    return jsonify({"languages": languages}), 200


@bp.route("/update-user-language", methods=["POST"])
def update_user_language():
    data = request.get_json()
    username = data.get("username")
    language = data.get("language")

    if not username or not language:
        return jsonify({"error": "Username and language are required"}), 400

    user = get_user_by_username(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    update_language_by_username(username, language)
    user = get_user_by_username(username)

    return jsonify({
        "message": "Language updated successfully",
        "user": {
            "username": user["username"],
            "language": user["language"],
            "phone": user["phone"],
            "profile_picture_url": user["profile_picture_url"]
        }
    }), 200
