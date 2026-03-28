import httpx
import asyncio
import json
import sys
import os
from datetime import datetime, timedelta
from pincode_service import pincode_to_latlon
from carbon_logic import assign_carbon_score


# DEBUG MODE — set False before production

DEBUG_MODE = True

# Windows asyncio fix
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


# TOKEN STORE — lives in memory
# ─────────────────────────────────────────
_token_store = {
    "access_token": "v2:3A:3A60ca0b66-ebad-4668-b841-9ecd89e4f0c6",
    "device_id":    "82f32a2dc21c1f55",
    "session_uuid": "60feec6f-c057-4ee1-99e7-8fb69f85f30a",
    "captured_at":  None,
}

# ─────────────────────────────────────────
# PERMANENT HEADERS — never change
# ─────────────────────────────────────────
PERMANENT_HEADERS = {
    "accept":             "*/*",
    "accept-language":    "en-GB,en;q=0.5",
    "app_client":         "consumer_web",
    "app_version":        "1010101010",
    "auth_key":           "c761ec3633c22afad934fb17a66385c1c06c5472b4898b866b7306186d0bb477",
    "content-type":       "application/json",
    "origin":             "https://blinkit.com",
    "rn_bundle_version":  "1009003012",
    "web_app_version":    "1008010016",
    "user-agent":         "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
    "sec-ch-ua":          '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
    "sec-ch-ua-mobile":   "?1",
    "sec-ch-ua-platform": '"iOS"',
    "sec-fetch-dest":     "empty",
    "sec-fetch-mode":     "cors",
    "sec-fetch-site":     "same-origin",
    "sec-gpc":            "1",
}

# ─────────────────────────────────────────
# EMOJI MAP
# ─────────────────────────────────────────
def get_emoji(name: str) -> str:
    name = name.lower()
    if any(w in name for w in ["milk", "oat milk", "almond milk"]): return "🥛"
    if any(w in name for w in ["cheese", "paneer"]):                return "🧀"
    if any(w in name for w in ["butter", "ghee"]):                  return "🧈"
    if "egg" in name:                                                return "🥚"
    if "chicken" in name:                                            return "🍗"
    if any(w in name for w in ["beef","mutton","lamb","meat"]):      return "🥩"
    if any(w in name for w in ["fish","salmon","prawn","seafood"]):  return "🐟"
    if any(w in name for w in ["bread","roti"]):                     return "🍞"
    if "rice" in name:                                               return "🍚"
    if "tomato" in name:                                             return "🍅"
    if any(w in name for w in ["potato","aloo"]):                    return "🥔"
    if any(w in name for w in ["onion","pyaz"]):                     return "🧅"
    if "apple" in name:                                              return "🍎"
    if "banana" in name:                                             return "🍌"
    if any(w in name for w in ["spinach","palak"]):                  return "🥬"
    if "carrot" in name:                                             return "🥕"
    if any(w in name for w in ["lentil","dal","beans"]):             return "🫘"
    if any(w in name for w in ["tofu","soy"]):                       return "🌱"
    if any(w in name for w in ["juice","drink","soda"]):             return "🧃"
    if any(w in name for w in ["chip","biscuit","cookie"]):          return "🍪"
    if "chocolate" in name:                                          return "🍫"
    if "oil" in name:                                                return "🫙"
    if "sugar" in name:                                              return "🍬"
    if any(w in name for w in ["coffee","tea","chai"]):              return "☕"
    return "🛒"

# ─────────────────────────────────────────
# TOKEN REFRESH VIA PLAYWRIGHT
# ─────────────────────────────────────────
async def _refresh_token_with_playwright():
    print("[scraper] Starting Playwright token refresh...")
    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            captured_token = {}

            async def handle_request(request):
                headers = request.headers
                if "access_token" in headers and headers["access_token"].startswith("v2::"):
                    captured_token["access_token"] = headers["access_token"]
                    captured_token["device_id"]    = headers.get("device_id", _token_store["device_id"])
                    captured_token["session_uuid"] = headers.get("session_uuid", _token_store["session_uuid"])
                    print(f"[scraper] Captured token from request: {headers['access_token'][:20]}...")

            context.on("request", handle_request)
            page = await context.new_page()

            try:
                await page.goto("https://blinkit.com", timeout=30000)
                await asyncio.sleep(5)
            except Exception as e:
                print(f"[scraper] Page load error (may still have token): {e}")

            # Fallback: read cookie
            if not captured_token.get("access_token"):
                cookies = await context.cookies("https://blinkit.com")
                for c in cookies:
                    if c["name"] == "gr_1_accessToken":
                        raw = c["value"].replace("%3A%3A", "::")
                        captured_token["access_token"] = raw
                        print(f"[scraper] Got token from cookie: {raw[:20]}...")
                        break

            await browser.close()

            if captured_token.get("access_token"):
                _token_store.update(captured_token)
                _token_store["captured_at"] = datetime.now()
                print("[scraper] Token refresh successful")
                return True
            else:
                print("[scraper] Token refresh failed — no token found")
                return False

    except Exception as e:
        print(f"[scraper] Playwright error: {e}")
        return False

