import hashlib
import hmac
import json
import time
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qs
from zoneinfo import ZoneInfo

import httpx
from fastapi import HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.task import Status, Task
from app.repositories import task_repository
from app.schemas.task_schema import TaskUpdate
from app.services import task_service

settings = get_settings()


def verify_slack_request(request: Request, body: bytes) -> None:
    if not settings.slack_signing_secret:
        return
    timestamp = request.headers.get("X-Slack-Request-Timestamp")
    signature = request.headers.get("X-Slack-Signature")
    if not timestamp or not signature:
        raise HTTPException(status_code=401, detail="Missing Slack signature")
    if abs(time.time() - int(timestamp)) > 60 * 5:
        raise HTTPException(status_code=401, detail="Stale Slack request")
    base = f"v0:{timestamp}:{body.decode()}".encode()
    digest = hmac.new(settings.slack_signing_secret.encode(), base, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(f"v0={digest}", signature):
        raise HTTPException(status_code=401, detail="Invalid Slack signature")


async def parse_slack_form(request: Request) -> dict[str, str]:
    body = await request.body()
    verify_slack_request(request, body)
    parsed = parse_qs(body.decode())
    return {key: values[0] for key, values in parsed.items() if values}


async def post_message(text: str, blocks: list[dict] | None = None, channel: str | None = None) -> None:
    if not settings.slack_bot_token or not (channel or settings.slack_channel_id):
        return
    payload = {
        "channel": channel or settings.slack_channel_id,
        "text": text,
    }
    if blocks:
        payload["blocks"] = blocks
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            "https://slack.com/api/chat.postMessage",
            headers={"Authorization": f"Bearer {settings.slack_bot_token}"},
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        if not data.get("ok"):
            raise RuntimeError(f"Slack API error: {data.get('error')}")


def task_line(task: Task) -> str:
    due = f" | prazo {task.due_date}" if task.due_date else ""
    next_action = f" | {task.next_action}" if task.next_action else ""
    return f"#{task.id} {task.title} ({task.priority}, {task.status}{due}){next_action}"


def task_action_blocks(task: Task) -> list[dict]:
    return [
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Atendendo"},
                    "value": str(task.id),
                    "action_id": "focus_task",
                },
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Concluir"},
                    "style": "primary",
                    "value": str(task.id),
                    "action_id": "complete_task",
                },
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Cancelar"},
                    "style": "danger",
                    "value": str(task.id),
                    "action_id": "cancel_task",
                },
            ],
        }
    ]


def section_block(title: str, tasks: list[Task]) -> list[dict]:
    if not tasks:
        return [{"type": "section", "text": {"type": "mrkdwn", "text": f"*{title}*\nNenhuma atividade."}}]
    lines = "\n".join(f"- {task_line(task)}" for task in tasks[:10])
    blocks = [{"type": "section", "text": {"type": "mrkdwn", "text": f"*{title}*\n{lines}"}}]
    for task in tasks[:3]:
        blocks.extend(task_action_blocks(task))
    return blocks


def daily_summary_blocks(db: Session) -> list[dict]:
    sections = task_service.slack_daily_sections(task_repository.list_tasks(db), settings.long_running_days)
    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": "Jarvis: plano do dia"},
        },
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": "Bom dia. Estas sao as atividades para priorizar hoje:"},
        },
    ]
    blocks.extend(section_block("Prioridades primeiro", sections["priority_tasks"]))
    blocks.extend(section_block("Atividades demorando muito ou travadas", sections["long_running_tasks"]))
    blocks.extend(section_block("Demais atividades", sections["other_tasks"]))
    return blocks


async def send_daily_summary(db: Session) -> None:
    await post_message("Jarvis: plano do dia", daily_summary_blocks(db))


def focus_is_fresh(db: Session) -> bool:
    latest = task_repository.latest_focus_log(db)
    if not latest:
        return False
    now = datetime.now(timezone.utc)
    return task_service.as_utc(latest.created_at) >= now - timedelta(hours=1)


async def send_focus_reminder(db: Session) -> None:
    if focus_is_fresh(db):
        return
    sections = task_service.slack_daily_sections(task_repository.list_tasks(db), settings.long_running_days)
    next_tasks = (sections["priority_tasks"] or sections["long_running_tasks"] or sections["other_tasks"])[:5]
    blocks = [
        {"type": "header", "text": {"type": "plain_text", "text": "Jarvis: atualizar foco"}},
        {"type": "section", "text": {"type": "mrkdwn", "text": "Faz uma hora que voce nao informou o que esta atendendo. Priorize uma destas atividades:"}},
    ]
    blocks.extend(section_block("Fila recomendada", next_tasks))
    await post_message("Jarvis: atualizar foco", blocks)


