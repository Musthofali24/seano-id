from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.sensor_log import SensorLog
from app.schemas.sensor_log import (
    SensorLogCreate,
    SensorLogResponse
)

router = APIRouter(prefix="/sensor-logs", tags=["Sensor Logs"])

# Create Sensor Log
@router.post("/", response_model=SensorLogResponse)
async def create_sensor_log(
    log:SensorLogCreate, db:AsyncSession = Depends(get_db)
) :
    new_log = SensorLog(**log.dict())
    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)
    return new_log

# Get All Logs
@router.get("/", response_model=List[SensorLogResponse])
async def get_sensor_logs(
    db: AsyncSession = Depends(get_db),
    vehicle_id: Optional[int] = Query(None),
    sensor_id: Optional[int] = Query(None),
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
):
    query = select(SensorLog)

    if vehicle_id:
        query = query.where(SensorLog.vehicle_id == vehicle_id)
    if sensor_id:
        query = query.where(SensorLog.sensor_id == sensor_id)
    if start:
        query = query.where(SensorLog.created_at >= start)
    if end:
        query = query.where(SensorLog.created_at <= end)

    result = await db.execute(query.order_by(SensorLog.created_at.desc()))
    return result.scalars().all()

# Get Sensor log by ID
@router.get("/{log_id}", response_model=SensorLogResponse)
async def get_sensor_log(log_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SensorLog).where(SensorLog.id == log_id))
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log

# Delete log
@router.delete("/{log_id}")
async def delete_sensor_log(log_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SensorLog).where(SensorLog.id == log_id))
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    await db.delete(log)
    await db.commit()
    return {"detail": "Sensor log deleted successfully"}