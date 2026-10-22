"""
End-to-end tests for the critical user journeys.

Scope: minimal — only the golden path and one catastrophic failure case.
All requests go through the real TestClient → FastAPI app → in-memory test DB.
No external services exist in this app (COD only, no payment gateway).
"""


def _signup_and_login(client, email="e2e_user@example.com", password="e2e_pass"):
    """Register a new user and return (user_dict, token, headers)."""
    resp = client.post("/auth/signup", json={
        "name": "E2E User",
        "email": email,
        "phone": "9001234567",
        "password": password,
    })
    assert resp.status_code == 201, f"Signup failed: {resp.text}"
    data = resp.json()
    token = data["access_token"]
    return data["user"], token, {"Authorization": f"Bearer {token}"}


def _create_address(client, headers):
    """Add a delivery address for the signed-in user."""
    resp = client.post("/addresses", json={
        "label": "Home",
        "name": "E2E User",
        "phone": "9001234567",
        "line": "1 E2E Street",
        "city": "Mumbai",
        "pincode": "400001",
        "is_default": True,
    }, headers=headers)
    assert resp.status_code == 201, f"Address creation failed: {resp.text}"
    return resp.json()


class TestBrowseToCheckoutGoldenPath:
    """Full happy-path: browse → pick a restaurant → add item → checkout → confirm order."""

    def test_full_journey(self, client, restaurant, food):
        # ── Step 1: browse restaurants ────────────────────────────────────────
        resp = client.get("/restaurants")
        assert resp.status_code == 200
        restaurants = resp.json()
        assert any(r["id"] == restaurant.id for r in restaurants), "Test restaurant not listed"

        # ── Step 2: browse menu for the restaurant ────────────────────────────
        resp = client.get(f"/foods?restaurant={restaurant.id}")
        assert resp.status_code == 200
        menu = resp.json()
        assert any(f["id"] == food.id for f in menu), "Test food not in restaurant menu"

        # ── Step 3: register a new user ───────────────────────────────────────
        _, token, headers = _signup_and_login(client)

        # ── Step 4: add a delivery address ────────────────────────────────────
        address = _create_address(client, headers)

        # ── Step 5: get a delivery quote (simulates frontend cart total) ──────
        resp = client.post("/delivery/quote", json={"subtotal": food.price})
        assert resp.status_code == 200
        quote = resp.json()
        assert quote["subtotal"] == food.price

        # ── Step 6: place the order (checkout) ───────────────────────────────
        resp = client.post("/orders", json={
            "address_id": address["id"],
            "items": [{"food_id": food.id, "quantity": 1}],
            "payment_method": "COD",
        }, headers=headers)
        assert resp.status_code == 201
        order = resp.json()

        # ── Step 7: verify order details ──────────────────────────────────────
        assert order["status"] == "Confirmed"
        assert order["subtotal"] == food.price
        assert order["taxes"] == round(food.price * 0.05)
        assert len(order["items"]) == 1
        assert order["items"][0]["food_id"] == food.id
        assert order["items"][0]["quantity"] == 1

        # ── Step 8: retrieve the placed order ────────────────────────────────
        resp = client.get(f"/orders/{order['id']}", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["id"] == order["id"]

        # ── Step 9: track the order ───────────────────────────────────────────
        resp = client.get(f"/delivery/track/{order['id']}", headers=headers)
        assert resp.status_code == 200
        tracking = resp.json()
        assert tracking["current_status"] == "Confirmed"
        confirmed_step = next(s for s in tracking["timeline"] if s["status"] == "Confirmed")
        assert confirmed_step["done"] is True

    def test_full_journey_with_promo_code(self, client, restaurant, food):
        """Golden path with WELCOME50 promo applied at checkout."""
        _, token, headers = _signup_and_login(client, email="promo_user@example.com")
        address = _create_address(client, headers)

        resp = client.post("/orders", json={
            "address_id": address["id"],
            "items": [{"food_id": food.id, "quantity": 2}],
            "payment_method": "COD",
            "promo_code": "WELCOME50",
        }, headers=headers)
        assert resp.status_code == 201
        order = resp.json()
        assert order["status"] == "Confirmed"
        # Discount must have reduced the total compared to bare subtotal + tax + fee
        assert order["total"] < order["subtotal"] + order["taxes"] + order["delivery_fee"]


class TestBrowseToCheckoutFailureCases:
    """Catastrophic failure cases that the app must handle gracefully."""

    def test_checkout_with_no_address_returns_404(self, client, food):
        """Order placement fails cleanly when the address doesn't exist."""
        _, token, headers = _signup_and_login(client, email="noaddr@example.com")
        resp = client.post("/orders", json={
            "address_id": 99999,
            "items": [{"food_id": food.id, "quantity": 1}],
        }, headers=headers)
        assert resp.status_code == 404

    def test_checkout_with_unavailable_item_returns_400(self, client, db, restaurant, category):
        """Order placement fails cleanly when the chosen food is unavailable."""
        from app.models.food import Food as FoodModel
        sold_out = FoodModel(
            restaurant_id=restaurant.id,
            category_id=category.id,
            name="Sold Out Special",
            price=199,
            available=False,
        )
        db.add(sold_out)
        db.flush()

        _, token, headers = _signup_and_login(client, email="soldout@example.com")
        address = _create_address(client, headers)

        resp = client.post("/orders", json={
            "address_id": address["id"],
            "items": [{"food_id": sold_out.id, "quantity": 1}],
        }, headers=headers)
        assert resp.status_code == 400

    def test_unauthenticated_checkout_returns_401(self, client, food):
        """Unauthenticated request to /orders is rejected."""
        resp = client.post("/orders", json={
            "address_id": 1,
            "items": [{"food_id": food.id, "quantity": 1}],
        })
        assert resp.status_code == 401

    def test_user_cannot_see_another_users_order(self, client, restaurant, food):
        """User A's order is not accessible to User B."""
        _, _, headers_a = _signup_and_login(client, email="user_a@example.com")
        _, _, headers_b = _signup_and_login(client, email="user_b@example.com")

        addr_a = _create_address(client, headers_a)
        order_resp = client.post("/orders", json={
            "address_id": addr_a["id"],
            "items": [{"food_id": food.id, "quantity": 1}],
        }, headers=headers_a)
        order_id = order_resp.json()["id"]

        resp = client.get(f"/orders/{order_id}", headers=headers_b)
        assert resp.status_code == 404
