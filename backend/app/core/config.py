from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Jarvis"
    database_url: str = "sqlite:///./data/jarvis.db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    timezone: str = "America/Sao_Paulo"
    slack_bot_token: str | None = None
    slack_signing_secret: str | None = None
    slack_channel_id: str | None = None
    slack_daily_summary_hour: int = 8
    slack_daily_summary_minute: int = 0
    slack_focus_reminder_start_hour: int = 8
    slack_focus_reminder_end_hour: int = 18
    long_running_days: int = 3
    admin_username: str | None = None
    admin_password: str | None = None
    auth_token_expire_minutes: int = 60 * 24 * 7

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
