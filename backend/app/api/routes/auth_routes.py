from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth_schema import LoginRequest, TokenResponse, UserOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.login(db, payload.username, payload.password)
    return TokenResponse(access_token=auth_service.create_access_token(user), user=UserOut(id=user.id, username=user.username, role=auth_service.role_value(user.role)))


@router.get("/me", response_model=UserOut)
def me(user=Depends(auth_service.get_current_user)):
    return UserOut(id=user.id, username=user.username, role=auth_service.role_value(user.role))
