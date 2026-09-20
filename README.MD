# Dr. Abhijit Bora — Academic Website

A full-stack academic website and digital publication platform for **Dr. Abhijit Bora**, designed to present his academic profile, research interests, publications, articles, professional activities, and scholarly work in a modern, responsive interface.

The project combines a **React + TypeScript frontend** with a **FastAPI backend**, providing dynamic publication management, administrator authentication, contact submissions, site statistics, and PDF publication handling with watermarking.

---

## ✨ Features

### Academic Website
- Personal academic profile and biography
- Research interests and academic focus
- Publications and research papers
- Books and book chapters
- Conference papers
- Articles and academic work
- Academic statistics and achievements
- Contact form
- Responsive design for desktop and mobile

### Publication Management
- Dynamic publication database
- Categorisation of publications:
  - Peer-Reviewed
  - Reviewed
  - Conference Papers
  - Book Chapters
  - Books
- Publication scope:
  - International
  - National
  - Regional
- Publication metadata including:
  - Title
  - Journal / publication
  - Institute
  - Co-authors
  - Volume
  - ISSN
  - ISBN
  - Venue
  - Publication year
  - Abstract

### Admin System
- Secure administrator authentication
- JWT-based authentication
- Password hashing using bcrypt
- Protected administrative endpoints
- Create, update and delete publications
- Upload and replace publication PDFs
- Manage academic statistics
- View and manage contact-form submissions

### PDF Management
- PDF upload through the admin API
- Automatic PDF watermarking
- Watermarked PDFs served directly through the API
- Original PDF files are not exposed through public API responses
- Local filesystem storage for development
- Cloudflare R2-compatible object storage for production

### Backend
- REST API built with FastAPI
- SQLAlchemy ORM
- SQLite support for local development
- PostgreSQL support through `DATABASE_URL`
- CORS configuration
- Automatic API documentation through FastAPI / Swagger UI
- Health-check endpoint

---

## 🛠️ Technology Stack

### Frontend

- **React 19**
- **TypeScript**
- **Vite**
- **React Router**
- CSS

### Backend

- **Python**
- **FastAPI**
- **Uvicorn**
- **SQLAlchemy**
- **Pydantic**
- **JWT**
- **bcrypt**
- **python-multipart**
- **pypdf**
- **ReportLab**

### Database & Storage

- **SQLite** — local development
- **PostgreSQL** — production option
- **Cloudflare R2** — production PDF/object storage

---

## 📁 Project Structure

```text
abhijit-bora-academic/
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── papers.ts
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Research.tsx
│   │   │   └── Contact.tsx
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   │
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── ...
│
├── backend/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── papers.py
│   │   ├── contact.py
│   │   └── updates.py
│   │
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── dependencies.py
│   ├── storage.py
│   ├── seed_papers.py
│   ├── watermark_existing_papers.py
│   ├── requirements.txt
│   └── Dockerfile
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Python 3.10+
- pip
- Git

---

# Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

### Production Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

# Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate it on macOS/Linux:

```bash
source venv/bin/activate
```

On Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## ⚙️ Backend Environment Variables

Create:

```text
backend/.env
```

A basic local configuration can contain:

```env
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///./app.db
```

For production, use a strong randomly generated `SECRET_KEY`.

### PostgreSQL

The backend can use PostgreSQL by changing `DATABASE_URL`:

```env
DATABASE_URL=postgresql://username:password@host:5432/database
```

---

## 🗄️ Database

The backend automatically creates the required SQLAlchemy tables when the application starts.

The main database entities are:

- `papers`
- `contact_submissions`
- `site_stats`
- `admins`

For local development, the application falls back to:

```text
sqlite:///./app.db
```

For production, PostgreSQL is recommended.

---

# ▶️ Running the Backend

From the `backend` directory:

```bash
python main.py
```

The API will normally run at:

```text
http://localhost:8000
```

Alternatively:

```bash
uvicorn main:app --reload
```

---

## 📚 API Documentation

FastAPI automatically provides interactive API documentation.

Once the backend is running:

```text
http://localhost:8000/docs
```

Alternative ReDoc documentation:

```text
http://localhost:8000/redoc
```

---

# 🔌 API Overview

### Authentication

```text
POST /auth/setup
POST /auth/login
GET  /auth/verify
```

### Publications

```text
GET    /papers/
GET    /papers/{paper_id}
GET    /papers/{paper_id}/pdf

