package midas3000

import (
	mqtt "github.com/eclipse/paho.mqtt.golang"
)

// GetClient returns the MQTT client for use by other listeners
func (l *MQTTListener) GetClient() mqtt.Client {
	return l.client
}

