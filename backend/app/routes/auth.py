from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from ..database import get_db
from ..models.user import User
from ..schemas.user import (
    UserCreate, UserLogin, UserAuth, UserResponse, RegisterResponse,
    VerifyEmailRequest, VerifyEmailResponse, ResendVerificationRequest, ResendVerificationResponse
)
from ..services.auth_service import (
    create_access_token, 
    authenticate_user, 
    create_user, 
    create_user_with_verification,
    verify_email,
    resend_verification_email,
    get_authenticated_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=RegisterResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register new user with email verification"""
    # Create user with verification using service
    user = await create_user_with_verification(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        db=db
    )
    
    return RegisterResponse(message="Registration successful! Please check your email to verify your account.")

@router.post("/verify-email", response_model=VerifyEmailResponse)
async def verify_email_endpoint(verify_data: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    """Verify user email with token"""
    await verify_email(verify_data.token, db)
    return VerifyEmailResponse()

@router.post("/resend-verification", response_model=ResendVerificationResponse)
async def resend_verification(resend_data: ResendVerificationRequest, db: AsyncSession = Depends(get_db)):
    """Resend verification email"""
    await resend_verification_email(resend_data.email, db)
    return ResendVerificationResponse()

@router.post("/login", response_model=UserAuth)
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user"""
    # Authenticate user using service
    user = await authenticate_user(login_data.email, login_data.password, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user email is verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please verify your email address before logging in",
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return UserAuth(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        token_type="bearer"
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_authenticated_user)):
    """Get current user information"""
    return UserResponse.model_validate(current_user)

@router.post("/refresh", response_model=UserAuth)
async def refresh_token(current_user: User = Depends(get_authenticated_user)):
    """Refresh access token"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(current_user.id)}, expires_delta=access_token_expires
    )
    
    return UserAuth(
        user=UserResponse.model_validate(current_user),
        access_token=access_token,
        token_type="bearer"
    )

@router.post("/logout")
async def logout():
    """Logout user (client should delete token)"""
    return {"message": "Successfully logged out"}