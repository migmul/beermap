import os
import bcrypt
from datetime import datetime, timedelta
import jwt
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from . import database, models

load_dotenv()

SECRET_KEY = os.getenv("BEERMAP_SECRET_KEY", "@ukRxcbtYauaxiGdK8elNYtUnRZtLBVj4CHOBwCI0f^MCnAtsx$E&%d^cydxo@c4wPotb%w^vqHp&*Vx8luTiRPX1cKKbugZWe$&VE2Ok!PEtfugV!i25SGogJfKMX3%")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_password_hash(password: str) -> str:
    """Hash a password using pure bcrypt"""
    # bcrypt requiert des bytes, et renvoie des bytes. On decode() pour stocker un string en BDD
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using pure bcrypt"""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except ValueError:
        return False

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(days=7)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        pseudo = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token invalide")
    user = db.query(models.User).filter(models.User.pseudo == pseudo).first()
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    return user

def get_current_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.is_admin != 1:
        raise HTTPException(status_code=403, detail="Droits administrateur requis")
    return current_user