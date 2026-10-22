from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import date
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.order import Order
from app.models.food import Food
from app.models.category import Category
from app.schemas.food import FoodOut, FoodCreate, FoodUpdate
from app.schemas.category import CategoryOut, CategoryCreate, CategoryUpdate
from app.schemas.order import OrderOut, StatusUpdate
from app.schemas.user import UserOut
from app.core.dependencies import admin_required
from app.services.delivery import STATUS_FLOW

router = APIRouter()


# ── Stats ─────────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _: User = Depends(admin_required)):
    today = date.today()
    return {
        "total_users": db.query(func.count(User.id)).scalar(),
        "total_orders": db.query(func.count(Order.id)).scalar(),
        "orders_today": db.query(func.count(Order.id)).filter(func.date(Order.created_at) == today).scalar(),
        "revenue_today": db.query(func.sum(Order.total)).filter(func.date(Order.created_at) == today).scalar() or 0,
    }


# ── Foods ─────────────────────────────────────────────────────────────────────

@router.get("/foods", response_model=List[FoodOut])
def list_foods(db: Session = Depends(get_db), _: User = Depends(admin_required)):
    return db.query(Food).all()


@router.post("/foods", response_model=FoodOut, status_code=201)
def create_food(data: FoodCreate, db: Session = Depends(get_db), _: User = Depends(admin_required)):
    food = Food(**data.model_dump())
    db.add(food)
    db.commit()
    db.refresh(food)
    return food


@router.put("/foods/{food_id}", response_model=FoodOut)
def update_food(food_id: int, data: FoodUpdate, db: Session = Depends(get_db), _: User = Depends(admin_required)):
    food = db.get(Food, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(food, field, value)
    db.commit()
    db.refresh(food)
    return food


@router.delete("/foods/{food_id}", status_code=204)
def delete_food(food_id: int, db: Session = Depends(get_db), _: User = Depends(admin_required)):
    food = db.get(Food, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    db.delete(food)
    db.commit()


# ── Categories ────────────────────────────────────────────────────────────────

@router.get("/categories", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db), _: User = Depends(admin_required)):
    return db.query(Category).all()


@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), _: User = Depends(admin_required)):
    cat = Category(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/categories/{cat_id}", response_model=CategoryOut)
def update_category(cat_id: int, data: CategoryUpdate, db: Session = Depends(get_db), _: User = Depends(admin_required)):
    cat = db.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/categories/{cat_id}", status_code=204)
def delete_category(cat_id: int, db: Session = Depends(get_db), _: User = Depends(admin_required)):
    cat = db.get(Category, cat_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()


# ── Orders ────────────────────────────────────────────────────────────────────

@router.get("/orders", response_model=List[OrderOut])
def list_all_orders(db: Session = Depends(get_db), _: User = Depends(admin_required)):
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .order_by(Order.created_at.desc())
        .all()
    )


@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    data: StatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    valid_statuses = STATUS_FLOW + ["Cancelled"]
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {valid_statuses}")
    order.status = data.status
    db.commit()
    return {"id": order.id, "status": order.status}


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), _: User = Depends(admin_required)):
    return db.query(User).all()
