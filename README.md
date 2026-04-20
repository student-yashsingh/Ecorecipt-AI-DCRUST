# 🌿 EcoReceipt AI
live at :- https://ecoreciptai.netlify.app/
<div align="center">

**A gamified web app that helps Indian consumers understand and reduce the carbon footprint of their grocery shopping.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?style=flat-square&logo=google)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

*Small Choices. Bigger Planet.*

---

[Features](#-features) • [Demo](#-demo) • [Tech Stack](#-tech-stack) • [Setup](#-setup) • [API Docs](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**EcoReceipt AI** is the first Indian web application that makes the carbon footprint of grocery shopping visible, measurable, and rewarding. 

26% of global greenhouse gas emissions come from food production — yet consumers have zero visibility into the environmental cost of what they buy. EcoReceipt AI solves this through two powerful modes:

- **🧾 Receipt Mode** — Upload any grocery bill. Gemini AI reads every item and assigns a CO₂ score instantly.
- **🛒 Online Mode** — Search live Blinkit products with real-time eco scores. Swap high-carbon items for greener alternatives and earn points.

Every eco-friendly action earns points. Points unlock tiers (Bronze → Platinum) and convert to real cashback value.

---

## ✨ Features

### Core Features
- 📸 **AI Receipt OCR** — Gemini 1.5 Flash reads any grocery receipt photo, extracts all items, validates date, detects fake receipts
- 🛒 **Live Blinkit Integration** — Real product data via Apify residential proxy with live pricing, stock, and ratings
- 🌿 **Eco Swap Engine** — Automatically suggests greener alternatives for high-carbon items (+25 pts per swap)
- ✅ **Screenshot Verification** — Gemini AI verifies Blinkit order screenshots and confirms purchased items
- 📊 **Carbon Dashboard** — Track CO₂ saved over time with animated stats and weekly leaderboard
- 🏆 **Gamified Tiers** — Bronze → Silver → Gold → Platinum with real cashback value (₹0.10/point)

### Technical Features
- 🔐 **Phone OTP Auth** — Firebase phone authentication with invisible reCAPTCHA
- 📍 **Location-Based Scraping** — Pincode → lat/lon conversion for accurate Blinkit product results
- 🤖 **Dual AI Modes** — Gemini for OCR and vision verification
- 🔄 **Self-Healing Scraper** — Automatic token refresh via Apify residential proxies
- 📱 **Fully Responsive** — Works on mobile, tablet, and desktop
- 🌿 **Earthy UI Theme** — Custom design system with glassmorphism effects

---

## 🖥️ Demo

### App Flow
```
Splash Screen → Login (OTP) → Onboarding → Home Dashboard
                                              ↓
                              ┌───────────────┴───────────────┐
                              ↓                               ↓
                        Receipt Mode                    Online Mode
                        Upload Bill                     Enter Pincode
                        Gemini OCR                      Search Blinkit
                        Carbon Score                    Add to Cart
                        Earn Points                     Eco Swap
                              ↓                               ↓
                        Results Page                    Order on Blinkit
                                                        Upload Screenshot
                                                        Gemini Verify
                                                        Order Success 
```

### Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Splash | 3-second animated brand intro |
| `/login` | Login | Phone OTP entry with Firebase |
| `/verify` | VerifyOTP | 6-digit OTP with SVG progress ring |
| `/onboarding` | HowItWorks | 4-step walkthrough for new users |
| `/home` | Home | Dashboard — points, tier, streak, CO₂ |
| `/receipt` | ReceiptMode | Drag & drop receipt upload + AI results |
| `/online` | OnlineMode | Live Blinkit shopping with eco scores |
| `/leaderboard` | Leaderboard | Podium + ranked eco warriors list |
| `/profile` | Profile | 3-tab profile, achievements, settings |
| `/success` | OrderSuccess | Confetti celebration + points summary |

---

##  Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18 | UI framework |
| Vite | 5 | Build tool + dev server |
| React Router DOM | 6 | Client-side routing |
| Tailwind CSS | 3 | Utility-first styling |
| Zustand | 4 | Global state management |
| Firebase Auth | 10 | Phone OTP authentication |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | 0.110+ | REST API framework |
| Python | 3.13 | Runtime |
| SQLAlchemy | 2.0 | ORM |
| PostgreSQL | 16 | Primary database |
| Firebase Admin SDK | 6 | Token verification |
| httpx | 0.27 | Async HTTP client |

### AI & Integrations
| Service | Purpose |
|---------|---------|
| Google Gemini 1.5 Flash | Receipt OCR + screenshot verification |
| Apify (jocular_quisling actor) | Live Blinkit product scraping |
| Firebase Phone Auth | OTP authentication |
| PostalPincode API | Pincode → district lookup |
| Nominatim OpenStreetMap | District → lat/lon geocoding |

### Infrastructure
```
React SPA → FastAPI Backend → PostgreSQL
                ↓
         Firebase Auth
                ↓
         Gemini 1.5 Flash
                ↓
         Apify Scraper → Blinkit API
```

---

##  Project Structure

```
ecoreceipt-ai/
├── backend/
│   ├── main.py                 ← FastAPI app + all routes
│   ├── database.py             ← SQLAlchemy engine + session
│   ├── models.py               ← All database table definitions
│   ├── auth.py                 ← Firebase token verification
│   ├── carbon_logic.py         ← keyword → CO₂ score mapping
│   ├── receipt_parser.py       ← Gemini vision OCR for receipts
│   ├── screenshot_verifier.py  ← Gemini vision for order verification
│   ├── blinkit_scraper.py      ← Apify-powered Blinkit integration
│   ├── pincode_service.py      ← Pincode → lat/lon conversion
│   ├── points_service.py       ← Points calculation logic
│   ├── .env                    ← Secrets (never commit)
│   └── requirements.txt        ← Python dependencies
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Splash.jsx
        │   ├── Login.jsx
        │   ├── VerifyOTP.jsx
        │   ├── HowItWorks.jsx
        │   ├── Home.jsx
        │   ├── OnlineMode.jsx
        │   ├── ReceiptMode.jsx
        │   ├── Leaderboard.jsx
        │   ├── Profile.jsx
        │   └── OrderSuccess.jsx
        ├── store/
        │   └── useStore.js     ← Zustand global state
        ├── firebase.js         ← Firebase config
        ├── App.jsx             ← Routes
        ├── main.jsx            ← Entry point
        └── index.css           ← Earthy theme + animations
```

---

## 🗄️ Database Schema

### Tables

```sql
users
  id               UUID PK
  firebase_uid     STRING UNIQUE
  phone            STRING UNIQUE
  name             STRING
  city             STRING
  pincode          STRING
  total_points     INTEGER DEFAULT 100
  total_carbon_saved_kg  FLOAT DEFAULT 0.0
  streak_days      INTEGER DEFAULT 0
  last_active_date DATETIME
  tier             STRING DEFAULT 'Bronze'
  created_at       DATETIME

purchases
  id               UUID PK
  user_id          UUID FK → users
  mode             STRING  ('receipt' | 'online')
  items            JSON
  total_carbon_kg  FLOAT
  carbon_saved_kg  FLOAT
  eco_score        STRING  (A+/A/B/C/D/F)
  points_earned    INTEGER
  receipt_verified STRING  (pending/valid/fake)
  cart_session_id  UUID
  created_at       DATETIME

cart_sessions
  id               UUID PK
  user_id          UUID FK → users
  pincode          STRING
  items            JSON
  alternatives_accepted  INTEGER
  total_carbon_kg  FLOAT
  carbon_saved_kg  FLOAT
  blinkit_redirect_at  DATETIME
  screenshot_verified  BOOLEAN
  status           STRING  (active/redirected/verified/expired)

products_cache
  id               UUID PK
  blinkit_id       STRING
  name             STRING
  brand            STRING
  price            FLOAT
  image_url        STRING
  category         STRING
  carbon_kg        FLOAT
  pincode          STRING
  cached_at        DATETIME

carbon_db
  id               UUID PK
  category         STRING UNIQUE
  co2_per_kg       FLOAT
  eco_alternative  STRING
  keywords         JSON

leaderboard_weekly
  id               UUID PK
  user_id          UUID FK → users
  week             STRING
  carbon_saved_kg  FLOAT
  rank_city        INTEGER
  rank_national    INTEGER
```

---

## ⚡ Points System

```python
WELCOME_BONUS           = 100   # On first login
RECEIPT_SUBMITTED       =  10   # Receipt uploaded
ECO_SCORE_A_PLUS        =  50   # A+ eco grade
ECO_SCORE_A             =  40   # A eco grade
ECO_SCORE_B             =  30   # B eco grade
ECO_SCORE_C             =  20   # C eco grade
ECO_SCORE_D             =  10   # D eco grade
ECO_SCORE_F             =   5   # F eco grade
CART_ITEM_ADDED         =   2   # Per item in online cart
ECO_SWAP_ACCEPTED       =  25   # Per item swapped to alternative
SCREENSHOT_VERIFIED     =  30   # Order confirmed via screenshot
ALL_ALTERNATIVES_BONUS  =  50   # All swappable items swapped
DAILY_STREAK            =   5   # Per day of consecutive usage
STREAK_7_DAY_BONUS      =  50   # 7-day streak milestone
STREAK_30_DAY_BONUS     = 200   # 30-day streak milestone
```

### Tier System
| Tier | Points Required | Cashback Value |
|------|----------------|----------------|
| 🥉 Bronze | 0 – 499 | ₹0 – ₹49.90 |
| 🥈 Silver | 500 – 1,999 | ₹50 – ₹199.90 |
| 🥇 Gold | 2,000 – 4,999 | ₹200 – ₹499.90 |
| 💎 Platinum | 5,000+ | ₹500+ |

*1 point = ₹0.10 cashback value*

---

## 🌍 Carbon Data

Emission factors based on **Poore & Nemecek (2018)** — the most comprehensive global food lifecycle study.

| Category | CO₂ kg/unit | Grade |
|----------|------------|-------|
| Beef/Lamb/Mutton | 25.0 | F |
| Cheese/Butter/Paneer | 6.0 | C |
| Chicken/Fish/Prawn | 4.5 | C |
| Milk | 3.0 | B |
| Oil/Ghee | 3.2 | B |
| Rice | 2.8 | B |
| Eggs | 2.5 | B |
| Lentils/Dal | 0.9 | A |
| Bread/Wheat | 0.8 | A |
| Fruits/Vegetables | 0.5 | A+ |

### Eco Score Grading
```
avg CO₂ per item < 1.0  → A+  (+50 pts)
avg CO₂ per item < 2.5  → A   (+40 pts)
avg CO₂ per item < 5.0  → B   (+30 pts)
avg CO₂ per item < 10.0 → C   (+20 pts)
avg CO₂ per item < 15.0 → D   (+10 pts)
avg CO₂ per item ≥ 15.0 → F   (+5 pts)
```

---

## 🚀 Setup

### Prerequisites
- Python 3.13+
- Node.js 18+
- PostgreSQL 16+
- Git

### 1. Clone Repository

```bash
git clone https://github.com/student-yashsingh/Ecorecipt-AI-DCRUST.git
cd Ecorecipt-AI-DCRUST
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium
```

#### Create `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ecoreceipt_db
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
APIFY_TOKEN=your_apify_token
SECRET_KEY=any_random_long_string
```

#### Create PostgreSQL Database

```bash
psql -U postgres
CREATE DATABASE ecoreceipt_db;
\q
```

#### Start Backend

```bash
uvicorn main:app --reload
# Runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

#### Create `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Start Frontend

```bash
npm run dev
# Runs at http://localhost:5173
```

### 4. API Keys Setup

#### Gemini API (Free)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Create API key → copy to `GEMINI_API_KEY`

#### Firebase
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project → Enable Phone Authentication
3. Project Settings → Service Accounts → Generate private key
4. Copy credentials to `.env`

#### Apify (Free tier)
1. Sign up at [apify.com](https://apify.com)
2. Console → Settings → Integrations → Copy API token
3. Paste to `APIFY_TOKEN`

---

## 📡 API Reference

### Authentication
```http
POST /api/auth/login
Authorization: Bearer {firebase_token}

Response: {
  "is_new_user": boolean,
  "user": { id, phone, name, points, tier, carbon_saved, streak_days }
}
```

### User Profile
```http
GET /api/user/profile
Authorization: Bearer {firebase_token}

Response: { id, phone, name, points, tier, carbon_saved, streak_days }
```

### Online Mode — Search
```http
GET /api/online/search?query=butter&pincode=121001

Response: {
  "results": [ { id, name, brand, price, carbon_score, image_url, ... } ],
  "count": 37,
  "pincode": "121001"
}
```

### Online Mode — Save Cart
```http
POST /api/online/cart/save
Authorization: Bearer {firebase_token}
Content-Type: application/json

Body: { pincode, items, alternatives_accepted, total_carbon }

Response: { session_id, points_earned, carbon_saved_kg }
```

### Online Mode — Redirect
```http
POST /api/online/redirect
Authorization: Bearer {firebase_token}

Body: { session_id }

Response: { blinkit_url, session_id }
```

### Online Mode — Verify Purchase
```http
POST /api/online/verify-purchase
Authorization: Bearer {firebase_token}
Content-Type: multipart/form-data

Body: screenshot (file) + session_id (string)

Response: { verified, items_confirmed, points_earned, eco_score }
```

### Receipt Mode — Analyse
```http
POST /api/receipt/analyze
Authorization: Bearer {firebase_token}
Content-Type: multipart/form-data

Body: file (image)

Response: {
  eco_score, total_carbon_kg, item_count, items,
  points_earned, new_total_points, tier, receipt_date
}
```

### Leaderboard
```http
GET /api/leaderboard

Response: {
  "leaderboard": [ { rank, name, points, tier, carbon_saved } ]
}
```

---

## 🎨 Design System

### Color Palette (Earthy & Natural Theme)

```css
--olive:        #4a7c59   /* Primary — olive green */
--olive-dark:   #2d5a3d   /* Dark olive */
--olive-light:  #7aab8a   /* Light olive */
--terra:        #c1663a   /* Accent — terracotta */
--terra-dark:   #9a4a25   /* Dark terracotta */
--cream:        #faf6f1   /* Background */
--beige:        #f0e8dc   /* Surface cards */
--beige-dark:   #e0d0bc   /* Borders */
--brown:        #2d1f14   /* Dark surfaces */
--brown-mid:    #5c3d2e   /* Mid brown */
--gold:         #d4a017   /* Gold accent */
```

### Typography
- **Headings:** Playfair Display (serif, 700/900)
- **Body:** DM Sans (sans-serif, 300–700)
- **Italic accents:** Cormorant Garamond

### Key CSS Classes
```css
.glass          /* Glassmorphism card */
.glass-dark     /* Dark glassmorphism */
.btn-primary    /* Olive gradient button */
.btn-terra      /* Terracotta gradient button */
.earthy-input   /* Styled form input */
.fade-up        /* Fade + slide up animation */
.float-anim     /* Continuous floating animation */
```

---

## 🔧 requirements.txt

```
fastapi
uvicorn
sqlalchemy
psycopg2-binary
python-dotenv
firebase-admin
httpx
playwright
python-multipart
pydantic-settings
google-generativeai
python-jose
passlib
pillow
nest_asyncio
```

---

## 🌱 Business Model

| Revenue Stream | Description | Estimated Value |
|---------------|-------------|----------------|
| 🏦 B2B API Licensing | Carbon scoring API for banks, fintech, BNPL apps for ESG credit | ₹5–15L/yr |
| 🏭 FMCG Certification | Brands pay for eco-score badge + featured swap placement | ₹2–8L/yr |
| 🏛️ Government Tenders | Smart city sustainability dashboards, anonymised data for policy | ₹20–50L |

### Market Opportunity
- 🇮🇳 1.4B Indian consumers
- 🛒 $70B online grocery market
- 🌿 67% consumers say sustainability affects buying choices
- 📱 500M+ smartphone users

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. Push to branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

### Code Style
- Backend: Follow PEP 8, use type hints
- Frontend: ESLint + Prettier, functional components only
- Commits: Use conventional commits (`feat:`, `fix:`, `docs:`)

---

## 🐛 Known Issues & Troubleshooting

### Blinkit Scraper Returns 0 Products
- Ensure `APIFY_TOKEN` is set correctly in `.env`
- Free tier gives $5/month credits — sufficient for demos
- Check Apify console for actor run logs

### Firebase OTP Not Sending
- Verify phone auth is enabled in Firebase console
- Add your domain to Firebase authorized domains
- Check reCAPTCHA site key configuration

### Gemini Analysis Failing
- Ensure `GEMINI_API_KEY` is valid at [aistudio.google.com](https://aistudio.google.com)
- Receipt image must be clear and under 4MB
- Gemini free tier: 15 requests/minute

### PostgreSQL Connection Error
- Verify `DATABASE_URL` in `.env` matches your PostgreSQL setup
- Ensure database `ecoreceipt_db` exists
- Check PostgreSQL service is running

---

## 📊 Project Stats

```
Total Pages:        11 (React)
API Endpoints:      10 (FastAPI)
Database Tables:    6  (PostgreSQL)
AI Integrations:    2  (Gemini + Apify)
Points Actions:     13 (gamification events)
Carbon Categories:  15 (Indian grocery items)
```

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [Poore & Nemecek (2018)](https://science.sciencemag.org/content/360/6392/987) — Carbon emission data
- [Google Gemini](https://ai.google.dev) — AI vision capabilities
- [Apify](https://apify.com) — Web scraping infrastructure
- [Firebase](https://firebase.google.com) — Authentication
- [OpenStreetMap Nominatim](https://nominatim.org) — Geocoding
- [PostalPincode API](https://api.postalpincode.in) — Indian pincode data

---

<div align="center">

**Built with ❤️ by Yash AND Ankit**

*Google Developer Group · DCRUST Hackathon 2026*

🌿 *EcoReceipt AI — Making every grocery choice count.*

</div>
