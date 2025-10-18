# WebSocket Real-time Data Implementation

## Overview

Backend SEANO menyediakan WebSocket endpoint untuk streaming real-time data ke frontend. Setiap data yang diterima dari MQTT akan langsung di-broadcast ke semua connected WebSocket clients.

## Data Flow

```
Jetson (MQTT Publish) → Backend (MQTT Subscribe) → Database (Store) → WebSocket (Broadcast) → Frontend (Real-time Display)
```

## WebSocket Endpoints

### 1. General Real-time Stream

**URL**: `ws://localhost:8000/api/ws`
**Description**: Menerima semua real-time data dari semua vehicles

### 2. Vehicle-specific Stream

**URL**: `ws://localhost:8000/api/ws/vehicle/{vehicle_id}`
**Description**: Menerima real-time data untuk vehicle tertentu saja

### 3. Connection Statistics

**URL**: `GET http://localhost:8000/api/ws/stats`
**Description**: Informasi statistik WebSocket connections

## Message Types

### 1. Raw Log Message

```json
{
  "type": "raw_log",
  "vehicle_id": 1,
  "data": "GPS initialized successfully",
  "timestamp": "2025-10-18T16:30:00.123Z",
  "broadcast_time": "2025-10-18T16:30:00.125Z",
  "connection_count": 3
}
```

### 2. Sensor Log Message

```json
{
  "type": "sensor_log",
  "vehicle_id": 1,
  "sensor_id": 5,
  "data": {
    "temperature": 28.5,
    "humidity": 65.3,
    "pressure": 1013.25
  },
  "timestamp": "2025-10-18T16:30:00.123Z",
  "broadcast_time": "2025-10-18T16:30:00.125Z",
  "connection_count": 3
}
```

### 3. Vehicle Log Message

```json
{
  "type": "vehicle_log",
  "vehicle_id": 1,
  "data": {
    "battery_voltage": 12.4,
    "battery_current": 1.8,
    "rssi": -38,
    "mode": "GUIDED",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "heading": 90.0,
    "armed": true,
    "guided": true,
    "system_status": "ACTIVE",
    "speed": 12.5
  },
  "timestamp": "2025-10-18T16:30:00.123Z",
  "broadcast_time": "2025-10-18T16:30:00.125Z",
  "connection_count": 3
}
```

### 4. Connection Message

```json
{
  "type": "connection",
  "message": "Connected to SEANO real-time data stream",
  "timestamp": "2025-10-18T16:30:00.123Z",
  "connection_count": 3
}
```

## Frontend Implementation

### JavaScript WebSocket Client

```javascript
// Connect to WebSocket
const socket = new WebSocket("ws://localhost:8000/api/ws");

// Handle connection
socket.onopen = function (event) {
  console.log("Connected to SEANO real-time stream");
};

// Handle incoming messages
socket.onmessage = function (event) {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "raw_log":
      displayRawLog(data);
      break;
    case "sensor_log":
      displaySensorLog(data);
      break;
    case "vehicle_log":
      displayVehicleLog(data);
      break;
    default:
      console.log("Unknown message type:", data.type);
  }
};

// Handle disconnection
socket.onclose = function (event) {
  console.log("Disconnected from real-time stream");
};

// Send ping message (optional)
function sendPing() {
  socket.send(
    JSON.stringify({
      type: "ping",
      timestamp: new Date().toISOString(),
    })
  );
}
```

### React Hook Example

```javascript
import { useState, useEffect, useCallback } from "react";

export const useSeanoWebSocket = (url = "ws://localhost:8000/api/ws") => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  const connect = useCallback(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };

    return ws;
  }, [url]);

  useEffect(() => {
    const ws = connect();
    return () => ws?.close();
  }, [connect]);

  return { socket, isConnected, messages, connect };
};
```

## Testing

### 1. HTML Test Client

Gunakan file `websocket_test_client.html` untuk testing WebSocket connection:

```bash
# Start backend
uvicorn app.main:app --reload

# Open websocket_test_client.html di browser
# Click "Connect" button
```

### 2. Manual Testing

```bash
# Terminal 1: Start backend
uvicorn app.main:app --reload

# Terminal 2: Run Jetson simulator
python jetson_simulator.py

# Browser: Open websocket test client dan lihat real-time data
```

## Production Considerations

### 1. Authentication

```javascript
// Add authentication to WebSocket
const token = localStorage.getItem("jwt_token");
const socket = new WebSocket(`ws://localhost:8000/api/ws?token=${token}`);
```

### 2. Connection Management

- Handle reconnection pada network issues
- Implement heartbeat/ping untuk keep-alive
- Buffer messages selama disconnection

### 3. Performance

- Limit maksimal WebSocket connections
- Implement rate limiting untuk message broadcasting
- Consider message queuing untuk high-frequency data

## Error Handling

```javascript
socket.onerror = function (error) {
  console.error("WebSocket error:", error);
  // Implement retry logic
  setTimeout(() => {
    connect();
  }, 5000);
};
```

## Integration dengan Frontend Framework

### React Component Example

```jsx
import React, { useState, useEffect } from "react";

const RealTimeMonitor = () => {
  const [logs, setLogs] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/api/ws");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogs((prev) => [data, ...prev].slice(0, 100)); // Keep last 100 logs
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  return (
    <div>
      <h2>Real-time Vehicle Data</h2>
      {logs.map((log, index) => (
        <div key={index}>
          <strong>Vehicle {log.vehicle_id}</strong> - {log.type}:
          {JSON.stringify(log.data)}
        </div>
      ))}
    </div>
  );
};
```

Dengan implementasi ini, frontend dapat menerima real-time data dari semua vehicles dan menampilkannya secara live! 🚀
