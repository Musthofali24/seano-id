# MQTT Subscriber per Vehicle - SEANO Project

## Overview

Backend SEANO bertindak sebagai **MQTT Subscriber** yang menerima data dari Jetson devices (yang bertindak sebagai MQTT Publishers).

## Topic Pattern

Backend subscribe ke topics dengan pattern:

```
seano/{vehicle_id}/raw_log      # Raw log data dari Jetson
seano/{vehicle_id}/sensor_log   # Sensor data dari Jetson
seano/{vehicle_id}/vehicle_log  # Vehicle telemetry dari Jetson
```

## Data Flow

```
Jetson (Publisher) --MQTT--> Backend (Subscriber) --Store--> Database
```

## Data Flow

```
Jetson (Publisher) --MQTT--> Backend (Subscriber) --Store--> Database
```

## Format Data yang Diterima dari Jetson

### 1. Raw Log dari Jetson (Vehicle ID = 1)

**Topic**: `seano/1/raw_log`
**Payload yang dikirim Jetson**: Plain text

```
System startup completed successfully
```

### 2. Sensor Log dari Jetson (Vehicle ID = 1)

**Topic**: `seano/1/sensor_log`
**Payload yang dikirim Jetson**: JSON

```json
{
  "sensor_id": 5,
  "data": {
    "temperature": 28.5,
    "humidity": 65.3,
    "pressure": 1013.25,
    "timestamp": "2025-10-18T10:30:00"
  }
}
```

### 3. Vehicle Log dari Jetson (Vehicle ID = 1)

**Topic**: `seano/1/vehicle_log`
**Payload yang dikirim Jetson**: JSON

```json
{
  "battery_voltage": 12.4,
  "battery_current": 1.8,
  "rssi": -38,
  "mode": "GUIDED",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "heading": 90.0,
  "armed": true,
  "guided": true,
  "system_status": "ACTIVE",
  "speed": 12.5
}
```

## Backend MQTT Subscriber Implementation

### 1. MQTT Listener (Subscriber)

- **Subscribes** ke wildcard topics: `seano/+/raw_log`, `seano/+/sensor_log`, `seano/+/vehicle_log`
- **Receives** data dari semua Jetson devices
- **Extracts** `vehicle_id` dari topic path
- **Validates** `vehicle_id` sebagai integer
- **Stores** data ke database dengan vehicle_id yang benar

### 2. Data Processing

- **Raw Log**: vehicle_id + message disimpan dalam JSON format di field `logs`
- **Sensor Log**: vehicle_id diambil dari topic, sensor data disimpan ke `sensor_logs` table
- **Vehicle Log**: vehicle_id diambil dari topic, telemetry disimpan ke `vehicle_logs` table

### 3. Monitoring

- Backend menyediakan API endpoints untuk monitoring status subscriber
- Logging untuk tracking data yang diterima dari setiap vehicle

## File Test Publisher (Untuk Development/Testing)

**CATATAN**: File `jetson_simulator.py` dan `mqtt_publisher_helper.py` hanya untuk testing development.
Di production, Jetson devices yang akan bertindak sebagai publisher.

## Production Setup

Dalam production:

1. **Jetson devices** (di kendaraan) = MQTT Publishers
2. **Backend SEANO** = MQTT Subscriber
3. **HiveMQ Cloud** = MQTT Broker

## Jetson Device Publishing

Jetson harus dikonfigurasi untuk publish ke topics:

```python
# Contoh di Jetson (Python)
import paho.mqtt.client as mqtt
import json

client = mqtt.Client()
client.username_pw_set("username", "password")
client.connect("d7b48187457f4e799b84ef68d8cf8783.s1.eu.hivemq.cloud", 8883, 60)

# Jetson vehicle ID = 1
vehicle_id = 1

# Publish raw log
client.publish(f"seano/{vehicle_id}/raw_log", "GPS initialized")

# Publish sensor data
sensor_data = {"sensor_id": 1, "data": {"temp": 25.5}}
client.publish(f"seano/{vehicle_id}/sensor_log", json.dumps(sensor_data))

# Publish vehicle telemetry
telemetry = {"battery_voltage": 12.4, "speed": 15.2}
client.publish(f"seano/{vehicle_id}/vehicle_log", json.dumps(telemetry))
```

## Testing Subscriber

```bash
# Install dependencies
pip install -r requirements.txt

# Test subscriber dengan mensimulasikan data dari Jetson
python jetson_simulator.py

# Atau gunakan helper untuk testing custom data
python mqtt_publisher_helper.py

# Jalankan backend untuk testing real-time
uvicorn app.main:app --reload
```

Scripts tersebut mensimulasikan data yang akan dikirim oleh Jetson untuk memastikan backend subscriber dapat menerima dan menyimpan data dengan benar.
