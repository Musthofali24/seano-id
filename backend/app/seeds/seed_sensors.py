# app/seeds/seed_sensors.py
from app.database import AsyncSessionLocal
from app.models.sensor import Sensor
from app.models.sensor_type import SensorType
from app.models.user import User
from sqlalchemy import select


async def seed_sensors():
    """Seed sensors data"""
    async with AsyncSessionLocal() as db:
        print("[INFO] 🌱 Seeding sensors...")

        # Check if sensors already exist
        result = await db.execute(select(Sensor))
        existing = result.scalars().all()

        if existing:
            print(f"[INFO] ✅ Sensors already exist ({len(existing)} sensors). Skipping...")
            return

        # Get sensor types
        sensor_types_result = await db.execute(select(SensorType))
        sensor_types = {st.name: st.id for st in sensor_types_result.scalars().all()}

        if not sensor_types:
            print("[WARN] ⚠️ No sensor types found. Please run seed_sensor_types first.")
            return

        # Get users
        admin_user = await db.scalar(select(User).where(User.email == "seanousv@gmail.com"))
        regular_user = await db.scalar(select(User).where(User.email == "seanouser@gmail.com"))

        if not admin_user or not regular_user:
            print("[WARN] ⚠️ Users not found. Please run seed_users first.")
            return

        # Sensors to seed
        sensors = [
            # Admin's Sensors
            {
                "name": "Temperature Sensor 1",
                "code": "TEMP-001",
                "sensor_type_id": sensor_types.get("Temperature"),
                "description": "Main temperature sensor",
                "is_active": True,
                "user_id": admin_user.id,
            },
            {
                "name": "GPS Module 1",
                "code": "GPS-001",
                "sensor_type_id": sensor_types.get("GPS"),
                "description": "Primary GPS module",
                "is_active": True,
                "user_id": admin_user.id,
            },
            {
                "name": "Front Camera",
                "code": "CAM-001",
                "sensor_type_id": sensor_types.get("Camera"),
                "description": "Front-facing camera",
                "is_active": True,
                "user_id": admin_user.id,
            },
            
            # Regular User's Sensors
            {
                "name": "Temperature Sensor 2",
                "code": "TEMP-002",
                "sensor_type_id": sensor_types.get("Temperature"),
                "description": "Secondary temperature sensor",
                "is_active": True,
                "user_id": regular_user.id,
            },
            {
                "name": "GPS Module 2",
                "code": "GPS-002",
                "sensor_type_id": sensor_types.get("GPS"),
                "description": "Backup GPS module",
                "is_active": True,
                "user_id": regular_user.id,
            },
            {
                "name": "Rear Camera",
                "code": "CAM-002",
                "sensor_type_id": sensor_types.get("Camera"),
                "description": "Rear-facing camera",
                "is_active": True,
                "user_id": regular_user.id,
            },
            {
                "name": "Humidity Sensor 1",
                "code": "HUM-001",
                "sensor_type_id": sensor_types.get("Humidity"),
                "description": "Environmental humidity sensor",
                "is_active": True,
                "user_id": regular_user.id,
            },
            {
                "name": "Pressure Sensor 1",
                "code": "PRES-001",
                "sensor_type_id": sensor_types.get("Pressure"),
                "description": "Atmospheric pressure sensor",
                "is_active": True,
                "user_id": regular_user.id,
            },
            {
                "name": "IMU Sensor 1",
                "code": "IMU-001",
                "sensor_type_id": sensor_types.get("IMU"),
                "description": "Inertial measurement unit",
                "is_active": True,
                "user_id": regular_user.id,
            },
            {
                "name": "Lidar Sensor 1",
                "code": "LIDAR-001",
                "sensor_type_id": sensor_types.get("Lidar"),
                "description": "360-degree lidar",
                "is_active": True,
                "user_id": regular_user.id,
            },
            {
                "name": "Sonar Sensor 1",
                "code": "SONAR-001",
                "sensor_type_id": sensor_types.get("Sonar"),
                "description": "Underwater sonar",
                "is_active": True,
                "user_id": regular_user.id,
            },
        ]

        # Create sensors
        for sensor_data in sensors:
            if sensor_data["sensor_type_id"]:  # Only create if sensor type exists
                sensor = Sensor(**sensor_data)
                db.add(sensor)

        await db.commit()
        print(f"[SUCCESS] ✅ Created {len(sensors)} sensors")
