from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    pseudo = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Integer, default=0) 

class Bar(Base):
    __tablename__ = "bars"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(String)
    phone = Column(String)
    standard_hours = Column(String)
    hh_hours = Column(String)
    tags = Column(String)
    image_url = Column(String, nullable=True)
    status = Column(String, default="pending") 
    original_bar_id = Column(Integer, ForeignKey("bars.id"), nullable=True)

    menus = relationship("Menu", back_populates="bar")

class Menu(Base):
    __tablename__ = "menus"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True)
    normal_price = Column(Float)
    hh_price = Column(Float)
    bar_id = Column(Integer, ForeignKey("bars.id"))

    bar = relationship("Bar", back_populates="menus")