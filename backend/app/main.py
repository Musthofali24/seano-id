from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .database import SessionLocal, engine, Base
from .models import SensorLog

app = FastAPI(title="SEANO Backend with SQLAlchemy")

# Pydantic schema untuk request body
class SensorData(BaseModel):
    temperature: float
    humidity: float

async def get_db():
    async with SessionLocal() as session:
        yield session

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "SEANO Backend is running 🚀"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/sensors")
async def log_sensor(data: SensorData, db: AsyncSession = Depends(get_db)):
    sensor = SensorLog(
        temperature=data.temperature,
        humidity=data.humidity
    )
    db.add(sensor)
    await db.commit()
    await db.refresh(sensor)
    return {
        "status": "success",
        "data": {
            "id": sensor.id,
            "temperature": float(sensor.temperature),
            "humidity": float(sensor.humidity),
            "created_at": sensor.created_at
        }
    }

@app.get("/sensors")
async def get_sensors(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SensorLog).order_by(SensorLog.created_at.desc()).limit(20)
    )
    rows = result.scalars().all()
    return {
        "count": len(rows),
        "data": [
            {
                "id": r.id,
                "temperature": float(r.temperature),
                "humidity": float(r.humidity),
                "created_at": r.created_at
            }
            for r in rows
        ]
    }
