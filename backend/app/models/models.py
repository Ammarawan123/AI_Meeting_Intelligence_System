"""
Database table definitions.

Meeting.status values match the frontend's expected union type exactly:
"completed" | "processing" | "failed" (see AI_Meeting_Intelligence
frontend types/index.ts). Keep these in sync if the frontend changes.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="analyst", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    meetings = relationship("Meeting", back_populates="owner", cascade="all, delete-orphan")


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String, primary_key=True, default=generate_uuid)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, default="Untitled Meeting")
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    duration_seconds = Column(Integer, default=0)
    status = Column(String, default="processing")  # uploaded/processing/transcribing/analyzing/completed/failed
    file_path = Column(String, nullable=True)
    summary = Column(String, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="meetings")
