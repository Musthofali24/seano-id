# app/seeds/seed_sensor_types.py
from app.database import AsyncSessionLocal
from app.models.sensor_type import SensorType
from sqlalchemy import select


async def seed_sensor_types():
    """Seed sensor types data"""
    async with AsyncSessionLocal() as db:
        print("[INFO] 🌱 Seeding sensor types...")

        # Check if sensor types already exist
        result = await db.execute(select(SensorType))
        existing = result.scalars().all()

        if existing:
            print(f"[INFO] ✅ Sensor types already exist ({len(existing)} types). Skipping...")
            return

        # Sensor types to seed
        sensor_types = [
            {
                "name": "Temperature",
                "description": "Temperature sensors (Celsius)",
            },
            {
                "name": "GPS",
                "description": "GPS location sensors",
            },
            {
                "name": "Camera",
                "description": "Camera and vision sensors",
            },
            {
                "name": "Humidity",
                "description": "Humidity sensors (%)",
            },
            {
                "name": "Pressure",
                "description": "Pressure sensors (hPa)",
            },
            {
                "name": "IMU",
                "description": "Inertial Measurement Unit (accelerometer, gyroscope)",
            },
            {
                "name": "Lidar",
                "description": "Light Detection and Ranging sensors",
            },
            {
                "name": "Sonar",
                "description": "Sound Navigation and Ranging sensors",
            },
        ]

        # Create sensor types
        for st_data in sensor_types:
            sensor_type = SensorType(**st_data)
            db.add(sensor_type)

        await db.commit()
        print(f"[SUCCESS] ✅ Created {len(sensor_types)} sensor types")
