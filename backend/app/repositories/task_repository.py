from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import FocusLog, Status, Task
from app.schemas.task_schema import FocusLogCreate, TaskCreate, TaskUpdate


def list_tasks(db: Session) -> list[Task]:
    return db.scalars(select(Task).order_by(Task.priority, Task.due_date.nullslast(), Task.created_at.desc())).all()


def get_task(db: Session, task_id: int) -> Task | None:
    return db.get(Task, task_id)


def create_task(db: Session, payload: TaskCreate) -> Task:
    task = Task(**payload.model_dump())
    if task.status == Status.CONCLUIDO:
        task.completed_at = datetime.now(timezone.utc)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def create_focus_log(db: Session, payload: FocusLogCreate) -> FocusLog:
    focus_log = FocusLog(**payload.model_dump())
    db.add(focus_log)
    db.commit()
    db.refresh(focus_log)
    return focus_log


def latest_focus_log(db: Session) -> FocusLog | None:
    return db.scalars(select(FocusLog).order_by(FocusLog.created_at.desc()).limit(1)).first()


def update_task(db: Session, task: Task, payload: TaskUpdate) -> Task:
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(task, key, value)
    if "status" in data:
        task.completed_at = datetime.now(timezone.utc) if task.status == Status.CONCLUIDO else None
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()


def active_tasks(db: Session) -> list[Task]:
    return db.scalars(select(Task).where(Task.status.notin_([Status.CONCLUIDO, Status.CANCELADO]))).all()
