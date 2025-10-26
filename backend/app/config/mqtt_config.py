import os
from pydantic_settings import BaseSettings

class MQTTSettings(BaseSettings):
    MQTT_BROKER: str = "d7b48187457f4e799b84ef68d8cf8783.s1.eu.hivemq.cloud"
    MQTT_PORT: int = 8883
    MQTT_USERNAME: str = "seanoraspi"
    MQTT_PASSWORD: str = "Seanoraspi24*"
    MQTT_TOPIC_RAW_LOG: str = "seano/+/raw_log"
    MQTT_TOPIC_SENSOR_LOG: str = "seano/+/sensor_log"
    MQTT_TOPIC_VEHICLE_LOG: str = "seano/+/vehicle_log"
    MQTT_USE_TLS: bool = True
    
    class Config:
        env_file = ".env"
        env_prefix = "MQTT_"
        extra = "ignore"

mqtt_settings = MQTTSettings()