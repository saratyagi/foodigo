from pydantic import BaseModel
from typing import Optional


class AddressCreate(BaseModel):
    label: str = "Home"
    name: str
    phone: str
    line: str
    city: str
    pincode: str
    is_default: bool = False


class AddressUpdate(BaseModel):
    label: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    line: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    is_default: Optional[bool] = None


class AddressOut(BaseModel):
    id: int
    user_id: int
    label: str
    name: str
    phone: str
    line: str
    city: str
    pincode: str
    is_default: bool

    model_config = {"from_attributes": True}
