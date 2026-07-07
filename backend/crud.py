from sqlalchemy.orm import Session
from . import models, schemas

def get_bars(db: Session, max_pint_price: float = None):
    query = db.query(models.Bar).filter(models.Bar.status == "approved")
    
    if max_pint_price:
        query = query.join(models.Menu).filter(
            models.Menu.item_name.ilike("%pinte%"),
            ((models.Menu.hh_price <= max_pint_price) | (models.Menu.normal_price <= max_pint_price))
        )
    return query.all()

def create_bar(db: Session, bar: schemas.BarCreate):
    db_bar = models.Bar(**bar.model_dump())
    db.add(db_bar)
    db.commit()
    db.refresh(db_bar)
    return db_bar