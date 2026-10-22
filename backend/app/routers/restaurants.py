from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.restaurant import Restaurant
from app.schemas.restaurant import RestaurantOut

router = APIRouter()


@router.get("", response_model=List[RestaurantOut])
def list_restaurants(db: Session = Depends(get_db)):
    return db.query(Restaurant).all()


@router.get("/{restaurant_id}", response_model=RestaurantOut)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant
