# blinkit_scraper.py — Apify-powered (the only working approach)
import httpx
import asyncio
import sys
import os
from dotenv import load_dotenv
load_dotenv()
from carbon_logic import assign_carbon_score

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

APIFY_TOKEN  = os.getenv("APIFY_TOKEN")
ACTOR_ID     = "jocular_quisling~blinkit-product-scraper"   # krazee_kaushik/blinkit-search-results-scraper
DEBUG_MODE   = False


# ─────────────────────────────────────────
# EMOJI MAP (keep yours exactly as-is)
# ─────────────────────────────────────────
def get_emoji(name: str) -> str:
    name = name.lower()
    if any(w in name for w in ["milk","oat milk","almond milk"]): return "🥛"
    if any(w in name for w in ["cheese","paneer"]):               return "🧀"
    if any(w in name for w in ["butter","ghee"]):                 return "🧈"
    if "egg"     in name:                                         return "🥚"
    if "chicken" in name:                                         return "🍗"
    if any(w in name for w in ["beef","mutton","lamb","meat"]):   return "🥩"
    if any(w in name for w in ["fish","salmon","prawn"]):         return "🐟"
    if any(w in name for w in ["bread","roti"]):                  return "🍞"
    if "rice"    in name:                                         return "🍚"
    if "tomato"  in name:                                         return "🍅"
    if any(w in name for w in ["potato","aloo"]):                 return "🥔"
    if any(w in name for w in ["onion","pyaz"]):                  return "🧅"
    if "apple"   in name:                                         return "🍎"
    if "banana"  in name:                                         return "🍌"
    if any(w in name for w in ["spinach","palak"]):               return "🥬"
    if "carrot"  in name:                                         return "🥕"
    if any(w in name for w in ["lentil","dal","beans"]):          return "🫘"
    if any(w in name for w in ["juice","drink","soda"]):          return "🧃"
    if any(w in name for w in ["chip","biscuit","cookie"]):       return "🍪"
    if "chocolate" in name:                                       return "🍫"
    if "oil"     in name:                                         return "🫙"
    if "sugar"   in name:                                         return "🍬"
    return "🛒"


# ─────────────────────────────────────────
# PARSE APIFY RESPONSE → your product schema
# ─────────────────────────────────────────
def _parse_apify_response(items: list) -> list:
    products = []
    for item in items:
        name  = item.get("name") or ""
        price = item.get("price") or item.get("mrp") or 0
        brand = item.get("brand") or ""
        unit  = item.get("quantity") or ""
        pid   = str(item.get("product_id") or item.get("variant_id") or "")
        imgs  = item.get("images") or []
        img   = imgs[0] if imgs else ""

        if not name:
            continue

        carbon_info  = assign_carbon_score(name)
        raw_name     = name.strip()
        display_name = raw_name if unit and unit in raw_name else (f"{raw_name} ({unit})" if unit else raw_name)

        products.append({
            "id":               pid,
            "name":             display_name,
            "raw_name":         raw_name,
            "brand":            brand,
            "unit":             unit,
            "price":            float(price),
            "image":            get_emoji(raw_name),
            "image_url":        img,
            "in_stock":         item.get("in_stock", True),
            "rating":           item.get("rating", 0),
            "category":         item.get("category") or carbon_info["category"],
            "carbon_score":     carbon_info["score"],
            "carbon_category":  carbon_info["category"],
            "alternative":      carbon_info["alternative"],
            "swap_target_name": carbon_info["alternative"],
            "swap_target_id":   None,
        })

        if DEBUG_MODE:
            print(f"[scraper] {display_name} | ₹{price} | CO₂={carbon_info['score']}")

    return products


# ─────────────────────────────────────────
# MAIN FUNCTION — called by /api/online/search
# ─────────────────────────────────────────
async def search_blinkit(query: str, pincode: str = "121001") -> list:
    """
    Calls Apify's Blinkit scraper actor via run-sync API.
    Falls back to curated mock data if Apify returns empty or fails.
    """
    from pincode_service import pincode_to_latlon
    lat, lon = await pincode_to_latlon(pincode)

    payload = {
        "queries":   [query],
        "lat": str(lat),
        "lon": str(lon),
        "max_pages": 2,
        "use_proxy": True,
    }

    url = f"https://api.apify.com/v2/acts/{ACTOR_ID}/run-sync-get-dataset-items?token={APIFY_TOKEN}&maxItems=20"

    products = []
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload)

        if response.status_code in (200, 201):
            raw_items = response.json()
            if isinstance(raw_items, list) and len(raw_items) > 0:
                products = _parse_apify_response(raw_items)
                print(f"[scraper] Apify returned {len(products)} products")
            else:
                print(f"[scraper] Apify returned empty list, using fallback")
        else:
            print(f"[scraper] Apify error {response.status_code}, using fallback")
    except Exception as e:
        print(f"[scraper] Apify exception: {e}, using fallback")

    # Fallback: curated mock data matched to query
    if not products:
        products = _get_mock_products(query)
        print(f"[scraper] Returning {len(products)} mock products")

    return products


