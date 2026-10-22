"""
Downloads correct food and restaurant images.
Run from backend/: py -3.12 download_images.py
"""
import urllib.request
import os
import time

FOODS_DIR = r"D:\Foodigo\backend\static\images\foods"
RESTAURANTS_DIR = r"D:\Foodigo\backend\static\images\restaurants"

# Specific Unsplash photo IDs — curated to match the dish
FOOD_REPLACEMENTS = {
    "chicken-biryani.jpg":    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop&q=85",
    "butter-chicken.jpg":     "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop&q=85",
    "pepperoni-pizza.jpg":    "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop&q=85",
    "double-patty-burger.jpg":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=85",
}

RESTAURANT_IMAGES = {
    "zesty-kitchen.jpg":   "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop&q=85",
    "burger-republic.jpg": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=400&fit=crop&q=85",
    "desi-tadka.jpg":      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=400&fit=crop&q=85",
    "noodle-bowl.jpg":     "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=400&fit=crop&q=85",
    "sweet-spot.jpg":      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop&q=85",
}

def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
        # Verify it's a JPEG
        if data[:2] != b'\xff\xd8':
            print(f"  WARN: response is not JPEG for {dest}")
            return False
        with open(dest, "wb") as f:
            f.write(data)
        print(f"  OK  {os.path.basename(dest)} ({len(data):,} bytes)")
        return True
    except Exception as e:
        print(f"  FAIL {os.path.basename(dest)}: {e}")
        return False

print("=== Replacing wrong food images ===")
for filename, url in FOOD_REPLACEMENTS.items():
    path = os.path.join(FOODS_DIR, filename)
    print(f"Downloading {filename}...")
    download(url, path)
    time.sleep(0.3)

print("\n=== Downloading restaurant banner images ===")
for filename, url in RESTAURANT_IMAGES.items():
    path = os.path.join(RESTAURANTS_DIR, filename)
    print(f"Downloading {filename}...")
    download(url, path)
    time.sleep(0.3)

print("\nDone.")
