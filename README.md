# 🎙️ AI Meeting Intelligence — Backend

A production-oriented **FastAPI backend** for the AI Meeting Intelligence System. The backend provides secure authentication, meeting management, media uploads, processing-status tracking, transcript and AI-analysis endpoints, and the foundation for asynchronous meeting-processing workflows.

> **Project Status:** MVP / Active Development
> **Backend Port:** `3001`
> **Frontend:** Next.js on `3000`

---

## 📌 Overview

**AI Meeting Intelligence** is designed to transform recorded meetings into structured, actionable insights.

The backend handles the core application workflow:

```text
User
 │
 ▼
Authentication ──► JWT
 │
 ▼
Create Meeting
 │
 ▼
Upload Recording
 │
 ▼
Background Processing
 │
 ├──► Media Inspection
 ├──► Transcription
 ├──► AI Analysis
 └──► Meeting Insights
 │
 ▼
Dashboard / Meeting Details
```

The current MVP provides the backend infrastructure required for authentication, meeting management, file handling, processing-status tracking, and AI-analysis retrieval.

---

# ✨ Features

### 🔐 Authentication & Authorization

* User registration
* User login
* JWT-based authentication
* Secure password hashing with bcrypt
* Protected API routes
* Current-user profile endpoint
* User-level data isolation

### 📅 Meeting Management

* Create meetings
* List authenticated user's meetings
* Retrieve individual meetings
* Delete meetings
* Prevent users from accessing other users' meetings

### 🎥 Media Upload

* Upload audio and video recordings
* Supported formats:

  * `.mp3`
  * `.wav`
  * `.m4a`
  * `.mp4`
  * `.mov`
  * `.webm`
* File-extension validation
* Configurable maximum upload size
* Chunked file writing
* Automatic processing trigger after upload

### ⚙️ Background Processing

The MVP uses FastAPI `BackgroundTasks` for in-process processing.

Current processing lifecycle:

```text
processing
    ↓
transcribing
    ↓
completed
```

The architecture is prepared for integration with the actual transcription and AI-analysis services.

### ⏱️ Media Duration Extraction

* Uses `ffprobe` from FFmpeg
* Extracts recording duration
* Stores duration in the database

### 🤖 AI Analysis

The analysis layer is designed to provide structured meeting intelligence, including:

* Meeting title
* Executive summary
* Detailed summary
* Key points
* Timestamped decisions
* Action items
* Normalized deadlines
* Unresolved issues
* Follow-ups
* Sentiment

Relative deadlines can be normalized using the meeting date.

### 📚 API Documentation

Interactive API documentation is automatically generated through FastAPI:

* Swagger UI: `http://localhost:3001/docs`
* ReDoc: `http://localhost:3001/redoc`

---

# 🛠️ Tech Stack

| Component             | Technology              |
| --------------------- | ----------------------- |
| Backend Framework     | FastAPI                 |
| Programming Language  | Python 3.11+            |
| Database              | PostgreSQL 16           |
| ORM                   | SQLAlchemy              |
| Authentication        | JWT                     |
| Password Hashing      | bcrypt                  |
| JWT Library           | python-jose             |
| Background Processing | FastAPI BackgroundTasks |
| Media Inspection      | FFmpeg / ffprobe        |
| AI / LLM              | OpenAI API              |
| Configuration         | python-dotenv           |
| API Documentation     | Swagger / OpenAPI       |

---

# 📋 Prerequisites

Before running the backend locally, make sure you have:

* **Python 3.11+**
* **PostgreSQL 16**
* **FFmpeg**
* **Git**
* An OpenAI API key if you want to use the LLM analysis stage

Verify Python:

```bash
python --version
```

Verify PostgreSQL:

```bash
psql --version
```

Verify FFmpeg:

```bash
ffprobe -version
```

---

# 🚀 Installation & Setup

## 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_NAME>
```

Navigate to the backend:

```bash
cd backend
```

---

## 2. Create a Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

After activation, your terminal should show something similar to:

```text
(venv)
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 🗄️ Database Setup

