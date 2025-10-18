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
                # Setup SSL context for secure connection
                ssl_context = ssl.create_default_context()
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl.CERT_REQUIRED
                
                async with Client(
                    hostname=mqtt_settings.MQTT_BROKER,
                    port=mqtt_settings.MQTT_PORT,
                    username=mqtt_settings.MQTT_USERNAME,
                    password=mqtt_settings.MQTT_PASSWORD,
                    tls_context=ssl_context if mqtt_settings.MQTT_USE_TLS else None
                ) as client:
                    logger.info("Connected to MQTT broker as subscriber")
                    
                    # Subscribe to wildcard topics to receive data from all Jetson devices
                    await client.subscribe(mqtt_settings.MQTT_TOPIC_RAW_LOG)
                    await client.subscribe(mqtt_settings.MQTT_TOPIC_SENSOR_LOG)
                    await client.subscribe(mqtt_settings.MQTT_TOPIC_VEHICLE_LOG)
                    
                    logger.info(f"Subscribed to topics: {mqtt_settings.MQTT_TOPIC_RAW_LOG}, {mqtt_settings.MQTT_TOPIC_SENSOR_LOG}, {mqtt_settings.MQTT_TOPIC_VEHICLE_LOG}")
                    
                    # Listen for messages from Jetson devices
                    async for message in client.messages:
                        if not self.running:
                            break
                        await self.handle_message(message.topic.value, message.payload.decode())
                            
            except Exception as e:
                logger.error(f"MQTT connection error: {e}")
                if self.running:
                    logger.info("Reconnecting in 5 seconds...")
                    await asyncio.sleep(5)
                    
    async def handle_message(self, topic: str, payload: str):
        """Handle incoming MQTT messages from Jetson devices"""
        try:
            logger.info(f"Received message from Jetson on topic {topic}: {payload}")
            
            # Extract vehicle_id from topic (seano/{vehicle_id}/log_type)
            topic_parts = topic.split('/')
            if len(topic_parts) != 3 or topic_parts[0] != 'seano':
                logger.error(f"Invalid topic format: {topic}")
                return
                
            vehicle_id = topic_parts[1]
            log_type = topic_parts[2]
            
            # Validate vehicle_id is numeric
            try:
                vehicle_id_int = int(vehicle_id)
            except ValueError:
                logger.error(f"Invalid vehicle_id in topic: {vehicle_id}")
                return
            
            # Create database session
            async with AsyncSessionLocal() as db:
                if log_type == "raw_log":
                    await self.handle_raw_log(db, payload, vehicle_id_int)
                elif log_type == "sensor_log":
                    await self.handle_sensor_log(db, payload, vehicle_id_int)
                elif log_type == "vehicle_log":
                    await self.handle_vehicle_log(db, payload, vehicle_id_int)
                else:
                    logger.warning(f"Unknown log type: {log_type}")
                    
        except Exception as e:
            logger.error(f"Error handling message from Jetson: {e}")
            
    async def handle_raw_log(self, db: AsyncSession, payload: str, vehicle_id: int):
        """Handle raw log messages from Jetson"""
        try:
            # For raw_log, we'll store the vehicle_id in the logs field as JSON
            raw_log_data = {
                "vehicle_id": vehicle_id,
                "message": payload,
                "timestamp": datetime.now().isoformat()
            }
            raw_log = RawLog(logs=json.dumps(raw_log_data))
            db.add(raw_log)
            await db.commit()
            logger.info(f"Raw log saved for vehicle {vehicle_id}")
            
            # Broadcast to WebSocket clients
            await websocket_manager.broadcast_raw_log(vehicle_id, payload)
            
        except Exception as e:
            logger.error(f"Error saving raw log from vehicle {vehicle_id}: {e}")
            await db.rollback()
            
    async def handle_sensor_log(self, db: AsyncSession, payload: str, vehicle_id: int):
        """Handle sensor log messages from Jetson"""
        try:
            data = json.loads(payload)
            
            # Override vehicle_id from topic if present in payload
            data['vehicle_id'] = vehicle_id
            
            sensor_log = SensorLog(
                vehicle_id=vehicle_id,
                sensor_id=data.get('sensor_id'),
                data=data.get('data', {})
            )
            
            db.add(sensor_log)
            await db.commit()
            logger.info(f"Sensor log saved for vehicle {vehicle_id}")
            
            # Broadcast to WebSocket clients
            await websocket_manager.broadcast_sensor_log(
                vehicle_id, 
                data.get('sensor_id'), 
                data.get('data', {})
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in sensor log from vehicle {vehicle_id}: {e}")
        except Exception as e:
            logger.error(f"Error saving sensor log from vehicle {vehicle_id}: {e}")
            await db.rollback()
            
    async def handle_vehicle_log(self, db: AsyncSession, payload: str, vehicle_id: int):
        """Handle vehicle log messages from Jetson"""
        try:
            data = json.loads(payload)
            
            # Use vehicle_id from topic, not from payload
            vehicle_log = VehicleLog(
                vehicle_id=vehicle_id,
                battery_voltage=data.get('battery_voltage'),
                battery_current=data.get('battery_current'),
                rssi=data.get('rssi'),
                mode=data.get('mode'),
                latitude=data.get('latitude'),
                longitude=data.get('longitude'),
                heading=data.get('heading'),
                armed=data.get('armed'),
                guided=data.get('guided'),
                system_status=data.get('system_status'),
                speed=data.get('speed')
            )
            
            db.add(vehicle_log)
            await db.commit()
            logger.info(f"Vehicle log saved for vehicle {vehicle_id}")
            
            # Broadcast to WebSocket clients
            await websocket_manager.broadcast_vehicle_log(vehicle_id, data)
            
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in vehicle log from vehicle {vehicle_id}: {e}")
        except Exception as e:
            logger.error(f"Error saving vehicle log from vehicle {vehicle_id}: {e}")
            await db.rollback()
            
    async def stop_listener(self):
        """Stop MQTT subscriber"""
        self.running = False
        logger.info("MQTT subscriber stopped")

# Global MQTT subscriber instance
mqtt_listener = MQTTListener()