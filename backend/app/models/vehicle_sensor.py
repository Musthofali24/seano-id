from sqlalchemy import Column, Integer, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class VehicleSensor(Base):
    """
    Junction table for Many-to-Many relationship between Vehicles and Sensors.
    Tracks which sensors are installed on which vehicles and their connection status.
    """
    __tablename__ = "vehicle_sensors"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(
        Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sensor_id = Column(
        Integer, ForeignKey("sensors.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    # Connection tracking
    last_seen_at = Column(
        DateTime(timezone=True), nullable=True
    )  # Last time sensor sent data via MQTT
    
    # Installation status
    is_installed = Column(
        Boolean, default=True, nullable=False
    )  # Whether sensor is currently installed
    
    # Timestamps
    installed_at = Column(DateTime(timezone=True), server_default=func.now())
    removed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="vehicle_sensors")
    sensor = relationship("Sensor", back_populates="vehicle_sensors")
