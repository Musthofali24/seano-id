package util

import (
	"os"
	"time"

	"go-fiber-pgsql/internal/middleware"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateAccessToken(userID uint, email, role string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	// if secret == "" {
	// 	secret = "your-secret-key-change-in-production"
	// }

	claims := middleware.JWTClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // 24 hours
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func GenerateRefreshToken(userID uint, email, role string) (string, error) {
	secret := os.Getenv("JWT_SECRET")

	claims := middleware.JWTClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)), // 7 days
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func GenerateVerificationToken() string {
	return time.Now().Format("20060102150405") + "-" + RandomString(32)
}

func RandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}
