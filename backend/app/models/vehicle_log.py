from sqlalchemy import Column, Integer, ForeignKey, Numeric, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class VehicleLog(Base):
    __tablename__ = "vehicle_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(
        Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False
    )

    # Battery & Power
    battery_voltage = Column(Numeric(5, 2))
    battery_current = Column(Numeric(6, 2))

    # Communication
    rssi = Column(Integer)

    # Flight Status
    mode = Column(Text)  # Flight mode (GUIDED, AUTO, MANUAL, etc)
    armed = Column(Boolean, default=False)
    guided = Column(Boolean, default=False)
    system_status = Column(Text)

    # Position (GPS)
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    altitude = Column(Numeric(8, 2))  # Altitude in meters
    gps_fix = Column(Integer)  # GPS fix type (0=no fix, 1=2D, 2=3D, etc)

    # Navigation
    heading = Column(Numeric(5, 2))  # Compass heading (0-360 degrees)
    speed = Column(Numeric(6, 2))  # Speed in m/s

    # Orientation (IMU)
    roll = Column(Numeric(6, 2))  # Roll angle in degrees
    pitch = Column(Numeric(6, 2))  # Pitch angle in degrees
    yaw = Column(Numeric(6, 2))  # Yaw angle in degrees

    # Sensors
    temperature = Column(Numeric(5, 2))  # Temperature in Celsius

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vehicle = relationship("Vehicle", back_populates="vehicle_logs")
