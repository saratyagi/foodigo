# Import every model so Base.metadata knows all tables before create_all()
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.category import Category
from app.models.food import Food
from app.models.address import Address
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.review import Review
from app.models.favorite import Favorite
