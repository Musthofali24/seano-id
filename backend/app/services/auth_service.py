from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
import os
import secrets

from app.models.role import Role, UserRole
from ..database import get_db
from ..models.user import User
from .email_service import send_verification_email

security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str) 
    except (jwt.PyJWTError, ValueError, TypeError):
        raise credentials_exception
    
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    return user

async def get_authenticated_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current authenticated user"""
    return current_user

async def authenticate_user(email: str, password: str, db: AsyncSession) -> User:
    """Authenticate user by email and password"""
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(password, user.password_hash):
        return None
    
    # Check if email is verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please verify your email address before logging in"
        )
    
    return user

async def create_user(email: str, password: str, full_name: str = None, db: AsyncSession = None) -> User:
    """Create new user"""
    # Check if user already exists
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = hash_password(password)
    
    # Create user
    user = User(
        email=email,
        full_name=full_name,
        password_hash=hashed_password
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user

async def create_user_email_only(email: str, db: AsyncSession):
    """Buat user baru hanya dengan email & kirim link verifikasi"""
    existing = await db.scalar(select(User).where(User.email == email))
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    

    token = generate_verification_token()
    new_user = User(email=email, is_verified=False, verification_token=token, verification_sent_at=datetime.now(timezone.utc))
    db.add(new_user)
    await db.commit()

    await send_verification_email(email, token, "User")

async def verify_email_token(token: str, db: AsyncSession):
    user = await db.scalar(select(User).where(User.verification_token == token))
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token.")

    if user.verification_sent_at:
        now = datetime.now(timezone.utc)
        if now - user.verification_sent_at > timedelta(hours=24):
            raise HTTPException(status_code=400, detail="Verification token has expired.")

    return user

async def set_user_credentials(token: str, username: str, password: str, db: AsyncSession):
    """Set usernamer & password setelah verifikasi"""
    user = await db.scalar(select(User).where(User.verification_token == token))
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token.")
    
    user.username = username
    user.password_hash = hash_password(password)
    user.is_verified = True
    user.verification_token = None
    await db.commit()

    result = await db.execute(select(Role).where(Role.name == "user"))
    default_role = result.scalar_one_or_none()
    if not default_role:
        default_role = Role(name="user", description="Default user role")
        db.add(default_role)
        await db.commit()
        await db.refresh(default_role)
    user_role = UserRole(user_id=user.id, role_id=default_role.id)
    db.add(user_role)
    await db.commit()

def generate_verification_token() -> str:
    """Generate a secure random verification token"""
    return secrets.token_urlsafe(32)

async def create_user_with_verification(email: str, password: str, full_name: str, db: AsyncSession) -> User:
    """Create user with email verification token and send verification email"""
    # Check if user already exists
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = hash_password(password)
    
    # Generate verification token
    verification_token = generate_verification_token()
    
    # Create user (unverified)
    user = User(
        email=email,
        full_name=full_name,
        password_hash=hashed_password,
        is_verified=False,
        verification_token=verification_token
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Send verification email (don't let email errors affect user creation)
    try:
        await send_verification_email(
            to_email=email,
            verification_token=verification_token,
            user_name=full_name or "User"
        )
    except Exception as e:
        # Log error but don't fail user creation
        print(f"Failed to send verification email: {e}")
        print(f"Development mode: Verification token for {email}: {verification_token}")
    
    return user

async def verify_email(token: str, db: AsyncSession) -> bool:
    """Verify user email with token"""
    query = select(User).where(User.verification_token == token)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Mark as verified and clear token
    user.is_verified = True
    user.verification_token = None
    
    await db.commit()
    return True

async def resend_verification_email(email: str, db: AsyncSession) -> bool:
    """Resend verification email to user"""
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Generate new verification token
    verification_token = generate_verification_token()
    user.verification_token = verification_token
    user.verification_sent_at = datetime.now(timezone.utc)
    
    await db.commit()
    
    # Send verification email
    await send_verification_email(
        to_email=email,
        verification_token=verification_token,
        user_name=user.full_name or "User"
    )
    
    return True