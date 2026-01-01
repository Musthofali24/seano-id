package repository

import (
	"go-fiber-pgsql/internal/model"

	"gorm.io/gorm"
)

type RoleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) *RoleRepository {
	return &RoleRepository{db: db}
}

func (r *RoleRepository) CreateRole(role *model.Role) error {
	return r.db.Create(role).Error
}

func (r *RoleRepository) GetAllRoles() ([]model.Role, error) {
	var roles []model.Role
	err := r.db.Preload("Permissions").Find(&roles).Error
	return roles, err
}

func (r *RoleRepository) GetRoleByID(id uint) (*model.Role, error) {
	var role model.Role
	err := r.db.Preload("Permissions").First(&role, id).Error
	if err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *RoleRepository) GetRoleByName(name string) (*model.Role, error) {
	var role model.Role
	err := r.db.Preload("Permissions").Where("name = ?", name).First(&role).Error
	if err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *RoleRepository) UpdateRole(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.Role{}).Where("id = ?", id).Updates(updates).Error
}

func (r *RoleRepository) DeleteRole(id uint) error {
	return r.db.Delete(&model.Role{}, id).Error
}

func (r *RoleRepository) AssignPermissionsToRole(roleID uint, permissionIDs []uint) error {
	var role model.Role
	if err := r.db.First(&role, roleID).Error; err != nil {
		return err
	}

	var permissions []model.Permission
	if err := r.db.Find(&permissions, permissionIDs).Error; err != nil {
		return err
	}

	return r.db.Model(&role).Association("Permissions").Append(&permissions)
}

func (r *RoleRepository) RemovePermissionFromRole(roleID, permissionID uint) error {
	var role model.Role
	if err := r.db.First(&role, roleID).Error; err != nil {
		return err
	}

	var permission model.Permission
	if err := r.db.First(&permission, permissionID).Error; err != nil {
		return err
	}

	return r.db.Model(&role).Association("Permissions").Delete(&permission)
}