# ─────────────────────────────────────────
# PARSE BLINKIT RESPONSE
# ─────────────────────────────────────────
def _parse_blinkit_response(data: dict) -> list:
    products = []

    try:
        snippets = data.get("data", {}).get("snippets", [])
        if DEBUG_MODE:
            print(f"[scraper] Found {len(snippets)} snippets")

        for snippet in snippets:
            items = snippet.get("data", {}).get("items", [])
            if DEBUG_MODE and items:
                print(f"[scraper] Snippet has {len(items)} items")

            for item in items:
                # Extract fields — check multiple keys
                name  = item.get("name") or item.get("product_name") or item.get("title") or ""
                price = item.get("price") or item.get("mrp") or item.get("selling_price") or 0
                brand = item.get("brand") or item.get("brand_name") or ""
                unit  = item.get("unit") or item.get("weight") or item.get("variant_name") or ""
                pid   = str(item.get("id") or item.get("product_id") or item.get("variant_id") or "")
                img   = item.get("image_url") or item.get("thumbnail") or item.get("cover_image") or ""

                # Skip invalid
                if not name or not price:
                    continue

                # Carbon score
                carbon_info = assign_carbon_score(name)

                # Build display name
                raw_name = name.strip()
                display_name = f"{raw_name} ({unit})" if unit else raw_name

                product = {
                    "id":           pid,
                    "name":         display_name,
                    "raw_name":     raw_name,
                    "brand":        brand,
                    "unit":         unit,
                    "price":        float(price),
                    "image":        get_emoji(raw_name),
                    "image_url":    img,
                    "carbon_score": carbon_info["score"],
                    "category":     carbon_info["category"],
                    "alternative":  carbon_info["alternative"],
                }

                if DEBUG_MODE:
                    print(f"[scraper] Product: {display_name} | ₹{price} | CO₂={carbon_info['score']}")

                products.append(product)

    except Exception as e:
        print(f"[scraper] Parse error: {e}")

    return products

# ─────────────────────────────────────────
# MAKE BLINKIT REQUEST
# ─────────────────────────────────────────
async def _make_blinkit_request(query: str, lat: float, lon: float) -> dict:
    headers = {
        **PERMANENT_HEADERS,
        "access_token":  _token_store["access_token"],
        "device_id":     _token_store["device_id"],
        "session_uuid":  _token_store["session_uuid"],
        "lat":           str(lat),
        "lon":           str(lon),
        "referer":       f"https://blinkit.com/s/?q={query}",
    }

    cookies = {
        "gr_1_deviceId":    _token_store["device_id"],
        "gr_1_accessToken": _token_store["access_token"].replace("::", "%3A%3A"),
        "gr_1_lat":         str(lat),
        "gr_1_lon":         str(lon),
        "gr_1_locality":    "2071",
    }

    params = {
        "offset":       "0",
        "limit":        "12",
        "actual_query": query,
        "q":            query,
        "search_type":  "auto_suggest",
    }

    if DEBUG_MODE:
        print(f"[scraper] Requesting: query={query} lat={lat} lon={lon}")
        print(f"[scraper] Token: {_token_store['access_token'][:20]}...")

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            "https://blinkit.com/v1/layout/search",
            headers=headers,
            cookies=cookies,
            params=params,
            content=b"",
        )

    if DEBUG_MODE:
        print(f"[scraper] Response status: {response.status_code}")
        print(f"[scraper] Response body (first 500 chars): {response.text[:500]}")
        with open("blinkit_raw.json", "w", encoding="utf-8") as f:
            try:
                json.dump(response.json(), f, indent=2, ensure_ascii=False)
            except Exception:
                f.write(response.text)
        print("[scraper] Raw response saved to blinkit_raw.json")

    return {"status": response.status_code, "data": response}

# ─────────────────────────────────────────
# MAIN FUNCTION — called by API route
# ─────────────────────────────────────────
async def search_blinkit(query: str, pincode: str = "121001") -> list:
    lat, lon = await pincode_to_latlon(pincode)

    result = await _make_blinkit_request(query, lat, lon)
    status = result["status"]
    response = result["data"]

    # Token expired — refresh and retry once
    if status in (401, 403):
        print(f"[scraper] Auth failed ({status}) — refreshing token...")
        refreshed = await _refresh_token_with_playwright()
        if refreshed:
            result = await _make_blinkit_request(query, lat, lon)
            status = result["status"]
            response = result["data"]

    # Rate limited
    if status == 429:
        print("[scraper] Rate limited — waiting 10 seconds...")
        await asyncio.sleep(10)
        result = await _make_blinkit_request(query, lat, lon)
        status = result["status"]
        response = result["data"]

    if status != 200:
        print(f"[scraper] Final status {status} — returning empty list")
        return []

    try:
        data = response.json()
    except Exception:
        print("[scraper] Failed to parse JSON response")
        return []

    products = _parse_blinkit_response(data)
    print(f"[scraper] Returning {len(products)} products")
    return products