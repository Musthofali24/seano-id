"""
Permission checking utilities and decorators for RBAC
"""

from functools import wraps
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.role import UserRole, Role
from app.models.permission import Permission, RolePermission
from app.database import get_db
from app.services.auth_service import get_authenticated_user


async def get_user_permissions(user: User, db: AsyncSession) -> set:
    """Get all permissions for a user based on their roles"""
    # Get all role_ids for this user
    result = await db.execute(select(UserRole).where(UserRole.user_id == user.id))
    user_roles = result.scalars().all()
    role_ids = [ur.role_id for ur in user_roles]

    if not role_ids:
        return set()

    # Get all permissions for these roles
    result = await db.execute(
        select(Permission.name)
        .join(RolePermission, Permission.id == RolePermission.permission_id)
        .where(RolePermission.role_id.in_(role_ids))
    )
    permission_names = result.scalars().all()
    return set(permission_names)


async def has_permission(user: User, permission_name: str, db: AsyncSession) -> bool:
    """Check if user has a specific permission"""
    user_perms = await get_user_permissions(user, db)
    return permission_name in user_perms


def require_permission(permission_name: str):
    """
    Decorator to require specific permission for an endpoint

    Usage:
        @require_permission("users.read")
        async def get_users(current_user: User = Depends(get_authenticated_user)):
            ...
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get dependencies from kwargs
            db = kwargs.get("db")
            current_user = kwargs.get("current_user")

            if not db or not current_user:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Missing dependencies in endpoint",
                )

            # Check permission
            user_has_permission = await has_permission(
                current_user, permission_name, db
            )

            if not user_has_permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission '{permission_name}' is required to access this resource",
                )

            return await func(*args, **kwargs)

        return wrapper

    return decorator


async def check_permission(
    permission_name: str,
    current_user: User = Depends(get_authenticated_user),
    db: AsyncSession = Depends(get_db),
) -> bool:
    """
    Dependency that checks permission and returns boolean
    Raises HTTPException if user doesn't have permission
    """
    user_has_permission = await has_permission(current_user, permission_name, db)

    if not user_has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission '{permission_name}' is required",
        )

    return True


def make_permission_checker(permission_name: str):
    """
    Create a dependency that checks specific permission

    Usage:
        can_read_users = make_permission_checker("users.read")

        @router.get("/users")
        async def get_users(_: bool = Depends(can_read_users)):
            ...
    """

    async def permission_checker(
        current_user: User = Depends(get_authenticated_user),
        db: AsyncSession = Depends(get_db),
    ) -> bool:
        user_has_permission = await has_permission(current_user, permission_name, db)

        if not user_has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission_name}' is required",
            )

        return True

    return permission_checker


async def is_admin(user: User, db: AsyncSession) -> bool:
    """Check if user is an Admin"""
    result = await db.execute(
        select(UserRole)
        .join(Role)
        .where(UserRole.user_id == user.id)
        .where(Role.name == "Admin")
    )
    return result.scalar_one_or_none() is not None


def make_owner_checker(resource_type: str):
    """
    Create a dependency that checks if user is owner of resource

    Supports: "vehicle", "sensor"

    Usage:
        is_vehicle_owner = make_owner_checker("vehicle")

        @router.put("/vehicles/{vehicle_id}")
        async def update_vehicle(
            vehicle_id: int,
            _: bool = Depends(is_vehicle_owner)
        ):
            ...
    """
    from app.models.vehicle import Vehicle
    from app.models.sensor import Sensor

    async def owner_checker(
        current_user: User = Depends(get_authenticated_user),
        db: AsyncSession = Depends(get_db),
        resource_id: int = None,  # Will be passed from endpoint
    ) -> bool:
        # Admin can access anything
        admin = await is_admin(current_user, db)
        if admin:
            return True

        # Regular users - check ownership
        if resource_type == "vehicle":
            result = await db.execute(select(Vehicle).where(Vehicle.id == resource_id))
            vehicle = result.scalar_one_or_none()
            if not vehicle or vehicle.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only access your own vehicles",
                )

        elif resource_type == "sensor":
            result = await db.execute(select(Sensor).where(Sensor.id == resource_id))
            sensor = result.scalar_one_or_none()
            if not sensor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Sensor not found",
                )
            # For now, all sensors are accessible (not vehicle-specific)
            # Can be improved with sensor-to-vehicle relationship

        return True

    return owner_checker
