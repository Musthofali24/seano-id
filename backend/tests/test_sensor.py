# tests/test_sensor.py
import pytest
from httpx import AsyncClient
from tests.conftest import TestSensor, TestSensorType


class TestSensorEndpoints:
    """Test suite for Sensor API endpoints - Basic CRUD operations."""

    @pytest.mark.asyncio
    async def test_create_sensor(self, client: AsyncClient):
        """Test creating a new sensor."""
        # First create a sensor type
        sensor_type_data = {"name": "Temperature Sensor Type"}
        sensor_type_response = await client.post("/sensor-types/", json=sensor_type_data)
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create sensor
        sensor_data = {
            "name": "Temperature Sensor 1",
            "sensor_type_id": sensor_type_id,
            "description": "A temperature monitoring sensor",
            "is_active": True
        }
        
        response = await client.post("/sensors/", json=sensor_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == sensor_data["name"]
        assert data["sensor_type_id"] == sensor_type_id
        assert data["description"] == sensor_data["description"]
        assert data["is_active"] == True
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    @pytest.mark.asyncio
    async def test_create_sensor_minimal_data(self, client: AsyncClient):
        """Test creating a sensor with minimal required data."""
        # First create a sensor type
        sensor_type_response = await client.post("/sensor-types/", json={"name": "GPS Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create sensor with minimal data
        sensor_data = {
            "name": "GPS Sensor",
            "sensor_type_id": sensor_type_id
        }
        
        response = await client.post("/sensors/", json=sensor_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == sensor_data["name"]
        assert data["sensor_type_id"] == sensor_type_id
        assert data["is_active"] == True  # default value
        assert data["description"] is None  # default value

    @pytest.mark.asyncio
    async def test_get_all_sensors_empty(self, client: AsyncClient):
        """Test getting all sensors when database is empty."""
        response = await client.get("/sensors/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    @pytest.mark.asyncio
    async def test_get_all_sensors_with_data(self, client: AsyncClient):
        """Test getting all sensors when there are sensors in database."""
        # Create sensor types first
        temp_type_response = await client.post("/sensor-types/", json={"name": "Temperature"})
        humidity_type_response = await client.post("/sensor-types/", json={"name": "Humidity"})
        
        temp_type_id = temp_type_response.json()["id"]
        humidity_type_id = humidity_type_response.json()["id"]
        
        # Create test sensors
        sensor1_data = {"name": "Temp Sensor 1", "sensor_type_id": temp_type_id}
        sensor2_data = {"name": "Humidity Sensor 1", "sensor_type_id": humidity_type_id}
        
        await client.post("/sensors/", json=sensor1_data)
        await client.post("/sensors/", json=sensor2_data)
        
        # Get all sensors
        response = await client.get("/sensors/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        
        # Check that both sensors are returned
        sensor_names = [s["name"] for s in data]
        assert "Temp Sensor 1" in sensor_names
        assert "Humidity Sensor 1" in sensor_names

    @pytest.mark.asyncio
    async def test_get_sensor_by_id(self, client: AsyncClient):
        """Test getting a specific sensor by ID."""
        # Create sensor type first
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Pressure Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create a test sensor
        sensor_data = {
            "name": "Pressure Sensor",
            "sensor_type_id": sensor_type_id,
            "description": "Measures atmospheric pressure",
            "is_active": False
        }
        
        create_response = await client.post("/sensors/", json=sensor_data)
        created_sensor = create_response.json()
        sensor_id = created_sensor["id"]
        
        # Get the sensor by ID
        response = await client.get(f"/sensors/{sensor_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sensor_id
        assert data["name"] == sensor_data["name"]
        assert data["sensor_type_id"] == sensor_type_id
        assert data["description"] == sensor_data["description"]
        assert data["is_active"] == False

    @pytest.mark.asyncio
    async def test_create_sensor_without_required_fields(self, client: AsyncClient):
        """Test that creating a sensor without required fields fails."""
        # Test without name
        sensor_data = {"sensor_type_id": 1}
        response = await client.post("/sensors/", json=sensor_data)
        assert response.status_code == 422
        
        # Test without sensor_type_id
        sensor_data = {"name": "Test Sensor"}
        response = await client.post("/sensors/", json=sensor_data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_get_sensor_by_nonexistent_id(self, client: AsyncClient):
        """Test getting a sensor with non-existent ID."""
        response = await client.get("/sensors/999")
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Sensor not found"

    @pytest.mark.asyncio
    async def test_update_sensor(self, client: AsyncClient):
        """Test updating a sensor."""
        # Create sensor types first
        old_type_response = await client.post("/sensor-types/", json={"name": "Old Type"})
        new_type_response = await client.post("/sensor-types/", json={"name": "New Type"})
        
        old_type_id = old_type_response.json()["id"]
        new_type_id = new_type_response.json()["id"]
        
        # Create a test sensor
        sensor_data = {
            "name": "Original Sensor",
            "sensor_type_id": old_type_id,
            "description": "Original description",
            "is_active": True
        }
        
        create_response = await client.post("/sensors/", json=sensor_data)
        created_sensor = create_response.json()
        sensor_id = created_sensor["id"]
        
        # Update the sensor
        update_data = {
            "name": "Updated Sensor",
            "sensor_type_id": new_type_id,
            "description": "Updated description",
            "is_active": False
        }
        
        response = await client.put(f"/sensors/{sensor_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sensor_id
        assert data["name"] == update_data["name"]
        assert data["sensor_type_id"] == new_type_id
        assert data["description"] == update_data["description"]
        assert data["is_active"] == False

    @pytest.mark.asyncio
    async def test_update_sensor_partial(self, client: AsyncClient):
        """Test partially updating a sensor."""
        # Create sensor type
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Test Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create a test sensor
        sensor_data = {
            "name": "Original Name",
            "sensor_type_id": sensor_type_id,
            "description": "Original description",
            "is_active": True
        }
        
        create_response = await client.post("/sensors/", json=sensor_data)
        created_sensor = create_response.json()
        sensor_id = created_sensor["id"]
        
        # Partially update the sensor (only name and is_active)
        update_data = {
            "name": "Partially Updated Name",
            "is_active": False
        }
        
        response = await client.put(f"/sensors/{sensor_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sensor_id
        assert data["name"] == update_data["name"]
        assert data["sensor_type_id"] == sensor_type_id  # Should remain unchanged
        assert data["description"] == sensor_data["description"]  # Should remain unchanged
        assert data["is_active"] == False

    @pytest.mark.asyncio
    async def test_update_nonexistent_sensor(self, client: AsyncClient):
        """Test updating a non-existent sensor."""
        update_data = {
            "name": "Updated Name"
        }
        
        response = await client.put("/sensors/999", json=update_data)
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Sensor not found"

    @pytest.mark.asyncio
    async def test_delete_sensor(self, client: AsyncClient):
        """Test deleting a sensor."""
        # Create sensor type first
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Delete Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create a test sensor
        sensor_data = {
            "name": "Sensor to Delete",
            "sensor_type_id": sensor_type_id,
            "description": "This sensor will be deleted"
        }
        
        create_response = await client.post("/sensors/", json=sensor_data)
        created_sensor = create_response.json()
        sensor_id = created_sensor["id"]
        
        # Delete the sensor
        response = await client.delete(f"/sensors/{sensor_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["detail"] == "Sensor deleted successfully"
        
        # Verify sensor is actually deleted
        get_response = await client.get(f"/sensors/{sensor_id}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_nonexistent_sensor(self, client: AsyncClient):
        """Test deleting a non-existent sensor."""
        response = await client.delete("/sensors/999")
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Sensor not found"


class TestSensorModel:
    """Test suite for Sensor model."""

    @pytest.mark.asyncio
    async def test_sensor_model_creation(self, db_session):
        """Test creating a Sensor model instance."""
        sensor = TestSensor(
            name="Test Sensor",
            sensor_type_id=1,
            description="A test sensor",
            is_active=True
        )
        
        db_session.add(sensor)
        await db_session.commit()
        await db_session.refresh(sensor)
        
        assert sensor.id is not None
        assert sensor.name == "Test Sensor"
        assert sensor.sensor_type_id == 1
        assert sensor.description == "A test sensor"
        assert sensor.is_active == True
        assert sensor.created_at is not None
        assert sensor.updated_at is not None

    @pytest.mark.asyncio
    async def test_sensor_model_default_values(self, db_session):
        """Test that Sensor model has correct default values."""
        sensor = TestSensor(
            name="Default Test Sensor",
            sensor_type_id=2
        )
        
        db_session.add(sensor)
        await db_session.commit()
        await db_session.refresh(sensor)
        
        assert sensor.is_active == True  # default value
        assert sensor.description is None  # default value


class TestSensorValidation:
    """Test suite for Sensor validation and edge cases."""

    @pytest.mark.asyncio
    async def test_create_sensor_with_invalid_sensor_type_id(self, client: AsyncClient):
        """Test creating a sensor with invalid sensor_type_id."""
        sensor_data = {
            "name": "Invalid Sensor",
            "sensor_type_id": 999,  # Non-existent sensor type
            "description": "This should fail"
        }
        
        response = await client.post("/sensors/", json=sensor_data)
        
        # Should succeed at API level (no FK constraint validation in POST)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Invalid Sensor"
        assert data["sensor_type_id"] == 999

    @pytest.mark.asyncio
    async def test_create_sensor_with_empty_name(self, client: AsyncClient):
        """Test creating a sensor with empty name."""
        sensor_data = {
            "name": "",
            "sensor_type_id": 1,
            "description": "Empty name test"
        }
        
        response = await client.post("/sensors/", json=sensor_data)
        
        # Empty string should be allowed
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == ""

    @pytest.mark.asyncio
    async def test_create_sensor_with_very_long_name(self, client: AsyncClient):
        """Test creating a sensor with very long name."""
        long_name = "A" * 1000  # Very long name
        sensor_data = {
            "name": long_name,
            "sensor_type_id": 1,
            "description": "Long name test"
        }
        
        response = await client.post("/sensors/", json=sensor_data)
        
        # Should succeed (no length constraint defined)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == long_name

    @pytest.mark.asyncio
    async def test_update_sensor_is_active_status(self, client: AsyncClient):
        """Test updating sensor active status."""
        # Create sensor type first
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Active Test Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create a test sensor
        sensor_data = {
            "name": "Active Test Sensor",
            "sensor_type_id": sensor_type_id,
            "is_active": True
        }
        
        create_response = await client.post("/sensors/", json=sensor_data)
        created_sensor = create_response.json()
        sensor_id = created_sensor["id"]
        
        # Update to inactive
        update_data = {"is_active": False}
        response = await client.put(f"/sensors/{sensor_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] == False
        
        # Update back to active
        update_data = {"is_active": True}
        response = await client.put(f"/sensors/{sensor_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] == True

    @pytest.mark.asyncio
    async def test_sensors_timestamps(self, client: AsyncClient):
        """Test that sensors have proper timestamps."""
        # Create sensor type first
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Timestamp Type"})
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create a test sensor
        sensor_data = {
            "name": "Timestamp Test Sensor",
            "sensor_type_id": sensor_type_id
        }
        
        response = await client.post("/sensors/", json=sensor_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "created_at" in data
        assert "updated_at" in data
        assert data["created_at"] is not None
        assert data["updated_at"] is not None
        
        # Verify timestamp format (ISO format)
        from datetime import datetime
        created_at = datetime.fromisoformat(data["created_at"].replace('Z', '+00:00'))
        updated_at = datetime.fromisoformat(data["updated_at"].replace('Z', '+00:00'))
        
        assert isinstance(created_at, datetime)
        assert isinstance(updated_at, datetime)