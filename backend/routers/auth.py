from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from .. import schemas, models, database, security

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    if db.query(models.User).filter(models.User.pseudo == user.pseudo).first():
        raise HTTPException(status_code=400, detail="Pseudo déjà pris")
    hashed_pw = security.get_password_hash(user.password)
    # Le TOUT PREMIER inscrit devient admin automatiquement !
    is_admin = 1 if db.query(models.User).count() == 0 else 0
    db_user = models.User(email=user.email, pseudo=user.pseudo, hashed_password=hashed_pw, is_admin=is_admin)
    db.add(db_user)
    db.commit()
    return {"message": "Compte créé"}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.pseudo == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Identifiants incorrects")
    token = security.create_access_token(data={"sub": user.pseudo})
    return {"access_token": token, "token_type": "bearer", "is_admin": user.is_admin}