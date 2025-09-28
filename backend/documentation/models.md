# Data Models

Database structure untuk SEANO IoT Backend API.

## Database: TimescaleDB (PostgreSQL + time-series)

## Models

### 1. Vehicle (Kendaraan)

```
id: int (primary key)
name: string (required)
description: text
status: string (default: "idle")
created_at: datetime
```

### 2. Sensor Type (Jenis Sensor)

```
id: int (primary key)
name: string (required)
description: text
created_at: datetime
updated_at: datetime
```

### 3. Sensor (Device Sensor)

```
id: int (primary key)
name: string (required)
sensor_type_id: int (foreign key)
description: text
is_active: boolean (default: true)
created_at: datetime
updated_at: datetime
```

### 4. Sensor Log (Data Time-series)

```
id: int (primary key)
vehicle_id: int (foreign key)
sensor_id: int (foreign key)
data: jsonb (sensor readings)
created_at: datetime (hypertable partition)
```

## Relationships

- Vehicle → SensorLog (1:many)
- Sensor → SensorLog (1:many)
- SensorType → Sensor (1:many)

## API Endpoints

- **Vehicles**: `/vehicles/` (CRUD)
- **Sensor Types**: `/sensor-types/` (CRUD)
- **Sensors**: `/sensors/` (CRUD)
- **Sensor Logs**: `/sensor-logs/` (Create, Read, Delete)

## Data Examples

**Vehicle**:

```json
{
  "name": "SeaExplorer 1",
  "status": "active"
}
```

**Sensor**:

```json
{
  "name": "TEMP_001",
  "sensor_type_id": 1,
  "is_active": true
}
```

**Sensor Log**:

```json
{
  "vehicle_id": 1,
  "sensor_id": 1,
  "data": {
    "temperature": 25.5,
    "humidity": 60.0
  }
}
```
