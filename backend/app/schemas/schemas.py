from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

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

class MeetingResponse(BaseModel):
    id: str
    title: str
    date: datetime
    duration: str  
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


class KeyPoint(BaseModel):
    title: str
    content: str
    timestamp: str | None


class DecisionInsight(BaseModel):
    decision: str
    timestamp: str | None


class ActionItemInsight(BaseModel):
    task: str
    owner: str | None
    deadline: str | None
    timestamp: str | None


class MeetingAnalysis(BaseModel):
    meeting_title: str
    executive_summary: str
    detailed_summary: str
    key_points: list[KeyPoint]
    decisions: list[DecisionInsight]
    action_items: list[ActionItemInsight]
    unresolved_issues: list[str]
    follow_ups: list[str]
    sentiment: Literal["positive", "neutral", "negative", "mixed"]
    sentiment_confidence: float = Field(ge=0, le=1)

    class Config:
        from_attributes = True


class MeetingQuestionRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2000)


class MeetingQuestionResponse(BaseModel):
    answer: str
    timestamp: str | None = None
    conversation_id: str
