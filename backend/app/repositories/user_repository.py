from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User, UserRole


def get_by_username(db: Session, username: str) -> User | None:
    return db.scalars(select(User).where(User.username == username)).first()


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def create_admin(db: Session, username: str, password_hash: str) -> User:
    user = User(username=username, password_hash=password_hash, role=UserRole.ADMIN)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
