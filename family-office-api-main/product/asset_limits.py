from fastapi import HTTPException
from sqlalchemy import text

from product.entitlements import build_entitlements, resolve_effective_plan


ASSET_COUNT_QUERIES = [
    "SELECT COUNT(*) FROM portfolio WHERE user_id = :user_id",
    "SELECT COUNT(*) FROM real_estate_assets WHERE user_id = :user_id",
    "SELECT COUNT(*) FROM yield_assets WHERE user_id = :user_id",
    "SELECT COUNT(*) FROM venture_assets WHERE user_id = :user_id",
]


def get_effective_user_plan(conn, user_id: int) -> str:
    row = conn.execute(text("""
        SELECT
            users.plan AS user_plan,
            subscriptions.plan AS subscription_plan,
            subscriptions.status AS subscription_status
        FROM users
        LEFT JOIN subscriptions ON subscriptions.user_id = users.id
        WHERE users.id = :user_id
    """), {"user_id": user_id}).fetchone()

    if not row:
        return "FREE"

    return resolve_effective_plan(
        row.user_plan,
        row.subscription_plan,
        row.subscription_status,
    )


def count_user_assets(conn, user_id: int) -> int:
    total = 0
    for query in ASSET_COUNT_QUERIES:
        try:
            total += int(conn.execute(text(query), {"user_id": user_id}).scalar() or 0)
        except Exception:
            continue
    return total


def assert_asset_limit_available(conn, user_id: int):
    plan = get_effective_user_plan(conn, user_id)
    max_assets = build_entitlements(plan).get("max_assets")

    if max_assets is None:
        return {
            "plan": plan,
            "max_assets": None,
            "current_assets": count_user_assets(conn, user_id),
        }

    current_assets = count_user_assets(conn, user_id)
    if current_assets >= int(max_assets):
        raise HTTPException(
            status_code=403,
            detail=(
                f"Limite d'assets atteinte pour le plan {plan}: "
                f"{current_assets}/{max_assets}."
            ),
        )

    return {
        "plan": plan,
        "max_assets": int(max_assets),
        "current_assets": current_assets,
    }
