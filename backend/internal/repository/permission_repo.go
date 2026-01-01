package repository

import (
	"go-fiber-pgsql/internal/model"

	"gorm.io/gorm"
)

type PermissionRepository struct {
	db *gorm.DB
}

func NewPermissionRepository(db *gorm.DB) *PermissionRepository {
	return &PermissionRepository{db: db}
}

func (r *PermissionRepository) CreatePermission(permission *model.Permission) error {
	return r.db.Create(permission).Error
}

func (r *PermissionRepository) GetAllPermissions() ([]model.Permission, error) {
	var permissions []model.Permission
	err := r.db.Find(&permissions).Error
	return permissions, err
}

func (r *PermissionRepository) GetPermissionByID(id uint) (*model.Permission, error) {
	var permission model.Permission
	err := r.db.First(&permission, id).Error
	if err != nil {
		return nil, err
	}
	return &permission, nil
}

func (r *PermissionRepository) GetPermissionByName(name string) (*model.Permission, error) {
	var permission model.Permission
	err := r.db.Where("name = ?", name).First(&permission).Error
	if err != nil {
		return nil, err
	}
	return &permission, nil
}

func (r *PermissionRepository) UpdatePermission(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.Permission{}).Where("id = ?", id).Updates(updates).Error
}

func (r *PermissionRepository) DeletePermission(id uint) error {
	return r.db.Delete(&model.Permission{}, id).Error
}
