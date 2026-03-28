import os
import json
import base64
from datetime import datetime, timedelta
from groq import Groq
from carbon_logic import assign_carbon_score
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ─────────────────────────────────────────
# ECO SCORE GRADING
# ─────────────────────────────────────────

def calculate_eco_score(avg_carbon: float) -> str:
    if avg_carbon <= 0.5: return "A+"
    if avg_carbon <= 1.0: return "A"
    if avg_carbon <= 2.0: return "B"
    if avg_carbon <= 3.5: return "C"
    if avg_carbon <= 5.0: return "D"
    return "F"

# ─────────────────────────────────────────
# MAIN FUNCTION
# ─────────────────────────────────────────

def parse_receipt(image_bytes: bytes) -> dict:
    """
    Takes raw image bytes.
    Returns parsed items with carbon scores, eco grade, and totals.
    Raises ValueError if image is not a valid/recent grocery receipt.
    """

    # Step 1 — Encode image to base64
    b64_image = base64.b64encode(image_bytes).decode("utf-8")

    # Step 2 — Send to Groq vision model
    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{b64_image}"
                        }
                    },
                    {
                        "type": "text",
                        "text": """You are a grocery receipt analyser. Extract all purchased items from this receipt image.
Return ONLY valid JSON in this exact format, no markdown, no explanation, no code fences:
{
  "date": "YYYY-MM-DD or null if not visible",
  "is_valid_receipt": true or false,
  "items": [
    {"item_name": "string", "quantity": 1, "price": 0.0}
  ]
}
If this is not a grocery receipt, set is_valid_receipt to false and items to [].
If date is not visible, set date to null.
Return ONLY the JSON object. No other text."""
                    }
                ]
            }
        ],
        max_tokens=1000,
    )

    # Step 3 — Parse response
    raw_text = response.choices[0].message.content.strip()

    # Strip markdown code fences if model adds them
    if raw_text.startswith("```"):
        parts = raw_text.split("```")
        raw_text = parts[1] if len(parts) > 1 else raw_text
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
    raw_text = raw_text.strip()

    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError:
        raise ValueError("Could not read receipt. Please try a clearer image.")

    # Step 4 — Validate receipt
    if not parsed.get("is_valid_receipt", False):
        raise ValueError("This does not appear to be a grocery receipt.")

    if not parsed.get("items"):
        raise ValueError("No items found on this receipt.")

    # Step 5 — Check date (reject if older than 7 days)
    date_str = parsed.get("date")
    if date_str:
        try:
            receipt_date = datetime.strptime(date_str, "%Y-%m-%d")
            if datetime.now() - receipt_date > timedelta(days=7):
                raise ValueError(
                    f"Receipt dated {date_str} is older than 7 days and cannot be submitted."
                )
        except ValueError as e:
            if "older than 7 days" in str(e):
                raise

    # Step 6 — Score each item
    scored_items = []
    total_carbon = 0.0

    for item in parsed["items"]:
        name  = item.get("item_name", "Unknown")
        qty   = item.get("quantity", 1) or 1
        price = item.get("price", 0.0) or 0.0

        carbon_info  = assign_carbon_score(name)
        item_carbon  = round(carbon_info["score"] * qty, 3)
        total_carbon += item_carbon

        scored_items.append({
            "item_name":   name,
            "quantity":    qty,
            "price":       price,
            "carbon_kg":   item_carbon,
            "category":    carbon_info["category"],
            "alternative": carbon_info["alternative"],
        })

    # Step 7 — Calculate eco score
    avg_carbon   = total_carbon / len(scored_items) if scored_items else 0
    eco_score    = calculate_eco_score(avg_carbon)
    total_carbon = round(total_carbon, 3)

    return {
        "receipt_date":    date_str,
        "items":           scored_items,
        "total_carbon_kg": total_carbon,
        "eco_score":       eco_score,
        "item_count":      len(scored_items),
    }