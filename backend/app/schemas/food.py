from pydantic import BaseModel
from typing import Optional


class FoodOut(BaseModel):
    id: int
    restaurant_id: int
    category_id: int
    name: str
    description: Optional[str]
    price: int
    image: Optional[str]
    slug: Optional[str]
    rating: float
    veg: bool
    available: bool
    calories: Optional[int] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    diet_tags: Optional[str] = ""
    temp_tags: Optional[str] = ""

    model_config = {"from_attributes": True}


class FoodCreate(BaseModel):
    restaurant_id: int
    category_id: int
    name: str
    description: Optional[str] = None
    price: int
    image: Optional[str] = None
    slug: Optional[str] = None
    rating: float = 4.0
    veg: bool = True
    available: bool = True
    calories: Optional[int] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    diet_tags: Optional[str] = ""
    temp_tags: Optional[str] = ""


class FoodUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    image: Optional[str] = None
    slug: Optional[str] = None
    rating: Optional[float] = None
    veg: Optional[bool] = None
    available: Optional[bool] = None
    category_id: Optional[int] = None
    restaurant_id: Optional[int] = None
