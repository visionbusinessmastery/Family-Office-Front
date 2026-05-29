# =========================
# DATA SIGNAL ENGINE
# =========================


def generate_data_signals(
    context: dict,
    risk=None,
    wealth=None,
    allocation=None,
    diversification=None,
    prediction=None,
    macro=None,
):
    """Return structured signals only.

    This satellite must not generate Ethan-like financial advice. Ethan Core is
    the only component allowed to interpret these signals into guidance.
    """

    signals = []

    profile = context.get("profile", {}) or {}
    financial = context.get("financial", {}) or {}

    income = (
        profile.get("monthly_income")
        or financial.get("cashflow_score")
        or 0
    )

    savings = (
        profile.get("epargne")
        or profile.get("savings")
        or 0
    )

    crypto_ratio = (
        financial.get("crypto_ratio")
        or 0
    )

    risk_score = (
        (risk or {}).get("risk_score", 50)
    )

    diversification_score = (
        (diversification or {}).get(
            "diversification_score",
            50
        )
    )

    if savings < 5000:
        signals.append({
            "domain": "savings",
            "signal": "low_savings_buffer",
            "severity": "medium",
        })

    if income < 3000:
        signals.append({
            "domain": "income",
            "signal": "low_income_capacity",
            "severity": "medium",
        })

    if crypto_ratio > 0.5:
        signals.append({
            "domain": "crypto",
            "signal": "high_crypto_concentration",
            "severity": "medium",
        })

    if risk_score > 75:
        signals.append({
            "domain": "risk",
            "signal": "high_risk_score",
            "severity": "high",
        })

    if diversification_score < 40:
        signals.append({
            "domain": "diversification",
            "signal": "low_diversification",
            "severity": "medium",
        })

    return signals


def generate_recommendations(*args, **kwargs):
    """Backward-compatible no-op: Ethan Core owns recommendation wording."""
    return []
