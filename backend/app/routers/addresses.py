from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.address import Address
from app.models.user import User
from app.schemas.address import AddressCreate, AddressUpdate, AddressOut
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("", response_model=List[AddressOut])
def list_addresses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Address).filter(Address.user_id == current_user.id).all()


@router.post("", response_model=AddressOut, status_code=201)
def create_address(
    data: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
    addr = Address(user_id=current_user.id, **data.model_dump())
    db.add(addr)
    db.commit()
    db.refresh(addr)
    return addr


@router.put("/{address_id}", response_model=AddressOut)
def update_address(
    address_id: int,
    data: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    addr = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    if data.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(addr, field, value)
    db.commit()
    db.refresh(addr)
    return addr


@router.delete("/{address_id}", status_code=204)
def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    addr = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(addr)
    db.commit()
