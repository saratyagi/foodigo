"""
Downloads food-matching images from Wikimedia Commons (full-size, no thumbnail size restrictions).
No API keys required. Run: venv\Scripts\python.exe download_food_images.py
"""
import urllib.request, urllib.parse, os, ssl, shutil, time

OUTPUT = os.path.join(os.path.dirname(__file__), "static", "images", "foods")
os.makedirs(OUTPUT, exist_ok=True)

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

UA = {"User-Agent": "Mozilla/5.0 (compatible; Foodigo/1.0)"}

# Full-size Wikimedia Commons URLs (no /thumb/ path = no size restriction)
IMAGES = {
    # Pizza
    "margherita-pizza":     "https://upload.wikimedia.org/wikipedia/commons/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg",
    "farmhouse-pizza":      "https://upload.wikimedia.org/wikipedia/commons/1/13/Pizza_Campania.jpg",
    "veggie-supreme":       "https://upload.wikimedia.org/wikipedia/commons/b/b2/Pizza_Vegetaria.jpg",
    "cheese-burst-pizza":   "https://upload.wikimedia.org/wikipedia/commons/9/91/Pizza-3007395.jpg",
    "paneer-tikka-pizza":   "https://upload.wikimedia.org/wikipedia/commons/d/d3/Supreme_pizza.jpg",
    "pepperoni-pizza":      "https://upload.wikimedia.org/wikipedia/commons/f/f9/Pizza_3000_cr.jpg",
    # Pasta
    "alfredo-pasta":        "https://upload.wikimedia.org/wikipedia/commons/b/b4/Fettucine_Alfredo_%281%29.jpg",
    "red-sauce-pasta":      "https://upload.wikimedia.org/wikipedia/commons/2/20/Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg",
    "white-sauce-pasta":    "https://upload.wikimedia.org/wikipedia/commons/8/82/Cajun_pasta.jpg",
    "arrabbiata-pasta":     "https://upload.wikimedia.org/wikipedia/commons/8/83/Penne_all%27arrabbiata.jpg",
    # Burgers
    "veg-burger":           "https://upload.wikimedia.org/wikipedia/commons/8/8a/Veggie_burger.jpg",
    "cheese-burger":        "https://upload.wikimedia.org/wikipedia/commons/4/4d/Cheeseburger.jpg",
    "crispy-chicken-burger":"https://upload.wikimedia.org/wikipedia/commons/7/74/Chick-fil-A_Chicken_Sandwich.jpg",
    "double-patty-burger":  "https://upload.wikimedia.org/wikipedia/commons/0/0b/Gatto_Burger.jpg",
    "paneer-burger":        "https://upload.wikimedia.org/wikipedia/commons/4/4d/Cheeseburger.jpg",
    # Indian
    "butter-chicken":       "https://upload.wikimedia.org/wikipedia/commons/4/41/Butter_Chicken_%26_Butter_Naan.jpg",
    "paneer-butter-masala": "https://upload.wikimedia.org/wikipedia/commons/2/28/Paneer_butter_masala.jpg",
    "dal-makhani":          "https://upload.wikimedia.org/wikipedia/commons/1/15/Dal_makhani_in_a_bowl.jpg",
    "shahi-paneer":         "https://upload.wikimedia.org/wikipedia/commons/3/3d/Shahi_paneer.jpg",
    "kadhai-chicken":       "https://upload.wikimedia.org/wikipedia/commons/c/ca/Chicken_karahi.jpg",
    "chole-bhature":        "https://upload.wikimedia.org/wikipedia/commons/9/9e/Chole_Bhature_from_Nagpal_Chole_Bhature%2C_Chanakyapuri%2C_New_Delhi.jpg",
    # Rice / Biryani
    "veg-biryani":          "https://upload.wikimedia.org/wikipedia/commons/a/a7/Biryani_Mandi.jpg",
    "chicken-biryani":      "https://upload.wikimedia.org/wikipedia/commons/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg",
    "paneer-biryani":       "https://upload.wikimedia.org/wikipedia/commons/1/1d/Biryani.png",
    "fried-rice":           "https://upload.wikimedia.org/wikipedia/commons/9/98/Fried_Rice_2.jpg",
    # Noodles
    "hakka-noodles":        "https://upload.wikimedia.org/wikipedia/commons/b/b8/Chow_fun_by_jasonliebigstuff.jpg",
    "schezwan-noodles":     "https://upload.wikimedia.org/wikipedia/commons/8/8a/Chow_mein.jpg",
    "chicken-noodles":      "https://upload.wikimedia.org/wikipedia/commons/0/0e/Cantonese_style_beef_fried_ho_fun.jpg",
    "veg-chowmein":         "https://upload.wikimedia.org/wikipedia/commons/8/8a/Chow_mein.jpg",
    # Desserts
    "brownie":              "https://upload.wikimedia.org/wikipedia/commons/6/63/Chocolate_brownies.jpg",
    "chocolate-lava-cake":  "https://upload.wikimedia.org/wikipedia/commons/c/c1/Molten_Chocolate_Cake.jpg",
    "cheesecake":           "https://upload.wikimedia.org/wikipedia/commons/5/5a/Baked_cheesecake_with_raspberries.jpg",
    "gulab-jamun":          "https://upload.wikimedia.org/wikipedia/commons/c/c1/Gulab-jamun-wallpaper-removebg-preview.png",
    "ice-cream-sundae":     "https://upload.wikimedia.org/wikipedia/commons/b/b0/Sundae_cups.jpg",
    # Drinks
    "coca-cola":            "https://upload.wikimedia.org/wikipedia/commons/9/9e/Coca-Cola_glass.png",
    "sprite":               "https://upload.wikimedia.org/wikipedia/commons/1/1a/Sprite_can_2024.png",
    "lemon-iced-tea":       "https://upload.wikimedia.org/wikipedia/commons/b/b8/Iced_tea_from_the_Bronx.jpg",
    "cold-coffee":          "https://upload.wikimedia.org/wikipedia/commons/f/f0/Iced_coffee_latte_in_a_tall_glass.jpg",
    "oreo-shake":           "https://upload.wikimedia.org/wikipedia/commons/6/69/Milkshake_at_Big_Moo_Burgers%2C_Ryde_NSW.jpg",
    "mango-smoothie":       "https://upload.wikimedia.org/wikipedia/commons/9/9c/Fresh_Mango_Smoothie.jpg",
}


def download(url, path):
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=20, context=CTX) as r, open(path, "wb") as f:
            shutil.copyfileobj(r, f)
        return os.path.getsize(path) > 3000
    except Exception as e:
        return False, str(e)


ok = fail = 0
failed_slugs = []

for slug, url in IMAGES.items():
    out = os.path.join(OUTPUT, f"{slug}.jpg")
    result = download(url, out)
    if result is True or result == (True, None):
        print(f"  OK   {slug}")
        ok += 1
    else:
        print(f"  FAIL {slug}")
        failed_slugs.append((slug, url))
        fail += 1
    time.sleep(0.05)

if failed_slugs:
    print(f"\nFailed items:")
    for s, u in failed_slugs:
        print(f"  {s}: {u}")

print(f"\nResult: {ok} downloaded, {fail} failed")
