from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=False)
    quantity = Column(Integer, default=1)
    price = Column(Integer, nullable=False)  # snapshot of price at time of order

    order = relationship("Order", back_populates="items")
    food = relationship("Food", back_populates="order_items")
