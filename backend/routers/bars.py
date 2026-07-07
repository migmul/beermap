from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models, database

router = APIRouter(prefix="/bars", tags=["bars"])

@router.get("/", response_model=List[schemas.BarResponse])
def read_bars(
    max_pint_price: float = Query(None, description="Prix maximum d'une pinte"),
    db: Session = Depends(database.get_db)
):
    """Récupère la liste des bars, avec des filtres optionnels."""
    bars = crud.get_bars(db, max_pint_price=max_pint_price)
    return bars

@router.delete("/{bar_id}")
def delete_bar(bar_id: int, db: Session = Depends(database.get_db)):
    """Supprime un bar de la base de données."""
    bar = db.query(models.Bar).filter(models.Bar.id == bar_id).first()
    if not bar:
        raise HTTPException(status_code=404, detail="Bar non trouvé")
    
    # Supprimer les menus associés s'il y en a (Cascade si configuré en ORM, ou manuellement)
    db.query(models.Menu).filter(models.Menu.bar_id == bar_id).delete()
    
    db.delete(bar)
    db.commit()
    return {"message": f"Bar {bar_id} supprimé avec succès"}