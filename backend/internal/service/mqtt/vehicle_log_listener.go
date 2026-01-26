package mqtt

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"

	"go-fiber-pgsql/internal/model"
	"go-fiber-pgsql/internal/repository"
	wsocket "go-fiber-pgsql/internal/websocket"
)

// VehicleLogListener handles MQTT messages for vehicle telemetry logs
type VehicleLogListener struct {
	client         mqtt.Client
	vehicleLogRepo *repository.VehicleLogRepository
	vehicleRepo    *repository.VehicleRepository
	wsHub          *wsocket.Hub
}

// NewVehicleLogListener creates a new vehicle log listener
func NewVehicleLogListener(client mqtt.Client, vehicleLogRepo *repository.VehicleLogRepository, vehicleRepo *repository.VehicleRepository, wsHub *wsocket.Hub) *VehicleLogListener {
	return &VehicleLogListener{
		client:         client,
		vehicleLogRepo: vehicleLogRepo,
		vehicleRepo:    vehicleRepo,
		wsHub:          wsHub,
	}
}

// Start subscribes to vehicle telemetry topics and processes messages
func (l *VehicleLogListener) Start() error {
	// Topic pattern: seano/{vehicle_code}/telemetry
	topic := "seano/+/telemetry"
	
	token := l.client.Subscribe(topic, 1, l.handleMessage)
	token.Wait()
	
	if token.Error() != nil {
		return fmt.Errorf("failed to subscribe to %s: %w", topic, token.Error())
	}
	
	log.Printf("✓ MQTT Vehicle Log Listener subscribed to topic: %s", topic)
	return nil
}

// handleMessage processes incoming MQTT messages
func (l *VehicleLogListener) handleMessage(client mqtt.Client, msg mqtt.Message) {
	// Parse topic: seano/{vehicle_code}/telemetry
	parts := strings.Split(msg.Topic(), "/")
	if len(parts) != 3 {
		log.Printf("Invalid topic format: %s", msg.Topic())
		return
	}
	
	vehicleCodeFromTopic := parts[1]
	
	// Parse JSON payload (might contain vehicle_code)
	var payloadWithCode struct {
		VehicleCode *string `json:"vehicle_code"`
		model.CreateVehicleLogRequest
	}
	
	if err := json.Unmarshal(msg.Payload(), &payloadWithCode); err != nil {
		log.Printf("Failed to parse vehicle log data: %v", err)
		return
	}
	
	// Use vehicle_code from JSON if provided, otherwise use from topic
	vehicleCode := vehicleCodeFromTopic
	if payloadWithCode.VehicleCode != nil && *payloadWithCode.VehicleCode != "" {
		vehicleCode = *payloadWithCode.VehicleCode
	}
	
	// Get vehicle ID from code
	vehicle, err := l.vehicleRepo.GetVehicleByCode(vehicleCode)
	if err != nil {
		log.Printf("Vehicle not found for code %s: %v", vehicleCode, err)
		return
	}
	
	data := payloadWithCode.CreateVehicleLogRequest
	
	// Convert FlexibleString to *string for database
	var tempSystem *string
	if data.TemperatureSystem != nil {
		tempSystem = &data.TemperatureSystem.Value
	}
	
	// Calculate battery_percentage if not provided but battery_voltage exists
	batteryPercentage := data.BatteryPercentage
	if batteryPercentage == nil && data.BatteryVoltage != nil {
		// Convert 11V-12.6V to 0-100%
		voltage := *data.BatteryVoltage
		percentage := ((voltage - 11.0) / 1.6) * 100.0
		if percentage < 0 {
			percentage = 0
		}
		if percentage > 100 {
			percentage = 100
		}
		batteryPercentage = &percentage
	}
	
	// Create vehicle log
	vehicleLog := &model.VehicleLog{
		VehicleID:         vehicle.ID,
		BatteryVoltage:    data.BatteryVoltage,
		BatteryCurrent:    data.BatteryCurrent,
		BatteryPercentage: batteryPercentage,
		RSSI:              data.RSSI,
		Mode:              data.Mode,
		Latitude:          data.Latitude,
		Longitude:         data.Longitude,
		Altitude:          data.Altitude,
		Heading:           data.Heading,
		Armed:             data.Armed,
		GPSok:             data.GPSok,
		SystemStatus:      data.SystemStatus,
		Speed:             data.Speed,
		Roll:              data.Roll,
		Pitch:             data.Pitch,
		Yaw:               data.Yaw,
		TemperatureSystem: tempSystem,
	}
	
	if err := l.vehicleLogRepo.CreateVehicleLog(vehicleLog); err != nil {
		log.Printf("Failed to save vehicle log: %v", err)
		return
	}
	
	log.Printf("✓ Vehicle log saved: vehicle=%s, id=%d", vehicleCode, vehicleLog.ID)
	
	// Broadcast via WebSocket
	if l.wsHub != nil {
		wsData := wsocket.VehicleLogData{
			ID:                vehicleLog.ID,
			VehicleID:         vehicleLog.VehicleID,
			Vehicle: &wsocket.VehicleInfo{
				Code: vehicle.Code,
				Name: vehicle.Name,
			},
			BatteryVoltage:    vehicleLog.BatteryVoltage,
			BatteryCurrent:    vehicleLog.BatteryCurrent,
			BatteryPercentage: vehicleLog.BatteryPercentage,
			RSSI:              vehicleLog.RSSI,
			Mode:              vehicleLog.Mode,
			Latitude:          vehicleLog.Latitude,
			Longitude:         vehicleLog.Longitude,
			Altitude:          vehicleLog.Altitude,
			Heading:           vehicleLog.Heading,
			Armed:             vehicleLog.Armed,
			GPSok:             vehicleLog.GPSok,
			SystemStatus:      vehicleLog.SystemStatus,
			Speed:             vehicleLog.Speed,
			Roll:              vehicleLog.Roll,
			Pitch:             vehicleLog.Pitch,
			Yaw:               vehicleLog.Yaw,
			TemperatureSystem: vehicleLog.TemperatureSystem,
			CreatedAt:         vehicleLog.CreatedAt.Format(time.RFC3339),
		}
		l.wsHub.BroadcastVehicleLog(wsData, vehicleLog.CreatedAt.Format("2006-01-02T15:04:05Z07:00"))
	}
}

