package repository

import (
	"errors"
	"go-fiber-pgsql/internal/model"

	"gorm.io/gorm"
)

type VehicleSensorRepository struct {
	db *gorm.DB
}

func NewVehicleSensorRepository(db *gorm.DB) *VehicleSensorRepository {
	return &VehicleSensorRepository{db: db}
}

// AssignSensorToVehicle - Assign a sensor to a vehicle
func (r *VehicleSensorRepository) AssignSensorToVehicle(vehicleSensor *model.VehicleSensor) error {
	// Check if sensor is already assigned to this vehicle
	var existing model.VehicleSensor
	err := r.db.Where("vehicle_id = ? AND sensor_id = ?", vehicleSensor.VehicleID, vehicleSensor.SensorID).First(&existing).Error
	if err == nil {
		return errors.New("sensor already assigned to this vehicle")
	}
	if err != gorm.ErrRecordNotFound {
		return err
	}

	return r.db.Create(vehicleSensor).Error
}

// GetVehicleSensors - Get all sensors assigned to a vehicle
func (r *VehicleSensorRepository) GetVehicleSensors(vehicleID uint) ([]model.VehicleSensor, error) {
	var vehicleSensors []model.VehicleSensor
	err := r.db.Preload("Sensor").Preload("Sensor.SensorType").
		Where("vehicle_id = ?", vehicleID).
		Find(&vehicleSensors).Error
	return vehicleSensors, err
}

// GetVehicleSensorByID - Get a specific vehicle-sensor assignment
func (r *VehicleSensorRepository) GetVehicleSensorByID(id uint) (*model.VehicleSensor, error) {
	var vehicleSensor model.VehicleSensor
	err := r.db.Preload("Sensor").Preload("Sensor.SensorType").Preload("Vehicle").
		First(&vehicleSensor, id).Error
	if err != nil {
		return nil, err
	}
	return &vehicleSensor, nil
}

// RemoveSensorFromVehicle - Remove a sensor from a vehicle
func (r *VehicleSensorRepository) RemoveSensorFromVehicle(vehicleID uint, sensorID uint) error {
	return r.db.Where("vehicle_id = ? AND sensor_id = ?", vehicleID, sensorID).
		Delete(&model.VehicleSensor{}).Error
}

// UpdateVehicleSensorStatus - Update sensor status and last reading
func (r *VehicleSensorRepository) UpdateVehicleSensorStatus(vehicleID uint, sensorID uint, updates map[string]interface{}) error {
	return r.db.Model(&model.VehicleSensor{}).
		Where("vehicle_id = ? AND sensor_id = ?", vehicleID, sensorID).
		Updates(updates).Error
}

// GetAllVehicleSensorsWithStatus - Get all vehicle-sensor assignments (for admin)
func (r *VehicleSensorRepository) GetAllVehicleSensorsWithStatus() ([]model.VehicleSensor, error) {
	var vehicleSensors []model.VehicleSensor
	err := r.db.Preload("Vehicle").Preload("Sensor").Preload("Sensor.SensorType").
		Find(&vehicleSensors).Error
	return vehicleSensors, err
}

// GetVehicleSensorsByUserID - Get all vehicle sensors for a specific user
func (r *VehicleSensorRepository) GetVehicleSensorsByUserID(userID uint) ([]model.VehicleSensor, error) {
	var vehicleSensors []model.VehicleSensor
	err := r.db.Preload("Vehicle").Preload("Sensor").Preload("Sensor.SensorType").
		Joins("JOIN vehicles ON vehicles.id = vehicle_sensors.vehicle_id").
		Where("vehicles.user_id = ?", userID).
		Find(&vehicleSensors).Error
	return vehicleSensors, err
}
