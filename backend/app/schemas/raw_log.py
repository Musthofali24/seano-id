from pydantic import BaseModel
from datetime import datetime

class RawLogBase(BaseModel):
    logs: str

class RawLogCreate(RawLogBase):
    pass

class RawLogResponse(RawLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True