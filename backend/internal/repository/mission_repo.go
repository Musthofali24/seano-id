package repository

import (
	"go-fiber-pgsql/internal/model"

	"gorm.io/gorm"
)

type MissionRepository struct {
	db *gorm.DB
}

func NewMissionRepository(db *gorm.DB) *MissionRepository {
	return &MissionRepository{db: db}
}

func (r *MissionRepository) CreateMission(mission *model.Mission) error {
	return r.db.Create(mission).Error
}

func (r *MissionRepository) GetAllMissions() ([]model.Mission, error) {
	var missions []model.Mission
	err := r.db.Preload("Vehicle").Preload("Creator").Order("created_at DESC").Find(&missions).Error
	return missions, err
}

func (r *MissionRepository) GetMissionsByUserID(userID uint) ([]model.Mission, error) {
	var missions []model.Mission
	err := r.db.Preload("Vehicle").Preload("Creator").Where("created_by = ?", userID).Order("created_at DESC").Find(&missions).Error
	return missions, err
}

func (r *MissionRepository) GetMissionByID(id uint) (*model.Mission, error) {
	var mission model.Mission
	err := r.db.Preload("Vehicle").Preload("Creator").First(&mission, id).Error
	if err != nil {
		return nil, err
	}
	return &mission, nil
}

func (r *MissionRepository) UpdateMission(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.Mission{}).Where("id = ?", id).Updates(updates).Error
}

func (r *MissionRepository) DeleteMission(id uint) error {
	return r.db.Delete(&model.Mission{}, id).Error
}

func (r *MissionRepository) GetMissionStats() (*model.MissionStats, error) {
	var stats model.MissionStats
	
	// Total missions
	r.db.Model(&model.Mission{}).Count(&stats.TotalMissions)
	
	// Active missions
	r.db.Model(&model.Mission{}).Where("status = ?", "Active").Count(&stats.ActiveMissions)
	
	// Completed missions
	r.db.Model(&model.Mission{}).Where("status = ?", "Completed").Count(&stats.CompletedMissions)
	
	// Draft missions
	r.db.Model(&model.Mission{}).Where("status = ?", "Draft").Count(&stats.DraftMissions)
	
	return &stats, nil
}

func (r *MissionRepository) GetMissionsByVehicleID(vehicleID uint) ([]model.Mission, error) {
	var missions []model.Mission
	err := r.db.Preload("Vehicle").Preload("Creator").Where("vehicle_id = ?", vehicleID).Order("created_at DESC").Find(&missions).Error
	return missions, err
}

func (r *MissionRepository) GetMissionsByStatus(status string) ([]model.Mission, error) {
	var missions []model.Mission
	err := r.db.Preload("Vehicle").Preload("Creator").Where("status = ?", status).Order("created_at DESC").Find(&missions).Error
	return missions, err
}
