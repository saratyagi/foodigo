from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.favorite import Favorite
from app.models.user import User
from app.schemas.favorite import FavoriteOut
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("", response_model=List[FavoriteOut])
def list_favorites(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Favorite).filter(Favorite.user_id == current_user.id).all()


@router.post("/{food_id}", response_model=FavoriteOut, status_code=201)
def add_favorite(
    food_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id, Favorite.food_id == food_id
    ).first()
    if existing:
        return existing
    fav = Favorite(user_id=current_user.id, food_id=food_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav


@router.delete("/{food_id}", status_code=204)
def remove_favorite(
    food_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id, Favorite.food_id == food_id
    ).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(fav)
    db.commit()
