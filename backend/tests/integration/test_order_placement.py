"""Integration tests for POST /orders — order placement.

Note on payment gateway: this app uses Cash on Delivery only and has no
external payment integration, so there is nothing to mock.  All assertions
are on real DB outcomes: the order row, the order-item rows, the computed
totals, and the initial status.
"""
from app.models.order import Order
from app.models.order_item import OrderItem
from app.config import TAX_RATE, BASE_DELIVERY_FEE


class TestPlaceOrder:
    def test_place_order_returns_201(self, client, food, address, auth_headers):
        resp = client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": food.id, "quantity": 2}],
            "payment_method": "COD",
        }, headers=auth_headers)
        assert resp.status_code == 201

    def test_order_created_in_database(self, client, db, food, address, auth_headers, user):
        client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": food.id, "quantity": 1}],
        }, headers=auth_headers)
        order = db.query(Order).filter(Order.user_id == user.id).first()
        assert order is not None

    def test_order_status_is_confirmed(self, client, food, address, auth_headers):
        resp = client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": food.id, "quantity": 1}],
        }, headers=auth_headers)
        assert resp.json()["status"] == "Confirmed"

    def test_order_subtotal_is_price_times_quantity(self, client, food, address, auth_headers):
        resp = client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": food.id, "quantity": 3}],
        }, headers=auth_headers)
        assert resp.json()["subtotal"] == food.price * 3

    def test_order_taxes_are_five_percent(self, client, food, address, auth_headers):
        resp = client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": food.id, "quantity": 1}],
        }, headers=auth_headers)
        data = resp.json()
        expected_tax = round(data["subtotal"] * TAX_RATE)
        assert data["taxes"] == expected_tax

    def test_order_total_is_correct(self, client, food, address, auth_headers):
        resp = client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": food.id, "quantity": 2}],
        }, headers=auth_headers)
        data = resp.json()
        assert data["total"] == data["subtotal"] + data["taxes"] + data["delivery_fee"]

    def test_order_items_created_in_database(self, client, db, food, address, auth_headers, user):
        resp = client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": food.id, "quantity": 2}],
        }, headers=auth_headers)
        order_id = resp.json()["id"]
        items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
        assert len(items) == 1
        assert items[0].food_id == food.id
        assert items[0].quantity == 2

    def test_order_item_price_snapshots_food_price(self, client, db, food, address, auth_headers):
        resp = client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": food.id, "quantity": 1}],
        }, headers=auth_headers)
        order_id = resp.json()["id"]
        item = db.query(OrderItem).filter(OrderItem.order_id == order_id).first()
        assert item.price == food.price

    def test_order_with_promo_code_applies_discount(self, client, db, food, address, auth_headers):
        resp = client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": food.id, "quantity": 2}],
            "promo_code": "WELCOME50",
        }, headers=auth_headers)
        assert resp.status_code == 201
        # discount should have reduced the total
        data = resp.json()
        assert data["total"] < data["subtotal"] + data["taxes"] + data["delivery_fee"]

    def test_free_delivery_when_subtotal_at_threshold(self, client, db, restaurant, category,
                                                       address, auth_headers):
        # Create a food worth ₹500 exactly so free-delivery threshold is met
        from app.models.food import Food as FoodModel
        expensive_food = FoodModel(
            restaurant_id=restaurant.id,
            category_id=category.id,
            name="Premium Meal",
            price=500,
            available=True,
        )
        db.add(expensive_food)
        db.flush()

        resp = client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": expensive_food.id, "quantity": 1}],
        }, headers=auth_headers)
        assert resp.status_code == 201
        assert resp.json()["delivery_fee"] == 0

    def test_place_order_without_auth_returns_401(self, client, food, address):
        resp = client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": food.id, "quantity": 1}],
        })
        assert resp.status_code == 401

    def test_place_order_with_wrong_address_returns_404(self, client, food, auth_headers):
        resp = client.post("/orders", json={
            "address_id": 99999,
            "items": [{"food_id": food.id, "quantity": 1}],
        }, headers=auth_headers)
        assert resp.status_code == 404

    def test_place_order_with_unavailable_food_returns_400(self, client, db, restaurant,
                                                            category, address, auth_headers):
        from app.models.food import Food as FoodModel
        unavail = FoodModel(
            restaurant_id=restaurant.id,
            category_id=category.id,
            name="Sold Out Item",
            price=150,
            available=False,
        )
        db.add(unavail)
        db.flush()

        resp = client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": unavail.id, "quantity": 1}],
        }, headers=auth_headers)
        assert resp.status_code == 400

    def test_list_orders_returns_user_orders(self, client, food, address, auth_headers):
        client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": food.id, "quantity": 1}],
        }, headers=auth_headers)
        resp = client.get("/orders", headers=auth_headers)
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    def test_get_order_by_id(self, client, food, address, auth_headers):
        place_resp = client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": food.id, "quantity": 1}],
        }, headers=auth_headers)
        order_id = place_resp.json()["id"]

        get_resp = client.get(f"/orders/{order_id}", headers=auth_headers)
        assert get_resp.status_code == 200
        assert get_resp.json()["id"] == order_id

    def test_get_order_of_other_user_returns_404(self, client, db, food, address, auth_headers):
        from app.models.user import User
        from app.core.security import hash_password, create_access_token
        other = User(name="Other", email="other@example.com",
                     password=hash_password("pass"), role="user")
        db.add(other)
        db.flush()
        other_token = create_access_token({"sub": str(other.id)})
        other_headers = {"Authorization": f"Bearer {other_token}"}

        place_resp = client.post("/orders", json={
            "address_id": address.id,
            "items": [{"food_id": food.id, "quantity": 1}],
        }, headers=auth_headers)
        order_id = place_resp.json()["id"]

        # other user cannot see this order
        get_resp = client.get(f"/orders/{order_id}", headers=other_headers)
        assert get_resp.status_code == 404
