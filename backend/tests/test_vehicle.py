# tests/test_vehicle.py
import pytest
from httpx import AsyncClient
from tests.conftest import TestVehicle


class TestVehicleEndpoints:
    """Test suite for Vehicle API endpoints."""

    @pytest.mark.asyncio
    async def test_create_vehicle(self, client: AsyncClient):
        """Test creating a new vehicle."""
        vehicle_data = {
            "name": "SeaExplorer 1",
            "description": "Advanced underwater exploration vehicle",
            "status": "idle"
        }
        
        response = await client.post("/vehicles/", json=vehicle_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == vehicle_data["name"]
        assert data["description"] == vehicle_data["description"]
        assert data["status"] == vehicle_data["status"]
        assert "id" in data
        assert "created_at" in data

    @pytest.mark.asyncio
    async def test_create_vehicle_minimal_data(self, client: AsyncClient):
        """Test creating a vehicle with minimal required data."""
        vehicle_data = {
            "name": "MinimalVehicle"
        }
        
        response = await client.post("/vehicles/", json=vehicle_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == vehicle_data["name"]
        assert data["status"] == "idle"  # default value
        assert data["description"] is None

    @pytest.mark.asyncio
    async def test_create_vehicle_without_name(self, client: AsyncClient):
        """Test that creating a vehicle without name fails."""
        vehicle_data = {
            "description": "Vehicle without name"
        }
        
        response = await client.post("/vehicles/", json=vehicle_data)
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_get_all_vehicles_empty(self, client: AsyncClient):
        """Test getting all vehicles when database is empty."""
        response = await client.get("/vehicles/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    @pytest.mark.asyncio
    async def test_get_all_vehicles_with_data(self, client: AsyncClient):
        """Test getting all vehicles when there are vehicles in database."""
        # Create test vehicles
        vehicle1_data = {"name": "Vehicle 1", "status": "idle"}
        vehicle2_data = {"name": "Vehicle 2", "status": "mission"}
        
        await client.post("/vehicles/", json=vehicle1_data)
        await client.post("/vehicles/", json=vehicle2_data)
        
        # Get all vehicles
        response = await client.get("/vehicles/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        
        # Check that both vehicles are returned
        vehicle_names = [v["name"] for v in data]
        assert "Vehicle 1" in vehicle_names
        assert "Vehicle 2" in vehicle_names

    @pytest.mark.asyncio
    async def test_get_vehicle_by_id(self, client: AsyncClient):
        """Test getting a specific vehicle by ID."""
        # Create a test vehicle
        vehicle_data = {
            "name": "Test Vehicle",
            "description": "A test vehicle",
            "status": "maintenance"
        }
        
        create_response = await client.post("/vehicles/", json=vehicle_data)
        created_vehicle = create_response.json()
        vehicle_id = created_vehicle["id"]
        
        # Get the vehicle by ID
        response = await client.get(f"/vehicles/{vehicle_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == vehicle_id
        assert data["name"] == vehicle_data["name"]
        assert data["description"] == vehicle_data["description"]
        assert data["status"] == vehicle_data["status"]

    @pytest.mark.asyncio
    async def test_get_vehicle_by_nonexistent_id(self, client: AsyncClient):
        """Test getting a vehicle with non-existent ID."""
        response = await client.get("/vehicles/999")
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Vehicle not found"

    @pytest.mark.asyncio
    async def test_update_vehicle(self, client: AsyncClient):
        """Test updating a vehicle."""
        # Create a test vehicle
        vehicle_data = {
            "name": "Original Name",
            "description": "Original description",
            "status": "idle"
        }
        
        create_response = await client.post("/vehicles/", json=vehicle_data)
        created_vehicle = create_response.json()
        vehicle_id = created_vehicle["id"]
        
        # Update the vehicle
        update_data = {
            "name": "Updated Name",
            "description": "Updated description",
            "status": "mission"
        }
        
        response = await client.put(f"/vehicles/{vehicle_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == vehicle_id
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["status"] == update_data["status"]

    @pytest.mark.asyncio
    async def test_update_vehicle_partial(self, client: AsyncClient):
        """Test partially updating a vehicle."""
        # Create a test vehicle
        vehicle_data = {
            "name": "Original Name",
            "description": "Original description",
            "status": "idle"
        }
        
        create_response = await client.post("/vehicles/", json=vehicle_data)
        created_vehicle = create_response.json()
        vehicle_id = created_vehicle["id"]
        
        # Partially update the vehicle (only name)
        update_data = {
            "name": "Partially Updated Name"
        }
        
        response = await client.put(f"/vehicles/{vehicle_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == vehicle_id
        assert data["name"] == update_data["name"]
        assert data["description"] == vehicle_data["description"]  # Should remain unchanged
        assert data["status"] == vehicle_data["status"]  # Should remain unchanged

    @pytest.mark.asyncio
    async def test_update_nonexistent_vehicle(self, client: AsyncClient):
        """Test updating a non-existent vehicle."""
        update_data = {
            "name": "Updated Name"
        }
        
        response = await client.put("/vehicles/999", json=update_data)
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Vehicle not found"

    @pytest.mark.asyncio
    async def test_delete_vehicle(self, client: AsyncClient):
        """Test deleting a vehicle."""
        # Create a test vehicle
        vehicle_data = {
            "name": "Vehicle to Delete",
            "description": "This vehicle will be deleted"
        }
        
        create_response = await client.post("/vehicles/", json=vehicle_data)
        created_vehicle = create_response.json()
        vehicle_id = created_vehicle["id"]
        
        # Delete the vehicle
        response = await client.delete(f"/vehicles/{vehicle_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["detail"] == "Vehicle deleted successfully"
        
        # Verify vehicle is actually deleted
        get_response = await client.get(f"/vehicles/{vehicle_id}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_nonexistent_vehicle(self, client: AsyncClient):
        """Test deleting a non-existent vehicle."""
        response = await client.delete("/vehicles/999")
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Vehicle not found"


class TestVehicleModel:
    """Test suite for Vehicle model."""

    @pytest.mark.asyncio
    async def test_vehicle_model_creation(self, db_session):
        """Test creating a Vehicle model instance."""
        vehicle = TestVehicle(
            name="Test Vehicle",
            description="A test vehicle",
            status="idle"
        )
        
        db_session.add(vehicle)
        await db_session.commit()
        await db_session.refresh(vehicle)
        
        assert vehicle.id is not None
        assert vehicle.name == "Test Vehicle"
        assert vehicle.description == "A test vehicle"
        assert vehicle.status == "idle"
        assert vehicle.created_at is not None

    @pytest.mark.asyncio
    async def test_vehicle_model_default_status(self, db_session):
        """Test that Vehicle model has default status."""
        vehicle = TestVehicle(name="Test Vehicle")
        
        db_session.add(vehicle)
        await db_session.commit()
        await db_session.refresh(vehicle)
        
        assert vehicle.status == "idle"


class TestVehicleValidation:
    """Test suite for Vehicle validation and edge cases."""

    @pytest.mark.asyncio
    async def test_vehicle_status_values(self, client: AsyncClient):
        """Test different status values."""
        valid_statuses = ["idle", "mission", "maintenance", "offline"]
        
        for status in valid_statuses:
            vehicle_data = {
                "name": f"Vehicle {status.title()}",
                "status": status
            }
            
            response = await client.post("/vehicles/", json=vehicle_data)
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == status

    @pytest.mark.asyncio
    async def test_vehicle_name_length(self, client: AsyncClient):
        """Test vehicle name with different lengths."""
        # Test with short name
        short_name_data = {"name": "A"}
        response = await client.post("/vehicles/", json=short_name_data)
        assert response.status_code == 200
        
        # Test with long name (up to 100 characters based on model)
        long_name = "A" * 100
        long_name_data = {"name": long_name}
        response = await client.post("/vehicles/", json=long_name_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == long_name

    @pytest.mark.asyncio
    async def test_vehicle_description_optional(self, client: AsyncClient):
        """Test that description is optional."""
        vehicle_data = {"name": "No Description Vehicle"}
        
        response = await client.post("/vehicles/", json=vehicle_data)
        assert response.status_code == 200
        data = response.json()
        assert data["description"] is None