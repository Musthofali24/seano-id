from sqlalchemy import Column, Integer, ForeignKey, Numeric, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class VehicleLog(Base):
    __tablename__ = "vehicle_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    battery_voltage = Column(Numeric(5, 2))  
    battery_current = Column(Numeric(6, 2))  
    rssi = Column(Integer)  
    mode = Column(Text)  
    latitude = Column(Numeric(10, 8))  
    longitude = Column(Numeric(11, 8))
    heading = Column(Numeric(5, 2))  
    armed = Column(Boolean, default=False)  
    guided = Column(Boolean, default=False)  
    system_status = Column(Text)  
    speed = Column(Numeric(6, 2))  
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vehicle = relationship("Vehicle", back_populates="vehicle_logs")