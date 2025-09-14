from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VehicleBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: Optional[str] = "idle"   # idle, mission, maintenance

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    status: Optional[str]

class VehicleResponse(VehicleBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True