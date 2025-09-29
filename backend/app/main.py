from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routes import sensor, sensor_type, sensor_log, vehicle, raw_log, point, vehicle_log, user, auth

app = FastAPI(title="SEANO Backend API")

# ✅ Tambah CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # untuk testing: izinkan semua origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(sensor.router, prefix="/sensors", tags=["Sensors"])
app.include_router(sensor_type.router, prefix="/sensor-types", tags=["Sensor Types"])
app.include_router(sensor_log.router, prefix="/sensor-logs", tags=["Sensor Logs"])
app.include_router(vehicle.router, prefix="/vehicles", tags=["Vehicles"])
app.include_router(raw_log.router, prefix="/raw-logs", tags=["Raw Logs"])
app.include_router(point.router, prefix="/points", tags=["Points"])
app.include_router(vehicle_log.router, prefix="/vehicle-logs", tags=["Vehicle Logs"])

# Auto create tables at startup
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "SEANO Backend is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}
