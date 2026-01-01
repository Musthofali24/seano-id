package middleware

import (
	"go-fiber-pgsql/internal/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// CheckPermission checks if user has required permission
func CheckPermission(db *gorm.DB, permission string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("user_id")
		if userID == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "You are not authorized. Please login first",
			})
		}

		// Get user with role and permissions
		var user model.User
		if err := db.Preload("Role.Permissions").First(&user, userID).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "User account not found. Please contact support",
			})
		}

		// Check if user has role with the required permission
		if user.Role != nil {
			for _, perm := range user.Role.Permissions {
				if perm.Name == permission {
					return c.Next()
				}
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to access this resource",
		})
	}
}

// HasPermission helper function to check permission in handler
func HasPermission(db *gorm.DB, userID uint, permission string) bool {
	var user model.User
	if err := db.Preload("Role.Permissions").First(&user, userID).Error; err != nil {
		return false
	}

	if user.Role != nil {
		for _, perm := range user.Role.Permissions {
			if perm.Name == permission {
				return true
			}
		}
	}

	return false
}
