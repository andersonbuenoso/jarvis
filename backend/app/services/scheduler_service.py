from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from zoneinfo import ZoneInfo

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.services import slack_service

settings = get_settings()
scheduler = AsyncIOScheduler(timezone=ZoneInfo(settings.timezone))


async def scheduled_daily_summary() -> None:
    db = SessionLocal()
    try:
        await slack_service.send_daily_summary(db)
    finally:
        db.close()


async def scheduled_focus_reminder() -> None:
    now = slack_service.local_now()
    if now.hour <= settings.slack_focus_reminder_start_hour or now.hour > settings.slack_focus_reminder_end_hour:
        return
    db = SessionLocal()
    try:
        await slack_service.send_focus_reminder(db)
    finally:
        db.close()


def start_scheduler() -> None:
    if scheduler.running:
        return
    scheduler.add_job(
        scheduled_daily_summary,
        CronTrigger(
            hour=settings.slack_daily_summary_hour,
            minute=settings.slack_daily_summary_minute,
            timezone=ZoneInfo(settings.timezone),
        ),
        id="slack_daily_summary",
        replace_existing=True,
    )
    scheduler.add_job(
        scheduled_focus_reminder,
        CronTrigger(minute=0, timezone=ZoneInfo(settings.timezone)),
        id="slack_focus_reminder",
        replace_existing=True,
    )
    scheduler.start()


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown()
