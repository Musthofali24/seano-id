from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PermissionBase(BaseModel):
    name: str
    description: Optional[str] = None


class PermissionCreate(PermissionBase):
    pass


class PermissionUpdate(PermissionBase):
    pass


class PermissionResponse(PermissionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class RolePermissionBase(BaseModel):
    role_id: int
    permission_id: int


class RolePermissionCreate(RolePermissionBase):
    pass


class RolePermissionResponse(RolePermissionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RoleWithPermissions(BaseModel):
    id: int
    name: str
    description: Optional[str]
    permissions: List[PermissionResponse]

    class Config:
        from_attributes = True
