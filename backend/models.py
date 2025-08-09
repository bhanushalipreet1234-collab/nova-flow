# backend/models.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .db import Base

class UserAPIKey(Base):
    __tablename__ = "user_api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)  # Could be email, UUID, or session ID
    service_name = Column(String, index=True)  # e.g., "openai", "serpapi", "custom_api"
    api_key = Column(String)  # You can encrypt this before storing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
