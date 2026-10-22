from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.restaurant import Restaurant
from app.models.order import Order
from app.models.user import User
from app.schemas.delivery import DeliveryQuoteIn, DeliveryQuoteOut, TrackingOut, TrackingStep
from app.services.delivery import calculate_quote, get_tracking_timeline, compute_auto_status, STATUS_FLOW, PROMO_CODES
from app.core.dependencies import get_current_user
from app.config import BASE_DELIVERY_FEE, DEFAULT_ETA_MINUTES

router = APIRouter()


@router.post("/quote", response_model=DeliveryQuoteOut)
def delivery_quote(data: DeliveryQuoteIn, db: Session = Depends(get_db)):
    delivery_fee = BASE_DELIVERY_FEE
    eta_minutes = DEFAULT_ETA_MINUTES

    if data.promo_code and data.promo_code.upper() not in PROMO_CODES:
        raise HTTPException(status_code=400, detail="Invalid promo code")

    if data.restaurant_id:
        restaurant = db.get(Restaurant, data.restaurant_id)
        if restaurant:
            delivery_fee = restaurant.delivery_fee
            try:
                eta_minutes = int(restaurant.delivery_time.split()[0])
            except (ValueError, IndexError):
                pass

    return calculate_quote(
        subtotal=data.subtotal,
        restaurant_delivery_fee=delivery_fee,
        promo_code=data.promo_code,
        eta_minutes=eta_minutes,
    )


@router.get("/track/{order_id}", response_model=TrackingOut)
def track_order(
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

    # Auto-advance status based on elapsed time (demo pacing)
    if order.status not in ("Delivered", "Cancelled"):
        placed = order.created_at.replace(tzinfo=None) if order.created_at.tzinfo else order.created_at
        elapsed = (datetime.utcnow() - placed).total_seconds() / 60
        target = compute_auto_status(elapsed)
        if STATUS_FLOW.index(target) > STATUS_FLOW.index(order.status):
            order.status = target
            db.commit()

    timeline = get_tracking_timeline(order.status)
    item_count = sum(item.quantity for item in order.items)

    return {
        "order_id": order.id,
        "current_status": order.status,
        "timeline": [TrackingStep(**s) for s in timeline],
        "estimated_delivery": order.estimated_delivery,
        "placed_at": order.created_at,
        "total": order.total,
        "item_count": item_count,
        "payment_method": order.payment_method,
    }
