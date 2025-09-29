# tests/test_vehicle_fixed.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import TestVehicle
from app.models.user import User
from app.services.auth_service import hash_password


class TestVehicleEndpoints:
    """Test suite for Vehicle API endpoints with authentication."""

    async def create_authenticated_user(self, client: AsyncClient, db_session: AsyncSession, 
                                      email: str = "vehicle_user@example.com") -> tuple[int, str]:
        """Helper to create authenticated user and return user ID and token"""
        user = User(
            email=email,
            password_hash=hash_password("password123"),
            full_name="Vehicle Test User",
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
    async def test_create_vehicle(self, client: AsyncClient, db_session: AsyncSession):
        """Test creating a new vehicle."""
        # Create authenticated user
        user_id, token = await self.create_authenticated_user(client, db_session)
        
        vehicle_data = {
            "name": "SeaExplorer 1",
            "description": "Advanced underwater exploration vehicle",
            "status": "idle",
            "user_id": user_id
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.post("/vehicles/", json=vehicle_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == vehicle_data["name"]
        assert data["description"] == vehicle_data["description"]
        assert data["status"] == vehicle_data["status"]
        assert data["user_id"] == user_id
        assert "id" in data
        assert "created_at" in data

    @pytest.mark.asyncio
    async def test_create_vehicle_minimal_data(self, client: AsyncClient, db_session: AsyncSession):
        """Test creating a vehicle with minimal required data."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        
        vehicle_data = {
            "name": "MinimalVehicle",
            "user_id": user_id
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.post("/vehicles/", json=vehicle_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == vehicle_data["name"]
        assert data["status"] == "idle"  # default value
        assert data["description"] is None
        assert data["user_id"] == user_id

    @pytest.mark.asyncio
    async def test_create_vehicle_without_name(self, client: AsyncClient, db_session: AsyncSession):
        """Test that creating a vehicle without name fails."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        
        vehicle_data = {
            "description": "Vehicle without name",
            "user_id": user_id
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.post("/vehicles/", json=vehicle_data, headers=headers)
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_create_vehicle_without_user_id(self, client: AsyncClient, db_session: AsyncSession):
        """Test that creating a vehicle without user_id fails."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        
        vehicle_data = {
            "name": "Vehicle without user",
            "description": "This should fail"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.post("/vehicles/", json=vehicle_data, headers=headers)
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_get_all_vehicles_empty(self, client: AsyncClient, db_session: AsyncSession):
        """Test getting all vehicles when none exist."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.get("/vehicles/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    @pytest.mark.asyncio
    async def test_get_all_vehicles_with_data(self, client: AsyncClient, db_session: AsyncSession):
        """Test getting all vehicles when some exist."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        
        # Create test vehicles
        vehicles_data = [
            {"name": "Vehicle 1", "description": "First vehicle", "user_id": user_id},
            {"name": "Vehicle 2", "description": "Second vehicle", "user_id": user_id}
        ]
        
        headers = {"Authorization": f"Bearer {token}"}
        for vehicle_data in vehicles_data:
            await client.post("/vehicles/", json=vehicle_data, headers=headers)
        
        # Get all vehicles
        response = await client.get("/vehicles/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2

    @pytest.mark.asyncio
    async def test_get_vehicle_by_id(self, client: AsyncClient, db_session: AsyncSession):
        """Test getting a vehicle by ID."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        
        # Create a vehicle
        vehicle_data = {
            "name": "Test Vehicle",
            "description": "Test description",
            "user_id": user_id
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        create_response = await client.post("/vehicles/", json=vehicle_data, headers=headers)
        assert create_response.status_code == 200
        created_vehicle = create_response.json()
        vehicle_id = created_vehicle["id"]
        
        # Get the vehicle by ID
        response = await client.get(f"/vehicles/{vehicle_id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == vehicle_id
        assert data["name"] == vehicle_data["name"]
        assert data["description"] == vehicle_data["description"]

    @pytest.mark.asyncio
    async def test_get_vehicle_by_nonexistent_id(self, client: AsyncClient, db_session: AsyncSession):
        """Test getting a vehicle by non-existent ID."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.get("/vehicles/999999", headers=headers)
        
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_update_vehicle(self, client: AsyncClient, db_session: AsyncSession):
        """Test updating a vehicle."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        
        # Create a vehicle
        vehicle_data = {
            "name": "Original Vehicle",
            "description": "Original description", 
            "status": "idle",
            "user_id": user_id
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        create_response = await client.post("/vehicles/", json=vehicle_data, headers=headers)
        created_vehicle = create_response.json()
        vehicle_id = created_vehicle["id"]
        
        # Update the vehicle
        update_data = {
            "name": "Updated Vehicle",
            "description": "Updated description",
            "status": "mission"
        }
        
        response = await client.put(f"/vehicles/{vehicle_id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["status"] == update_data["status"]

    @pytest.mark.asyncio
    async def test_update_vehicle_partial(self, client: AsyncClient, db_session: AsyncSession):
        """Test partially updating a vehicle."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        
        # Create a vehicle
        vehicle_data = {
            "name": "Partial Update Vehicle",
            "description": "Original description",
            "user_id": user_id
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        create_response = await client.post("/vehicles/", json=vehicle_data, headers=headers)
        created_vehicle = create_response.json()
        vehicle_id = created_vehicle["id"]
        
        # Partially update the vehicle (only name)
        update_data = {
            "name": "Partially Updated Vehicle"
        }
        
        response = await client.put(f"/vehicles/{vehicle_id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == vehicle_data["description"]  # Should remain unchanged

    @pytest.mark.asyncio
    async def test_update_nonexistent_vehicle(self, client: AsyncClient, db_session: AsyncSession):
        """Test updating a non-existent vehicle."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        
        update_data = {
            "name": "Non-existent Vehicle"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.put("/vehicles/999999", json=update_data, headers=headers)
        
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_delete_vehicle(self, client: AsyncClient, db_session: AsyncSession):
        """Test deleting a vehicle."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        
        # Create a vehicle
        vehicle_data = {
            "name": "Vehicle to Delete",
            "description": "This will be deleted",
            "user_id": user_id
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        create_response = await client.post("/vehicles/", json=vehicle_data, headers=headers)
        created_vehicle = create_response.json()
        vehicle_id = created_vehicle["id"]
        
        # Delete the vehicle
        response = await client.delete(f"/vehicles/{vehicle_id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "deleted" in data["message"].lower()
        
        # Verify vehicle is deleted
        get_response = await client.get(f"/vehicles/{vehicle_id}", headers=headers)
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_nonexistent_vehicle(self, client: AsyncClient, db_session: AsyncSession):
        """Test deleting a non-existent vehicle."""
        user_id, token = await self.create_authenticated_user(client, db_session)
        
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.delete("/vehicles/999999", headers=headers)
        
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_unauthorized_access(self, client: AsyncClient):
        """Test that vehicle endpoints require authentication."""
        # Test without authentication headers
        vehicle_data = {
            "name": "Unauthorized Vehicle",
            "user_id": 1
        }
        
        # Test POST without auth
        response = await client.post("/vehicles/", json=vehicle_data)
        assert response.status_code == 403  # Should be forbidden without auth
        
        # Test GET without auth
        response = await client.get("/vehicles/")
        assert response.status_code == 403
        
        # Test GET by ID without auth
        response = await client.get("/vehicles/1")
        assert response.status_code == 403
        
        # Test PUT without auth
        response = await client.put("/vehicles/1", json={"name": "Updated"})
        assert response.status_code == 403
        
        # Test DELETE without auth
        response = await client.delete("/vehicles/1")
        assert response.status_code == 403


class TestVehicleModel:
    """Test suite for Vehicle model functionality."""

    @pytest.mark.asyncio
    async def test_vehicle_model_creation(self, db_session: AsyncSession):
        """Test creating a vehicle model instance."""
        # Create a user first
        user = User(
            email="model_test@example.com",
            password_hash=hash_password("password123"),
            full_name="Model Test User",
            is_verified=True
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        user_id = user.id  # Store ID to avoid MissingGreenlet
        
        # Create vehicle using test model
        vehicle = TestVehicle(
            name="Model Test Vehicle",
            description="Test vehicle for model testing",
            status="idle",
            user_id=user_id
        )
        
        db_session.add(vehicle)
        await db_session.commit()
        await db_session.refresh(vehicle)
        
        assert vehicle.id is not None
        assert vehicle.name == "Model Test Vehicle"
        assert vehicle.description == "Test vehicle for model testing"
        assert vehicle.status == "idle"
        assert vehicle.user_id == user_id
        assert vehicle.created_at is not None

    @pytest.mark.asyncio
    async def test_vehicle_model_default_status(self, db_session: AsyncSession):
        """Test that vehicle model has default status."""
        # Create a user first
        user = User(
            email="default_test@example.com",
            password_hash=hash_password("password123"),
            full_name="Default Test User",
            is_verified=True
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        user_id = user.id  # Store ID to avoid MissingGreenlet
        
        # Create vehicle without explicit status
        vehicle = TestVehicle(
            name="Default Status Vehicle",
            user_id=user_id
        )
        
        db_session.add(vehicle)
        await db_session.commit()
        await db_session.refresh(vehicle)
        
        assert vehicle.status == "idle"  # Default value


class TestVehicleValidation:
    """Test suite for vehicle data validation."""

    @pytest.mark.asyncio
    async def test_vehicle_status_values(self, client: AsyncClient, db_session: AsyncSession):
        """Test vehicle creation with different status values."""
        user_id, token = await TestVehicleEndpoints().create_authenticated_user(client, db_session)
        
        valid_statuses = ["idle", "mission", "maintenance"]
        
        headers = {"Authorization": f"Bearer {token}"}
        for status in valid_statuses:
            vehicle_data = {
                "name": f"Vehicle with {status} status",
                "status": status,
                "user_id": user_id
            }
            
            response = await client.post("/vehicles/", json=vehicle_data, headers=headers)
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == status

    @pytest.mark.asyncio
    async def test_vehicle_name_required(self, client: AsyncClient, db_session: AsyncSession):
        """Test that vehicle name is required."""
        user_id, token = await TestVehicleEndpoints().create_authenticated_user(client, db_session)
        
        vehicle_data = {
            "description": "Vehicle without name",
            "user_id": user_id
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.post("/vehicles/", json=vehicle_data, headers=headers)
        
        assert response.status_code == 422  # Validation error
        data = response.json()
        assert "name" in str(data["detail"]).lower()

    @pytest.mark.asyncio
    async def test_vehicle_user_id_required(self, client: AsyncClient, db_session: AsyncSession):  
        """Test that user_id is required."""
        user_id, token = await TestVehicleEndpoints().create_authenticated_user(client, db_session)
        
        vehicle_data = {
            "name": "Vehicle without user_id",
            "description": "This should fail"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.post("/vehicles/", json=vehicle_data, headers=headers)
        
        assert response.status_code == 422  # Validation error
        data = response.json()
        assert "user_id" in str(data["detail"]).lower()