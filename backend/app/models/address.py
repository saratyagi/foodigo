from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    label = Column(String, default="Home")  # Home | Work | Other
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    line = Column(String, nullable=False)
    city = Column(String, nullable=False)
    pincode = Column(String, nullable=False)
    is_default = Column(Boolean, default=False)

    user = relationship("User", back_populates="addresses")
    orders = relationship("Order", back_populates="address")
