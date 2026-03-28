from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
from auth import get_current_user
from points_service import WELCOME_BONUS, calculate_tier
import models

# Create all tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EcoReceipt AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "EcoReceipt AI backend running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

# ─────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────

@app.post("/api/auth/login")
def login(
    user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    firebase_uid = user_data["uid"]
    phone = user_data.get("phone_number", "")

    # Check if user already exists
    user = db.query(models.User).filter(
        models.User.firebase_uid == firebase_uid
    ).first()

    is_new_user = False

    if not user:
        # Create new user with welcome bonus
        is_new_user = True
        user = models.User(
            firebase_uid=firebase_uid,
            phone=phone,
            total_points=WELCOME_BONUS,
            tier="Bronze"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "is_new_user": is_new_user,
        "user": {
            "id": str(user.id),
            "phone": user.phone,
            "name": user.name,
            "points": user.total_points,
            "tier": user.tier,
            "carbon_saved": user.total_carbon_saved_kg,
            "streak_days": user.streak_days,
        }
    }

# ─────────────────────────────────────────
# USER
# ─────────────────────────────────────────

@app.get("/api/user/profile")
def get_profile(
    user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.firebase_uid == user_data["uid"]
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user.id),
        "phone": user.phone,
        "name": user.name,
        "points": user.total_points,
        "tier": user.tier,
        "carbon_saved": user.total_carbon_saved_kg,
        "streak_days": user.streak_days,
    }

# ─────────────────────────────────────────
# LEADERBOARD
# ─────────────────────────────────────────

@app.get("/api/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(models.User).order_by(
        models.User.total_points.desc()
    ).limit(10).all()

    result = []
    for i, u in enumerate(users):
        display_name = u.name if u.name else f"Eco Warrior {str(u.id)[:4].upper()}"
        result.append({
            "rank": i + 1,
            "name": display_name,
            "points": u.total_points,
            "tier": u.tier,
            "carbon_saved": u.total_carbon_saved_kg,
        })
    return {"leaderboard": result}

# ─────────────────────────────────────────
# ONLINE MODE
# ─────────────────────────────────────────

@app.get("/api/online/search")
async def online_search(query: str, pincode: str = "121001"):
    from blinkit_scraper import search_blinkit
    products = await search_blinkit(query, pincode)
    return {
        "results": products,
        "count":   len(products),
        "pincode": pincode,
    }
@app.post("/api/online/cart/save")
def save_cart(db: Session = Depends(get_db)):
    return {"message": "cart save endpoint — coming in Phase 4"}

@app.post("/api/online/redirect")
def blinkit_redirect(db: Session = Depends(get_db)):
    return {"message": "redirect endpoint — coming in Phase 4"}

@app.post("/api/online/verify-purchase")
def verify_purchase(db: Session = Depends(get_db)):
    return {"message": "verify purchase endpoint — coming in Phase 5"}

# ─────────────────────────────────────────
# RECEIPT MODE
# ─────────────────────────────────────────

@app.post("/api/receipt/analyze")
async def analyze_receipt(
    file: UploadFile = File(...),
    user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from receipt_parser import parse_receipt
    from points_service import (
        RECEIPT_SUBMITTED, ECO_SCORE_A_PLUS, ECO_SCORE_A,
        ECO_SCORE_B, ECO_SCORE_C, ECO_SCORE_D, ECO_SCORE_F,
        calculate_tier
    )
    import uuid

    # Step 1 — Read uploaded image bytes
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image received.")

    # Step 2 — Run Gemini OCR + carbon scoring
    try:
        result = parse_receipt(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    # Step 3 — Calculate points for this receipt
    score_points_map = {
        "A+": ECO_SCORE_A_PLUS,
        "A":  ECO_SCORE_A,
        "B":  ECO_SCORE_B,
        "C":  ECO_SCORE_C,
        "D":  ECO_SCORE_D,
        "F":  ECO_SCORE_F,
    }
    points_earned = RECEIPT_SUBMITTED + score_points_map.get(result["eco_score"], 0)

    # Step 4 — Get user from DB
    user = db.query(models.User).filter(
        models.User.firebase_uid == user_data["uid"]
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Step 5 — Save purchase record
    purchase = models.Purchase(
        user_id=user.id,
        mode="receipt",
        items=result["items"],
        total_carbon_kg=result["total_carbon_kg"],
        eco_score=result["eco_score"],
        points_earned=points_earned,
        receipt_verified="valid",
    )
    db.add(purchase)

    # Step 6 — Update user totals
    user.total_points += points_earned
    user.total_carbon_saved_kg = round(user.total_carbon_saved_kg, 3)
    user.tier = calculate_tier(user.total_points)

    db.commit()

    # Step 7 — Return full result to frontend
    return {
        "eco_score":       result["eco_score"],
        "total_carbon_kg": result["total_carbon_kg"],
        "item_count":      result["item_count"],
        "items":           result["items"],
        "points_earned":   points_earned,
        "new_total_points": user.total_points,
        "tier":            user.tier,
        "receipt_date":    result["receipt_date"],
    }