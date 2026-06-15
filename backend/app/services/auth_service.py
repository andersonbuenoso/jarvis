import base64
import hashlib
import hmac
import json
import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.models.user import User
from app.models.user import UserRole
from app.repositories import user_repository

settings = get_settings()
security = HTTPBearer(auto_error=False)


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 240_000)
    return f"pbkdf2_sha256${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, salt_b64, digest_b64 = stored_hash.split("$", 2)
    except ValueError:
        return False
    if algorithm != "pbkdf2_sha256":
        return False
    expected = hash_password(password, base64.urlsafe_b64decode(salt_b64.encode())).split("$", 2)[2]
    return hmac.compare_digest(expected, digest_b64)


def ensure_admin_user(db: Session) -> None:
    if not settings.admin_username or not settings.admin_password:
        return
    existing = user_repository.get_by_username(db, settings.admin_username)
    if existing:
        return
    user_repository.create_admin(db, settings.admin_username, hash_password(settings.admin_password))


def login(db: Session, username: str, password: str) -> User:
    user = user_repository.get_by_username(db, username)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    return user


def create_access_token(user: User) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.auth_token_expire_minutes)
    payload = {
        "sub": str(user.id),
        "username": user.username,
        "role": role_value(user.role),
        "exp": int(expires_at.timestamp()),
    }
    raw = json.dumps(payload, separators=(",", ":")).encode()
    body = base64.urlsafe_b64encode(raw).decode()
    signature = sign(body)
    return f"{body}.{signature}"


def sign(body: str) -> str:
    secret = token_secret()
    return hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()


def token_secret() -> str:
    seed = settings.admin_password or settings.slack_signing_secret or "jarvis-local-secret"
    return hashlib.sha256(seed.encode()).hexdigest()


def decode_access_token(token: str) -> dict:
    try:
        body, signature = token.rsplit(".", 1)
        if not hmac.compare_digest(sign(body), signature):
            raise ValueError("bad signature")
        payload = json.loads(base64.urlsafe_b64decode(body.encode()))
        if int(payload["exp"]) < int(datetime.now(timezone.utc).timestamp()):
            raise ValueError("expired")
        return payload
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc


def role_value(role: UserRole | str) -> str:
    return role.value if isinstance(role, UserRole) else role


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    payload = decode_access_token(credentials.credentials)
    user = user_repository.get_by_id(db, int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
