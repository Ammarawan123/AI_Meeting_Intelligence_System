"""
Request/response schemas.

Field names mirror the frontend's types/index.ts exactly, so the
frontend can consume these responses with no field-mapping needed.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: Literal["admin", "analyst"]

    class Config:
        from_attributes = True


# ---------- Meetings ----------

class MeetingResponse(BaseModel):
    id: str
    title: str
    date: datetime
    duration: str  # formatted, e.g. "45:32"
    status: Literal["completed", "processing", "failed"]
    participants: list[str] = []
    summary: str = ""

    class Config:
        from_attributes = True


class MeetingStatusResponse(BaseModel):
    status: Literal["uploaded", "processing", "transcribing", "analyzing", "completed", "failed"]
    updatedAt: datetime


class CreateMeetingRequest(BaseModel):
    title: str = "Untitled Meeting"
