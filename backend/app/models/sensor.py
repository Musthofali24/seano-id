from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.database import Base

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)             # ex: GPS, CTD
    code = Column(String(10), unique=True, nullable=False) # ex: GPGGA, CTD01
    description = Column(Text)
    unit = Column(String(50))                              # ex: m, °C, PSU
    data_format = Column(JSONB)                            # ex: {"lat": "float", "lon": "float"}
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())