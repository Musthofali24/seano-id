package config

import (
	"log"

	"gorm.io/gorm"
)

func SetupHypertables(db *gorm.DB) error {
	if err := db.Exec("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;").Error; err != nil {
		log.Printf("Warning: Could not create timescaledb extension (might already exist): %v", err)
	}

	if err := db.Exec(`
		SELECT create_hypertable('sensor_logs', 'created_at', 
			if_not_exists => TRUE,
			migrate_data => TRUE
		);
	`).Error; err != nil {
		log.Printf("Warning: Could not create hypertable for sensor_logs: %v", err)
	} else {
		log.Println("✓ Hypertable created: sensor_logs")
	}

	if err := db.Exec(`
		SELECT create_hypertable('vehicle_logs', 'created_at', 
			if_not_exists => TRUE,
			migrate_data => TRUE
		);
	`).Error; err != nil {
		log.Printf("Warning: Could not create hypertable for vehicle_logs: %v", err)
	} else {
		log.Println("✓ Hypertable created: vehicle_logs")
	}

	if err := db.Exec(`
		SELECT create_hypertable('raw_logs', 'created_at', 
			if_not_exists => TRUE,
			migrate_data => TRUE
		);
	`).Error; err != nil {
		log.Printf("Warning: Could not create hypertable for raw_logs: %v", err)
	} else {
		log.Println("✓ Hypertable created: raw_logs")
	}

	compressionQueries := []string{
		`ALTER TABLE sensor_logs SET (timescaledb.compress, timescaledb.compress_segmentby = 'vehicle_id, sensor_id');`,
		`SELECT add_compression_policy('sensor_logs', INTERVAL '7 days', if_not_exists => TRUE);`,
		
		`ALTER TABLE vehicle_logs SET (timescaledb.compress, timescaledb.compress_segmentby = 'vehicle_id');`,
		`SELECT add_compression_policy('vehicle_logs', INTERVAL '7 days', if_not_exists => TRUE);`,
		
		`ALTER TABLE raw_logs SET (timescaledb.compress);`,
		`SELECT add_compression_policy('raw_logs', INTERVAL '7 days', if_not_exists => TRUE);`,
	}

	for _, query := range compressionQueries {
		if err := db.Exec(query).Error; err != nil {
			log.Printf("Warning: Compression policy setup: %v", err)
		}
	}

	log.Println("✓ Hypertable compression policies configured")

	retentionQueries := []string{
		`SELECT add_retention_policy('sensor_logs', INTERVAL '90 days', if_not_exists => TRUE);`,
		`SELECT add_retention_policy('vehicle_logs', INTERVAL '90 days', if_not_exists => TRUE);`,
		`SELECT add_retention_policy('raw_logs', INTERVAL '30 days', if_not_exists => TRUE);`,
	}

	for _, query := range retentionQueries {
		if err := db.Exec(query).Error; err != nil {
			log.Printf("Warning: Retention policy setup: %v", err)
		}
	}

	log.Println("✓ Hypertable retention policies configured")

	return nil
}

