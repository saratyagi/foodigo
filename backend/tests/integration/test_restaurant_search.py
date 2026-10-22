"""Integration tests for restaurant listing and food search endpoints."""
from app.models.food import Food
from app.models.restaurant import Restaurant


class TestRestaurantList:
    def test_list_returns_all_restaurants(self, client, restaurant, db):
        # add a second restaurant
        rest2 = Restaurant(name="Second Restaurant", delivery_fee=30)
        db.add(rest2)
        db.flush()

        resp = client.get("/restaurants")
        assert resp.status_code == 200
        names = [r["name"] for r in resp.json()]
        assert "Test Restaurant" in names
        assert "Second Restaurant" in names

    def test_list_empty_when_no_restaurants(self, client):
        resp = client.get("/restaurants")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_get_restaurant_by_id(self, client, restaurant):
        resp = client.get(f"/restaurants/{restaurant.id}")
        assert resp.status_code == 200
        assert resp.json()["name"] == restaurant.name

    def test_get_nonexistent_restaurant_returns_404(self, client):
        resp = client.get("/restaurants/99999")
        assert resp.status_code == 404


class TestFoodList:
    def test_list_returns_available_foods(self, client, food):
        resp = client.get("/foods")
        assert resp.status_code == 200
        ids = [f["id"] for f in resp.json()]
        assert food.id in ids

    def test_unavailable_foods_are_excluded(self, client, db, restaurant, category):
        unavailable = Food(
            restaurant_id=restaurant.id,
            category_id=category.id,
            name="Unavailable Burger",
            price=199,
            available=False,
        )
        db.add(unavailable)
        db.flush()

        resp = client.get("/foods")
        ids = [f["id"] for f in resp.json()]
        assert unavailable.id not in ids

    def test_filter_by_restaurant(self, client, food):
        resp = client.get(f"/foods?restaurant={food.restaurant_id}")
        assert resp.status_code == 200
        for f in resp.json():
            assert f["restaurant_id"] == food.restaurant_id

    def test_filter_veg_only(self, client, db, restaurant, category):
        non_veg = Food(
            restaurant_id=restaurant.id,
            category_id=category.id,
            name="Chicken Burger",
            price=199,
            veg=False,
            available=True,
        )
        db.add(non_veg)
        db.flush()

        resp = client.get("/foods?veg=true")
        for f in resp.json():
            assert f["veg"] is True

    def test_search_by_name(self, client, food):
        resp = client.get(f"/foods?search=Margherita")
        assert resp.status_code == 200
        assert any(f["name"] == food.name for f in resp.json())

    def test_search_no_match_returns_empty(self, client, food):
        resp = client.get("/foods?search=XYZ_NONEXISTENT_FOOD_ABC")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_sort_price_ascending(self, client, db, restaurant, category):
        for price in [300, 100, 200]:
            db.add(Food(
                restaurant_id=restaurant.id,
                category_id=category.id,
                name=f"Food {price}",
                price=price,
                available=True,
            ))
        db.flush()

        resp = client.get("/foods?sort=price_asc")
        prices = [f["price"] for f in resp.json()]
        assert prices == sorted(prices)

    def test_sort_price_descending(self, client, db, restaurant, category):
        for price in [300, 100, 200]:
            db.add(Food(
                restaurant_id=restaurant.id,
                category_id=category.id,
                name=f"Desc Food {price}",
                price=price,
                available=True,
            ))
        db.flush()

        resp = client.get("/foods?sort=price_desc")
        prices = [f["price"] for f in resp.json()]
        assert prices == sorted(prices, reverse=True)

    def test_limit_parameter_restricts_results(self, client, db, restaurant, category):
        for i in range(5):
            db.add(Food(
                restaurant_id=restaurant.id,
                category_id=category.id,
                name=f"Food {i}",
                price=100 + i,
                available=True,
            ))
        db.flush()

        resp = client.get("/foods?limit=2")
        assert len(resp.json()) <= 2


class TestFoodDietFilter:
    def test_vegan_diet_filter(self, client, food):
        # food fixture has diet_tags="vegan"
        resp = client.get("/foods?diet=vegan")
        ids = [f["id"] for f in resp.json()]
        assert food.id in ids

    def test_high_protein_filter_includes_food_with_enough_protein(self, client, db, restaurant, category):
        high_protein_food = Food(
            restaurant_id=restaurant.id,
            category_id=category.id,
            name="Protein Bowl",
            price=299,
            available=True,
            protein_g=25.0,
        )
        db.add(high_protein_food)
        db.flush()

        resp = client.get("/foods?diet=high-protein")
        ids = [f["id"] for f in resp.json()]
        assert high_protein_food.id in ids

    def test_high_protein_filter_excludes_low_protein_food(self, client, db, restaurant, category):
        low_protein = Food(
            restaurant_id=restaurant.id,
            category_id=category.id,
            name="Plain Rice",
            price=99,
            available=True,
            protein_g=5.0,
        )
        db.add(low_protein)
        db.flush()

        resp = client.get("/foods?diet=high-protein")
        ids = [f["id"] for f in resp.json()]
        assert low_protein.id not in ids


class TestSearchEndpoint:
    def test_search_returns_foods_and_restaurants(self, client, food, restaurant):
        resp = client.get("/search?q=Test")
        assert resp.status_code == 200
        data = resp.json()
        assert "foods" in data
        assert "restaurants" in data

    def test_search_finds_food_by_partial_name(self, client, food):
        resp = client.get("/search?q=Margherita")
        assert resp.status_code == 200
        ids = [f["id"] for f in resp.json()["foods"]]
        assert food.id in ids

    def test_search_finds_restaurant_by_name(self, client, restaurant):
        resp = client.get("/search?q=Test+Restaurant")
        assert resp.status_code == 200
        ids = [r["id"] for r in resp.json()["restaurants"]]
        assert restaurant.id in ids
