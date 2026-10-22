from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Integer, nullable=False)
    image = Column(String, nullable=True)
    slug = Column(String, nullable=True)  # e.g. "margherita-pizza" for image path resolution
    rating = Column(Float, default=4.0)
    veg = Column(Boolean, default=True)
    available = Column(Boolean, default=True)
    calories = Column(Integer, nullable=True)
    protein_g = Column(Float, nullable=True)
    carbs_g = Column(Float, nullable=True)
    fat_g = Column(Float, nullable=True)
    diet_tags = Column(String, nullable=True, default="")   # csv: vegan,gluten-free,keto,jain,dairy-free,high-protein,low-cal
    temp_tags = Column(String, nullable=True, default="")   # csv: rainy,hot,winter,cold

    restaurant = relationship("Restaurant", back_populates="foods")
    category = relationship("Category", back_populates="foods")
    order_items = relationship("OrderItem", back_populates="food")
    favorites = relationship("Favorite", back_populates="food")
