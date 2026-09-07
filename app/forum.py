"""The forum: somewhere to argue about the problems themselves.

Reading is open to everyone, guests included -- a worked answer is worth
nothing if only accounts that already signed in can find it. Posting needs an
account, and a banned one may read but not write.

A thread can be attached to a player-written contest, which is what the
"Discuss" button beside a contest opens: the argument about its question 4 then
lives next to that contest instead of in a general thread nobody scrolls to.

Tier 3 moderates. Deleting a post blanks its body and keeps the row, so the
replies quoting it still make sense and the thread keeps its shape.
"""
import time

from flask import Blueprint, abort, jsonify, request

from .auth import current_user, require_active_user, require_tier, tier_of
from .db import get_db, get_user
from .players import _clean_name

forum_bp = Blueprint("forum", __name__, url_prefix="/api/forum")

MAX_TITLE = 100
MAX_BODY = 4000
MAX_THREADS = 200          # newest N threads in the index
POST_COOLDOWN_SECONDS = 10  # a floor on how fast one account can post


def _text(value, limit: int) -> str:
    """Trim a submitted string to something storable: normalised newlines, no
    runaway blank lines, capped length."""
    s = str(value or "").replace("\r\n", "\n").replace("\r", "\n").strip()
    while "\n\n\n" in s:
        s = s.replace("\n\n\n", "\n\n")
    return s[:limit]


def _check_cooldown(db, user_id: int) -> None:
    last = db.execute(
        "SELECT created_at FROM forum_posts WHERE author_user_id = ? ORDER BY created_at DESC LIMIT 1",
        (user_id,),
    ).fetchone()
    if last and time.time() - last["created_at"] < POST_COOLDOWN_SECONDS:
        abort(429, f"Give it {POST_COOLDOWN_SECONDS} seconds between posts.")


def _thread_row(db, thread_id: int):
    row = db.execute("SELECT * FROM forum_threads WHERE id = ?", (thread_id,)).fetchone()
    if row is None:
        abort(404)
    return row


def _author_name(user_id: int) -> str:
    user = get_user(user_id)
    return _clean_name(user["name"]) if user else "A departed player"


def _post_dict(row, viewer) -> dict:
    """One post. A deleted post keeps its place in the thread but not its text."""
    deleted = row["deleted_at"] is not None
    can_delete = bool(viewer) and not deleted and (
        tier_of(viewer) >= 3 or row["author_user_id"] == viewer["id"]
    )
    return {
        "id": row["id"],
        "authorUserId": row["author_user_id"],
        "authorName": _author_name(row["author_user_id"]),
        "body": "" if deleted else row["body"],
        "deleted": deleted,
        "createdAt": row["created_at"],
        "canDelete": can_delete,
    }


def _thread_dict(row, viewer) -> dict:
    """One thread as the index shows it: who started it, how busy it is, and
    which contest (if any) it hangs off."""
    db = get_db()
    counts = db.execute(
        "SELECT COUNT(*) AS n, MAX(created_at) AS last FROM forum_posts WHERE thread_id = ?",
        (row["id"],),
    ).fetchone()
    contest_title = None
    if row["contest_id"] is not None:
        contest = db.execute(
            "SELECT title FROM custom_contests WHERE id = ?", (row["contest_id"],)
        ).fetchone()
        contest_title = contest["title"] if contest else None
    return {
        "id": row["id"],
        "title": row["title"],
        "authorUserId": row["author_user_id"],
        "authorName": _author_name(row["author_user_id"]),
        "contestId": row["contest_id"],
        "contestTitle": contest_title,
        "postCount": counts["n"] or 0,
        "replyCount": max(0, (counts["n"] or 0) - 1),
        "createdAt": row["created_at"],
        "lastPostAt": counts["last"] or row["created_at"],
        "locked": bool(row["locked"]),
        "canModerate": bool(viewer) and tier_of(viewer) >= 3,
    }


@forum_bp.get("/threads")
def list_threads():
    """The index. Open to everyone; `?contest=<id>` narrows it to one contest's
    threads, which is what the Discuss button beside a contest asks for."""
    viewer = current_user()
    db = get_db()
    contest_id = request.args.get("contest")
    if contest_id:
        try:
            contest_id = int(contest_id)
        except (TypeError, ValueError):
            abort(400, "contest must be a contest id.")
        rows = db.execute(
            "SELECT * FROM forum_threads WHERE contest_id = ? ORDER BY id DESC LIMIT ?",
            (contest_id, MAX_THREADS),
        ).fetchall()
    else:
        rows = db.execute("SELECT * FROM forum_threads ORDER BY id DESC LIMIT ?", (MAX_THREADS,)).fetchall()
    threads = [_thread_dict(r, viewer) for r in rows]
    threads.sort(key=lambda t: t["lastPostAt"], reverse=True)
    return jsonify(
        threads=threads,
        canPost=bool(viewer) and not viewer["banned"],
        signedIn=bool(viewer),
    )


