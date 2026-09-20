from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from database import engine, Base
from routers import auth, papers, contact, updates

# Create all tables
Base.metadata.create_all(bind=engine)

# App Instance
app = FastAPI(
    title="Dr. Abhijit Bora - Academic Website API",
    description="Backend API for Dr. Abhijit Bora's Personal Academic Website",
    version="1.0.0"
)

# CORS Middleware
#
# BUG FIX: this list was missing http://localhost:5173 - the default port
# Vite's dev server (`npm run dev`) actually runs on. "http://localhost"
# (no port) and "http://localhost:3000" (Create React App's default) do NOT
# match "http://localhost:5173" as a browser origin - CORS matching is exact,
# not prefix-based - so every request from the Vite frontend was silently
# blocked by the browser, which looks exactly like "papers not loading" even
# though the backend is running fine.
origins = [
    "http://localhost",         # generic localhost, no port
    "http://localhost:3000",    # Create React App default port
    "http://localhost:5173",    # Vite dev server default port
    "http://127.0.0.1:5173",    # Vite dev server, alternate host form
    "https://abhijitbora.com",  # Production domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)

# PDF storage setup (local disk in dev, Cloudflare R2 in production) lives
# entirely in storage.py, which is imported by routers/papers.py - nothing
# needed here.

# Include Routers
app.include_router(auth.router)
app.include_router(papers.router)
app.include_router(contact.router)
app.include_router(updates.router)

# Root Endpoint
@app.get("/")
def root():
    return {
        "message": "Dr. Abhijit Bora's Academic Website API!",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Health Check
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# BUG FIX: this file never actually started a server. Everything above
# defines the FastAPI app and its routes, but without this block, running
# `python main.py` just executes the module top-to-bottom and exits - it
# never binds to a port or listens for requests. That's why the process was
# ending immediately with no error: there was nothing left telling it to
# keep running.
if __name__ == "__main__":
    import uvicorn
    # Render (RENDER=true, PORT=10000 by default) and Cloud Run (K_SERVICE
    # set, PORT=8080) both inject PORT automatically - reading it means this
    # same file runs unmodified on either, and locally (falls back to 8000).
    # Auto-reload is only useful for local dev; a file watcher makes no
    # sense on a host that already rebuilds the container/env on every
    # deploy, so it's switched off on both platforms.
    port = int(os.environ.get("PORT", 8000))
    is_hosted = os.environ.get("K_SERVICE") is not None or os.environ.get("RENDER") is not None
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=not is_hosted)