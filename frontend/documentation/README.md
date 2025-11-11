# 📊 Database Schema Documentation

## Overview

This document outlines the required database table structures for all custom hooks used in the SeaPortal USV Management System. Each hook requires specific database tables with defined schemas to function properly.

---

## 🚢 1. Vehicle Management (`useVehicleData`)

### Table: `vehicles`

| Column          | Type          | Required | Description                                                   |
| --------------- | ------------- | -------- | ------------------------------------------------------------- |
| `id`            | INT/UUID      | ✅       | Primary key, unique vehicle identifier                        |
| `name`          | VARCHAR(255)  | ✅       | Display name of the vehicle                                   |
| `code`          | VARCHAR(50)   | ❌       | Vehicle code (auto-generated if null: USV-001, USV-002, etc.) |
| `type`          | VARCHAR(50)   | ❌       | Vehicle type (default: 'USV')                                 |
| `role`          | VARCHAR(100)  | ❌       | Vehicle role/purpose (default: 'Patrol')                      |
| `status`        | ENUM          | ❌       | Vehicle status: 'online', 'offline', 'maintenance', 'active'  |
| `battery_level` | DECIMAL(5,2)  | ❌       | Battery percentage (0-100)                                    |
| `latitude`      | DECIMAL(10,8) | ❌       | Current GPS latitude                                          |
| `longitude`     | DECIMAL(11,8) | ❌       | Current GPS longitude                                         |
| `created_at`    | TIMESTAMP     | ❌       | Creation timestamp                                            |
| `updated_at`    | TIMESTAMP     | ❌       | Last update timestamp                                         |

**API Endpoint:** `GET /vehicles/`

**Sample Response:**

