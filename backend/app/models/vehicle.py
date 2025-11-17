# app/models/vehicle.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # Nama kapal
    code = Column(
        String(20), unique=True, nullable=False, index=True
    )  # Registration code e.g. USV-003
    description = Column(Text)
    status = Column(
        String(20), default="idle"
    )  # online, offline, on mission, maintenance
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=False
    )  # Owner of the vehicle
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", back_populates="vehicles")
    vehicle_logs = relationship(
        "VehicleLog", back_populates="vehicle", cascade="all, delete-orphan"
    )