POST   /papers/
PATCH  /papers/{paper_id}
POST   /papers/{paper_id}/pdf
DELETE /papers/{paper_id}
```

Publication creation, modification, deletion, and PDF uploads require administrator authentication.

### Site Statistics

```text
GET   /stats/
PATCH /stats/
```

### Contact

```text
POST   /contact/
GET    /contact/
GET    /contact/{submission_id}
PATCH  /contact/{submission_id}/read
DELETE /contact/{submission_id}
```

The administrative contact endpoints require authentication.

### Health

```text
GET /health
```

Returns:

```json
{
  "status": "healthy"
}
```

---

# 🔐 Authentication

Administrative operations use **JWT bearer authentication**.

The first administrator can be created using:

```http
POST /auth/setup
```

with:

```json
{
  "username": "admin",
  "password": "your-password"
}
```

After logging in through:

```http
POST /auth/login
```

the API returns an access token.

Protected requests use:

```http
Authorization: Bearer <access_token>
```

Passwords are stored as bcrypt hashes rather than plaintext.

---

# 📄 Publication PDF Handling

When an administrator uploads a publication PDF, the backend processes the document before making it available publicly.

The workflow is:

```text
PDF Upload
    │
    ▼
Validate PDF
    │
    ▼
Generate Watermarked Copy
    │
    ▼
Store Original + Watermarked Files
    │
    ▼
Save Publication Metadata
    │
    ▼
Public API serves Watermarked PDF
```

The public API does not expose the underlying storage path of the original PDF.

---

# ☁️ Production Storage

For local development, uploaded PDFs are stored under:

```text
backend/uploads/paper/
```

For production deployments using stateless containers, the backend can use **Cloudflare R2** through its S3-compatible API.

Configure:

```env
R2_BUCKET_NAME=your-bucket
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
```

When these variables are present, the storage layer automatically switches from local filesystem storage to R2.

---

# 🌐 Frontend ↔ Backend Configuration

The frontend reads the backend URL from:

```env
VITE_API_BASE_URL
```

For local development:

```env
VITE_API_BASE_URL=http://localhost:8000
```

For production:

```env
VITE_API_BASE_URL=https://api.example.com
```

The backend also includes CORS configuration for local development and the production website.

---

# 🐳 Docker

The backend includes a Dockerfile for containerised deployment.

Build the image:

```bash
docker build -t abhijit-bora-api ./backend
```

Run it:

```bash
docker run -p 8000:8000 abhijit-bora-api
```

Production deployments should provide environment variables through the hosting platform rather than committing them to the repository.

---

# 🧩 Architecture

The application follows a simple full-stack architecture:

```text
                  ┌─────────────────────┐
                  │      Visitor        │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  React + TypeScript │
                  │      Frontend       │
                  └──────────┬──────────┘
                             │ REST API
                             ▼
                  ┌─────────────────────┐
                  │       FastAPI       │
                  │       Backend       │
                  └──────┬──────┬───────┘
                         │      │
                ┌────────┘      └─────────┐
                ▼                         ▼
        ┌───────────────┐         ┌──────────────┐
        │  PostgreSQL / │         │ Cloudflare R2 │
        │     SQLite    │         │  PDF Storage  │
        └───────────────┘         └──────────────┘
```

---

# 🎓 Purpose

The website serves as a central digital academic presence for **Dr. Abhijit Bora**, bringing together:

- Academic biography
- Research interests
- Publications
- Scholarly articles
- Books and chapters
- Academic achievements
- Research statistics
- Contact information
- Digital copies of selected publications

The platform is designed so that academic content can be maintained through the backend rather than requiring frontend code changes for every publication update.

---

# 🔒 Security Notes

Before deploying this project publicly:

- Never commit `.env` files.
- Never commit database credentials.
- Never commit API keys or storage credentials.
- Use a strong production `SECRET_KEY`.
- Do not commit local virtual environments.
- Do not commit `node_modules`.
- Do not commit Python `__pycache__` directories.
- Use production database credentials through environment variables.
- Restrict administrative endpoints to authenticated users.

Recommended `.gitignore` entries include:

```gitignore
# Environment
.env
.env.*

# Python
__pycache__/
*.py[cod]
venv/
.venv/

# Node
node_modules/
dist/

# Local database
*.db
*.sqlite
*.sqlite3

# Uploaded files
backend/uploads/

# macOS
.DS_Store
```

**Do not upload the existing `backend/.env`, `backend/venv`, `frontend/node_modules`, or local `app.db` from the development archive to GitHub.**

---

# 📌 Future Improvements

Potential future additions include:

- Search across publications
- Publication filtering and sorting
- Dedicated admin dashboard UI
- Rich-text article management
- Citation export
- BibTeX support
- DOI integration
- Google Scholar integration
- ORCID integration
- Publication analytics
- Automated backups
- Role-based administration
- Improved accessibility
- Automated CI/CD deployment

---

## 👨‍💻 Project

**Dr. Abhijit Bora — Academic Website**

A full-stack academic platform built to provide a modern, maintainable, and extensible digital presence for academic research and publications.