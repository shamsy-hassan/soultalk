# backend/otp_phone_manager.py
# Handles OTP generation/verification and phone number registration

import random
import time
import sqlite3
import smtplib, ssl
from email.message import EmailMessage
from config import DB_PATH, OTP_EXPIRY_SECONDS, OTP_EXPIRY_MINUTES, EMAIL_HOST, EMAIL_PORT, EMAIL_ADDRESS, EMAIL_PASSWORD

# ------------------- OTP Functions ------------------- #
def _cleanup_expired_otps(conn):
    cursor = conn.cursor()
    cursor.execute("DELETE FROM otp_codes WHERE expires_at <= ?", (int(time.time()),))
    conn.commit()


def generate_otp(phone_number):
    """Generate a 6-digit OTP and store it in the database."""
    otp = str(random.randint(100000, 999999))
    expires_at = int(time.time()) + OTP_EXPIRY_SECONDS

    conn = sqlite3.connect(DB_PATH)
    try:
        _cleanup_expired_otps(conn)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO otp_codes (phone, otp, expires_at)
            VALUES (?, ?, ?)
            ON CONFLICT(phone) DO UPDATE SET
                otp = excluded.otp,
                expires_at = excluded.expires_at
            """,
            (phone_number, otp, expires_at),
        )
        conn.commit()
    finally:
        conn.close()

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
            with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=10) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                server.send_message(msg)
        elif EMAIL_PORT == 465: # Use SMTP_SSL for port 465
            with smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT, context=context, timeout=10) as server:
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
    """Verify OTP from database and delete it if expired or verified."""
    now = int(time.time())
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        _cleanup_expired_otps(conn)

        cursor.execute(
            "SELECT otp, expires_at FROM otp_codes WHERE phone = ?",
            (phone_number,),
        )
        row = cursor.fetchone()
        if not row:
            return False

        otp, expires_at = row
        if now >= int(expires_at):
            cursor.execute("DELETE FROM otp_codes WHERE phone = ?", (phone_number,))
            conn.commit()
            return False

        if otp_input == otp:
            cursor.execute("DELETE FROM otp_codes WHERE phone = ?", (phone_number,))
            conn.commit()
            return True

        return False
    finally:
        conn.close()

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

def get_user_by_email(email):
    """Check if the email is already in the database and return user data"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email=?", (email,))
    user = cursor.fetchone()
    conn.close()
    return user

def get_user_by_username(username):
    """Check if the username is already in the database and return user data"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username=?", (username,))
    user = cursor.fetchone()
    conn.close()
    return user

def register_number(phone_number, username, language, email, profile_picture_url=None):
    """Add a new phone number to the database, or update existing user if email matches."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    existing_user = get_user_by_email(email)

    if existing_user:
        # Update existing user
        cursor.execute(
            "UPDATE users SET phone=?, username=?, language=?, profile_picture_url=?, online=? WHERE email=?",
            (phone_number, username, language, profile_picture_url, True, email)
        )
    else:
        # Insert new user
        cursor.execute(
            "INSERT INTO users (phone, username, language, email, profile_picture_url, online) VALUES (?, ?, ?, ?, ?, ?)",
            (phone_number, username, language, email, profile_picture_url, True)
        )
    conn.commit()
    conn.close()

def update_profile_picture(phone_number, profile_picture_url):
    """Update the profile picture URL for an existing user"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET profile_picture_url = ? WHERE phone = ?", (profile_picture_url, phone_number))
    conn.commit()
    conn.close()

def update_profile_picture_by_username(username, profile_picture_url):
    """Update the profile picture URL for an existing user using username"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET profile_picture_url = ? WHERE username = ?", (profile_picture_url, username))
    conn.commit()
    conn.close()


def update_language_by_username(username, language):
    """Update a user's preferred language using username."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET language = ? WHERE username = ?", (language, username))
    conn.commit()
    conn.close()
