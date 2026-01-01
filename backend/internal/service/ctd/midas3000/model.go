package midas3000

import "time"

type CTDMidas3000Data struct {
	Timestamp     time.Time `json:"timestamp"`      // Timestamp from USV
	VehicleCode   string    `json:"vehicle_code"`   // Vehicle Code
	SensorCode    string    `json:"sensor_code"`    // Sensor Code
	Depth         float64   `json:"depth"`          // Depth in meters
	Pressure      float64   `json:"pressure"`       // Pressure in M
	Temperature   float64   `json:"temperature"`    // Temperature in Celsius
	Conductivity  float64   `json:"conductivity"`   // Conductivity in MS/CM
	Salinity      float64   `json:"salinity"`       // Salinity in PSU
	Density       float64   `json:"density"`        // Density in kg/m³
	SoundVelocity float64   `json:"sound_velocity"` // Sound Velocity in m/s
}
