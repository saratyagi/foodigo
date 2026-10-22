"""Smoke test — verifies the test harness is wired up correctly end-to-end."""


def test_health_endpoint_returns_ok(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "app": "Foodigo API"}


def test_root_endpoint_returns_ok(client):
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
