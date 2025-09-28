from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models.raw_log import RawLog
from app.schemas.raw_log import RawLogCreate, RawLogResponse

router = APIRouter(tags=["Raw Logs"])

@router.post("/", response_model=RawLogResponse)
async def create_raw_log(log: RawLogCreate, db: AsyncSession = Depends(get_db)):
    new_log = RawLog(**log.model_dump())
    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)
    return new_log

@router.get("/", response_model=List[RawLogResponse])
async def get_raw_logs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RawLog).order_by(RawLog.created_at.desc()))
    return result.scalars().all()

@router.get("/{log_id}", response_model=RawLogResponse)
async def get_raw_log(log_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RawLog).where(RawLog.id == log_id))
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Raw log not found")
    return log

@router.delete("/{log_id}")
async def delete_raw_log(log_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RawLog).where(RawLog.id == log_id))
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Raw log not found")
    
    await db.delete(log)
    await db.commit()
    return {"detail": "Raw log deleted successfully"}