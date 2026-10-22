"""
Seed script — run once to populate the database.
Run from backend/:  py -3.12 -m app.seed
"""

from app.database import SessionLocal, engine, Base
import app.models  # register all models with Base

from app.models.category import Category
from app.models.restaurant import Restaurant
from app.models.food import Food

Base.metadata.create_all(bind=engine)


def slugify(name: str) -> str:
    return name.lower().replace(" ", "-").replace("'", "").replace(",", "")


CATEGORIES = [
    {"name": "Pizza",    "image": "/images/categories/pizza.png"},
    {"name": "Burgers",  "image": "/images/categories/burger.png"},
    {"name": "Pasta",    "image": "/images/categories/pasta.png"},
    {"name": "Indian",   "image": "/images/categories/indian.png"},
    {"name": "Rice",     "image": "/images/categories/rice.png"},
    {"name": "Noodles",  "image": "/images/categories/noodles.png"},
    {"name": "Desserts", "image": "/images/categories/desserts.png"},
    {"name": "Drinks",   "image": "/images/categories/drinks.png"},
]

RESTAURANTS = [
    {
        "name": "Zesty Kitchen",
        "image": "/images/restaurants/zesty-kitchen.jpg",
        "rating": 4.3,
        "delivery_time": "25 mins",
        "address": "12 MG Road, Delhi",
        "price_for_two": 500,
        "min_order": 199,
        "delivery_fee": 40,
        "open_hours": "10:00 AM - 11:00 PM",
    },
    {
        "name": "Burger Republic",
        "image": "/images/restaurants/burger-republic.jpg",
        "rating": 4.1,
        "delivery_time": "20 mins",
        "address": "34 Connaught Place, Delhi",
        "price_for_two": 350,
        "min_order": 149,
        "delivery_fee": 40,
        "open_hours": "11:00 AM - 12:00 AM",
    },
    {
        "name": "Desi Tadka",
        "image": "/images/restaurants/desi-tadka.jpg",
        "rating": 4.5,
        "delivery_time": "35 mins",
        "address": "7 Lajpat Nagar, Delhi",
        "price_for_two": 600,
        "min_order": 249,
        "delivery_fee": 40,
        "open_hours": "09:00 AM - 11:00 PM",
    },
    {
        "name": "Noodle Bowl",
        "image": "/images/restaurants/noodle-bowl.jpg",
        "rating": 4.0,
        "delivery_time": "30 mins",
        "address": "22 Hauz Khas, Delhi",
        "price_for_two": 400,
        "min_order": 199,
        "delivery_fee": 40,
        "open_hours": "12:00 PM - 11:00 PM",
    },
    {
        "name": "Sweet Spot",
        "image": "/images/restaurants/sweet-spot.jpg",
        "rating": 4.6,
        "delivery_time": "20 mins",
        "address": "5 Saket, Delhi",
        "price_for_two": 300,
        "min_order": 99,
        "delivery_fee": 0,
        "open_hours": "10:00 AM - 11:00 PM",
    },
]

