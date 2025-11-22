# app/routes/vehicle_sensor.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
from typing import List
from datetime import datetime, timedelta

from app.database import get_db
from app.models.vehicle_sensor import VehicleSensor
from app.models.vehicle import Vehicle
from app.models.sensor import Sensor
from app.models.sensor_type import SensorType
from app.models.user import User
from app.services.auth_service import get_authenticated_user
from app.schemas.vehicle_sensor import (
    VehicleSensorCreate,
    VehicleSensorResponse,
    VehicleSensorWithDetails,
    VehicleSensorStatus,
)

router = APIRouter()

# Connection timeout in seconds
CONNECTION_TIMEOUT = 30


@router.post(
    "/vehicles/{vehicle_id}/sensors",
    response_model=VehicleSensorResponse,
    status_code=status.HTTP_201_CREATED,
)
async def assign_sensor_to_vehicle(
    vehicle_id: int,
    sensor_data: VehicleSensorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """
    Assign a sensor to a vehicle.
    Creates a record in vehicle_sensors junction table.
    User can only assign sensors to their own vehicles.
    """
    # Check if user is admin
    is_admin = any(ur.role.name == "Admin" for ur in current_user.user_roles)
    
    # Check if vehicle exists
    vehicle_result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = vehicle_result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
        )
    
    # Check if user owns the vehicle (unless admin)
    if not is_admin and vehicle.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only assign sensors to your own vehicles"
        )

    # Check if sensor exists
    sensor_result = await db.execute(
        select(Sensor).where(Sensor.id == sensor_data.sensor_id)
    )
    sensor = sensor_result.scalar_one_or_none()
    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sensor not found"
        )
    
    # Check if user owns the sensor (unless admin)
    if not is_admin and sensor.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only assign sensors that you own"
        )

    # Check if sensor is already assigned to this vehicle and still installed
    existing_result = await db.execute(
        select(VehicleSensor).where(
            and_(
                VehicleSensor.vehicle_id == vehicle_id,
                VehicleSensor.sensor_id == sensor_data.sensor_id,
                VehicleSensor.is_installed == True,
            )
        )
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sensor is already assigned to this vehicle",
        )

    # Create vehicle-sensor assignment
    vehicle_sensor = VehicleSensor(
        vehicle_id=vehicle_id,
        sensor_id=sensor_data.sensor_id,
        is_installed=True,
    )
    db.add(vehicle_sensor)
    await db.commit()
    await db.refresh(vehicle_sensor)

    return vehicle_sensor


@router.get(
    "/vehicles/{vehicle_id}/sensors",
    response_model=List[VehicleSensorWithDetails],
)
async def get_vehicle_sensors(
    vehicle_id: int,
    include_removed: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """
    Get all sensors assigned to a vehicle.
    By default, only returns installed sensors. Set include_removed=true to include removed sensors.
    """
    # Check if vehicle exists
    vehicle_result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = vehicle_result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
        )

    # Build query
    query = (
        select(VehicleSensor)
        .options(joinedload(VehicleSensor.sensor).joinedload(Sensor.sensor_type))
        .where(VehicleSensor.vehicle_id == vehicle_id)
    )

    if not include_removed:
        query = query.where(VehicleSensor.is_installed == True)

    result = await db.execute(query)
    vehicle_sensors = result.scalars().unique().all()

    # Format response with sensor details
    response = []
    for vs in vehicle_sensors:
        response.append(
            VehicleSensorWithDetails(
                id=vs.id,
                vehicle_id=vs.vehicle_id,
                sensor_id=vs.sensor_id,
                sensor_code=vs.sensor.code,
                sensor_name=vs.sensor.name,
                sensor_type_name=vs.sensor.sensor_type.name,
                last_seen_at=vs.last_seen_at,
                is_installed=vs.is_installed,
                installed_at=vs.installed_at,
                removed_at=vs.removed_at,
            )
        )

    return response


