from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.sensor_log import SensorLog
from app.models.user import User
from app.schemas.sensor_log import SensorLogCreate, SensorLogResponse
from app.services.auth_service import get_authenticated_user
from app.services.permission_service import make_permission_checker

router = APIRouter(tags=["Sensor Logs"])

# Permission checkers
can_create_sensor_logs = make_permission_checker("sensor_logs.read")
can_read_sensor_logs = make_permission_checker("sensor_logs.read")
can_export_sensor_logs = make_permission_checker("sensor_logs.export")


@router.post("/", response_model=List[SensorLogResponse])
async def create_sensor_logs(
    logs: List[SensorLogCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_create_sensor_logs),
):
    new_logs = [SensorLog(**log.model_dump()) for log in logs]
    db.add_all(new_logs)
    await db.commit()
    for log in new_logs:
        await db.refresh(log)
    return new_logs


# Get All Logs
@router.get("/", response_model=List[SensorLogResponse])
async def get_sensor_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    vehicle_id: Optional[int] = Query(None),
    sensor_id: Optional[int] = Query(None),
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    _: bool = Depends(can_read_sensor_logs),
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
async def get_sensor_log(
    log_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_read_sensor_logs),
):
    result = await db.execute(select(SensorLog).where(SensorLog.id == log_id))
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log


# Delete log
@router.delete("/{log_id}")
async def delete_sensor_log(
    log_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    result = await db.execute(select(SensorLog).where(SensorLog.id == log_id))
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    await db.delete(log)
    await db.commit()
    return {"detail": "Sensor log deleted successfully"}
