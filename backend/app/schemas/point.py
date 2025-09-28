from pydantic import BaseModel
from datetime import datetime

class PointBase(BaseModel):
    name: str
    icon: str

class PointCreate(PointBase):
    pass

class PointUpdate(BaseModel):
    name: str = None
    icon: str = None

class PointResponse(PointBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True