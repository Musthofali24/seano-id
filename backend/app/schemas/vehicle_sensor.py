# app/schemas/vehicle_sensor.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VehicleSensorBase(BaseModel):
    vehicle_id: int
    sensor_id: int


class VehicleSensorCreate(BaseModel):
    """Schema for assigning a sensor to a vehicle"""
    sensor_id: int


class VehicleSensorResponse(VehicleSensorBase):
    id: int
    last_seen_at: Optional[datetime] = None
    is_installed: bool
    installed_at: datetime
    removed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class VehicleSensorWithDetails(BaseModel):
    """Schema for vehicle-sensor with sensor details"""
    id: int
    vehicle_id: int
    sensor_id: int
    sensor_code: str
    sensor_name: str
    sensor_type_name: str
    last_seen_at: Optional[datetime] = None
    is_installed: bool
    installed_at: datetime
    removed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class VehicleSensorStatus(BaseModel):
    """Schema for real-time sensor status"""
    vehicle_id: int
    vehicle_code: str
    sensor_id: int
    sensor_code: str
    sensor_name: str
    status: str  # "connected" or "disconnected"
    last_seen_at: Optional[datetime] = None
    last_seen_seconds_ago: Optional[int] = None
