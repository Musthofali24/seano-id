import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.services.websocket_service import websocket_manager

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint untuk real-time data streaming
    
    Frontend connect ke: ws://localhost:8000/ws
    """
    await websocket_manager.connect(websocket)
    
    try:
        while True:
            # Listen for client messages (optional)
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                
                # Handle different message types from client
                if message.get("type") == "ping":
                    await websocket_manager.send_personal_message({
                        "type": "pong",
                        "timestamp": message.get("timestamp")
                    }, websocket)
                    
                elif message.get("type") == "subscribe":
                    # Handle subscription preferences
                    await websocket_manager.send_personal_message({
                        "type": "subscription_ack",
                        "message": "Subscription preferences updated"
                    }, websocket)
                    
            except json.JSONDecodeError:
                await websocket_manager.send_personal_message({
                    "type": "error",
                    "message": "Invalid JSON format"
                }, websocket)
                
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
        logger.info("WebSocket client disconnected")

@router.websocket("/ws/vehicle/{vehicle_id}")
async def websocket_vehicle_endpoint(websocket: WebSocket, vehicle_id: int):
    """
    WebSocket endpoint untuk specific vehicle data
    
    Frontend connect ke: ws://localhost:8000/ws/vehicle/1
    """
    client_info = {"vehicle_filter": vehicle_id}
    await websocket_manager.connect(websocket, client_info)
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await websocket_manager.send_personal_message({
                        "type": "pong",
                        "vehicle_id": vehicle_id,
                        "timestamp": message.get("timestamp")
                    }, websocket)
                    
            except json.JSONDecodeError:
                await websocket_manager.send_personal_message({
                    "type": "error",
                    "message": "Invalid JSON format"
                }, websocket)
                
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
        logger.info(f"WebSocket client disconnected from vehicle {vehicle_id}")

@router.get("/ws/stats")
async def get_websocket_stats():
    """Get WebSocket connection statistics"""
    return await websocket_manager.get_connection_stats()