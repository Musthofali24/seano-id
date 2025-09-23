# tests/test_sensor_type.py
import pytest
from httpx import AsyncClient
from tests.conftest import TestSensorType


class TestSensorTypeEndpoints:
    """Test suite for SensorType API endpoints - Basic CRUD operations."""

    @pytest.mark.asyncio
    async def test_create_sensor_type(self, client: AsyncClient):
        """Test creating a new sensor type."""
        sensor_type_data = {
            "name": "Temperature Sensor",
            "description": "Sensors for measuring temperature"
        }
        
        response = await client.post("/sensor-types/", json=sensor_type_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == sensor_type_data["name"]
        assert data["description"] == sensor_type_data["description"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    @pytest.mark.asyncio
    async def test_create_sensor_type_minimal_data(self, client: AsyncClient):
        """Test creating a sensor type with minimal required data."""
        sensor_type_data = {
            "name": "GPS Sensor"
        }
        
        response = await client.post("/sensor-types/", json=sensor_type_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == sensor_type_data["name"]
        assert data["description"] is None

    @pytest.mark.asyncio
    async def test_get_all_sensor_types_empty(self, client: AsyncClient):
        """Test getting all sensor types when database is empty."""
        response = await client.get("/sensor-types/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    @pytest.mark.asyncio
    async def test_get_all_sensor_types_with_data(self, client: AsyncClient):
        """Test getting all sensor types when there are sensor types in database."""
        # Create test sensor types
        sensor_type1_data = {"name": "Temperature", "description": "Temperature sensors"}
        sensor_type2_data = {"name": "Pressure", "description": "Pressure sensors"}
        
        await client.post("/sensor-types/", json=sensor_type1_data)
        await client.post("/sensor-types/", json=sensor_type2_data)
        
        # Get all sensor types
        response = await client.get("/sensor-types/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        
        # Check that both sensor types are returned
        sensor_type_names = [st["name"] for st in data]
        assert "Temperature" in sensor_type_names
        assert "Pressure" in sensor_type_names

    @pytest.mark.asyncio
    async def test_get_sensor_type_by_id(self, client: AsyncClient):
        """Test getting a specific sensor type by ID."""
        # Create a test sensor type
        sensor_type_data = {
            "name": "Humidity Sensor",
            "description": "Sensors for measuring humidity"
        }
        
        create_response = await client.post("/sensor-types/", json=sensor_type_data)
        created_sensor_type = create_response.json()
        sensor_type_id = created_sensor_type["id"]
        
        # Get the sensor type by ID
        response = await client.get(f"/sensor-types/{sensor_type_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sensor_type_id
        assert data["name"] == sensor_type_data["name"]
        assert data["description"] == sensor_type_data["description"]

    @pytest.mark.asyncio
    async def test_create_sensor_type_without_name(self, client: AsyncClient):
        """Test that creating a sensor type without name fails."""
        sensor_type_data = {
            "description": "Sensor type without name"
        }
        
        response = await client.post("/sensor-types/", json=sensor_type_data)
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_get_sensor_type_by_nonexistent_id(self, client: AsyncClient):
        """Test getting a sensor type with non-existent ID."""
        response = await client.get("/sensor-types/999")
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Sensor type not found"

    @pytest.mark.asyncio
    async def test_update_sensor_type(self, client: AsyncClient):
        """Test updating a sensor type."""
        # Create a test sensor type
        sensor_type_data = {
            "name": "Original Name",
            "description": "Original description"
        }
        
        create_response = await client.post("/sensor-types/", json=sensor_type_data)
        created_sensor_type = create_response.json()
        sensor_type_id = created_sensor_type["id"]
        
        # Update the sensor type
        update_data = {
            "name": "Updated Name",
            "description": "Updated description"
        }
        
        response = await client.put(f"/sensor-types/{sensor_type_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sensor_type_id
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]

    @pytest.mark.asyncio
    async def test_update_sensor_type_partial(self, client: AsyncClient):
        """Test partially updating a sensor type."""
        # Create a test sensor type
        sensor_type_data = {
            "name": "Original Name",
            "description": "Original description"
        }
        
        create_response = await client.post("/sensor-types/", json=sensor_type_data)
        created_sensor_type = create_response.json()
        sensor_type_id = created_sensor_type["id"]
        
        # Partially update the sensor type (only name)
        update_data = {
            "name": "Partially Updated Name"
        }
        
        response = await client.put(f"/sensor-types/{sensor_type_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sensor_type_id
        assert data["name"] == update_data["name"]
        assert data["description"] == sensor_type_data["description"]  # Should remain unchanged

    @pytest.mark.asyncio
    async def test_update_nonexistent_sensor_type(self, client: AsyncClient):
        """Test updating a non-existent sensor type."""
        update_data = {
            "name": "Updated Name"
        }
        
        response = await client.put("/sensor-types/999", json=update_data)
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Sensor type not found"

    @pytest.mark.asyncio
    async def test_delete_sensor_type(self, client: AsyncClient):
        """Test deleting a sensor type."""
        # Create a test sensor type
        sensor_type_data = {
            "name": "Sensor Type to Delete",
            "description": "This sensor type will be deleted"
        }
        
        create_response = await client.post("/sensor-types/", json=sensor_type_data)
        created_sensor_type = create_response.json()
        sensor_type_id = created_sensor_type["id"]
        
        # Delete the sensor type
        response = await client.delete(f"/sensor-types/{sensor_type_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["detail"] == "Sensor type deleted successfully"
        
        # Verify sensor type is actually deleted
        get_response = await client.get(f"/sensor-types/{sensor_type_id}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_nonexistent_sensor_type(self, client: AsyncClient):
        """Test deleting a non-existent sensor type."""
        response = await client.delete("/sensor-types/999")
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Sensor type not found"


class TestSensorTypeModel:
    """Test suite for SensorType model."""

    @pytest.mark.asyncio
    async def test_sensor_type_model_creation(self, db_session):
        """Test creating a SensorType model instance."""
        sensor_type = TestSensorType(
            name="Test Sensor Type",
            description="A test sensor type"
        )
        
        db_session.add(sensor_type)
        await db_session.commit()
        await db_session.refresh(sensor_type)
        
        assert sensor_type.id is not None
        assert sensor_type.name == "Test Sensor Type"
        assert sensor_type.description == "A test sensor type"
        assert sensor_type.created_at is not None
        assert sensor_type.updated_at is not None

    @pytest.mark.asyncio
    async def test_sensor_type_model_minimal(self, db_session):
        """Test creating a SensorType model with minimal data."""
        sensor_type = TestSensorType(name="Minimal Sensor Type")
        
        db_session.add(sensor_type)
        await db_session.commit()
        await db_session.refresh(sensor_type)
        
        assert sensor_type.name == "Minimal Sensor Type"
        assert sensor_type.description is None


class TestSensorTypeValidation:
    """Test suite for SensorType validation and edge cases."""

    @pytest.mark.asyncio
    async def test_sensor_type_name_required(self, client: AsyncClient):
        """Test that sensor type name is required."""
        sensor_type_data = {}
        
        response = await client.post("/sensor-types/", json=sensor_type_data)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_sensor_type_name_length(self, client: AsyncClient):
        """Test sensor type name with different lengths."""
        # Test with short name
        short_name_data = {"name": "A"}
        response = await client.post("/sensor-types/", json=short_name_data)
        assert response.status_code == 200
        
        # Test with long name (up to 100 characters based on model)
        long_name = "A" * 100
        long_name_data = {"name": long_name}
        response = await client.post("/sensor-types/", json=long_name_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == long_name

    @pytest.mark.asyncio
    async def test_sensor_type_description_optional(self, client: AsyncClient):
        """Test that description is optional."""
        sensor_type_data = {"name": "No Description Sensor Type"}
        
        response = await client.post("/sensor-types/", json=sensor_type_data)
        assert response.status_code == 200
        data = response.json()
        assert data["description"] is None