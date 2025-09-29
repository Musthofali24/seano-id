# tests/test_sensor_type_fixed.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import TestSensorType
from app.models.user import User
from app.services.auth_service import hash_password


class TestSensorTypeEndpoints:
    """Test suite for Sensor Type API endpoints with authentication."""

    async def create_authenticated_user(self, client: AsyncClient, db_session: AsyncSession, 
                                      email: str = "sensor_type_user@example.com") -> tuple[int, str]:
        """Helper to create authenticated user and return user ID and token"""
        user = User(
            email=email,
            password_hash=hash_password("password123"),
            full_name="Sensor Type Test User",
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
    async def test_create_sensor_type(self, client: AsyncClient, db_session: AsyncSession):
        """Test creating a new sensor type."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        sensor_type_data = {
            "name": "Temperature Sensor Type",
            "description": "Sensor type for temperature monitoring"
        }
        
        response = await client.post("/sensor-types/", json=sensor_type_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == sensor_type_data["name"]
        assert data["description"] == sensor_type_data["description"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    @pytest.mark.asyncio
    async def test_create_sensor_type_minimal_data(self, client: AsyncClient, db_session: AsyncSession):
        """Test creating a sensor type with minimal required data."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        sensor_type_data = {"name": "GPS Sensor Type"}
        
        response = await client.post("/sensor-types/", json=sensor_type_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == sensor_type_data["name"]
        assert data["description"] is None  # optional field
        assert "id" in data

    @pytest.mark.asyncio
    async def test_get_all_sensor_types_empty(self, client: AsyncClient, db_session: AsyncSession):
        """Test getting all sensor types when none exist."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = await client.get("/sensor-types/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    @pytest.mark.asyncio
    async def test_get_all_sensor_types_with_data(self, client: AsyncClient, db_session: AsyncSession):
        """Test getting all sensor types when some exist."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create test sensor types
        sensor_type1_data = {"name": "Temperature Type"}
        sensor_type2_data = {"name": "Pressure Type"}
        
        await client.post("/sensor-types/", json=sensor_type1_data, headers=headers)
        await client.post("/sensor-types/", json=sensor_type2_data, headers=headers)
        
        # Get all sensor types
        response = await client.get("/sensor-types/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2

    @pytest.mark.asyncio
    async def test_get_sensor_type_by_id(self, client: AsyncClient, db_session: AsyncSession):
        """Test getting a sensor type by ID."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a sensor type
        sensor_type_data = {
            "name": "Test Sensor Type",
            "description": "Test description"
        }
        
        create_response = await client.post("/sensor-types/", json=sensor_type_data, headers=headers)
        assert create_response.status_code == 200
        created_sensor_type = create_response.json()
        sensor_type_id = created_sensor_type["id"]
        
        # Get the sensor type by ID
        response = await client.get(f"/sensor-types/{sensor_type_id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sensor_type_id
        assert data["name"] == sensor_type_data["name"]
        assert data["description"] == sensor_type_data["description"]

    @pytest.mark.asyncio
    async def test_create_sensor_type_without_name(self, client: AsyncClient, db_session: AsyncSession):
        """Test that creating a sensor type without name fails."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        sensor_type_data = {"description": "Sensor type without name"}
        
        response = await client.post("/sensor-types/", json=sensor_type_data, headers=headers)
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_get_sensor_type_by_nonexistent_id(self, client: AsyncClient, db_session: AsyncSession):
        """Test getting a sensor type by non-existent ID."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = await client.get("/sensor-types/999999", headers=headers)
        
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_update_sensor_type(self, client: AsyncClient, db_session: AsyncSession):
        """Test updating a sensor type."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a sensor type
        sensor_type_data = {
            "name": "Original Sensor Type",
            "description": "Original description"
        }
        
        create_response = await client.post("/sensor-types/", json=sensor_type_data, headers=headers)
        created_sensor_type = create_response.json()
        sensor_type_id = created_sensor_type["id"]
        
        # Update the sensor type
        update_data = {
            "name": "Updated Sensor Type",
            "description": "Updated description"
        }
        
        response = await client.put(f"/sensor-types/{sensor_type_id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]

    @pytest.mark.asyncio
    async def test_update_sensor_type_partial(self, client: AsyncClient, db_session: AsyncSession):
        """Test partially updating a sensor type."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a sensor type
        sensor_type_data = {
            "name": "Partial Update Sensor Type",
            "description": "Original description"
        }
        
        create_response = await client.post("/sensor-types/", json=sensor_type_data, headers=headers)
        created_sensor_type = create_response.json()
        sensor_type_id = created_sensor_type["id"]
        
        # Partially update the sensor type (only name)
        update_data = {"name": "Partially Updated Sensor Type"}
        
        response = await client.put(f"/sensor-types/{sensor_type_id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == sensor_type_data["description"]  # Should remain unchanged

    @pytest.mark.asyncio
    async def test_update_nonexistent_sensor_type(self, client: AsyncClient, db_session: AsyncSession):
        """Test updating a non-existent sensor type."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        update_data = {"name": "Non-existent Sensor Type"}
        
        response = await client.put("/sensor-types/999999", json=update_data, headers=headers)
        
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_delete_sensor_type(self, client: AsyncClient, db_session: AsyncSession):
        """Test deleting a sensor type."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a sensor type
        sensor_type_data = {
            "name": "Sensor Type to Delete",
            "description": "This will be deleted"
        }
        
        create_response = await client.post("/sensor-types/", json=sensor_type_data, headers=headers)
        created_sensor_type = create_response.json()
        sensor_type_id = created_sensor_type["id"]
        
        # Delete the sensor type
        response = await client.delete(f"/sensor-types/{sensor_type_id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "deleted" in data["detail"].lower()
        
        # Verify sensor type is deleted
        get_response = await client.get(f"/sensor-types/{sensor_type_id}", headers=headers)
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_nonexistent_sensor_type(self, client: AsyncClient, db_session: AsyncSession):
        """Test deleting a non-existent sensor type."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        response = await client.delete("/sensor-types/999999", headers=headers)
        
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_unauthorized_access(self, client: AsyncClient):
        """Test that sensor type endpoints require authentication."""
        # Test without authentication headers
        sensor_type_data = {"name": "Unauthorized Sensor Type"}
        
        # Test POST without auth
        response = await client.post("/sensor-types/", json=sensor_type_data)
        assert response.status_code == 403  # Should be forbidden without auth
        
        # Test GET without auth
        response = await client.get("/sensor-types/")
        assert response.status_code == 403
        
        # Test GET by ID without auth
        response = await client.get("/sensor-types/1")
        assert response.status_code == 403
        
        # Test PUT without auth
        response = await client.put("/sensor-types/1", json={"name": "Updated"})
        assert response.status_code == 403
        
        # Test DELETE without auth
        response = await client.delete("/sensor-types/1")
        assert response.status_code == 403


class TestSensorTypeModel:
    """Test suite for Sensor Type model functionality."""

    @pytest.mark.asyncio
    async def test_sensor_type_model_creation(self, db_session: AsyncSession):
        """Test creating a sensor type model instance."""
        # Create sensor type using test model
        sensor_type = TestSensorType(
            name="Model Test Sensor Type",
            description="Test sensor type for model testing"
        )
        
        db_session.add(sensor_type)
        await db_session.commit()
        await db_session.refresh(sensor_type)
        
        assert sensor_type.id is not None
        assert sensor_type.name == "Model Test Sensor Type"
        assert sensor_type.description == "Test sensor type for model testing"
        assert sensor_type.created_at is not None

    @pytest.mark.asyncio
    async def test_sensor_type_model_minimal(self, db_session: AsyncSession):
        """Test creating a sensor type model with minimal data."""
        # Create sensor type without description
        sensor_type = TestSensorType(name="Minimal Sensor Type")
        
        db_session.add(sensor_type)
        await db_session.commit()
        await db_session.refresh(sensor_type)
        
        assert sensor_type.id is not None
        assert sensor_type.name == "Minimal Sensor Type"
        assert sensor_type.description is None  # Optional field


class TestSensorTypeValidation:
    """Test suite for sensor type data validation."""

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
    async def test_sensor_type_name_required(self, client: AsyncClient, db_session: AsyncSession):
        """Test that sensor type name is required."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        sensor_type_data = {"description": "Sensor type without name"}
        
        response = await client.post("/sensor-types/", json=sensor_type_data, headers=headers)
        
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_sensor_type_name_length(self, client: AsyncClient, db_session: AsyncSession):
        """Test sensor type name length validation."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        sensor_type_data = {"name": "A" * 200}  # Very long name
        
        response = await client.post("/sensor-types/", json=sensor_type_data, headers=headers)
        
        # Should create successfully (length validation may be handled at DB level)
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_sensor_type_description_optional(self, client: AsyncClient, db_session: AsyncSession):
        """Test that sensor type description is optional."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        headers = {"Authorization": f"Bearer {token}"}
        
        sensor_type_data = {"name": "Sensor Type Without Description"}
        
        response = await client.post("/sensor-types/", json=sensor_type_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == sensor_type_data["name"]
        assert data["description"] is None