package repository

import (
	"go-fiber-pgsql/internal/model"

	"gorm.io/gorm"
)

type VehicleRepository struct {
	db *gorm.DB
}

func NewVehicleRepository(db *gorm.DB) *VehicleRepository {
	return &VehicleRepository{db: db}
}

func (r *VehicleRepository) CreateVehicle(vehicle *model.Vehicle) error {
	return r.db.Create(vehicle).Error
}

func (r *VehicleRepository) GetAllVehicles() ([]model.Vehicle, error) {
	var vehicles []model.Vehicle
	err := r.db.Preload("User").Find(&vehicles).Error
	return vehicles, err
}

func (r *VehicleRepository) GetVehiclesByUserID(userID uint) ([]model.Vehicle, error) {
	var vehicles []model.Vehicle
	err := r.db.Preload("User").Where("user_id = ?", userID).Find(&vehicles).Error
	return vehicles, err
}

func (r *VehicleRepository) GetVehicleByID(id uint) (*model.Vehicle, error) {
	var vehicle model.Vehicle
	err := r.db.Preload("User").First(&vehicle, id).Error
	if err != nil {
		return nil, err
	}
	return &vehicle, nil
}

func (r *VehicleRepository) GetVehicleByCode(code string) (*model.Vehicle, error) {
	var vehicle model.Vehicle
	err := r.db.Preload("User").Where("code = ?", code).First(&vehicle).Error
	if err != nil {
		return nil, err
	}
	return &vehicle, nil
}

func (r *VehicleRepository) UpdateVehicle(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.Vehicle{}).Where("id = ?", id).Updates(updates).Error
}

func (r *VehicleRepository) DeleteVehicle(id uint) error {
	return r.db.Delete(&model.Vehicle{}, id).Error
}

func (r *VehicleRepository) GetLatestBatteryStatus(vehicleID uint) (*model.VehicleBattery, error) {
	var battery model.VehicleBattery
	err := r.db.Where("vehicle_id = ?", vehicleID).Order("created_at DESC").First(&battery).Error
	if err != nil {
		return nil, err
	}
	return &battery, nil
}

func (r *VehicleRepository) CreateBatteryStatus(battery *model.VehicleBattery) error {
	return r.db.Create(battery).Error
}
