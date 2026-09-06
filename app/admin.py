"""Arena governance: player-created contests, reports, and bans.

Tier 1+ can propose a contest; Tier 3 approves it (which is what makes its MBucks
reward real) or rejects it. Tier 2+ can report a player, and Tier 3 reviews and
dismisses those reports. Banning is Tier 4 only -- the owner's own Google
account, see auth.py -- as is handing out Tier 3.
"""
import json
import time

from flask import Blueprint, abort, jsonify, request

from .auth import current_user, require_active_user, require_tier, tier_of
from .db import get_db, get_user

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

MAX_TITLE = 80
MAX_TEXT = 1000
MAX_QUESTIONS = 10
MAX_ANSWER = 120
MAX_QUESTION_MBUCKS = 10_000


def _normalize(answer) -> str:
    """The same shape as the game's own answer check, so an answer typed into a
    player-made contest behaves like an answer typed anywhere else."""
    s = str(answer).lower()
    for old, new in (("π", "pi"), ("√", "sqrt"), ("²", "^2"), ("³", "^3"), ("**", "^"),
                     ("−", "-"), ("–", "-"), ("×", "*"), ("⟨", "<"), ("⟩", ">")):
        s = s.replace(old, new)
    return "".join(s.split())


def _parse_questions(raw) -> list:
    """Authored questions, checked before they are stored. Alternative answers
    are written one | another, so "1/2 | 0.5" accepts either."""
    if not isinstance(raw, list) or not raw:
        abort(400, "A contest needs at least one question.")
    if len(raw) > MAX_QUESTIONS:
        abort(400, f"A contest can have at most {MAX_QUESTIONS} questions.")
    out = []
    for item in raw:
        if not isinstance(item, dict):
            abort(400, "Each question must be an object.")
        prompt = str(item.get("q") or "").strip()[:MAX_TEXT]
        answer = str(item.get("a") or "").strip()[:MAX_ANSWER]
        if not prompt or not answer:
            abort(400, "Every question needs both a prompt and an answer.")
        try:
            pay = int(item.get("mbucks") or 0)
        except (TypeError, ValueError):
            abort(400, "Each question's MBucks must be a whole number.")
        out.append({"q": prompt, "a": answer, "mbucks": max(0, min(MAX_QUESTION_MBUCKS, pay))})
    return out


def _questions_of(row) -> list:
    try:
        parsed = json.loads(row["questions"])
    except (TypeError, ValueError):
        return []
    return parsed if isinstance(parsed, list) else []


def _contest_dict(row, answers: bool) -> dict:
    """`answers` decides whether the answer key travels with the contest. It goes
    to the author and to a Tier 3 reviewing it -- never to a player about to sit
    it, or the contest would come with its own solutions."""
    questions = _questions_of(row)
    return {
        "id": row["id"],
        "creatorUserId": row["creator_user_id"],
        "title": row["title"],
        "description": row["description"],
        "mbucksReward": row["mbucks_reward"],
        "questionCount": len(questions),
        "questions": [
            dict({"q": q.get("q", ""), "mbucks": q.get("mbucks", 0)}, **({"a": q.get("a", "")} if answers else {}))
            for q in questions
        ],
        "status": row["status"],
        "approvedBy": row["approved_by"],
        "createdAt": row["created_at"],
        "decidedAt": row["decided_at"],
    }


# ---- contests -----------------------------------------------------------------

