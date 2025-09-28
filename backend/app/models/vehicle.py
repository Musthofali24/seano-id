# app/models/vehicle.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)          # Nama kapal
    description = Column(Text)
    status = Column(String(20), default="idle")      # online, offline, on mission, maintenance
    points_id = Column(Integer, ForeignKey("points.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    point = relationship("Point", back_populates="vehicles")