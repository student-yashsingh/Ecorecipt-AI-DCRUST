from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
from auth import get_current_user
from points_service import WELCOME_BONUS, calculate_tier
from pydantic import BaseModel
from typing import Optional
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EcoReceipt AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# HEALTH
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

    user = db.query(models.User).filter(
        models.User.firebase_uid == firebase_uid
    ).first()

    is_new_user = False
    if not user:
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
            "id":           str(user.id),
            "phone":        user.phone,
            "name":         user.name,
            "city":         user.city,
            "pincode":      user.pincode,
            "points":       user.total_points,
            "tier":         user.tier,
            "carbon_saved": user.total_carbon_saved_kg,
            "streak_days":  user.streak_days,
        }
    }

# ─────────────────────────────────────────
# USER PROFILE
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
        "id":           str(user.id),
        "phone":        user.phone,
        "name":         user.name,
        "city":         user.city,
        "pincode":      user.pincode,
        "points":       user.total_points,
        "tier":         user.tier,
        "carbon_saved": user.total_carbon_saved_kg,
        "streak_days":  user.streak_days,
    }


class ProfileUpdate(BaseModel):
    name:    Optional[str] = None
    city:    Optional[str] = None
    pincode: Optional[str] = None


@app.patch("/api/user/profile")
def update_profile(
    body: ProfileUpdate,
    user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.firebase_uid == user_data["uid"]
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if body.name    is not None: user.name    = body.name
    if body.city    is not None: user.city    = body.city
    if body.pincode is not None: user.pincode = body.pincode

    db.commit()
    db.refresh(user)

    return {
        "id":           str(user.id),
        "phone":        user.phone,
        "name":         user.name,
        "city":         user.city,
        "pincode":      user.pincode,
        "points":       user.total_points,
        "tier":         user.tier,
        "carbon_saved": user.total_carbon_saved_kg,
        "streak_days":  user.streak_days,
    }


@app.get("/api/user/history")
def get_history(
    user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.firebase_uid == user_data["uid"]
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    purchases = db.query(models.Purchase).filter(
        models.Purchase.user_id == user.id
    ).order_by(models.Purchase.created_at.desc()).limit(20).all()

    return {
        "history": [
            {
                "id":              str(p.id),
                "mode":            p.mode,
                "eco_score":       p.eco_score,
                "total_carbon_kg": p.total_carbon_kg,
                "carbon_saved_kg": p.carbon_saved_kg,
                "points_earned":   p.points_earned,
                "item_count":      len(p.items) if p.items else 0,
                "created_at":      p.created_at.strftime("%d %b %Y") if p.created_at else "—",
            }
            for p in purchases
        ]
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
            "rank":         i + 1,
            "name":         display_name,
            "points":       u.total_points,
            "tier":         u.tier,
            "carbon_saved": u.total_carbon_saved_kg,
        })
    return {"leaderboard": result}

# ─────────────────────────────────────────
# ONLINE MODE
# ─────────────────────────────────────────

@app.get("/api/online/search")
async def online_search(query: str = "", pincode: str = "121001"):
    from blinkit_scraper import search_blinkit
    products = await search_blinkit(query, pincode)
    return {
        "results": products,
        "count":   len(products),
        "pincode": pincode,
    }

@app.post("/api/online/cart/save")
def save_cart():
    return {"message": "cart save endpoint — coming in Phase 4"}

@app.post("/api/online/redirect")
def blinkit_redirect():
    return {"message": "redirect endpoint — coming in Phase 4"}

@app.post("/api/online/verify-purchase")
def verify_purchase():
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
    )

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image received.")

    try:
        result = parse_receipt(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    score_points_map = {
        "A+": ECO_SCORE_A_PLUS,
        "A":  ECO_SCORE_A,
        "B":  ECO_SCORE_B,
        "C":  ECO_SCORE_C,
        "D":  ECO_SCORE_D,
        "F":  ECO_SCORE_F,
    }
    points_earned = RECEIPT_SUBMITTED + score_points_map.get(result["eco_score"], 0)

    user = db.query(models.User).filter(
        models.User.firebase_uid == user_data["uid"]
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

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

    user.total_points += points_earned
    user.total_carbon_saved_kg = round(user.total_carbon_saved_kg, 3)
    user.tier = calculate_tier(user.total_points)

    db.commit()

    return {
        "eco_score":        result["eco_score"],
        "total_carbon_kg":  result["total_carbon_kg"],
        "item_count":       result["item_count"],
        "items":            result["items"],
        "points_earned":    points_earned,
        "new_total_points": user.total_points,
        "tier":             user.tier,
        "receipt_date":     result["receipt_date"],
    }