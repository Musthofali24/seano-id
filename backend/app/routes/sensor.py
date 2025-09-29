# app/routes/sensor.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models.sensor import Sensor
from app.models.user import User
from app.schemas.sensor import SensorCreate, SensorUpdate, SensorResponse
from app.services.auth_service import get_authenticated_user

router = APIRouter(tags=["Sensors"])

# Post Data
@router.post("/", response_model=SensorResponse)
async def create_sensor(
    sensor: SensorCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    new_sensor = Sensor(**sensor.dict())
    db.add(new_sensor)
    await db.commit()
    await db.refresh(new_sensor)
    return new_sensor

# Get All Data
@router.get("/", response_model=List[SensorResponse])
async def get_sensors(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    result = await db.execute(select(Sensor))
    return result.scalars().all()

# Get Data by Id
@router.get("/{sensor_id}", response_model=SensorResponse)
async def get_sensor(
    sensor_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    result = await db.execute(select(Sensor).where(Sensor.id == sensor_id))
    sensor = result.scalars().first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor
# Update Data
@router.put("/{sensor_id}", response_model=SensorResponse)
async def update_sensor(
    sensor_id: int, 
    update: SensorUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    result = await db.execute(select(Sensor).where(Sensor.id == sensor_id))
    sensor = result.scalars().first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    for key, value in update.dict(exclude_unset=True).items():
        setattr(sensor, key, value)

    await db.commit()
    await db.refresh(sensor)
    return sensor

@router.delete("/{sensor_id}")
async def delete_sensor(
    sensor_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    result = await db.execute(select(Sensor).where(Sensor.id == sensor_id))
    sensor = result.scalars().first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    await db.delete(sensor)
    await db.commit()
    return {"detail": "Sensor deleted successfully"}
