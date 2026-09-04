"""Hunt for the Traitor: the Tier 2 -> Tier 3 puzzle.

Finn hands a Tier 2 ruler three intercepted letters and opens up the player
directory -- profiles, friend lists, who viewed whom, and the activity log.
Six accounts in there are the ring. Name all six and you make Tier 3; name an
innocent and your accusations are wiped, so the clues have to be read rather
than the directory brute-forced.

The letters are stored as ciphertext exactly as a player sees them. Each one
decodes cleanly with the key in its `hint` -- Letter #2's ciphertext is the
corrected version (the original encoded plain `a` as `m` and `p` as `b`, which
its own key never agreed with).
"""
import json
import time

from flask import Blueprint, abort, jsonify, request

from .auth import require_tier, tier_of
from .db import get_db
from .players import _clean_name, public_profile
from .seed import LEAKED_ANSWERS, TRAITOR_USERNAMES

hunt_bp = Blueprint("hunt", __name__, url_prefix="/api/hunt")

HUNT_TIER = 2       # who may open the Hunt
REWARD_TIER = 3     # what solving it grants
TARGET_COUNT = len(TRAITOR_USERNAMES)

LETTERS = [
    {
        "n": 1,
        "from": "Agent Dagger",
        "to": "Agent X",
        "cipher": "Caesar shift",
        "hint": "Caesar cipher — a → h",
        "tool": "https://cryptii.com/pipes/caesar-cipher",
        "body": (
            "E, aol tlzzhnl pz pu wshjl mvy hnlua F av iljvtl h slcls 2 hktpu. Aopz dhf, ol jhu "
            "ylwvya hufvul dov ayplz av nla pu vby dhf av slcls 3 hktpuz dpao wshualk lcpklujl pu "
            "jslcly zwvaz av pujyptpuhal aolt. Olyl pz aol zolla vm huzdlyz mvy aol npclu jvualza ol "
            "dpss ahrl av iljvtl aol slcls 2 hktpu. Wslhzl mvydhyk av F. Aohur fvb."
        ),
        "attachment": {
            "label": "Attached: answer sheet",
            "rows": [f"#{i + 1}: {a}" for i, a in enumerate(LEAKED_ANSWERS)],
        },
    },
    {
        "n": 2,
        "from": "Agent Y",
        "to": "Agent DeNach, Agent Asgard",
        "cipher": "Alphabetical substitution",
        "hint": "Alphabetical substitution — QWERTYUIOPASDFGHJKLZXCVBNM",
        "tool": "https://cryptii.com/pipes/alphabetical-substitution",
        "body": (
            "zit stcts 1 kxstkl qkt esxtstll zg viqz ol ugofu gf. zit vigst d uqdtl lnlztd ol "
            "cxsftkqwst zg gxk qzzqea. yoff qfr iol ektv ol zknofu zg lzgh xl wxz gxk qsoqltl qkt "
            "vgkaofu ctkn vtss. kouiz fgv, vt fttr rtfqei zg ykotfr dt kouiz fgv zg egddxfoeqzt dgkt "
            "of dgkt ltexkt eiqfftsl. qluqkr iql rgft ziqz qsktqrn. ktdtdwtk, gxk kqor gf yoff'l "
            "eqwof ol qz 2 hd gf lthztdwtk 11zi. q ldqkz rtcoet voss tstezkgexzt qss rtcoetl of zit "
            "d uqdtl zit fouiz wtygkt, eqxlofu hqfoe."
        ),
    },
    {
        "n": 3,
        "from": "Agent DeNach",
        "to": "Agent Zemdegs, Agent Asgard",
        "cipher": "Vigenère",
        "hint": "Vigenère cipher — key: FarMoreThanM",
        "tool": "https://cryptii.com/pipes/vigenere-cipher",
        "body": (
            "Iaxssi egk X umae gxoexxk tuq xmrdh syz pn pmgie #1431. Fvvc plrr fmeiq ok 2 mg ahr "
            "ytreubx. Dxtdrsx, svzr klx uuznjr 3 zz mfyk krnstn ygbkik iofejs sqokig, 6 pn lazr Gqhj "
            "Spueq, msd Xqh klx Hcuujvvysex Iyogqhtfd hf wbnnnx re kts kmfl os mytroy."
        ),
    },
]

BRIEFING = (
    "Five words into that first letter and I knew. Six accounts are working together to take the "
    "M Games from the inside — one of them cheated their way into a Tier 2 badge to do it. I "
    "intercepted three of their letters but I can't read a word of them. I'm opening the whole "
    "directory to you: every profile, who they're friends with, who's been looking at whose "
    "profile, and where they've been. Name all six and the Tier 3 badge is yours. Name someone "
    "innocent and I have to throw out everything you've given me and start over."
)


def _traitor_ids(db) -> set:
    rows = db.execute(
        "SELECT id FROM users WHERE provider = 'npc' AND subject IN (%s)"
        % ",".join("?" * len(TRAITOR_USERNAMES)),
        TRAITOR_USERNAMES,
    ).fetchall()
    return {r["id"] for r in rows}


def _unlocked_ids(data) -> list:
    """Achievement ids from a saved-progress blob. Written by a browser, so
    every layer is checked before it is trusted."""
    try:
        parsed = json.loads(data) if data else {}
    except (TypeError, ValueError):
        return []
    ach = parsed.get("achievements") if isinstance(parsed.get("achievements"), dict) else {}
    unlocked = ach.get("unlocked") if isinstance(ach.get("unlocked"), dict) else {}
    return sorted(str(k)[:40] for k, v in unlocked.items() if v)


