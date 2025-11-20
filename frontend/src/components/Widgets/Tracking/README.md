# Tracking Page - Dokumentasi Sumber Data

## Ringkasan

Setiap widget di halaman Tracking menggunakan kombinasi data dari **API (historis)** dan **WebSocket MQTT (real-time)**.

---

## Sumber Data Widget

### 1. **VehicleStatusPanel** - Panel Status Kendaraan

- **File:** `VehicleStatusPanel.jsx`
- **Sumber Data:**
  - **Historis:** `useVehicleData()` hook → endpoint `/vehicles/` (di-fetch di level App)
  - **Real-time:** MQTT topic `seano/{vehicleId}/vehicle_log` (akan ditambah di masa depan)
- **Trigger:** Ketika `selectedVehicle` berubah, cari ulang dari vehicles array
- **Status:** ✅ Functional (API saja, MQTT akan ditambah nanti)

### 2. **TelemetryPanel** - Panel Data Telemetri

- **File:** `TelemetryPanel.jsx`
- **Sumber Data:**
  - **Historis:** `useVehicleData()` hook → endpoint `/vehicles/`
  - **Real-time:** MQTT topic `seano/{vehicleId}/vehicle_log` (akan ditambah di masa depan)
- **Trigger:** Ketika `selectedVehicle` berubah, cari ulang dari vehicles array
- **Status:** ✅ Functional (API saja, MQTT akan ditambah nanti)

### 3. **ViewMap** - Peta Lokasi Kendaraan

- **File:** `ViewMap.jsx` / `Gyroscope3D.jsx`
- **Sumber Data:**
  - **Historis:** `useVehicleData()` hook → endpoint `/vehicles/`
  - **Real-time:** MQTT topic `seano/{vehicleId}/vehicle_log` untuk update lokasi
- **Trigger:** Ketika `selectedVehicle` berubah, peta center ke koordinat kendaraan
- **Status:** ⚠️ Perlu update untuk proper handling selectedVehicle prop

### 4. **SensorDataChart** - Grafik Data Sensor

- **File:** `SensorDataChart.jsx`
- **Sumber Data:**
  - **Historis:** `GET /sensor-logs/?vehicle_id={id}&limit=100` (di-fetch saat mount)
  - **Real-time:** MQTT topic `seano/{vehicleId}/sensor_log`
- **Trigger:** `useEffect([selectedVehicle])`
- **Status:** ✅ Fully Functional (API + MQTT ready)

### 5. **VehicleLogChart** - Grafik Log Kendaraan

- **File:** `VehicleLogChart.jsx`
- **Sumber Data:**
  - **Historis:** `GET /vehicle-logs/?vehicle_id={id}&limit=100` (di-fetch saat mount)
  - **Real-time:** MQTT topic `seano/{vehicleId}/vehicle_log`
- **Trigger:** `useEffect([selectedVehicle])`
- **Status:** ✅ Fully Functional (API ready, MQTT ready di masa depan)

### 6. **BatteryMonitoring** - Monitor Baterai

- **File:** `BatteryMonitoring.jsx`
- **Sumber Data:**
  - **Historis:** `useVehicleData()` hook → endpoint `/vehicles/`
  - **Real-time:** MQTT topic `seano/{vehicleId}/vehicle_log`
- **Trigger:** Ketika `selectedVehicle` berubah, cari ulang dari vehicles array
- **Status:** ✅ Functional (API saja, MQTT akan ditambah nanti)

### 7. **LatestAlerts** - Peringatan Terbaru

- **File:** `LatestAlerts.jsx`
- **Sumber Data:**
  - **Historis:** `useVehicleAlerts()` hook → endpoint `/alerts/?vehicle_id={id}`
  - **Real-time:** Polling setiap 30 detik (bisa di-upgrade ke WebSocket nanti)
- **Trigger:** `useEffect([selectedVehicle])`
- **Status:** ✅ Functional (Polling, upgrade ke MQTT direncanakan)

### 8. **RawDataLog** - Log Data Mentah

- **File:** `RawDataLog.jsx`
- **Sumber Data:**
  - **Historis:** `GET /raw-logs/?vehicle_id={id}&limit=50` (di-fetch saat mount)
  - **Real-time:** MQTT WebSocket `seano/{vehicleId}/raw_log` (subscribe langsung)
- **Trigger:** `useEffect([selectedVehicle])`
- **Status:** ✅ Fully Functional (API + Live MQTT)
- **Fitur:**
  - Indicator Live (titik hijau)
  - Deteksi duplikat via timestamp
  - Fallback JSON/text parsing

### 9. **SensorDataLog** - Log Data Sensor

