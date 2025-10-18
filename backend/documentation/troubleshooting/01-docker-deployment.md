# Docker Deployment Fix

## Fixed Issues

### 1. ✅ MQTT Library Update
- **Problem**: `asyncio-mqtt` deprecated dan berubah nama menjadi `aiomqtt`
- **Solution**: 
  - Update `requirements.txt` dari `asyncio-mqtt` ke `aiomqtt`
  - Update import statements di semua files
  - Fix syntax untuk `aiomqtt` API

### 2. ✅ Pydantic Settings Configuration
- **Problem**: MQTTSettings mencoba membaca semua environment variables dan error
- **Solution**: 
  - Add `env_prefix = "MQTT_"` untuk hanya baca env vars dengan prefix MQTT_
  - Add `extra = "ignore"` untuk ignore extra fields dari .env

### 3. ✅ MQTT Messages API Update
- **Problem**: `aiomqtt` menggunakan syntax berbeda untuk message iteration
- **Solution**: 
  - Change dari `async with client.messages() as messages:` 
  - Ke `async for message in client.messages:`

## Working Configuration

### requirements.txt
```
fastapi
uvicorn[standard]
psycopg[binary]
python-dotenv
pydantic
pydantic-settings
sqlalchemy[asyncio]
asyncpg
bcrypt
PyJWT
email-validator
aiomqtt
websockets
```

### MQTT Config Fix
```python
class MQTTSettings(BaseSettings):
    # ... fields ...
    
    class Config:
        env_file = ".env"
        env_prefix = "MQTT_"  # Only read MQTT_* vars
        extra = "ignore"      # Ignore extra fields
```

### MQTT Service Fix
```python
# aiomqtt syntax
async for message in client.messages:
    await self.handle_message(message.topic.value, message.payload.decode())
```

## Testing

### ✅ Docker Status
```bash
curl http://localhost:8000/api/mqtt/status
# Output: {"status":"running","connected":true}

curl http://localhost:8000/api/ws/stats  
# Output: {"active_connections":0,"connections_info":[]}
```

### ✅ Container Logs
```
INFO:app.services.mqtt_service:Connected to MQTT broker as subscriber
INFO:app.services.mqtt_service:Subscribed to topics: seano/+/raw_log, seano/+/sensor_log, seano/+/vehicle_log
```

## Next Steps

1. **Test MQTT Publishing**: Run `python jetson_simulator.py`
2. **Test WebSocket**: Open `websocket_test_client.html` 
3. **Monitor Real-time**: Check logs for incoming MQTT messages
4. **Test Frontend**: Connect WebSocket client dan lihat real-time data

Docker deployment sekarang sudah berjalan dengan baik! 🚀