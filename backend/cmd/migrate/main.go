package main

import (
	"log"

	"go-fiber-pgsql/internal/config"
	"go-fiber-pgsql/internal/model"
)

func main() {
	log.Println("Starting fresh migration...")

	// Membuka koneksi database
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Drop tabel yang sudah ada
	log.Println("Dropping existing tables...")
	if err := db.Migrator().DropTable(
		&model.User{},
		&model.Role{},
		&model.Permission{},
		&model.SensorType{},
		&model.Sensor{},
		&model.Vehicle{},
		&model.VehicleSensor{},
		&model.SensorLog{},
	); err != nil {
		log.Println("Warning: Failed to drop tables (might not exist):", err)
	}

	// Membuat ulang tabel berdasarkan model
	log.Println("Creating tables...")
	if err := config.MigrateDB(db,
		&model.Role{},
		&model.Permission{},
		&model.User{},
		&model.SensorType{},
		&model.Sensor{},
		&model.Vehicle{},
		&model.VehicleSensor{},
		&model.SensorLog{},
	); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Fresh migration completed successfully!")
}
