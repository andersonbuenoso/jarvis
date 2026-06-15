from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth_routes import router as auth_router
from app.api.routes.slack_routes import router as slack_router
from app.api.routes.task_routes import router as task_router
from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.seed import seed_database
from app.services.auth_service import ensure_admin_user
from app.services.scheduler_service import start_scheduler, stop_scheduler

settings = get_settings()

app = FastAPI(title=f"{settings.app_name} API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        ensure_admin_user(db)
    finally:
        db.close()
    seed_database()
    start_scheduler()


@app.on_event("shutdown")
def on_shutdown() -> None:
    stop_scheduler()


@app.get("/health")
def health():
    return {"status": "ok", "app": settings.app_name}


app.include_router(auth_router, prefix="/api")
app.include_router(task_router, prefix="/api")
app.include_router(slack_router, prefix="/api")