@router.get(
    "/vehicles/{vehicle_id}/sensors/status",
    response_model=List[VehicleSensorStatus],
)
async def get_vehicle_sensors_status(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Get real-time connection status of all sensors assigned to a vehicle.
    Status is 'connected' if sensor sent data within the last 30 seconds, otherwise 'disconnected'.
    """
    # Check if vehicle exists
    vehicle_result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = vehicle_result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
        )

    # Get all installed sensors
    result = await db.execute(
        select(VehicleSensor)
        .options(joinedload(VehicleSensor.sensor))
        .where(
            and_(
                VehicleSensor.vehicle_id == vehicle_id,
                VehicleSensor.is_installed == True,
            )
        )
    )
    vehicle_sensors = result.scalars().unique().all()

    # Calculate status
    now = datetime.utcnow()
    response = []
    for vs in vehicle_sensors:
        # Determine connection status
        if vs.last_seen_at:
            seconds_ago = int((now - vs.last_seen_at).total_seconds())
            is_connected = seconds_ago <= CONNECTION_TIMEOUT
            status_str = "connected" if is_connected else "disconnected"
        else:
            seconds_ago = None
            status_str = "disconnected"

        response.append(
            VehicleSensorStatus(
                vehicle_id=vs.vehicle_id,
                vehicle_code=vehicle.code,
                sensor_id=vs.sensor_id,
                sensor_code=vs.sensor.code,
                sensor_name=vs.sensor.name,
                status=status_str,
                last_seen_at=vs.last_seen_at,
                last_seen_seconds_ago=seconds_ago,
            )
        )

    return response


@router.delete(
    "/vehicles/{vehicle_id}/sensors/{sensor_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_sensor_from_vehicle(
    vehicle_id: int,
    sensor_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Remove a sensor from a vehicle.
    Sets is_installed=false and removed_at=now.
    """
    # Find the vehicle-sensor assignment
    result = await db.execute(
        select(VehicleSensor).where(
            and_(
                VehicleSensor.vehicle_id == vehicle_id,
                VehicleSensor.sensor_id == sensor_id,
                VehicleSensor.is_installed == True,
            )
        )
    )
    vehicle_sensor = result.scalar_one_or_none()

    if not vehicle_sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor assignment not found or already removed",
        )

    # Mark as removed
    vehicle_sensor.is_installed = False
    vehicle_sensor.removed_at = datetime.utcnow()

    await db.commit()

    return None


@router.get(
    "/sensors/status",
    response_model=List[VehicleSensorStatus],
)
async def get_all_sensors_status(
    db: AsyncSession = Depends(get_db),
):
    """
    Get real-time connection status of all sensors.
    - Admin: All sensors across all vehicles
    - User: Only sensors from their vehicles
    """
    from app.services.auth_service import get_authenticated_user
    from app.models.user import User
    
    # Get current user (optional, for filtering)
    try:
        current_user = await get_authenticated_user(db=db)
        is_admin = any(ur.role.name == "Admin" for ur in current_user.user_roles)
    except:
        # If no auth, return empty (or could raise 401)
        return []
    
    # Build query
    query = (
        select(VehicleSensor)
        .options(
            joinedload(VehicleSensor.sensor),
            joinedload(VehicleSensor.vehicle),
        )
        .where(VehicleSensor.is_installed == True)
    )
    
    # Filter by user's vehicles if not admin
    if not is_admin:
        query = query.where(VehicleSensor.vehicle.has(Vehicle.user_id == current_user.id))
    
    result = await db.execute(query)
    vehicle_sensors = result.scalars().unique().all()

    # Calculate status
    now = datetime.utcnow()
    response = []
    for vs in vehicle_sensors:
        # Determine connection status
        if vs.last_seen_at:
            seconds_ago = int((now - vs.last_seen_at).total_seconds())
            is_connected = seconds_ago <= CONNECTION_TIMEOUT
            status_str = "connected" if is_connected else "disconnected"
        else:
            seconds_ago = None
            status_str = "disconnected"

        response.append(
            VehicleSensorStatus(
                vehicle_id=vs.vehicle_id,
                vehicle_code=vs.vehicle.code,
                sensor_id=vs.sensor_id,
                sensor_code=vs.sensor.code,
                sensor_name=vs.sensor.name,
                status=status_str,
                last_seen_at=vs.last_seen_at,
                last_seen_seconds_ago=seconds_ago,
            )
        )

    return response
