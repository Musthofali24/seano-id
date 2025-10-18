# Quick Start Guide

## 5-Minute Setup

### 1. Clone & Navigate

```bash
git clone https://github.com/Musthofali24/seano-id.git
cd seano-id/backend
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit MQTT credentials di .env
```

### 3. Start with Docker

```bash
docker-compose up --build -d
```

### 4. Verify Running

```bash
# Check status
curl http://localhost:8000/api/mqtt/status
curl http://localhost:8000/api/ws/stats

# Open API docs
open http://localhost:8000/docs
```

### 5. Test MQTT (Optional)

```bash
# Simulate Jetson data
python jetson_simulator.py

# Check real-time WebSocket
open websocket_test_client.html
```

## ✅ Success Indicators

- MQTT Status: `{"status":"running","connected":true}`
- WebSocket Stats: `{"active_connections":0,"connections_info":[]}`
- API Docs: Accessible at `/docs`
- Database: Tables created automatically

## 🔧 Common Issues

| Issue                  | Solution                                |
| ---------------------- | --------------------------------------- |
| Port 8000 in use       | Change port di docker-compose.yml       |
| MQTT connection failed | Update credentials di .env              |
| Database error         | Check PostgreSQL di docker-compose logs |

## 📱 Mobile/Frontend Testing

1. **WebSocket Connection**:

   ```javascript
   const ws = new WebSocket("ws://localhost:8000/api/ws");
   ```

2. **API Calls**:

   ```javascript
   fetch("http://localhost:8000/vehicles");
   fetch("http://localhost:8000/sensor-logs");
   ```

3. **Real-time Data**:
   - Connect WebSocket client
   - Run `python jetson_simulator.py`
   - Watch live data stream

That's it! 🚀 SEANO backend ready untuk development.
