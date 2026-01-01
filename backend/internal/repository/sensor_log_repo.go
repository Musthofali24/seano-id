package repository

import (
	"go-fiber-pgsql/internal/model"
	"time"

	"gorm.io/gorm"
)

type SensorLogRepository struct {
	db *gorm.DB
}

func NewSensorLogRepository(db *gorm.DB) *SensorLogRepository {
	return &SensorLogRepository{db: db}
}

// CreateSensorLog saves a new sensor log entry
func (r *SensorLogRepository) CreateSensorLog(log *model.SensorLog) error {
	return r.db.Create(log).Error
}

// GetSensorLogs retrieves sensor logs with filters
func (r *SensorLogRepository) GetSensorLogs(query model.SensorLogQuery) ([]model.SensorLog, error) {
	var logs []model.SensorLog
	
	db := r.db.Model(&model.SensorLog{})
	
	if query.VehicleCode != "" {
		db = db.Where("vehicle_code = ?", query.VehicleCode)
	}
	
	if query.SensorCode != "" {
		db = db.Where("sensor_code = ?", query.SensorCode)
	}
	
	if !query.StartTime.IsZero() {
		db = db.Where("timestamp >= ?", query.StartTime)
	}
	
	if !query.EndTime.IsZero() {
		db = db.Where("timestamp <= ?", query.EndTime)
	}
	
	if query.Limit > 0 {
		db = db.Limit(query.Limit)
	} else {
		db = db.Limit(100) // Default limit
	}
	
	if query.Offset > 0 {
		db = db.Offset(query.Offset)
	}
	
	err := db.Order("timestamp DESC").Find(&logs).Error
	return logs, err
}

// GetLatestLog retrieves the latest log for a specific vehicle and sensor
func (r *SensorLogRepository) GetLatestLog(vehicleCode, sensorCode string) (*model.SensorLog, error) {
	var log model.SensorLog
	err := r.db.Where("vehicle_code = ? AND sensor_code = ?", vehicleCode, sensorCode).
		Order("timestamp DESC").
		First(&log).Error
	
	if err != nil {
		return nil, err
	}
	
	return &log, nil
}

// CountLogs returns the count of logs matching the query
func (r *SensorLogRepository) CountLogs(query model.SensorLogQuery) (int64, error) {
	var count int64
	
	db := r.db.Model(&model.SensorLog{})
	
	if query.VehicleCode != "" {
		db = db.Where("vehicle_code = ?", query.VehicleCode)
	}
	
	if query.SensorCode != "" {
		db = db.Where("sensor_code = ?", query.SensorCode)
	}
	
	if !query.StartTime.IsZero() {
		db = db.Where("timestamp >= ?", query.StartTime)
	}
	
	if !query.EndTime.IsZero() {
		db = db.Where("timestamp <= ?", query.EndTime)
	}
	
	err := db.Count(&count).Error
	return count, err
}

// DeleteOldLogs deletes logs older than the specified date
func (r *SensorLogRepository) DeleteOldLogs(beforeDate time.Time) (int64, error) {
	result := r.db.Where("timestamp < ?", beforeDate).Delete(&model.SensorLog{})
	return result.RowsAffected, result.Error
}
