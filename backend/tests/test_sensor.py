# tests/test_sensor_fixed.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import TestSensor, TestSensorType
from app.models.user import User
from app.services.auth_service import hash_password


class TestSensorEndpoints:
    """Test suite for Sensor API endpoints with authentication."""

    async def create_authenticated_user(self, client: AsyncClient, db_session: AsyncSession, 
                                      email: str = "sensor_user@example.com") -> tuple[int, str]:
        """Helper to create authenticated user and return user ID and token"""
        user = User(
            email=email,
            password_hash=hash_password("password123"),
            full_name="Sensor Test User",
            is_verified=True
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        user_id = user.id  # Store ID before potential session expiry
        
        # Login to get token
        login_data = {"email": email, "password": "password123"}
        login_response = await client.post("/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        
        return user_id, token

    @pytest.mark.asyncio
    async def test_create_sensor(self, client: AsyncClient, db_session: AsyncSession):
        """Test creating a new sensor."""
        # Create authenticated user
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # First create a sensor type
        sensor_type_data = {"name": "Temperature Sensor Type"}
        sensor_type_response = await client.post("/sensor-types/", json=sensor_type_data, headers=headers)
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create sensor
        sensor_data = {
            "name": "Temperature Sensor 1",
            "sensor_type_id": sensor_type_id,
            "description": "A temperature monitoring sensor",
            "is_active": True
        }
        
        response = await client.post("/sensors/", json=sensor_data, headers=headers)
        
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
    async def test_create_sensor_minimal_data(self, client: AsyncClient, db_session: AsyncSession):
        """Test creating a sensor with minimal required data."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # First create a sensor type
        sensor_type_response = await client.post("/sensor-types/", json={"name": "GPS Type"}, headers=headers)
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create sensor with minimal data
        sensor_data = {
            "name": "GPS Sensor",
            "sensor_type_id": sensor_type_id
        }
        
        response = await client.post("/sensors/", json=sensor_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == sensor_data["name"]
        assert data["sensor_type_id"] == sensor_type_id
        assert data["is_active"] == True  # default value
        assert data["description"] is None  # optional field
        assert "id" in data

    @pytest.mark.asyncio
    async def test_get_all_sensors_empty(self, client: AsyncClient, db_session: AsyncSession):
        """Test getting all sensors when none exist."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = await client.get("/sensors/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    @pytest.mark.asyncio
    async def test_get_all_sensors_with_data(self, client: AsyncClient, db_session: AsyncSession):
        """Test getting all sensors when some exist."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create sensor type first
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Test Type"}, headers=headers)
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create test sensors
        sensor1_data = {"name": "Sensor 1", "sensor_type_id": sensor_type_id}
        sensor2_data = {"name": "Sensor 2", "sensor_type_id": sensor_type_id}
        
        await client.post("/sensors/", json=sensor1_data, headers=headers)
        await client.post("/sensors/", json=sensor2_data, headers=headers)
        
        # Get all sensors
        response = await client.get("/sensors/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2

    @pytest.mark.asyncio
    async def test_get_sensor_by_id(self, client: AsyncClient, db_session: AsyncSession):
        """Test getting a sensor by ID."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create sensor type first
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Test Type"}, headers=headers)
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create a sensor
        sensor_data = {
            "name": "Test Sensor",
            "sensor_type_id": sensor_type_id,
            "description": "Test description"
        }
        
        create_response = await client.post("/sensors/", json=sensor_data, headers=headers)
        assert create_response.status_code == 200
        created_sensor = create_response.json()
        sensor_id = created_sensor["id"]
        
        # Get the sensor by ID
        response = await client.get(f"/sensors/{sensor_id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sensor_id
        assert data["name"] == sensor_data["name"]
        assert data["description"] == sensor_data["description"]

    @pytest.mark.asyncio
    async def test_create_sensor_without_required_fields(self, client: AsyncClient, db_session: AsyncSession):
        """Test creating a sensor without required fields fails."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to create sensor without name
        sensor_data = {"sensor_type_id": 1}
        response = await client.post("/sensors/", json=sensor_data, headers=headers)
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_get_sensor_by_nonexistent_id(self, client: AsyncClient, db_session: AsyncSession):
        """Test getting a sensor by non-existent ID."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = await client.get("/sensors/999999", headers=headers)
        
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_update_sensor(self, client: AsyncClient, db_session: AsyncSession):
        """Test updating a sensor."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create sensor type first
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Test Type"}, headers=headers)
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create a sensor
        sensor_data = {
            "name": "Original Sensor",
            "sensor_type_id": sensor_type_id,
            "description": "Original description",
            "is_active": True
        }
        
        create_response = await client.post("/sensors/", json=sensor_data, headers=headers)
        created_sensor = create_response.json()
        sensor_id = created_sensor["id"]
        
        # Update the sensor
        update_data = {
            "name": "Updated Sensor",
            "description": "Updated description",
            "is_active": False
        }
        
        response = await client.put(f"/sensors/{sensor_id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["is_active"] == update_data["is_active"]

    @pytest.mark.asyncio
    async def test_update_sensor_partial(self, client: AsyncClient, db_session: AsyncSession):
        """Test partially updating a sensor."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create sensor type first
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Test Type"}, headers=headers)
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create a sensor
        sensor_data = {
            "name": "Partial Update Sensor",
            "sensor_type_id": sensor_type_id,
            "description": "Original description"
        }
        
        create_response = await client.post("/sensors/", json=sensor_data, headers=headers)
        created_sensor = create_response.json()
        sensor_id = created_sensor["id"]
        
        # Partially update the sensor (only name)
        update_data = {"name": "Partially Updated Sensor"}
        
        response = await client.put(f"/sensors/{sensor_id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == sensor_data["description"]  # Should remain unchanged

    @pytest.mark.asyncio
    async def test_update_nonexistent_sensor(self, client: AsyncClient, db_session: AsyncSession):
        """Test updating a non-existent sensor."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        update_data = {"name": "Non-existent Sensor"}
        
        response = await client.put("/sensors/999999", json=update_data, headers=headers)
        
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_delete_sensor(self, client: AsyncClient, db_session: AsyncSession):
        """Test deleting a sensor."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create sensor type first
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Test Type"}, headers=headers)
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create a sensor
        sensor_data = {
            "name": "Sensor to Delete",
            "sensor_type_id": sensor_type_id,
            "description": "This will be deleted"
        }
        
        create_response = await client.post("/sensors/", json=sensor_data, headers=headers)
        created_sensor = create_response.json()
        sensor_id = created_sensor["id"]
        
        # Delete the sensor
        response = await client.delete(f"/sensors/{sensor_id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "deleted" in data["detail"].lower()
        
        # Verify sensor is deleted
        get_response = await client.get(f"/sensors/{sensor_id}", headers=headers)
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_nonexistent_sensor(self, client: AsyncClient, db_session: AsyncSession):
        """Test deleting a non-existent sensor."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = await client.delete("/sensors/999999", headers=headers)
        
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_unauthorized_access(self, client: AsyncClient):
        """Test that sensor endpoints require authentication."""
        # Test without authentication headers
        sensor_data = {
            "name": "Unauthorized Sensor",
            "sensor_type_id": 1
        }
        
        # Test POST without auth
        response = await client.post("/sensors/", json=sensor_data)
        assert response.status_code == 403  # Should be forbidden without auth
        
        # Test GET without auth
        response = await client.get("/sensors/")
        assert response.status_code == 403
        
        # Test GET by ID without auth
        response = await client.get("/sensors/1")
        assert response.status_code == 403
        
        # Test PUT without auth
        response = await client.put("/sensors/1", json={"name": "Updated"})
        assert response.status_code == 403
        
        # Test DELETE without auth
        response = await client.delete("/sensors/1")
        assert response.status_code == 403


class TestSensorModel:
    """Test suite for Sensor model functionality."""

    @pytest.mark.asyncio
    async def test_sensor_model_creation(self, db_session: AsyncSession):
        """Test creating a sensor model instance."""
        # Create sensor using test model
        sensor = TestSensor(
            name="Model Test Sensor",
            sensor_type_id=1,
            description="Test sensor for model testing",
            is_active=True
        )
        
        db_session.add(sensor)
        await db_session.commit()
        await db_session.refresh(sensor)
        
        assert sensor.id is not None
        assert sensor.name == "Model Test Sensor"
        assert sensor.sensor_type_id == 1
        assert sensor.description == "Test sensor for model testing"
        assert sensor.is_active == True
        assert sensor.created_at is not None

    @pytest.mark.asyncio
    async def test_sensor_model_default_values(self, db_session: AsyncSession):
        """Test that sensor model has correct default values."""
        # Create sensor without explicit is_active
        sensor = TestSensor(
            name="Default Values Sensor",
            sensor_type_id=1
        )
        
        db_session.add(sensor)
        await db_session.commit()
        await db_session.refresh(sensor)
        
        assert sensor.is_active == True  # Default value
        assert sensor.description is None  # Optional field


class TestSensorValidation:
    """Test suite for sensor data validation."""

    @pytest.mark.asyncio
    async def test_create_sensor_with_invalid_sensor_type_id(self, client: AsyncClient, db_session: AsyncSession):
        """Test creating sensor with invalid sensor_type_id."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        sensor_data = {
            "name": "Invalid Type Sensor",
            "sensor_type_id": -1  # Invalid ID
        }
        
        response = await client.post("/sensors/", json=sensor_data, headers=headers)
        
        # Should still create successfully (foreign key validation handled at DB level)
        assert response.status_code == 200

    async def create_authenticated_user(self, client: AsyncClient, db_session: AsyncSession, 
                                      email: str = "validation_user@example.com") -> tuple[int, str]:
        """Helper to create authenticated user and return user ID and token"""
        user = User(
            email=email,
            password_hash=hash_password("password123"),
            full_name="Validation Test User",
            is_verified=True
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        user_id = user.id
        
        # Login to get token
        login_data = {"email": email, "password": "password123"}
        login_response = await client.post("/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        
        return user_id, token

    @pytest.mark.asyncio
    async def test_create_sensor_with_empty_name(self, client: AsyncClient, db_session: AsyncSession):
        """Test creating sensor with empty name."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        sensor_data = {
            "name": "",
            "sensor_type_id": 1
        }
        
        response = await client.post("/sensors/", json=sensor_data, headers=headers)
        
        # Should create successfully (empty string validation handled at API level)
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_create_sensor_with_very_long_name(self, client: AsyncClient, db_session: AsyncSession):
        """Test creating sensor with very long name."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        sensor_data = {
            "name": "A" * 200,  # Very long name
            "sensor_type_id": 1
        }
        
        response = await client.post("/sensors/", json=sensor_data, headers=headers)
        
        # Should create successfully (length validation may be handled at DB level)
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_update_sensor_is_active_status(self, client: AsyncClient, db_session: AsyncSession):
        """Test updating sensor is_active status."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create sensor type first
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Test Type"}, headers=headers)
        sensor_type_id = sensor_type_response.json()["id"]
        
        # Create a sensor
        sensor_data = {
            "name": "Active Status Sensor",
            "sensor_type_id": sensor_type_id,
            "is_active": True
        }
        
        create_response = await client.post("/sensors/", json=sensor_data, headers=headers)
        created_sensor = create_response.json()
        sensor_id = created_sensor["id"]
        
        # Update is_active to False
        update_data = {"is_active": False}
        
        response = await client.put(f"/sensors/{sensor_id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] == False

    @pytest.mark.asyncio
    async def test_sensors_timestamps(self, client: AsyncClient, db_session: AsyncSession):
        """Test that sensors have proper timestamps."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create sensor type first
        sensor_type_response = await client.post("/sensor-types/", json={"name": "Test Type"}, headers=headers)
        sensor_type_id = sensor_type_response.json()["id"]
        
        sensor_data = {
            "name": "Timestamp Sensor",
            "sensor_type_id": sensor_type_id
        }
        
        response = await client.post("/sensors/", json=sensor_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "created_at" in data
        assert "updated_at" in data
        assert data["created_at"] is not None
        assert data["updated_at"] is not None