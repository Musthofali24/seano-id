package handler

import (
	"go-fiber-pgsql/internal/model"
	"go-fiber-pgsql/internal/repository"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type SensorTypeHandler struct {
	sensorTypeRepo *repository.SensorTypeRepository
}

func NewSensorTypeHandler(sensorTypeRepo *repository.SensorTypeRepository) *SensorTypeHandler {
	return &SensorTypeHandler{sensorTypeRepo: sensorTypeRepo}
}

// CreateSensorType godoc
// @Summary Create a new sensor type (admin only)
// @Description Create a new sensor type with name and description. Requires sensor_types.manage permission.
// @Tags Sensor Types
// @Accept json
// @Produce json
// @Param sensor_type body model.CreateSensorTypeRequest true "Sensor Type data"
// @Success 201 {object} model.SensorType
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /sensor-types [post]
func (h *SensorTypeHandler) CreateSensorType(c *fiber.Ctx) error {
	var req model.CreateSensorTypeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request data",
		})
	}

	sensorType := &model.SensorType{
		Name:        req.Name,
		Description: req.Description,
	}

	if err := h.sensorTypeRepo.CreateSensorType(sensorType); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create sensor type",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(sensorType)
}

// GetAllSensorTypes godoc
// @Summary Get all sensor types
// @Description Get all sensor types (accessible to all authenticated users for filtering sensors)
// @Tags Sensor Types
// @Produce json
// @Success 200 {array} model.SensorType
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /sensor-types [get]
func (h *SensorTypeHandler) GetAllSensorTypes(c *fiber.Ctx) error {
	sensorTypes, err := h.sensorTypeRepo.GetAllSensorTypes()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch sensor types",
		})
	}

	return c.JSON(sensorTypes)
}

// GetSensorTypeByID godoc
// @Summary Get a sensor type by ID
// @Description Get a specific sensor type by ID (accessible to all authenticated users)
// @Tags Sensor Types
// @Produce json
// @Param sensor_type_id path int true "Sensor Type ID"
// @Success 200 {object} model.SensorType
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /sensor-types/{sensor_type_id} [get]
func (h *SensorTypeHandler) GetSensorTypeByID(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("sensor_type_id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid sensor type ID",
		})
	}

	sensorType, err := h.sensorTypeRepo.GetSensorTypeByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Sensor type not found",
		})
	}

	return c.JSON(sensorType)
}

// UpdateSensorType godoc
// @Summary Update a sensor type (admin only)
// @Description Update a sensor type's name and/or description. Requires sensor_types.manage permission.
// @Tags Sensor Types
// @Accept json
// @Produce json
// @Param sensor_type_id path int true "Sensor Type ID"
// @Param sensor_type body model.UpdateSensorTypeRequest true "Updated sensor type data"
// @Success 200 {object} model.SensorType
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /sensor-types/{sensor_type_id} [put]
func (h *SensorTypeHandler) UpdateSensorType(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("sensor_type_id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid sensor type ID",
		})
	}

	var req model.UpdateSensorTypeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request data",
		})
	}

	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}

	if err := h.sensorTypeRepo.UpdateSensorType(uint(id), updates); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update sensor type",
		})
	}

	sensorType, err := h.sensorTypeRepo.GetSensorTypeByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Sensor type not found",
		})
	}

	return c.JSON(sensorType)
}

// DeleteSensorType godoc
// @Summary Delete a sensor type (admin only)
// @Description Delete a sensor type by ID. Requires sensor_types.manage permission.
// @Tags Sensor Types
// @Produce json
// @Param sensor_type_id path int true "Sensor Type ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /sensor-types/{sensor_type_id} [delete]
func (h *SensorTypeHandler) DeleteSensorType(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("sensor_type_id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid sensor type ID",
		})
	}

	if err := h.sensorTypeRepo.DeleteSensorType(uint(id)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete sensor type",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Sensor type deleted successfully",
	})
}
