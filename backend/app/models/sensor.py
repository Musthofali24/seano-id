from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False, index=True)  # Registration code e.g. TEMP-001
    sensor_type_id = Column(Integer, ForeignKey("sensor_types.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # Owner of the sensor
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    # Relationship with sensor_type
    sensor_type = relationship("SensorType", back_populates="sensors")
    # Relationship with user
    user = relationship("User", back_populates="sensors")
    vehicle_sensors = relationship("VehicleSensor", back_populates="sensor", cascade="all, delete-orphan")
    sensor_logs = relationship("SensorLog", back_populates="sensor")