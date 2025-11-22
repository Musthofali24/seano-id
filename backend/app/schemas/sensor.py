# app/schemas/sensor.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SensorBase(BaseModel):
    name: str
    code: str  # Registration code e.g. TEMP-001
    sensor_type_id: int
    description: Optional[str] = None
    is_active: bool = True

class SensorCreate(SensorBase):
    pass

class SensorUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    sensor_type_id: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class SensorResponse(SensorBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
