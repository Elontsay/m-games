"""The cast for Hunt for the Traitor.

Six of these accounts are the ring described in the three intercepted letters;
the rest are ordinary players who exist so the clues actually have to be read.
Every decoy is a near miss on exactly one clue -- same dragon count but the wrong
pet count, the right cabin at the wrong hour, four of the five leaked answers --
so no single stat identifies a traitor on its own.

Seeding is idempotent: accounts are keyed by (provider='npc', subject=username),
so restarting the server never duplicates or overwrites them.
"""
import json
import time

from .db import get_db

# Clock the seeded history against a fixed point so "2 in the morning" stays
# true no matter when the database is first created.
DAY = 86400
HOUR = 3600


def _at(days_ago: float, hour: float) -> float:
    """A timestamp `days_ago` days back, at `hour` (local-ish, UTC-based)."""
    midnight = (time.time() - days_ago * DAY) // DAY * DAY
    return midnight + hour * HOUR


# The leaked answer key from Letter #1. Agent Y's qualifier entry matches it exactly.
LEAKED_ANSWERS = [156, 33, 17, 125, 9]

DRAGONS = ["bog", "cinder", "tempest", "frost", "king"]
PETS = ["fox", "newt", "hare", "pup", "owl", "tortoise", "serpent", "griffin", "bear", "phoenix"]

# ---- the ring ----------------------------------------------------------------
# username, agent, tier, and how the letters give them away.
TRAITORS = [
    {
        "username": "AAA",
        "agent": "Y",
        "tier": 2,
        "clue": "Won the Ruler Qualifier with the exact five answers leaked in Letter #1.",
        "dragons": 1, "pets": 2, "protector": False,
        "qualifier": {"answers": LEAKED_ANSWERS, "score": 5, "won": True},
    },
    {
        "username": "Ty_The_Guy",
        "agent": "Asgard",
        "tier": 1,
        "clue": "Letter #2: 'asgard has done that already' -- the one account already friends with Agent Y.",
        "dragons": 2, "pets": 3, "protector": False,
        "friend_accepted_with": "AAA",
    },
    {
        "username": "Ion_Garret",
        "agent": "DeNach",
        "tier": 1,
        "clue": "Letter #2 tells DeNach to friend Y (a request still pending), and he shows up in cabin 1431.",
        "dragons": 2, "pets": 4, "protector": False,
        "friend_pending_to": "AAA",
        "cabin": ("1431", 6.0, 20.5),  # cabin, days ago, hour
    },
    {
        "username": "Turtleneck",
        "agent": "Zemdegs",
        "tier": 1,
        "clue": "Letter #3's signal: 3 dragon bosses beaten, 6 pets owned, and the Protector achievement.",
        "dragons": 3, "pets": 6, "protector": True,
    },
    {
        "username": "Lyier12345",
        "agent": "Dagger",
        "tier": 1,
        "clue": "Letter #3: in cabin 1431 at 2 in the morning, planting the bug.",
        "dragons": 1, "pets": 1, "protector": False,
        "cabin": ("1431", 6.0, 2.0),
    },
    {
        "username": "DosQuatro1298",
        "agent": "X",
        "tier": 1,
        "clue": "Letter #3: the second account in cabin 1431 at 2 in the morning.",
        "dragons": 2, "pets": 2, "protector": False,
        "cabin": ("1431", 6.0, 2.2),
    },
]

# ---- everyone else -----------------------------------------------------------
INNOCENTS = [
    # Near misses on Zemdegs's three-part signal.
    {"username": "MathMagician", "dragons": 3, "pets": 5, "protector": True},   # wrong pet count
    {"username": "QuickSilver", "dragons": 3, "pets": 6, "protector": False},   # no Protector
    {"username": "PixelPanda", "dragons": 2, "pets": 6, "protector": True},     # wrong dragon count
    # Near misses on the cabin: right hour, wrong cabin / right cabin is traitors-only.
    {"username": "SunnyD", "dragons": 1, "pets": 2, "protector": False, "cabin": ("1550", 6.0, 2.1)},
    {"username": "Vortex_99", "dragons": 0, "pets": 1, "protector": False, "cabin": ("1402", 5.0, 16.7)},
    {"username": "Cosmo_Ray", "dragons": 1, "pets": 3, "protector": False, "cabin": ("1402", 7.0, 11.2)},
    # Near misses on the leaked answer key.
    {"username": "Marbles", "dragons": 2, "pets": 2, "protector": False,
     "qualifier": {"answers": [156, 33, 17, 125, 12], "score": 4, "won": False}},   # 4 of 5
    {"username": "BluesClue", "dragons": 0, "pets": 1, "protector": False,
     "qualifier": {"answers": [140, 30, 17, 96, 11], "score": 1, "won": False}},
    {"username": "Fig_Newton", "dragons": 4, "pets": 7, "protector": True},
    {"username": "Halcyon", "dragons": 0, "pets": 0, "protector": False},
]

# Friendships among the innocents, so "has a friend" is not itself suspicious.
NOISE_FRIENDSHIPS = [
    ("MathMagician", "QuickSilver"),
    ("PixelPanda", "SunnyD"),
    ("Cosmo_Ray", "MathMagician"),
    ("Fig_Newton", "Halcyon"),
]

