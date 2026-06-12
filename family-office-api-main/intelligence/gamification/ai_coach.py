import json

from core.cache import redis_client


def get_cache(key):
    try:
        if redis_client:
            data = redis_client.get(key)
            if data:
                return json.loads(data)
    except Exception:
        pass
    return None


def set_cache(key, value, ttl=300):
    try:
        if redis_client:
            redis_client.setex(key, ttl, json.dumps(value))
    except Exception:
        pass


PROGRESSION_MESSAGES = {
    "FREE": "Progression active: continue a enrichir ton cockpit.",
    "SILVER": "Progression active: tes bases deviennent plus lisibles.",
    "GOLD": "Progression active: ton espace devient plus complet.",
    "ELITE": "Progression active: plusieurs modules sont maintenant suivis.",
    "LIBERTY": "Progression active: la structure avance avec plus de profondeur.",
    "LEGACY": "Progression active: la continuite familiale devient plus visible.",
}


def ai_coach_insight(score: float, level: str, streak: int = 0, user_id: str = None):
    """
    Progression feedback only.

    Gamification is a satellite: it can reflect XP, streak and badges, but it
    must not produce financial advice or Ethan-like reasoning.
    """
    level = (level or "FREE").upper()
    cache_key = f"progression_feedback:{user_id}:{level}:{streak}"

    cached = get_cache(cache_key)
    if cached:
        return cached

    message = PROGRESSION_MESSAGES.get(level, PROGRESSION_MESSAGES["FREE"])
    if streak >= 30:
        message += " Regularite mensuelle conservee."
    elif streak >= 14:
        message += " Deux semaines de regularite."
    elif streak >= 7:
        message += " Serie hebdomadaire active."

    result = {
        "level": level,
        "streak": streak,
        "message": message,
        "recommendation": None,
        "authority": "progression_feedback_only",
    }

    set_cache(cache_key, result, ttl=300)
    return result
