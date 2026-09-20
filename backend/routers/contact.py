from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import ContactSubmission
from schemas import ContactCreate, ContactResponse
from dependencies import get_current_admin

router = APIRouter(prefix="/contact", tags=["Contact"])

# -- Submit contact form
@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def submit_contact(contact_data: ContactCreate, db: Session = Depends(get_db)):
    new_submission = ContactSubmission(
        name=contact_data.name,
        email=contact_data.email,
        subject=contact_data.subject,
        message=contact_data.message
    )
    
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)
    return new_submission

# -- Get all submissions (admin only)
@router.get("/", response_model=List[ContactResponse])
def get_submissions(db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    submissions = db.query(ContactSubmission).order_by(ContactSubmission.created_at.desc()).all()
    return submissions

# -- Get single submission (admin only)
@router.get("/{submission_id}", response_model=ContactResponse)
def get_submission(submission_id: int, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    submission = db.query(ContactSubmission).filter(ContactSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission Not Found"
        )
    return submission

# -- Mark as Read (admin only)
@router.patch("/{submission_id}/read", response_model=ContactResponse)
def mark_as_read(submission_id: int, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    submission = db.query(ContactSubmission).filter(ContactSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission Not Found"
        )
        
    submission.is_read = True
    db.commit()
    db.refresh(submission)
    return submission

# -- Delete Submission (admin only)
@router.delete("/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_submission(submission_id: int, db: Session = Depends(get_db), current_adin = Depends(get_current_admin)):
    submission = db.query(ContactSubmission).filter(ContactSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission Not Found"
        )
        
    db.delete(submission)
    db.commit()