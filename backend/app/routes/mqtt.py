from fastapi import APIRouter, HTTPException
from app.services.mqtt_service import mqtt_listener

router = APIRouter()

@router.get("/mqtt/status")
async def get_mqtt_status():
    """Get MQTT listener status"""
    return {
        "status": "running" if mqtt_listener.running else "stopped",
        "connected": mqtt_listener.running
    }

@router.post("/mqtt/start")
async def start_mqtt_listener():
    """Start MQTT listener manually"""
    if mqtt_listener.running:
        raise HTTPException(status_code=400, detail="MQTT listener is already running")
    
    return {"message": "MQTT listener start requested"}

@router.post("/mqtt/stop")
async def stop_mqtt_listener():
    if not mqtt_listener.running:
        raise HTTPException(status_code=400, detail="MQTT listener is not running")
    
    await mqtt_listener.stop_listener()
    return {"message": "MQTT listener stopped"}