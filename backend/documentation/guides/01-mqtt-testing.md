# MQTT Testing Guide - SEANO

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start Backend (MQTT Subscriber)

```bash
uvicorn app.main:app --reload
```

Backend akan otomatis:

- Connect ke MQTT broker
- Subscribe ke topics: `seano/+/raw_log`, `seano/+/sensor_log`, `seano/+/vehicle_log`
- Menunggu data dari Jetson devices

### 3. Test dengan Jetson Simulator

Di terminal kedua:

```bash
python jetson_simulator.py
```

### 4. Monitor Data

- Check logs di backend untuk melihat data yang diterima
- Check database untuk memastikan data tersimpan
- Check API: `http://localhost:8000/api/mqtt/status`

## Production Flow

```
Jetson --MQTT--> Backend --Store--> Database
```

1. **Jetson** publish data ke topics
2. **Backend** subscribe dan terima data
3. **Database** simpan data otomatis

## Topics

- `seano/1/raw_log` - Raw logs dari vehicle 1
- `seano/1/sensor_log` - Sensor data dari vehicle 1
- `seano/1/vehicle_log` - Vehicle telemetry dari vehicle 1
- `seano/2/raw_log` - Raw logs dari vehicle 2
- ... dst untuk vehicle lainnya

Sesimple itu! 🚀
