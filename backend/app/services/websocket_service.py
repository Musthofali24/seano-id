import asyncio
import json
import logging
from typing import List, Dict, Any
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime

logger = logging.getLogger(__name__)

class WebSocketManager:
    """
    WebSocket manager untuk streaming real-time data ke frontend
    """
    def __init__(self):
        # Active WebSocket connections
        self.active_connections: List[WebSocket] = []
        # Connection info for tracking
        self.connection_info: Dict[WebSocket, Dict[str, Any]] = {}
        
    async def connect(self, websocket: WebSocket, client_info: Dict[str, Any] = None):
        """Connect new WebSocket client"""
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Store client info
        self.connection_info[websocket] = {
            "connected_at": datetime.now().isoformat(),
            "client_info": client_info or {}
        }
        
        logger.info(f"WebSocket client connected. Total connections: {len(self.active_connections)}")
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection",
            "message": "Connected to SEANO real-time data stream",
            "timestamp": datetime.now().isoformat(),
            "connection_count": len(self.active_connections)
        }, websocket)
        
    def disconnect(self, websocket: WebSocket):
        """Disconnect WebSocket client"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.connection_info:
            del self.connection_info[websocket]
            
        logger.info(f"WebSocket client disconnected. Total connections: {len(self.active_connections)}")
        
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send message to specific WebSocket client"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all connected WebSocket clients"""
        if not self.active_connections:
            return
            
        # Add metadata
        message["broadcast_time"] = datetime.now().isoformat()
        message["connection_count"] = len(self.active_connections)
        
        # Send to all connections
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                disconnected.append(connection)
                
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
            
    async def broadcast_raw_log(self, vehicle_id: int, log_data: str):
        """Broadcast raw log data to all clients"""
        message = {
            "type": "raw_log",
            "vehicle_id": vehicle_id,
            "data": log_data,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(message)
        
    async def broadcast_sensor_log(self, vehicle_id: int, sensor_id: int, sensor_data: Dict[str, Any]):
        """Broadcast sensor log data to all clients"""
        message = {
            "type": "sensor_log",
            "vehicle_id": vehicle_id,
            "sensor_id": sensor_id,
            "data": sensor_data,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(message)
        
    async def broadcast_vehicle_log(self, vehicle_id: int, vehicle_data: Dict[str, Any]):
        """Broadcast vehicle log data to all clients"""
        message = {
            "type": "vehicle_log",
            "vehicle_id": vehicle_id,
            "data": vehicle_data,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(message)
        
    async def get_connection_stats(self) -> Dict[str, Any]:
        """Get WebSocket connection statistics"""
        return {
            "active_connections": len(self.active_connections),
            "connections_info": [
                {
                    "connected_at": info["connected_at"],
                    "client_info": info["client_info"]
                }
                for info in self.connection_info.values()
            ]
        }

# Global WebSocket manager instance
websocket_manager = WebSocketManager()