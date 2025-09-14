from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class SensorLogBase(BaseModel):
    vehicle_id: int
    sensor_id: int
    data: Dict[str, Any]

class SensorLogCreate(SensorLogBase):
    pass

# class SensorLogUpdate(BaseModel):
#     data: Optional[Dict[str, Any]]

class SensorLogResponse(SensorLogBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True