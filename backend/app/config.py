from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application
    PROJECT_NAME: str = "Micro SaaS Backend"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Database (optional - app boots without it)
    DATABASE_URL: str = ""

    # Firebase
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_SERVICE_ACCOUNT_JSON: str = ""
    FIREBASE_CREDENTIALS_PATH: str = ""

    # Public submission base URL (used to build submit_url and html_snippet)
    PUBLIC_SUBMIT_BASE_URL: str = "http://localhost:8000"


settings = Settings()
