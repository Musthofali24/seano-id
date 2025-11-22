from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VehicleBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: Optional[str] = "idle"  # idle, on_mission, maintenance, offline


class VehicleCreate(BaseModel):
    name: str
    code: Optional[str] = None  # Auto-generate if not provided
    description: Optional[str] = None
    status: Optional[str] = "idle"
    # user_id will be auto-assigned from current_user in the route


class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    user_id: Optional[int] = None


class VehicleResponse(BaseModel):
    id: int
    code: str  # Always returned in response, required
    name: str
    description: Optional[str] = None
    status: str
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True
