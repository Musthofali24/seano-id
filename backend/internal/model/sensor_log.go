package model

import "time"

// SensorLog stores all sensor readings/logs from vehicles
type SensorLog struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	VehicleCode string    `json:"vehicle_code" gorm:"type:varchar(50);not null;index"`
	SensorCode  string    `json:"sensor_code" gorm:"type:varchar(50);not null;index"`
	Timestamp   time.Time `json:"timestamp" gorm:"not null;index"`
	Data        string    `json:"data" gorm:"type:jsonb;not null"` // JSON data from sensor
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
}

// Index for faster queries
func (SensorLog) TableName() string {
	return "sensor_logs"
}

// SensorLogQuery for filtering logs
type SensorLogQuery struct {
	VehicleCode string    `query:"vehicle_code"`
	SensorCode  string    `query:"sensor_code"`
	StartTime   time.Time `query:"start_time"`
	EndTime     time.Time `query:"end_time"`
	Limit       int       `query:"limit"`
	Offset      int       `query:"offset"`
}