@forum_bp.post("/threads")
def create_thread():
    """Start a discussion. The opening message is an ordinary post, so the
    thread reads the same from its first line to its last."""
    user = require_active_user()
    body = request.get_json(silent=True) or {}
    title = _text(body.get("title"), MAX_TITLE)
    first = _text(body.get("body"), MAX_BODY)
    if not title or not first:
        abort(400, "A thread needs a title and something to say.")

    db = get_db()
    contest_id = body.get("contestId")
    if contest_id in ("", None):
        contest_id = None
    else:
        try:
            contest_id = int(contest_id)
        except (TypeError, ValueError):
            abort(400, "contestId must be a contest id.")
        # Only an approved contest can be discussed: a pending one is not public
        # yet, and linking to it would leak that it exists.
        approved = db.execute(
            "SELECT 1 FROM custom_contests WHERE id = ? AND status = 'approved'", (contest_id,)
        ).fetchone()
        if approved is None:
            abort(404, "No such contest.")

    _check_cooldown(db, user["id"])
    now = time.time()
    cur = db.execute(
        """
        INSERT INTO forum_threads (author_user_id, contest_id, title, created_at, last_post_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (user["id"], contest_id, title, now, now),
    )
    thread_id = cur.lastrowid
    db.execute(
        "INSERT INTO forum_posts (thread_id, author_user_id, body, created_at) VALUES (?, ?, ?, ?)",
        (thread_id, user["id"], first, now),
    )
    db.commit()
    return jsonify(_thread_dict(_thread_row(db, thread_id), user)), 201


@forum_bp.get("/threads/<int:thread_id>")
def read_thread(thread_id: int):
    """A thread and everything in it. Open to everyone."""
    viewer = current_user()
    db = get_db()
    row = _thread_row(db, thread_id)
    posts = db.execute(
        "SELECT * FROM forum_posts WHERE thread_id = ? ORDER BY created_at, id", (thread_id,)
    ).fetchall()
    thread = _thread_dict(row, viewer)
    thread["posts"] = [_post_dict(p, viewer) for p in posts]
    thread["canPost"] = bool(viewer) and not viewer["banned"] and not row["locked"]
    thread["signedIn"] = bool(viewer)
    return jsonify(thread)


@forum_bp.post("/threads/<int:thread_id>/posts")
def reply(thread_id: int):
    user = require_active_user()
    db = get_db()
    row = _thread_row(db, thread_id)
    if row["locked"]:
        abort(409, "That thread is locked.")
    text = _text((request.get_json(silent=True) or {}).get("body"), MAX_BODY)
    if not text:
        abort(400, "A reply needs some text.")
    _check_cooldown(db, user["id"])
    now = time.time()
    db.execute(
        "INSERT INTO forum_posts (thread_id, author_user_id, body, created_at) VALUES (?, ?, ?, ?)",
        (thread_id, user["id"], text, now),
    )
    db.execute("UPDATE forum_threads SET last_post_at = ? WHERE id = ?", (now, thread_id))
    db.commit()
    return jsonify(ok=True), 201


@forum_bp.post("/posts/<int:post_id>/delete")
def delete_post(post_id: int):
    """Take a post back (your own) or take one down (Tier 3). The row stays so
    the thread still reads in order; only the text goes."""
    user = require_active_user()
    db = get_db()
    row = db.execute("SELECT * FROM forum_posts WHERE id = ?", (post_id,)).fetchone()
    if row is None:
        abort(404)
    if row["author_user_id"] != user["id"] and tier_of(user) < 3:
        abort(403, "That isn't your post.")
    if row["deleted_at"] is None:
        db.execute(
            "UPDATE forum_posts SET deleted_at = ?, deleted_by = ? WHERE id = ?",
            (time.time(), user["id"], post_id),
        )
        db.commit()
    return jsonify(ok=True)


def _set_locked(thread_id: int, locked: int):
    require_tier(3)
    db = get_db()
    _thread_row(db, thread_id)
    db.execute("UPDATE forum_threads SET locked = ? WHERE id = ?", (locked, thread_id))
    db.commit()
    return jsonify(ok=True, locked=bool(locked))


@forum_bp.post("/threads/<int:thread_id>/lock")
def lock_thread(thread_id: int):
    return _set_locked(thread_id, 1)


@forum_bp.post("/threads/<int:thread_id>/unlock")
def unlock_thread(thread_id: int):
    return _set_locked(thread_id, 0)
