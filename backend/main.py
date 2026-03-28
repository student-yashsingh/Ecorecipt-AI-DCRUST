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
def search_products(query: str = "", pincode: str = "121001"):
    return {"message": "search endpoint — coming in Phase 3"}

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
def analyze_receipt(db: Session = Depends(get_db)):
    return {"message": "receipt analyze endpoint — coming in Phase 5"}