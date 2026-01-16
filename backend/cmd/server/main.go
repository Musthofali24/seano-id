package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"

	"go-fiber-pgsql/internal/config"
	"go-fiber-pgsql/internal/model"
	"go-fiber-pgsql/internal/repository"
	"go-fiber-pgsql/internal/route"
	"go-fiber-pgsql/internal/seeder"
	"go-fiber-pgsql/internal/service/ctd/midas3000"
	mqttservice "go-fiber-pgsql/internal/service/mqtt"
	wsocket "go-fiber-pgsql/internal/websocket"
)

// @title User Management API with Authentication
// @version 1.0
// @description Complete API with JWT authentication, email verification, and CRUD operations
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@example.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host api.seano.cloud
// @BasePath /
// @schemes https

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Enter your JWT token (Bearer prefix will be added automatically)
func main() {
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatal(err)
	}

	if err := config.MigrateDB(db, &model.User{}, &model.Role{}, &model.Permission{}, &model.SensorType{}, &model.Sensor{}, &model.Vehicle{}, &model.VehicleBattery{}, &model.VehicleSensor{}, &model.SensorLog{}, &model.VehicleLog{}, &model.RawLog{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Setup TimescaleDB hypertables for time-series data
	if err := config.SetupHypertables(db); err != nil {
		log.Printf("Warning: Failed to setup hypertables: %v", err)
	}

	seeder.SeedRolesAndPermissions(db)

	seeder.SeedAdminUser(db)

	seeder.SeedRegularUser(db)

	seeder.SeedSensorTypes(db)

	seeder.SeedSensors(db)

	wsHub := wsocket.NewHub()
	go wsHub.Run()
	log.Println("WebSocket Hub started")

	// Initialize repositories
	sensorLogRepo := repository.NewSensorLogRepository(db)
	vehicleLogRepo := repository.NewVehicleLogRepository(db)
	rawLogRepo := repository.NewRawLogRepository(db)
	vehicleSensorRepo := repository.NewVehicleSensorRepository(db)
	vehicleRepo := repository.NewVehicleRepository(db)
	sensorRepo := repository.NewSensorRepository(db)
	
	// MIDAS 3000 handler (legacy)
	midas3000Handler := midas3000.NewDataHandler(sensorLogRepo, vehicleSensorRepo, wsHub)

	mqttBroker := getEnv("MQTT_BROKER", "")
	mqttPort := getEnv("MQTT_PORT", "1883")
	mqttUseTLS := getEnv("MQTT_USE_TLS", "false")
	
	var brokerURL string
	if mqttBroker != "" {
		if mqttUseTLS == "true" {
			brokerURL = "ssl://" + mqttBroker + ":" + mqttPort
		} else {
			brokerURL = "tcp://" + mqttBroker + ":" + mqttPort
		}
	}
	
	mqttConfig := midas3000.MQTTConfig{
		BrokerURL:   brokerURL,
		ClientID:    getEnv("MQTT_CLIENT_ID", "go-fiber-server"),
		Username:    getEnv("MQTT_USERNAME", ""),
		Password:    getEnv("MQTT_PASSWORD", ""),
		TopicPrefix: getEnv("MQTT_TOPIC_PREFIX", "seano"),
	}
	
	if brokerURL != "" {
		// MIDAS 3000 listener (legacy)
		mqttListener, err := midas3000.NewMQTTListener(mqttConfig, midas3000Handler)
		if err != nil {
			log.Printf("Warning: Failed to create MQTT listener: %v", err)
		} else {
			if err := mqttListener.Connect(); err != nil {
				log.Printf("Warning: Failed to connect to MQTT broker: %v", err)
			} else {
				if err := mqttListener.Subscribe(); err != nil {
					log.Printf("Warning: Failed to subscribe to MQTT topics: %v", err)
				} else {
					log.Println("MQTT Listener started and subscribed to topics")
				}
				
				// Start new log listeners
				mqttClient := mqttListener.GetClient()
				
				// Vehicle Log Listener
				vehicleLogListener := mqttservice.NewVehicleLogListener(mqttClient, vehicleLogRepo, vehicleRepo, wsHub)
				if err := vehicleLogListener.Start(); err != nil {
					log.Printf("Warning: Failed to start vehicle log listener: %v", err)
				}
				
				// Sensor Log Listener
				sensorLogListener := mqttservice.NewSensorLogListener(mqttClient, sensorLogRepo, vehicleRepo, sensorRepo, wsHub)
				if err := sensorLogListener.Start(); err != nil {
					log.Printf("Warning: Failed to start sensor log listener: %v", err)
				}
				
				// Raw Log Listener
				rawLogListener := mqttservice.NewRawLogListener(mqttClient, rawLogRepo, vehicleRepo, wsHub)
				if err := rawLogListener.Start(); err != nil {
					log.Printf("Warning: Failed to start raw log listener: %v", err)
				}
			}
		}
	} else {
		log.Println("MQTT not configured, skipping MQTT listener")
	}

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: false,
	}))

	route.SetupRoutes(app, db, wsHub)

	// log.Println("Server starting on :3000")
	// log.Println("Swagger UI available at http://localhost:3000/swagger")

	app.Listen(":3000")
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
