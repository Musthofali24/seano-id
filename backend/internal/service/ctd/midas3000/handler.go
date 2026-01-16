package midas3000

import (
	"encoding/json"
	"fmt"
	"go-fiber-pgsql/internal/repository"
	wsocket "go-fiber-pgsql/internal/websocket"
	"log"
)

// DataHandler handles processing and storage of CTD MIDAS 3000 data
type DataHandler struct {
	sensorLogRepo     *repository.SensorLogRepository
	vehicleSensorRepo *repository.VehicleSensorRepository
	wsHub             *wsocket.Hub
}

// NewDataHandler creates a new data handler instance
func NewDataHandler(sensorLogRepo *repository.SensorLogRepository, vehicleSensorRepo *repository.VehicleSensorRepository, wsHub *wsocket.Hub) *DataHandler {
	return &DataHandler{
		sensorLogRepo:     sensorLogRepo,
		vehicleSensorRepo: vehicleSensorRepo,
		wsHub:             wsHub,
	}
}

// ProcessData validates and processes incoming CTD MIDAS 3000 data
func (h *DataHandler) ProcessData(data *CTDMidas3000Data) error {
	// Validate data
	if err := h.validateData(data); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	// Log the received data
	log.Printf("Processing MIDAS 3000 data: Vehicle=%s, Sensor=%s, Depth=%.2fm, Temp=%.2f°C, Salinity=%.2f PSU",
		data.VehicleCode, data.SensorCode, data.Depth, data.Temperature, data.Salinity)

	// Convert data to JSON for storage
	_, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	// TODO: Save to sensor_logs table
	// Need to lookup VehicleID and SensorID from VehicleCode and SensorCode first
	// The new SensorLog model requires vehicle_id and sensor_id (not codes)
	log.Printf("TODO: Save MIDAS 3000 data to sensor_logs (need vehicle/sensor ID lookup from codes)")

	// Update vehicle_sensor last reading
	if err := h.updateVehicleSensorLastReading(data); err != nil {
		log.Printf("Warning: failed to update vehicle sensor last reading: %v", err)
		// Don't fail the whole process if this update fails
	}

	// Broadcast data via WebSocket to connected clients
	if h.wsHub != nil {
		wsMsg := wsocket.SensorDataMessage{
			MessageType: "sensor_data",
			SensorType:  "ctd_midas3000",
			VehicleCode: data.VehicleCode,
			SensorCode:  data.SensorCode,
			Timestamp:   data.Timestamp.Format("2006-01-02T15:04:05Z07:00"),
			Data:        data,
		}
		
		if err := h.wsHub.BroadcastSensorData(wsMsg); err != nil {
			log.Printf("Warning: failed to broadcast via WebSocket: %v", err)
		} else {
			log.Printf("Broadcasted MIDAS 3000 data via WebSocket to %d clients", h.wsHub.GetClientCount())
		}
	}

	return nil
}

// updateVehicleSensorLastReading updates the last reading in vehicle_sensors table
func (h *DataHandler) updateVehicleSensorLastReading(data *CTDMidas3000Data) error {
	// This will update the last_reading and last_reading_time in vehicle_sensors
	// You may need to add a method in vehicle_sensor_repo to update by codes
	// For now, just log it
	log.Printf("TODO: Update vehicle_sensor last reading for vehicle=%s, sensor=%s", 
		data.VehicleCode, data.SensorCode)
	return nil
}

// validateData performs basic validation on the incoming data
func (h *DataHandler) validateData(data *CTDMidas3000Data) error {
	if data == nil {
		return fmt.Errorf("data is nil")
	}

	if data.VehicleCode == "" {
		return fmt.Errorf("vehicle_code is required")
	}

	if data.SensorCode == "" {
		return fmt.Errorf("sensor_code is required")
	}

	if data.Timestamp.IsZero() {
		return fmt.Errorf("timestamp is required")
	}

	// Validate depth range (-10000m to 100m)
	if data.Depth < -10000 || data.Depth > 100 {
		return fmt.Errorf("depth %.2f is out of valid range [-10000, 100]", data.Depth)
	}

	// Validate temperature range (-2°C to 35°C)
	if data.Temperature < -2.0 || data.Temperature > 35.0 {
		return fmt.Errorf("temperature %.2f is out of valid range [-2, 35]", data.Temperature)
	}

	// Validate conductivity range (0 to 100 MS/CM)
	if data.Conductivity < 0 || data.Conductivity > 100 {
		return fmt.Errorf("conductivity %.2f is out of valid range [0, 100]", data.Conductivity)
	}

	// Validate salinity range (0 to 45 PSU)
	if data.Salinity < 0 || data.Salinity > 45 {
		return fmt.Errorf("salinity %.2f is out of valid range [0, 45]", data.Salinity)
	}

	// Validate density range (990 to 1050 kg/m³)
	if data.Density < 990 || data.Density > 1050 {
		return fmt.Errorf("density %.2f is out of valid range [990, 1050]", data.Density)
	}

	// Validate sound velocity range (1400 to 1600 m/s)
	if data.SoundVelocity < 1400 || data.SoundVelocity > 1600 {
		return fmt.Errorf("sound_velocity %.2f is out of valid range [1400, 1600]", data.SoundVelocity)
	}

	return nil
}
