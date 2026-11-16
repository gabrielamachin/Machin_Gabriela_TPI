"""Configuración de la aplicación, leída desde variables de entorno (.env)."""
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Food Store API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "sqlite:///./foodstore.db"

    # Seguridad (JWT en cookie HttpOnly)
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    COOKIE_NAME: str = "access_token"

    # CORS con credenciales: el origen debe ser explícito (no "*")
    FRONTEND_ORIGIN: str = "http://localhost:5173"


settings = Settings()  # type: ignore[call-arg]  # SECRET_KEY viene del .env
