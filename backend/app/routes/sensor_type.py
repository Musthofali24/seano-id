# app/routes/sensor_type.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models.sensor_type import SensorType
from app.models.user import User
from app.schemas.sensor_type import SensorTypeCreate, SensorTypeUpdate, SensorTypeResponse
from app.services.auth_service import get_authenticated_user

router = APIRouter(tags=["Sensor Types"])

# Post Data
@router.post("/", response_model=SensorTypeResponse)
async def create_sensor_type(
    sensor_type: SensorTypeCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    new_sensor_type = SensorType(**sensor_type.dict())
    db.add(new_sensor_type)
    await db.commit()
    await db.refresh(new_sensor_type)
    return new_sensor_type

# Get All Data
@router.get("/", response_model=List[SensorTypeResponse])
async def get_sensor_types(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    result = await db.execute(select(SensorType))
    return result.scalars().all()

# Get Data by Id
@router.get("/{sensor_type_id}", response_model=SensorTypeResponse)
async def get_sensor_type(
    sensor_type_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    result = await db.execute(select(SensorType).where(SensorType.id == sensor_type_id))
    sensor_type = result.scalars().first()
    if not sensor_type:
        raise HTTPException(status_code=404, detail="Sensor type not found")
    return sensor_type

# Update Data
@router.put("/{sensor_type_id}", response_model=SensorTypeResponse)
async def update_sensor_type(
    sensor_type_id: int, 
    update: SensorTypeUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    result = await db.execute(select(SensorType).where(SensorType.id == sensor_type_id))
    sensor_type = result.scalars().first()
    if not sensor_type:
        raise HTTPException(status_code=404, detail="Sensor type not found")

    for key, value in update.dict(exclude_unset=True).items():
        setattr(sensor_type, key, value)

    await db.commit()
    await db.refresh(sensor_type)
    return sensor_type

# Delete Data
@router.delete("/{sensor_type_id}")
async def delete_sensor_type(
    sensor_type_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user)
):
    result = await db.execute(select(SensorType).where(SensorType.id == sensor_type_id))
    sensor_type = result.scalars().first()
    if not sensor_type:
        raise HTTPException(status_code=404, detail="Sensor type not found")

    await db.delete(sensor_type)
    await db.commit()
    return {"detail": "Sensor type deleted successfully"}