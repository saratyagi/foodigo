from app.config import TAX_RATE, BASE_DELIVERY_FEE, FREE_DELIVERY_ABOVE, DEFAULT_ETA_MINUTES

STATUS_FLOW = ["Confirmed", "Preparing", "Cooking", "Out for Delivery", "Delivered"]

PROMO_CODES: dict[str, dict] = {
    "WELCOME50": {"type": "flat",    "value": 50},
    "SAVE20":    {"type": "percent", "value": 20},
}

# Minutes elapsed since order placement → auto-advance to this status (demo pacing)
_AUTO_ADVANCE = [
    (12, "Delivered"),
    (6,  "Out for Delivery"),
    (3,  "Cooking"),
    (1,  "Preparing"),
]


def compute_auto_status(elapsed_minutes: float) -> str:
    for minutes, status in _AUTO_ADVANCE:
        if elapsed_minutes >= minutes:
            return status
    return "Confirmed"


def calculate_quote(
    subtotal: int,
    restaurant_delivery_fee: int = BASE_DELIVERY_FEE,
    promo_code: str | None = None,
    eta_minutes: int = DEFAULT_ETA_MINUTES,
) -> dict:
    taxes = round(subtotal * TAX_RATE)
    delivery_fee = 0 if subtotal >= FREE_DELIVERY_ABOVE else restaurant_delivery_fee

    discount = 0
    if promo_code:
        promo = PROMO_CODES.get(promo_code.upper())
        if promo:
            discount = promo["value"] if promo["type"] == "flat" else round(subtotal * promo["value"] / 100)

    total = max(0, subtotal + taxes + delivery_fee - discount)
    return {
        "subtotal": subtotal,
        "taxes": taxes,
        "delivery_fee": delivery_fee,
        "discount": discount,
        "total": total,
        "eta": f"{eta_minutes} mins",
    }


def get_tracking_timeline(current_status: str) -> list[dict]:
    if current_status == "Cancelled":
        steps = [{"status": s, "done": False} for s in STATUS_FLOW]
        steps.append({"status": "Cancelled", "done": True})
        return steps

    current_idx = STATUS_FLOW.index(current_status) if current_status in STATUS_FLOW else -1
    return [{"status": s, "done": i <= current_idx} for i, s in enumerate(STATUS_FLOW)]
