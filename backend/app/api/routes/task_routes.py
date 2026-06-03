from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories import task_repository
from app.schemas.task_schema import (
    DailyPlan,
    DashboardSummary,
    QuickCaptureRequest,
    StatusUpdate,
    TaskCreate,
    TaskOut,
    TaskUpdate,
)
from app.services import task_service

router = APIRouter()


@router.get("/tasks", response_model=list[TaskOut])
def list_tasks(db: Session = Depends(get_db)):
    return task_repository.list_tasks(db)


@router.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = task_repository.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    return task_repository.create_task(db, payload)


@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = task_repository.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_repository.update_task(db, task, payload)


@router.patch("/tasks/{task_id}/status", response_model=TaskOut)
def update_status(task_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    task = task_repository.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_repository.update_task(db, task, TaskUpdate(status=payload.status))


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = task_repository.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task_repository.delete_task(db, task)


@router.get("/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    return task_service.dashboard_summary(task_repository.list_tasks(db))


@router.get("/daily-plan", response_model=DailyPlan)
def daily_plan(db: Session = Depends(get_db)):
    return task_service.daily_plan(task_repository.list_tasks(db))


@router.post("/tasks/quick-capture", response_model=list[TaskOut], status_code=201)
def quick_capture(payload: QuickCaptureRequest, db: Session = Depends(get_db)):
    return task_service.quick_capture(db, payload.text)
