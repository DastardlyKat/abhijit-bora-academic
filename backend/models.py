from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum
from sqlalchemy.sql import func
from database import Base
import enum

# -- Paper classification --
# Research.tsx tags every paper with 1-2 labels: a "category" (what kind of
# publication it is) and, for everything except Books, a "scope" (how wide
# its reach is). e.g. types: ["Peer-Reviewed", "National"] -> category +
# scope. types: ["Books"] -> category only, no scope.
class PaperCategory(enum.Enum):
    books = "Books"
    peer_reviewed = "Peer-Reviewed"
    reviewed = "Reviewed"
    conference_papers = "Conference Papers"
    book_chapters = "Book Chapters"

class PaperScope(enum.Enum):
    international = "International"
    national = "National"
    regional = "Regional"

# Paper model
# BUG FIX / SCHEMA CHANGE: the old model only had a single `type` enum
# (international/national/regional/conference) and an integer `year`. That
# doesn't match what Research.tsx actually needs to display -- it also
# shows institute, co-author, volume, ISSN, ISBN, venue, and free-text years
# like "January-June, 2023" (not a plain int). Extended accordingly.
class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    journal = Column(String, nullable=False)
    institute = Column(String, nullable=True)
    co_author = Column(String, nullable=True)
    volume = Column(String, nullable=True)
    issn = Column(String, nullable=True)
    isbn = Column(String, nullable=True)
    venue = Column(String, nullable=True)
    year = Column(String, nullable=False)  # free text, e.g. "2025" or "January-June, 2023"
    category = Column(Enum(PaperCategory), nullable=False)
    scope = Column(Enum(PaperScope), nullable=True)  # null for Books
    abstract = Column(Text, nullable=True)
    pdf_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Contact Submission model
class ContactSubmission(Base):
    __tablename__ = "contact_submissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Site Stats model (singleton row - id is always 1)
class SiteStats(Base):
    __tablename__ = "site_stats"

    id = Column(Integer, primary_key=True, index=True)
    peer_reviewed_papers = Column(Integer, default=0)
    non_peer_reviewed_papers = Column(Integer, default=0)
    book_chapters = Column(Integer, default=0)
    authored_books = Column(Integer, default=0)
    odl_study_materials = Column(Integer, default=0)
    phd_scholars_awarded = Column(Integer, default=0)
    phd_scholars_ongoing = Column(Integer, default=0)
    fellowships = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# Admin User model
class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())