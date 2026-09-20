from pydantic import BaseModel, EmailStr, Field, computed_field
from datetime import datetime
from typing import Optional
from models import PaperCategory, PaperScope

# Paper Schemas
class PaperBase(BaseModel):
    title: str
    journal: str
    institute: Optional[str] = None
    co_author: Optional[str] = None
    volume: Optional[str] = None
    issn: Optional[str] = None
    isbn: Optional[str] = None
    venue: Optional[str] = None
    year: str
    category: PaperCategory
    scope: Optional[PaperScope] = None
    abstract: Optional[str] = None

class PaperCreate(PaperBase):
    pass

# NOTE: pdf_url is deliberately NOT an editable field here. It's an internal
# on-disk path that only the upload flow in routers/papers.py should ever
# set (and run through the watermarking pipeline first) - letting an admin
# PATCH it directly would let a raw, non-watermarked path get served.
class PaperUpdate(BaseModel):
    title: Optional[str] = None
    journal: Optional[str] = None
    institute: Optional[str] = None
    co_author: Optional[str] = None
    volume: Optional[str] = None
    issn: Optional[str] = None
    isbn: Optional[str] = None
    venue: Optional[str] = None
    year: Optional[str] = None
    category: Optional[PaperCategory] = None
    scope: Optional[PaperScope] = None
    abstract: Optional[str] = None

# Public response shape. pdf_url is read from the ORM object (so we know
# whether a PDF exists) but marked exclude=True so it never actually reaches
# the JSON response - the frontend gets `has_pdf` instead. Returning the raw
# path publicly previously meant anyone could reconstruct a direct link to
# the ORIGINAL unwatermarked file on disk.
class PaperResponse(PaperBase):
    id: int
    created_at: datetime
    pdf_url: Optional[str] = Field(default=None, exclude=True)

    @computed_field
    @property
    def has_pdf(self) -> bool:
        return bool(self.pdf_url)

    class Config:
        from_attributes = True

# Contact Schemas
class ContactBase(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ContactCreate(ContactBase):
    pass

class ContactResponse(ContactBase):
    id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Site Stats Schemas
class SiteStatsBase(BaseModel):
    peer_reviewed_papers: int = 0
    non_peer_reviewed_papers: int = 0
    book_chapters: int = 0
    authored_books: int = 0
    odl_study_materials: int = 0
    phd_scholars_awarded: int = 0
    phd_scholars_ongoing: int = 0
    fellowships: Optional[str] = None

class SiteStatsUpdate(BaseModel):
    peer_reviewed_papers: Optional[int] = None
    non_peer_reviewed_papers: Optional[int] = None
    book_chapters: Optional[int] = None
    authored_books: Optional[int] = None
    odl_study_materials: Optional[int] = None
    phd_scholars_awarded: Optional[int] = None
    phd_scholars_ongoing: Optional[int] = None
    fellowships: Optional[str] = None

class SiteStatsResponse(SiteStatsBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# Admin Schemas
class AdminLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None