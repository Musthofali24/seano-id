# SEANO Backend

Backend API untuk sistem monitoring kendaraan SEANO dengan MQTT integration.

## Quick Start

### 1. Setup Environment

```bash
cp .env.example .env
# Edit .env dengan konfigurasi yang sesuai
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run Backend

```bash
uvicorn app.main:app --reload
```

### 4. Test MQTT (Development)

```bash
python jetson_simulator.py
```

## Features

- ✅ **RESTful API** - CRUD operations untuk semua entitas
- ✅ **MQTT Subscriber** - Real-time data dari Jetson devices
- ✅ **Authentication** - JWT-based auth system
- ✅ **Database** - PostgreSQL dengan SQLAlchemy
- ✅ **Docker Support** - Container-ready deployment

## API Endpoints

- `GET /` - Health check
- `GET /api/mqtt/status` - MQTT connection status
- `GET /sensors` - List sensors
- `GET /vehicles` - List vehicles
- `GET /sensor-logs` - Sensor data logs
- `GET /vehicle-logs` - Vehicle telemetry logs
- `GET /raw-logs` - Raw logs

## Documentation

📚 **Dokumentasi lengkap tersedia di folder `documentation/`:**

- [**Installation Guide**](documentation/setup/01-installation.md) - Setup lengkap dari awal
- [**Quick Start**](documentation/setup/02-quick-start.md) - Setup 5 menit untuk development
- [**MQTT Subscriber**](documentation/api/01-mqtt-subscriber.md) - Real-time data dari Jetson devices
- [**WebSocket Real-time**](documentation/api/02-websocket-realtime.md) - Streaming data ke frontend
- [**Database Models**](documentation/api/03-database-models.md) - Schema dan relationships
- [**MQTT Testing**](documentation/guides/01-mqtt-testing.md) - Testing MQTT functionality
- [**Vehicle ID Topics**](documentation/guides/02-vehicle-id-topics.md) - Topic patterns untuk multiple vehicles

## Architecture

```
Jetson Devices (Publishers)
    ↓ MQTT
HiveMQ Cloud Broker
    ↓ MQTT
Backend (Subscriber)
    ↓ Store
PostgreSQL Database
    ↓ API
Frontend Client
```

## MQTT Topics

Backend subscribe ke:

- `seano/{vehicle_id}/raw_log` - Raw logs
- `seano/{vehicle_id}/sensor_log` - Sensor data
- `seano/{vehicle_id}/vehicle_log` - Vehicle telemetry

## Development

```bash
# Run tests
./run_tests.sh

# Format code
black app/

# Start with Docker
docker-compose up --build
```

## Production Deployment

1. Update `.env` dengan production values
2. Run dengan Docker: `docker-compose up -d`
3. Configure Jetson devices untuk publish ke MQTT topics
4. Monitor logs dan database

---

**🚀 SEANO - Smart Electronic Autonomous Navigation Operation**
