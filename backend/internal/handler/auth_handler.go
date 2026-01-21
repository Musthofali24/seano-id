package handler

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"go-fiber-pgsql/internal/model"
	"go-fiber-pgsql/internal/repository"
	"go-fiber-pgsql/internal/util"
)

type AuthHandler struct {
	DB           *gorm.DB
	EmailService *util.EmailService
}

// RegisterEmail godoc
// @Summary Register with email
// @Description Register a new user with email, sends verification token via email
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body model.RegisterEmailRequest true "Email"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/register-email [post]
func (h *AuthHandler) RegisterEmail(c *fiber.Ctx) error {
	var req model.RegisterEmailRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request format. Please check your input.",
		})
	}

	if req.Email == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Email address is required.",
		})
	}

	token := util.GenerateVerificationToken()

	user, err := repository.CreateUserWithEmail(h.DB, req.Email, token)
	if err != nil {
		if err.Error() == "email already registered" {
			return c.Status(400).JSON(fiber.Map{
				"error": "This email is already registered. Please login instead.",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "Unable to register your account. Please try again later.",
		})
	}

	if err := h.EmailService.SendVerificationEmail(user.Email, token); err != nil {
		log.Printf("Failed to send email: %v", err)
		log.Printf("Verification token for %s: %s", user.Email, token)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to send verification email. Please contact support.",
		})
	}

	log.Printf("Verification email sent to %s", user.Email)

	return c.JSON(fiber.Map{
		"message": "Verification email sent successfully! Please check your inbox.",
	})
}

// VerifyEmail godoc
// @Summary Verify email with token
// @Description Verify email address using the token sent to email
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body model.VerifyEmailRequest true "Verification Token"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/verify-email [post]
func (h *AuthHandler) VerifyEmail(c *fiber.Ctx) error {
	var req model.VerifyEmailRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	if req.Token == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Token is required"})
	}

	user, err := repository.GetUserByVerificationToken(h.DB, req.Token)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "Email verified. Please set your credentials.",
		"token":   req.Token,
		"email":   user.Email,
	})
}

// SetCredentials godoc
// @Summary Set user credentials
// @Description Set username and password after email verification
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body model.SetCredentialsRequest true "Credentials"
// @Success 201 {object} model.LoginResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/set-credentials [post]
func (h *AuthHandler) SetCredentials(c *fiber.Ctx) error {
	var req model.SetCredentialsRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request format. Please check your input.",
		})
	}

	// Validate required fields
	if req.Token == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Verification token is required.",
		})
	}
	if req.Username == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Username is required.",
		})
	}
	if len(req.Username) < 3 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Username must be at least 3 characters long.",
		})
	}
	if req.Password == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Password is required.",
		})
	}
	if len(req.Password) < 6 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Password must be at least 6 characters long.",
		})
	}

	// Verify token
	user, err := repository.GetUserByVerificationToken(h.DB, req.Token)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid or expired verification token. Please request a new one.",
		})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Unable to process your password. Please try again.",
		})
	}

	// Set credentials
	err = repository.SetUserCredentials(h.DB, user.ID, req.Username, string(hashedPassword))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create your account. Please try again later.",
		})
	}

	// Assign default "user" role if not already assigned
	if user.RoleID == nil {
		var defaultRole model.Role
		if err := h.DB.Where("name = ?", "user").First(&defaultRole).Error; err == nil {
			h.DB.Model(&user).Update("role_id", defaultRole.ID)
		}
	}

	// Reload user with role
	user, _ = repository.GetUserByEmail(h.DB, user.Email)

	// Generate tokens
	roleName := ""
	if user.Role != nil {
		roleName = user.Role.Name
	}
	accessToken, _ := util.GenerateAccessToken(user.ID, user.Email, roleName)
	refreshToken, _ := util.GenerateRefreshToken(user.ID, user.Email, roleName)

	repository.UpdateRefreshToken(h.DB, user.ID, refreshToken)

	// Set refresh token as HTTP-only cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		MaxAge:   7 * 24 * 60 * 60, // 7 days in seconds
		HTTPOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: "Lax",
	})

	return c.Status(201).JSON(model.LoginResponse{
		User:         model.ToUserResponse(user),
		AccessToken:  accessToken,
		RefreshToken: refreshToken, // Also return in body for localStorage
		TokenType:    "bearer",
	})
}

