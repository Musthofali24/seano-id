# app/schemas/sensor.py
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class SensorBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

class SensorCreate(SensorBase):
    pass

class SensorUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]

class SensorResponse(SensorBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
