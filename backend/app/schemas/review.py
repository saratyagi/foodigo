from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    restaurant_id: int
    rating: float
    comment: Optional[str] = None
    image: Optional[str] = None


class ReviewOut(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    rating: float
    comment: Optional[str]
    image: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
