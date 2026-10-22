from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=False)

    __table_args__ = (UniqueConstraint("user_id", "food_id", name="uq_user_food"),)

    user = relationship("User", back_populates="favorites")
    food = relationship("Food", back_populates="favorites")