@admin_bp.post("/contests")
def create_contest():
    """Proposing a contest means writing it out in full: every question, its
    answer, and what that question pays. The total is the sum of the parts."""
    user = require_tier(1)
    body = request.get_json(silent=True) or {}
    title = str(body.get("title") or "").strip()[:MAX_TITLE]
    description = str(body.get("description") or "").strip()[:MAX_TEXT]
    if not title or not description:
        abort(400, "title and description are required.")
    questions = _parse_questions(body.get("questions"))
    reward = sum(q["mbucks"] for q in questions)
    db = get_db()
    cur = db.execute(
        """
        INSERT INTO custom_contests
            (creator_user_id, title, description, questions, mbucks_reward, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?)
        """,
        (user["id"], title, description, json.dumps(questions), reward, time.time()),
    )
    db.commit()
    row = db.execute("SELECT * FROM custom_contests WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(_contest_dict(row, answers=True)), 201


@admin_bp.get("/contests")
def list_contests():
    """Tier 3+ sees every contest (so it can review the pending queue); everyone
    else sees only the ones they created plus the approved catalog."""
    user = require_tier(1)
    db = get_db()
    reviewer = tier_of(user) >= 3
    if reviewer:
        rows = db.execute("SELECT * FROM custom_contests ORDER BY created_at DESC").fetchall()
    else:
        rows = db.execute(
            "SELECT * FROM custom_contests WHERE creator_user_id = ? OR status = 'approved' ORDER BY created_at DESC",
            (user["id"],),
        ).fetchall()
    # A reviewer needs the answers to judge a contest, and an author already
    # knows their own. Everyone else gets the questions only.
    return jsonify(contests=[
        _contest_dict(r, answers=reviewer or r["creator_user_id"] == user["id"]) for r in rows
    ])


@admin_bp.get("/contests/approved")
def list_approved_contests():
    """The public catalog anyone signed in can attempt."""
    if current_user() is None:
        abort(401)
    rows = get_db().execute(
        "SELECT * FROM custom_contests WHERE status = 'approved' ORDER BY created_at DESC"
    ).fetchall()
    return jsonify(contests=[_contest_dict(r, answers=False) for r in rows])


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
    return jsonify(_contest_dict(row, answers=True))


@admin_bp.post("/contests/<int:contest_id>/approve")
def approve_contest(contest_id: int):
    return _decide_contest(contest_id, "approved")


@admin_bp.post("/contests/<int:contest_id>/reject")
def reject_contest(contest_id: int):
    return _decide_contest(contest_id, "rejected")


def _playable(db, contest_id: int, user):
    """An approved contest this player may sit: not their own, not already done."""
    row = db.execute("SELECT * FROM custom_contests WHERE id = ?", (contest_id,)).fetchone()
    if row is None or row["status"] != "approved":
        abort(404)
    if row["creator_user_id"] == user["id"]:
        abort(403, "You wrote this one, so you can't earn from it.")
    done = db.execute(
        "SELECT 1 FROM contest_completions WHERE contest_id = ? AND user_id = ?", (contest_id, user["id"])
    ).fetchone()
    if done:
        abort(409, "You have already taken this contest.")
    return row


@admin_bp.get("/contests/<int:contest_id>/play")
def play_contest(contest_id: int):
    """The questions to sit, without the answer key."""
    user = require_active_user()
    row = _playable(get_db(), contest_id, user)
    return jsonify(_contest_dict(row, answers=False))


@admin_bp.post("/contests/<int:contest_id>/submit")
def submit_contest(contest_id: int):
    """Grade a sitting. Marking happens here rather than in the browser, and each
    question pays only if it is right, so the payout is what was actually earned.
    MBucks land as a wallet credit the client claims -- see /api/wallet/credits."""
    user = require_active_user()
    db = get_db()
    row = _playable(db, contest_id, user)
    questions = _questions_of(row)

    given = (request.get_json(silent=True) or {}).get("answers")
    if not isinstance(given, list):
        abort(400, "Expected an answers list.")

    earned, marks = 0, []
    for i, question in enumerate(questions):
        submitted = _normalize(given[i]) if i < len(given) else ""
        accepted = [_normalize(part) for part in str(question.get("a", "")).split("|") if part.strip()]
        right = bool(submitted) and submitted in accepted
        if right:
            earned += question.get("mbucks", 0)
        marks.append({"q": question.get("q", ""), "correct": right, "answer": question.get("a", ""),
                      "mbucks": question.get("mbucks", 0)})

    now = time.time()
    db.execute(
        "INSERT INTO contest_completions (contest_id, user_id, completed_at) VALUES (?, ?, ?)",
        (contest_id, user["id"], now),
    )
    if earned > 0:
        db.execute(
            "INSERT INTO wallet_credits (user_id, amount, reason, created_at) VALUES (?, ?, ?, ?)",
            (user["id"], earned, f"Completed “{row['title']}”", now),
        )
    db.commit()
    return jsonify(
        ok=True,
        title=row["title"],
        correct=sum(1 for m in marks if m["correct"]),
        total=len(marks),
        mbucksEarned=earned,
        mbucksPossible=row["mbucks_reward"],
        marks=marks,
    )


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
    # Banning is the owner's alone. Tier 3 reviews the queue and dismisses
    # reports, but taking an account away is not a power it hands out.
    actor = require_tier(4)
    if user_id == actor["id"]:
        abort(400, "You cannot ban yourself.")
    target = get_user(user_id)
    if target is None:
        abort(404)
    if tier_of(target) >= 4:
        abort(403, "Cannot ban an owner account.")
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
    require_tier(4)
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
    db.execute("UPDATE users SET tier = ? WHERE id = ?", (tier, user_id))
    db.commit()
    return jsonify(ok=True, userId=user_id, tier=tier)
