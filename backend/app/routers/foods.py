from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.database import get_db
from app.models.food import Food
from app.schemas.food import FoodOut

router = APIRouter()


def _diet_matches(food: Food, filters: list[str]) -> bool:
    tags = [t.strip() for t in (food.diet_tags or "").split(",") if t.strip()]
    for f in filters:
        if f == "high-protein":
            if (food.protein_g or 0) < 20:
                return False
        elif f == "low-cal":
            if (food.calories or 9999) > 300:
                return False
        elif f not in tags:
            return False
    return True


@router.get("", response_model=List[FoodOut])
def list_foods(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    category: Optional[int] = Query(None),
    restaurant: Optional[int] = Query(None),
    veg: Optional[bool] = Query(None),
    sort: Optional[str] = Query(None),   # price_asc | price_desc | rating
    diet: Optional[str] = Query(None),   # comma-separated: vegan,high-protein,...
    limit: Optional[int] = Query(None),
):
    q = db.query(Food).filter(Food.available == True)

    if search:
        q = q.filter(or_(
            Food.name.ilike(f"%{search}%"),
            Food.description.ilike(f"%{search}%"),
        ))
    if category is not None:
        q = q.filter(Food.category_id == category)
    if restaurant is not None:
        q = q.filter(Food.restaurant_id == restaurant)
    if veg is not None:
        q = q.filter(Food.veg == veg)

    if sort == "price_asc":
        q = q.order_by(Food.price.asc())
    elif sort == "price_desc":
        q = q.order_by(Food.price.desc())
    elif sort == "rating":
        q = q.order_by(Food.rating.desc())

    foods = q.all()

    if diet:
        filters = [d.strip() for d in diet.split(",") if d.strip()]
        foods = [f for f in foods if _diet_matches(f, filters)]

    if limit:
        foods = foods[:limit]

    return foods


@router.get("/weather", response_model=List[FoodOut])
def foods_by_weather(
    bucket: str = Query(...),
    db: Session = Depends(get_db),
):
    foods = db.query(Food).filter(Food.available == True).all()
    return [f for f in foods if bucket in (f.temp_tags or "").split(",")]


@router.get("/{food_id}", response_model=FoodOut)
def get_food(food_id: int, db: Session = Depends(get_db)):
    food = db.get(Food, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    return food
