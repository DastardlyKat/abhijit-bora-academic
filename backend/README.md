# Dr. Abhijit Bora — Academic Website API

Backend service powering the personal academic website of Dr. Abhijit Bora. It is a FastAPI application that manages his publication record (papers, book chapters, conference proceedings), serves watermarked PDF copies of those publications, handles contact-form submissions, exposes site statistics for the About page, and provides JWT-based admin authentication for content management.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [PDF Storage & Watermarking](#pdf-storage--watermarking)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [One-Time / Migration Scripts](#one-time--migration-scripts)
- [Deployment](#deployment)
- [Known Constraints & Design Notes](#known-constraints--design-notes)

---

## Overview

The API backs a public-facing academic profile site and a private admin panel for managing its content.

**Public capabilities**
- Browse and filter publications by category (Books, Peer-Reviewed, Reviewed, Conference Papers, Book Chapters) and scope (International, National, Regional)
- View a single publication's metadata
- Download a **watermarked** copy of a publication's PDF (the original, unwatermarked file is never exposed)
- Submit a contact-form message
- Read published site statistics (paper counts, PhD scholars supervised, fellowships, etc.)

**Admin capabilities** (JWT-protected)
- One-time bootstrap of the first admin account
- Full CRUD on publications, including PDF upload/replacement (each upload is automatically watermarked)
- View and triage contact-form submissions (list, view, mark as read, delete)
- Update site statistics

## Tech Stack

| Concern | Library |
|---|---|
| Web framework | [FastAPI](https://fastapi.tiangolo.com/) 0.115 |
| ASGI server | Uvicorn (standard extras) |
| ORM / DB toolkit | SQLAlchemy 2.0 |
| Database | PostgreSQL in production (`psycopg2-binary`), SQLite fallback for local dev |
| Validation / serialization | Pydantic v2 (with `email` extra) |
| Auth | `python-jose` (JWT), `bcrypt` (password hashing) |
| PDF manipulation | `pypdf` (merge), `reportlab` (watermark generation) |
| Object storage | `boto3` against Cloudflare R2's S3-compatible API |
| Config | `python-dotenv` |
| Containerization | Docker (`python:3.12-slim`) |

## Architecture

```
┌─────────────┐      HTTPS/JSON       ┌──────────────────────┐
│  Frontend    │ ───────────────────▶ │   FastAPI app (main.py)│
│ (Vite/React) │ ◀─────────────────── │                        │
└─────────────┘                       └──────────┬─────────────┘
                                                   │
                       ┌───────────────────────────┼───────────────────────────┐
                       ▼                            ▼                            ▼
                ┌──────────────┐          ┌──────────────────┐         ┌──────────────────┐
                │  routers/*    │          │   dependencies.py │         │    storage.py      │
                │ auth, papers, │          │  JWT create/verify│         │ local disk (dev) or │
                │ contact,      │          │  get_current_admin│         │ Cloudflare R2 (prod)│
                │ updates       │          └──────────────────┘         └──────────────────┘
                └───────┬───────┘
                        │ SQLAlchemy ORM
                        ▼
                ┌──────────────────┐
                │   database.py      │
                │ Postgres (prod) /   │
                │ SQLite (dev)         │
                └──────────────────┘
```

The app is a standard FastAPI project with routers split by resource. Cross-cutting concerns (DB session lifecycle, auth, file storage) are isolated into their own modules so routers stay focused on request/response handling.

## Project Structure

```
.
├── main.py                      # App entrypoint, CORS config, router registration
├── database.py                  # SQLAlchemy engine/session setup, DB URL resolution
├── models.py                    # ORM models: Paper, ContactSubmission, SiteStats, Admin
├── schemas.py                   # Pydantic request/response schemas
├── dependencies.py              # JWT creation/verification, get_current_admin dependency
├── storage.py                   # Storage abstraction (local disk vs. Cloudflare R2)
├── seed_papers.py                # One-time script: seeds the papers table from the legacy frontend dataset
├── watermark_existing_papers.py  # One-time migration: watermarks PDFs that were dropped in manually
├── routers/
│   ├── auth.py                  # /auth — admin bootstrap, login, token verification
│   ├── papers.py                 # /papers — publication CRUD, PDF upload & watermarked serving
│   ├── contact.py                # /contact — contact form submission & admin triage
│   └── updates.py                # /stats — site statistics (singleton row)
├── uploads/paper/                 # Local PDF storage (dev only; unused when R2 is configured)
├── requirements.txt
└── Dockerfile
```

## Data Model

### `Paper`
The central publication record. Designed around a two-axis classification (`category` × `scope`) rather than a single flat "type" field, to match how the frontend actually groups and displays publications.

| Field | Type | Notes |
|---|---|---|
| `id` | int | Primary key |
| `title` | str | Required |
| `journal` | str | Required — journal/publisher/venue name |
| `institute` | str? | Publishing institute |
| `co_author` | str? | |
| `volume` | str? | |
| `issn` / `isbn` | str? | |
| `venue` | str? | Used for conference papers |
| `year` | str | **Free text**, not an integer (e.g. `"January–June, 2023"`) |
| `category` | enum | `Books`, `Peer-Reviewed`, `Reviewed`, `Conference Papers`, `Book Chapters` |
| `scope` | enum? | `International`, `National`, `Regional` — nullable, since `Books` has no scope |
| `abstract` | text? | |
| `pdf_url` | str? | Internal storage key for the **original** (unwatermarked) PDF; never returned by the API directly (see below) |
| `created_at` | datetime | Server default |

The public API never exposes `pdf_url`. `PaperResponse` marks it `exclude=True` and instead computes a boolean `has_pdf` field, so a client can only ever reach a publication's PDF through the dedicated watermarked-download endpoint — it cannot reconstruct a direct link to the original file.

### `ContactSubmission`
Stores inbound messages from the site's contact form: `name`, `email`, `subject`, `message`, `is_read`, `created_at`.

### `SiteStats`
A **singleton** row (`id` is always `1`) holding the numbers shown on the About page: peer-reviewed/non-peer-reviewed paper counts, book chapters, authored books, ODL study materials, PhD scholars (awarded/ongoing), and a free-text fellowships field. Created lazily with zero defaults on first request if it doesn't exist.

### `Admin`
`username` (unique) + `hashed_password` (bcrypt). Only one admin is expected in practice — `/auth/setup` refuses to create a second account once one exists.

## API Reference

Interactive OpenAPI docs are auto-generated by FastAPI and served at `/docs` (Swagger UI) and `/redoc`.

### Auth — `/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/setup` | — | Create the first (and only) admin account. Fails with 400 if an admin already exists. |
| POST | `/auth/login` | — | Exchange credentials for a JWT bearer token (24 h expiry). |
| GET | `/auth/verify` | Bearer | Validate the current token. |

### Papers — `/papers`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/papers/` | — | List publications. Optional `?category=` and `?scope=` query filters. Ordered newest-first by `id`. |
| GET | `/papers/{id}` | — | Fetch a single publication's metadata. |
| GET | `/papers/{id}/pdf` | — | Stream the **watermarked** PDF inline (`Content-Disposition: inline`). 404 if the paper has no PDF or the file is missing from storage. |
| POST | `/papers/` | Bearer | Create a publication. `multipart/form-data` — metadata fields plus an optional `pdf_file`. If a PDF is supplied it is watermarked and stored automatically. |
| PATCH | `/papers/{id}` | Bearer | Partial update of publication metadata (JSON body). Does **not** accept a PDF — see below. |
| POST | `/papers/{id}/pdf` | Bearer | Attach or replace a publication's PDF. Deletes the old original + watermarked files first, then watermarks and stores the new upload. |
| DELETE | `/papers/{id}` | Bearer | Delete a publication and its associated PDF files (original + watermarked). |

### Contact — `/contact`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/contact/` | — | Submit a contact-form message. |
| GET | `/contact/` | Bearer | List all submissions, newest first. |
| GET | `/contact/{id}` | Bearer | Fetch a single submission. |
| PATCH | `/contact/{id}/read` | Bearer | Mark a submission as read. |
| DELETE | `/contact/{id}` | Bearer | Delete a submission. |

### Site Stats — `/stats`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/stats/` | — | Fetch current site statistics (creates the singleton row with zero defaults on first call). |
| PATCH | `/stats/` | Bearer | Partial update of site statistics. |

### Misc
| Method | Path | Description |
|---|---|---|
| GET | `/` | Basic service info (`message`, `version`, `docs` link). |
| GET | `/health` | Health check — returns `{"status": "healthy"}`. |

## PDF Storage & Watermarking

**Why PDFs are watermarked:** every publication's original file may be freely re-served, but the API is designed so the public can only ever obtain a stamped copy, never the original.

**Flow on upload** (`save_watermarked_upload` in `routers/papers.py`):
1. Validate the upload is a `.pdf` with `content_type == "application/pdf"`.
2. Generate a random `<uuid>.pdf` key for the original.
3. Run the bytes through `add_watermark()`, which draws a diagonal, semi-transparent, tiled text watermark (`"Dr. Abhijit Bora | abhijit.bora@tezpuruniversity.ac.in"`) across every page using ReportLab, sized and spaced dynamically from the actual text width (not a fixed grid, which previously produced unreadable overlap for longer strings) — then merges it onto each page of the source PDF with `pypdf`.
4. Store **both** the original (`<uuid>.pdf`) and the watermarked copy (`<uuid>_watermarked.pdf`) via the storage abstraction.
5. Only the original's key is persisted on `Paper.pdf_url`; the watermarked key is always derived from it at read/delete time (`.replace(".pdf", "_watermarked.pdf")`), so nothing extra needs to be stored in the database.

**Storage abstraction** (`storage.py`): a small `save` / `read` / `delete` interface with two backends, selected automatically based on environment configuration:
- **Local disk** (`uploads/paper/`) — used when no R2 credentials are set. Zero setup for local development.
- **Cloudflare R2** (S3-compatible, via `boto3`) — used in production. Deployment targets (Cloud Run, Render) are stateless/ephemeral, so PDFs written to local disk would be lost on every redeploy or instance restart; R2 was chosen over comparable object-storage options for its no-region-restriction free tier and zero egress fees, which matters for a site serving PDFs directly to the public.

## Authentication

- Passwords are hashed with `bcrypt` directly (not via `passlib`, whose version-detection breaks against modern `bcrypt` releases).
- On login, a JWT is issued with a 24-hour expiry, signed with `SECRET_KEY` using HS256, carrying the admin's username in the `sub` claim.
- `get_current_admin` (a FastAPI dependency) decodes and validates the bearer token on every protected route and loads the corresponding `Admin` row, raising `401` if the token is invalid, expired, or the admin no longer exists.
- Only one admin account is supported; `/auth/setup` is a one-time bootstrap endpoint.

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | No | `sqlite:///./app.db` | SQLAlchemy connection string. Set to a Postgres URL in production. |
| `SECRET_KEY` | Yes (for auth to work) | — | HMAC signing key for JWTs. |
| `PORT` | No | `8000` | Port Uvicorn binds to. Auto-populated by Render (`10000`) and Cloud Run (`8080`). |
| `R2_BUCKET_NAME` | No* | — | Cloudflare R2 bucket name. |
| `R2_ACCOUNT_ID` | No* | — | Cloudflare account ID (used to build the R2 endpoint URL). |
| `R2_ACCESS_KEY_ID` | No* | — | R2 S3-compatible access key. |
| `R2_SECRET_ACCESS_KEY` | No* | — | R2 S3-compatible secret key. |

\* All four `R2_*` variables must be set together to enable R2 storage; if any is missing, the app falls back to local-disk storage.

Create a `.env` file in the project root (loaded via `python-dotenv`) for local development:

```env
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=replace-with-a-long-random-string
# Optional — omit to use local disk storage:
# R2_BUCKET_NAME=
# R2_ACCOUNT_ID=
# R2_ACCESS_KEY_ID=
# R2_SECRET_ACCESS_KEY=
```

## Local Development

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env   # then edit SECRET_KEY, etc.

# 4. Run the server (auto-reload enabled locally)
python main.py
```

The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

**First-time setup:**
```bash
# Create the admin account
curl -X POST http://localhost:8000/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

**CORS:** allowed origins are hardcoded in `main.py` and currently include `localhost` (ports 3000/5173), `127.0.0.1:5173`, and the production frontend domains (`abhijitbora.com`, the Cloud Run URL, and the Cloudflare Pages URL). Update the `origins` list there when adding a new frontend deployment target.

## One-Time / Migration Scripts

Both scripts are idempotent and safe to re-run.

**`seed_papers.py`** — populates the `papers` table with Dr. Bora's full existing publication list (previously hardcoded in the frontend). Skips entirely if the table already has rows.
```bash
python seed_papers.py
```

**`watermark_existing_papers.py`** — a handful of PDFs were originally dropped directly into `uploads/paper/` with their original filenames, bypassing the upload/watermarking pipeline. This script matches those files (by filename prefix, since some referenced filenames were display-truncated) against paper titles already in the database, then copies, watermarks, and links each one via `Paper.pdf_url`. Run after `seed_papers.py`. Papers that already have a `pdf_url`, or files it can't match, are reported and skipped.
```bash
python watermark_existing_papers.py
```

## Deployment

The included `Dockerfile` builds a `python:3.12-slim` image, installs dependencies in a cached layer, copies the application, and runs `python main.py`.

```bash
docker build -t academic-api .
docker run -p 8080:8080 --env-file .env academic-api
```

`main.py` reads `PORT` from the environment and detects a hosted environment via `K_SERVICE` (Cloud Run) or `RENDER` — in both cases Uvicorn's `reload` is disabled, since the host already rebuilds the container on every deploy. The same code runs unmodified on Cloud Run (`PORT=8080`), Render (`PORT=10000`), and locally (`PORT=8000`).

For persistent PDF storage in any stateless/ephemeral hosting environment, the R2 environment variables **must** be set — otherwise uploaded PDFs will be lost on every redeploy or instance restart.

## Known Constraints & Design Notes

- **`year` is a string, not an integer** — publication years in the real dataset include ranges and month spans (e.g. `"January–June, 2023"`), which a plain integer column can't represent.
- **`scope` is nullable** — `Books` are classified by `category` alone; every other category also carries a `scope`.
- **The original PDF is never served directly** — only `/papers/{id}/pdf` (watermarked) is public; `pdf_url` is excluded from all API responses.
- **`SiteStats` is a singleton** — always operate on `id=1`; there is no support for multiple stats rows.
- **Single-admin model** — `/auth/setup` only succeeds once; there's no multi-admin or role system.
- **No automated test suite or database migration tool (e.g. Alembic)** is currently included — schema changes are applied via `Base.metadata.create_all`, which only adds new tables/columns, not incremental migrations.
