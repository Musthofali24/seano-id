import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routes import (
    sensor,
    sensor_type,
    sensor_log,
    vehicle,
    raw_log,
    vehicle_log,
    vehicle_sensor,
    user,
    role,
    permission,
    auth,
    mqtt,
    websocket,
)
from .services.mqtt_service import mqtt_listener
from .services.connection_monitor import connection_monitor
from .services.websocket_service import websocket_manager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Set websocket manager for connection monitor
    connection_monitor.set_websocket_manager(websocket_manager)

    # Start MQTT listener as background task
    mqtt_task = asyncio.create_task(mqtt_listener.start_listener())
    logger.info("MQTT listener started")

    # Start connection monitor as background task
    await connection_monitor.start()
    logger.info("Connection monitor started")

    yield

    # Shutdown
    await connection_monitor.stop()
    logger.info("Connection monitor stopped")
    
    await mqtt_listener.stop_listener()
    mqtt_task.cancel()
    try:
        await mqtt_task
    except asyncio.CancelledError:
        pass
    logger.info("MQTT listener stopped")


app = FastAPI(title="SEANO Backend API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(role.router, prefix="/roles")
app.include_router(permission.router, prefix="/permissions")
app.include_router(sensor.router, prefix="/sensors", tags=["Sensors"])
app.include_router(sensor_type.router, prefix="/sensor-types", tags=["Sensor Types"])
app.include_router(sensor_log.router, prefix="/sensor-logs", tags=["Sensor Logs"])
app.include_router(vehicle.router, prefix="/vehicles", tags=["Vehicles"])
app.include_router(vehicle_sensor.router, tags=["Vehicle-Sensors"])  # No prefix, uses /vehicles/{id}/sensors
app.include_router(raw_log.router, prefix="/raw-logs", tags=["Raw Logs"])
app.include_router(vehicle_log.router, prefix="/vehicle-logs", tags=["Vehicle Logs"])
app.include_router(mqtt.router, prefix="/api", tags=["MQTT"])
app.include_router(websocket.router, tags=["WebSocket"])  # No prefix for WebSocket
