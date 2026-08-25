"""
FastAPI application entry point.

Run with:
    uvicorn app.main:app --reload --port 3001

The frontend expects the API at http://localhost:3001/api by default
(see shared/lib/api-client.ts), so all routers are mounted under /api.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.api import auth, meetings, upload, status

app = FastAPI(title="AI Meeting Intelligence API")

# Allow the local Next.js dev server to call this API during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(meetings.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(status.router, prefix="/api")


@app.on_event("startup")
def create_tables() -> None:
    # Creates tables if they do not exist yet. For a real production
    # deployment this would be replaced by proper Alembic migrations.
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
