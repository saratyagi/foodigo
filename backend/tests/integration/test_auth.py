"""Integration tests for /auth endpoints."""


class TestSignup:
    def test_signup_returns_201_and_token(self, client):
        resp = client.post("/auth/signup", json={
            "name": "Alice",
            "email": "alice@example.com",
            "phone": "9123456789",
            "password": "secure123",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == "alice@example.com"

    def test_signup_does_not_expose_hashed_password(self, client):
        resp = client.post("/auth/signup", json={
            "name": "Bob",
            "email": "bob@example.com",
            "phone": "9000000001",
            "password": "mypassword",
        })
        user = resp.json()["user"]
        assert "password" not in user

    def test_signup_duplicate_email_returns_400(self, client, user):
        resp = client.post("/auth/signup", json={
            "name": "Dup",
            "email": user.email,
            "phone": "9000000002",
            "password": "anotherpass",
        })
        assert resp.status_code == 400

    def test_signup_invalid_email_returns_422(self, client):
        resp = client.post("/auth/signup", json={
            "name": "Bad Email",
            "email": "not-an-email",
            "phone": "9000000003",
            "password": "password",
        })
        assert resp.status_code == 422

    def test_signup_missing_name_returns_422(self, client):
        resp = client.post("/auth/signup", json={
            "email": "noname@example.com",
            "password": "password",
        })
        assert resp.status_code == 422


class TestLogin:
    def test_login_correct_credentials_returns_token(self, client, user):
        resp = client.post("/auth/login", json={
            "email": user.email,
            "password": "password123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == user.email

    def test_login_wrong_password_returns_401(self, client, user):
        resp = client.post("/auth/login", json={
            "email": user.email,
            "password": "wrongpassword",
        })
        assert resp.status_code == 401

    def test_login_nonexistent_user_returns_401(self, client):
        resp = client.post("/auth/login", json={
            "email": "nobody@example.com",
            "password": "whatever",
        })
        assert resp.status_code == 401


class TestGetMe:
    def test_me_returns_current_user(self, client, user, auth_headers):
        resp = client.get("/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["email"] == user.email
        assert resp.json()["name"] == user.name

    def test_me_without_token_returns_401(self, client):
        resp = client.get("/auth/me")
        assert resp.status_code == 401

    def test_me_with_invalid_token_returns_401(self, client):
        resp = client.get("/auth/me", headers={"Authorization": "Bearer totally.invalid.token"})
        assert resp.status_code == 401

    def test_update_me_changes_name(self, client, auth_headers):
        resp = client.patch("/auth/me", json={"name": "Updated Name"}, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Name"

    def test_update_me_without_token_returns_401(self, client):
        resp = client.patch("/auth/me", json={"name": "NoAuth"})
        assert resp.status_code == 401


class TestProtectedRoutes:
    def test_token_from_signup_grants_access_to_me(self, client):
        signup_resp = client.post("/auth/signup", json={
            "name": "Charlie",
            "email": "charlie@example.com",
            "phone": "9000000010",
            "password": "charlie123",
        })
        token = signup_resp.json()["access_token"]
        me_resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == "charlie@example.com"

    def test_token_from_login_grants_access_to_me(self, client, user):
        login_resp = client.post("/auth/login", json={
            "email": user.email,
            "password": "password123",
        })
        token = login_resp.json()["access_token"]
        me_resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
