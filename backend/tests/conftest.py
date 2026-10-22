"""
Shared fixtures for the Foodigo test suite.

Test-database strategy
  - In-memory SQLite with StaticPool: every engine.connect() call returns the
    SAME underlying connection, so data written by one session is visible to
    another — the in-memory DB persists across the whole test session.
  - Tables are created ONCE at session scope.
  - Every table is DELETE-d after each test (reverse FK order) so tests are
    independent without paying the cost of drop/create per test.
  - FastAPI's get_db dependency is overridden to yield the per-test session,
    so all route handlers write to the test database.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from starlette.testclient import TestClient

import app.models  # ensures all models register with Base before create_all
from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.category import Category
from app.models.food import Food
from app.models.address import Address
from app.core.security import hash_password, create_access_token

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    """Create all tables once for the full test session."""
    Base.metadata.create_all(bind=_engine)
    yield
    Base.metadata.drop_all(bind=_engine)


@pytest.fixture(autouse=True)
def _clean_tables(_create_tables):
    """Delete every row after each test so tests do not share state."""
    yield
    with _engine.connect() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        conn.commit()


@pytest.fixture()
def db(_create_tables):
    """
    Yield a SQLAlchemy Session backed by the in-memory test database.
    Also installs a get_db override on the FastAPI app so that any
    TestClient request uses this same session.
    """
    session = _TestingSessionLocal()

    def _override():
        yield session

    app.dependency_overrides[get_db] = _override
    yield session
    app.dependency_overrides.pop(get_db, None)
    session.close()


@pytest.fixture()
def client(db):
    """HTTP test client pointing at the test database."""
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c


# ---------------------------------------------------------------------------
# Core entity fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def user(db):
    u = User(
        name="Test User",
        email="testuser@example.com",
        phone="9999999999",
        password=hash_password("password123"),
        role="user",
    )
    db.add(u)
    db.flush()
    return u


@pytest.fixture()
def admin_user(db):
    u = User(
        name="Admin User",
        email="admin@example.com",
        phone="8888888888",
        password=hash_password("adminpass"),
        role="admin",
    )
    db.add(u)
    db.flush()
    return u


@pytest.fixture()
def auth_headers(user):
    """Bearer-token headers for the regular test user."""
    token = create_access_token({"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def admin_headers(admin_user):
    """Bearer-token headers for the admin test user."""
    token = create_access_token({"sub": str(admin_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def category(db):
    cat = Category(name="TestCategory", image=None)
    db.add(cat)
    db.flush()
    return cat


@pytest.fixture()
def restaurant(db):
    rest = Restaurant(
        name="Test Restaurant",
        rating=4.5,
        delivery_time="30 mins",
        address="123 Test St, Mumbai",
        price_for_two=400,
        min_order=100,
        delivery_fee=40,
    )
    db.add(rest)
    db.flush()
    return rest


@pytest.fixture()
def food(db, restaurant, category):
    f = Food(
        restaurant_id=restaurant.id,
        category_id=category.id,
        name="Margherita Pizza",
        description="Classic tomato and cheese pizza",
        price=250,
        rating=4.2,
        veg=True,
        available=True,
        calories=400,
        protein_g=15.0,
        carbs_g=55.0,
        fat_g=12.0,
        diet_tags="vegan",
        temp_tags="rainy",
    )
    db.add(f)
    db.flush()
    return f


@pytest.fixture()
def address(db, user):
    addr = Address(
        user_id=user.id,
        label="Home",
        name="Test User",
        phone="9999999999",
        line="456 Test Lane",
        city="Mumbai",
        pincode="400001",
        is_default=True,
    )
    db.add(addr)
    db.flush()
    return addr
