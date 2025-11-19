from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.role import Role
from app.models.user import User
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse
from app.database import get_db
from typing import List
from app.services.auth_service import get_authenticated_user
from app.services.permission_service import make_permission_checker

router = APIRouter(tags=["Roles"])

# Permission checkers
can_create_roles = make_permission_checker("roles.create")
can_read_roles = make_permission_checker("roles.read")
can_update_roles = make_permission_checker("roles.update")
can_delete_roles = make_permission_checker("roles.delete")


@router.get("/", response_model=List[RoleResponse])
async def get_roles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_read_roles),
):
    result = await db.execute(select(Role))
    roles = result.scalars().all()
    return roles


@router.get("/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_read_roles),
):
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.post("/", response_model=RoleResponse)
async def create_role(
    role: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_create_roles),
):
    new_role = Role(**role.model_dump())
    db.add(new_role)
    await db.commit()
    await db.refresh(new_role)
    return new_role


@router.put("/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: int,
    role: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_update_roles),
):
    result = await db.execute(select(Role).where(Role.id == role_id))
    db_role = result.scalar_one_or_none()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    for key, value in role.model_dump(exclude_unset=True).items():
        setattr(db_role, key, value)
    await db.commit()
    await db.refresh(db_role)
    return db_role


@router.delete("/{role_id}")
async def delete_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    _: bool = Depends(can_delete_roles),
):
    result = await db.execute(select(Role).where(Role.id == role_id))
    db_role = result.scalar_one_or_none()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    await db.delete(db_role)
    await db.commit()
    return {"detail": "Role deleted"}
