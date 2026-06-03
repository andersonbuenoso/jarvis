from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services import slack_service

router = APIRouter(prefix="/slack", tags=["slack"])


@router.post("/commands")
async def slack_commands(request: Request, db: Session = Depends(get_db)):
    form = await slack_service.parse_slack_form(request)
    response = slack_service.handle_command(db, form.get("text", ""))
    return JSONResponse({"response_type": "ephemeral", "text": response})


@router.post("/interactions")
async def slack_interactions(request: Request, db: Session = Depends(get_db)):
    form = await slack_service.parse_slack_form(request)
    response = slack_service.handle_interaction(db, form.get("payload", "{}"))
    return JSONResponse({"response_type": "ephemeral", "text": response})


@router.post("/send-daily-summary")
async def send_daily_summary(db: Session = Depends(get_db)):
    await slack_service.send_daily_summary(db)
    return {"status": "sent"}


@router.post("/send-focus-reminder")
async def send_focus_reminder(db: Session = Depends(get_db)):
    await slack_service.send_focus_reminder(db)
    return {"status": "sent"}
