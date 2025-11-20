#!/usr/bin/env python3
"""
Check MQTT Data in Database
- Verify data dari stress test masuk ke vehicle_logs table
"""

import psycopg2
from datetime import datetime, timedelta

DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "seano_db"
DB_USER = "postgres"
DB_PASS = "da25f4bcdfe0147"

print("\n" + "=" * 70)
print("  📊 CHECKING MQTT DATA IN DATABASE")
print("=" * 70 + "\n")

try:
    # Connect to database
    print("🔌 Connecting to PostgreSQL...")
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, database=DB_NAME, user=DB_USER, password=DB_PASS
    )
    cursor = conn.cursor()
    print("✅ Connected to database\n")

    # Check total records in vehicle_logs
    print("📋 Checking vehicle_logs table...")
    cursor.execute("SELECT COUNT(*) FROM vehicle_logs")
    total_count = cursor.fetchone()[0]
    print(f"   Total records: {total_count}")

    # Check records from last 5 minutes (recent from stress test)
    five_min_ago = datetime.now() - timedelta(minutes=5)
    cursor.execute(
        "SELECT COUNT(*) FROM vehicle_logs WHERE created_at >= %s", (five_min_ago,)
    )
    recent_count = cursor.fetchone()[0]
    print(f"   Records from last 5 minutes: {recent_count}")

    # Show recent records
    if recent_count > 0:
        print(f"\n📍 Last 10 records:")
        cursor.execute(
            """
            SELECT id, vehicle_id, latitude, longitude, temperature, 
                   battery_voltage, created_at
            FROM vehicle_logs 
            WHERE created_at >= %s
            ORDER BY created_at DESC 
            LIMIT 10
        """,
            (five_min_ago,),
        )

        records = cursor.fetchall()
        for i, record in enumerate(records, 1):
            id, vehicle_id, lat, lon, temp, batt, created_at = record
            print(
                f"   {i}. ID={id} | Vehicle={vehicle_id} | Lat={lat} | Lon={lon} | Temp={temp}°C | Volt={batt}V | {created_at}"
            )

    # Summary by vehicle_id
    print(f"\n🚗 Summary by Vehicle:")
    cursor.execute(
        """
        SELECT vehicle_id, COUNT(*) as count
        FROM vehicle_logs
        WHERE created_at >= %s
        GROUP BY vehicle_id
        ORDER BY count DESC
    """,
        (five_min_ago,),
    )

    vehicle_summary = cursor.fetchall()
    if vehicle_summary:
        for vehicle_id, count in vehicle_summary:
            print(f"   Vehicle {vehicle_id}: {count} records")
    else:
        print("   No vehicles found in recent data")

    cursor.close()
    conn.close()

    print("\n" + "=" * 70)
    if recent_count > 0:
        print(f"✅ SUCCESS: {recent_count} MQTT records found in database!")
    else:
        print("⚠️  WARNING: No recent MQTT records found in database")
    print("=" * 70 + "\n")

except Exception as e:
    print(f"❌ Error: {e}\n")
