from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from . import database, models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "@ukRxcbtYauaxiGdK8elNYtUnRZtLBVj4CHOBwCI0f^MCnAtsx$E&%d^cydxo@c4wPotb%w^vqHp&*Vx8luTiRPX1cKKbugZWe$&VE2Ok!PEtfugV!i25SGogJfKMX3%" # À sécuriser en production
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

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