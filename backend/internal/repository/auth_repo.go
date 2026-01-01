package repository

import (
	"errors"
	"time"

	"go-fiber-pgsql/internal/model"

	"gorm.io/gorm"
)

func CreateUserWithEmail(db *gorm.DB, email, token string) (*model.User, error) {
	var count int64
	db.Model(&model.User{}).Where("email = ?", email).Count(&count)
	if count > 0 {
		return nil, errors.New("email already registered")
	}

	user := &model.User{
		Email:              email,
		VerificationToken:  token,
		VerificationExpiry: time.Now().Add(24 * time.Hour), 
		IsVerified:         false,
	}

	result := db.Create(user)
	if result.Error != nil {
		return nil, result.Error
	}

	return user, nil
}

func GetUserByVerificationToken(db *gorm.DB, token string) (*model.User, error) {
	var user model.User
	result := db.Where("verification_token = ? AND verification_expiry > ?", token, time.Now()).First(&user)
	
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid or expired token")
		}
		return nil, result.Error
	}

	return &user, nil
}

func SetUserCredentials(db *gorm.DB, userID uint, username, hashedPassword string) error {
	return db.Model(&model.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"username":            username,
		"password":            hashedPassword,
		"is_verified":         true,
		"verification_token":  "",
		"verification_expiry": time.Time{},
	}).Error
}

func GetUserByEmail(db *gorm.DB, email string) (*model.User, error) {
	var user model.User
	result := db.Preload("Role").Where("email = ?", email).First(&user)
	
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, result.Error
	}

	return &user, nil
}

func UpdateRefreshToken(db *gorm.DB, userID uint, refreshToken string) error {
	return db.Model(&model.User{}).Where("id = ?", userID).Update("refresh_token", refreshToken).Error
}

func GetUserByRefreshToken(db *gorm.DB, refreshToken string) (*model.User, error) {
	var user model.User
	result := db.Preload("Role").Where("refresh_token = ?", refreshToken).First(&user)
	
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid refresh token")
		}
		return nil, result.Error
	}

	return &user, nil
}

func ClearRefreshToken(db *gorm.DB, userID uint) error {
	return db.Model(&model.User{}).Where("id = ?", userID).Update("refresh_token", "").Error
}

func UpdateVerificationToken(db *gorm.DB, email, token string) error {
	return db.Model(&model.User{}).Where("email = ?", email).Updates(map[string]interface{}{
		"verification_token":  token,
		"verification_expiry": time.Now().Add(24 * time.Hour),
	}).Error
}
