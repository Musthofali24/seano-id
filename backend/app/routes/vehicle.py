from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.user import User
from app.models.role import Role, UserRole
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
