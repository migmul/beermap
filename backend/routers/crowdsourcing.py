from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from .. import crud, schemas, models, database
import shutil
import os
import uuid
from PIL import Image

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
    standard_hours: Optional[str] = Form("A définir"),
    hh_hours: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    bar_id: Optional[int] = Form(None),
    pint_price: Optional[float] = Form(None),
    pint_hh_price: Optional[float] = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    """Ajout participatif ou modification d'un bar."""
    image_url = None
    if image:
        filename = f"{uuid.uuid4()}.webp" # Conversion WEBP
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        # Ouverture avec Pillow, conversion RGB pour éviter les erreurs avec les PNG transparents
        img = Image.open(image.file).convert("RGB")
        img.save(filepath, "WEBP", quality=80) # Compression à 80%
        image_url = f"/static/images/{filename}"

    # --- MODE MODIFICATION ---
    if bar_id:
        db_bar = db.query(models.Bar).filter(models.Bar.id == bar_id).first()
        if db_bar:
            db_bar.name = name
            db_bar.address = address
            db_bar.phone = phone
            db_bar.standard_hours = standard_hours
            db_bar.hh_hours = hh_hours
            db_bar.tags = tags
            db_bar.latitude = latitude
            db_bar.longitude = longitude
            
            db_bar.status = "pending" 
            
            if image_url: 
                db_bar.image_url = image_url
            db.commit()
            return {"message": "Modification enregistrée et en attente de validation."}

    # --- MODE CRÉATION ---
    bar_data = schemas.BarCreate(
        name=name, 
        latitude=latitude, 
        longitude=longitude, 
        address=address,
        standard_hours=standard_hours, 
        hh_hours=hh_hours,
        tags=tags,
        phone=phone
    )
    db_bar = crud.create_bar(db, bar_data)
    
    if image_url:
        db_bar.image_url = image_url
        
    # Création du menu simplifié (Pinte) si les prix sont renseignés
    if pint_price:
        new_menu = models.Menu(
            item_name="Pinte (standard)",
            normal_price=pint_price,
            hh_price=pint_hh_price,
            bar_id=db_bar.id
        )
        db.add(new_menu)

    db.commit()

    return {"message": "Suggestion de création enregistrée avec succès"}