import hmac
import hashlib
import secrets
import base64
import json
import time
from typing import Dict, Any, Optional

# Secret key for signing tokens (in production this would be loaded from env)
SECRET_KEY = "navadapt-autonomous-jwt-secret-key-sih-2026"
TOKEN_EXPIRE_SECONDS = 86400  # 24 hours

def hash_password(password: str, salt: Optional[str] = None) -> Dict[str, str]:
    """Generates a secure SHA-256 salted hash of the password."""
    if not salt:
        salt = secrets.token_hex(16)
    hash_obj = hashlib.sha256((salt + password).encode('utf-8'))
    password_hash = hash_obj.hexdigest()
    return {"salt": salt, "hash": password_hash}

def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    """Verifies a password against the stored salt and hash."""
    hash_obj = hashlib.sha256((salt + password).encode('utf-8'))
    return hmac.compare_digest(hash_obj.hexdigest(), expected_hash)

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _b64url_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def create_access_token(user_data: Dict[str, Any], expires_in: int = TOKEN_EXPIRE_SECONDS) -> str:
    """Creates a standard-compliant signed JWT token."""
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    payload = {
        **user_data,
        "iat": now,
        "exp": now + expires_in,
        "iss": "navadapt-av-system"
    }

    header_b64 = _b64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))

    signature_raw = hmac.new(
        SECRET_KEY.encode('utf-8'),
        f"{header_b64}.{payload_b64}".encode('utf-8'),
        hashlib.sha256
    ).digest()
    signature_b64 = _b64url_encode(signature_raw)

    return f"{header_b64}.{payload_b64}.{signature_b64}"

def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Verifies the JWT token signature and expiration."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts

        expected_sig = _b64url_encode(hmac.new(
            SECRET_KEY.encode('utf-8'),
            f"{header_b64}.{payload_b64}".encode('utf-8'),
            hashlib.sha256
        ).digest())

        if not hmac.compare_digest(signature_b64, expected_sig):
            return None

        payload = json.loads(_b64url_decode(payload_b64).decode('utf-8'))
        now = int(time.time())
        if payload.get("exp", 0) < now:
            return None  # Expired

        return payload
    except Exception:
        return None
