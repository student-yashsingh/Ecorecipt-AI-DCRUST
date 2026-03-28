# ─────────────────────────────────────────
# POINTS CONSTANTS — never hardcode these elsewhere
# ─────────────────────────────────────────

WELCOME_BONUS           = 100
RECEIPT_SUBMITTED       =  10
ECO_SCORE_A_PLUS        =  50
ECO_SCORE_A             =  40
ECO_SCORE_B             =  30
ECO_SCORE_C             =  20
ECO_SCORE_D             =  10
ECO_SCORE_F             =   5
CART_ITEM_ADDED         =   2
ECO_SWAP_ACCEPTED       =  25
SCREENSHOT_VERIFIED     =  30
ALL_ALTERNATIVES_BONUS  =  50
DAILY_STREAK            =   5
STREAK_7_DAY_BONUS      =  50
STREAK_30_DAY_BONUS     = 200

# ─────────────────────────────────────────
# ECO SCORE GRADING
# ─────────────────────────────────────────

def calculate_eco_score(total_carbon_kg: float, num_items: int) -> str:
    if num_items == 0:
        return "F"
    avg = total_carbon_kg / num_items
    if avg < 1.0:
        return "A+"
    elif avg < 2.5:
        return "A"
    elif avg < 5.0:
        return "B"
    elif avg < 10.0:
        return "C"
    elif avg < 15.0:
        return "D"
    else:
        return "F"

def points_for_eco_score(score: str) -> int:
    return {
        "A+": ECO_SCORE_A_PLUS,
        "A":  ECO_SCORE_A,
        "B":  ECO_SCORE_B,
        "C":  ECO_SCORE_C,
        "D":  ECO_SCORE_D,
        "F":  ECO_SCORE_F,
    }.get(score, ECO_SCORE_F)

# ─────────────────────────────────────────
# TIER CALCULATION
# ─────────────────────────────────────────

def calculate_tier(total_points: int) -> str:
    if total_points >= 5000:
        return "Platinum"
    elif total_points >= 2000:
        return "Gold"
    elif total_points >= 500:
        return "Silver"
    else:
        return "Bronze"