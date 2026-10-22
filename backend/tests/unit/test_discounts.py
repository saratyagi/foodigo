"""Unit tests for promo-code / discount logic in calculate_quote."""
from app.services.delivery import calculate_quote


class TestWelcome50:
    def test_applies_flat_fifty_discount(self):
        result = calculate_quote(subtotal=300, promo_code="WELCOME50")
        assert result["discount"] == 50

    def test_discount_reduces_total_by_fifty(self):
        without = calculate_quote(subtotal=300)
        with_promo = calculate_quote(subtotal=300, promo_code="WELCOME50")
        assert with_promo["total"] == without["total"] - 50

    def test_discount_clamped_when_exceeds_total(self):
        result = calculate_quote(subtotal=10, promo_code="WELCOME50")
        assert result["total"] == 0

    def test_case_insensitive_lowercase(self):
        result = calculate_quote(subtotal=300, promo_code="welcome50")
        assert result["discount"] == 50

    def test_case_insensitive_mixed(self):
        result = calculate_quote(subtotal=300, promo_code="Welcome50")
        assert result["discount"] == 50


class TestSave20:
    def test_applies_twenty_percent_of_subtotal(self):
        result = calculate_quote(subtotal=300, promo_code="SAVE20")
        assert result["discount"] == round(300 * 0.20)

    def test_discount_is_rounded(self):
        # round(33 * 0.20) = round(6.6) = 7
        result = calculate_quote(subtotal=33, promo_code="SAVE20")
        assert result["discount"] == round(33 * 0.20)

    def test_reduces_total_correctly(self):
        result = calculate_quote(subtotal=500, promo_code="SAVE20")
        discount = round(500 * 0.20)
        expected_total = 500 + round(500 * 0.05) + 0 - discount  # free delivery
        assert result["total"] == expected_total


class TestNoDiscount:
    def test_none_promo_code_gives_no_discount(self):
        result = calculate_quote(subtotal=300, promo_code=None)
        assert result["discount"] == 0

    def test_invalid_code_gives_no_discount(self):
        result = calculate_quote(subtotal=300, promo_code="NOTACODE")
        assert result["discount"] == 0

    def test_empty_string_gives_no_discount(self):
        result = calculate_quote(subtotal=300, promo_code="")
        assert result["discount"] == 0

    def test_discount_key_present_even_when_zero(self):
        result = calculate_quote(subtotal=300)
        assert "discount" in result
        assert result["discount"] == 0
