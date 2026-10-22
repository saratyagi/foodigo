"""Unit tests for delivery-fee rules in calculate_quote."""
from app.services.delivery import calculate_quote
from app.config import FREE_DELIVERY_ABOVE, BASE_DELIVERY_FEE


class TestDeliveryFee:
    def test_fee_applied_one_rupee_below_threshold(self):
        result = calculate_quote(subtotal=FREE_DELIVERY_ABOVE - 1)
        assert result["delivery_fee"] == BASE_DELIVERY_FEE

    def test_free_delivery_exactly_at_threshold(self):
        result = calculate_quote(subtotal=FREE_DELIVERY_ABOVE)
        assert result["delivery_fee"] == 0

    def test_free_delivery_well_above_threshold(self):
        result = calculate_quote(subtotal=FREE_DELIVERY_ABOVE + 500)
        assert result["delivery_fee"] == 0

    def test_custom_restaurant_fee_used_below_threshold(self):
        result = calculate_quote(subtotal=100, restaurant_delivery_fee=70)
        assert result["delivery_fee"] == 70

    def test_custom_restaurant_fee_waived_above_threshold(self):
        result = calculate_quote(subtotal=600, restaurant_delivery_fee=80)
        assert result["delivery_fee"] == 0

    def test_default_fee_is_base_when_no_custom_fee_given(self):
        result = calculate_quote(subtotal=100)
        assert result["delivery_fee"] == BASE_DELIVERY_FEE

    def test_zero_subtotal_still_incurs_delivery_fee(self):
        result = calculate_quote(subtotal=0)
        assert result["delivery_fee"] == BASE_DELIVERY_FEE

    def test_delivery_fee_included_in_total_below_threshold(self):
        result = calculate_quote(subtotal=200)
        assert result["total"] == result["subtotal"] + result["taxes"] + result["delivery_fee"]
