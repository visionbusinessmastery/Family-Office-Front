# =========================
# INTELLIGENCE ROUTES FINANCE
# =========================

# =========================
# IMPORTS
# =========================
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from database import engine
from auth.utils import get_current_user
from core.cache import redis_client
from intelligence.gamification.progress_service import award_xp
from product.entitlements import plan_allows, resolve_effective_plan

router = APIRouter(tags=["Finance"])

# =========================
# HELPER
# =========================
def get_user_id(conn, email: str):
    row = conn.execute(
        text("""
            SELECT id
            FROM users
            WHERE email = :email
        """),
        {"email": email}
    ).fetchone()

    return row.id if row else None

# =========================
# INVALIDATE FINANCE CACHE
# =========================
def invalidate_finance_caches(email: str, user_id: Optional[int] = None):
    try:
        if not redis_client:
            return

        keys = [
            f"intel:{email}",
            f"context:{email}",
            f"score:{email}",
        ]

        if user_id is not None:
            keys.append(f"financial:{user_id}")

        redis_client.delete(*keys)
    except Exception:
        pass


def get_item_name(data: dict):
    return data.get("name") or data.get("label") or ""


def get_effective_plan(conn, user_id: int):
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


def require_child_accounts_access(conn, user_id: int):
    plan = get_effective_plan(conn, user_id)
    if not plan_allows(plan, "LIBERTY"):
        raise HTTPException(
            status_code=403,
            detail="Comptes enfants disponibles a partir de Liberty.",
        )
    return plan


