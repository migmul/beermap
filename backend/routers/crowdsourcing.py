from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from .. import crud, schemas, database
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
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    """Ajout participatif d'un bar avec upload d'image statique."""
    image_url = None
    if image:
        # Génération d'un nom de fichier unique
        ext = image.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/static/images/{filename}"

    # Enregistrement simple en DB
    bar_data = schemas.BarCreate(
        name=name, latitude=latitude, longitude=longitude, address=address,
        standard_hours="A définir", phone=""
    )
    db_bar = crud.create_bar(db, bar_data)
    
    if image_url:
        db_bar.image_url = image_url
        db.commit()

    return {"message": "Suggestion enregistrée avec succès"}