# ─────────────────────────────────────────
# MOCK PRODUCT CATALOGUE (fallback)
# ─────────────────────────────────────────
MOCK_CATALOGUE = [
    # Dairy
    {"name": "Amul Tazza Fresh Milk", "brand": "Amul", "unit": "500ml", "price": 28, "category": "dairy"},
    {"name": "Amul Gold Full Cream Milk", "brand": "Amul", "unit": "1L", "price": 68, "category": "dairy"},
    {"name": "Mother Dairy Toned Milk", "brand": "Mother Dairy", "unit": "500ml", "price": 26, "category": "dairy"},
    {"name": "Amul Butter", "brand": "Amul", "unit": "100g", "price": 54, "category": "dairy"},
    {"name": "Amul Paneer", "brand": "Amul", "unit": "200g", "price": 80, "category": "dairy"},
    {"name": "Epigamia Greek Yogurt", "brand": "Epigamia", "unit": "200g", "price": 60, "category": "dairy"},
    # Vegetables
    {"name": "Fresh Tomatoes", "brand": "Fresh", "unit": "500g", "price": 30, "category": "vegetables"},
    {"name": "Onions", "brand": "Fresh", "unit": "1kg", "price": 40, "category": "vegetables"},
    {"name": "Potatoes", "brand": "Fresh", "unit": "1kg", "price": 35, "category": "vegetables"},
    {"name": "Spinach / Palak", "brand": "Fresh", "unit": "250g", "price": 25, "category": "vegetables"},
    {"name": "Fresh Carrots", "brand": "Fresh", "unit": "500g", "price": 35, "category": "vegetables"},
    {"name": "Green Capsicum", "brand": "Fresh", "unit": "250g", "price": 30, "category": "vegetables"},
    # Fruits
    {"name": "Bananas", "brand": "Fresh", "unit": "6 pcs", "price": 45, "category": "fruits"},
    {"name": "Apples Shimla", "brand": "Fresh", "unit": "4 pcs", "price": 80, "category": "fruits"},
    {"name": "Oranges", "brand": "Fresh", "unit": "4 pcs", "price": 60, "category": "fruits"},
    # Grains
    {"name": "Aashirvaad Atta", "brand": "Aashirvaad", "unit": "5kg", "price": 280, "category": "grains"},
    {"name": "India Gate Basmati Rice", "brand": "India Gate", "unit": "1kg", "price": 120, "category": "grains"},
    {"name": "Tata Salt", "brand": "Tata", "unit": "1kg", "price": 20, "category": "grains"},
    # Pulses
    {"name": "Toor Dal", "brand": "Organic Tattva", "unit": "500g", "price": 95, "category": "pulses"},
    {"name": "Moong Dal", "brand": "Organic Tattva", "unit": "500g", "price": 85, "category": "pulses"},
    # Eggs & Meat
    {"name": "Farm Fresh Eggs", "brand": "Nandini", "unit": "12 pcs", "price": 84, "category": "eggs"},
    {"name": "Chicken Breast Boneless", "brand": "Licious", "unit": "500g", "price": 249, "category": "meat"},
    # Beverages
    {"name": "Real Fruit Juice Orange", "brand": "Real", "unit": "1L", "price": 110, "category": "beverages"},
    {"name": "B Natural Pomegranate Juice", "brand": "B Natural", "unit": "1L", "price": 130, "category": "beverages"},
    # Snacks
    {"name": "Lay's Classic Salted Chips", "brand": "Lay's", "unit": "52g", "price": 20, "category": "snacks"},
    {"name": "Britannia Marie Gold Biscuits", "brand": "Britannia", "unit": "250g", "price": 30, "category": "snacks"},
    # Oils
    {"name": "Fortune Sunflower Oil", "brand": "Fortune", "unit": "1L", "price": 130, "category": "oils"},
    {"name": "Saffola Gold Oil", "brand": "Saffola", "unit": "1L", "price": 180, "category": "oils"},
    # Bread
    {"name": "Britannia 100% Whole Wheat Bread", "brand": "Britannia", "unit": "400g", "price": 48, "category": "bread"},
    {"name": "Modern Multigrain Bread", "brand": "Modern", "unit": "400g", "price": 50, "category": "bread"},
]


def _get_mock_products(query: str) -> list:
    """Return mock products matching the query string."""
    q = query.lower().strip()
    results = []

    for item in MOCK_CATALOGUE:
        name_l = item["name"].lower()
        brand_l = item["brand"].lower()
        cat_l = item["category"].lower()

        if (q in name_l or q in brand_l or q in cat_l or
            any(word in name_l for word in q.split())):
            carbon_info = assign_carbon_score(item["name"])
            import random
            pid = str(random.randint(100000, 999999))
            results.append({
                "id":               pid,
                "name":             f"{item['name']} ({item['unit']})",
                "raw_name":         item["name"],
                "brand":            item["brand"],
                "unit":             item["unit"],
                "price":            float(item["price"]),
                "image":            get_emoji(item["name"]),
                "image_url":        "",
                "in_stock":         True,
                "rating":           round(random.uniform(3.8, 4.8), 1),
                "category":         item["category"],
                "carbon_score":     carbon_info["score"],
                "carbon_category":  carbon_info["category"],
                "alternative":      carbon_info["alternative"],
                "swap_target_name": carbon_info["alternative"],
                "swap_target_id":   None,
            })

    # If no direct match, return top 8 general items
    if not results:
        for item in MOCK_CATALOGUE[:8]:
            carbon_info = assign_carbon_score(item["name"])
            import random
            results.append({
                "id":               str(random.randint(100000, 999999)),
                "name":             f"{item['name']} ({item['unit']})",
                "raw_name":         item["name"],
                "brand":            item["brand"],
                "unit":             item["unit"],
                "price":            float(item["price"]),
                "image":            get_emoji(item["name"]),
                "image_url":        "",
                "in_stock":         True,
                "rating":           round(random.uniform(3.8, 4.8), 1),
                "category":         item["category"],
                "carbon_score":     carbon_info["score"],
                "carbon_category":  carbon_info["category"],
                "alternative":      carbon_info["alternative"],
                "swap_target_name": carbon_info["alternative"],
                "swap_target_id":   None,
            })

    return results