from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional, Dict, Any
from pydantic import BaseModel
from .config import get_settings

settings = get_settings()
security = HTTPBearer()


class TokenData(BaseModel):
    """JWT token payload data."""
    user_id: str
    email: Optional[str] = None


class UserWithProfile(BaseModel):
    """User data with profile information."""
    user_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    plan: Optional[str] = None
    plan_status: Optional[str] = None
    role: str = "user"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenData:
    """
    Validate JWT token from Supabase Auth.
    Returns basic token data (user_id, email).
    """
    token = credentials.credentials
    
    # Allow mock token for development
    if token == "mock_token_for_demo":
        return TokenData(user_id="00000000-0000-0000-0000-000000000000", email="mock@example.com")
    
    try:
        # Decode JWT - for dev, decode without signature verification
        # In production, set SUPABASE_JWT_SECRET for proper verification
        if settings.supabase_jwt_secret:
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False}  # Supabase uses various audiences
            )
        else:
            # Development mode: decode without signature verification
            payload = jwt.decode(
                token,
                "",  # Key required but not used when verify_signature is False
                algorithms=["HS256"],
                options={
                    "verify_signature": False,
                    "verify_aud": False,
                    "verify_exp": False  # Also skip expiration for dev
                },
            )
        
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return TokenData(user_id=user_id, email=email)
        
    except JWTError as e:
        print(f"JWT Error: {e}")  # Debug logging
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_with_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    Validate JWT and fetch user profile from database.
    Returns full profile with plan and role information.
    
    Use this for endpoints that need plan-based access control.
    """
    from app.services.user_service import user_service
    
    token_data = await get_current_user(credentials)
    
    # Fetch profile from database
    profile = await user_service.get_profile(token_data.user_id)
    
    if not profile:
        # Profile doesn't exist yet (first login)
        profile = {
            "id": token_data.user_id,
            "email": token_data.email,
            "name": None,
            "plan": None,
            "plan_status": None,
            "role": "user",
        }
    
    return profile
