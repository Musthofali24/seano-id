package handler

import (
	"go-fiber-pgsql/internal/model"
	"go-fiber-pgsql/internal/repository"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

type SensorLogHandler struct {
	sensorLogRepo *repository.SensorLogRepository
}

func NewSensorLogHandler(sensorLogRepo *repository.SensorLogRepository) *SensorLogHandler {
	return &SensorLogHandler{
		sensorLogRepo: sensorLogRepo,
	}
}

// GetSensorLogs godoc
// @Summary Get sensor logs with filters
// @Description Retrieve sensor logs with optional filters (vehicle_code, sensor_code, time range)
// @Tags Sensor Logs
// @Accept json
// @Produce json
// @Param vehicle_code query string false "Vehicle Code"
// @Param sensor_code query string false "Sensor Code"
// @Param start_time query string false "Start Time (ISO 8601)"
// @Param end_time query string false "End Time (ISO 8601)"
// @Param limit query int false "Limit" default(100)
// @Param offset query int false "Offset" default(0)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /sensor-logs [get]
func (h *SensorLogHandler) GetSensorLogs(c *fiber.Ctx) error {
	query := model.SensorLogQuery{
		VehicleCode: c.Query("vehicle_code"),
		SensorCode:  c.Query("sensor_code"),
	}

	// Parse start_time
	if startTimeStr := c.Query("start_time"); startTimeStr != "" {
		startTime, err := time.Parse(time.RFC3339, startTimeStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid start_time format, use ISO 8601",
			})
		}
		query.StartTime = startTime
	}

	// Parse end_time
	if endTimeStr := c.Query("end_time"); endTimeStr != "" {
		endTime, err := time.Parse(time.RFC3339, endTimeStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid end_time format, use ISO 8601",
			})
		}
		query.EndTime = endTime
	}

	// Parse limit and offset
	if limitStr := c.Query("limit"); limitStr != "" {
		limit, err := strconv.Atoi(limitStr)
		if err == nil && limit > 0 {
			query.Limit = limit
		}
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		offset, err := strconv.Atoi(offsetStr)
		if err == nil && offset >= 0 {
			query.Offset = offset
		}
	}

	// Get logs
	logs, err := h.sensorLogRepo.GetSensorLogs(query)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve sensor logs",
		})
	}

	// Get total count
	total, err := h.sensorLogRepo.CountLogs(query)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to count sensor logs",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data":  logs,
		"total": total,
		"limit": query.Limit,
		"offset": query.Offset,
	})
}

// GetLatestSensorLog godoc
// @Summary Get latest sensor log
// @Description Retrieve the most recent log for a specific vehicle and sensor
// @Tags Sensor Logs
// @Accept json
// @Produce json
// @Param vehicle_code path string true "Vehicle Code"
// @Param sensor_code path string true "Sensor Code"
// @Success 200 {object} model.SensorLog
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /sensor-logs/{vehicle_code}/{sensor_code}/latest [get]
func (h *SensorLogHandler) GetLatestSensorLog(c *fiber.Ctx) error {
	vehicleCode := c.Params("vehicle_code")
	sensorCode := c.Params("sensor_code")

	log, err := h.sensorLogRepo.GetLatestLog(vehicleCode, sensorCode)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "No logs found for this vehicle and sensor",
		})
	}

	return c.Status(fiber.StatusOK).JSON(log)
}

// DeleteOldLogs godoc
// @Summary Delete old sensor logs (admin only)
// @Description Delete sensor logs older than specified date
// @Tags Sensor Logs
// @Accept json
// @Produce json
// @Param before_date query string true "Before Date (ISO 8601)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /sensor-logs/cleanup [delete]
func (h *SensorLogHandler) DeleteOldLogs(c *fiber.Ctx) error {
	beforeDateStr := c.Query("before_date")
	if beforeDateStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "before_date query parameter is required",
		})
	}

	beforeDate, err := time.Parse(time.RFC3339, beforeDateStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid before_date format, use ISO 8601",
		})
	}

	deletedCount, err := h.sensorLogRepo.DeleteOldLogs(beforeDate)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete old logs",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":       "Old logs deleted successfully",
		"deleted_count": deletedCount,
	})
}
