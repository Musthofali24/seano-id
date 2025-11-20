import os
from pydantic_settings import BaseSettings


class MQTTSettings(BaseSettings):
    MQTT_BROKER: str = os.getenv(
        "MQTT_BROKER", "d7b48187457f4e799b84ef68d8cf8783.s1.eu.hivemq.cloud"
    )
    MQTT_PORT: int = int(os.getenv("MQTT_PORT", "8883"))
    MQTT_USERNAME: str = os.getenv("MQTT_USERNAME", "seanoraspi")
    MQTT_PASSWORD: str = os.getenv("MQTT_PASSWORD", "Seano2025*")
    MQTT_TOPIC_RAW_LOG: str = os.getenv("MQTT_TOPIC_RAW_LOG", "seano/+/raw_log")
    MQTT_TOPIC_SENSOR_LOG: str = os.getenv(
        "MQTT_TOPIC_SENSOR_LOG", "seano/+/sensor_log"
    )
    MQTT_TOPIC_VEHICLE_LOG: str = os.getenv(
        "MQTT_TOPIC_VEHICLE_LOG", "seano/+/vehicle_log"
    )
    MQTT_USE_TLS: bool = os.getenv("MQTT_USE_TLS", "true").lower() == "true"

    class Config:
        env_file = ".env"
        extra = "ignore"


mqtt_settings = MQTTSettings()
