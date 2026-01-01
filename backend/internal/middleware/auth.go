package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func AuthRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{"error": "You are not authorized. Please login first"})
		}

		var tokenString string
		
		// Check if it starts with "Bearer " (user typed it manually)
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		} else if strings.HasPrefix(authHeader, "bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "bearer ")
		} else {
			// Assume it's just the token (from Swagger auto-prefix)
			tokenString = authHeader
		}

		tokenString = strings.TrimSpace(tokenString)
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			secret = "your-secret-key-change-in-production"
		}

		// Parse and validate token
		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(401).JSON(fiber.Map{"error": "Your session has expired or token is invalid. Please login again"})
		}

		// Extract claims
		if claims, ok := token.Claims.(*JWTClaims); ok {
			c.Locals("user_id", claims.UserID)
			c.Locals("email", claims.Email)
			c.Locals("role", claims.Role)
		}

		return c.Next()
	}
}
