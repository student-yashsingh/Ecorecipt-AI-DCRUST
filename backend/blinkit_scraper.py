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
    Apify handles residential proxy, token refresh, anti-bot — everything.
    Returns list of products in your existing schema.
    """
    from pincode_service import pincode_to_latlon
    lat, lon = await pincode_to_latlon(pincode)

    if DEBUG_MODE:
        print(f"[scraper] Query='{query}' | Pincode={pincode} | lat={lat} lon={lon}")

    payload = {
        "queries":   [query],
        "lat": str(lat),
        "lon": str(lon),
        "max_pages": 2,
        "use_proxy": True,
    }

    url = f"https://api.apify.com/v2/acts/{ACTOR_ID}/run-sync-get-dataset-items?token={APIFY_TOKEN}"

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload)

        if DEBUG_MODE:
            print(f"[scraper] Apify status: {response.status_code}")
            print(f"[scraper] Raw response (first 300): {response.text[:300]}")

        if response.status_code not in (200, 201):
            print(f"[scraper] Apify error {response.status_code}: {response.text[:200]}")
            return []

        raw_items = response.json()   # list of product dicts
        products  = _parse_apify_response(raw_items)
        print(f"[scraper] Returning {len(products)} products")
        return products

    except Exception as e:
        print(f"[scraper] Exception: {e}")
        return []