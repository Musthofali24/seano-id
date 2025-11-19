from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.vehicle_log import VehicleLog
from app.models.vehicle import Vehicle
from app.models.user import User
from app.models.role import Role, UserRole
from app.schemas.vehicle_log import VehicleLogCreate, VehicleLogResponse
from app.services.auth_service import get_authenticated_user
from app.services.permission_service import make_permission_checker

router = APIRouter(tags=["Vehicle Logs"])

# Permission checkers - Vehicle logs are read-only in data management
can_read_vehicle_logs = make_permission_checker("vehicles.read")


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


# Helper to check if user owns the vehicle
async def check_vehicle_ownership(
    vehicle_id: int, current_user: User, db: AsyncSession
):
    """Check if user owns the vehicle or is admin"""
    admin = await is_admin(current_user, db)
    if admin:
        return

    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalars().first()

    if not vehicle or vehicle.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="You can only access logs from your own vehicles"
        )


@router.post("/", response_model=VehicleLogResponse)
async def create_vehicle_log(
    log: VehicleLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_read_vehicle_logs),
):
    new_log = VehicleLog(**log.model_dump())
    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)
    return new_log


@router.get("/", response_model=List[VehicleLogResponse])
async def get_vehicle_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    vehicle_id: Optional[int] = Query(None),
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    limit: int = Query(100, le=1000),
    _: bool = Depends(can_read_vehicle_logs),
):
    admin = await is_admin(current_user, db)
    query = select(VehicleLog)

    # If not admin and vehicle_id is specified, check ownership
    if not admin and vehicle_id:
        await check_vehicle_ownership(vehicle_id, current_user, db)

    # If not admin and vehicle_id is not specified, filter by user's vehicles
    if not admin and not vehicle_id:
        result = await db.execute(
            select(Vehicle.id).where(Vehicle.user_id == current_user.id)
        )
        user_vehicle_ids = result.scalars().all()
        if not user_vehicle_ids:
            return []
        query = query.where(VehicleLog.vehicle_id.in_(user_vehicle_ids))

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
async def get_vehicle_log(
    log_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_read_vehicle_logs),
):
    result = await db.execute(select(VehicleLog).where(VehicleLog.id == log_id))
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Vehicle log not found")

    # Check ownership
    await check_vehicle_ownership(log.vehicle_id, current_user, db)

    return log


@router.get("/latest/{vehicle_id}", response_model=VehicleLogResponse)
async def get_latest_vehicle_log(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    # Check ownership
    await check_vehicle_ownership(vehicle_id, current_user, db)

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
async def delete_vehicle_log(
    log_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    result = await db.execute(select(VehicleLog).where(VehicleLog.id == log_id))
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Vehicle log not found")

    await db.delete(log)
    await db.commit()
    return {"detail": "Vehicle log deleted successfully"}
