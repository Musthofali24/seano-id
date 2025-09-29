import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.services.auth_service import hash_password, generate_verification_token


class TestAuthentication:
    """Test suite for user authentication system"""

    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient):
        """Test successful user registration with email verification"""
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        
        response = await client.post("/auth/register", json=user_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "Registration successful" in data["message"]
        assert "verify your account" in data["message"]

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient, db_session: AsyncSession):
        """Test registration with duplicate email should fail"""
        # Create existing user
        existing_user = User(
            email="existing@example.com",
            password_hash=hash_password("password123"),
            full_name="Existing User",
            is_verified=True
        )
        db_session.add(existing_user)
        await db_session.commit()
        
        # Try to register with same email
        user_data = {
            "email": "existing@example.com",
            "password": "newpassword123",
            "full_name": "New User"
        }
        
        response = await client.post("/auth/register", json=user_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "Email already registered" in data["detail"]

    @pytest.mark.asyncio
    async def test_verify_email_success(self, client: AsyncClient, db_session: AsyncSession):
        """Test successful email verification"""
        # Create unverified user with verification token
        verification_token = generate_verification_token()
        user = User(
            email="unverified@example.com",
            password_hash=hash_password("password123"),
            full_name="Unverified User",
            is_verified=False,
            verification_token=verification_token
        )
        db_session.add(user)
        await db_session.commit()
        
        # Verify email
        verify_data = {"token": verification_token}
        response = await client.post("/auth/verify-email", json=verify_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "email verified successfully"
        
        # Check user is now verified
        await db_session.refresh(user)
        assert user.is_verified is True
        assert user.verification_token is None

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, db_session: AsyncSession):
        """Test successful login with verified user"""
        # Create verified user
        user = User(
            email="login@example.com",
            password_hash=hash_password("password123"),
            full_name="Login User",
            is_verified=True
        )
        db_session.add(user)
        await db_session.commit()
        
        # Login
        login_data = {
            "email": "login@example.com",
            "password": "password123"
        }
        response = await client.post("/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "login@example.com"
        assert data["user"]["is_verified"] is True

    @pytest.mark.asyncio
    async def test_login_unverified_user(self, client: AsyncClient, db_session: AsyncSession):
        """Test login with unverified user should fail"""
        # Create unverified user
        user = User(
            email="unverified_login@example.com",
            password_hash=hash_password("password123"),
            full_name="Unverified Login User",
            is_verified=False,
            verification_token=generate_verification_token()
        )
        db_session.add(user)
        await db_session.commit()
        
        # Try to login
        login_data = {
            "email": "unverified_login@example.com",
            "password": "password123"
        }
        response = await client.post("/auth/login", json=login_data)
        
        assert response.status_code == 401
        data = response.json()
        assert "verify your email" in data["detail"]

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient, db_session: AsyncSession):
        """Test login with wrong password"""
        # Create verified user
        user = User(
            email="wrongpass@example.com",
            password_hash=hash_password("correctpassword"),
            full_name="Wrong Pass User",
            is_verified=True
        )
        db_session.add(user)
        await db_session.commit()
        
        # Login with wrong password
        login_data = {
            "email": "wrongpass@example.com",
            "password": "wrongpassword"
        }
        response = await client.post("/auth/login", json=login_data)
        
        assert response.status_code == 401
        data = response.json()
        assert "Incorrect email or password" in data["detail"]


class TestUserManagement:
    """Test suite for user management operations"""

    async def create_authenticated_user(self, client: AsyncClient, db_session: AsyncSession, 
                                      email: str = "admin@example.com") -> tuple[User, str]:
        """Helper to create authenticated user and return user object and token"""
        user = User(
            email=email,
            password_hash=hash_password("password123"),
            full_name="Test User",
            is_verified=True
        )
        db_session.add(user)
        await db_session.commit()
        
        # Login to get token
        login_data = {"email": email, "password": "password123"}
        login_response = await client.post("/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        
        return user, token

    @pytest.mark.asyncio
    async def test_get_users_success(self, client: AsyncClient, db_session: AsyncSession):
        """Test getting list of users with authentication"""
        # Create authenticated user
        _, token = await self.create_authenticated_user(client, db_session)
        
        # Create additional test users
        for i in range(2):
            user = User(
                email=f"user{i}@example.com",
                password_hash=hash_password("password123"),
                full_name=f"User {i}",
                is_verified=True
            )
            db_session.add(user)
        await db_session.commit()
        
        # Get users
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.get("/users/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3  # At least our test users

    @pytest.mark.asyncio
    async def test_get_users_unauthorized(self, client: AsyncClient):
        """Test getting users without authentication should fail"""
        response = await client.get("/users/")
        
        # FastAPI can return either 401 or 403 for unauthorized access
        assert response.status_code in [401, 403]
        data = response.json()
        assert "detail" in data

    @pytest.mark.asyncio
    async def test_update_user_success(self, client: AsyncClient, db_session: AsyncSession):
        """Test updating user information"""
        # Create authenticated user
        user, token = await self.create_authenticated_user(client, db_session)
        
        # Update user data
        update_data = {
            "full_name": "Updated Name",
            "email": "updated@example.com"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.put(f"/users/{user.id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Updated Name"
        assert data["email"] == "updated@example.com"

    @pytest.mark.asyncio
    async def test_update_user_password(self, client: AsyncClient, db_session: AsyncSession):
        """Test updating user password"""
        # Create authenticated user
        user, token = await self.create_authenticated_user(client, db_session)
        
        # Update password
        update_data = {"password": "newpassword123"}
        
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.put(f"/users/{user.id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        
        # Test login with new password
        login_data = {
            "email": "admin@example.com",
            "password": "newpassword123"
        }
        login_response = await client.post("/auth/login", json=login_data)
        assert login_response.status_code == 200
        assert "access_token" in login_response.json()

    @pytest.mark.asyncio
    async def test_protected_route_requires_auth(self, client: AsyncClient, db_session: AsyncSession):
        """Test that protected routes require authentication"""
        # Create a user for testing
        user = User(
            email="test@example.com",
            password_hash=hash_password("password123"),
            full_name="Test User",
            is_verified=True
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        # Test unauthorized access to protected endpoints
        protected_endpoints = [
            ("GET", "/users/"),
            ("GET", f"/users/{user.id}"),
            ("PUT", f"/users/{user.id}", {"full_name": "Updated"}),
        ]
        
        for method, url, *json_data in protected_endpoints:
            if method == "GET":
                response = await client.get(url)
            elif method == "PUT":
                response = await client.put(url, json=json_data[0])
            
            assert response.status_code in [401, 403]
            data = response.json()
            assert "detail" in data