from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DeliveryQuoteIn(BaseModel):
    subtotal: int
    restaurant_id: Optional[int] = None
    promo_code: Optional[str] = None


class DeliveryQuoteOut(BaseModel):
    subtotal: int
    taxes: int
    delivery_fee: int
    discount: int
    total: int
    eta: str


class TrackingStep(BaseModel):
    status: str
    done: bool


class TrackingOut(BaseModel):
    order_id: int
    current_status: str
    timeline: List[TrackingStep]
    estimated_delivery: Optional[str]
    placed_at: Optional[datetime] = None
    total: int = 0
    item_count: int = 0
    payment_method: str = "COD"
