"""Friends and profile visits.

Both are ordinary features every signed-in player uses, and both are also
evidence in Hunt for the Traitor -- the ring's friend links and the trail of who
was reading whose profile are what the letters point at.

A friendship is one row per pair with user_a < user_b, so the same two accounts
can never be stored twice or in two directions.
"""
import time

from flask import Blueprint, abort, jsonify

from .auth import require_active_user, require_user
from .db import get_db, get_user
from .players import _clean_name

social_bp = Blueprint("social", __name__, url_prefix="/api")


def _pair(a: int, b: int):
    return (a, b) if a < b else (b, a)


def _friend_row(db, a: int, b: int):
    lo, hi = _pair(a, b)
    return db.execute("SELECT * FROM friendships WHERE user_a = ? AND user_b = ?", (lo, hi)).fetchone()


def friend_state(db, me: int, them: int) -> dict:
    """How `me` stands with `them`: none / pending_out / pending_in / friends."""
    row = _friend_row(db, me, them)
    if row is None:
        return {"status": "none"}
    if row["status"] == "accepted":
        return {"status": "friends", "since": row["created_at"]}
    return {"status": "pending_out" if row["requested_by"] == me else "pending_in", "since": row["created_at"]}


def friends_of(db, user_id: int) -> list:
    rows = db.execute(
        """
        SELECT f.status, f.requested_by,
               CASE WHEN f.user_a = ? THEN f.user_b ELSE f.user_a END AS other
        FROM friendships f
        WHERE (f.user_a = ? OR f.user_b = ?)
        """,
        (user_id, user_id, user_id),
    ).fetchall()
    out = []
    for r in rows:
        other = get_user(r["other"])
        if other is None:
            continue
        out.append({
            "userId": r["other"],
            "name": _clean_name(other["name"]),
            "status": r["status"],
            "incoming": r["status"] == "pending" and r["requested_by"] != user_id,
        })
    out.sort(key=lambda f: (f["status"] != "accepted", f["name"].lower()))
    return out


@social_bp.get("/friends")
def list_friends():
    user = require_user()
    return jsonify(friends=friends_of(get_db(), user["id"]))


@social_bp.post("/friends/<int:other_id>/request")
def request_friend(other_id: int):
    user = require_active_user()
    if other_id == user["id"]:
        abort(400, "You cannot friend yourself.")
    db = get_db()
    if get_user(other_id) is None:
        abort(404)
    existing = _friend_row(db, user["id"], other_id)
    if existing:
        # Requesting someone who already asked you is just accepting them.
        if existing["status"] == "pending" and existing["requested_by"] != user["id"]:
            return accept_friend(other_id)
        return jsonify(**friend_state(db, user["id"], other_id))
    lo, hi = _pair(user["id"], other_id)
    db.execute(
        "INSERT INTO friendships (user_a, user_b, status, requested_by, created_at) VALUES (?, ?, 'pending', ?, ?)",
        (lo, hi, user["id"], time.time()),
    )
    db.commit()
    return jsonify(**friend_state(db, user["id"], other_id))


@social_bp.post("/friends/<int:other_id>/accept")
def accept_friend(other_id: int):
    user = require_active_user()
    db = get_db()
    row = _friend_row(db, user["id"], other_id)
    if row is None or row["status"] != "pending":
        abort(404, "No pending request from that player.")
    if row["requested_by"] == user["id"]:
        abort(400, "You sent that request; they have to accept it.")
    lo, hi = _pair(user["id"], other_id)
    db.execute("UPDATE friendships SET status = 'accepted' WHERE user_a = ? AND user_b = ?", (lo, hi))
    db.commit()
    return jsonify(**friend_state(db, user["id"], other_id))


@social_bp.post("/friends/<int:other_id>/remove")
def remove_friend(other_id: int):
    user = require_active_user()
    db = get_db()
    lo, hi = _pair(user["id"], other_id)
    db.execute("DELETE FROM friendships WHERE user_a = ? AND user_b = ?", (lo, hi))
    db.commit()
    return jsonify(status="none")


def record_view(db, viewer_id: int, viewed_id: int) -> None:
    """Log that one account opened another's profile. Own profile doesn't count."""
    if viewer_id == viewed_id:
        return
    db.execute(
        """
        INSERT INTO profile_views (viewer_id, viewed_id, viewed_at) VALUES (?, ?, ?)
        ON CONFLICT (viewer_id, viewed_id) DO UPDATE SET viewed_at = excluded.viewed_at
        """,
        (viewer_id, viewed_id, time.time()),
    )
    db.commit()


@social_bp.get("/players/<int:player_id>/viewers")
def profile_viewers(player_id: int):
    """Who has looked at this profile."""
    require_user()
    rows = get_db().execute(
        """
        SELECT v.viewer_id, v.viewed_at, u.name
        FROM profile_views v JOIN users u ON u.id = v.viewer_id
        WHERE v.viewed_id = ? ORDER BY v.viewed_at DESC LIMIT 50
        """,
        (player_id,),
    ).fetchall()
    return jsonify(viewers=[
        {"userId": r["viewer_id"], "name": _clean_name(r["name"]), "at": r["viewed_at"]} for r in rows
    ])
