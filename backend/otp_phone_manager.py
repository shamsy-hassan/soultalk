# backend/otp_phone_manager.py
# Handles OTP generation/verification and phone number registration

import random
import time
import sqlite3
import smtplib, ssl
from email.message import EmailMessage
from config import DB_PATH, OTP_EXPIRY_SECONDS, OTP_EXPIRY_MINUTES, EMAIL_HOST, EMAIL_PORT, EMAIL_ADDRESS, EMAIL_PASSWORD

# Temporary store for OTPs: {phone_number: (otp, expiry_time)}
otp_store = {}

# ------------------- OTP Functions ------------------- #
def generate_otp(phone_number):
    """Generate a 6-digit OTP and store it temporarily"""
    otp = str(random.randint(100000, 999999))
    expiry_time = time.time() + OTP_EXPIRY_SECONDS
    otp_store[phone_number] = (otp, expiry_time)
    return otp

def send_otp_email(to_email, otp_code):
    """Sends the OTP via email using Gmail SMTP."""
    if not EMAIL_HOST or not EMAIL_PORT or not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print("Email credentials not fully set. Email sending will be disabled.")
        return False

    msg = EmailMessage()
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = to_email
    msg['Subject'] = "SoulTalk OTP Verification"

    body = f"""
    Your One-Time Password (OTP) for SoulTalk is: {otp_code}

    This OTP is valid for {OTP_EXPIRY_MINUTES} minutes.
    If you did not request this, please ignore this email.
    """
    msg.set_content(body)

    context = ssl.create_default_context()

    try:
        if EMAIL_PORT == 587: # Use STARTTLS for port 587
            with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
                server.starttls(context=context)
                server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                server.send_message(msg)
        elif EMAIL_PORT == 465: # Use SMTP_SSL for port 465
            with smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT, context=context) as server:
                server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                server.send_message(msg)
        else: # Fallback for other ports or if port is not specified correctly
            print(f"Unsupported SMTP port {EMAIL_PORT}. Please use 465 or 587.")
            return False

        print(f"OTP email sent to {to_email}.")
        return True
    except Exception as e:
        print(f"Error sending OTP email to {to_email}: {e}")
        return False

def verify_otp(phone_number, otp_input):
    """Verify OTP: returns True if correct and not expired"""
    if phone_number in otp_store:
        otp, expiry = otp_store[phone_number]
        if time.time() > expiry:
            del otp_store[phone_number]
            return False  # OTP expired
        if otp_input == otp:
            del otp_store[phone_number]
            return True
    return False

# ---------------- Phone Database Functions ---------------- #
def get_user_by_phone(phone_number):
    """Check if the phone number is already in the database and return user data"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE phone=?", (phone_number,))
    user = cursor.fetchone()
    conn.close()
    return user

def register_number(phone_number, username, language, email):
    """Add a new phone number to the database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (phone, username, language, email, online) VALUES (?, ?, ?, ?, ?)", (phone_number, username, language, email, True))
    conn.commit()
    conn.close()