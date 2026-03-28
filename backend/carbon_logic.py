def assign_carbon_score(item_name: str) -> dict:
    name = item_name.lower()

    rules = [
        (["beef","lamb","mutton"],          25.0, "High",        "Try lentils or tofu instead"),
        (["cheese","butter","paneer","cream"], 6.0, "High",      "Try oat-based alternatives"),
        (["chocolate"],                      3.5, "Medium-High", "Try fruit-based snacks"),
        (["milk"],                           3.0, "Medium-High", "Try oat milk or almond milk"),
        (["oil","ghee"],                     3.2, "Medium-High", "Use sparingly"),
        (["chicken","pork","fish","prawn"],  4.5, "Medium",      "Try eggs or legumes"),
        (["eggs","egg"],                     2.5, "Low-Medium",  "Good low-carbon protein"),
        (["rice"],                           2.8, "Medium",      "Try millets or quinoa"),
        (["juice","soda","drink"],           1.2, "Medium",      "Try water or homemade drinks"),
        (["chips","snack","biscuit","cookie"], 1.5, "Medium",    "Try fresh fruit"),
        (["bread","wheat","flour","oats"],   0.8, "Low",         "Great low-carbon choice"),
        (["sugar"],                          0.6, "Low",         "Use jaggery instead"),
        (["lentil","dal","beans","legume"],  0.9, "Low",         "Excellent eco choice!"),
        (["fruit","vegetable","tomato","potato","onion",
           "carrot","spinach","banana","apple"], 0.5, "Low",     "Excellent eco choice!"),
    ]

    for keywords, score, category, alternative in rules:
        if any(kw in name for kw in keywords):
            return {"score": score, "category": category, "alternative": alternative}

    return {"score": 1.0, "category": "Unknown", "alternative": "Check for local alternatives"}