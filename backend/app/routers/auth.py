from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserOut, TokenOut, UserUpdate
from app.crud.user import get_user_by_email, create_user, update_user
from app.core.security import verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/signup", response_model=TokenOut, status_code=201)
def signup(data: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(db, data)
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "user": user}


@router.post("/login", response_model=TokenOut)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "user": user}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_user(db, current_user, data)
