from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.vehicle_log import VehicleLog
from app.schemas.vehicle_log import VehicleLogCreate, VehicleLogResponse

router = APIRouter(tags=["Vehicle Logs"])

@router.post("/", response_model=VehicleLogResponse)
async def create_vehicle_log(log: VehicleLogCreate, db: AsyncSession = Depends(get_db)):
    new_log = VehicleLog(**log.model_dump())
    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)
    return new_log

@router.get("/", response_model=List[VehicleLogResponse])
async def get_vehicle_logs(
    db: AsyncSession = Depends(get_db),
    vehicle_id: Optional[int] = Query(None),
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    limit: int = Query(100, le=1000)
):
    query = select(VehicleLog)
    
    if vehicle_id:
        query = query.where(VehicleLog.vehicle_id == vehicle_id)
    if start:
        query = query.where(VehicleLog.created_at >= start)
    if end:
        query = query.where(VehicleLog.created_at <= end)
    
    query = query.order_by(VehicleLog.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{log_id}", response_model=VehicleLogResponse)
async def get_vehicle_log(log_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VehicleLog).where(VehicleLog.id == log_id))
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Vehicle log not found")
    return log

@router.get("/latest/{vehicle_id}", response_model=VehicleLogResponse)
async def get_latest_vehicle_log(vehicle_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(VehicleLog)
        .where(VehicleLog.vehicle_id == vehicle_id)
        .order_by(VehicleLog.created_at.desc())
        .limit(1)
    )
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="No logs found for this vehicle")
    return log

@router.delete("/{log_id}")
async def delete_vehicle_log(log_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VehicleLog).where(VehicleLog.id == log_id))
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Vehicle log not found")
    
    await db.delete(log)
    await db.commit()
    return {"detail": "Vehicle log deleted successfully"}