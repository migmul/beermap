from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Bar(Base):
    __tablename__ = "bars"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(String)
    phone = Column(String)
    standard_hours = Column(String) # Ex: "10:00-02:00"
    hh_hours = Column(String)       # Ex: "17:00-20:00"
    tags = Column(String)           # Ex: "Terrasse, WiFi, PMR"
    image_url = Column(String, nullable=True) # Chemin vers le dossier static

    menus = relationship("Menu", back_populates="bar")

class Menu(Base):
    __tablename__ = "menus"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True)
    normal_price = Column(Float)
    hh_price = Column(Float)
    bar_id = Column(Integer, ForeignKey("bars.id"))

    bar = relationship("Bar", back_populates="menus")