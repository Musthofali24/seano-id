# app/services/connection_monitor.py
"""
Background service to monitor sensor connection status.
Checks every 5 seconds if sensors are still sending data.
Broadcasts status updates via WebSocket.
"""
import asyncio
import logging
from datetime import datetime, timedelta
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload

from app.database import AsyncSessionLocal
from app.models.vehicle_sensor import VehicleSensor
from app.models.vehicle import Vehicle
from app.models.sensor import Sensor

logger = logging.getLogger(__name__)

# Configuration
CHECK_INTERVAL_SECONDS = 5  # How often to check connection status
CONNECTION_TIMEOUT_SECONDS = 30  # Sensor is disconnected if no data for 30 seconds


class ConnectionMonitor:
    def __init__(self):
        self.running = False
        self.websocket_manager = None  # Will be set from websocket service
        self._task = None

    def set_websocket_manager(self, manager):
        """Set the WebSocket manager for broadcasting status updates"""
        self.websocket_manager = manager

    async def start(self):
        """Start the connection monitor background task"""
        if self.running:
            logger.warning("Connection monitor is already running")
            return

        self.running = True
        self._task = asyncio.create_task(self._monitor_loop())
        logger.info("Connection monitor started")

    async def stop(self):
        """Stop the connection monitor background task"""
        self.running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Connection monitor stopped")

    async def _monitor_loop(self):
        """Main monitoring loop"""
        while self.running:
            try:
                await self._check_connections()
                await asyncio.sleep(CHECK_INTERVAL_SECONDS)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in connection monitor: {e}", exc_info=True)
                await asyncio.sleep(CHECK_INTERVAL_SECONDS)

    async def _check_connections(self):
        """Check all sensor connections and broadcast status updates"""
        async with AsyncSessionLocal() as db:
            try:
                # Get all installed vehicle-sensors with their relationships
                result = await db.execute(
                    select(VehicleSensor)
                    .options(
                        joinedload(VehicleSensor.sensor),
                        joinedload(VehicleSensor.vehicle),
                    )
                    .where(VehicleSensor.is_installed == True)
                )
                vehicle_sensors = result.scalars().unique().all()

                now = datetime.utcnow()
                timeout_threshold = now - timedelta(seconds=CONNECTION_TIMEOUT_SECONDS)

                for vs in vehicle_sensors:
                    # Determine connection status
                    if vs.last_seen_at and vs.last_seen_at > timeout_threshold:
                        status = "connected"
                        seconds_ago = int((now - vs.last_seen_at).total_seconds())
                    else:
                        status = "disconnected"
                        seconds_ago = (
                            int((now - vs.last_seen_at).total_seconds())
                            if vs.last_seen_at
                            else None
                        )

                    # Broadcast status via WebSocket
                    if self.websocket_manager:
                        await self.websocket_manager.broadcast(
                            {
                                "type": "sensor_status",
                                "vehicle_id": vs.vehicle_id,
                                "vehicle_code": vs.vehicle.code,
                                "sensor_id": vs.sensor_id,
                                "sensor_code": vs.sensor.code,
                                "sensor_name": vs.sensor.name,
                                "status": status,
                                "last_seen_at": (
                                    vs.last_seen_at.isoformat() if vs.last_seen_at else None
                                ),
                                "last_seen_seconds_ago": seconds_ago,
                            }
                        )

            except Exception as e:
                logger.error(f"Error checking connections: {e}", exc_info=True)


# Global instance
connection_monitor = ConnectionMonitor()