# Columns:
# (rest_idx, cat_name, name, description, price, veg, rating,
#  calories, protein_g, carbs_g, fat_g, diet_tags, temp_tags)
FOODS = [
    # ── Zesty Kitchen (0) — Pizza & Pasta ────────────────────────────────────
    (0, "Pizza", "Margherita Pizza",    "Classic tomato base with fresh mozzarella",        249, True,  4.5, 320, 12.0, 42.0, 10.0, "jain",                        "rainy"),
    (0, "Pizza", "Farmhouse Pizza",     "Loaded with capsicum, onion, mushrooms & corn",    379, True,  4.3, 380, 14.0, 48.0, 14.0, "jain",                        "rainy"),
    (0, "Pizza", "Veggie Supreme",      "A garden-fresh feast on a crispy crust",           399, True,  4.2, 360, 13.0, 46.0, 12.0, "jain",                        "rainy"),
    (0, "Pizza", "Cheese Burst Pizza",  "Extra cheese stuffed into every bite",             449, True,  4.6, 480, 18.0, 52.0, 22.0, "jain",                        "rainy"),
    (0, "Pizza", "Paneer Tikka Pizza",  "Tandoori paneer with mint chutney drizzle",        429, True,  4.4, 440, 20.0, 46.0, 16.0, "jain,high-protein",           "rainy"),
    (0, "Pizza", "Pepperoni Pizza",     "Spicy pepperoni slices on tangy tomato sauce",     499, False, 4.7, 520, 24.0, 44.0, 24.0, "high-protein",                "rainy"),
    (0, "Pasta", "Alfredo Pasta",       "Creamy white sauce with garlic and parmesan",      269, True,  4.3, 380, 12.0, 48.0, 16.0, "jain",                        "rainy"),
    (0, "Pasta", "Red Sauce Pasta",     "Rustic tomato basil sauce with penne",             249, True,  4.2, 280, 9.0,  50.0, 5.0,  "vegan,jain,dairy-free",       "rainy"),
    (0, "Pasta", "White Sauce Pasta",   "Béchamel sauce with herbs and mushrooms",          279, True,  4.1, 360, 11.0, 44.0, 15.0, "jain",                        "rainy"),
    (0, "Pasta", "Arrabbiata Pasta",    "Fiery tomato sauce with red chillies",             299, True,  4.4, 270, 9.0,  48.0, 6.0,  "vegan,jain,dairy-free",       "rainy"),

    # ── Burger Republic (1) ───────────────────────────────────────────────────
    (1, "Burgers", "Veg Burger",            "Crispy veggie patty with fresh lettuce",       129, True,  4.0, 290, 9.0,  42.0, 9.0,  "jain",                        ""),
    (1, "Burgers", "Cheese Burger",         "Melted cheese on a juicy potato patty",        159, True,  4.2, 340, 12.0, 44.0, 13.0, "jain",                        ""),
    (1, "Burgers", "Crispy Chicken Burger", "Golden fried chicken with sriracha mayo",      199, False, 4.5, 420, 22.0, 46.0, 16.0, "high-protein",                ""),
    (1, "Burgers", "Double Patty Burger",   "Double the patty, double the joy",             249, False, 4.6, 560, 30.0, 48.0, 28.0, "high-protein",                ""),
    (1, "Burgers", "Paneer Burger",         "Grilled paneer tikka in a sesame bun",         179, True,  4.3, 350, 20.0, 40.0, 14.0, "jain,high-protein",           ""),

    # ── Desi Tadka (2) — Indian & Rice ───────────────────────────────────────
    (2, "Indian", "Butter Chicken",       "Slow-cooked chicken in velvety tomato gravy",   349, False, 4.7, 380, 28.0, 12.0, 24.0, "high-protein,keto,gluten-free","winter"),
    (2, "Indian", "Paneer Butter Masala", "Cottage cheese in rich butter-tomato sauce",    299, True,  4.6, 320, 16.0, 14.0, 22.0, "jain,gluten-free",            "winter"),
    (2, "Indian", "Dal Makhani",          "Overnight slow-cooked black lentils",           249, True,  4.5, 280, 12.0, 32.0, 12.0, "jain,gluten-free",            "winter"),
    (2, "Indian", "Shahi Paneer",         "Paneer in a royal cashew-cream gravy",          299, True,  4.4, 350, 18.0, 16.0, 24.0, "jain,gluten-free",            "winter"),
    (2, "Indian", "Kadhai Chicken",       "Wok-tossed chicken with bell peppers",          379, False, 4.5, 340, 30.0, 14.0, 18.0, "high-protein,gluten-free,keto","winter"),
    (2, "Indian", "Chole Bhature",        "Fluffy bhature with spiced chickpea curry",     179, True,  4.3, 480, 14.0, 68.0, 18.0, "vegan,jain,dairy-free",       ""),
    (2, "Rice",   "Veg Biryani",          "Fragrant basmati with seasonal vegetables",     249, True,  4.2, 320, 8.0,  58.0, 8.0,  "gluten-free,jain",            "winter"),
    (2, "Rice",   "Chicken Biryani",      "Dum-cooked chicken biryani with saffron",       349, False, 4.8, 420, 28.0, 56.0, 12.0, "gluten-free,high-protein",    "winter"),
    (2, "Rice",   "Paneer Biryani",       "Aromatic rice with marinated paneer",           289, True,  4.3, 360, 16.0, 54.0, 10.0, "gluten-free,jain",            "winter"),
    (2, "Rice",   "Fried Rice",           "Wok-tossed rice with vegetables and soy sauce", 199, True,  4.1, 280, 7.0,  52.0, 6.0,  "vegan,jain,dairy-free,gluten-free","rainy"),

    # ── Noodle Bowl (3) ──────────────────────────────────────────────────────
    (3, "Noodles", "Hakka Noodles",    "Classic Indo-Chinese tossed noodles",              199, True,  4.2, 280, 8.0,  48.0, 7.0,  "vegan,dairy-free",            "rainy"),
    (3, "Noodles", "Schezwan Noodles", "Spicy Schezwan sauce noodles with veggies",        229, True,  4.4, 300, 8.0,  50.0, 9.0,  "vegan,dairy-free",            "rainy"),
    (3, "Noodles", "Chicken Noodles",  "Stir-fried noodles with shredded chicken",         249, False, 4.5, 320, 24.0, 44.0, 8.0,  "high-protein,dairy-free",     "rainy"),
    (3, "Noodles", "Veg Chowmein",     "Street-style chowmein with fresh vegetables",      189, True,  4.1, 260, 7.0,  46.0, 6.0,  "vegan,dairy-free",            "rainy"),

    # ── Sweet Spot (4) — Desserts & Drinks ───────────────────────────────────
    (4, "Desserts", "Brownie",             "Warm fudgy chocolate brownie",                 149, True,  4.6, 280, 4.0,  36.0, 14.0, "jain",                        ""),
    (4, "Desserts", "Chocolate Lava Cake", "Molten chocolate centre in a soft cake",       169, True,  4.7, 320, 5.0,  40.0, 16.0, "jain",                        ""),
    (4, "Desserts", "Cheesecake",          "New York-style baked cheesecake slice",        229, True,  4.5, 380, 6.0,  44.0, 20.0, "jain",                        ""),
    (4, "Desserts", "Gulab Jamun",         "Soft milk dumplings soaked in rose syrup",      99, True,  4.4, 260, 6.0,  44.0, 8.0,  "jain,gluten-free",            ""),
    (4, "Desserts", "Ice Cream Sundae",    "3-scoop vanilla with hot fudge and nuts",      199, True,  4.6, 280, 5.0,  42.0, 11.0, "jain,gluten-free",            "hot"),
    (4, "Drinks",   "Coca Cola",           "Ice-cold classic cola",                         60, True,  4.0, 140, 0.0,  36.0, 0.0,  "vegan,dairy-free,gluten-free","hot"),
    (4, "Drinks",   "Sprite",              "Crisp lemon-lime soda",                         60, True,  4.0, 140, 0.0,  36.0, 0.0,  "vegan,dairy-free,gluten-free","hot"),
    (4, "Drinks",   "Lemon Iced Tea",      "Chilled brewed tea with lemon",                 99, True,  4.2,  80, 0.0,  20.0, 0.0,  "vegan,dairy-free,gluten-free,low-cal","hot"),
    (4, "Drinks",   "Cold Coffee",         "Blended cold coffee with ice cream",           149, True,  4.5, 180, 4.0,  28.0, 6.0,  "jain,gluten-free",            "hot"),
    (4, "Drinks",   "Oreo Shake",          "Thick Oreo milkshake topped with whipped cream",199,True, 4.6, 380, 7.0,  54.0, 16.0, "jain",                        "hot"),
    (4, "Drinks",   "Mango Smoothie",      "Fresh mango blended with yoghurt",             179, True,  4.4, 220, 5.0,  46.0, 3.0,  "vegan,dairy-free,gluten-free","hot"),
]


