#!/usr/bin/env python3
"""
MQTT Worker untuk stress test
- Subscribe ke MQTT topic
- Insert data ke PostgreSQL vehicle_logs table
- Publish ACK response
"""

import json
import time
import psycopg2
from datetime import datetime
import paho.mqtt.client as mqtt

# ============================
# KONFIGURASI DATABASE
# ============================
DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "seano_db"
DB_USER = "postgres"
DB_PASS = "da25f4bcdfe0147"

# ============================
# KONFIGURASI MQTT CLOUD
# ============================
MQTT_BROKER = "mqtt.seano.cloud"
MQTT_PORT = 8883
MQTT_USER = "seanomqtt"
MQTT_PASS = "Seano2025*"
MQTT_USE_TLS = True

TOPIC_SUB = "seano/USV-K47/vehicle_log"
TOPIC_ACK = "seano/USV-K47/ack"

# ============================
# GLOBAL VARIABLES
# ============================
conn = None
cursor = None
msg_count = 0
db_success_count = 0
db_failed_count = 0


# ============================
# DATABASE CONNECTION
# ============================
def connect_db():
    """Establish database connection"""
    global conn, cursor
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, database=DB_NAME, user=DB_USER, password=DB_PASS
        )
        cursor = conn.cursor()
        print("✅ PostgreSQL connected successfully")
        return True
    except Exception as e:
        print(f"❌ PostgreSQL connection error: {e}")
        return False


def close_db():
    """Close database connection"""
    global conn, cursor
    if cursor:
        cursor.close()
    if conn:
        conn.close()
    print("✅ Database connection closed")


# ============================
# SIMPAN DATA KE DATABASE
# ============================
def save_to_db(data):
    """Insert vehicle log data ke database"""
    global db_success_count, db_failed_count, cursor, conn
    
    try:
        # First, ensure vehicle exists
        vehicle_id = data.get("vehicle_id", 1)
        check_vehicle = "SELECT id FROM vehicles WHERE id = %s"
        cursor.execute(check_vehicle, (vehicle_id,))
        
        if not cursor.fetchone():
            # Insert vehicle if not exists
            insert_vehicle = """
                INSERT INTO vehicles (name, code, user_id, status)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """
            cursor.execute(insert_vehicle, (f"Vehicle {vehicle_id}", f"USV-K{vehicle_id}", 1, "active"))
            conn.commit()
        
        # Now insert vehicle log
        sql = """
            INSERT INTO vehicle_logs (
                vehicle_id, battery_voltage, battery_current, rssi, mode,
                latitude, longitude, altitude, gps_fix, heading, speed,
                roll, pitch, yaw, temperature, armed, guided, system_status,
                created_at
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s, NOW())
        """

        values = (
            vehicle_id,
            data.get("battery_voltage"),
            data.get("battery_current"),
            data.get("rssi"),
            data.get("mode"),
            data.get("latitude"),
            data.get("longitude"),
            data.get("altitude"),
            data.get("gps_fix"),
            data.get("heading"),
            data.get("speed"),
            data.get("roll"),
            data.get("pitch"),
            data.get("yaw"),
            data.get("temperature"),
            data.get("armed"),
            data.get("guided"),
            data.get("system_status"),
        )

        cursor.execute(sql, values)
        conn.commit()
        db_success_count += 1
        return True
        
    except Exception as e:
        # Rollback on error
        try:
            conn.rollback()
        except:
            pass
        print(f"❌ DB Error: {e}")
        db_failed_count += 1
        return False
# ============================
# MQTT CALLBACKS
# ============================
def on_connect(client, userdata, flags, rc, properties=None):
    """Callback saat connect ke broker"""
    if rc == 0:
        print(f"✅ Connected to MQTT broker")
        client.subscribe(TOPIC_SUB, qos=1)
        print(f"✅ Subscribed to topic: {TOPIC_SUB}")
    else:
        print(f"❌ Connection failed with code {rc}")


def on_message(client, userdata, msg):
    """Callback saat menerima message"""
    global msg_count

    try:
        payload = json.loads(msg.payload.decode())
        msg_count += 1

        # Print received message
        print(f"\n📩 Message #{msg_count} received")
        print(f"   sent_at: {payload.get('sent_at')}")

        # Save to database
        if save_to_db(payload):
            print(f"   ✅ Saved to database")

            # Send ACK
            ack_payload = {
                "sent_at": payload.get("sent_at"),
                "received_at": time.time(),
                "status": "success",
            }
            client.publish(TOPIC_ACK, json.dumps(ack_payload), qos=1)
        else:
            print(f"   ❌ Failed to save to database")

    except json.JSONDecodeError:
        print(f"❌ Failed to parse JSON: {msg.payload}")
    except Exception as e:
        print(f"❌ Error processing message: {e}")


def on_disconnect(client, userdata, disconnect_flags, reason_code, properties=None):
    """Callback saat disconnect"""
    if reason_code == 0:
        print("✅ Disconnected from MQTT broker")
    else:
        print(f"❌ Unexpected disconnection with code {reason_code}")


# ============================
# MAIN
# ============================
def main():
    """Main function"""
    global conn, cursor, msg_count, db_success_count, db_failed_count

    print("\n" + "=" * 60)
    print("  🔌 MQTT WORKER - STRESS TEST DATA COLLECTOR")
    print("=" * 60)
    print(f"MQTT Broker: {MQTT_BROKER}:{MQTT_PORT}")
    print(f"Subscribe:   {TOPIC_SUB}")
    print(f"ACK Topic:   {TOPIC_ACK}")
    print(f"Database:    {DB_HOST}:{DB_PORT}/{DB_NAME}")
    print("=" * 60 + "\n")

    # Connect to database
    if not connect_db():
        print("❌ Tidak bisa terhubung ke database. Exit.")
        return

    # Setup MQTT client
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    if MQTT_USER and MQTT_PASS:
        client.username_pw_set(MQTT_USER, MQTT_PASS)
        if MQTT_USE_TLS:
            client.tls_set()
        print(f"🔐 MQTT auth enabled (TLS: {MQTT_USE_TLS})")
    else:
        print("🔓 MQTT auth disabled")  # Set callbacks
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect

    # Connect to broker
    try:
        print(f"\n🔌 Connecting to MQTT broker...")
        client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
        client.loop_start()

        print("\n✅ MQTT Worker is running. Waiting for messages...")
        print("   Press Ctrl+C to stop.\n")

        # Keep running
        while True:
            time.sleep(1)

    except Exception as e:
        print(f"❌ Connection error: {e}")

    except KeyboardInterrupt:
        print("\n\n⏹️  Shutting down...")
        client.loop_stop()
        client.disconnect()

        # Print statistics
        print("\n" + "=" * 60)
        print("  📊 MQTT WORKER STATISTICS")
        print("=" * 60)
        print(f"Total messages received: {msg_count}")
        print(f"Database inserts success: {db_success_count}")
        print(f"Database inserts failed:  {db_failed_count}")
        print("=" * 60 + "\n")

        close_db()


if __name__ == "__main__":
    main()
