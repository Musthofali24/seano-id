from sqlalchemy import Column, Integer, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class VehicleSensor(Base):
    __tablename__ = "vehicle_sensors"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sensor_id = Column(
        Integer,
        ForeignKey("sensors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    last_seen_at = Column(DateTime(timezone=True), nullable=True)
    is_installed = Column(Boolean, default=True, nullable=False)
    installed_at = Column(DateTime(timezone=True), server_default=func.now())
    removed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="vehicle_sensors")
    sensor = relationship("Sensor", back_populates="vehicle_sensors")
