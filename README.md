# AI Meeting Intelligence — Backend 

FastAPI backend providing authentication, meeting management, file
upload, and background processing trigger points for the AI Meeting
Intelligence System.

## Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL 16 (SQLAlchemy ORM)
- **Auth:** JWT (python-jose), bcrypt password hashing
- **Background processing:** FastAPI `BackgroundTasks` (in-process; no Celery/Redis for this MVP)
- **Media inspection:** ffprobe (part of ffmpeg) for duration extraction

## Prerequisites

- Python 3.11+
- PostgreSQL 16 installed and running locally
- ffmpeg installed and on your system `PATH` (needed for duration extraction; Member 3 also depends on this)

## Setup

### 1. Create the database

Using pgAdmin 4 or `psql`, create a database:

```sql
CREATE DATABASE meeting_intelligence;
```

### 2. Install dependencies

```bash
cd backend
python -m venv venv
venv\Scripts\activate        
source venv/bin/activate     
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in real values:

```env
JWT_SECRET=replace-with-a-long-random-string
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/meeting_intelligence
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=500
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4o-mini
```

Replace `YOUR_PASSWORD` with the password you set during PostgreSQL
installation. `.env` is gitignored — never commit it.

### 4. Run the server

```bash
uvicorn app.main:app --reload --port 3001
```

On startup, SQLAlchemy creates all tables (`users`, `meetings`) in the
configured Postgres database automatically. No manual migration step
exists yet — see **Known Limitations** below.

Interactive API docs: `http://localhost:3001/docs`

## API Endpoints (Member 2 scope)

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a user, returns JWT |
| POST | `/api/auth/login` | Authenticate, returns JWT |
| GET | `/api/auth/me` | Return the current authenticated user's profile |
| POST | `/api/meetings` | Create a meeting |
| GET | `/api/meetings` | List the current user's meetings |
| GET | `/api/meetings/{id}` | Get one meeting (404 if it belongs to another user) |
| DELETE | `/api/meetings/{id}` | Delete a meeting |
| POST | `/api/meetings/{id}/upload` | Upload an audio/video file, triggers background processing |
| GET | `/api/meetings/{id}/status` | Poll processing status |
| GET | `/api/meetings/{id}/transcript` | Get timestamped speaker transcript |
| GET | `/api/meetings/{id}/analysis` | Get structured AI meeting analysis |

The analysis endpoint returns the title, executive and detailed summaries,
key points, timestamped decisions, action items with normalized deadlines,
unresolved issues, follow-ups, and sentiment. The LLM stage uses the meeting
date when converting relative deadlines. Without `OPENAI_API_KEY`, local runs
store a minimal fallback report instead of failing after transcription.

## What Is Actually Verified

Everything below was tested against a real running server (not just
read from the code) using both Swagger UI (`/docs`) and the real
Next.js frontend at `localhost:3000`:

- Register / login, correct and incorrect password
- JWT issued and validated on protected routes
- Meeting create / list / get / delete
- **User isolation**: registered two separate users, created a meeting
  as User A, confirmed User B receives `404 Meeting not found` when
  requesting User A's meeting by ID (not a 403 — the meeting's
  existence is not leaked to unauthorized users either)
- **File upload validation**: uploading a `.exe` file is rejected with
  `400 Bad Request` and a clear message listing allowed extensions
  (`.mp3, .wav, .m4a, .mp4, .mov, .webm`)
- **Background processing**: after upload, meeting status
  automatically progresses `processing → transcribing → completed`
  with no manual intervention
- **Duration extraction**: uploaded a real audio file, confirmed the
  correct duration (in `MM:SS`) was written to the database via
  ffprobe
- **Full frontend integration**: registered a real user through the
  actual Next.js UI (not mock data), uploaded two real recordings,
  watched the dashboard update from 0 → 2 meetings with real
  "COMPLETED" statuses

## Known Limitations (stated plainly, not hidden)

- **Oversized file rejection is implemented but not live-tested.** The
  code path (`upload.py`, chunked write with a running size check
  against `MAX_UPLOAD_SIZE_MB`) was reviewed and is structurally sound,
  but no file larger than the 500MB default limit was actually
  uploaded to confirm the rejection fires as expected in this
  environment.
- **`duration_seconds` and processing fields are only populated by a
  placeholder pipeline.** `run_processing_pipeline()` in
  `app/services/processing.py` currently sets status and duration but
  does not call any real transcription, analysis, or indexing logic —
  those are Members 3/4/5's services, not yet wired in.
- **No database migrations.** Tables are created via
  `Base.metadata.create_all()` on startup. There is no Alembic (or
  equivalent) migration history, so schema changes made by other
  members (e.g. Member 5 adding tables for transcripts/decisions) rely
  on manual coordination, not versioned migrations.
- **No automated test suite.** All verification described above was
  done manually through Swagger UI and the live frontend. There is no
  `pytest` coverage in `backend/tests/` yet.
- **`GET /api/auth/me` does not return anything beyond the JWT
  subject's basic identity fields** — it was added specifically
  because the frontend's auth flow required a way to fetch the
  logged-in user's profile after login/register, since the JWT itself
  only carries a user ID.
- **CORS is currently scoped to `http://localhost:3000` only.** If the
  frontend is deployed or run on a different origin, `app/main.py`
  needs that origin added explicitly.

## Project Structure

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── auth.py       # register, login, me
│   │   ├── meetings.py   # CRUD
│   │   ├── upload.py     # file upload + validation + background trigger
│   │   ├── analysis.py   # structured AI analysis retrieval
│   │   └── status.py     # processing status
│   ├── core/
│   │   ├── config.py     # env var loading (python-dotenv)
│   │   ├── database.py   # SQLAlchemy engine/session (Postgres via DATABASE_URL)
│   │   ├── deps.py        # get_current_user dependency
│   │   └── security.py   # JWT + password hashing
│   ├── models/
│   │   └── models.py      # User, Meeting ORM models
│   ├── schemas/
│   │   └── schemas.py     # Pydantic request/response models
│   └── services/
│       ├── analysis.py   # LLM prompt and structured response parsing
│       └── processing.py # background pipeline entry point + ffprobe duration
├── requirements.txt
├── .env.example
└── README.md               # this file
```
