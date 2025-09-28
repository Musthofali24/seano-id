from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class VehicleLogBase(BaseModel):
    vehicle_id: int
    battery_voltage: Optional[Decimal] = None
    battery_current: Optional[Decimal] = None
    rssi: Optional[int] = None
    mode: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    heading: Optional[Decimal] = None
    armed: Optional[bool] = None
    guided: Optional[bool] = None
    system_status: Optional[str] = None
    speed: Optional[Decimal] = None

class VehicleLogCreate(VehicleLogBase):
    pass

class VehicleLogResponse(VehicleLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True