def local_now() -> datetime:
    return datetime.now(ZoneInfo(settings.timezone))


def handle_command(db: Session, text: str) -> str:
    command, _, rest = text.strip().partition(" ")
    command = command.lower()

    if command in ("", "ajuda", "help"):
        return help_text()
    if command in ("hoje", "dia", "listar"):
        sections = task_service.slack_daily_sections(task_repository.list_tasks(db), settings.long_running_days)
        lines = ["*Prioridades primeiro*"]
        lines.extend(task_line(task) for task in sections["priority_tasks"][:8])
        lines.append("\n*Atividades demorando muito ou travadas*")
        lines.extend(task_line(task) for task in sections["long_running_tasks"][:8])
        lines.append("\n*Demais atividades*")
        lines.extend(task_line(task) for task in sections["other_tasks"][:8])
        return "\n".join(lines)
    if command in ("nova", "novo", "criar"):
        if not rest.strip():
            return "Envie assim: `/jarvis nova revisar proposta hoje`."
        created = task_service.quick_capture(db, rest)
        return "Criei: " + ", ".join(f"#{task.id} {task.title}" for task in created)
    if command in ("concluir", "done", "finalizar"):
        return change_task_status(db, rest, Status.CONCLUIDO)
    if command in ("cancelar", "cancel", "arquivar"):
        return change_task_status(db, rest, Status.CANCELADO)
    if command in ("foco", "atendendo", "fazendo"):
        task_id, note = parse_id_and_note(rest)
        if task_id is None:
            task_service.register_focus(db, None, rest or "Foco atualizado")
            return "Foco atualizado. Use `/jarvis foco 12 detalhe` para vincular a uma atividade."
        task = task_repository.get_task(db, task_id)
        if not task:
            return f"Nao encontrei a atividade #{task_id}."
        task_service.register_focus(db, task_id, note or f"Atendendo #{task_id}")
        return f"Registrado: voce esta atendendo #{task.id} {task.title}."
    return help_text()


def parse_id_and_note(text: str) -> tuple[int | None, str | None]:
    raw_id, _, note = text.strip().partition(" ")
    if raw_id.isdigit():
        return int(raw_id), note.strip() or None
    return None, text.strip() or None


def change_task_status(db: Session, rest: str, status: Status) -> str:
    task_id, _ = parse_id_and_note(rest)
    if task_id is None:
        return "Informe o numero da atividade. Exemplo: `/jarvis concluir 12`."
    task = task_repository.get_task(db, task_id)
    if not task:
        return f"Nao encontrei a atividade #{task_id}."
    updated = task_repository.update_task(db, task, TaskUpdate(status=status))
    label = "concluida" if status == Status.CONCLUIDO else "cancelada"
    return f"Atividade #{updated.id} {label}: {updated.title}."


def help_text() -> str:
    return (
        "*Comandos do Jarvis*\n"
        "`/jarvis hoje` lista atividades do dia\n"
        "`/jarvis nova texto da atividade` cria uma ou mais atividades\n"
        "`/jarvis foco 12 o que estou fazendo` registra o foco da hora\n"
        "`/jarvis concluir 12` marca como concluida\n"
        "`/jarvis cancelar 12` cancela a atividade"
    )


def handle_interaction(db: Session, payload: str) -> str:
    data = json.loads(payload)
    action = data["actions"][0]
    task_id = int(action["value"])
    task = task_repository.get_task(db, task_id)
    if not task:
        return f"Nao encontrei a atividade #{task_id}."
    if action["action_id"] == "complete_task":
        task_repository.update_task(db, task, TaskUpdate(status=Status.CONCLUIDO))
        return f"Concluida: #{task.id} {task.title}."
    if action["action_id"] == "cancel_task":
        task_repository.update_task(db, task, TaskUpdate(status=Status.CANCELADO))
        return f"Cancelada: #{task.id} {task.title}."
    if action["action_id"] == "focus_task":
        task_service.register_focus(db, task.id, f"Atendendo #{task.id}")
        return f"Foco registrado: #{task.id} {task.title}."
    return "Acao nao reconhecida."