```json
[
  {
    "id": 1,
    "name": "USV Alpha",
    "code": "USV-001",
    "type": "USV",
    "role": "Patrol",
    "status": "online",
    "battery_level": 85.5,
    "latitude": -6.2,
    "longitude": 106.816666,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

## 🎯 2. Mission Management (`useMissionData`)

### Table: `missions`

| Column                | Type          | Required | Description                                                |
| --------------------- | ------------- | -------- | ---------------------------------------------------------- |
| `id`                  | INT/UUID      | ✅       | Primary key, unique mission identifier                     |
| `name`                | VARCHAR(255)  | ✅       | Mission name/title                                         |
| `title`               | VARCHAR(255)  | ❌       | Alternative title field                                    |
| `vehicle_id`          | INT/UUID      | ❌       | Foreign key to vehicles table                              |
| `vehicle_name`        | VARCHAR(255)  | ❌       | Vehicle name for this mission                              |
| `progress`            | DECIMAL(5,2)  | ❌       | Mission progress percentage (0-100)                        |
| `status`              | ENUM          | ❌       | Status: 'Active', 'Completed', 'Draft', 'Paused', 'Failed' |
| `start_time`          | TIMESTAMP     | ❌       | Mission start time                                         |
| `end_time`            | TIMESTAMP     | ❌       | Mission end time                                           |
| `waypoints`           | INT           | ❌       | Total number of waypoints                                  |
| `total_waypoints`     | INT           | ❌       | Alternative waypoints field                                |
| `current_waypoint`    | INT           | ❌       | Current waypoint index                                     |
| `completed_waypoints` | INT           | ❌       | Number of completed waypoints                              |
| `distance`            | DECIMAL(10,2) | ❌       | Total mission distance (meters/km)                         |
| `duration`            | INT           | ❌       | Mission duration (seconds)                                 |
| `created_at`          | TIMESTAMP     | ❌       | Creation timestamp                                         |

**API Endpoint:** `GET /api/missions`

**Sample Response:**

```json
[
  {
    "id": 1,
    "name": "Coastal Patrol Alpha",
    "vehicle_name": "USV Alpha",
    "progress": 75.5,
    "status": "Active",
    "start_time": "2025-01-01T08:00:00Z",
    "waypoints": 10,
    "current_waypoint": 7,
    "distance": 5500.5,
    "duration": 3600
  }
]
```

---

## 🌡️ 3. Sensor Data (`useSensorData`)

### Table: `sensor_logs`

| Column       | Type      | Required | Description                   |
| ------------ | --------- | -------- | ----------------------------- |
| `id`         | INT/UUID  | ✅       | Primary key                   |
| `vehicle_id` | INT/UUID  | ✅       | Foreign key to vehicles table |
| `data`       | JSON/TEXT | ✅       | Sensor data in JSON format    |
| `created_at` | TIMESTAMP | ✅       | Sensor reading timestamp      |

**JSON Data Structure (in `data` field):**

```json
{
  "temperature": 25.5, // Temperature in Celsius
  "humidity": 65.2 // Humidity percentage
}
```

**API Endpoint:** `GET /sensor-logs/sensor-logs/?vehicle_id={id}`

**Sample Response:**

```json
[
  {
    "id": 1,
    "vehicle_id": 1,
    "data": {
      "temperature": 25.5,
      "humidity": 65.2
    },
    "created_at": "2025-01-01T10:00:00Z"
  }
]
```

---

## 📐 4. Gyroscope Data (`useGyroscopeData`)

### Table: `gyroscope_data`

| Column       | Type         | Required | Description                      |
| ------------ | ------------ | -------- | -------------------------------- |
| `id`         | INT/UUID     | ✅       | Primary key                      |
| `vehicle_id` | INT/UUID     | ✅       | Foreign key to vehicles table    |
| `pitch`      | DECIMAL(8,4) | ❌       | Pitch angle (-90 to 90 degrees)  |
| `roll`       | DECIMAL(8,4) | ❌       | Roll angle (-180 to 180 degrees) |
| `yaw`        | DECIMAL(8,4) | ❌       | Yaw angle (0 to 360 degrees)     |
| `timestamp`  | TIMESTAMP    | ❌       | Reading timestamp                |
| `created_at` | TIMESTAMP    | ❌       | Record creation time             |

**API Endpoint:** `GET /gyroscope/{vehicle_id}`

**Sample Response:**

```json
{
  "pitch": 15.2543,
  "roll": -8.7654,
  "yaw": 180.5432,
  "timestamp": "2025-01-01T10:00:00Z"
}
```

---

## 🔔 5. Notification System (`useNotificationData`)

### Table: `notifications`

| Column         | Type         | Required | Description                                   |
| -------------- | ------------ | -------- | --------------------------------------------- |
| `id`           | INT/UUID     | ✅       | Primary key                                   |
| `type`         | ENUM         | ❌       | Type: 'info', 'warning', 'error', 'success'   |
| `severity`     | VARCHAR(50)  | ❌       | Alternative to type field                     |
| `title`        | VARCHAR(255) | ❌       | Notification title                            |
| `subject`      | VARCHAR(255) | ❌       | Alternative title field                       |
| `message`      | TEXT         | ❌       | Notification message/content                  |
| `description`  | TEXT         | ❌       | Alternative message field                     |
| `content`      | TEXT         | ❌       | Alternative message field                     |
| `vehicle_id`   | INT/UUID     | ❌       | Related vehicle (optional)                    |
| `vehicle_name` | VARCHAR(255) | ❌       | Vehicle name for notification                 |
| `priority`     | ENUM         | ❌       | Priority: 'low', 'normal', 'high', 'critical' |
| `timestamp`    | TIMESTAMP    | ❌       | Notification timestamp                        |
| `created_at`   | TIMESTAMP    | ❌       | Creation timestamp                            |
| `is_read`      | BOOLEAN      | ❌       | Read status (default: false)                  |

**API Endpoint:** `GET /api/notifications`

**Sample Response:**

```json
[
  {
    "id": 1,
    "type": "warning",
    "title": "Low Battery Alert",
    "message": "Vehicle USV-001 battery level is below 20%",
    "vehicle_name": "USV Alpha",
    "priority": "high",
    "timestamp": "2025-01-01T10:00:00Z"
  }
]
```

---

## 🔋 6. Battery Monitoring (`useBatteryData`)

### Table: `battery_logs`

| Column                     | Type         | Required | Description                                           |
| -------------------------- | ------------ | -------- | ----------------------------------------------------- |
| `id`                       | INT/UUID     | ✅       | Primary key                                           |
| `vehicle_id`               | INT/UUID     | ✅       | Foreign key to vehicles table                         |
| `battery_level`            | DECIMAL(5,2) | ✅       | Battery percentage (0-100)                            |
| `voltage`                  | DECIMAL(6,3) | ❌       | Battery voltage                                       |
| `current`                  | DECIMAL(8,3) | ❌       | Battery current (Amperes)                             |
| `temperature`              | DECIMAL(5,2) | ❌       | Battery temperature (Celsius)                         |
| `charging_status`          | ENUM         | ❌       | Status: 'charging', 'discharging', 'full', 'critical' |
| `estimated_time_remaining` | INT          | ❌       | Estimated time in minutes                             |
| `created_at`               | TIMESTAMP    | ✅       | Reading timestamp                                     |

**API Endpoint:** `GET /api/battery/{vehicle_id}`

---

## 📝 7. Raw Log Data (`useRawLogData`)

### Table: `raw_logs`

| Column       | Type         | Required | Description                                 |
| ------------ | ------------ | -------- | ------------------------------------------- |
| `id`         | INT/UUID     | ✅       | Primary key                                 |
| `vehicle_id` | INT/UUID     | ❌       | Foreign key to vehicles table               |
| `log_type`   | VARCHAR(100) | ❌       | Type of log entry                           |
| `message`    | TEXT         | ✅       | Raw log message                             |
| `level`      | ENUM         | ❌       | Log level: 'debug', 'info', 'warn', 'error' |
| `source`     | VARCHAR(255) | ❌       | Log source/module                           |
| `metadata`   | JSON         | ❌       | Additional log metadata                     |
| `timestamp`  | TIMESTAMP    | ✅       | Log timestamp                               |
| `created_at` | TIMESTAMP    | ❌       | Record creation time                        |

---

## 🔧 Additional Utility Hooks

### `useLoadingTimeout`

- **Purpose:** Provides loading state management with timeout
- **No Database Required:** Pure JavaScript utility hook

### `useTitle`

- **Purpose:** Manages page title in browser
- **No Database Required:** Pure JavaScript utility hook

---

## 🌐 API Configuration

All hooks use the base API URL from `src/config.js`:

```javascript
export const API_BASE_URL = "https://backend.dataloggerpolman.id";
```

## 📋 Database Setup Commands

### PostgreSQL Setup Example:

```sql
-- Create vehicles table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    type VARCHAR(50) DEFAULT 'USV',
    role VARCHAR(100) DEFAULT 'Patrol',
    status VARCHAR(50) DEFAULT 'offline',
    battery_level DECIMAL(5,2) DEFAULT 0,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create missions table
