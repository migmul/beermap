from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from .. import crud, schemas, models, database
import shutil
import os
import uuid

router = APIRouter(prefix="/crowdsourcing", tags=["crowdsourcing"])

UPLOAD_DIR = "backend/static/images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/suggest_bar/")
async def suggest_bar(
    name: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(...),
    phone: Optional[str] = Form(None),
    bar_id: Optional[int] = Form(None), # Gère le mode modification
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    """Ajout participatif ou modification d'un bar."""
    image_url = None
    if image:
        ext = image.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/static/images/{filename}"

    if bar_id:
        # Mode Modification : On met à jour l'existant directement (ou on pourrait créer une table "Suggestions" en attente de validation)
        db_bar = db.query(models.Bar).filter(models.Bar.id == bar_id).first()
        if db_bar:
            db_bar.name = name
            db_bar.address = address
            db_bar.phone = phone
            db_bar.latitude = latitude
            db_bar.longitude = longitude
            if image_url:
                db_bar.image_url = image_url
            db.commit()
            return {"message": "Bar modifié avec succès"}

    # Mode Création
    bar_data = schemas.BarCreate(
        name=name, latitude=latitude, longitude=longitude, address=address,
        standard_hours="A définir", phone=phone
    )
    db_bar = crud.create_bar(db, bar_data)
    
    if image_url:
        db_bar.image_url = image_url
        db.commit()

    return {"message": "Suggestion de création enregistrée avec succès"}