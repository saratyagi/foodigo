from pydantic import BaseModel
from typing import Optional


class RestaurantOut(BaseModel):
    id: int
    name: str
    image: Optional[str]
    rating: float
    delivery_time: str
    address: Optional[str]
    price_for_two: int
    min_order: int
    delivery_fee: int
    open_hours: str

    model_config = {"from_attributes": True}
