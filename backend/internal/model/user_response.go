package model

import "time"

// UserResponse is the response model for user data sent to frontend
type UserResponse struct {
	ID         uint      `json:"id"`
	Email      string    `json:"email"`
	Username   string    `json:"username"`
	IsVerified bool      `json:"is_verified"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	Role       string    `json:"role"` // Role as string, not object
}

// ToUserResponse converts a User model to UserResponse
// This ensures consistent response format across all endpoints
func ToUserResponse(user *User) UserResponse {
	roleName := ""
	if user.Role != nil {
		roleName = user.Role.Name
	}

	return UserResponse{
		ID:         user.ID,
		Email:      user.Email,
		Username:   user.Username,
		IsVerified: user.IsVerified,
		CreatedAt:  user.CreatedAt,
		UpdatedAt:  user.UpdatedAt,
		Role:       roleName,
	}
}
