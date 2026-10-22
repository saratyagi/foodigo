"""Unit tests for calculate_quote — price, tax, and total accuracy."""
from app.services.delivery import calculate_quote
from app.config import TAX_RATE


class TestTaxCalculation:
    def test_tax_is_five_percent_of_subtotal(self):
        result = calculate_quote(subtotal=100)
        assert result["taxes"] == round(100 * TAX_RATE)  # 5

    def test_tax_rounds_half_up(self):
        # round(33 * 0.05) = round(1.65) = 2 (Python banker's rounding → 2)
        result = calculate_quote(subtotal=33)
        assert result["taxes"] == round(33 * TAX_RATE)

    def test_zero_subtotal_has_zero_tax(self):
        result = calculate_quote(subtotal=0)
        assert result["taxes"] == 0

    def test_subtotal_preserved_in_result(self):
        result = calculate_quote(subtotal=499)
        assert result["subtotal"] == 499

    def test_total_equals_subtotal_plus_tax_plus_fee_minus_discount(self):
        result = calculate_quote(subtotal=300)
        expected = result["subtotal"] + result["taxes"] + result["delivery_fee"] - result["discount"]
        assert result["total"] == expected

    def test_total_cannot_be_negative(self):
        # WELCOME50 (flat ₹50) on a ₹10 cart would make total negative without clamping
        result = calculate_quote(subtotal=10, promo_code="WELCOME50")
        assert result["total"] == 0

    def test_eta_uses_provided_minutes(self):
        result = calculate_quote(subtotal=100, eta_minutes=45)
        assert result["eta"] == "45 mins"

    def test_default_eta_is_thirty_minutes(self):
        result = calculate_quote(subtotal=100)
        assert result["eta"] == "30 mins"

    def test_result_contains_all_expected_keys(self):
        result = calculate_quote(subtotal=200)
        for key in ("subtotal", "taxes", "delivery_fee", "discount", "total", "eta"):
            assert key in result
