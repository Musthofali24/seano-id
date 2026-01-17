package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// Waypoint represents a GPS waypoint with lat/lng coordinates
type Waypoint struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

// WaypointArray is a custom type for JSON array of waypoints
type WaypointArray []Waypoint

// Value converts WaypointArray to JSON for database storage
func (w WaypointArray) Value() (driver.Value, error) {
	return json.Marshal(w)
}

// Scan converts database JSON to WaypointArray
func (w *WaypointArray) Scan(value interface{}) error {
	if value == nil {
		*w = WaypointArray{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("failed to scan waypoints")
	}
	return json.Unmarshal(bytes, w)
}

type Mission struct {
	ID           uint          `json:"id" gorm:"primaryKey"`
	Name         string        `json:"name" gorm:"type:varchar(200);not null"`
	Description  string        `json:"description" gorm:"type:text"`
	Status       string        `json:"status" gorm:"type:varchar(20);default:'Draft'"` // Draft, Active, Completed, Cancelled
	VehicleID    *uint         `json:"vehicle_id" gorm:"index"`
	Vehicle      *Vehicle      `json:"vehicle,omitempty" gorm:"foreignKey:VehicleID"`
	Waypoints    WaypointArray `json:"waypoints" gorm:"type:jsonb"`
	HomeLocation *Waypoint     `json:"home_location,omitempty" gorm:"type:jsonb;serializer:json"`
	StartTime    *time.Time    `json:"start_time"`
	EndTime      *time.Time    `json:"end_time"`
	CreatedBy    uint          `json:"created_by" gorm:"not null;index"`
	Creator      *User         `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
	CreatedAt    time.Time     `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time     `json:"updated_at" gorm:"autoUpdateTime"`
}

// Request/Response Models for Mission
type CreateMissionRequest struct {
	Name         string     `json:"name" example:"Mission Alpha"`
	Description  string     `json:"description" example:"Survey mission in sector A"`
	Status       string     `json:"status,omitempty" example:"Draft"`
	VehicleID    *uint      `json:"vehicle_id,omitempty" example:"1"`
	Waypoints    []Waypoint `json:"waypoints,omitempty"`
	HomeLocation *Waypoint  `json:"home_location,omitempty"`
	StartTime    *time.Time `json:"start_time,omitempty"`
	EndTime      *time.Time `json:"end_time,omitempty"`
}

type UpdateMissionRequest struct {
	Name         *string    `json:"name,omitempty"`
	Description  *string    `json:"description,omitempty"`
	Status       *string    `json:"status,omitempty"`
	VehicleID    *uint      `json:"vehicle_id,omitempty"`
	Waypoints    []Waypoint `json:"waypoints,omitempty"`
	HomeLocation *Waypoint  `json:"home_location,omitempty"`
	StartTime    *time.Time `json:"start_time,omitempty"`
	EndTime      *time.Time `json:"end_time,omitempty"`
}

type MissionStats struct {
	TotalMissions     int64 `json:"total_missions"`
	ActiveMissions    int64 `json:"active_missions"`
	CompletedMissions int64 `json:"completed_missions"`
	DraftMissions     int64 `json:"draft_missions"`
}
