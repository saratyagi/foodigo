from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.food import Food
from app.models.address import Address
from app.models.user import User
from app.schemas.order import OrderCreate, OrderOut
from app.services.delivery import calculate_quote
from app.core.dependencies import get_current_user

router = APIRouter()


@router.post("", response_model=OrderOut, status_code=201)
def place_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    address = db.query(Address).filter(
        Address.id == data.address_id, Address.user_id == current_user.id
    ).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    item_rows: list[tuple[Food, int]] = []
    subtotal = 0
    for item in data.items:
        food = db.get(Food, item.food_id)
        if not food or not food.available:
            raise HTTPException(status_code=400, detail=f"Food id {item.food_id} is not available")
        subtotal += food.price * item.quantity
        item_rows.append((food, item.quantity))

    quote = calculate_quote(subtotal=subtotal, promo_code=data.promo_code)

    order = Order(
        user_id=current_user.id,
        address_id=data.address_id,
        status="Confirmed",
        subtotal=quote["subtotal"],
        taxes=quote["taxes"],
        delivery_fee=quote["delivery_fee"],
        total=quote["total"],
        payment_method=data.payment_method,
        promo_code=data.promo_code,
        estimated_delivery=quote["eta"],
    )
    db.add(order)
    db.flush()

    for food, qty in item_rows:
        db.add(OrderItem(order_id=order.id, food_id=food.id, quantity=qty, price=food.price))

    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=List[OrderOut])
def list_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
