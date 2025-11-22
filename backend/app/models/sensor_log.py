from sqlalchemy import Column, Integer, ForeignKey, DateTime, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class SensorLog(Base):
    __tablename__ = "sensor_logs"

    id = Column(Integer, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"))
    sensor_id = Column(Integer, ForeignKey("sensors.id", ondelete="CASCADE"))
    data = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        PrimaryKeyConstraint("id", "created_at"),
    )
    
    # Relationships
    vehicle = relationship("Vehicle")
    sensor = relationship("Sensor", back_populates="sensor_logs")