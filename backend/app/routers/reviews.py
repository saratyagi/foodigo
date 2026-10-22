from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewOut
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/{restaurant_id}", response_model=List[ReviewOut])
def list_reviews(restaurant_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .filter(Review.restaurant_id == restaurant_id)
        .order_by(Review.created_at.desc())
        .all()
    )


@router.post("", response_model=ReviewOut, status_code=201)
def create_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Review).filter(
        Review.user_id == current_user.id, Review.restaurant_id == data.restaurant_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this restaurant")
    review = Review(user_id=current_user.id, **data.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
