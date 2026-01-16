package repository

import (
	"go-fiber-pgsql/internal/model"
	"time"

	"gorm.io/gorm"
)

type RawLogRepository struct {
	db *gorm.DB
}

func NewRawLogRepository(db *gorm.DB) *RawLogRepository {
	return &RawLogRepository{db: db}
}

// CreateRawLog saves a new raw log entry
func (r *RawLogRepository) CreateRawLog(log *model.RawLog) error {
	return r.db.Create(log).Error
}

// GetRawLogs retrieves raw logs with filters
func (r *RawLogRepository) GetRawLogs(query model.RawLogQuery) ([]model.RawLog, error) {
	var logs []model.RawLog
	
	db := r.db.Model(&model.RawLog{})
	
	if query.VehicleID != 0 {
		db = db.Where("vehicle_id = ?", query.VehicleID)
	}
	
	if query.Search != "" {
		db = db.Where("logs ILIKE ?", "%"+query.Search+"%")
	}
	
	if !query.StartTime.IsZero() {
		db = db.Where("created_at >= ?", query.StartTime)
	}
	
	if !query.EndTime.IsZero() {
		db = db.Where("created_at <= ?", query.EndTime)
	}
	
	if query.Limit > 0 {
		db = db.Limit(query.Limit)
	} else {
		db = db.Limit(100) // Default limit
	}
	
	if query.Offset > 0 {
		db = db.Offset(query.Offset)
	}
	
	// Preload Vehicle relation
	err := db.Preload("Vehicle").Order("created_at DESC").Find(&logs).Error
	return logs, err
}

// GetRawLogByID retrieves a raw log by ID
func (r *RawLogRepository) GetRawLogByID(id uint) (*model.RawLog, error) {
	var log model.RawLog
	err := r.db.First(&log, id).Error
	if err != nil {
		return nil, err
	}
	return &log, nil
}

// CountLogs returns the count of logs matching the query
func (r *RawLogRepository) CountLogs(query model.RawLogQuery) (int64, error) {
	var count int64
	
	db := r.db.Model(&model.RawLog{})
	
	if query.VehicleID != 0 {
		db = db.Where("vehicle_id = ?", query.VehicleID)
	}
	
	if query.Search != "" {
		db = db.Where("logs ILIKE ?", "%"+query.Search+"%")
	}
	
	if !query.StartTime.IsZero() {
		db = db.Where("created_at >= ?", query.StartTime)
	}
	
	if !query.EndTime.IsZero() {
		db = db.Where("created_at <= ?", query.EndTime)
	}
	
	err := db.Count(&count).Error
	return count, err
}

// GetStats returns statistics for raw logs
func (r *RawLogRepository) GetStats() (map[string]interface{}, error) {
	var totalCount int64
	var todayCount int64
	
	// Total count
	if err := r.db.Model(&model.RawLog{}).Count(&totalCount).Error; err != nil {
		return nil, err
	}
	
	// Today count
	today := time.Now().Truncate(24 * time.Hour)
	if err := r.db.Model(&model.RawLog{}).
		Where("created_at >= ?", today).
		Count(&todayCount).Error; err != nil {
		return nil, err
	}
	
	return map[string]interface{}{
		"total":      totalCount,
		"today":      todayCount,
		"last_week":  0, // Implement if needed
		"last_month": 0, // Implement if needed
	}, nil
}

// DeleteRawLog deletes a raw log by ID
func (r *RawLogRepository) DeleteRawLog(id uint) error {
	return r.db.Delete(&model.RawLog{}, id).Error
}

// DeleteOldLogs deletes logs older than the specified date
func (r *RawLogRepository) DeleteOldLogs(beforeDate time.Time) (int64, error) {
	result := r.db.Where("created_at < ?", beforeDate).Delete(&model.RawLog{})
	return result.RowsAffected, result.Error
}

