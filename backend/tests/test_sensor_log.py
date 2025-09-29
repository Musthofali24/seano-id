# tests/test_sensor_log.py
import pytest
from httpx import AsyncClient
from tests.conftest import TestSensorLog


class TestSensorLogEndpoints:
    """Test suite for Sensor Log API endpoints."""

    @pytest.mark.asyncio
    async def test_create_sensor_logs(self, client: AsyncClient):
        """Test creating multiple sensor logs."""
        vehicle_response = await client.post("/vehicles/", json={"name": "Test Vehicle"})
        vehicle_id = vehicle_response.json()["id"]
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Test Sensor Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        sensor_response = await client.post("/sensors/", json={
            "name": "Test Sensor",
            "sensor_type_id": sensor_type_id
        })
        sensor_id = sensor_response.json()["id"]
        
        logs_data = [
            {
                "vehicle_id": vehicle_id,
                "sensor_id": sensor_id,
                "data": {"temperature": 25.5, "humidity": 60.0}
            },
            {
                "vehicle_id": vehicle_id,
                "sensor_id": sensor_id,
                "data": {"temperature": 26.0, "humidity": 58.5}
            }
        ]
        
        response = await client.post("/sensor-logs/", json=logs_data)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        
        first_log = data[0]
        assert first_log["vehicle_id"] == vehicle_id
        assert first_log["sensor_id"] == sensor_id
        assert first_log["data"]["temperature"] == 25.5
        assert first_log["data"]["humidity"] == 60.0
        assert "id" in first_log
        assert "created_at" in first_log

    @pytest.mark.asyncio
    async def test_create_single_sensor_log(self, client: AsyncClient):
        vehicle_response = await client.post("/vehicles/", json={"name": "Single Test Vehicle"})
        vehicle_id = vehicle_response.json()["id"]
        
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Single Test Sensor Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        sensor_response = await client.post("/sensors/", json={
            "name": "Single Test Sensor",
            "sensor_type_id": sensor_type_id
        })
        sensor_id = sensor_response.json()["id"]
        
        log_data = [{
            "vehicle_id": vehicle_id,
            "sensor_id": sensor_id,
            "data": {"speed": 45.2, "rpm": 2500}
        }]
        
        response = await client.post("/sensor-logs/", json=log_data)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        
        log = data[0]
        assert log["vehicle_id"] == vehicle_id
        assert log["sensor_id"] == sensor_id
        assert log["data"]["speed"] == 45.2
        assert log["data"]["rpm"] == 2500

    @pytest.mark.asyncio
    async def test_get_all_sensor_logs_empty(self, client: AsyncClient):
        response = await client.get("/sensor-logs/")
        
        assert response.status_code == 200
        data = response.json()
        assert data == []

    @pytest.mark.asyncio
    async def test_get_all_sensor_logs_with_data(self, client: AsyncClient):
        vehicle_response = await client.post("/vehicles/", json={"name": "Log Test Vehicle"})
        vehicle_id = vehicle_response.json()["id"]
        
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Log Test Sensor Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        sensor_response = await client.post("/sensors/", json={
            "name": "Log Test Sensor",
            "sensor_type_id": sensor_type_id
        })
        sensor_id = sensor_response.json()["id"]

        logs_data = [
            {
                "vehicle_id": vehicle_id,
                "sensor_id": sensor_id,
                "data": {"value": 100}
            },
            {
                "vehicle_id": vehicle_id,
                "sensor_id": sensor_id,
                "data": {"value": 200}
            }
        ]
        
        await client.post("/sensor-logs/", json=logs_data)
        
        response = await client.get("/sensor-logs/")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        
        values = [log["data"]["value"] for log in data]
        assert 100 in values
        assert 200 in values

    @pytest.mark.asyncio
    async def test_get_sensor_log_by_id(self, client: AsyncClient):
        
        vehicle_response = await client.post("/vehicles/", json={"name": "ID Test Vehicle"})
        vehicle_id = vehicle_response.json()["id"]
        
        sensor_type_response = await client.post("/sensor-types/", json={"name": "ID Test Sensor Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        sensor_response = await client.post("/sensors/", json={
            "name": "ID Test Sensor",
            "sensor_type_id": sensor_type_id
        })
        sensor_id = sensor_response.json()["id"]
        
        log_data = [{
            "vehicle_id": vehicle_id,
            "sensor_id": sensor_id,
            "data": {"test_value": 42.0, "status": "active"}
        }]
        
        create_response = await client.post("/sensor-logs/", json=log_data)
        created_log = create_response.json()[0]
        log_id = created_log["id"]
        
        # Get log by ID
        response = await client.get(f"/sensor-logs/{log_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == log_id
        assert data["vehicle_id"] == vehicle_id
        assert data["sensor_id"] == sensor_id
        assert data["data"]["test_value"] == 42.0
        assert data["data"]["status"] == "active"

    @pytest.mark.asyncio
    async def test_get_sensor_log_by_nonexistent_id(self, client: AsyncClient):
        """Test getting a sensor log with non-existent ID."""
        response = await client.get("/sensor-logs/999")
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Log not found"

    @pytest.mark.asyncio
    async def test_filter_logs_by_vehicle_id(self, client: AsyncClient):
        """Test filtering sensor logs by vehicle_id."""
        # Create two test vehicles
        vehicle1_response = await client.post("/vehicles/", json={"name": "Vehicle 1"})
        vehicle1_id = vehicle1_response.json()["id"]
        
        vehicle2_response = await client.post("/vehicles/", json={"name": "Vehicle 2"})
        vehicle2_id = vehicle2_response.json()["id"]
        
        # Create test sensor type and sensor
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Filter Test Sensor Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        sensor_response = await client.post("/sensors/", json={
            "name": "Filter Test Sensor",
            "sensor_type_id": sensor_type_id
        })
        sensor_id = sensor_response.json()["id"]
        
        # Create logs for both vehicles
        logs_data = [
            {"vehicle_id": vehicle1_id, "sensor_id": sensor_id, "data": {"vehicle": "1"}},
            {"vehicle_id": vehicle2_id, "sensor_id": sensor_id, "data": {"vehicle": "2"}},
            {"vehicle_id": vehicle1_id, "sensor_id": sensor_id, "data": {"vehicle": "1_again"}}
        ]
        
        await client.post("/sensor-logs/", json=logs_data)
        
        # Filter by vehicle1_id
        response = await client.get(f"/sensor-logs/?vehicle_id={vehicle1_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        
        # All logs should belong to vehicle1
        for log in data:
            assert log["vehicle_id"] == vehicle1_id

    @pytest.mark.asyncio
    async def test_filter_logs_by_sensor_id(self, client: AsyncClient):
        """Test filtering sensor logs by sensor_id."""
        # Create test vehicle
        vehicle_response = await client.post("/vehicles/", json={"name": "Sensor Filter Vehicle"})
        vehicle_id = vehicle_response.json()["id"]
        
        # Create test sensor type
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Sensor Filter Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create two test sensors
        sensor1_response = await client.post("/sensors/", json={
            "name": "Sensor 1",
            "sensor_type_id": sensor_type_id
        })
        sensor1_id = sensor1_response.json()["id"]
        
        sensor2_response = await client.post("/sensors/", json={
            "name": "Sensor 2",
            "sensor_type_id": sensor_type_id
        })
        sensor2_id = sensor2_response.json()["id"]
        
        # Create logs for both sensors
        logs_data = [
            {"vehicle_id": vehicle_id, "sensor_id": sensor1_id, "data": {"sensor": "1"}},
            {"vehicle_id": vehicle_id, "sensor_id": sensor2_id, "data": {"sensor": "2"}},
            {"vehicle_id": vehicle_id, "sensor_id": sensor1_id, "data": {"sensor": "1_again"}}
        ]
        
        await client.post("/sensor-logs/", json=logs_data)
        
        # Filter by sensor1_id
        response = await client.get(f"/sensor-logs/?sensor_id={sensor1_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        
        # All logs should belong to sensor1
        for log in data:
            assert log["sensor_id"] == sensor1_id

    @pytest.mark.asyncio
    async def test_filter_logs_by_multiple_criteria(self, client: AsyncClient):
        """Test filtering sensor logs by multiple criteria."""
        # Create test vehicles
        vehicle1_response = await client.post("/vehicles/", json={"name": "Multi Filter Vehicle 1"})
        vehicle1_id = vehicle1_response.json()["id"]
        
        vehicle2_response = await client.post("/vehicles/", json={"name": "Multi Filter Vehicle 2"})
        vehicle2_id = vehicle2_response.json()["id"]
        
        # Create test sensor type and sensors
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Multi Filter Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        sensor1_response = await client.post("/sensors/", json={
            "name": "Multi Filter Sensor 1",
            "sensor_type_id": sensor_type_id
        })
        sensor1_id = sensor1_response.json()["id"]
        
        sensor2_response = await client.post("/sensors/", json={
            "name": "Multi Filter Sensor 2",
            "sensor_type_id": sensor_type_id
        })
        sensor2_id = sensor2_response.json()["id"]
        
        # Create logs with different combinations
        logs_data = [
            {"vehicle_id": vehicle1_id, "sensor_id": sensor1_id, "data": {"target": True}},
            {"vehicle_id": vehicle1_id, "sensor_id": sensor2_id, "data": {"target": False}},
            {"vehicle_id": vehicle2_id, "sensor_id": sensor1_id, "data": {"target": False}},
            {"vehicle_id": vehicle2_id, "sensor_id": sensor2_id, "data": {"target": False}}
        ]
        
        await client.post("/sensor-logs/", json=logs_data)
        
        # Filter by both vehicle1_id and sensor1_id
        response = await client.get(f"/sensor-logs/?vehicle_id={vehicle1_id}&sensor_id={sensor1_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        
        log = data[0]
        assert log["vehicle_id"] == vehicle1_id
        assert log["sensor_id"] == sensor1_id
        assert log["data"]["target"] == True

    @pytest.mark.asyncio
    async def test_filter_logs_no_matches(self, client: AsyncClient):
        """Test filtering sensor logs with criteria that match nothing."""
        # Create some test data
        vehicle_response = await client.post("/vehicles/", json={"name": "No Match Vehicle"})
        vehicle_id = vehicle_response.json()["id"]
        
        sensor_type_response = await client.post("/sensor-types/", json={"name": "No Match Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        sensor_response = await client.post("/sensors/", json={
            "name": "No Match Sensor",
            "sensor_type_id": sensor_type_id
        })
        sensor_id = sensor_response.json()["id"]
        
        # Create some logs
        logs_data = [{"vehicle_id": vehicle_id, "sensor_id": sensor_id, "data": {"test": "data"}}]
        await client.post("/sensor-logs/", json=logs_data)
        
        # Filter by non-existent vehicle_id
        response = await client.get("/sensor-logs/?vehicle_id=999")
        
        assert response.status_code == 200
        data = response.json()
        assert data == []


class TestSensorLogDelete:
    """Test suite for Sensor Log DELETE operations."""

    @pytest.mark.asyncio
    async def test_delete_sensor_log(self, client: AsyncClient):
        """Test deleting a sensor log."""
        # Create test vehicle
        vehicle_response = await client.post("/vehicles/", json={"name": "Delete Test Vehicle"})
        vehicle_id = vehicle_response.json()["id"]
        
        # Create test sensor type and sensor
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Delete Test Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        sensor_response = await client.post("/sensors/", json={
            "name": "Delete Test Sensor",
            "sensor_type_id": sensor_type_id
        })
        sensor_id = sensor_response.json()["id"]
        
        # Create sensor log
        log_data = [{
            "vehicle_id": vehicle_id,
            "sensor_id": sensor_id,
            "data": {"to_be_deleted": True, "value": 123}
        }]
        
        create_response = await client.post("/sensor-logs/", json=log_data)
        created_log = create_response.json()[0]
        log_id = created_log["id"]
        
        # Delete the sensor log
        response = await client.delete(f"/sensor-logs/{log_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["detail"] == "Sensor log deleted successfully"
        
        # Verify log is actually deleted
        get_response = await client.get(f"/sensor-logs/{log_id}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_nonexistent_sensor_log(self, client: AsyncClient):
        """Test deleting a non-existent sensor log."""
        response = await client.delete("/sensor-logs/999")
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Log not found"


class TestSensorLogModel:
    """Test suite for Sensor Log model."""

    @pytest.mark.asyncio
    async def test_sensor_log_model_creation(self, db_session):
        """Test creating a SensorLog model instance."""
        sensor_log = TestSensorLog(
            vehicle_id=1,
            sensor_id=1,
            data={"temperature": 25.5, "humidity": 60.0, "status": "active"}
        )
        
        db_session.add(sensor_log)
        await db_session.commit()
        await db_session.refresh(sensor_log)
        
        assert sensor_log.id is not None
        assert sensor_log.vehicle_id == 1
        assert sensor_log.sensor_id == 1
        assert sensor_log.data["temperature"] == 25.5
        assert sensor_log.data["humidity"] == 60.0
        assert sensor_log.data["status"] == "active"
        assert sensor_log.created_at is not None

    @pytest.mark.asyncio
    async def test_sensor_log_model_complex_data(self, db_session):
        """Test creating a SensorLog with complex JSON data."""
        complex_data = {
            "readings": {
                "temperature": 23.4,
                "pressure": 1013.25,
                "coordinates": {"lat": -6.2088, "lng": 106.8456}
            },
            "metadata": {
                "device_id": "SENS001",
                "firmware_version": "1.2.3",
                "battery_level": 85
            },
            "alerts": [
                {"type": "warning", "message": "Temperature rising"},
                {"type": "info", "message": "Battery at 85%"}
            ]
        }
        
        sensor_log = TestSensorLog(
            vehicle_id=2,
            sensor_id=3,
            data=complex_data
        )
        
        db_session.add(sensor_log)
        await db_session.commit()
        await db_session.refresh(sensor_log)
        
        assert sensor_log.id is not None
        assert sensor_log.data["readings"]["temperature"] == 23.4
        assert sensor_log.data["readings"]["coordinates"]["lat"] == -6.2088
        assert sensor_log.data["metadata"]["device_id"] == "SENS001"
        assert len(sensor_log.data["alerts"]) == 2
        assert sensor_log.data["alerts"][0]["type"] == "warning"


class TestSensorLogValidation:
    """Test suite for Sensor Log validation and edge cases."""

    @pytest.mark.asyncio
    async def test_create_sensor_log_with_empty_data(self, client: AsyncClient):
        """Test creating sensor log with empty data object."""
        # Create test vehicle
        vehicle_response = await client.post("/vehicles/", json={"name": "Empty Data Vehicle"})
        vehicle_id = vehicle_response.json()["id"]
        
        # Create test sensor type and sensor
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Empty Data Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        sensor_response = await client.post("/sensors/", json={
            "name": "Empty Data Sensor",
            "sensor_type_id": sensor_type_id
        })
        sensor_id = sensor_response.json()["id"]
        
        # Create sensor log with empty data
        log_data = [{
            "vehicle_id": vehicle_id,
            "sensor_id": sensor_id,
            "data": {}
        }]
        
        response = await client.post("/sensor-logs/", json=log_data)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["data"] == {}

    @pytest.mark.asyncio
    async def test_create_sensor_log_with_invalid_vehicle_id(self, client: AsyncClient):
        """Test creating sensor log with invalid vehicle_id."""
        # Create test sensor type and sensor
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Invalid Vehicle Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        sensor_response = await client.post("/sensors/", json={
            "name": "Invalid Vehicle Sensor",
            "sensor_type_id": sensor_type_id
        })
        sensor_id = sensor_response.json()["id"]
        
        # Create sensor log with non-existent vehicle_id
        log_data = [{
            "vehicle_id": 999,  # Non-existent vehicle
            "sensor_id": sensor_id,
            "data": {"test": "data"}
        }]
        
        response = await client.post("/sensor-logs/", json=log_data)
        
        # Should succeed at API level (no FK constraint validation in POST)
        assert response.status_code == 200
        data = response.json()
        assert data[0]["vehicle_id"] == 999

    @pytest.mark.asyncio
    async def test_create_sensor_log_with_invalid_sensor_id(self, client: AsyncClient):
        """Test creating sensor log with invalid sensor_id."""
        # Create test vehicle
        vehicle_response = await client.post("/vehicles/", json={"name": "Invalid Sensor Vehicle"})
        vehicle_id = vehicle_response.json()["id"]
        
        # Create sensor log with non-existent sensor_id
        log_data = [{
            "vehicle_id": vehicle_id,
            "sensor_id": 999,  # Non-existent sensor
            "data": {"test": "data"}
        }]
        
        response = await client.post("/sensor-logs/", json=log_data)
        
        # Should succeed at API level (no FK constraint validation in POST)
        assert response.status_code == 200
        data = response.json()
        assert data[0]["sensor_id"] == 999

    @pytest.mark.asyncio
    async def test_create_sensor_log_without_required_fields(self, client: AsyncClient):
        """Test creating sensor log without required fields."""
        # Missing vehicle_id
        log_data = [{
            "sensor_id": 1,
            "data": {"test": "data"}
        }]
        
        response = await client.post("/sensor-logs/", json=log_data)
        
        assert response.status_code == 422  # Validation error
        
        # Missing sensor_id
        log_data = [{
            "vehicle_id": 1,
            "data": {"test": "data"}
        }]
        
        response = await client.post("/sensor-logs/", json=log_data)
        
        assert response.status_code == 422  # Validation error
        
        # Missing data
        log_data = [{
            "vehicle_id": 1,
            "sensor_id": 1
        }]
        
        response = await client.post("/sensor-logs/", json=log_data)
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_sensor_log_timestamps(self, client: AsyncClient):
        """Test that sensor logs have proper timestamps."""
        # Create test vehicle
        vehicle_response = await client.post("/vehicles/", json={"name": "Timestamp Vehicle"})
        vehicle_id = vehicle_response.json()["id"]
        
        # Create test sensor type and sensor
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Timestamp Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        sensor_response = await client.post("/sensors/", json={
            "name": "Timestamp Sensor",
            "sensor_type_id": sensor_type_id
        })
        sensor_id = sensor_response.json()["id"]
        
        # Create sensor log
        log_data = [{
            "vehicle_id": vehicle_id,
            "sensor_id": sensor_id,
            "data": {"timestamp_test": True}
        }]
        
        response = await client.post("/sensor-logs/", json=log_data)
        
        assert response.status_code == 200
        data = response.json()
        
        log = data[0]
        assert "created_at" in log
        assert log["created_at"] is not None
        
        # Verify timestamp format (ISO format)
        from datetime import datetime
        created_at = datetime.fromisoformat(log["created_at"].replace('Z', '+00:00'))
        assert isinstance(created_at, datetime)

    @pytest.mark.asyncio
    async def test_create_large_batch_sensor_logs(self, client: AsyncClient):
        """Test creating a large batch of sensor logs."""
        # Create test vehicle
        vehicle_response = await client.post("/vehicles/", json={"name": "Batch Vehicle"})
        vehicle_id = vehicle_response.json()["id"]
        
        # Create test sensor type and sensor
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Batch Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        sensor_response = await client.post("/sensors/", json={
            "name": "Batch Sensor",
            "sensor_type_id": sensor_type_id
        })
        sensor_id = sensor_response.json()["id"]
        
        # Create large batch of sensor logs
        batch_size = 50
        logs_data = []
        for i in range(batch_size):
            logs_data.append({
                "vehicle_id": vehicle_id,
                "sensor_id": sensor_id,
                "data": {"batch_index": i, "value": i * 10.5}
            })
        
        response = await client.post("/sensor-logs/", json=logs_data)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == batch_size
        
        # Verify batch content
        for i, log in enumerate(data):
            assert log["data"]["batch_index"] == i
            assert log["data"]["value"] == i * 10.5

    @pytest.mark.asyncio
    async def test_sensor_log_json_data_types(self, client: AsyncClient):
        """Test sensor log with various JSON data types."""
        # Create test vehicle
        vehicle_response = await client.post("/vehicles/", json={"name": "JSON Types Vehicle"})
        vehicle_id = vehicle_response.json()["id"]
        
        # Create test sensor type and sensor
        sensor_type_response = await client.post("/sensor-types/", json={"name": "JSON Types Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        sensor_response = await client.post("/sensors/", json={
            "name": "JSON Types Sensor",
            "sensor_type_id": sensor_type_id
        })
        sensor_id = sensor_response.json()["id"]
        
        # Create sensor log with various data types
        mixed_data = {
            "string_value": "test string",
            "integer_value": 42,
            "float_value": 3.14159,
            "boolean_true": True,
            "boolean_false": False,
            "null_value": None,
            "array_numbers": [1, 2, 3, 4, 5],
            "array_strings": ["a", "b", "c"],
            "nested_object": {
                "level1": {
                    "level2": {
                        "deep_value": "deep"
                    }
                }
            }
        }
        
        log_data = [{
            "vehicle_id": vehicle_id,
            "sensor_id": sensor_id,
            "data": mixed_data
        }]
        
        response = await client.post("/sensor-logs/", json=log_data)
        
        assert response.status_code == 200
        data = response.json()
        
        log = data[0]
        assert log["data"]["string_value"] == "test string"
        assert log["data"]["integer_value"] == 42
        assert log["data"]["float_value"] == 3.14159
        assert log["data"]["boolean_true"] == True
        assert log["data"]["boolean_false"] == False
        assert log["data"]["null_value"] is None
        assert log["data"]["array_numbers"] == [1, 2, 3, 4, 5]
        assert log["data"]["nested_object"]["level1"]["level2"]["deep_value"] == "deep"