# Who has looked at whose profile. The ring keeps an eye on its own.
NOISE_VIEWS = [
    ("Lyier12345", "AAA"),
    ("DosQuatro1298", "AAA"),
    ("Turtleneck", "Ion_Garret"),
    ("Ion_Garret", "Ty_The_Guy"),
    ("MathMagician", "Fig_Newton"),
    ("QuickSilver", "Turtleneck"),
    ("Halcyon", "PixelPanda"),
    ("Marbles", "AAA"),
]

TRAITOR_USERNAMES = [t["username"] for t in TRAITORS]


def _progress_blob(spec: dict) -> str:
    """A believable saved game: enough for the public profile to render."""
    unlocked = {"start": True, "player": True}
    if spec.get("protector"):
        unlocked["protector"] = True
        unlocked["architect"] = True
    if spec.get("dragons", 0) > 0:
        unlocked["dragon"] = True
    state = {
        "playerName": spec["username"],
        "tierIndex": spec.get("tierIndex", 3),
        "xp": spec.get("xp", 120000),
        "titles": 0,
        "champion": True,
        "finnRecord": {"wins": 1, "losses": spec.get("dragons", 0)},
        "dragon": {
            "defeated": DRAGONS[: spec.get("dragons", 0)],
            "owned": PETS[: spec.get("pets", 0)],
        },
        "meteor": {"wins": 1 if spec.get("protector") else 0, "played": 2},
        "mmc": {"bucks": 250, "exams": {}},
        "results": {},
        "avatar": {"equipped": {}},
    }
    return json.dumps({"state": state, "achievements": {"unlocked": unlocked, "bestStreak": 12, "bonusAnswered": 3}})


def _ensure_user(db, spec: dict) -> int:
    username = spec["username"]
    row = db.execute("SELECT id FROM users WHERE provider = 'npc' AND subject = ?", (username,)).fetchone()
    if row:
        return row["id"]
    cur = db.execute(
        "INSERT INTO users (provider, subject, email, name, picture, created_at, tier) "
        "VALUES ('npc', ?, NULL, ?, NULL, ?, ?)",
        (username, username, _at(40, 12), spec.get("tier", 1)),
    )
    user_id = cur.lastrowid
    db.execute(
        "INSERT INTO progress (user_id, data, updated_at) VALUES (?, ?, ?)",
        (user_id, _progress_blob(spec), _at(1, 9)),
    )
    return user_id


def _friend(db, ids, a: str, b: str, status: str, requester: str) -> None:
    lo, hi = sorted((ids[a], ids[b]))
    if db.execute("SELECT 1 FROM friendships WHERE user_a = ? AND user_b = ?", (lo, hi)).fetchone():
        return
    db.execute(
        "INSERT INTO friendships (user_a, user_b, status, requested_by, created_at) VALUES (?, ?, ?, ?, ?)",
        (lo, hi, status, ids[requester], _at(7, 15)),
    )


def seed_world(app) -> None:
    """Create the Hunt's cast if it isn't there yet."""
    with app.app_context():
        db = get_db()
        already = db.execute("SELECT COUNT(*) AS n FROM users WHERE provider = 'npc'").fetchone()["n"]
        if already >= len(TRAITORS) + len(INNOCENTS):
            return

        ids = {}
        for spec in TRAITORS + INNOCENTS:
            ids[spec["username"]] = _ensure_user(db, spec)

        for spec in TRAITORS + INNOCENTS:
            uid = ids[spec["username"]]
            cabin = spec.get("cabin")
            if cabin:
                place, days_ago, hour = cabin
                if not db.execute(
                    "SELECT 1 FROM activity_log WHERE user_id = ? AND location = ?", (uid, f"Cabin {place}")
                ).fetchone():
                    db.execute(
                        "INSERT INTO activity_log (user_id, event, location, occurred_at) VALUES (?, ?, ?, ?)",
                        (uid, "Entered", f"Cabin {place}", _at(days_ago, hour)),
                    )
            quiz = spec.get("qualifier")
            if quiz and not db.execute("SELECT 1 FROM qualifier_entries WHERE user_id = ?", (uid,)).fetchone():
                db.execute(
                    "INSERT INTO qualifier_entries (user_id, answers, score, won, taken_at) VALUES (?, ?, ?, ?, ?)",
                    (uid, json.dumps(quiz["answers"]), quiz["score"], int(quiz["won"]), _at(9, 13)),
                )
            if spec.get("friend_accepted_with"):
                _friend(db, ids, spec["username"], spec["friend_accepted_with"], "accepted", spec["username"])
            if spec.get("friend_pending_to"):
                _friend(db, ids, spec["username"], spec["friend_pending_to"], "pending", spec["username"])

        for a, b in NOISE_FRIENDSHIPS:
            _friend(db, ids, a, b, "accepted", a)
        for viewer, viewed in NOISE_VIEWS:
            db.execute(
                "INSERT OR IGNORE INTO profile_views (viewer_id, viewed_id, viewed_at) VALUES (?, ?, ?)",
                (ids[viewer], ids[viewed], _at(3, 18)),
            )

        # Ordinary players take the qualifier too, so entries alone prove nothing.
        db.commit()
