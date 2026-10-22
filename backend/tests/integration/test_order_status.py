"""Integration tests for order status — tracking and admin status updates."""
from unittest.mock import patch
from datetime import datetime, timedelta

from app.models.order import Order


def _place_order(client, food, address, auth_headers, quantity=1, promo_code=None):
    """Helper: place one order and return the response JSON."""
    payload = {
        "address_id": address.id,
        "items": [{"food_id": food.id, "quantity": quantity}],
    }
    if promo_code:
        payload["promo_code"] = promo_code
    return client.post("/orders", json=payload, headers=auth_headers).json()


class TestDeliveryTracking:
    def test_track_freshly_placed_order_is_confirmed(self, client, food, address, auth_headers):
        order = _place_order(client, food, address, auth_headers)
        resp = client.get(f"/delivery/track/{order['id']}", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["order_id"] == order["id"]
        assert data["current_status"] == "Confirmed"

    def test_track_returns_timeline_with_confirmed_done(self, client, food, address, auth_headers):
        order = _place_order(client, food, address, auth_headers)
        resp = client.get(f"/delivery/track/{order['id']}", headers=auth_headers)
        timeline = resp.json()["timeline"]
        confirmed_step = next(s for s in timeline if s["status"] == "Confirmed")
        assert confirmed_step["done"] is True

    def test_track_returns_correct_total(self, client, food, address, auth_headers):
        order = _place_order(client, food, address, auth_headers)
        resp = client.get(f"/delivery/track/{order['id']}", headers=auth_headers)
        assert resp.json()["total"] == order["total"]

    def test_track_auto_advances_status_after_elapsed_time(self, client, db, food, address,
                                                            auth_headers, user):
        order_data = _place_order(client, food, address, auth_headers)
        order_id = order_data["id"]

        # Back-date the order's created_at so it appears old enough to be "Cooking"
        old_time = datetime.utcnow() - timedelta(minutes=4)
        order = db.get(Order, order_id)
        order.created_at = old_time
        db.commit()

        resp = client.get(f"/delivery/track/{order_id}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["current_status"] == "Cooking"

    def test_track_nonexistent_order_returns_404(self, client, auth_headers):
        resp = client.get("/delivery/track/99999", headers=auth_headers)
        assert resp.status_code == 404

    def test_track_other_users_order_returns_404(self, client, db, food, address, auth_headers):
        from app.models.user import User
        from app.core.security import hash_password, create_access_token
        other = User(name="Other", email="other2@example.com",
                     password=hash_password("pass"), role="user")
        db.add(other)
        db.flush()
        other_headers = {"Authorization": f"Bearer {create_access_token({'sub': str(other.id)})}"}

        order_data = _place_order(client, food, address, auth_headers)
        resp = client.get(f"/delivery/track/{order_data['id']}", headers=other_headers)
        assert resp.status_code == 404

    def test_track_without_auth_returns_401(self, client, food, address, auth_headers):
        order_data = _place_order(client, food, address, auth_headers)
        resp = client.get(f"/delivery/track/{order_data['id']}")
        assert resp.status_code == 401


class TestDeliveryQuoteEndpoint:
    def test_quote_endpoint_returns_all_fields(self, client):
        resp = client.post("/delivery/quote", json={"subtotal": 200})
        assert resp.status_code == 200
        for key in ("subtotal", "taxes", "delivery_fee", "discount", "total", "eta"):
            assert key in resp.json()

    def test_quote_applies_welcome50_promo(self, client):
        without = client.post("/delivery/quote", json={"subtotal": 300}).json()
        with_promo = client.post("/delivery/quote", json={
            "subtotal": 300, "promo_code": "WELCOME50"
        }).json()
        assert with_promo["total"] < without["total"]

    def test_quote_uses_restaurant_delivery_fee(self, client, restaurant, db):
        restaurant.delivery_fee = 75
        db.commit()

        resp = client.post("/delivery/quote", json={
            "subtotal": 100,
            "restaurant_id": restaurant.id,
        })
        assert resp.status_code == 200
        assert resp.json()["delivery_fee"] == 75

    def test_quote_with_invalid_promo_returns_400(self, client):
        resp = client.post("/delivery/quote", json={
            "subtotal": 200, "promo_code": "BADCODE"
        })
        assert resp.status_code == 400


class TestAdminOrderStatus:
    def test_admin_can_update_order_status(self, client, db, food, address,
                                           auth_headers, admin_headers, user):
        order_data = _place_order(client, food, address, auth_headers)
        order_id = order_data["id"]

        resp = client.patch(
            f"/admin/orders/{order_id}/status",
            json={"status": "Preparing"},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "Preparing"

    def test_admin_status_update_persisted_in_db(self, client, db, food, address,
                                                  auth_headers, admin_headers):
        order_data = _place_order(client, food, address, auth_headers)
        order_id = order_data["id"]

        client.patch(
            f"/admin/orders/{order_id}/status",
            json={"status": "Delivered"},
            headers=admin_headers,
        )

        db.expire_all()
        order = db.get(Order, order_id)
        assert order.status == "Delivered"

    def test_non_admin_cannot_update_order_status(self, client, food, address,
                                                   auth_headers):
        order_data = _place_order(client, food, address, auth_headers)
        resp = client.patch(
            f"/admin/orders/{order_data['id']}/status",
            json={"status": "Preparing"},
            headers=auth_headers,
        )
        assert resp.status_code == 403

    def test_admin_can_cancel_order(self, client, db, food, address,
                                    auth_headers, admin_headers):
        order_data = _place_order(client, food, address, auth_headers)
        resp = client.patch(
            f"/admin/orders/{order_data['id']}/status",
            json={"status": "Cancelled"},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "Cancelled"
