import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# Database configuration
DB_PATH = os.getenv("DATABASE_PATH", "instance/users.db")

# OTP configuration
OTP_EXPIRY_SECONDS = int(os.getenv("OTP_EXPIRY_SECONDS", 300)) # Default 5 minutes
OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", 5)) # Use this for email template

# Email configuration
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")