The application uses **PostgreSQL 16**.

Create the database using pgAdmin 4 or `psql`.

### Using SQL

```sql
CREATE DATABASE meeting_intelligence;
```

Verify that the database exists:

```sql
\l
```

The application will automatically create the current SQLAlchemy tables when the server starts.

---

# 🔑 Environment Configuration

Create a `.env` file inside the `backend` directory.

You can start from `.env.example`:

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Then configure the variables:

```env
JWT_SECRET=replace-with-a-long-random-string

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/meeting_intelligence

UPLOAD_DIR=./uploads

MAX_UPLOAD_SIZE_MB=500

OPENAI_API_KEY=your-api-key

OPENAI_MODEL=gpt-4o-mini
```

### Environment Variables

| Variable             | Description                                    |
| -------------------- | ---------------------------------------------- |
| `JWT_SECRET`         | Secret used to sign JWT tokens                 |
| `DATABASE_URL`       | PostgreSQL connection string                   |
| `UPLOAD_DIR`         | Directory where uploaded recordings are stored |
| `MAX_UPLOAD_SIZE_MB` | Maximum allowed upload size                    |
| `OPENAI_API_KEY`     | OpenAI API key                                 |
| `OPENAI_MODEL`       | LLM model used for analysis                    |

> ⚠️ **Important:** Never commit `.env` or API keys to GitHub.

Make sure `.env` is included in `.gitignore`.

---

# ▶️ Running the Backend

Start the FastAPI development server:

```bash
uvicorn app.main:app --reload --port 3001
```

If everything is configured correctly, the server will be available at:

```text
http://localhost:3001
```

Open the interactive API documentation:

```text
http://localhost:3001/docs
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint             | Description                      | Auth |
| ------ | -------------------- | -------------------------------- | ---- |
| `POST` | `/api/auth/register` | Register a new user              | ❌    |
| `POST` | `/api/auth/login`    | Authenticate user and return JWT | ❌    |
| `GET`  | `/api/auth/me`       | Get current authenticated user   | ✅    |

---

## Meetings

| Method   | Endpoint             | Description            | Auth |
| -------- | -------------------- | ---------------------- | ---- |
| `POST`   | `/api/meetings`      | Create a meeting       | ✅    |
| `GET`    | `/api/meetings`      | List user's meetings   | ✅    |
| `GET`    | `/api/meetings/{id}` | Get a specific meeting | ✅    |
| `DELETE` | `/api/meetings/{id}` | Delete a meeting       | ✅    |

---

## Upload & Processing

| Method | Endpoint                    | Description              | Auth |
| ------ | --------------------------- | ------------------------ | ---- |
| `POST` | `/api/meetings/{id}/upload` | Upload meeting recording | ✅    |
| `GET`  | `/api/meetings/{id}/status` | Get processing status    | ✅    |

---

## Meeting Intelligence

| Method | Endpoint                        | Description                        | Auth |
| ------ | ------------------------------- | ---------------------------------- | ---- |
| `GET`  | `/api/meetings/{id}/transcript` | Get timestamped speaker transcript | ✅    |
| `GET`  | `/api/meetings/{id}/analysis`   | Get structured AI meeting analysis | ✅    |

---

# 🔄 Meeting Processing Workflow

After a recording is uploaded, the backend triggers the processing pipeline.

```text
Upload Recording
      │
      ▼
Validate File
      │
      ▼
Save Recording
      │
      ▼
Extract Duration
      │
      ▼
Start Background Task
      │
      ▼
Processing
      │
      ▼
Transcribing
      │
      ▼
Completed
```

The processing architecture is intentionally separated into services so that future transcription, speaker identification, AI analysis, and indexing components can be integrated without redesigning the API layer.

---

# 🧠 AI Analysis

The AI analysis service is designed to convert meeting transcripts into structured information.

Expected output includes:

```text
Meeting Title
        │
        ├── Executive Summary
        ├── Detailed Summary
        ├── Key Points
        ├── Decisions
        ├── Action Items
        ├── Deadlines
        ├── Unresolved Issues
        ├── Follow-ups
        └── Sentiment
