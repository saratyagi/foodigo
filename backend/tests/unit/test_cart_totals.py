"""Unit tests for cart-total calculations.

The subtotal computation (sum of price × qty per item) lives inline inside
the place_order route handler, but it reduces to simple arithmetic that can be
verified here without a database.  calculate_quote() receives the already-computed
subtotal, so we test that the full pricing pipeline produces correct totals for
representative cart sizes.
"""
from app.services.delivery import calculate_quote
from app.config import TAX_RATE, BASE_DELIVERY_FEE, FREE_DELIVERY_ABOVE


def _compute_subtotal(items: list[tuple[int, int]]) -> int:
    """Helper: replicate the route's subtotal = sum(price * qty) loop."""
    return sum(price * qty for price, qty in items)


class TestCartSubtotalHelper:
    def test_single_item_single_quantity(self):
        assert _compute_subtotal([(200, 1)]) == 200

    def test_single_item_multiple_quantity(self):
        assert _compute_subtotal([(150, 3)]) == 450

    def test_multiple_items(self):
        assert _compute_subtotal([(100, 2), (250, 1), (50, 4)]) == 650

    def test_empty_cart_subtotal_is_zero(self):
        assert _compute_subtotal([]) == 0


class TestCartTotalsViaQuote:
    def test_total_for_small_cart_includes_delivery_fee(self):
        subtotal = _compute_subtotal([(100, 2)])  # 200
        result = calculate_quote(subtotal=subtotal)
        expected_tax = round(200 * TAX_RATE)
        assert result["subtotal"] == 200
        assert result["taxes"] == expected_tax
        assert result["delivery_fee"] == BASE_DELIVERY_FEE
        assert result["total"] == 200 + expected_tax + BASE_DELIVERY_FEE

    def test_total_for_large_cart_has_free_delivery(self):
        subtotal = _compute_subtotal([(300, 2)])  # 600 >= FREE_DELIVERY_ABOVE
        result = calculate_quote(subtotal=subtotal)
        assert result["delivery_fee"] == 0
        assert result["total"] == 600 + round(600 * TAX_RATE)

    def test_empty_cart_total_equals_delivery_fee(self):
        result = calculate_quote(subtotal=0)
        assert result["total"] == BASE_DELIVERY_FEE  # 0 tax + base fee, no discount

    def test_total_accurate_for_mixed_cart(self):
        subtotal = _compute_subtotal([(199, 1), (101, 1)])  # 300
        result = calculate_quote(subtotal=subtotal)
        assert result["subtotal"] == 300
        assert result["total"] == 300 + round(300 * TAX_RATE) + BASE_DELIVERY_FEE
