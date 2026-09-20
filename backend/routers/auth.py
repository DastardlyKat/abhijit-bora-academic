from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt
from datetime import timedelta

from database import get_db
from models import Admin
from schemas import AdminLogin, Token
from dependencies import create_access_token, get_current_admin, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["Authentication"])

# -- Password Utilities
#
# BUG FIX: this used to go through passlib's CryptContext, which detects the
# installed bcrypt version by reading bcrypt.__about__.__version__. Modern
# bcrypt (4.1+) removed that attribute, so passlib's version-detection
# silently breaks - and the broken detection then misfires into bcrypt's
# real 72-byte password limit check, raising ValueError even for a short
# password like "aadi". passlib hasn't been updated for this in years, so
# rather than pin bcrypt to an old version, we call bcrypt directly - it's a
# smaller surface and has no version-detection step to break.
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# -- Create first admin
@router.post("/setup", status_code=status.HTTP_201_CREATED)
def create_admin(credentials: AdminLogin, db: Session = Depends(get_db)): 
    existing = db.query(Admin).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin already exists"
        )
    
    new_admin = Admin(
        username=credentials.username,
        hashed_password=hash_password(credentials.password)
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return {"message": "Admin created successfully"}

# -- Login
@router.post("/login", response_model=Token)
def login(credentials: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin). filter(Admin.username == credentials.username).first()
    
    if not admin or not verify_password(credentials.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(
        data={"sub": admin.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# -- Verify Token
@router.get("/verify")
def verify_token_route(current_admin=Depends(get_current_admin)):
    return {"message": "Token is valid"}