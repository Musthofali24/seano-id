from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from ..database import get_db
from ..models.user import User
from ..schemas.user import (
    RegisterEmailRequest, RegisterResponse, VerifyEmailRequest, VerifyEmailResponse, SetCredentialRequest, UserLogin, UserAuth, UserResponse, ResendVerificationRequest, ResendVerificationResponse
)
from ..services.auth_service import (
    create_access_token,
    authenticate_user,
    create_user_email_only,
    verify_email_token,
    set_user_credentials,
    resend_verification_email,
    get_authenticated_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register-email", response_model=RegisterResponse)
async def register_email( req: RegisterEmailRequest, db: AsyncSession = Depends(get_db)):
    await create_user_email_only(req.email, db)
    return RegisterResponse(message="Verification link has been sent to your email")

@router.post("/verify-email", response_model=VerifyEmailResponse)
async def verify_email_endpoint(
    verify_data: VerifyEmailRequest, db: AsyncSession = Depends(get_db)
):
    """
    Step 2: Verifikasi token dari email.
    Hanya validasi token dan mengizinkan user lanjut ke set username/password.
    """
    await verify_email_token(verify_data.token, db)
    return VerifyEmailResponse(message="Token valid. You can now set username & password.")

@router.post("/set-credentials", response_model=VerifyEmailResponse)
async def set_credentials(
    data: SetCredentialRequest, db: AsyncSession = Depends(get_db)
):
    """
    Step 3: User membuat username dan password pertama kali setelah verifikasi email.
    Sekaligus mengubah is_verified=True.
    """
    await set_user_credentials(data.token, data.username, data.password, db)
    return VerifyEmailResponse(message="Account activated successfully! You can now login.")

@router.post("/resend-verification", response_model=ResendVerificationResponse)
async def resend_verification(
    resend_data: ResendVerificationRequest, db: AsyncSession = Depends(get_db)
):
    """Kirim ulang link verifikasi email"""
    await resend_verification_email(resend_data.email, db)
    return ResendVerificationResponse(message="Verification email resent successfully.")

@router.post("/login", response_model=UserAuth)
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user"""
    user = await authenticate_user(login_data.email, login_data.password, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please verify your email before logging in.",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return UserAuth(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        token_type="bearer",
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_authenticated_user)):
    """Ambil data user yang sedang login"""
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
        token_type="bearer",
    )

@router.post("/logout")
async def logout():
    """Logout user (client should delete token)"""
    return {"message": "Successfully logged out"}