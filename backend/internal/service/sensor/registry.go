package sensor

// SensorDataProcessor is an interface for processing different sensor types
type SensorDataProcessor interface {
	// GetSensorType returns the sensor type identifier (e.g., "ctd_midas3000", "ctd_seabird", etc.)
	GetSensorType() string
	
	// ValidateData validates the sensor data
	ValidateData(data interface{}) error
	
	// ProcessData processes and stores the sensor data
	ProcessData(vehicleCode, sensorCode string, data interface{}) error
	
	// TransformForBroadcast transforms the data for WebSocket broadcast
	TransformForBroadcast(data interface{}) (interface{}, error)
}

// SensorRegistry manages different sensor processors
type SensorRegistry struct {
	processors map[string]SensorDataProcessor
}

// NewSensorRegistry creates a new sensor registry
func NewSensorRegistry() *SensorRegistry {
	return &SensorRegistry{
		processors: make(map[string]SensorDataProcessor),
	}
}

// Register registers a sensor processor
func (r *SensorRegistry) Register(processor SensorDataProcessor) {
	r.processors[processor.GetSensorType()] = processor
}

// GetProcessor returns a processor for the given sensor type
func (r *SensorRegistry) GetProcessor(sensorType string) (SensorDataProcessor, bool) {
	processor, ok := r.processors[sensorType]
	return processor, ok
}

// GetAllProcessors returns all registered processors
func (r *SensorRegistry) GetAllProcessors() []SensorDataProcessor {
	processors := make([]SensorDataProcessor, 0, len(r.processors))
	for _, p := range r.processors {
		processors = append(processors, p)
	}
	return processors
}
