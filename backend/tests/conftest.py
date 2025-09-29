# tests/conftest.py
import pytest
import asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.sql import func

from app.main import app
from app.database import get_db

SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create test-specific base and models
TestBase = declarative_base()

class TestVehicle(TestBase):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    status = Column(String(20), default="idle")
    user_id = Column(Integer, nullable=True)  # Simplified - no FK constraint for tests
    points_id = Column(Integer, nullable=True)  # Simplified - no FK constraint for tests
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TestSensorType(TestBase):
    __tablename__ = "sensor_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TestSensor(TestBase):
    __tablename__ = "sensors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    sensor_type_id = Column(Integer, nullable=False)  # Simplified - no FK constraint for tests
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TestSensorLog(TestBase):
    __tablename__ = "sensor_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, nullable=False)  # Simplified - no FK constraint for tests
    sensor_id = Column(Integer, nullable=False)   # Simplified - no FK constraint for tests
    data = Column(JSON, nullable=False)  # Use JSON instead of JSONB for SQLite compatibility
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TestVehicleLog(TestBase):
    __tablename__ = "vehicle_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, nullable=False)  # Simplified - no FK constraint for tests
    battery_voltage = Column(Integer)  # Simplified for testing
    battery_current = Column(Integer)  # Simplified for testing
    rssi = Column(Integer)
    mode = Column(Text)
    latitude = Column(Integer)  # Simplified for testing
    longitude = Column(Integer)  # Simplified for testing
    heading = Column(Integer)  # Simplified for testing
    armed = Column(Boolean, default=False)
    guided = Column(Boolean, default=False)
    system_status = Column(Text)
    speed = Column(Integer)  # Simplified for testing
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TestUser(TestBase):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False, unique=True, index=True)
    password_hash = Column(Text) 
    full_name = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def db_session():
    """Create a fresh database for each test."""
    async with engine.begin() as conn:
        await conn.run_sync(TestBase.metadata.create_all)
    
    async with TestingSessionLocal() as session:
        yield session
    
    async with engine.begin() as conn:
        await conn.run_sync(TestBase.metadata.drop_all)

@pytest.fixture
async def client(db_session):
    """Create a test client with dependency override."""
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()