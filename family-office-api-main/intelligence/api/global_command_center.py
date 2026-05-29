# =========================
# GLOBAL COMMAND CENTER V3
# =========================

import json
import hashlib
import logging
from datetime import datetime

from fastapi import APIRouter

from core.cache import redis_client

from intelligence.scoring.compute_module_score import (
    compute_module_score
)

from intelligence.scoring.scoring_context_builder import (
    build_scoring_context
)

logger = logging.getLogger(__name__)
COMMAND_CENTER_VERSION = "gcc-v2-data-signals"

router = APIRouter(
    prefix="/global-command-center",
    tags=["Global Command Center"]
)

# =========================
# MODULE WEIGHTS
# =========================
MODULE_WEIGHTS = {

    "business": 1.2,
    "crypto": 0.9,
    "real_estate": 1.3,
    "banking": 1.0,
    "market": 1.0,

    "stocks": 1.1,

    "startup": 0.8,
    "private_equity": 1.4,
    "franchise": 0.9,
    "etf": 1.1,
    "entrepreneurship": 1.2,
    "crowdfunding": 0.6,
    "commodities": 0.8,
    "ai_business": 1.0,
}


# =========================
# CACHE HELPERS
# =========================
def get_cache(key):

    try:

        if redis_client:

            data = redis_client.get(key)

            if data:
                return json.loads(data)

    except:
        pass

    return None


def set_cache(key, value, ttl=300):

    try:

        if redis_client:

            redis_client.setex(
                key,
                ttl,
                json.dumps(value)
            )

    except:
        pass


# =========================
# HASH BUILDER
# =========================
def build_hash(
    user,
    onboarding,
    portfolio,
    financial
):

    raw = json.dumps({
        "user": user,
        "onboarding": onboarding,
        "portfolio": portfolio,
        "financial": financial
    }, sort_keys=True)

    return hashlib.md5(
        raw.encode()
    ).hexdigest()


# =========================
# LEVEL ENGINE
# =========================
def compute_level(score: int):

    if score >= 90:
        return "LEGEND"

    if score >= 80:
        return "ELITE"

    if score >= 70:
        return "ADVANCED"

    if score >= 50:
        return "INTERMEDIATE"

    return "BEGINNER"


# =========================
# MAIN ENGINE
# =========================
def compute_global_command_center(
    user=None,
    onboarding=None,
    portfolio=None,
    financial_overview=None,
):

    user = user or {}
    onboarding = onboarding or {}
    portfolio = portfolio or []
    financial_overview = financial_overview or {}

    try:

        # =========================
        # CACHE KEY
        # =========================
        cache_hash = build_hash(
            user,
            onboarding,
            portfolio,
            financial_overview
        )

        cache_key = (
            f"gcc:{COMMAND_CENTER_VERSION}:{cache_hash}"
        )

        # =========================
        # CACHE CHECK
        # =========================
        cached = get_cache(cache_key)

        if cached:
            return cached

        # =========================
        # BUILD CONTEXT
        # =========================
        context = build_scoring_context(
            user=user,
            portfolio=portfolio,
            financial=financial_overview,
            onboarding=onboarding
        )

        modules = {}

        weighted_total = 0
        total_weight = 0

        # =========================
        # MODULE SCORING
        # =========================
        for module_name, weight in MODULE_WEIGHTS.items():

            result = compute_module_score(
                module_name,
                context
            )

            module_score = result.get(
                "score",
                0
            )

            modules[module_name] = {

                "score":
                    module_score,

                "weight":
                    weight,
            }

            weighted_total += (
                module_score * weight
            )

            total_weight += weight

        # =========================
        # GLOBAL SCORE
        # =========================
        global_score = int(
            weighted_total / total_weight
        ) if total_weight > 0 else 0

        global_score = max(
            0,
            min(global_score, 100)
        )

        # =========================
        # LEVEL
        # =========================
        level = compute_level(
            global_score
        )

        # =========================
        # DATA SIGNALS ONLY
        # =========================
        module_signals = []

        if modules.get("crypto", {}).get("score", 0) < 40:
            module_signals.append({
                "module": "crypto",
                "signal": "low_module_score",
                "severity": "medium",
                "label": "Exposition crypto peu structuree",
            })

        if modules.get("real_estate", {}).get("score", 0) < 50:
            module_signals.append({
                "module": "real_estate",
                "signal": "low_module_score",
                "severity": "medium",
                "label": "Poche immobiliere peu developpee",
            })

        if modules.get("business", {}).get("score", 0) < 50:
            module_signals.append({
                "module": "business",
                "signal": "low_module_score",
                "severity": "medium",
                "label": "Revenus business peu structures",
            })

        if modules.get("banking", {}).get("score", 0) < 50:
            module_signals.append({
                "module": "banking",
                "signal": "low_module_score",
                "severity": "medium",
                "label": "Base de securite bancaire a renforcer",
            })

        if modules.get("entrepreneurship", {}).get("score", 0) > 80:
            module_signals.append({
                "module": "entrepreneurship",
                "signal": "high_module_score",
                "severity": "positive",
                "label": "Potentiel entrepreneurial visible",
            })

        # =========================
        # FINAL PAYLOAD
        # =========================
        result = {

            "global_score":
                global_score,

            "level":
                level,

            "modules":
                modules,

            "module_signals":
                module_signals,

            "advice":
                [],

            "context": {

                "portfolio_size":
                    len(portfolio),

                "module_count":
                    len(modules),

                "financial_loaded":
                    bool(financial_overview),
            }
        }
        result["version"] = COMMAND_CENTER_VERSION
        result["timestamp"] = datetime.utcnow().isoformat()
        result["data_hash"] = hashlib.sha256(
            json.dumps(result, sort_keys=True, default=str).encode()
        ).hexdigest()

        # =========================
        # CACHE STORE
        # =========================
        set_cache(
            cache_key,
            result,
            ttl=300
        )

        return result

    except Exception as e:

        logger.error(
            f"[GLOBAL COMMAND ERROR] {e}"
        )

        return {

            "global_score": 0,

            "level": "BEGINNER",

            "modules": {},

            "module_signals": [],

            "advice": [],

            "version": COMMAND_CENTER_VERSION,

            "timestamp": datetime.utcnow().isoformat(),

            "data_hash": "error",

            "error": str(e)
        }