def seed():
    db = SessionLocal()
    try:
        if db.query(Category).count() > 0:
            print("Database already seeded — skipping.")
            return

        print("Seeding categories...")
        category_map: dict[str, int] = {}
        for c in CATEGORIES:
            obj = Category(**c)
            db.add(obj)
            db.flush()
            category_map[c["name"]] = obj.id

        print("Seeding restaurants...")
        restaurant_objs: list[Restaurant] = []
        for r in RESTAURANTS:
            obj = Restaurant(**r)
            db.add(obj)
            db.flush()
            restaurant_objs.append(obj)

        print("Seeding foods...")
        for (rest_idx, cat_name, name, desc, price, veg, rating,
             calories, protein_g, carbs_g, fat_g, diet_tags, temp_tags) in FOODS:
            db.add(Food(
                restaurant_id=restaurant_objs[rest_idx].id,
                category_id=category_map[cat_name],
                name=name,
                description=desc,
                price=price,
                veg=veg,
                rating=rating,
                slug=slugify(name),
                image=f"/images/foods/{slugify(name)}.jpg",
                available=True,
                calories=calories,
                protein_g=protein_g,
                carbs_g=carbs_g,
                fat_g=fat_g,
                diet_tags=diet_tags,
                temp_tags=temp_tags,
            ))

        db.commit()
        print(
            f"\nDone! Inserted:\n"
            f"  {len(CATEGORIES)} categories\n"
            f"  {len(RESTAURANTS)} restaurants\n"
            f"  {len(FOODS)} foods"
        )

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
