from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.task import Category, Priority, Status


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    project: str | None = None
    category: Category = Category.PESSOAL
    priority: Priority = Priority.MEDIA
    status: Status = Status.A_FAZER
    due_date: date | None = None
    next_action: str | None = None
    estimated_minutes: int | None = Field(default=None, ge=0)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    project: str | None = None
    category: Category | None = None
    priority: Priority | None = None
    status: Status | None = None
    due_date: date | None = None
    next_action: str | None = None
    estimated_minutes: int | None = Field(default=None, ge=0)


class StatusUpdate(BaseModel):
    status: Status


class QuickCaptureRequest(BaseModel):
    text: str = Field(..., min_length=1)


class TaskOut(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None = None


class DashboardSummary(BaseModel):
    total: int
    open: int
    completed: int
    blocked: int
    high_priority: int
    overdue: int
    today: int
    recommended_task: TaskOut | None = None


class DailyPlan(BaseModel):
    urgent: list[TaskOut]
    important: list[TaskOut]
    can_wait: list[TaskOut]
    quick_tasks: list[TaskOut]


class FocusLogCreate(BaseModel):
    task_id: int | None = None
    note: str | None = None
    source: str = "slack"


class FocusLogOut(FocusLogCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class SlackDailySections(BaseModel):
    priority_tasks: list[TaskOut]
    long_running_tasks: list[TaskOut]
    other_tasks: list[TaskOut]
