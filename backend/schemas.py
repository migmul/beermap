from pydantic import BaseModel
from typing import List, Optional

class MenuBase(BaseModel):
    item_name: str
    normal_price: float
    hh_price: Optional[float] = None

class MenuResponse(MenuBase):
    id: int
    class Config:
        from_attributes = True

class BarBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    phone: Optional[str] = None
    standard_hours: Optional[str] = None
    hh_hours: Optional[str] = None
    tags: Optional[str] = None

class BarCreate(BarBase):
    pass

class BarResponse(BarBase):
    id: int
    image_url: Optional[str] = None
    menus: List[MenuResponse] = []
    
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: str
    pseudo: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    is_admin: int