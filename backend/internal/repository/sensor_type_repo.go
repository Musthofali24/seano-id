package repository

import (
	"go-fiber-pgsql/internal/model"

	"gorm.io/gorm"
)

type SensorTypeRepository struct {
	db *gorm.DB
}

func NewSensorTypeRepository(db *gorm.DB) *SensorTypeRepository {
	return &SensorTypeRepository{db: db}
}

func (r *SensorTypeRepository) CreateSensorType(sensorType *model.SensorType) error {
	return r.db.Create(sensorType).Error
}

func (r *SensorTypeRepository) GetAllSensorTypes() ([]model.SensorType, error) {
	var sensorTypes []model.SensorType
	err := r.db.Find(&sensorTypes).Error
	return sensorTypes, err
}

func (r *SensorTypeRepository) GetSensorTypeByID(id uint) (*model.SensorType, error) {
	var sensorType model.SensorType
	err := r.db.First(&sensorType, id).Error
	if err != nil {
		return nil, err
	}
	return &sensorType, nil
}

func (r *SensorTypeRepository) UpdateSensorType(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.SensorType{}).Where("id = ?", id).Updates(updates).Error
}

func (r *SensorTypeRepository) DeleteSensorType(id uint) error {
	return r.db.Delete(&model.SensorType{}, id).Error
}
