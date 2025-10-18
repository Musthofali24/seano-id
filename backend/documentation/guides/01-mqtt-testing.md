# MQTT Testing Guide - SEANO

## Quick Start

### 1. Start Backend dengan Docker

```bash
cd /home/almus2610/seano_projects
docker-compose up -d
```

### 2. Verify Backend Running

```bash
# Check containers
docker-compose ps

# Check backend logs
docker-compose logs backend

# Check MQTT status
curl http://localhost:8000/api/mqtt/status
```

Backend akan otomatis:

- Connect ke MQTT broker
- Subscribe ke topics: `seano/+/raw_log`, `seano/+/sensor_log`, `seano/+/vehicle_log`
- Menunggu data dari Jetson devices

### 3. Test dengan Jetson Simulator

Di terminal lain (tidak perlu di dalam container):

```bash
cd /home/almus2610/seano_projects/backend
python jetson_simulator.py
```

### 4. Monitor Data

- Check backend logs: `docker-compose logs -f backend`
- Check database untuk memastikan data tersimpan
- Check API: `http://localhost:8000/api/mqtt/status`
- Check WebSocket: `http://localhost:8000/api/ws/stats`

## Production Flow

```
Jetson --MQTT--> Backend (Docker) --Store--> Database (Docker)
```

1. **Jetson** publish data ke topics
2. **Backend** (running in Docker) subscribe dan terima data
3. **Database** (PostgreSQL in Docker) simpan data otomatis

## Docker Commands

```bash
# Start semua services
docker-compose up -d

# Stop semua services
docker-compose down

# Restart backend saja
docker-compose restart backend

# Check logs
docker-compose logs -f backend

# Check status containers
docker-compose ps
```

## Topics

- `seano/1/raw_log` - Raw logs dari vehicle 1
- `seano/1/sensor_log` - Sensor data dari vehicle 1
- `seano/1/vehicle_log` - Vehicle telemetry dari vehicle 1
- `seano/2/raw_log` - Raw logs dari vehicle 2
- ... dst untuk vehicle lainnya

Sesimple itu! 🚀
