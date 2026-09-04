"""Arena of Champions: a monthly time-trial ladder for players who have beaten Finn.

Beating Finn only makes you a Tier 1 Ruler. Once a month you get up to three timed
attempts (skipping a question costs a time penalty); your fastest attempt is your
entry. You're racing every other ruler who attempts that same month -- whoever has
the single fastest time when the month closes is promoted a ruler tier. Right now
that's usually just whoever showed up, since there's no matchmaking or live
opponents yet -- but it's real accounts racing real accounts, not a scripted bot.
"""
import time

from flask import Blueprint, abort, jsonify, request

from .auth import require_active_user, require_user
from .db import get_db
from .players import _clean_name

arena_bp = Blueprint("arena", __name__, url_prefix="/api/arena")

MAX_ATTEMPTS_PER_PERIOD = 3
SKIP_PENALTY_SECONDS = 60
MAX_TIME_SECONDS = 24 * 60 * 60  # sanity cap against bad/hostile input
LEADERBOARD_SIZE = 10


def current_period() -> str:
    return time.strftime("%Y-%m", time.gmtime())


def _close_period(db, period: str) -> None:
    """Settle one month: whoever has the fastest single attempt wins and is
    promoted a ruler tier. If nobody attempted, there's simply no winner.
    Idempotent -- does nothing once a period already has a result row."""
    if db.execute("SELECT 1 FROM arena_results WHERE period = ?", (period,)).fetchone():
        return
    best = db.execute(
        """
        SELECT user_id, MIN(time_seconds) AS best_time
        FROM arena_attempts WHERE period = ?
        GROUP BY user_id ORDER BY best_time ASC LIMIT 1
        """,
        (period,),
    ).fetchone()
    winner_id = best["user_id"] if best else None
    winner_time = best["best_time"] if best else None
    if winner_id is not None:
        db.execute("UPDATE users SET ruler_tier = ruler_tier + 1 WHERE id = ?", (winner_id,))
    db.execute(
        "INSERT INTO arena_results (period, winner_user_id, time_seconds, closed_at) VALUES (?, ?, ?, ?)",
        (period, winner_id, winner_time, time.time()),
    )
    db.commit()


def _close_elapsed_periods(db) -> None:
    """Close out any past period that has attempts but was never settled."""
    now = current_period()
    rows = db.execute(
        "SELECT DISTINCT period FROM arena_attempts WHERE period < ? "
        "AND period NOT IN (SELECT period FROM arena_results)",
        (now,),
    ).fetchall()
    for row in rows:
        _close_period(db, row["period"])


def _leaderboard(db, period: str, viewer_id: int) -> list:
    rows = db.execute(
        """
        SELECT u.id, u.name, MIN(a.time_seconds) AS best
        FROM arena_attempts a JOIN users u ON u.id = a.user_id
        WHERE a.period = ?
        GROUP BY a.user_id
        ORDER BY best ASC
        LIMIT ?
        """,
        (period, LEADERBOARD_SIZE),
    ).fetchall()
    return [
        {"userId": r["id"], "name": _clean_name(r["name"]), "timeSeconds": r["best"], "you": r["id"] == viewer_id}
        for r in rows
    ]


def _last_result(db):
    row = db.execute(
        """
        SELECT r.period, r.winner_user_id, r.time_seconds, u.name AS winner_name
        FROM arena_results r LEFT JOIN users u ON u.id = r.winner_user_id
        ORDER BY r.period DESC LIMIT 1
        """
    ).fetchone()
    if row is None:
        return None
    return {
        "period": row["period"],
        "winnerUserId": row["winner_user_id"],
        "winnerName": _clean_name(row["winner_name"]) if row["winner_name"] else None,
        "timeSeconds": row["time_seconds"],
        "noEntrants": row["winner_user_id"] is None,
    }


def _status(user) -> dict:
    db = get_db()
    _close_elapsed_periods(db)
    # Closing a period may have just promoted this user -- re-read their row
    # rather than trust the one the caller fetched before that happened.
    user = db.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
    period = current_period()
    attempts = db.execute(
        "SELECT time_seconds, created_at FROM arena_attempts WHERE user_id = ? AND period = ? ORDER BY created_at",
        (user["id"], period),
    ).fetchall()
    best = min((a["time_seconds"] for a in attempts), default=None)
    return {
        "rulerTier": user["ruler_tier"] or 0,
        "period": period,
        "attemptsUsed": len(attempts),
        "attemptsLeft": max(0, MAX_ATTEMPTS_PER_PERIOD - len(attempts)),
        "maxAttempts": MAX_ATTEMPTS_PER_PERIOD,
        "personalBestSeconds": best,
        "skipPenaltySeconds": SKIP_PENALTY_SECONDS,
        "leaderboard": _leaderboard(db, period, user["id"]),
        "lastResult": _last_result(db),
    }


@arena_bp.get("/status")
def status():
    user = require_user()
    if (user["ruler_tier"] or 0) < 1:
        return jsonify(rulerTier=0, entered=False)
    return jsonify(entered=True, **_status(user))


@arena_bp.post("/enter")
def enter():
    """Called once, right after the player first beats Finn."""
    user = require_active_user()
    db = get_db()
    if (user["ruler_tier"] or 0) < 1:
        db.execute("UPDATE users SET ruler_tier = 1 WHERE id = ?", (user["id"],))
        db.commit()
        user = db.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
    return jsonify(entered=True, **_status(user))


@arena_bp.post("/attempt")
def attempt():
    user = require_active_user()
    if (user["ruler_tier"] or 0) < 1:
        abort(403, "Beat Finn first to enter the Arena of Champions.")
    db = get_db()
    _close_elapsed_periods(db)
    period = current_period()
    used = db.execute(
        "SELECT COUNT(*) AS n FROM arena_attempts WHERE user_id = ? AND period = ?", (user["id"], period)
    ).fetchone()["n"]
    if used >= MAX_ATTEMPTS_PER_PERIOD:
        abort(409, "No attempts left this month.")
    body = request.get_json(silent=True) or {}
    try:
        seconds = float(body.get("timeSeconds"))
    except (TypeError, ValueError):
        abort(400, "Expected a numeric timeSeconds.")
    if not (0 < seconds <= MAX_TIME_SECONDS):
        abort(400, "timeSeconds out of range.")
    db.execute(
        "INSERT INTO arena_attempts (user_id, period, time_seconds, created_at) VALUES (?, ?, ?, ?)",
        (user["id"], period, seconds, time.time()),
    )
    db.commit()
    return jsonify(entered=True, **_status(user))