def ensure_child_accounts_table(conn):
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS child_accounts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            child_name TEXT NOT NULL,
            goal TEXT,
            target_amount DOUBLE PRECISION DEFAULT 0,
            current_amount DOUBLE PRECISION DEFAULT 0,
            monthly_contribution DOUBLE PRECISION DEFAULT 0,
            horizon TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    """))

    conn.execute(text("ALTER TABLE child_accounts ADD COLUMN IF NOT EXISTS goal TEXT"))
    conn.execute(text("ALTER TABLE child_accounts ADD COLUMN IF NOT EXISTS target_amount DOUBLE PRECISION DEFAULT 0"))
    conn.execute(text("ALTER TABLE child_accounts ADD COLUMN IF NOT EXISTS current_amount DOUBLE PRECISION DEFAULT 0"))
    conn.execute(text("ALTER TABLE child_accounts ADD COLUMN IF NOT EXISTS monthly_contribution DOUBLE PRECISION DEFAULT 0"))
    conn.execute(text("ALTER TABLE child_accounts ADD COLUMN IF NOT EXISTS horizon TEXT"))
    conn.execute(text("ALTER TABLE child_accounts ADD COLUMN IF NOT EXISTS notes TEXT"))
    conn.execute(text("ALTER TABLE child_accounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()"))


def build_child_account(row):
    progress = (
        min(100, round((float(row.current_amount or 0) / float(row.target_amount or 1)) * 100, 1))
        if float(row.target_amount or 0) > 0
        else 0
    )
    return {
        "id": row.id,
        "child_name": row.child_name,
        "goal": row.goal,
        "target_amount": float(row.target_amount or 0),
        "current_amount": float(row.current_amount or 0),
        "monthly_contribution": float(row.monthly_contribution or 0),
        "horizon": row.horizon,
        "notes": row.notes,
        "progress_percent": progress,
    }


# =========================
# CREATE ITEM
# =========================
@router.post("")
@router.post("/")
def create_finance_item(data: dict, user=Depends(get_current_user)):

    email = user

    with engine.begin() as conn:

        user_id = get_user_id(conn, email)

        if not user_id:
            raise HTTPException(
              status_code=404,
              detail="User not found"
            )
        conn.execute(
            text("""
                INSERT INTO finance_items (user_id, type, name, amount)
                VALUES (:user_id, :type, :name, :amount)
            """),
            {
                "user_id": user_id,
                "type": data.get("type"),
                "name": get_item_name(data),
                "amount": data.get("amount", 0),
            }
        )

        award_xp(conn, user_id, email, f"finance_{data.get('type')}_created", 30)
        invalidate_finance_caches(email, user_id)
  
    return {"status": "created"}


# =========================
# GET FINANCE
# =========================
@router.get("")
@router.get("/")
def get_finance(user=Depends(get_current_user)):

    email = user

    with engine.connect() as conn:

        user_id = get_user_id(conn, email)

        if not user_id:
            return {"error": "User not found"}

        rows = conn.execute(
            text("""
                SELECT id, type, name, amount
                FROM finance_items
                WHERE user_id = :user_id
                ORDER BY id DESC
            """),
            {"user_id": user_id}
        ).fetchall()

    revenues = []
    charges = []
    debts = []
    savings = []

    for r in rows:

        item = {
            "id": r.id,
            "type": r.type,
            "name": r.name,
            "label": r.name,
            "amount": float(r.amount or 0)
        }

        if r.type == "revenus":
            revenues.append(item)

        elif r.type == "charges":
            charges.append(item)

        elif r.type == "dettes":
            debts.append(item)

        elif r.type == "epargne":
            savings.append(item)

    return {
        "revenus": revenues,
        "charges": charges,
        "dettes": debts,
        "epargne": savings
    }


@router.get("/child-accounts")
def get_child_accounts(user=Depends(get_current_user)):
    email = user

    with engine.begin() as conn:
        user_id = get_user_id(conn, email)
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found")

        plan = require_child_accounts_access(conn, user_id)
        ensure_child_accounts_table(conn)
        rows = conn.execute(text("""
            SELECT *
            FROM child_accounts
            WHERE user_id = :user_id
            ORDER BY updated_at DESC, id DESC
        """), {"user_id": user_id}).fetchall()

    accounts = [build_child_account(row) for row in rows]
    return {
        "plan": plan,
        "accounts": accounts,
        "totals": {
            "target_amount": round(sum(item["target_amount"] for item in accounts), 2),
            "current_amount": round(sum(item["current_amount"] for item in accounts), 2),
            "monthly_contribution": round(sum(item["monthly_contribution"] for item in accounts), 2),
        },
    }


@router.post("/child-accounts")
def create_child_account(data: dict, user=Depends(get_current_user)):
    email = user

    with engine.begin() as conn:
        user_id = get_user_id(conn, email)
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found")

        require_child_accounts_access(conn, user_id)
        ensure_child_accounts_table(conn)
        child_name = (data.get("child_name") or data.get("name") or "").strip()
        if not child_name:
            raise HTTPException(status_code=400, detail="Nom enfant requis")

        conn.execute(text("""
            INSERT INTO child_accounts (
                user_id, child_name, goal, target_amount, current_amount,
                monthly_contribution, horizon, notes, updated_at
            )
            VALUES (
                :user_id, :child_name, :goal, :target_amount, :current_amount,
                :monthly_contribution, :horizon, :notes, NOW()
            )
        """), {
            "user_id": user_id,
            "child_name": child_name,
            "goal": data.get("goal"),
            "target_amount": float(data.get("target_amount") or 0),
            "current_amount": float(data.get("current_amount") or 0),
            "monthly_contribution": float(data.get("monthly_contribution") or 0),
            "horizon": data.get("horizon"),
            "notes": data.get("notes"),
        })

        award_xp(conn, user_id, email, "child_account_created", 80)
        invalidate_finance_caches(email, user_id)

    return {"status": "created"}


@router.put("/child-accounts/{account_id}")
def update_child_account(account_id: int, data: dict, user=Depends(get_current_user)):
    email = user

    with engine.begin() as conn:
        user_id = get_user_id(conn, email)
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found")

        require_child_accounts_access(conn, user_id)
        ensure_child_accounts_table(conn)
        result = conn.execute(text("""
            UPDATE child_accounts
            SET child_name = :child_name,
                goal = :goal,
                target_amount = :target_amount,
                current_amount = :current_amount,
                monthly_contribution = :monthly_contribution,
                horizon = :horizon,
                notes = :notes,
                updated_at = NOW()
            WHERE id = :id AND user_id = :user_id
        """), {
            "id": account_id,
            "user_id": user_id,
            "child_name": (data.get("child_name") or data.get("name") or "").strip(),
            "goal": data.get("goal"),
            "target_amount": float(data.get("target_amount") or 0),
            "current_amount": float(data.get("current_amount") or 0),
            "monthly_contribution": float(data.get("monthly_contribution") or 0),
            "horizon": data.get("horizon"),
            "notes": data.get("notes"),
        })

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Compte enfant introuvable")

        award_xp(conn, user_id, email, "child_account_updated", 20)
        invalidate_finance_caches(email, user_id)

    return {"status": "updated", "id": account_id}


@router.delete("/child-accounts/{account_id}")
def delete_child_account(account_id: int, user=Depends(get_current_user)):
    email = user

    with engine.begin() as conn:
        user_id = get_user_id(conn, email)
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found")

        require_child_accounts_access(conn, user_id)
        ensure_child_accounts_table(conn)
        result = conn.execute(text("""
            DELETE FROM child_accounts
            WHERE id = :id AND user_id = :user_id
        """), {"id": account_id, "user_id": user_id})

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Compte enfant introuvable")

        invalidate_finance_caches(email, user_id)

    return {"status": "deleted", "id": account_id}


# =========================
# UPDATE ITEM
# =========================
@router.put("/{item_id}")
def update_finance(item_id: int, data: dict, user=Depends(get_current_user)):

    email = user

    with engine.begin() as conn:

        user_id = get_user_id(conn, email)

        if not user_id:
            return {"error": "User not found"}

        conn.execute(
            text("""
                UPDATE finance_items
                SET name = :name,
                    amount = :amount
                WHERE id = :id AND user_id = :user_id
            """),
            {
                "id": item_id,
                "user_id": user_id,
                "name": get_item_name(data),
                "amount": data.get("amount", 0)
            }
        )

        award_xp(conn, user_id, email, "finance_updated", 10)
        invalidate_finance_caches(email, user_id)

    return {"status": "updated"}


# =========================
# DELETE ITEM
# =========================
@router.delete("/{item_id}")
def delete_finance(item_id: int, user=Depends(get_current_user)):

    email = user

    with engine.begin() as conn:

        user_id = get_user_id(conn, email)

        if not user_id:
            return {"error": "User not found"}

        conn.execute(
            text("""
                DELETE FROM finance_items
                WHERE id = :id AND user_id = :user_id
            """),
            {
                "id": item_id,
                "user_id": user_id
            }
        )

        invalidate_finance_caches(email, user_id)
        
    return {"status": "deleted"}


# =========================
# ADD XP
# =========================
def add_xp(conn, user_id: int, xp_amount: int):

    row = conn.execute(
        text("""
            SELECT xp
            FROM user_gamification
            WHERE user_id = :user_id
        """),
        {"user_id": user_id}
    ).fetchone()

    if not row:

        conn.execute(
            text("""
                INSERT INTO user_gamification
                (user_id, xp, level)
                VALUES (:user_id, :xp, :level)
            """),
            {
                "user_id": user_id,
                "xp": xp_amount,
                "level": 1
            }
        )

    else:

        new_xp = row.xp + xp_amount
        level = int(new_xp / 100) + 1

        conn.execute(
            text("""
                UPDATE user_gamification
                SET xp = :xp,
                    level = :level
                WHERE user_id = :user_id
            """),
            {
                "xp": new_xp,
                "level": level,
                "user_id": user_id
            }
        )
