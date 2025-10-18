#!/usr/bin/env python3
"""
Jetson MQTT Publisher Simulator
Script untuk simulasi data yang akan dikirim oleh Jetson devices ke backend SEANO.
Digunakan untuk testing MQTT subscriber di backend.

CATATAN: Di production, Jetson devices yang sebenarnya akan menjalankan publisher.
"""

import asyncio
import json
import ssl
from aiomqtt import Client
from datetime import datetime

# MQTT Configuration
MQTT_BROKER = "d7b48187457f4e799b84ef68d8cf8783.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USERNAME = "seanoraspi" 
MQTT_PASSWORD = "Seanoraspi24*"

async def publish_test_data():
    """Simulate data that would be published by Jetson devices"""
    
    # Setup SSL context for secure connection
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_REQUIRED
    
    try:
        async with Client(
            hostname=MQTT_BROKER,
            port=MQTT_PORT,
            username=MQTT_USERNAME,
            password=MQTT_PASSWORD,
            tls_context=ssl_context
        ) as client:
            print("Connected to MQTT broker")
            
            # Test with vehicle_id = 1
            vehicle_id = 1
            
            # Test raw log
            raw_log_data = f"Raw log test message at {datetime.now()}"
            await client.publish(f"seano/{vehicle_id}/raw_log", raw_log_data)
            print(f"Published raw log for vehicle {vehicle_id}: {raw_log_data}")
            
            # Test sensor log
            sensor_log_data = {
                "sensor_id": 1,
                "data": {
                    "temperature": 25.5,
                    "humidity": 60.2,
                    "timestamp": datetime.now().isoformat()
                }
            }
            await client.publish(f"seano/{vehicle_id}/sensor_log", json.dumps(sensor_log_data))
            print(f"Published sensor log for vehicle {vehicle_id}: {sensor_log_data}")
            
            # Test vehicle log
            vehicle_log_data = {
                "battery_voltage": 12.6,
                "battery_current": 2.5,
                "rssi": -45,
                "mode": "AUTO",
                "latitude": -6.2088,
                "longitude": 106.8456,
                "heading": 45.0,
                "armed": True,
                "guided": False,
                "system_status": "STANDBY",
                "speed": 15.5
            }
            await client.publish(f"seano/{vehicle_id}/vehicle_log", json.dumps(vehicle_log_data))
            print(f"Published vehicle log for vehicle {vehicle_id}: {vehicle_log_data}")
            
            # Test with another vehicle_id = 2
            vehicle_id = 2
            
            # Test raw log for vehicle 2
            raw_log_data = f"Raw log test message for vehicle 2 at {datetime.now()}"
            await client.publish(f"seano/{vehicle_id}/raw_log", raw_log_data)
            print(f"Published raw log for vehicle {vehicle_id}: {raw_log_data}")
            
            # Test vehicle log for vehicle 2
            vehicle_log_data = {
                "battery_voltage": 11.8,
                "battery_current": 3.1,
                "rssi": -52,
                "mode": "MANUAL",
                "latitude": -6.1753,
                "longitude": 106.8271,
                "heading": 120.0,
                "armed": False,
                "guided": True,
                "system_status": "ACTIVE",
                "speed": 8.2
            }
            await client.publish(f"seano/{vehicle_id}/vehicle_log", json.dumps(vehicle_log_data))
            print(f"Published vehicle log for vehicle {vehicle_id}: {vehicle_log_data}")
            
            print("All test messages published successfully!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Starting Jetson MQTT Publisher Simulator...")
    print("Simulating data that would be sent by real Jetson devices...")
    asyncio.run(publish_test_data())