import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import app.models  # registers all ORM models with Base before create_all
from app.database import engine, Base

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Foodigo API", version="1.0.0")

_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded food/restaurant images
_static = Path("static/images")
_static.mkdir(parents=True, exist_ok=True)
app.mount("/images", StaticFiles(directory=str(_static)), name="images")

from app.routers import auth, restaurants, categories, foods, search
from app.routers import addresses, delivery, orders, favorites, reviews, admin

app.include_router(auth.router,         prefix="/auth",         tags=["auth"])
app.include_router(restaurants.router,  prefix="/restaurants",  tags=["restaurants"])
app.include_router(categories.router,   prefix="/categories",   tags=["categories"])
app.include_router(foods.router,        prefix="/foods",        tags=["foods"])
app.include_router(search.router,       prefix="/search",       tags=["search"])
app.include_router(addresses.router,    prefix="/addresses",    tags=["addresses"])
app.include_router(delivery.router,     prefix="/delivery",     tags=["delivery"])
app.include_router(orders.router,       prefix="/orders",       tags=["orders"])
app.include_router(favorites.router,    prefix="/favorites",    tags=["favorites"])
app.include_router(reviews.router,      prefix="/reviews",      tags=["reviews"])
app.include_router(admin.router,        prefix="/admin",        tags=["admin"])


@app.get("/health", tags=["health"])
@app.get("/", tags=["health"])
def health():
    return {"status": "ok", "app": "Foodigo API"}
