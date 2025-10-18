# MQTT Subscriber Implementation untuk SEANO

## Overview

Backend SEANO bertindak sebagai **MQTT Subscriber** yang menerima data dari Jetson devices.
Implementasi MQTT listener untuk menangani data masuk dari 3 topic utama dengan vehicle_id:

- `seano/{vehicle_id}/raw_log` - Raw log data per vehicle dari Jetson
- `seano/{vehicle_id}/sensor_log` - Sensor data per vehicle dari Jetson dengan format JSON
- `seano/{vehicle_id}/vehicle_log` - Vehicle telemetry data per vehicle dari Jetson dengan format JSON

## Data Flow

```
Jetson (Publisher) --MQTT--> Backend (Subscriber) --Store--> Database
```

## Konfigurasi MQTT

Konfigurasi MQTT disimpan di `app/config/mqtt_config.py` dan dapat dikustomisasi melalui environment variables:

```env
MQTT_BROKER=d7b48187457f4e799b84ef68d8cf8783.s1.eu.hivemq.cloud
MQTT_PORT=8883
MQTT_USERNAME=xxxxx
MQTT_PASSWORD=xxxx
MQTT_TOPIC_RAW_LOG=seano/+/raw_log
MQTT_TOPIC_SENSOR_LOG=seano/+/sensor_log
MQTT_TOPIC_VEHICLE_LOG=seano/+/vehicle_log
MQTT_USE_TLS=true
```

**Catatan**: Tanda `+` adalah wildcard MQTT yang menangkap semua vehicle_id.

## Format Data

### Raw Log Topic (`seano/{vehicle_id}/raw_log`)

- **Format**: Plain text
- **Example Topic**: `seano/1/raw_log`
- **Example**: "Raw log message from device"
- **Disimpan ke**: `raw_logs` table dengan field `logs` (JSON) yang berisi:
  ```json
  {
    "vehicle_id": 1,
    "message": "Raw log message from device",
    "timestamp": "2025-10-18T10:30:00"
  }
  ```

### Sensor Log Topic (`seano/{vehicle_id}/sensor_log`)

- **Format**: JSON
- **Example Topic**: `seano/1/sensor_log`
- **Example**:

```json
{
  "sensor_id": 1,
  "data": {
    "temperature": 25.5,
    "humidity": 60.2,
    "timestamp": "2025-10-18T10:30:00"
  }
}
```

- **Disimpan ke**: `sensor_logs` table (vehicle_id diambil dari topic)

### Vehicle Log Topic (`seano/{vehicle_id}/vehicle_log`)

- **Format**: JSON
- **Example Topic**: `seano/1/vehicle_log`
- **Example**:

```json
{
  "battery_voltage": 12.6,
  "battery_current": 2.5,
  "rssi": -45,
  "mode": "AUTO",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "heading": 45.0,
  "armed": true,
  "guided": false,
  "system_status": "STANDBY",
  "speed": 15.5
}
```

- **Disimpan ke**: `vehicle_logs` table (vehicle_id diambil dari topic)

## Struktur File

```
backend/
├── app/
│   ├── config/
│   │   ├── __init__.py
│   │   └── mqtt_config.py         # Konfigurasi MQTT
│   ├── services/
│   │   └── mqtt_service.py        # MQTT listener service
│   ├── routes/
│   │   └── mqtt.py                # API endpoints untuk monitoring MQTT
│   └── main.py                    # Integration dengan FastAPI
├── test_mqtt_publisher.py         # Script untuk testing
└── requirements.txt               # Dependencies termasuk paho-mqtt & asyncio-mqtt
```

## Dependencies Baru

Ditambahkan ke `requirements.txt`:

- `paho-mqtt` - MQTT client library
- `asyncio-mqtt` - Async wrapper untuk paho-mqtt

## Fitur

### 1. Auto-reconnect

MQTT listener secara otomatis akan mencoba reconnect jika koneksi terputus dengan delay 5 detik.

### 2. SSL/TLS Support

Menggunakan SSL/TLS untuk koneksi aman ke HiveMQ Cloud.

### 3. Error Handling

- JSON parsing errors untuk sensor_log dan vehicle_log
- Database transaction rollback pada error
- Logging untuk monitoring dan debugging

### 4. Monitoring Endpoints

- `GET /api/mqtt/status` - Cek status MQTT listener
- `POST /api/mqtt/start` - Start MQTT listener (manual)
- `POST /api/mqtt/stop` - Stop MQTT listener

## Cara Menjalankan

1. **Update environment variables**:
   Copy `.env.example` ke `.env` dan update konfigurasi MQTT:

   ```bash
   cp .env.example .env
   # Edit .env file dengan credentials MQTT yang benar
   ```

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Run aplikasi**:

   ```bash
   uvicorn app.main:app --reload
   ```

   Atau dengan Docker:

   ```bash
   docker-compose up --build
   ```

## Testing

Gunakan `test_mqtt_publisher.py` untuk testing:

```bash
cd backend
python test_mqtt_publisher.py
```

Script ini akan mengirim sample data ke semua topic MQTT.

## Monitoring

- Check log aplikasi untuk melihat status koneksi MQTT
- Gunakan endpoint `/api/mqtt/status` untuk monitoring status
- Data yang masuk akan tersimpan otomatis ke database

## Error Handling

1. **Koneksi MQTT gagal**: Auto-reconnect dengan delay 5 detik
2. **JSON invalid**: Error dicatat di log, message diabaikan
3. **Database error**: Transaction rollback, error dicatat di log
4. **SSL/TLS error**: Periksa konfigurasi broker dan credentials

## Security

- Menggunakan TLS encryption untuk koneksi MQTT
- Credentials disimpan di environment variables
- Database session management yang aman
