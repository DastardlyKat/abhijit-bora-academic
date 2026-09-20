from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import SiteStats
from schemas import SiteStatsResponse, SiteStatsUpdate
from dependencies import get_current_admin

router = APIRouter(prefix="/stats", tags=["Site Stats"])

# SiteStats is a singleton - there's only ever one row (id=1), holding the
# numbers shown on the About page. This helper fetches it, creating it with
# all-zero defaults the first time it's requested if it doesn't exist yet.
def get_or_create_stats(db: Session) -> SiteStats:
    stats = db.query(SiteStats).filter(SiteStats.id == 1).first()
    if not stats:
        stats = SiteStats(id=1)
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return stats

# -- Get current site stats (public - powers the About page)
@router.get("/", response_model=SiteStatsResponse)
def get_stats(db: Session = Depends(get_db)):
    return get_or_create_stats(db)

# -- Update site stats (admin only)
@router.patch("/", response_model=SiteStatsResponse)
def update_stats(
    stats_data: SiteStatsUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    stats = get_or_create_stats(db)

    update_data = stats_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(stats, field, value)

    db.commit()
    db.refresh(stats)
    return stats