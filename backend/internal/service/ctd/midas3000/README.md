# CTD MIDAS 3000 Service

Service untuk menerima dan memproses data dari sensor CTD MIDAS 3000 via MQTT.

## MQTT Topic Format

```
seano/{vehicle_code}/{sensor_code}/midas3000
```

Contoh:

- `seano/USV-01/CTD-MIDAS-01/midas3000` - Data dari vehicle USV-01, sensor CTD-MIDAS-01
- `seano/USV-02/CTD-001/midas3000` - Data dari vehicle USV-02, sensor CTD-001

## Data Format

Data dikirim dalam format JSON:

```json
{
  "timestamp": "2025-01-01T08:30:00Z",
  "vehicle_code": "USV-01",
  "sensor_code": "CTD-MIDAS-01",
  "depth": 25.4,
  "pressure": 2.53,
  "temperature": 27.6,
  "conductivity": 53.2,
  "salinity": 33.8,
  "density": 1024.5,
  "sound_velocity": 1508.3
}
```

## Field Description

| Field          | Unit  | Description               | Valid Range      |
| -------------- | ----- | ------------------------- | ---------------- |
| timestamp      | -     | Timestamp pembacaan       | ISO 8601 format  |
| vehicle_code   | -     | Kode kendaraan (USV)      | non-empty string |
| sensor_code    | -     | Kode sensor               | non-empty string |
| depth          | m     | Kedalaman sensor          | -10000 to 100    |
| pressure       | M     | Tekanan air               | -                |
| temperature    | °C    | Suhu air                  | -2.0 to 35.0     |
| conductivity   | MS/CM | Konduktivitas listrik air | 0 to 100         |
| salinity       | PSU   | Salinitas (kadar garam)   | 0 to 45          |
| density        | kg/m³ | Densitas air              | 990 to 1050      |
| sound_velocity | m/s   | Kecepatan suara dalam air | 1400 to 1600     |

## Components

### 1. Model (`model.go`)

Defines the data structure for CTD MIDAS 3000 readings.

### 2. MQTT Listener (`mqtt_listener.go`)

Handles MQTT connection and subscriptions:

- Subscribe to all MIDAS 3000 sensors: `seano/+/+/midas3000`
- Subscribe to specific vehicle: `seano/{vehicle_code}/+/midas3000`
- Subscribe to specific sensor: `seano/{vehicle_code}/{sensor_code}/midas3000`

### 3. Data Handler (`handler.go`)

Processes incoming data:

- Validates data ranges
- Stores to database (TODO)
- Triggers notifications (TODO)

## Usage Example

```go
// Initialize repositories
sensorLogRepo := repository.NewSensorLogRepository(db)
vehicleSensorRepo := repository.NewVehicleSensorRepository(db)

// Initialize handler
handler := midas3000.NewDataHandler(sensorLogRepo, vehicleSensorRepo)

// Configure MQTT
config := midas3000.MQTTConfig{
    BrokerURL:   "tcp://localhost:1883",
    ClientID:    "midas3000-listener",
    Username:    "username",
    Password:    "password",
    TopicPrefix: "seano",
}

// Create listener
listener, err := midas3000.NewMQTTListener(config, handler)
if err != nil {
    log.Fatal(err)
}

// Connect and subscribe
if err := listener.Connect(); err != nil {
    log.Fatal(err)
}

// Subscribe to all MIDAS 3000 sensors
if err := listener.Subscribe(); err != nil {
    log.Fatal(err)
}

// Keep running
select {}
```

## Running MQTT Listener

Jalankan MQTT listener secara terpisah:

```bash
# Set environment variables
export MQTT_BROKER_URL="tcp://localhost:1883"
export MQTT_USERNAME="your_username"
export MQTT_PASSWORD="your_password"
export MQTT_CLIENT_ID="midas3000-listener"
export MQTT_TOPIC_PREFIX="seano"

# Run the listener
go run cmd/mqtt-listener/main.go
```

## Database Integration

Data dari MIDAS 3000 akan otomatis disimpan ke tabel `sensor_logs`:

```sql
SELECT * FROM sensor_logs
WHERE vehicle_code = 'USV-01'
  AND sensor_code = 'CTD-MIDAS-01'
ORDER BY timestamp DESC
LIMIT 10;
```

## API Endpoints

Setelah data tersimpan, bisa diakses via REST API:

- `GET /sensor-logs?vehicle_code=USV-01&sensor_code=CTD-MIDAS-01` - Get logs dengan filter
- `GET /sensor-logs/{vehicle_code}/{sensor_code}/latest` - Get latest log
- `DELETE /sensor-logs/cleanup?before_date=2025-01-01T00:00:00Z` - Delete old logs (admin)

## Data Flow

```
USV (MIDAS 3000)
    ↓ MQTT Publish
    ↓ Topic: seano/{vehicle_code}/{sensor_code}/midas3000
    ↓
[MQTT Broker]
    ↓ Subscribe
    ↓
[MQTT Listener]
    ↓ Parse JSON
    ↓
[Data Handler]
    ↓ Validate
    ↓
[Database - sensor_logs]
    ↓
[REST API - GET /sensor-logs]
    ↓
[Client/Dashboard]
```
