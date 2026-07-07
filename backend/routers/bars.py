from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(prefix="/bars", tags=["bars"])

@router.get("/", response_model=List[schemas.BarResponse])
def read_bars(
    max_pint_price: float = Query(None, description="Prix maximum d'une pinte"),
    db: Session = Depends(database.get_db)
):
    """Récupère la liste des bars, avec des filtres optionnels."""
    bars = crud.get_bars(db, max_pint_price=max_pint_price)
    return bars