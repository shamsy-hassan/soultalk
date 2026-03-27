import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

def _parse_bool(value, default=False):
    if value is None:
        return default
    normalized = str(value).strip().lower()
    if normalized == "":
        return default
    return normalized in ("1", "true", "yes", "y", "on")

# Database configuration
DB_PATH = os.getenv("DATABASE_PATH", "instance/users.db")

# OTP configuration
OTP_EXPIRY_SECONDS = int(os.getenv("OTP_EXPIRY_SECONDS", 300)) # Default 5 minutes
OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", 5)) # Use this for email template

# Email configuration
EMAIL_TRANSPORT = (os.getenv("EMAIL_TRANSPORT", "auto") or "auto").strip().lower()
if EMAIL_TRANSPORT in ("resend", "http", "https", "api"):
    EMAIL_TRANSPORT = "resend_http"
if EMAIL_TRANSPORT not in ("auto", "smtp", "resend_http"):
    EMAIL_TRANSPORT = "auto"

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_ADDRESS = (os.getenv("EMAIL_ADDRESS") or "").strip()
EMAIL_FROM_ADDRESS = (os.getenv("EMAIL_FROM_ADDRESS") or EMAIL_ADDRESS).strip()
EMAIL_PASSWORD = (os.getenv("EMAIL_PASSWORD") or "").strip()
EMAIL_USE_SSL = _parse_bool(os.getenv("EMAIL_USE_SSL"), default=False)

_starttls_raw = os.getenv("EMAIL_STARTTLS")
EMAIL_STARTTLS = None if _starttls_raw is None else _parse_bool(_starttls_raw, default=False)

_fallback_ports_raw = (os.getenv("EMAIL_FALLBACK_PORTS") or "587,465").strip()
EMAIL_FALLBACK_PORTS = []
for token in _fallback_ports_raw.split(","):
    token = token.strip()
    if not token:
        continue
    try:
        port = int(token)
    except Exception:
        continue
    if port not in EMAIL_FALLBACK_PORTS:
        EMAIL_FALLBACK_PORTS.append(port)

# Email API configuration (preferred on platforms that block SMTP on free tier)
RESEND_API_KEY = (os.getenv("RESEND_API_KEY") or "").strip()
RESEND_FROM_EMAIL = (os.getenv("RESEND_FROM_EMAIL") or "").strip()
FEEDBACK_TO_EMAIL = os.getenv("FEEDBACK_TO_EMAIL", "shamsyhassan254@gmail.com")