```

When an `OPENAI_API_KEY` is not configured, the application can store a minimal fallback report instead of failing after transcription.

---

# 🔒 Security

The backend implements several security measures:

* JWT authentication
* Password hashing using bcrypt
* Protected API endpoints
* User-specific meeting ownership
* Unauthorized meeting access returns `404`
* File-extension validation
* Configurable upload-size limit
* Environment-based secret configuration
* `.env` excluded from source control

### User Isolation

Meeting resources are scoped to the authenticated user.

For example:

```text
User A
 └── Meeting #1

User B
 └── Cannot access Meeting #1
```

If User B requests User A's meeting, the API returns:

```text
404 Meeting not found
```

This prevents unauthorized users from learning whether another user's meeting exists.

---

# 🧪 Verification & Testing

The current MVP has been manually tested against a real running backend using:

* FastAPI Swagger UI
* Real Next.js frontend
* PostgreSQL database
* Real audio recordings

### Verified Functionality

| Feature                       | Status     |
| ----------------------------- | ---------- |
| User registration             | ✅ Verified |
| User login                    | ✅ Verified |
| Incorrect password handling   | ✅ Verified |
| JWT authentication            | ✅ Verified |
| Current-user endpoint         | ✅ Verified |
| Meeting creation              | ✅ Verified |
| Meeting listing               | ✅ Verified |
| Meeting retrieval             | ✅ Verified |
| Meeting deletion              | ✅ Verified |
| User isolation                | ✅ Verified |
| File-extension validation     | ✅ Verified |
| Background processing         | ✅ Verified |
| Processing status transitions | ✅ Verified |
| FFprobe duration extraction   | ✅ Verified |
| Frontend/backend integration  | ✅ Verified |
| Real recording upload         | ✅ Verified |

### Frontend Integration

The backend was also tested through the actual Next.js frontend.

The integration successfully demonstrated:

```text
0 Meetings
     ↓
Upload Recording
     ↓
Backend Processing
     ↓
Dashboard Refresh
     ↓
2 Meetings
     ↓
COMPLETED
```

---

# ⚠️ Known Limitations

The following limitations are intentionally documented.

### 1. Oversized Upload Testing

The application implements a maximum upload-size check using `MAX_UPLOAD_SIZE_MB`.

However, the default **500 MB rejection path has not been live-tested with an actual file larger than the limit**.

The implementation was reviewed and the chunked-write size-check logic is in place.

---

### 2. Processing Pipeline Placeholder

The current `run_processing_pipeline()` implementation is a placeholder.

It currently handles:

* Processing status updates
* Duration extraction

The actual:

* Speech-to-text
* Speaker identification
* Meeting analysis
* Transcript storage
* Indexing

are planned integrations for the remaining system components.

---

### 3. No Database Migration System Yet

The current application uses:

```python
Base.metadata.create_all()
```

to create database tables during startup.

There is currently no:

* Alembic
* Migration history
* Versioned schema migration

As the database schema evolves, introducing **Alembic migrations** is recommended.

---

### 4. No Automated Test Suite Yet

Current verification has been performed manually using Swagger UI and the real frontend.

Automated `pytest` coverage has not yet been added.

Recommended future test coverage includes:

```text
Authentication Tests
Meeting CRUD Tests
Authorization Tests
Upload Tests
Processing Tests
Analysis Tests
Database Tests
API Integration Tests
```

---

### 5. Limited `/api/auth/me` Response

The `/api/auth/me` endpoint currently returns the basic identity information associated with the JWT subject.

It was added to support the frontend authentication flow after login and registration.

---

### 6. Localhost-only CORS

CORS is currently configured for:

```text
http://localhost:3000
```

When deploying the frontend, the production frontend origin must be added to the CORS configuration.

---

# 📁 Project Structure

```text
backend/
│
├── app/
│   │
│   ├── main.py
│   │
│   ├── api/
│   │   ├── auth.py
│   │   ├── meetings.py
│   │   ├── upload.py
│   │   ├── analysis.py
│   │   └── status.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── deps.py
│   │   └── security.py
│   │
│   ├── models/
│   │   └── models.py
│   │
│   ├── schemas/
│   │   └── schemas.py
│   │
│   └── services/
│       ├── analysis.py
│       └── processing.py
│
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

