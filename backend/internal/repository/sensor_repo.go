package repository

import (
	"go-fiber-pgsql/internal/model"

	"gorm.io/gorm"
)

type SensorRepository struct {
	db *gorm.DB
}

func NewSensorRepository(db *gorm.DB) *SensorRepository {
	return &SensorRepository{db: db}
}

func (r *SensorRepository) CreateSensor(sensor *model.Sensor) error {
	return r.db.Create(sensor).Error
}

func (r *SensorRepository) GetAllSensors() ([]model.Sensor, error) {
	var sensors []model.Sensor
	err := r.db.Preload("SensorType").Find(&sensors).Error
	return sensors, err
}

func (r *SensorRepository) GetSensorsByUserID(userID uint) ([]model.Sensor, error) {
	var sensors []model.Sensor
	err := r.db.Preload("SensorType").Where("user_id = ?", userID).Find(&sensors).Error
	return sensors, err
}

func (r *SensorRepository) GetSensorByID(id uint) (*model.Sensor, error) {
	var sensor model.Sensor
	err := r.db.Preload("SensorType").First(&sensor, id).Error
	if err != nil {
		return nil, err
	}
	return &sensor, nil
}

func (r *SensorRepository) GetSensorByCode(code string) (*model.Sensor, error) {
	var sensor model.Sensor
	err := r.db.Preload("SensorType").Where("code = ?", code).First(&sensor).Error
	if err != nil {
		return nil, err
	}
	return &sensor, nil
}

func (r *SensorRepository) UpdateSensor(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.Sensor{}).Where("id = ?", id).Updates(updates).Error
}

func (r *SensorRepository) DeleteSensor(id uint) error {
	return r.db.Delete(&model.Sensor{}, id).Error
}
