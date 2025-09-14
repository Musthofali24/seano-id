# app/schemas/sensor.py
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class SensorBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    unit: Optional[str] = None
    data_format: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = True

class SensorCreate(SensorBase):
    pass

class SensorUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    unit: Optional[str]
    data_format: Optional[Dict[str, Any]]
    is_active: Optional[bool]

class SensorResponse(SensorBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
