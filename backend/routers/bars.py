from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models, database, security

router = APIRouter(prefix="/bars", tags=["bars"])

@router.get("/", response_model=List[schemas.BarResponse])
def read_bars(
    max_pint_price: float = Query(None),
    max_hh_price: float = Query(None),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Bar).filter(models.Bar.status == "approved")
    bars = crud.get_bars(db, max_pint_price=max_pint_price)
    return bars

@router.get("/pending", response_model=List[schemas.BarResponse])
def read_pending_bars(db: Session = Depends(database.get_db), admin: models.User = Depends(security.get_current_admin)):
    return db.query(models.Bar).filter(models.Bar.status == "pending").all()

@router.patch("/{bar_id}/status")
def update_status(bar_id: int, status: str, db: Session = Depends(database.get_db), admin: models.User = Depends(security.get_current_admin)):
    draft = db.query(models.Bar).filter(models.Bar.id == bar_id).first()
    if draft and status == "approved":
        if draft.original_bar_id:
            # C'est une modification : on met à jour le bar d'origine
            original = db.query(models.Bar).filter(models.Bar.id == draft.original_bar_id).first()
            if original:
                original.name, original.address, original.phone = draft.name, draft.address, draft.phone
                original.standard_hours, original.hh_hours = draft.standard_hours, draft.hh_hours
                original.tags, original.latitude, original.longitude = draft.tags, draft.latitude, draft.longitude
                if draft.image_url:
                    original.image_url = draft.image_url
            # On supprime le brouillon qui ne sert plus à rien
            db.delete(draft)
        else:
            # C'est un nouveau bar
            draft.status = status
        db.commit()
    return {"message": "Statut mis à jour"}

@router.delete("/{bar_id}")
def delete_bar(bar_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(security.get_current_admin)):
    """Supprime un bar de la base de données."""
    bar = db.query(models.Bar).filter(models.Bar.id == bar_id).first()
    if not bar:
        raise HTTPException(status_code=404, detail="Bar non trouvé")
    
    # Supprimer les menus associés s'il y en a (Cascade si configuré en ORM, ou manuellement)
    db.query(models.Menu).filter(models.Menu.bar_id == bar_id).delete()
    
    db.delete(bar)
    db.commit()
    return {"message": f"Bar {bar_id} supprimé avec succès"}