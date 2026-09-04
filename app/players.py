"""Public player directory.

Every registered account (anyone who has signed in) gets a public profile built
from their saved game. Email addresses are deliberately never exposed here, and
the directory requires you to be signed in yourself, so the roster is not
enumerable by anonymous visitors.

Everything under `progress.data` was written by a browser, so treat it as
untrusted: coerce and clamp every value before returning it.
"""
import json
import re

from flask import Blueprint, abort, jsonify

from .auth import current_user
from .db import get_db

players_bp = Blueprint("players", __name__, url_prefix="/api")

TIERS = [
    "Bronze", "Silver", "Gold", "Platinum", "Crystal",
    "Emerald", "Amethyst", "Ruby", "Obsidian", "Diamond",
]
ADMIN_PREFIX = "AY1234567YA"
MAX_XP = 10 ** 15


def _int(value, default=0, lo=0, hi=None):
    try:
        n = int(value)
    except (TypeError, ValueError):
        return default
    if n < lo:
        return default
    if hi is not None and n > hi:
        return hi
    return n


def _clean_name(name):
    name = re.sub(r"\s+", " ", str(name or "Player")).strip()
    if name.startswith(ADMIN_PREFIX):  # never surface the admin code to other players
        name = name[len(ADMIN_PREFIX):].strip() or "Admin"
    return name[:40] or "Player"


MMC_MAX = {"mmc8": 25, "mmc10": 150, "mmc12": 150}
AVATAR_SLOTS = ("face", "bg", "frame", "badge")
SAFE_ID = re.compile(r"^[a-z0-9_-]{1,24}$")


def _avatar(state) -> dict:
    """The equipped avatar, as slot -> item id. Ids are passed through only if
    they look like catalog ids; the browser resolves them and falls back to the
    defaults for anything it does not recognise."""
    av = state.get("avatar") if isinstance(state.get("avatar"), dict) else {}
    equipped = av.get("equipped") if isinstance(av.get("equipped"), dict) else {}
    out = {}
    for slot in AVATAR_SLOTS:
        value = equipped.get(slot)
        if isinstance(value, str) and SAFE_ID.match(value):
            out[slot] = value
    return out


def _mmc_bests(exams) -> dict:
    """Best FORMAL score per exam. Practice papers are never recorded here."""
    bests = {}
    for exam_id, cap in MMC_MAX.items():
        record = exams.get(exam_id)
        best = None
        if isinstance(record, dict) and isinstance(record.get("formal"), list):
            for attempt in record["formal"]:
                if not isinstance(attempt, dict):
                    continue
                try:
                    score = float(attempt.get("score"))
                except (TypeError, ValueError):
                    continue
                score = max(0.0, min(score, float(cap)))
                if best is None or score > best:
                    best = score
        bests[exam_id] = int(best) if best is not None and best.is_integer() else best
    return bests


def public_profile(row) -> dict:
    """The public view of one account. No email, no session data."""
    try:
        data = json.loads(row["data"]) if row["data"] else {}
    except (TypeError, ValueError):
        data = {}
    state = data.get("state") if isinstance(data.get("state"), dict) else {}
    ach = data.get("achievements") if isinstance(data.get("achievements"), dict) else {}
    unlocked = ach.get("unlocked") if isinstance(ach.get("unlocked"), dict) else {}

    tier_index = _int(state.get("tierIndex"), lo=0, hi=len(TIERS) - 1)
    dragon = state.get("dragon") if isinstance(state.get("dragon"), dict) else {}
    meteor = state.get("meteor") if isinstance(state.get("meteor"), dict) else {}
    mmc = state.get("mmc") if isinstance(state.get("mmc"), dict) else {}
    mmc_exams = mmc.get("exams") if isinstance(mmc.get("exams"), dict) else {}
    record = state.get("finnRecord") if isinstance(state.get("finnRecord"), dict) else {}
    defeated = dragon.get("defeated")
    owned = dragon.get("owned")

    return {
        "id": row["id"],
        "name": _clean_name(row["name"]),
        "picture": row["picture"],
        "avatar": _avatar(state),
        "tier": TIERS[tier_index],
        "tierIndex": tier_index,
        "xp": _int(state.get("xp"), hi=MAX_XP),
        "achievements": len(unlocked),
        "titles": _int(state.get("titles"), hi=9999),
        "champion": bool(state.get("champion")),
        "finnWins": _int(record.get("wins"), hi=9999),
        "finnLosses": _int(record.get("losses"), hi=9999),
        "bestStreak": _int(ach.get("bestStreak"), hi=10 ** 6),
        "bonusAnswered": _int(ach.get("bonusAnswered"), hi=10 ** 6),
        "dragonsDefeated": len(defeated) if isinstance(defeated, list) else 0,
        "petsOwned": len(owned) if isinstance(owned, list) else 0,
        "meteorWins": _int(meteor.get("wins"), hi=10 ** 6),
        "meteorPlayed": _int(meteor.get("played"), hi=10 ** 6),
        "contestsDone": len(state.get("results")) if isinstance(state.get("results"), dict) else 0,
        "bucks": _int(mmc.get("bucks"), hi=10 ** 12),
        "mmc": _mmc_bests(mmc_exams),
        "mmcSittings": sum(
            len(v.get("formal")) if isinstance(v, dict) and isinstance(v.get("formal"), list) else 0
            for v in mmc_exams.values()
        ),
        "joined": row["created_at"],
        "lastSeen": row["updated_at"],
    }


def _rows():
    return get_db().execute(
        """
        SELECT u.id, u.name, u.picture, u.created_at, p.data, p.updated_at
        FROM users u LEFT JOIN progress p ON p.user_id = u.id
        """
    ).fetchall()


@players_bp.get("/players")
def list_players():
    """Everyone registered, ranked by tier then XP. Sign-in required."""
    me = current_user()
    if me is None:
        abort(401)
    people = [public_profile(r) for r in _rows()]
    people.sort(key=lambda p: (-p["tierIndex"], -p["xp"], p["name"].lower()))
    for rank, person in enumerate(people, start=1):
        person["rank"] = rank
        person["you"] = person["id"] == me["id"]
    return jsonify(players=people, count=len(people))


@players_bp.get("/players/<int:player_id>")
def get_player(player_id: int):
    me = current_user()
    if me is None:
        abort(401)
    row = get_db().execute(
        """
        SELECT u.id, u.name, u.picture, u.created_at, p.data, p.updated_at
        FROM users u LEFT JOIN progress p ON p.user_id = u.id
        WHERE u.id = ?
        """,
        (player_id,),
    ).fetchone()
    if row is None:
        abort(404)
    from .social import friend_state, friends_of, record_view

    record_view(get_db(), me["id"], player_id)
    profile = public_profile(row)
    profile["you"] = row["id"] == me["id"]
    profile["friends"] = friends_of(get_db(), player_id)
    profile["friendship"] = friend_state(get_db(), me["id"], player_id)
    return jsonify(profile)
