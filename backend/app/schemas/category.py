from pydantic import BaseModel
from typing import Optional


class CategoryOut(BaseModel):
    id: int
    name: str
    image: Optional[str]

    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    name: str
    image: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