// ResendVerification godoc
// @Summary Resend verification email
// @Description Resend verification token to email
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body model.ResendVerificationRequest true "Email"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/resend-verification [post]
func (h *AuthHandler) ResendVerification(c *fiber.Ctx) error {
	var req model.ResendVerificationRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	if req.Email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email is required"})
	}

	user, err := repository.GetUserByEmail(h.DB, req.Email)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "User not found"})
	}

	if user.IsVerified {
		return c.Status(400).JSON(fiber.Map{"error": "Email already verified"})
	}

	token := util.GenerateVerificationToken()
	err = repository.UpdateVerificationToken(h.DB, req.Email, token)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update token"})
	}

	if err := h.EmailService.SendVerificationEmail(req.Email, token); err != nil {
		log.Printf("Failed to send email: %v", err)
		log.Printf("New verification token for %s: %s", req.Email, token)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to send verification email"})
	}

	log.Printf("Verification email resent to %s", req.Email)

	return c.JSON(fiber.Map{
		"message": "Verification email resent",
	})
}

// Login godoc
// @Summary User login
// @Description Login with email and password, returns JWT tokens
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body model.LoginRequest true "Login credentials"
// @Success 200 {object} model.LoginResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req model.LoginRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request format. Please check your input.",
		})
	}

	if req.Email == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Please provide both email and password.",
		})
	}

	user, err := repository.GetUserByEmail(h.DB, req.Email)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid email or password. Please try again.",
		})
	}

	if !user.IsVerified {
		return c.Status(401).JSON(fiber.Map{
			"error": "Please verify your email before logging in. Check your inbox for the verification link.",
		})
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid email or password. Please try again.",
		})
	}

	roleName := ""
	if user.Role != nil {
		roleName = user.Role.Name
	}
	accessToken, _ := util.GenerateAccessToken(user.ID, user.Email, roleName)
	refreshToken, _ := util.GenerateRefreshToken(user.ID, user.Email, roleName)

	repository.UpdateRefreshToken(h.DB, user.ID, refreshToken)

	// Set refresh token as HTTP-only cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		MaxAge:   7 * 24 * 60 * 60, // 7 days in seconds
		HTTPOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: "Lax",
	})

	return c.JSON(model.LoginResponse{
		User:         model.ToUserResponse(user),
		AccessToken:  accessToken,
		RefreshToken: refreshToken, // Also return in body for localStorage
		TokenType:    "bearer",
	})
}

// GetMe godoc
// @Summary Get current user info
// @Description Get authenticated user information
// @Tags Authentication
// @Security BearerAuth
// @Produce json
// @Success 200 {object} model.User
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/me [get]
func (h *AuthHandler) GetMe(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var user model.User
	result := h.DB.Preload("Role").First(&user, userID)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(model.ToUserResponse(&user))
}

// RefreshToken godoc
// @Summary Refresh access token
// @Description Get new access token using refresh token from cookies
// @Tags Authentication
// @Produce json
// @Success 200 {object} model.RefreshResponse
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	// Try to get refresh token from cookie first, then from body
	refreshToken := c.Cookies("refresh_token")
	
	if refreshToken == "" {
		// Try to get from request body
		var req struct {
			RefreshToken string `json:"refresh_token"`
		}
		if err := c.BodyParser(&req); err == nil && req.RefreshToken != "" {
			refreshToken = req.RefreshToken
		}
	}
	
	if refreshToken == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Refresh token not found"})
	}

	user, err := repository.GetUserByRefreshToken(h.DB, refreshToken)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": err.Error()})
	}

	roleName := ""
	if user.Role != nil {
		roleName = user.Role.Name
	}
	accessToken, _ := util.GenerateAccessToken(user.ID, user.Email, roleName)
	newRefreshToken, _ := util.GenerateRefreshToken(user.ID, user.Email, roleName)

	// Update refresh token in database
	repository.UpdateRefreshToken(h.DB, user.ID, newRefreshToken)

	// Set new refresh token as HTTP-only cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    newRefreshToken,
		MaxAge:   7 * 24 * 60 * 60, // 7 days in seconds
		HTTPOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: "Lax",
	})

	return c.JSON(model.RefreshResponse{
		User:         model.ToUserResponse(user),
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken, // Return new refresh token
		TokenType:    "bearer",
	})
}

// Logout godoc
// @Summary User logout
// @Description Logout user and clear refresh token
// @Tags Authentication
// @Security BearerAuth
// @Produce json
// @Success 200 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	// Clear refresh token
	repository.ClearRefreshToken(h.DB, userID)

	// Clear cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		MaxAge:   -1,
		HTTPOnly: true,
	})

	return c.JSON(fiber.Map{"message": "Logged out successfully"})
}
