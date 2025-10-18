# SEANO Backend Setup Guide

## Quick Start

### 1. Prerequisites

- Python 3.11+
- PostgreSQL (or use Docker)
- Git

### 2. Clone Repository

```bash
git clone https://github.com/Musthofali24/seano-id.git
cd seano-id/backend
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file dengan konfigurasi yang sesuai
# Update database, MQTT, dan JWT configurations
```

### 4. Install Dependencies

```bash
# Create virtual environment (optional)
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install requirements
pip install -r requirements.txt
```

### 5. Database Setup

```bash
# Option 1: Docker (Recommended)
docker-compose up -d db

# Option 2: Local PostgreSQL
# Create database manually dan update .env
```

### 6. Run Application

```bash
# Development
uvicorn app.main:app --reload

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Docker (Full Stack)
docker-compose up --build
```

### 7. Verify Installation

- API Docs: http://localhost:8000/docs
- MQTT Status: http://localhost:8000/api/mqtt/status
- WebSocket Stats: http://localhost:8000/api/ws/stats

## Environment Variables

### Database Configuration

```env
DB_HOST=localhost          # or 'db' for Docker
DB_PORT=5432
DB_NAME=seano_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### MQTT Configuration

```env
MQTT_BROKER=your-hivemq-broker.com
MQTT_PORT=8883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password
MQTT_TOPIC_RAW_LOG=seano/+/raw_log
MQTT_TOPIC_SENSOR_LOG=seano/+/sensor_log
MQTT_TOPIC_VEHICLE_LOG=seano/+/vehicle_log
MQTT_USE_TLS=true
```

### Authentication Configuration

```env
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ADMIN_EMAIL=admin@seano.com
ADMIN_PASSWORD=secure_password
```

## Docker Deployment

### Production Setup

```bash
# Build dan run semua services
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs backend
```

### Development Setup

```bash
# Run database only
docker-compose up -d db

# Run backend di local untuk development
uvicorn app.main:app --reload
```

## Project Structure

```
backend/
├── app/
│   ├── config/           # Configuration files
│   ├── models/           # Database models
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic services
│   └── schemas/          # Pydantic schemas
├── documentation/        # Documentation files
├── tests/               # Unit tests
├── requirements.txt     # Python dependencies
├── docker-compose.yml   # Docker configuration
└── Dockerfile          # Backend container
```

## Next Steps

1. **Configure MQTT**: Update credentials untuk HiveMQ Cloud
2. **Setup Jetson**: Configure Jetson devices untuk publish data
3. **Test Integration**: Use guides dalam folder `guides/`
4. **Deploy Production**: Follow Docker deployment guide

## Troubleshooting

Jika ada masalah, check dokumentasi di `troubleshooting/` folder atau:

- Check logs: `docker-compose logs backend`
- Verify environment: Review `.env` file
- Test connections: Use API endpoints untuk status
- Database issues: Check PostgreSQL connection

---

**📚 Dokumentasi lengkap tersedia di folder documentation/**
