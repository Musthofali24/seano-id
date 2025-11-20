from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, and_
from typing import List
from datetime import datetime, timedelta

from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.user import User
from app.models.role import Role, UserRole
from app.models.vehicle_log import VehicleLog
from app.models.sensor_log import SensorLog
from app.models.raw_log import RawLog
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from app.services.auth_service import get_authenticated_user
from app.services.permission_service import make_permission_checker

router = APIRouter(tags=["Vehicles"])

# Permission checkers
can_create_vehicles = make_permission_checker("vehicles.create")
can_read_vehicles = make_permission_checker("vehicles.read")
can_update_vehicles = make_permission_checker("vehicles.update")
can_delete_vehicles = make_permission_checker("vehicles.delete")


# Helper function to check if user is admin
async def is_admin(user: User, db: AsyncSession) -> bool:
    """Check if user is an Admin"""
    result = await db.execute(
        select(UserRole)
        .join(Role)
        .where(UserRole.user_id == user.id)
        .where(Role.name == "Admin")
    )
    return result.scalar_one_or_none() is not None


# Helper function to check vehicle ownership
async def check_vehicle_ownership(
    vehicle_id: int, current_user: User, db: AsyncSession
):
    """Check if user owns the vehicle or is admin"""
    admin = await is_admin(current_user, db)
    if admin:
        return  # Admin can access any vehicle

    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalars().first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="You can only access your own vehicles"
        )


@router.get("/batteries")
async def get_vehicle_batteries(
    vehicle_id: int = Query(..., ge=1),
    limit: int = Query(50, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_read_vehicles),
):
    """Get battery data for a vehicle from vehicle logs"""
    await check_vehicle_ownership(vehicle_id, current_user, db)

    # Query vehicle logs with battery data
    result = await db.execute(
        select(VehicleLog)
        .where(
            and_(
                VehicleLog.vehicle_id == vehicle_id,
                VehicleLog.battery_voltage.is_not(None),
            )
        )
        .order_by(desc(VehicleLog.created_at))
        .limit(limit)
    )
    logs = result.scalars().all()

    # Format battery data
    batteries = []
    for log in logs:
        batteries.append(
            {
                "id": log.id,
                "voltage": float(log.battery_voltage) if log.battery_voltage else None,
                "current": float(log.battery_current) if log.battery_current else None,
                "timestamp": log.created_at.isoformat() if log.created_at else None,
                "system_status": log.system_status,
            }
        )

    return batteries


# Create Vehicle
@router.post("/", response_model=VehicleResponse)
async def create_vehicle(
    vehicle: VehicleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_create_vehicles),
):
    # Auto-generate code if not provided
    vehicle_data = vehicle.model_dump()
    if not vehicle_data.get("code") or vehicle_data.get("code").strip() == "":
        # Get the highest ID to generate next code
        result = await db.execute(select(Vehicle).order_by(Vehicle.id.desc()).limit(1))
        last_vehicle = result.scalars().first()
        next_id = (last_vehicle.id + 1) if last_vehicle else 1
        vehicle_data["code"] = f"USV-{str(next_id).zfill(3)}"

    # Auto-assign user_id to current user (override any request value)
    vehicle_data["user_id"] = current_user.id

    new_vehicle = Vehicle(**vehicle_data)
    db.add(new_vehicle)
    await db.commit()
    await db.refresh(new_vehicle)
    return new_vehicle


# Get All Vehicles
@router.get("/", response_model=List[VehicleResponse])
async def get_vehicles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_read_vehicles),
):
    admin = await is_admin(current_user, db)

    if admin:
        # Admins see all vehicles
        result = await db.execute(select(Vehicle))
    else:
        # Regular users only see their own vehicles
        result = await db.execute(
            select(Vehicle).where(Vehicle.user_id == current_user.id)
        )

    return result.scalars().all()


# Get Vehicle by ID
@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_read_vehicles),
):
    await check_vehicle_ownership(vehicle_id, current_user, db)

    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalars().first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


# Update Vehicle
@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: int,
    update: VehicleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_update_vehicles),
):
    await check_vehicle_ownership(vehicle_id, current_user, db)

    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalars().first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    for key, value in update.dict(exclude_unset=True).items():
        setattr(vehicle, key, value)

    await db.commit()
    await db.refresh(vehicle)
    return vehicle


# Delete Vehicle
@router.delete("/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_delete_vehicles),
):
    await check_vehicle_ownership(vehicle_id, current_user, db)

    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalars().first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    await db.delete(vehicle)
    await db.commit()
    return {"message": "Vehicle deleted successfully"}


# Get Vehicle Alerts
@router.get("/{vehicle_id}/alerts")
async def get_vehicle_alerts(
    vehicle_id: int,
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_read_vehicles),
):
    """Get recent alerts for a vehicle (based on sensor anomalies)"""
    await check_vehicle_ownership(vehicle_id, current_user, db)

    # Query recent sensor logs with anomalies (values out of normal range)
    result = await db.execute(
        select(SensorLog)
        .where(SensorLog.vehicle_id == vehicle_id)
        .order_by(desc(SensorLog.created_at))
        .limit(limit)
    )
    logs = result.scalars().all()

    # Format as alerts (any recent sensor reading is potential alert)
    alerts = []
    for log in logs:
        alerts.append(
            {
                "id": log.id,
                "type": f"sensor_{log.sensor_type_id}",
                "message": f"Sensor {log.sensor_type_id}: {log.value}",
                "severity": "info",
                "timestamp": log.created_at.isoformat() if log.created_at else None,
            }
        )

    return alerts
