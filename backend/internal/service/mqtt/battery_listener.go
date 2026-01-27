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

// BatteryListener handles MQTT messages for battery monitoring
type BatteryListener struct {
	client      mqtt.Client
	vehicleRepo *repository.VehicleRepository
	wsHub       *wsocket.Hub
}

// NewBatteryListener creates a new battery listener
func NewBatteryListener(client mqtt.Client, vehicleRepo *repository.VehicleRepository, wsHub *wsocket.Hub) *BatteryListener {
	return &BatteryListener{
		client:      client,
		vehicleRepo: vehicleRepo,
		wsHub:       wsHub,
	}
}

// Start subscribes to battery monitoring topics
func (l *BatteryListener) Start() error {
	// Topic pattern: seano/{vehicle_code}/battery
	topic := "seano/+/battery"

	token := l.client.Subscribe(topic, 1, l.handleMessage)
	token.Wait()

	if token.Error() != nil {
		return fmt.Errorf("failed to subscribe to %s: %w", topic, token.Error())
	}

	log.Printf("✓ MQTT Battery Listener subscribed to topic: %s", topic)
	return nil
}

// BatteryData represents the MQTT battery message payload
type BatteryData struct {
	VehicleCode  *string    `json:"vehicle_code,omitempty"`
	BatteryID    int        `json:"battery_id"`           // 1 or 2
	Percentage   float64    `json:"percentage"`           // 0-100
	Voltage      *float64   `json:"voltage,omitempty"`    // Volts
	Current      *float64   `json:"current,omitempty"`    // Amps
	Temperature  *float64   `json:"temperature,omitempty"` // Celsius
	Status       *string    `json:"status,omitempty"`     // charging, discharging, full, low
	CellVoltages []float64  `json:"cell_voltages,omitempty"` // Individual cell voltages
	CellCount    *int       `json:"cell_count,omitempty"` // Number of cells
}

// handleMessage processes incoming MQTT battery messages
func (l *BatteryListener) handleMessage(client mqtt.Client, msg mqtt.Message) {
	// Parse topic: seano/{vehicle_code}/battery
	parts := strings.Split(msg.Topic(), "/")
	if len(parts) != 3 {
		log.Printf("Invalid battery topic format: %s", msg.Topic())
		return
	}

	vehicleCodeFromTopic := parts[1]

	// Parse JSON payload
	var data BatteryData
	if err := json.Unmarshal(msg.Payload(), &data); err != nil {
		log.Printf("Failed to parse battery data: %v", err)
		return
	}

	// Use vehicle_code from JSON if provided, otherwise use from topic
	vehicleCode := vehicleCodeFromTopic
	if data.VehicleCode != nil && *data.VehicleCode != "" {
		vehicleCode = *data.VehicleCode
	}

	// Get vehicle by code
	vehicle, err := l.vehicleRepo.GetVehicleByCode(vehicleCode)
	if err != nil {
		log.Printf("Vehicle not found for code %s: %v", vehicleCode, err)
		return
	}

	// Determine status text
	status := "Unknown"
	if data.Status != nil {
		status = *data.Status
	} else if data.Percentage >= 90 {
		status = "Full"
	} else if data.Percentage <= 20 {
		status = "Low"
	} else {
		status = "Normal"
	}

	// Create battery record
	cellVoltagesJSON, _ := json.Marshal(data.CellVoltages)
	metadataMap := map[string]interface{}{}
	if data.CellCount != nil {
		metadataMap["cell_count"] = *data.CellCount
	}
	metadataJSON, _ := json.Marshal(metadataMap)

	battery := &model.VehicleBattery{
		VehicleID:    vehicle.ID,
		BatteryID:    data.BatteryID,
		Percentage:   data.Percentage,
		Voltage:      valueOrZero(data.Voltage),
		Current:      valueOrZero(data.Current),
		Status:       status,
		Temperature:  valueOrZero(data.Temperature),
		CellVoltages: cellVoltagesJSON,
		Metadata:     metadataJSON,
	}

	// Save to database
	if err := l.vehicleRepo.CreateBatteryStatus(battery); err != nil {
		log.Printf("Failed to save battery data: %v", err)
		return
	}

	log.Printf("✓ Battery data saved: vehicle=%s battery_id=%d percentage=%.1f%%",
		vehicleCode, data.BatteryID, data.Percentage)

	// Broadcast via WebSocket with timestamp
	timestamp := time.Now().Format(time.RFC3339)
	wsMessage := map[string]interface{}{
		"type":          "battery",
		"vehicle_id":    vehicle.ID,
		"vehicle_code":  vehicleCode,
		"battery_id":    data.BatteryID,
		"percentage":    data.Percentage,
		"voltage":       data.Voltage,
		"current":       data.Current,
		"temperature":   data.Temperature,
		"status":        status,
		"cell_voltages": data.CellVoltages,
		"cell_count":    data.CellCount,
		"timestamp":     timestamp,
	}

	l.wsHub.BroadcastToVehicle(vehicle.ID, wsMessage)
	log.Printf("✓ Battery data broadcasted via WebSocket: vehicle=%s battery_id=%d cells=%d", vehicleCode, data.BatteryID, len(data.CellVoltages))
}

// Helper function to get value or zero
func valueOrZero(ptr *float64) float64 {
	if ptr != nil {
		return *ptr
	}
	return 0
}