# 🧩 Architecture

The backend follows a layered architecture:

```text
                    ┌──────────────────────┐
                    │     Next.js UI       │
                    │    localhost:3000    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     FastAPI API      │
                    │    localhost:3001    │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        Authentication     Meetings        Upload/Status
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Services        │
                    │ Processing / Analysis│
                    └──────────┬───────────┘
                               │
                  ┌────────────┴────────────┐
                  ▼                         ▼
          PostgreSQL 16                 FFmpeg
                                           │
                                           ▼
                                    Media Processing
```

---

# 🔮 Roadmap

The backend is structured to support the next stages of the AI Meeting Intelligence System.

### Phase 1 — Core Backend

* [x] FastAPI application
* [x] PostgreSQL integration
* [x] JWT authentication
* [x] Meeting CRUD
* [x] File upload
* [x] Processing status
* [x] Duration extraction
* [x] Frontend integration

### Phase 2 — AI Processing

* [ ] Production speech-to-text
* [ ] Speaker identification
* [ ] Timestamped transcript generation
* [ ] Transcript persistence
* [ ] AI meeting analysis
* [ ] Decision extraction
* [ ] Action-item extraction
* [ ] Deadline normalization
* [ ] Sentiment analysis

### Phase 3 — Production Backend

* [ ] Alembic migrations
* [ ] Automated pytest suite
* [ ] Redis/Celery or another durable job queue
* [ ] Object storage for recordings
* [ ] Better upload/resume handling
* [ ] Rate limiting
* [ ] Production CORS configuration
* [ ] Structured logging
* [ ] Error monitoring
* [ ] API versioning

### Phase 4 — Advanced Intelligence

* [ ] Semantic search across meetings
* [ ] Meeting-to-meeting comparison
* [ ] Speaker analytics
* [ ] Organization/workspace support
* [ ] Calendar integration
* [ ] Email/Slack notifications
* [ ] Follow-up reminders
* [ ] AI-generated meeting highlights

---

# 🚀 Production Considerations

Before deploying this MVP to production, the following improvements are recommended:

1. Replace in-process `BackgroundTasks` with a durable job queue.
2. Add Alembic for database migrations.
3. Add automated unit and integration tests.
4. Move uploaded recordings to object storage.
5. Add proper logging and monitoring.
6. Configure production CORS.
7. Add API rate limiting.
8. Secure and rotate JWT secrets.
9. Add validation for uploaded media beyond file extensions.
10. Add retry and failure handling for AI/transcription jobs.

---

# 🤝 Team Integration

The backend is designed to allow multiple team members to work independently on different AI pipeline components.

Potential service boundaries include:

```text
Member 1
└── Frontend

Member 2
└── FastAPI Backend
    ├── Auth
    ├── Meetings
    ├── Upload
    └── Processing Trigger

Member 3
└── Speech-to-Text
    ├── Audio Extraction
    └── Transcription

Member 4
└── Speaker Identification
    └── Diarization

Member 5
└── AI Meeting Analysis
    ├── Summaries
    ├── Decisions
    ├── Action Items
    └── Sentiment
```

This separation allows AI services to be integrated into the existing processing pipeline without changing the core authentication and meeting-management APIs.

---

# 📄 License

This project is currently under development.

Add your project's license information here when the final repository license is decided.

---

# 👩‍💻 Development

For development issues, implementation questions, or integration problems, refer to the API documentation available at:

```text
http://localhost:3001/docs
```

---

## ⭐ Project Status

**AI Meeting Intelligence Backend — MVP**

The core backend infrastructure, authentication, meeting management, upload workflow, processing-status system, media-duration extraction, and frontend integration are implemented and manually verified.

The next major milestone is integrating the **real transcription, speaker identification, and AI meeting-analysis pipeline**.
