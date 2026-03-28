import httpx
import asyncio

# Hardcoded fallback for common Indian pincodes
PINCODE_FALLBACK = {
    "110001": (28.6139, 77.2090),
    "400001": (18.9322, 72.8264),
    "560001": (12.9716, 77.5946),
    "121001": (28.3704, 77.3276),
    "122001": (28.4595, 77.0266),
    "201301": (28.5355, 77.3910),
    "500001": (17.3850, 78.4867),
    "600001": (13.0827, 80.2707),
    "700001": (22.5726, 88.3639),
    "411001": (18.5204, 73.8567),
}

DEFAULT_LATLON = (28.3704867, 77.3276681)

async def pincode_to_latlon(pincode: str) -> tuple:
    """
    Convert Indian pincode to (lat, lon).
    Step 1: Check hardcoded fallback dict
    Step 2: Try postalpincode.in API
    Step 3: Try Nominatim (OpenStreetMap)
    Step 4: Return default Faridabad coords
    """

    # Step 1 — hardcoded fallback
    if pincode in PINCODE_FALLBACK:
        print(f"[pincode] Using hardcoded coords for {pincode}")
        return PINCODE_FALLBACK[pincode]

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:

            # Step 2 — postalpincode.in
            try:
                r = await client.get(
                    f"https://api.postalpincode.in/pincode/{pincode}"
                )
                data = r.json()
                if data and data[0]["Status"] == "Success":
                    post_office = data[0]["PostOffice"][0]
                    district = post_office.get("District", "")
                    state = post_office.get("State", "")
                    print(f"[pincode] Got district={district}, state={state}")

                    # Step 3 — Nominatim
                    nom = await client.get(
                        "https://nominatim.openstreetmap.org/search",
                        params={
                            "q": f"{district}, {state}, India",
                            "format": "json",
                            "limit": 1,
                        },
                        headers={"User-Agent": "EcoReceiptAI/1.0"}
                    )
                    nom_data = nom.json()
                    if nom_data:
                        lat = float(nom_data[0]["lat"])
                        lon = float(nom_data[0]["lon"])
                        print(f"[pincode] Nominatim found: {lat}, {lon}")
                        return (lat, lon)
            except Exception as e:
                print(f"[pincode] API lookup failed: {e}")

    except Exception as e:
        print(f"[pincode] Client error: {e}")

    # Step 4 — default
    print(f"[pincode] Using default coords for {pincode}")
    return DEFAULT_LATLON