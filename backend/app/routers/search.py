from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from pydantic import BaseModel
from app.database import get_db
from app.models.food import Food
from app.models.restaurant import Restaurant
from app.schemas.food import FoodOut
from app.schemas.restaurant import RestaurantOut

router = APIRouter()


class SearchOut(BaseModel):
    foods: List[FoodOut]
    restaurants: List[RestaurantOut]


@router.get("", response_model=SearchOut)
def search(
    q: str = Query(""),
    veg: Optional[bool] = Query(None),
    sort: Optional[str] = Query(None),       # rating | price_asc | price_desc
    min_price: Optional[int] = Query(None),
    max_price: Optional[int] = Query(None),
    min_rating: Optional[float] = Query(None),
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    # --- Foods ---
    fq = db.query(Food).filter(Food.available == True)
    if q:
        fq = fq.filter(or_(
            Food.name.ilike(f"%{q}%"),
            Food.description.ilike(f"%{q}%"),
        ))
    if veg is not None:
        fq = fq.filter(Food.veg == veg)
    if min_price is not None:
        fq = fq.filter(Food.price >= min_price)
    if max_price is not None:
        fq = fq.filter(Food.price <= max_price)
    if min_rating is not None:
        fq = fq.filter(Food.rating >= min_rating)
    if category_id is not None:
        fq = fq.filter(Food.category_id == category_id)

    if sort == "price_asc":
        fq = fq.order_by(Food.price.asc())
    elif sort == "price_desc":
        fq = fq.order_by(Food.price.desc())
    else:
        fq = fq.order_by(Food.rating.desc())

    foods = fq.all()

    # --- Restaurants ---
    rq = db.query(Restaurant)
    if q:
        rq = rq.filter(or_(
            Restaurant.name.ilike(f"%{q}%"),
            Restaurant.address.ilike(f"%{q}%"),
        ))
    if min_rating is not None:
        rq = rq.filter(Restaurant.rating >= min_rating)

    rq = rq.order_by(Restaurant.rating.desc())
    restaurants = rq.all()

    return {"foods": foods, "restaurants": restaurants}
