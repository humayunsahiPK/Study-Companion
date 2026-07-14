from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_uri: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    gemini_api_key: str = ""
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
