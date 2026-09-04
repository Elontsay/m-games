"""Arena governance: player-created contests, reports, and bans.

Tier 1+ can propose a contest; Tier 3 approves it (which is what makes its MBucks
reward real) or rejects it. Tier 2+ can report a player; Tier 3 can act on a
report by banning. Tier 4 -- the owner's own Google account, see auth.py -- is
the only one who can hand out Tier 3.
"""
import time

from flask import Blueprint, abort, jsonify, request

from .auth import admin_tier, current_user, require_active_user, require_tier
from .db import get_db, get_user

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

MAX_TITLE = 80
MAX_TEXT = 1000
MAX_REWARD = 1_000_000


def _contest_dict(row) -> dict:
    return {
        "id": row["id"],
        "creatorUserId": row["creator_user_id"],
        "title": row["title"],
        "description": row["description"],
        "mbucksReward": row["mbucks_reward"],
        "status": row["status"],
        "approvedBy": row["approved_by"],
        "createdAt": row["created_at"],
        "decidedAt": row["decided_at"],
    }


# ---- contests -----------------------------------------------------------------

@admin_bp.post("/contests")
def create_contest():
    user = require_tier(1)
    body = request.get_json(silent=True) or {}
    title = str(body.get("title") or "").strip()[:MAX_TITLE]
    description = str(body.get("description") or "").strip()[:MAX_TEXT]
    try:
        reward = max(0, min(MAX_REWARD, int(body.get("mbucksReward") or 0)))
    except (TypeError, ValueError):
        reward = 0
    if not title or not description:
        abort(400, "title and description are required.")
    db = get_db()
    cur = db.execute(
        """
        INSERT INTO custom_contests (creator_user_id, title, description, mbucks_reward, status, created_at)
        VALUES (?, ?, ?, ?, 'pending', ?)
        """,
        (user["id"], title, description, reward, time.time()),
    )
    db.commit()
    row = db.execute("SELECT * FROM custom_contests WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(_contest_dict(row)), 201


@admin_bp.get("/contests")
def list_contests():
    """Tier 3+ sees every contest (so it can review the pending queue); everyone
    else sees only the ones they created plus the approved catalog."""
    user = require_tier(1)
    db = get_db()
    if admin_tier(user) >= 3:
        rows = db.execute("SELECT * FROM custom_contests ORDER BY created_at DESC").fetchall()
    else:
        rows = db.execute(
            "SELECT * FROM custom_contests WHERE creator_user_id = ? OR status = 'approved' ORDER BY created_at DESC",
            (user["id"],),
        ).fetchall()
    return jsonify(contests=[_contest_dict(r) for r in rows])


@admin_bp.get("/contests/approved")
def list_approved_contests():
    """The public catalog anyone signed in can attempt."""
    if current_user() is None:
        abort(401)
    rows = get_db().execute(
        "SELECT * FROM custom_contests WHERE status = 'approved' ORDER BY created_at DESC"
    ).fetchall()
    return jsonify(contests=[_contest_dict(r) for r in rows])


def _decide_contest(contest_id: int, status: str):
    user = require_tier(3)
    db = get_db()
    row = db.execute("SELECT * FROM custom_contests WHERE id = ?", (contest_id,)).fetchone()
    if row is None:
        abort(404)
    if row["status"] != "pending":
        abort(409, "Already decided.")
    db.execute(
        "UPDATE custom_contests SET status = ?, approved_by = ?, decided_at = ? WHERE id = ?",
        (status, user["id"], time.time(), contest_id),
    )
    db.commit()
    row = db.execute("SELECT * FROM custom_contests WHERE id = ?", (contest_id,)).fetchone()
    return jsonify(_contest_dict(row))


@admin_bp.post("/contests/<int:contest_id>/approve")
def approve_contest(contest_id: int):
    return _decide_contest(contest_id, "approved")


@admin_bp.post("/contests/<int:contest_id>/reject")
def reject_contest(contest_id: int):
    return _decide_contest(contest_id, "rejected")


@admin_bp.post("/contests/<int:contest_id>/complete")
def complete_contest(contest_id: int):
    """Anyone signed in (and not banned) can mark an approved contest done, once.
    First completion queues its MBucks reward as a wallet credit for the client
    to claim -- see /api/wallet/credits."""
    user = require_active_user()
    db = get_db()
    contest = db.execute("SELECT * FROM custom_contests WHERE id = ?", (contest_id,)).fetchone()
    if contest is None or contest["status"] != "approved":
        abort(404)
    already = db.execute(
        "SELECT 1 FROM contest_completions WHERE contest_id = ? AND user_id = ?", (contest_id, user["id"])
    ).fetchone()
    if already:
        return jsonify(ok=True, alreadyCompleted=True)
    db.execute(
        "INSERT INTO contest_completions (contest_id, user_id, completed_at) VALUES (?, ?, ?)",
        (contest_id, user["id"], time.time()),
    )
    if contest["mbucks_reward"] > 0:
        db.execute(
            "INSERT INTO wallet_credits (user_id, amount, reason, created_at) VALUES (?, ?, ?, ?)",
            (user["id"], contest["mbucks_reward"], f"Completed “{contest['title']}”", time.time()),
        )
    db.commit()
    return jsonify(ok=True, alreadyCompleted=False, mbucksAwarded=contest["mbucks_reward"])


# ---- reports & bans -------------------------------------------------------

@admin_bp.post("/report")
def report_user():
    user = require_tier(2)
    body = request.get_json(silent=True) or {}
    try:
        reported_id = int(body.get("reportedUserId"))
    except (TypeError, ValueError):
        abort(400, "reportedUserId is required.")
    reason = str(body.get("reason") or "").strip()[:MAX_TEXT]
    if not reason:
        abort(400, "reason is required.")
    if reported_id == user["id"]:
        abort(400, "You cannot report yourself.")
    target = get_user(reported_id)
    if target is None:
        abort(404)
    db = get_db()
    db.execute(
        "INSERT INTO reports (reporter_user_id, reported_user_id, reason, status, created_at) VALUES (?, ?, ?, 'open', ?)",
        (user["id"], reported_id, reason, time.time()),
    )
    db.commit()
    return jsonify(ok=True), 201


@admin_bp.get("/reports")
def list_reports():
    require_tier(3)
    rows = get_db().execute(
        """
        SELECT r.*, reporter.name AS reporter_name, reported.name AS reported_name, reported.banned AS reported_banned
        FROM reports r
        JOIN users reporter ON reporter.id = r.reporter_user_id
        JOIN users reported ON reported.id = r.reported_user_id
        ORDER BY r.created_at DESC
        """
    ).fetchall()
    return jsonify(
        reports=[
            {
                "id": r["id"],
                "reporterUserId": r["reporter_user_id"],
                "reporterName": r["reporter_name"],
                "reportedUserId": r["reported_user_id"],
                "reportedName": r["reported_name"],
                "reportedBanned": bool(r["reported_banned"]),
                "reason": r["reason"],
                "status": r["status"],
                "createdAt": r["created_at"],
            }
            for r in rows
        ]
    )


@admin_bp.post("/reports/<int:report_id>/dismiss")
def dismiss_report(report_id: int):
    require_tier(3)
    db = get_db()
    row = db.execute("SELECT 1 FROM reports WHERE id = ?", (report_id,)).fetchone()
    if row is None:
        abort(404)
    db.execute("UPDATE reports SET status = 'dismissed', decided_at = ? WHERE id = ?", (time.time(), report_id))
    db.commit()
    return jsonify(ok=True)


@admin_bp.post("/users/<int:user_id>/ban")
def ban_user(user_id: int):
    actor = require_tier(3)
    if user_id == actor["id"]:
        abort(400, "You cannot ban yourself.")
    target = get_user(user_id)
    if target is None:
        abort(404)
    if admin_tier(target) >= 3:
        abort(403, "Cannot ban a Tier 3+ admin.")
    db = get_db()
    db.execute("UPDATE users SET banned = 1 WHERE id = ?", (user_id,))
    db.execute(
        "UPDATE reports SET status = 'actioned', decided_at = ? WHERE reported_user_id = ? AND status = 'open'",
        (time.time(), user_id),
    )
    db.commit()
    return jsonify(ok=True)


@admin_bp.post("/users/<int:user_id>/unban")
def unban_user(user_id: int):
    require_tier(3)
    db = get_db()
    if get_user(user_id) is None:
        abort(404)
    db.execute("UPDATE users SET banned = 0 WHERE id = ?", (user_id,))
    db.commit()
    return jsonify(ok=True)


# ---- Tier 4 (owner) only: hand out Tier 3 --------------------------------

@admin_bp.post("/users/<int:user_id>/promote")
def promote_user(user_id: int):
    require_tier(4)
    target = get_user(user_id)
    if target is None:
        abort(404)
    body = request.get_json(silent=True) or {}
    tier = body.get("tier", 3)
    if tier not in (0, 1, 2, 3):
        abort(400, "tier must be 0-3 (Tier 4 is reserved for the owner's account).")
    db = get_db()
    db.execute("UPDATE users SET admin_tier = ? WHERE id = ?", (tier, user_id))
    db.commit()
    return jsonify(ok=True, userId=user_id, adminTier=tier)
