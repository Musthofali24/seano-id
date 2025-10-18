# Complete Testing Guide

## Testing Overview

SEANO backend memiliki 3 layer testing:

1. **Unit Tests** - Individual functions
2. **Integration Tests** - MQTT + Database + WebSocket
3. **End-to-End Tests** - Full workflow testing

## 1. Unit Tests

### Run Unit Tests

```bash
# Run all tests
./run_tests.sh

# Run specific test file
pytest tests/test_sensor.py

# Run with coverage
pytest --cov=app tests/
```

### Test Categories

- **Database Models**: `tests/test_*.py`
- **API Endpoints**: Route testing dengan test client
- **Authentication**: JWT dan user management

## 2. MQTT Testing

### Test MQTT Subscriber

```bash
# Terminal 1: Start backend
uvicorn app.main:app --reload

# Terminal 2: Check MQTT status
curl http://localhost:8000/api/mqtt/status

# Terminal 3: Simulate Jetson data
python jetson_simulator.py
```

### Expected Results

```json
// MQTT Status
{"status":"running","connected":true}

// Backend logs should show:
INFO: Connected to MQTT broker as subscriber
INFO: Subscribed to topics: seano/+/raw_log, seano/+/sensor_log, seano/+/vehicle_log
INFO: Raw log saved for vehicle 1
INFO: Sensor log saved for vehicle 1
INFO: Vehicle log saved for vehicle 1
```

### Custom MQTT Testing

```python
# Use mqtt_publisher_helper.py
from mqtt_publisher_helper import MQTTPublisher

publisher = MQTTPublisher()

# Test raw log
await publisher.publish_raw_log(1, "Test message")

# Test sensor data
await publisher.publish_sensor_log(1, 5, {
    "temperature": 25.5,
    "humidity": 60.0
})

# Test vehicle data
await publisher.publish_vehicle_log(1, {
    "battery_voltage": 12.4,
    "speed": 15.2
})
```

## 3. WebSocket Testing

### Browser Testing

```bash
# Open WebSocket test client
open websocket_test_client.html

# Connect to WebSocket
# Run MQTT simulator
# Watch real-time data updates
```

### Programmatic Testing

```javascript
// Test WebSocket connection
const ws = new WebSocket("ws://localhost:8000/api/ws");

ws.onopen = () => {
  console.log("Connected to SEANO WebSocket");

  // Send ping
  ws.send(
    JSON.stringify({
      type: "ping",
      timestamp: new Date().toISOString(),
    })
  );
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);

  // Should receive pong response dan real-time data
};
```

### Expected WebSocket Messages

```json
// Connection message
{
  "type": "connection",
  "message": "Connected to SEANO real-time data stream",
  "timestamp": "2025-10-18T16:30:00.123Z",
  "connection_count": 1
}

// Raw log message
{
  "type": "raw_log",
  "vehicle_id": 1,
  "data": "Test message",
  "timestamp": "2025-10-18T16:30:00.123Z"
}

// Sensor log message
{
  "type": "sensor_log",
  "vehicle_id": 1,
  "sensor_id": 5,
  "data": {"temperature": 25.5},
  "timestamp": "2025-10-18T16:30:00.123Z"
}
```

## 4. API Testing

### Basic API Tests

```bash
# Health check
curl http://localhost:8000/

# Get all vehicles
curl http://localhost:8000/vehicles

# Get sensor logs
curl http://localhost:8000/sensor-logs

# Get vehicle logs
curl http://localhost:8000/vehicle-logs

# MQTT status
curl http://localhost:8000/api/mqtt/status

# WebSocket stats
curl http://localhost:8000/api/ws/stats
```

### Authentication Testing

```bash
# Register user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token for protected endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/protected-endpoint
```

## 5. Database Testing

### Manual Database Checks

```sql
-- Connect to database
docker exec -it seano_timescaledb psql -U postgres -d seano_db

-- Check tables
\dt

-- Check raw logs
SELECT * FROM raw_logs ORDER BY created_at DESC LIMIT 5;

-- Check sensor logs
SELECT * FROM sensor_logs ORDER BY created_at DESC LIMIT 5;

-- Check vehicle logs
SELECT * FROM vehicle_logs ORDER BY created_at DESC LIMIT 5;

-- Check data by vehicle
SELECT vehicle_id, COUNT(*) as log_count
FROM vehicle_logs
GROUP BY vehicle_id;
```

## 6. Performance Testing

### Load Testing MQTT

```python
# test_mqtt_load.py
import asyncio
import time
from mqtt_publisher_helper import MQTTPublisher

async def load_test():
    publisher = MQTTPublisher()

    start_time = time.time()
    tasks = []

    # Send 100 messages concurrently
    for i in range(100):
        tasks.append(publisher.publish_raw_log(1, f"Load test message {i}"))

    await asyncio.gather(*tasks)

    end_time = time.time()
    print(f"Sent 100 messages in {end_time - start_time:.2f} seconds")

# Run: python -c "import asyncio; asyncio.run(load_test())"
```

### WebSocket Connection Testing

```javascript
// Test multiple WebSocket connections
const connections = [];
for (let i = 0; i < 10; i++) {
  const ws = new WebSocket("ws://localhost:8000/api/ws");
  connections.push(ws);
}

// Check connection stats
fetch("http://localhost:8000/api/ws/stats")
  .then((r) => r.json())
  .then((data) =>
    console.log(`Active connections: ${data.active_connections}`)
  );
```

## 7. Integration Testing

### Full Workflow Test

```bash
# 1. Start backend
docker-compose up -d

# 2. Wait for services
sleep 10

# 3. Test MQTT
python jetson_simulator.py

# 4. Test WebSocket
node test_websocket_client.js

# 5. Check database
docker exec seano_timescaledb psql -U postgres -d seano_db -c "SELECT COUNT(*) FROM vehicle_logs;"

# 6. Test API
curl http://localhost:8000/vehicle-logs | jq length
```

## 8. Troubleshooting Tests

### Common Test Failures

| Test Failure                 | Possible Cause       | Solution                              |
| ---------------------------- | -------------------- | ------------------------------------- |
| MQTT connection timeout      | Wrong credentials    | Check .env MQTT settings              |
| WebSocket connection refused | Backend not running  | Start uvicorn server                  |
| Database connection error    | PostgreSQL not ready | Wait longer or check docker-compose   |
| Import errors                | Missing dependencies | Run `pip install -r requirements.txt` |

### Debug Mode Testing

```bash
# Run backend dengan debug logs
PYTHONPATH=. LOG_LEVEL=DEBUG uvicorn app.main:app --reload

# Check specific component
export MQTT_DEBUG=true
python -c "from app.services.mqtt_service import mqtt_listener"
```

## Test Automation

### CI/CD Testing

```yaml
# .github/workflows/test.yml
name: Test SEANO Backend
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: "3.11"
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest
      - name: Test Docker build
        run: docker-compose build
```

Dengan testing guide ini, semua aspek SEANO backend bisa di-test secara comprehensive! 🧪