- **File:** `SensorDataLog.jsx`
- **Sumber Data:**
  - **Historis:** `GET /sensor-logs/?vehicle_id={id}&limit=50` (di-fetch saat mount)
  - **Real-time:** MQTT WebSocket `seano/{vehicleId}/sensor_log` (subscribe langsung)
- **Trigger:** `useEffect([selectedVehicle])`
- **Status:** ✅ Fully Functional (API + Live MQTT)
- **Fitur:**
  - Indicator Live (titik biru)
  - Filter berdasarkan tipe sensor
  - Deteksi duplikat via timestamp
  - Fallback JSON/text parsing

---

## Alur Data Arsitektur

```
┌─────────────────────────────────────────────────────┐
│                    App.jsx                          │
│  selectedVehicle (ID) → pass ke semua children      │
└─────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
     ┌─────────────┐ ┌────────────┐ ┌──────────────┐
     │ Topbar      │ │ Tracking   │ │ Layout       │
     │ (selector)  │ │ (panels)   │ │              │
     └─────────────┘ └────────────┘ └──────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │ API      │      │ MQTT     │      │ Hooks    │
   │ Fetch    │      │ WebSocket│      │ useXXX   │
   │(Historis)│      │(Real-time)      │          │
   └──────────┘      └──────────┘      └──────────┘
```

---

## MQTT Topics yang Di-Subscribe

| Topic                    | Widget                                                                 | Tipe Data                  | Frekuensi |
| ------------------------ | ---------------------------------------------------------------------- | -------------------------- | --------- |
| `seano/{id}/raw_log`     | RawDataLog                                                             | Log sistem (string/JSON)   | Real-time |
| `seano/{id}/sensor_log`  | SensorDataLog, SensorDataChart                                         | Data sensor (JSON)         | Real-time |
| `seano/{id}/vehicle_log` | VehicleStatusPanel, TelemetryPanel, VehicleLogChart, BatteryMonitoring | Telemetri kendaraan (JSON) | Real-time |

---

## API Endpoints yang Digunakan

| Endpoint         | Widget                         | Method | Query Params          |
| ---------------- | ------------------------------ | ------ | --------------------- |
| `/vehicles/`     | Semua (via useVehicleData)     | GET    | -                     |
| `/sensor-logs/`  | SensorDataLog, SensorDataChart | GET    | `vehicle_id`, `limit` |
| `/vehicle-logs/` | VehicleLogChart                | GET    | `vehicle_id`, `limit` |
| `/alerts/`       | LatestAlerts                   | GET    | `vehicle_id`, `limit` |
| `/raw-logs/`     | RawDataLog                     | GET    | `vehicle_id`, `limit` |

---

## Cara Upgrade Component ke Real-time Penuh

### Untuk VehicleStatusPanel & TelemetryPanel:

1. Add import `useMQTT()` hook
2. Subscribe ke `seano/{selectedVehicle}/vehicle_log`
3. Merge data MQTT dengan data API saat ada pesan baru

### Untuk BatteryMonitoring:

1. Add import `useMQTT()` hook
2. Subscribe ke `seano/{selectedVehicle}/vehicle_log`
3. Update battery_level/voltage real-time

### Untuk LatestAlerts:

1. Ganti polling dengan MQTT subscription ke `seano/{selectedVehicle}/alert_topic`
2. Atau maintain polling tapi add MQTT untuk notifikasi lebih cepat

---

## Status Implementasi Saat Ini

✅ = Fully implemented dengan API + MQTT
🔄 = Partially implemented (API saja, MQTT ready di masa depan)
❌ = Belum di-implement

| Widget             | API | MQTT | Status                           |
| ------------------ | --- | ---- | -------------------------------- |
| RawDataLog         | ✅  | ✅   | ✅ Fully Live                    |
| SensorDataLog      | ✅  | ✅   | ✅ Fully Live                    |
| SensorDataChart    | ✅  | -    | 🔄 Historis saja                 |
| VehicleLogChart    | ✅  | -    | 🔄 Historis saja                 |
| VehicleStatusPanel | ✅  | -    | 🔄 Historis saja                 |
| TelemetryPanel     | ✅  | -    | 🔄 Historis saja                 |
| BatteryMonitoring  | ✅  | -    | 🔄 Historis saja                 |
| LatestAlerts       | ✅  | -    | 🔄 Polling saja                  |
| ViewMap            | ✅  | -    | 🔄 Static, perlu selectedVehicle |

---

## Catatan Pengembangan Ke Depan

1. **Performance:** Pertimbangkan caching data untuk menghindari API calls berlebihan
2. **Error Handling:** Semua component punya error states, bisa add toast notifications
3. **Offline Support:** Add fallback ketika WebSocket disconnect
4. **Data Persistence:** Simpan last-known values di localStorage
5. **Real-time Upgrades:** VehicleStatusPanel & TelemetryPanel harus subscribe ke MQTT vehicle_log topic
