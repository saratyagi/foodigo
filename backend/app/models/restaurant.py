from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.database import Base


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    image = Column(String, nullable=True)
    rating = Column(Float, default=4.0)
    delivery_time = Column(String, default="30 mins")
    address = Column(String, nullable=True)
    price_for_two = Column(Integer, default=300)
    min_order = Column(Integer, default=100)
    delivery_fee = Column(Integer, default=40)
    open_hours = Column(String, default="10:00 AM - 11:00 PM")

    foods = relationship("Food", back_populates="restaurant")
    reviews = relationship("Review", back_populates="restaurant")
