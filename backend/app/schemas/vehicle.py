from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VehicleBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: Optional[str] = "idle"  # idle, on_mission, maintenance, offline
    user_id: int  # Required - vehicle must belong to a user


class VehicleCreate(VehicleBase):
    code: Optional[str] = None  # Auto-generate if not provided
    pass


class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    user_id: Optional[int] = None


class VehicleResponse(VehicleBase):
    id: int
    code: str  # Always returned in response, required
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
