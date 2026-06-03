import re
from datetime import date, datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.task import Category, Priority, Status, Task
from app.repositories import task_repository
from app.schemas.task_schema import FocusLogCreate, TaskCreate, TaskUpdate


CATEGORY_KEYWORDS: list[tuple[Category, tuple[str, ...]]] = [
    (Category.AULAS, ("aula", "roteiro", "alunos")),
    (Category.TRABALHO, ("deploy", "qlik", "github", "docker", "hostinger", "sistema")),
    (Category.PROJETOS, ("rota bioceanica", "hemosul", "jarvis", "projeto")),
    (Category.ESTUDOS, ("ingles", "estudar", "curso")),
    (Category.COMUNICACAO, ("responder", "recrutadora", "mensagem", "email", "e-mail")),
]

HIGH_KEYWORDS = ("hoje", "urgente", "prazo", "entrega", "producao", "deploy")
LOW_KEYWORDS = ("depois", "quando der", "pesquisar", "estudar")


def infer_category(text: str) -> Category:
    lowered = text.lower()
    for category, keywords in CATEGORY_KEYWORDS:
        if any(keyword in lowered for keyword in keywords):
            return category
    return Category.PESSOAL


def infer_priority(text: str) -> Priority:
    lowered = text.lower()
    if any(keyword in lowered for keyword in HIGH_KEYWORDS):
        return Priority.ALTA
    if any(keyword in lowered for keyword in LOW_KEYWORDS):
        return Priority.BAIXA
    return Priority.MEDIA


def split_quick_capture(text: str) -> list[str]:
    parts = re.split(r"[,;\n]+|\s+e\s+", text, flags=re.IGNORECASE)
    return [part.strip(" .") for part in parts if part.strip(" .")]


def quick_capture(db: Session, text: str) -> list[Task]:
    created = []
    for item in split_quick_capture(text):
        created.append(
            task_repository.create_task(
                db,
                TaskCreate(
                    title=item[:1].upper() + item[1:],
                    category=infer_category(item),
                    priority=infer_priority(item),
                    status=Status.A_FAZER,
                ),
            )
        )
    return created


def active_only(tasks: list[Task]) -> list[Task]:
    return [task for task in tasks if task.status not in (Status.CONCLUIDO, Status.CANCELADO)]


def priority_rank(task: Task) -> tuple[int, date, datetime]:
    return (
        0 if task.priority == Priority.ALTA else 1 if task.priority == Priority.MEDIA else 2,
        task.due_date or date.max,
        task.created_at,
    )


def dashboard_summary(tasks: list[Task]) -> dict:
    today = date.today()
    active = active_only(tasks)
    recommended = sorted(
        active,
        key=lambda task: (
            0 if task.priority == Priority.ALTA and task.due_date and task.due_date <= today else
            1 if task.priority == Priority.ALTA else
            2 if task.priority == Priority.MEDIA else
            3,
            task.due_date or date.max,
            task.created_at,
        ),
    )
    return {
        "total": len(tasks),
        "open": len(active),
        "completed": len([task for task in tasks if task.status == Status.CONCLUIDO]),
        "blocked": len([task for task in tasks if task.status == Status.TRAVADO]),
        "high_priority": len([task for task in active if task.priority == Priority.ALTA]),
        "overdue": len([task for task in active if task.due_date and task.due_date < today]),
        "today": len([task for task in active if task.due_date == today]),
        "recommended_task": recommended[0] if recommended else None,
    }


def daily_plan(tasks: list[Task]) -> dict[str, list[Task]]:
    today = date.today()
    active = active_only(tasks)
    return {
        "urgent": [task for task in active if task.priority == Priority.ALTA and task.due_date and task.due_date <= today],
        "important": [task for task in active if task.priority in (Priority.ALTA, Priority.MEDIA)],
        "can_wait": [task for task in active if task.priority == Priority.BAIXA],
        "quick_tasks": [task for task in active if task.estimated_minutes is not None and task.estimated_minutes <= 15],
    }


def long_running_tasks(tasks: list[Task], days: int) -> list[Task]:
    threshold = datetime.now(timezone.utc) - timedelta(days=days)
    return [
        task for task in active_only(tasks)
        if as_utc(task.created_at) <= threshold or task.status in (Status.FAZENDO, Status.TRAVADO)
    ]


def slack_daily_sections(tasks: list[Task], long_running_days: int) -> dict[str, list[Task]]:
    active = sorted(active_only(tasks), key=priority_rank)
    priority_tasks = [task for task in active if task.priority == Priority.ALTA]
    long_running = long_running_tasks(active, long_running_days)
    used_ids = {task.id for task in priority_tasks + long_running}
    other_tasks = [task for task in active if task.id not in used_ids]
    return {
        "priority_tasks": priority_tasks,
        "long_running_tasks": long_running,
        "other_tasks": other_tasks,
    }


def register_focus(db: Session, task_id: int | None, note: str | None, source: str = "slack"):
    if task_id is not None:
        task = task_repository.get_task(db, task_id)
        if task:
            task_repository.update_task(db, task, TaskUpdate(status=Status.FAZENDO))
    return task_repository.create_focus_log(db, FocusLogCreate(task_id=task_id, note=note, source=source))


def as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)
