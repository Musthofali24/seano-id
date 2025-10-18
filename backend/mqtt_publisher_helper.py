#!/usr/bin/env python3
"""
MQTT Publisher Helper
Helper functions untuk publish data ke MQTT dengan format yang benar
"""

import asyncio
import json
import ssl
from datetime import datetime
from aiomqtt import Client

# MQTT Configuration
MQTT_BROKER = "d7b48187457f4e799b84ef68d8cf8783.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USERNAME = "xxxxx"
MQTT_PASSWORD = "xxxx"

class MQTTPublisher:
    def __init__(self):
        self.broker = MQTT_BROKER
        self.port = MQTT_PORT
        self.username = MQTT_USERNAME
        self.password = MQTT_PASSWORD
        
    async def _get_client(self):
        """Get MQTT client with SSL configuration"""
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_REQUIRED
        
        return Client(
            hostname=self.broker,
            port=self.port,
            username=self.username,
            password=self.password,
            tls_context=ssl_context
        )
    
    async def publish_raw_log(self, vehicle_id: int, message: str):
        """Publish raw log message for specific vehicle"""
        topic = f"seano/{vehicle_id}/raw_log"
        async with await self._get_client() as client:
            await client.publish(topic, message)
            print(f"Published raw log to {topic}: {message}")
    
    async def publish_sensor_log(self, vehicle_id: int, sensor_id: int, data: dict):
        """Publish sensor log data for specific vehicle"""
        topic = f"seano/{vehicle_id}/sensor_log"
        payload = {
            "sensor_id": sensor_id,
            "data": data
        }
        async with await self._get_client() as client:
            await client.publish(topic, json.dumps(payload))
            print(f"Published sensor log to {topic}: {payload}")
    
    async def publish_vehicle_log(self, vehicle_id: int, telemetry_data: dict):
        """Publish vehicle telemetry data"""
        topic = f"seano/{vehicle_id}/vehicle_log"
        async with await self._get_client() as client:
            await client.publish(topic, json.dumps(telemetry_data))
            print(f"Published vehicle log to {topic}: {telemetry_data}")

# Usage example
async def example_usage():
    """Example usage of MQTT Publisher"""
    publisher = MQTTPublisher()
    
    # Publish raw log
    await publisher.publish_raw_log(
        vehicle_id=1, 
        message="System startup complete"
    )
    
    # Publish sensor data
    await publisher.publish_sensor_log(
        vehicle_id=1,
        sensor_id=5,
        data={
            "temperature": 28.5,
            "humidity": 65.3,
            "pressure": 1013.25,
            "timestamp": datetime.now().isoformat()
        }
    )
    
    # Publish vehicle telemetry
    await publisher.publish_vehicle_log(
        vehicle_id=1,
        telemetry_data={
            "battery_voltage": 12.4,
            "battery_current": 1.8,
            "rssi": -38,
            "mode": "GUIDED",
            "latitude": -6.2088,
            "longitude": 106.8456,
            "heading": 90.0,
            "armed": True,
            "guided": True,
            "system_status": "ACTIVE",
            "speed": 12.5
        }
    )

if __name__ == "__main__":
    print("Running MQTT Publisher example...")
    asyncio.run(example_usage())