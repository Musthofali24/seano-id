from sqlalchemy import Column, Integer, Text, DateTime, PrimaryKeyConstraint
from sqlalchemy.sql import func
from app.database import Base

class RawLog(Base):
    __tablename__ = "raw_logs"

    id = Column(Integer, autoincrement=True)
    logs = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        PrimaryKeyConstraint("id", "created_at"),
    )