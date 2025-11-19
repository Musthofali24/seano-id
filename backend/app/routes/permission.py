from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.models.permission import Permission, RolePermission
from app.models.role import Role
from app.models.user import User
from app.schemas.permission import (
    PermissionCreate,
    PermissionUpdate,
    PermissionResponse,
    RolePermissionCreate,
    RolePermissionResponse,
)
from app.database import get_db
from app.services.auth_service import get_authenticated_user

router = APIRouter(tags=["Permissions"])


@router.get("/", response_model=List[PermissionResponse])
async def get_permissions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Get all permissions"""
    result = await db.execute(select(Permission))
    permissions = result.scalars().all()
    return permissions


@router.get("/{permission_id}", response_model=PermissionResponse)
async def get_permission(
    permission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Get specific permission by ID"""
    result = await db.execute(select(Permission).where(Permission.id == permission_id))
    permission = result.scalar_one_or_none()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    return permission


@router.post(
    "/", response_model=PermissionResponse, status_code=status.HTTP_201_CREATED
)
async def create_permission(
    permission: PermissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Create new permission"""
    new_permission = Permission(**permission.model_dump())
    db.add(new_permission)
    try:
        await db.commit()
        await db.refresh(new_permission)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=400, detail="Permission with this name already exists"
        )
    return new_permission


@router.put("/{permission_id}", response_model=PermissionResponse)
async def update_permission(
    permission_id: int,
    permission: PermissionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Update permission"""
    result = await db.execute(select(Permission).where(Permission.id == permission_id))
    db_permission = result.scalar_one_or_none()
    if not db_permission:
        raise HTTPException(status_code=404, detail="Permission not found")

    for key, value in permission.model_dump(exclude_unset=True).items():
        setattr(db_permission, key, value)

    try:
        await db.commit()
        await db.refresh(db_permission)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=400, detail="Permission with this name already exists"
        )
    return db_permission


@router.delete("/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_permission(
    permission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Delete permission"""
    result = await db.execute(select(Permission).where(Permission.id == permission_id))
    db_permission = result.scalar_one_or_none()
    if not db_permission:
        raise HTTPException(status_code=404, detail="Permission not found")

    await db.delete(db_permission)
    await db.commit()


# ============= ROLE PERMISSION ENDPOINTS =============


@router.post("/assign-to-role/", response_model=RolePermissionResponse)
async def assign_permission_to_role(
    role_permission: RolePermissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Assign permission to role"""
    # Verify role exists
    result = await db.execute(select(Role).where(Role.id == role_permission.role_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Role not found")

    # Verify permission exists
    result = await db.execute(
        select(Permission).where(Permission.id == role_permission.permission_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Permission not found")

    new_role_permission = RolePermission(**role_permission.model_dump())
    db.add(new_role_permission)
    try:
        await db.commit()
        await db.refresh(new_role_permission)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=400, detail="Permission already assigned to this role"
        )
    return new_role_permission


@router.delete(
    "/remove-from-role/{role_id}/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_permission_from_role(
    role_id: int,
    permission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """Remove permission from role"""
    result = await db.execute(
        select(RolePermission).where(
            (RolePermission.role_id == role_id)
            & (RolePermission.permission_id == permission_id)
        )
    )
    role_permission = result.scalar_one_or_none()
    if not role_permission:
        raise HTTPException(status_code=404, detail="Role permission not found")

    await db.delete(role_permission)
    await db.commit()
