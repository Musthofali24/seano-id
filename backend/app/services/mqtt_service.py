import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any
from aiomqtt import Client
import ssl
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.models.raw_log import RawLog
from app.models.sensor_log import SensorLog
from app.models.vehicle_log import VehicleLog
from app.config.mqtt_config import mqtt_settings
from app.services.websocket_service import websocket_manager

logger = logging.getLogger(__name__)


class MQTTListener:
    """
    MQTT Subscriber untuk menerima data dari Jetson devices

    Backend SEANO bertindak sebagai MQTT Subscriber yang:
    - Subscribe ke topics dengan pattern seano/{vehicle_id}/log_type
    - Menerima data dari Jetson devices (Publishers)
    - Menyimpan data ke database dengan vehicle_id yang benar
    """

    def __init__(self):
        self.client = None
        self.running = False

    async def start_listener(self):
        """Start MQTT subscriber to receive data from Jetson devices"""
        self.running = True

        while self.running:
            try:
                # Setup SSL context for secure connection (if TLS enabled)
                ssl_context = None
                if mqtt_settings.MQTT_USE_TLS:
                    ssl_context = ssl.create_default_context()
                    ssl_context.check_hostname = False
                    ssl_context.verify_mode = ssl.CERT_NONE

                async with Client(
                    hostname=mqtt_settings.MQTT_BROKER,
                    port=mqtt_settings.MQTT_PORT,
                    username=mqtt_settings.MQTT_USERNAME,
                    password=mqtt_settings.MQTT_PASSWORD,
                    tls_context=ssl_context,
                ) as client:
                    logger.info(
                        f"Connected to MQTT broker as subscriber (TLS: {mqtt_settings.MQTT_USE_TLS})"
                    )

                    # Subscribe to wildcard topics to receive data from all Jetson devices
                    await client.subscribe(mqtt_settings.MQTT_TOPIC_RAW_LOG)
                    await client.subscribe(mqtt_settings.MQTT_TOPIC_SENSOR_LOG)
                    await client.subscribe(mqtt_settings.MQTT_TOPIC_VEHICLE_LOG)

                    logger.info(
                        f"Subscribed to topics: {mqtt_settings.MQTT_TOPIC_RAW_LOG}, {mqtt_settings.MQTT_TOPIC_SENSOR_LOG}, {mqtt_settings.MQTT_TOPIC_VEHICLE_LOG}"
                    )

                    # Listen for messages from Jetson devices
                    async for message in client.messages:
                        if not self.running:
                            break
                        await self.handle_message(
                            message.topic.value, message.payload.decode()
                        )

            except Exception as e:
                logger.error(f"MQTT connection error: {e}")
                if self.running:
                    logger.info("Reconnecting in 5 seconds...")
                    await asyncio.sleep(5)

    async def handle_message(self, topic: str, payload: str):
        """Handle incoming MQTT messages from Jetson devices"""
        try:
            logger.info(f"Received message from Jetson on topic {topic}: {payload}")

            # Extract registration_code from topic (seano/{registration_code}/log_type)
            topic_parts = topic.split("/")
            if len(topic_parts) != 3 or topic_parts[0] != "seano":
                logger.error(f"Invalid topic format: {topic}")
                return

            registration_code = topic_parts[1]
            log_type = topic_parts[2]

            # Create database session
            async with AsyncSessionLocal() as db:
                # Lookup vehicle by registration_code
                from app.models.vehicle import Vehicle
                from sqlalchemy import select

                result = await db.execute(
                    select(Vehicle).where(Vehicle.code == registration_code)
                )
                vehicle = result.scalars().first()

                if not vehicle:
                    logger.error(f"Vehicle not found with code: {registration_code}")
                    return

                vehicle_id = vehicle.id
                logger.info(
                    f"Found vehicle ID {vehicle_id} for code {registration_code}"
                )

                if log_type == "raw_log":
                    await self.handle_raw_log(
                        db, payload, vehicle_id, registration_code
                    )
                elif log_type == "sensor_log":
                    await self.handle_sensor_log(
                        db, payload, vehicle_id, registration_code
                    )
                elif log_type == "vehicle_log":
                    await self.handle_vehicle_log(
                        db, payload, vehicle_id, registration_code
                    )
                else:
                    logger.warning(f"Unknown log type: {log_type}")

        except Exception as e:
            logger.error(f"Error handling message from Jetson: {e}")

    async def handle_raw_log(
        self, db: AsyncSession, payload: str, vehicle_id: int, registration_code: str
    ):
        """Handle raw log messages from Jetson"""
        try:
            # For raw_log, we'll store the vehicle_id in the logs field as JSON
            raw_log_data = {
                "vehicle_id": vehicle_id,
                "registration_code": registration_code,
                "message": payload,
                "timestamp": datetime.now().isoformat(),
            }
            raw_log = RawLog(logs=json.dumps(raw_log_data))
            db.add(raw_log)
            await db.commit()
            logger.info(
                f"Raw log saved for vehicle {registration_code} (ID: {vehicle_id})"
            )

            # Broadcast to WebSocket clients (use registration_code for topic)
            await websocket_manager.broadcast_raw_log(registration_code, payload)

        except Exception as e:
            logger.error(f"Error saving raw log from vehicle {registration_code}: {e}")
            await db.rollback()

    async def handle_sensor_log(
        self, db: AsyncSession, payload: str, vehicle_id: int, registration_code: str
    ):
        """Handle sensor log messages from Jetson"""
        try:
            data = json.loads(payload)

            # Override vehicle_id from topic if present in payload
            data["vehicle_id"] = vehicle_id
            data["registration_code"] = registration_code

            sensor_log = SensorLog(
                vehicle_id=vehicle_id,
                sensor_id=data.get("sensor_id"),
                data=data.get("data", {}),
            )

            db.add(sensor_log)
            await db.commit()
            logger.info(
                f"Sensor log saved for vehicle {registration_code} (ID: {vehicle_id})"
            )

            # Broadcast to WebSocket clients (use registration_code for topic)
            await websocket_manager.broadcast_sensor_log(
                registration_code, data.get("sensor_id"), data.get("data", {})
            )

        except json.JSONDecodeError as e:
            logger.error(
                f"Invalid JSON in sensor log from vehicle {registration_code}: {e}"
            )
        except Exception as e:
            logger.error(
                f"Error saving sensor log from vehicle {registration_code}: {e}"
            )
            await db.rollback()

    async def handle_vehicle_log(
        self, db: AsyncSession, payload: str, vehicle_id: int, registration_code: str
    ):
        """Handle vehicle log messages from Jetson"""
        try:
            data = json.loads(payload)

            # Use vehicle_id from topic, not from payload
            vehicle_log = VehicleLog(
                vehicle_id=vehicle_id,
                battery_voltage=data.get("battery_voltage"),
                battery_current=data.get("battery_current"),
                rssi=data.get("rssi"),
                mode=data.get("mode"),
                latitude=data.get("latitude"),
                longitude=data.get("longitude"),
                altitude=data.get("altitude"),
                gps_fix=data.get("gps_fix"),
                heading=data.get("heading"),
                speed=data.get("speed"),
                roll=data.get("roll"),
                pitch=data.get("pitch"),
                yaw=data.get("yaw"),
                armed=data.get("armed"),
                guided=data.get("guided"),
                system_status=data.get("system_status"),
                temperature=data.get("temperature"),
            )

            db.add(vehicle_log)
            await db.commit()
            logger.info(
                f"Vehicle log saved for vehicle {registration_code} (ID: {vehicle_id})"
            )

            # Broadcast to WebSocket clients (use registration_code for topic)
            data["registration_code"] = registration_code
            await websocket_manager.broadcast_vehicle_log(registration_code, data)

        except json.JSONDecodeError as e:
            logger.error(
                f"Invalid JSON in vehicle log from vehicle {registration_code}: {e}"
            )
        except Exception as e:
            logger.error(
                f"Error saving vehicle log from vehicle {registration_code}: {e}"
            )
            await db.rollback()

    async def stop_listener(self):
        """Stop MQTT subscriber"""
        self.running = False
        logger.info("MQTT subscriber stopped")


# Global MQTT subscriber instance
mqtt_listener = MQTTListener()
