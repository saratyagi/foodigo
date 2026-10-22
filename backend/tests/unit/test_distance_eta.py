"""Unit tests for ETA delivery-time string and order auto-status logic."""
from app.services.delivery import (
    calculate_quote,
    compute_auto_status,
    get_tracking_timeline,
    STATUS_FLOW,
)


class TestEtaString:
    def test_eta_reflects_provided_minutes(self):
        result = calculate_quote(subtotal=100, eta_minutes=45)
        assert result["eta"] == "45 mins"

    def test_default_eta_is_thirty_minutes(self):
        result = calculate_quote(subtotal=100)
        assert result["eta"] == "30 mins"

    def test_eta_format_is_string(self):
        result = calculate_quote(subtotal=100, eta_minutes=20)
        assert isinstance(result["eta"], str)


class TestComputeAutoStatus:
    def test_zero_elapsed_is_confirmed(self):
        assert compute_auto_status(0) == "Confirmed"

    def test_just_under_one_minute_is_confirmed(self):
        assert compute_auto_status(0.99) == "Confirmed"

    def test_exactly_one_minute_is_preparing(self):
        assert compute_auto_status(1) == "Preparing"

    def test_two_and_half_minutes_is_preparing(self):
        assert compute_auto_status(2.5) == "Preparing"

    def test_exactly_three_minutes_is_cooking(self):
        assert compute_auto_status(3) == "Cooking"

    def test_five_minutes_is_cooking(self):
        assert compute_auto_status(5) == "Cooking"

    def test_exactly_six_minutes_is_out_for_delivery(self):
        assert compute_auto_status(6) == "Out for Delivery"

    def test_eleven_minutes_is_out_for_delivery(self):
        assert compute_auto_status(11) == "Out for Delivery"

    def test_exactly_twelve_minutes_is_delivered(self):
        assert compute_auto_status(12) == "Delivered"

    def test_large_elapsed_is_delivered(self):
        assert compute_auto_status(999) == "Delivered"

    def test_status_flow_order_is_correct(self):
        """Thresholds must increase monotonically with the STATUS_FLOW."""
        expected = ["Confirmed", "Preparing", "Cooking", "Out for Delivery", "Delivered"]
        assert STATUS_FLOW == expected


class TestGetTrackingTimeline:
    def test_confirmed_marks_only_first_step_done(self):
        timeline = get_tracking_timeline("Confirmed")
        steps = {s["status"]: s["done"] for s in timeline}
        assert steps["Confirmed"] is True
        assert steps["Preparing"] is False
        assert steps["Delivered"] is False

    def test_delivered_marks_all_steps_done(self):
        timeline = get_tracking_timeline("Delivered")
        assert all(s["done"] for s in timeline)

    def test_out_for_delivery_marks_four_steps_done(self):
        timeline = get_tracking_timeline("Out for Delivery")
        done = [s["status"] for s in timeline if s["done"]]
        assert done == ["Confirmed", "Preparing", "Cooking", "Out for Delivery"]

    def test_cancelled_appends_cancelled_step_as_done(self):
        timeline = get_tracking_timeline("Cancelled")
        last = timeline[-1]
        assert last["status"] == "Cancelled"
        assert last["done"] is True

    def test_cancelled_normal_steps_are_all_not_done(self):
        timeline = get_tracking_timeline("Cancelled")
        normal = [s for s in timeline if s["status"] != "Cancelled"]
        assert not any(s["done"] for s in normal)

    def test_timeline_always_contains_all_status_flow_statuses(self):
        for status in STATUS_FLOW:
            timeline = get_tracking_timeline(status)
            present = {s["status"] for s in timeline}
            for expected in STATUS_FLOW:
                assert expected in present
