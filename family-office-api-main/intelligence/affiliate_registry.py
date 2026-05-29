# =========================
# AFFILIATE REGISTRY
# =========================

from modules.business.affiliate_engine import (
    get_business_affiliates
)

from modules.banking.affiliate_engine import (
    get_banking_affiliates
)

from modules.market.affiliate_engine import (
    get_market_affiliates
)

from modules.stocks.affiliate_engine import (
    get_stocks_affiliates
)

AFFILIATE_ENGINES = {

    "business": get_business_affiliates,
    "banking": get_banking_affiliates,
    "market": get_market_affiliates,
    "stocks": get_stocks_affiliates,
}


AFFILIATE_ARCHITECTURE = {
    "registry": "intelligence/affiliate_registry.py",
    "module_engines": [
        "modules/business/affiliate_engine.py",
        "modules/banking/affiliate_engine.py",
        "modules/market/affiliate_engine.py",
        "modules/stocks/affiliate_engine.py",
        "modules/ai_business/affiliate_engine.py",
        "modules/real_estate/affiliate_engine.py",
        "modules/crypto/affiliate_engine.py",
        "modules/etf/affiliate_engine.py",
        "modules/private_equity/affiliate_engine.py",
    ],
    "current_surfaces": [
        "intelligence/gamification/api/dashboard.py:build_affiliations",
        "components/dashboard/AdvisorChat.tsx:Opportunites partenaires",
    ],
    "principle": (
        "Une affiliation doit etre exposee comme recommandation strategique "
        "contextualisee, avec raison, priorite et prochaine verification, jamais "
        "comme publicite brute."
    ),
}


def describe_affiliate_architecture():
    return AFFILIATE_ARCHITECTURE
