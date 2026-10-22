from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    address_id = Column(Integer, ForeignKey("addresses.id"), nullable=True)
    # Status flow: Confirmed → Preparing → Cooking → Out for Delivery → Delivered | Cancelled
    status = Column(String, default="Confirmed")
    subtotal = Column(Integer, default=0)
    taxes = Column(Integer, default=0)
    delivery_fee = Column(Integer, default=0)
    total = Column(Integer, default=0)
    payment_method = Column(String, default="COD")
    promo_code = Column(String, nullable=True)
    estimated_delivery = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="orders")
    address = relationship("Address", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
