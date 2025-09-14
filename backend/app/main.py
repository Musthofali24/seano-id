from fastapi import FastAPI
from .database import Base, engine
from .routes import sensor, sensor_log

app = FastAPI(title="SEANO Backend API")

# Register Routers
app.include_router(sensor.router, prefix="/sensors", tags=["Sensors"])
app.include_router(sensor_log.router, prefix="/sensor-logs", tags=["Sensor Logs"])

# Auto create tables at startup
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