def _named(db, user_id: int) -> str:
    row = db.execute("SELECT name FROM users WHERE id = ?", (user_id,)).fetchone()
    return _clean_name(row["name"]) if row else "Unknown"


def _progress(db, user) -> dict:
    correct = db.execute(
        "SELECT accused_id FROM hunt_accusations WHERE user_id = ? AND correct = 1", (user["id"],)
    ).fetchall()
    named = [{"userId": r["accused_id"], "name": _named(db, r["accused_id"])} for r in correct]
    return {
        "tier": tier_of(user),
        "needed": TARGET_COUNT,
        "named": named,
        "solved": tier_of(user) >= REWARD_TIER and len(named) >= TARGET_COUNT,
    }


@hunt_bp.get("/status")
def status():
    user = require_tier(HUNT_TIER)
    db = get_db()
    return jsonify(briefing=BRIEFING, letters=LETTERS, **_progress(db, user))


@hunt_bp.get("/dossiers")
def dossiers():
    """Everything Finn opened up: every account, its friends, its viewers, its
    movements, and its qualifier entry."""
    require_tier(HUNT_TIER)
    db = get_db()
    rows = db.execute(
        """
        SELECT u.id, u.name, u.picture, u.created_at, u.tier, p.data, p.updated_at
        FROM users u LEFT JOIN progress p ON p.user_id = u.id
        ORDER BY u.id
        """
    ).fetchall()

    friends = {}
    for f in db.execute("SELECT user_a, user_b, status, requested_by FROM friendships").fetchall():
        for me, them in ((f["user_a"], f["user_b"]), (f["user_b"], f["user_a"])):
            friends.setdefault(me, []).append(
                {"userId": them, "name": _named(db, them), "status": f["status"],
                 "requestedByThem": f["requested_by"] == them}
            )
    viewers = {}
    for v in db.execute("SELECT viewer_id, viewed_id, viewed_at FROM profile_views").fetchall():
        viewers.setdefault(v["viewed_id"], []).append(
            {"userId": v["viewer_id"], "name": _named(db, v["viewer_id"]), "at": v["viewed_at"]}
        )
    moves = {}
    for a in db.execute("SELECT user_id, event, location, occurred_at FROM activity_log ORDER BY occurred_at").fetchall():
        moves.setdefault(a["user_id"], []).append(
            {"event": a["event"], "location": a["location"], "at": a["occurred_at"]}
        )
    quizzes = {}
    for q in db.execute("SELECT user_id, answers, score, won, taken_at FROM qualifier_entries").fetchall():
        quizzes[q["user_id"]] = {
            "answers": json.loads(q["answers"]), "score": q["score"], "won": bool(q["won"]), "at": q["taken_at"]
        }

    out = []
    for row in rows:
        profile = public_profile(row)
        profile["accountTier"] = row["tier"] or 0
        # Letter #3 names a specific achievement, so the ids have to be visible --
        # public_profile only exposes how many an account has.
        profile["achievementIds"] = _unlocked_ids(row["data"])
        profile["friends"] = friends.get(row["id"], [])
        profile["viewedBy"] = viewers.get(row["id"], [])
        profile["activity"] = moves.get(row["id"], [])
        profile["qualifier"] = quizzes.get(row["id"])
        out.append(profile)
    return jsonify(dossiers=out)


@hunt_bp.post("/accuse")
def accuse():
    user = require_tier(HUNT_TIER)
    db = get_db()
    if tier_of(user) >= REWARD_TIER:
        abort(409, "You have already closed this case.")

    body = request.get_json(silent=True) or {}
    try:
        accused_id = int(body.get("userId"))
    except (TypeError, ValueError):
        abort(400, "userId is required.")
    if accused_id == user["id"]:
        abort(400, "You cannot accuse yourself.")
    if db.execute("SELECT 1 FROM users WHERE id = ?", (accused_id,)).fetchone() is None:
        abort(404)

    already = db.execute(
        "SELECT correct FROM hunt_accusations WHERE user_id = ? AND accused_id = ?", (user["id"], accused_id)
    ).fetchone()
    if already:
        return jsonify(correct=bool(already["correct"]), repeat=True, **_progress(db, user))

    correct = accused_id in _traitor_ids(db)
    now = time.time()
    # An accusation is a real report either way: Tier 3 sees it in the queue.
    db.execute(
        "INSERT INTO reports (reporter_user_id, reported_user_id, reason, status, created_at) "
        "VALUES (?, ?, ?, 'open', ?)",
        (user["id"], accused_id, "Named in Hunt for the Traitor", now),
    )
    if not correct:
        # Wrong name: the case file is thrown out and the hunt starts over.
        db.execute("DELETE FROM hunt_accusations WHERE user_id = ?", (user["id"],))
        db.commit()
        return jsonify(correct=False, reset=True, **_progress(db, user))

    db.execute(
        "INSERT INTO hunt_accusations (user_id, accused_id, correct, created_at) VALUES (?, ?, 1, ?)",
        (user["id"], accused_id, now),
    )
    db.commit()

    found = db.execute(
        "SELECT COUNT(*) AS n FROM hunt_accusations WHERE user_id = ? AND correct = 1", (user["id"],)
    ).fetchone()["n"]
    if found >= TARGET_COUNT:
        db.execute("UPDATE users SET tier = MAX(tier, ?) WHERE id = ?", (REWARD_TIER, user["id"]))
        db.commit()

    user = db.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
    return jsonify(correct=True, reset=False, **_progress(db, user))
