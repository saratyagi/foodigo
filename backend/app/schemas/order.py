from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class OrderItemIn(BaseModel):
    food_id: int
    quantity: int


class OrderCreate(BaseModel):
    address_id: int
    items: List[OrderItemIn]
    payment_method: str = "COD"
    promo_code: Optional[str] = None


class OrderItemOut(BaseModel):
    id: int
    food_id: int
    quantity: int
    price: int

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    user_id: int
    address_id: Optional[int]
    status: str
    subtotal: int
    taxes: int
    delivery_fee: int
    total: int
    payment_method: str
    promo_code: Optional[str]
    estimated_delivery: Optional[str]
    created_at: datetime
    items: List[OrderItemOut] = []

    model_config = {"from_attributes": True}


class StatusUpdate(BaseModel):
    status: str
