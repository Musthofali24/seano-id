from sqlalchemy import Column, Integer, Numeric, TIMESTAMP, func
from .database import Base

class SensorLog(Base):
    __tablename__ = "sensor_logs"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Numeric(5, 2))
    humidity = Column(Numeric(5, 2))
    created_at = Column(TIMESTAMP, server_default=func.now())
