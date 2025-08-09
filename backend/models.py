# backend/models.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .db import Base

class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)           # Could be user UUID/email/session id
    service_name = Column(String, index=True)      # e.g., "openai", "openweather"
    api_key = Column(String)                       # Stored as plaintext here; encrypt in prod
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
