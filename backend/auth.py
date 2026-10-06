import os
from pathlib import Path
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash


BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env")


password_hash = PasswordHash.recommended()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY is missing from backend/.env"
    )

# -------------------------------
# HASH PASSWORD
# -------------------------------

def hash_password(password: str):

    return password_hash.hash(password)


# -------------------------------
# VERIFY PASSWORD
# -------------------------------

def verify_password(
    plain_password: str,
    hashed_password: str
):

    return password_hash.verify(
        plain_password,
        hashed_password
    )


# -------------------------------
# CREATE JWT TOKEN
# -------------------------------

def create_access_token(user_id: int):

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    data = {
        "sub": str(user_id),
        "exp": expire
    }

    return jwt.encode(
        data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# -------------------------------
# READ USER ID FROM JWT
# -------------------------------

def get_user_id_from_token(token: str):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            return None

        return int(user_id)

    except (
        jwt.InvalidTokenError,
        ValueError,
        TypeError
    ):

        return None
    