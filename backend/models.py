from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid = Column(String, unique=True, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=True)
    city = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    total_points = Column(Integer, default=100)
    total_carbon_saved_kg = Column(Float, default=0.0)
    streak_days = Column(Integer, default=0)
    last_active_date = Column(DateTime, nullable=True)
    tier = Column(String, default="Bronze")
    created_at = Column(DateTime, server_default=func.now())

class Purchase(Base):
    __tablename__ = "purchases"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    mode = Column(String, nullable=False)
    items = Column(JSON, nullable=False)
    total_carbon_kg = Column(Float, nullable=False)
    carbon_saved_kg = Column(Float, default=0.0)
    eco_score = Column(String, nullable=False)
    points_earned = Column(Integer, nullable=False)
    receipt_image_url = Column(String, nullable=True)
    receipt_date = Column(DateTime, nullable=True)
    receipt_verified = Column(String, default="pending")
    cart_session_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class CartSession(Base):
    __tablename__ = "cart_sessions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    pincode = Column(String, nullable=False)
    items = Column(JSON, nullable=False)
    alternatives_accepted = Column(Integer, default=0)
    total_carbon_kg = Column(Float, default=0.0)
    carbon_saved_kg = Column(Float, default=0.0)
    blinkit_redirect_at = Column(DateTime, nullable=True)
    screenshot_url = Column(String, nullable=True)
    screenshot_verified = Column(Boolean, default=False)
    points_awarded = Column(Boolean, default=False)
    status = Column(String, default="active")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class ProductsCache(Base):
    __tablename__ = "products_cache"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    blinkit_id = Column(String, index=True)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    weight_g = Column(Float, nullable=True)
    weight_unit = Column(String, nullable=True)
    price = Column(Float, nullable=True)
    image_url = Column(String, nullable=True)
    category = Column(String, nullable=True)
    carbon_kg = Column(Float, nullable=True)
    pincode = Column(String, nullable=True)
    cached_at = Column(DateTime, server_default=func.now())

class CarbonDB(Base):
    __tablename__ = "carbon_db"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(String, unique=True, nullable=False)
    co2_per_kg = Column(Float, nullable=False)
    eco_alternative = Column(String, nullable=True)
    alt_co2_per_kg = Column(Float, nullable=True)
    alt_where = Column(String, nullable=True)
    source = Column(String, default="poore_nemecek_2018")
    keywords = Column(JSON, nullable=False)

class LeaderboardWeekly(Base):
    __tablename__ = "leaderboard_weekly"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    week = Column(String, nullable=False)
    carbon_saved_kg = Column(Float, nullable=False)
    eco_improvement_pct = Column(Float, nullable=False)
    rank_city = Column(Integer, nullable=True)
    rank_national = Column(Integer, nullable=True)
    computed_at = Column(DateTime, server_default=func.now())