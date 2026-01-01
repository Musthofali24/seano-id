package midas3000

import (
	"fmt"
	"go-fiber-pgsql/internal/service/sensor"
)

// Processor implements SensorDataProcessor interface for MIDAS 3000
type Processor struct {
	handler *DataHandler
}

// NewProcessor creates a new MIDAS 3000 processor
func NewProcessor(handler *DataHandler) *Processor {
	return &Processor{
		handler: handler,
	}
}

// GetSensorType returns the sensor type identifier
func (p *Processor) GetSensorType() string {
	return "ctd_midas3000"
}

// ValidateData validates MIDAS 3000 data
func (p *Processor) ValidateData(data interface{}) error {
	ctdData, ok := data.(*CTDMidas3000Data)
	if !ok {
		return fmt.Errorf("invalid data type for MIDAS 3000")
	}
	
	return p.handler.validateData(ctdData)
}

// ProcessData processes and stores MIDAS 3000 data
func (p *Processor) ProcessData(vehicleCode, sensorCode string, data interface{}) error {
	ctdData, ok := data.(*CTDMidas3000Data)
	if !ok {
		return fmt.Errorf("invalid data type for MIDAS 3000")
	}
	
	return p.handler.ProcessData(ctdData)
}

// TransformForBroadcast transforms data for WebSocket broadcast
func (p *Processor) TransformForBroadcast(data interface{}) (interface{}, error) {
	ctdData, ok := data.(*CTDMidas3000Data)
	if !ok {
		return nil, fmt.Errorf("invalid data type for MIDAS 3000")
	}
	
	// Return as-is or transform as needed
	return ctdData, nil
}

// Ensure Processor implements SensorDataProcessor
var _ sensor.SensorDataProcessor = (*Processor)(nil)
