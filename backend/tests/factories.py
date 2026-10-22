"""
factory_boy factories for Foodigo test data.

Call wire_factories(db_session) once before using any factory in a test or
fixture to bind all factories to the current test session.

Example:
    def test_something(db):
        wire_factories(db)
        user = UserFactory()
        food = FoodFactory(restaurant_id=RestaurantFactory().id,
                           category_id=CategoryFactory().id)
"""
import factory
from factory.alchemy import SQLAlchemyModelFactory

from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.category import Category
from app.models.food import Food
from app.models.address import Address
from app.core.security import hash_password


class UserFactory(SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session = None
        sqlalchemy_session_persistence = "flush"

    name = factory.Sequence(lambda n: f"User {n}")
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    phone = factory.Sequence(lambda n: f"90000{n:05d}")
    password = factory.LazyFunction(lambda: hash_password("password123"))
    role = "user"


class RestaurantFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Restaurant
        sqlalchemy_session = None
        sqlalchemy_session_persistence = "flush"

    name = factory.Sequence(lambda n: f"Restaurant {n}")
    rating = 4.0
    delivery_time = "30 mins"
    address = factory.Sequence(lambda n: f"{n} Test Road, Mumbai")
    price_for_two = 400
    min_order = 100
    delivery_fee = 40


class CategoryFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Category
        sqlalchemy_session = None
        sqlalchemy_session_persistence = "flush"

    name = factory.Sequence(lambda n: f"Category {n}")
    image = None


class FoodFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Food
        sqlalchemy_session = None
        sqlalchemy_session_persistence = "flush"

    # restaurant_id and category_id must be supplied by the caller
    restaurant_id = None
    category_id = None
    name = factory.Sequence(lambda n: f"Food Item {n}")
    description = "A test food item"
    price = 200
    rating = 4.0
    veg = True
    available = True
    calories = 300
    protein_g = 10.0
    carbs_g = 40.0
    fat_g = 8.0
    diet_tags = ""
    temp_tags = ""


class AddressFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Address
        sqlalchemy_session = None
        sqlalchemy_session_persistence = "flush"

    # user_id must be supplied by the caller
    user_id = None
    label = "Home"
    name = "Test Person"
    phone = "9999999999"
    line = factory.Sequence(lambda n: f"{n} Factory Lane")
    city = "Mumbai"
    pincode = "400001"
    is_default = True


_ALL_FACTORIES = (
    UserFactory,
    RestaurantFactory,
    CategoryFactory,
    FoodFactory,
    AddressFactory,
)


def wire_factories(session) -> None:
    """Bind every factory to *session* so created objects land in the test DB."""
    for cls in _ALL_FACTORIES:
        cls._meta.sqlalchemy_session = session