CREATE TABLE missions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id),
    vehicle_name VARCHAR(255),
    progress DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Draft',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    waypoints INTEGER DEFAULT 0,
    current_waypoint INTEGER DEFAULT 0,
    distance DECIMAL(10,2) DEFAULT 0,
    duration INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sensor_logs table
CREATE TABLE sensor_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create gyroscope_data table
CREATE TABLE gyroscope_data (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    pitch DECIMAL(8,4) DEFAULT 0,
    roll DECIMAL(8,4) DEFAULT 0,
    yaw DECIMAL(8,4) DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) DEFAULT 'info',
    title VARCHAR(255),
    message TEXT,
    vehicle_id INTEGER REFERENCES vehicles(id),
    vehicle_name VARCHAR(255),
    priority VARCHAR(50) DEFAULT 'normal',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);
```

## 🚀 Quick Start

1. **Setup Database:** Create tables using the SQL commands above
2. **Configure API:** Update `API_BASE_URL` in `src/config.js`
3. **Seed Data:** Insert sample data for testing
4. **Test Endpoints:** Verify all API endpoints return expected data structures
5. **Run Application:** Start the React application and verify data loading

---

## 📞 Support

For questions about database schema or API integration, please contact the development team.

**Last Updated:** October 17, 2025
**Version:** 1.0.0
