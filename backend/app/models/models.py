import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Text, Index, Float
from sqlalchemy.orm import relationship

from app.core.config import settings
from app.core.database import Base

try:
    from pgvector.sqlalchemy import Vector
except ImportError:
    Vector = None


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


embedding_type = Vector(384) if Vector and settings.database_url.startswith("postgresql") else JSON


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="analyst", nullable=False)
    created_at = Column(DateTime, default=utc_now)
    meetings = relationship("Meeting", back_populates="owner", cascade="all, delete-orphan")


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String, primary_key=True, default=generate_uuid)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, default="Untitled Meeting")
    date = Column(DateTime, default=utc_now)
    duration_seconds = Column(Integer, default=0)
    status = Column(String, default="processing", index=True)
    file_path = Column(String, nullable=True)
    summary = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now, index=True)
    owner = relationship("User", back_populates="meetings")
    files = relationship("MeetingFile", back_populates="meeting", cascade="all, delete-orphan")
    participants = relationship("Participant", back_populates="meeting", cascade="all, delete-orphan")
    speakers = relationship("Speaker", back_populates="meeting", cascade="all, delete-orphan")
    transcript = relationship("Transcript", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
    decisions = relationship("Decision", back_populates="meeting", cascade="all, delete-orphan")
    deadlines = relationship("Deadline", back_populates="meeting", cascade="all, delete-orphan")
    follow_ups = relationship("FollowUp", back_populates="meeting", cascade="all, delete-orphan")
    ai_conversations = relationship("AIConversation", back_populates="meeting", cascade="all, delete-orphan")


class MeetingFile(Base):
    __tablename__ = "files"
    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    path = Column(String, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    meeting = relationship("Meeting", back_populates="files")


class Participant(Base):
    __tablename__ = "participants"
    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    meeting = relationship("Meeting", back_populates="participants")


class Speaker(Base):
    __tablename__ = "speakers"
    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False, index=True)
    label = Column(String, nullable=False)
    meeting = relationship("Meeting", back_populates="speakers")


class Transcript(Base):
    __tablename__ = "transcripts"
    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=utc_now)
    meeting = relationship("Meeting", back_populates="transcript")
    segments = relationship("TranscriptSegment", back_populates="transcript", cascade="all, delete-orphan")


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"
    id = Column(String, primary_key=True, default=generate_uuid)
    transcript_id = Column(String, ForeignKey("transcripts.id"), nullable=False, index=True)
    speaker = Column(String, nullable=False)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    text = Column(Text, nullable=False)
    embedding = Column(embedding_type, nullable=True)
    transcript = relationship("Transcript", back_populates="segments")
    __table_args__ = (Index("ix_transcript_segments_text", "text"),)


class ActionItem(Base):
    __tablename__ = "action_items"
    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False, index=True)
    task = Column(Text, nullable=False)
    owner = Column(String, nullable=True)
    deadline = Column(String, nullable=True)
    timestamp = Column(String, nullable=True)
    meeting = relationship("Meeting", back_populates="action_items")


class Decision(Base):
    __tablename__ = "decisions"
    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False, index=True)
    decision = Column(Text, nullable=False)
    timestamp = Column(String, nullable=True)
    meeting = relationship("Meeting", back_populates="decisions")


class Deadline(Base):
    __tablename__ = "deadlines"
    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    due_date = Column(String, nullable=True)
    timestamp = Column(String, nullable=True)
    meeting = relationship("Meeting", back_populates="deadlines")


class FollowUp(Base):
    __tablename__ = "follow_ups"
    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    meeting = relationship("Meeting", back_populates="follow_ups")


class AIConversation(Base):
    __tablename__ = "ai_conversations"
    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    timestamp = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now, index=True)
    meeting = relationship("Meeting", back_populates="ai_conversations")
