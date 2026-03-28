from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
import models

# Create all tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EcoReceipt AI", version="1.0.0")

# Allow frontend (localhost:5173) to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# HEALTH CHECK
@app.get("/")
def root():
    return {"message": "EcoReceipt AI backend running"}

@app.get("/health")
def health():
    return {"status": "healthy"}


# AUTH

@app.post("/api/auth/login")
def login(db: Session = Depends(get_db)):
    return {"message": "login endpoint — coming in Phase 2"}


# USER

@app.get("/api/user/profile")
def get_profile(db: Session = Depends(get_db)):
    return {"message": "profile endpoint — coming in Phase 2"}


# LEADERBOARD


@app.get("/api/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    return {"message": "leaderboard endpoint — coming in Phase 6"}


# ONLINE MODE

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


# RECEIPT MODE

@app.post("/api/receipt/analyze")
def analyze_receipt(db: Session = Depends(get_db)):
    return {"message": "receipt analyze endpoint — coming in Phase 5"}