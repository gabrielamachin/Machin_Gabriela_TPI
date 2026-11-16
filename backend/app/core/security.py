"""Hash de contraseñas (bcrypt vía passlib) y firma/validación del JWT (python-jose)."""
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        return _pwd_context.verify(password, hashed_password)
    except ValueError:  # hash mal formado
        return False


def create_access_token(subject: str) -> str:
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "iat": ahora,
        "exp": ahora + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    """Devuelve el 'sub' (username) si firma y expiración son válidas; si no, None."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
    sub = payload.get("sub")
    return sub if isinstance(sub, str) and sub else None
