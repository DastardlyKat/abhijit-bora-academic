from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase.pdfmetrics import stringWidth
import io

import storage
from database import get_db
from models import Paper, PaperCategory, PaperScope
from schemas import PaperUpdate, PaperResponse
from dependencies import get_current_admin

router = APIRouter(prefix="/papers", tags=["Papers"])

# -- Watermark Utility
#
# BUG FIX (carried over): the previous version tiled the watermark text
# every 200pt horizontally / 80pt vertically at 40pt font, regardless of how
# long the text actually was, producing an unreadable smear. Spacing is
# still computed from the real text width here.
#
# Reworked to operate on bytes in/out rather than file paths, so it works
# identically whether the file underneath ultimately lives on local disk or
# in Cloud Storage - it no longer needs to know or care.
def add_watermark(input_bytes: bytes, watermark_text: str) -> bytes:
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)
    width, height = letter

    font_name = "Helvetica"
    font_size = 11
    can.setFont(font_name, font_size)
    can.setFillColorRGB(0.5, 0.5, 0.5, alpha=0.25)

    text_width = stringWidth(watermark_text, font_name, font_size)
    x_gap = text_width + 90   # horizontal gap between repeats, text width + margin
    y_gap = font_size * 6     # vertical gap between rows

    can.saveState()
    can.translate(width / 2, height / 2)
    can.rotate(45)

    # Tile far enough in both directions to cover the whole rotated canvas,
    # regardless of how long the watermark text is or what page size the
    # source PDF uses.
    span = width + height
    x_steps = int(span / x_gap) + 2
    y_steps = int(span / y_gap) + 2

    for xi in range(-x_steps, x_steps + 1):
        for yi in range(-y_steps, y_steps + 1):
            can.drawCentredString(xi * x_gap, yi * y_gap, watermark_text)

    can.restoreState()
    can.save()

    packet.seek(0)
    watermark_page = PdfReader(packet).pages[0]

    reader = PdfReader(io.BytesIO(input_bytes))
    writer = PdfWriter()

    for page in reader.pages:
        page.merge_page(watermark_page)
        writer.add_page(page)

    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()

# -- Shared upload+watermark helper, used by both paper creation and the
# attach/replace-PDF endpoint below. Returns the storage KEY of the
# original file (e.g. "<uuid>.pdf") - the watermarked copy's key is always
# derivable from it (see delete_pdf_files / get_paper_pdf below), so only
# this one key needs to be stored on the Paper row.
def save_watermarked_upload(pdf_file: UploadFile) -> str:
    if not pdf_file.filename.endswith(".pdf") or pdf_file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )

    original_bytes = pdf_file.file.read()

    unique_name = f"{uuid.uuid4()}.pdf"
    watermarked_name = unique_name.replace(".pdf", "_watermarked.pdf")

    watermark_text = "Dr. Abhijit Bora | abhijit.bora@tezpuruniversity.ac.in"
    watermarked_bytes = add_watermark(original_bytes, watermark_text)

    storage.save(unique_name, original_bytes)
    storage.save(watermarked_name, watermarked_bytes)

    return unique_name

def delete_pdf_files(pdf_key: Optional[str]):
    if not pdf_key:
        return
    storage.delete(pdf_key)
    storage.delete(pdf_key.replace(".pdf", "_watermarked.pdf"))

# -- Get all papers (public)
# category/scope filters replace the old single `type` filter, matching the
# new two-axis classification (e.g. ?category=Peer-Reviewed&scope=National).
@router.get("/", response_model=List[PaperResponse])
def get_papers(
    category: Optional[PaperCategory] = None,
    scope: Optional[PaperScope] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Paper)
    if category:
        query = query.filter(Paper.category == category)
    if scope:
        query = query.filter(Paper.scope == scope)
    return query.order_by(Paper.id.desc()).all()

# -- Get single paper (public)
@router.get("/{paper_id}", response_model=PaperResponse)
def get_paper(paper_id: int, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper Not Found"
        )
    return paper

# -- Serve PDF with watermark (public)
@router.get("/{paper_id}/pdf")
def get_paper_pdf(paper_id: int, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper Not Found"
        )
    if not paper.pdf_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No PDF available for this paper"
        )
    watermarked_key = paper.pdf_url.replace(".pdf", "_watermarked.pdf")
    data = storage.read(watermarked_key)

    if data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF file not found on server"
        )

    return Response(
        content=data,
        media_type="application/pdf",
        # inline = opens in the browser tab instead of forcing a download
        headers={"Content-Disposition": f'inline; filename="{watermarked_key}"'},
    )

# -- Create Paper with PDF Upload (admin only)
@router.post("/", response_model=PaperResponse, status_code=status.HTTP_201_CREATED)
def create_paper(
    title: str = Form(...),
    journal: str = Form(...),
    year: str = Form(...),
    category: PaperCategory = Form(...),
    scope: Optional[PaperScope] = Form(None),
    institute: Optional[str] = Form(None),
    co_author: Optional[str] = Form(None),
    volume: Optional[str] = Form(None),
    issn: Optional[str] = Form(None),
    isbn: Optional[str] = Form(None),
    venue: Optional[str] = Form(None),
    abstract: Optional[str] = Form(None),
    pdf_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    pdf_url = save_watermarked_upload(pdf_file) if pdf_file else None

    new_paper = Paper(
        title=title,
        journal=journal,
        institute=institute,
        co_author=co_author,
        volume=volume,
        issn=issn,
        isbn=isbn,
        venue=venue,
        year=year,
        category=category,
        scope=scope,
        abstract=abstract,
        pdf_url=pdf_url
    )

    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)
    return new_paper

# -- Update Paper (admin only)
@router.patch("/{paper_id}", response_model=PaperResponse)
def update_paper(
    paper_id: int,
    paper_data: PaperUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper Not Found"
        )

    update_data = paper_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(paper, field, value)

    db.commit()
    db.refresh(paper)
    return paper

# -- Attach or replace a paper's PDF (admin only)
# There was previously no way to add a PDF to a paper after it was created
# (update_paper only accepts JSON, no file upload) - which matters here
# since every paper currently in the database has no PDF attached yet.
@router.post("/{paper_id}/pdf", response_model=PaperResponse)
def upload_paper_pdf(
    paper_id: int,
    pdf_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper Not Found"
        )

    # Replacing an existing PDF: clean up the old original + watermarked
    # files so they don't pile up on disk.
    delete_pdf_files(paper.pdf_url)

    paper.pdf_url = save_watermarked_upload(pdf_file)
    db.commit()
    db.refresh(paper)
    return paper

# -- Delete Paper (admin only)
@router.delete("/{paper_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_paper(
    paper_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper Not Found"
        )

    delete_pdf_files(paper.pdf_url)

    db.delete(paper)
    db.commit()