from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models.point import Point
from app.schemas.point import PointCreate, PointUpdate, PointResponse

router = APIRouter(tags=["Points"])

@router.post("/", response_model=PointResponse)
async def create_point(point: PointCreate, db: AsyncSession = Depends(get_db)):
    new_point = Point(**point.model_dump())
    db.add(new_point)
    await db.commit()
    await db.refresh(new_point)
    return new_point

@router.get("/", response_model=List[PointResponse])
async def get_points(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Point).order_by(Point.created_at.desc()))
    return result.scalars().all()

@router.get("/{point_id}", response_model=PointResponse)
async def get_point(point_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Point).where(Point.id == point_id))
    point = result.scalars().first()
    if not point:
        raise HTTPException(status_code=404, detail="Point not found")
    return point

@router.put("/{point_id}", response_model=PointResponse)
async def update_point(point_id: int, point_update: PointUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Point).where(Point.id == point_id))
    point = result.scalars().first()
    if not point:
        raise HTTPException(status_code=404, detail="Point not found")
    
    update_data = point_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(point, field, value)
    
    await db.commit()
    await db.refresh(point)
    return point

@router.delete("/{point_id}")
async def delete_point(point_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Point).where(Point.id == point_id))
    point = result.scalars().first()
    if not point:
        raise HTTPException(status_code=404, detail="Point not found")
    
    await db.delete(point)
    await db.commit()
    return {"detail": "Point deleted successfully"}