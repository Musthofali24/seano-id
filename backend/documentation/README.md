# SEANO Backend Documentation

Dokumentasi lengkap dan terstruktur untuk SEANO Backend System.

## 📁 Struktur Dokumentasi

### 🚀 Setup & Installation
- [**Installation Guide**](setup/01-installation.md) - Setup lengkap dari awal
- [**Quick Start**](setup/02-quick-start.md) - Setup 5 menit untuk development

### 📡 API Documentation  
- [**MQTT Subscriber**](api/01-mqtt-subscriber.md) - Real-time data dari Jetson devices
- [**WebSocket Real-time**](api/02-websocket-realtime.md) - Streaming data ke frontend
- [**Database Models**](api/03-database-models.md) - Schema dan relationships
- [**Authentication**](api/04-authentication.md) - JWT dan user management

### 📚 Guides & Tutorials
- [**MQTT Testing**](guides/01-mqtt-testing.md) - Testing MQTT functionality
- [**Vehicle ID Topics**](guides/02-vehicle-id-topics.md) - Topic patterns untuk multiple vehicles  
- [**Comprehensive Testing**](guides/03-comprehensive-testing.md) - Unit, integration, E2E testing

### 🛠️ Troubleshooting
- [**Docker Deployment**](troubleshooting/01-docker-deployment.md) - Fix common Docker issues

## 🏗️ System Architecture

```
┌─────────────────┐    MQTT     ┌─────────────────┐    Store    ┌─────────────────┐
│ Jetson Devices  │ ────────── │ Backend SEANO   │ ─────────── │ PostgreSQL DB   │
│ (Publishers)    │             │ (Subscriber)    │             │                 │
└─────────────────┘             └─────────────────┘             └─────────────────┘
                                         │
                                    REST API &
                                    WebSocket
                                         │
                                ┌─────────────────┐
                                │ Frontend Client │
                                │ (Real-time UI)  │
                                └─────────────────┘
```

## ⚡ Quick Navigation

| Untuk | Lihat Dokumentasi |
|-------|-------------------|
| **Setup baru** | [Installation Guide](setup/01-installation.md) |
| **Quick development** | [Quick Start](setup/02-quick-start.md) |
| **Test MQTT** | [MQTT Testing](guides/01-mqtt-testing.md) |
| **Real-time frontend** | [WebSocket Guide](api/02-websocket-realtime.md) |
| **Database schema** | [Database Models](api/03-database-models.md) |
| **Docker masalah** | [Docker Troubleshooting](troubleshooting/01-docker-deployment.md) |

## 🔌 Key Endpoints

### API Endpoints
- `GET /docs` - Swagger API documentation  
- `GET /vehicles` - List all vehicles
- `GET /sensor-logs` - Sensor data history
- `GET /vehicle-logs` - Vehicle telemetry history

### Real-time Endpoints  
- `ws://localhost:8000/api/ws` - General WebSocket stream
- `ws://localhost:8000/api/ws/vehicle/{id}` - Vehicle-specific stream
- `GET /api/mqtt/status` - MQTT connection status
- `GET /api/ws/stats` - WebSocket connection statistics

## 📋 MQTT Topics

Backend subscribe ke topics:
```
seano/{vehicle_id}/raw_log      # Raw logs dari Jetson
seano/{vehicle_id}/sensor_log   # Sensor readings
seano/{vehicle_id}/vehicle_log  # Vehicle telemetry
```

## 🚀 Data Flow

1. **Jetson devices** publish data ke MQTT broker
2. **Backend** subscribe dan receive real-time data
3. **Database** store data dengan vehicle_id
4. **WebSocket** broadcast ke connected frontend clients  
5. **Frontend** display real-time updates

## 🎯 Development Workflow

1. **Setup**: Follow [Installation Guide](setup/01-installation.md)
2. **Configure**: Update .env dengan MQTT credentials
3. **Test**: Use [Testing Guides](guides/)
4. **Develop**: Build frontend dengan WebSocket integration
5. **Deploy**: Use Docker deployment

## 📖 Documentation Standards

### Naming Convention
- **Files**: `##-descriptive-name.md` (numbered for order)
- **Folders**: Categorical grouping (setup, api, guides, troubleshooting)
- **Links**: Relative paths untuk internal references

### Content Structure
- **Problem/Solution oriented** documentation
- **Step-by-step guides** dengan code examples
- **Clear navigation** dan cross-references
- **Troubleshooting tips** di setiap section

---

**🚀 SEANO - Smart Electronic Autonomous Navigation Operation**

📧 **Support**: Check troubleshooting guides atau create issue di GitHub