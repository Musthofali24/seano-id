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
from app.services.permission_service import make_permission_checker

router = APIRouter(tags=["Sensors"])

# Permission checkers
can_create_sensors = make_permission_checker("sensors.create")
can_read_sensors = make_permission_checker("sensors.read")
can_update_sensors = make_permission_checker("sensors.update")
can_delete_sensors = make_permission_checker("sensors.delete")


# Post Data
@router.post("/", response_model=SensorResponse)
async def create_sensor(
    sensor: SensorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_create_sensors),
):
    # Check if code already exists
    existing = await db.execute(select(Sensor).where(Sensor.code == sensor.code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Sensor code already exists")

    new_sensor = Sensor(**sensor.dict())
    new_sensor.user_id = current_user.id  # Assign owner
    
    db.add(new_sensor)
    await db.commit()
    await db.refresh(new_sensor)
    return new_sensor


# Get All Data
@router.get("/", response_model=List[SensorResponse])
async def get_sensors(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_read_sensors),
):
    """
    Get sensors list.
    - Admin: Returns all sensors
    - User: Returns only sensors owned by them
    """
    # Check if user is admin
    is_admin = any(ur.role.name == "Admin" for ur in current_user.user_roles)
    
    if is_admin:
        # Admin can see all sensors
        result = await db.execute(select(Sensor))
        return result.scalars().all()
    else:
        # Regular user can only see their own sensors
        result = await db.execute(
            select(Sensor).where(Sensor.user_id == current_user.id)
        )
        return result.scalars().all()


# Get Data by Id
@router.get("/{sensor_id}", response_model=SensorResponse)
async def get_sensor(
    sensor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_read_sensors),
):
    result = await db.execute(select(Sensor).where(Sensor.id == sensor_id))
    sensor = result.scalars().first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor


# Get Data by Code
@router.get("/code/{sensor_code}", response_model=SensorResponse)
async def get_sensor_by_code(
    sensor_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_read_sensors),
):
    result = await db.execute(select(Sensor).where(Sensor.code == sensor_code))
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
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_update_sensors),
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
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_delete_sensors),
):
    result = await db.execute(select(Sensor).where(Sensor.id == sensor_id))
    sensor = result.scalars().first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    await db.delete(sensor)
    await db.commit()
    return {"detail": "Sensor deleted successfully"}
