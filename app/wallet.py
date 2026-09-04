"""MBucks a player earned server-side (completing an approved contest). The
server never edits the client's opaque saved-progress blob directly; instead
the client claims these credits on load and folds the amount into its own
local MBucks total, then saves as normal."""
import time

from flask import Blueprint, jsonify

from .auth import require_active_user
from .db import get_db

wallet_bp = Blueprint("wallet", __name__, url_prefix="/api/wallet")


@wallet_bp.get("/credits")
def claim_credits():
    """Returns every not-yet-claimed credit and marks them claimed in the same
    request, so a dropped response can't double-award (the client just won't
    see them -- support can look them up by user id if that ever happens)."""
    user = require_active_user()
    db = get_db()
    rows = db.execute(
        "SELECT id, amount, reason, created_at FROM wallet_credits WHERE user_id = ? AND claimed_at IS NULL",
        (user["id"],),
    ).fetchall()
    if rows:
        db.execute(
            "UPDATE wallet_credits SET claimed_at = ? WHERE user_id = ? AND claimed_at IS NULL",
            (time.time(), user["id"]),
        )
        db.commit()
    return jsonify(
        credits=[{"id": r["id"], "amount": r["amount"], "reason": r["reason"], "createdAt": r["created_at"]} for r in rows],
        total=sum(r["amount"] for r in rows),
    )
