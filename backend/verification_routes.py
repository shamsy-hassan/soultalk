# backend/verification_routes.py
# Handles API endpoints for phone verification

from flask import Blueprint, request, jsonify, current_app
import jwt
import datetime
from otp_phone_manager import generate_otp, verify_otp, get_user_by_phone, register_number, send_otp_email

bp = Blueprint("verification", __name__, url_prefix="/api")

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
        send_otp_email(email, otp)
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

    if verify_otp(phone, otp):
        user = get_user_by_phone(phone)
        if not user:
            if not all([username, language, email]):
                return jsonify({"error": "Username, language, and email are required for new users"}), 400
            register_number(phone, username, language, email)
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
            "user": {"username": user["username"], "language": user["language"]}
        }), 200
        
    return jsonify({"error": "Invalid or expired OTP"}), 400