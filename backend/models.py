# backend/models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from .db import Base

class APIKey(Base):
    __tablename__ = "api_keys"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)           # user identifier
    service_name = Column(String, index=True)      # optional label
    api_key = Column(String)                       # encrypted or plaintext (encrypt in prod)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class NodeKey(Base):
    __tablename__ = "node_keys"
    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(String, index=True)           # id of the node in the canvas
    user_id = Column(String, index=True)
    service_name = Column(String, index=True)      # optional: which service this key is for
    encrypted_key = Column(String)                 # store encrypted key (Fernet token)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
