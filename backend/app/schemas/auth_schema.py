from pydantic import BaseModel, Field

from app.models.user import UserRole


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class UserOut(BaseModel):
    id: int
    username: str
    role: UserRole


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
