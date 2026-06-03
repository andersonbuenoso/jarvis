from datetime import date, datetime, timezone
from enum import Enum

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Category(str, Enum):
    TRABALHO = "TRABALHO"
    AULAS = "AULAS"
    PROJETOS = "PROJETOS"
    ESTUDOS = "ESTUDOS"
    PESSOAL = "PESSOAL"
    COMUNICACAO = "COMUNICACAO"


class Priority(str, Enum):
    ALTA = "ALTA"
    MEDIA = "MEDIA"
    BAIXA = "BAIXA"


class Status(str, Enum):
    A_FAZER = "A_FAZER"
    FAZENDO = "FAZENDO"
    TRAVADO = "TRAVADO"
    CONCLUIDO = "CONCLUIDO"
    CANCELADO = "CANCELADO"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    project: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    category: Mapped[Category] = mapped_column(String(30), nullable=False, default=Category.PESSOAL)
    priority: Mapped[Priority] = mapped_column(String(20), nullable=False, default=Priority.MEDIA)
    status: Mapped[Status] = mapped_column(String(20), nullable=False, default=Status.A_FAZER)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    next_action: Mapped[str | None] = mapped_column(String(255), nullable=True)
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class FocusLog(Base):
    __tablename__ = "focus_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    task_id: Mapped[int | None] = mapped_column(ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(30), nullable=False, default="slack")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)

    task: Mapped[Task | None] = relationship()
