package websocket

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gofiber/contrib/websocket"
)

type SensorDataMessage struct {
	MessageType string      `json:"message_type"` // "sensor_data"
	SensorType  string      `json:"sensor_type"`  // "ctd_midas3000", "adcp", etc.
	VehicleCode string      `json:"vehicle_code"`
	SensorCode  string      `json:"sensor_code"`
	Timestamp   string      `json:"timestamp"`
	Data        interface{} `json:"data"`
}

type Client struct {
	Conn   *websocket.Conn
	Send   chan []byte
	Filter ClientFilter
}

type ClientFilter struct {
	VehicleCode string
	SensorCode  string
	SensorType  string
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("WebSocket client registered. Total clients: %d", len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
			}
			h.mu.Unlock()
			log.Printf("WebSocket client unregistered. Total clients: %d", len(h.clients))

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				if h.shouldSendToClient(client, message) {
					select {
					case client.Send <- message:
					default:
						h.mu.RUnlock()
						h.unregister <- client
						h.mu.RLock()
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) shouldSendToClient(client *Client, message []byte) bool {
	if client.Filter.VehicleCode == "" && client.Filter.SensorCode == "" && client.Filter.SensorType == "" {
		return true
	}

	var msg SensorDataMessage
	if err := json.Unmarshal(message, &msg); err != nil {
		return true 
	}

	// Check filters
	if client.Filter.VehicleCode != "" && client.Filter.VehicleCode != msg.VehicleCode {
		return false
	}

	if client.Filter.SensorCode != "" && client.Filter.SensorCode != msg.SensorCode {
		return false
	}

	if client.Filter.SensorType != "" && client.Filter.SensorType != msg.SensorType {
		return false
	}

	return true
}

func (h *Hub) BroadcastSensorData(msg SensorDataMessage) error {
	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	h.broadcast <- data
	return nil
}

func (h *Hub) GetClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

func (c *Client) ReadPump(hub *Hub) {
	defer func() {
		hub.unregister <- c
		c.Conn.Close()
	}()

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		hub.handleClientMessage(c, message)
	}
}

func (c *Client) WritePump() {
	defer func() {
		c.Conn.Close()
	}()

	for {
		message, ok := <-c.Send
		if !ok {
			c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
			return
		}

		if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
			return
		}
	}
}

func (h *Hub) handleClientMessage(client *Client, message []byte) {
	var msg map[string]interface{}
	if err := json.Unmarshal(message, &msg); err != nil {
		log.Printf("Error parsing client message: %v", err)
		return
	}

	if msgType, ok := msg["type"].(string); ok && msgType == "subscribe" {
		h.mu.Lock()
		if vehicleCode, ok := msg["vehicle_code"].(string); ok {
			client.Filter.VehicleCode = vehicleCode
		}
		if sensorCode, ok := msg["sensor_code"].(string); ok {
			client.Filter.SensorCode = sensorCode
		}
		if sensorType, ok := msg["sensor_type"].(string); ok {
			client.Filter.SensorType = sensorType
		}
		h.mu.Unlock()

		log.Printf("Client filter updated: vehicle=%s, sensor=%s, type=%s",
			client.Filter.VehicleCode, client.Filter.SensorCode, client.Filter.SensorType)
	}
}
