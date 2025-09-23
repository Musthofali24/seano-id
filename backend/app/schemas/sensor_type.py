# app/schemas/sensor_type.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SensorTypeBase(BaseModel):
    name: str
    description: Optional[str] = None

class SensorTypeCreate(SensorTypeBase):
    pass

class SensorTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class SensorTypeResponse(SensorTypeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True