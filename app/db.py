"""SQLite storage for users and saved progress."""
import json
import sqlite3
import time

from flask import current_app, g

SCHEMA = """
-- `tier` is one ladder for both rank and power: 0 = not a ruler yet, 1 = beat
-- Finn, 2 = won an Arena month, 3 = solved Hunt for the Traitor, 4 = the owner.
CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    provider   TEXT NOT NULL,
    subject    TEXT NOT NULL,
    email      TEXT,
    name       TEXT,
    picture    TEXT,
    created_at REAL NOT NULL,
    tier       INTEGER NOT NULL DEFAULT 0,
    banned     INTEGER NOT NULL DEFAULT 0,
    UNIQUE (provider, subject)
);
CREATE TABLE IF NOT EXISTS progress (
    user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data       TEXT NOT NULL,
    updated_at REAL NOT NULL
);

-- ---- Arena of Champions: monthly time-trial ladder ----------------------------
CREATE TABLE IF NOT EXISTS arena_attempts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period       TEXT NOT NULL,
    time_seconds REAL NOT NULL,
    created_at   REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_arena_attempts_period ON arena_attempts(period, user_id);

-- One row per closed month: the winner (NULL user_id means the placeholder NPC won).
CREATE TABLE IF NOT EXISTS arena_results (
    period         TEXT PRIMARY KEY,
    winner_user_id INTEGER REFERENCES users(id),
    time_seconds   REAL,
    closed_at      REAL NOT NULL
);

-- ---- Player-created contests (Tier 1+ admins create, Tier 3 approves) --------
CREATE TABLE IF NOT EXISTS custom_contests (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title            TEXT NOT NULL,
    description      TEXT NOT NULL,
    mbucks_reward    INTEGER NOT NULL DEFAULT 0,
    status           TEXT NOT NULL DEFAULT 'pending',
    approved_by      INTEGER REFERENCES users(id),
    created_at       REAL NOT NULL,
    decided_at       REAL
);
CREATE TABLE IF NOT EXISTS contest_completions (
    contest_id   INTEGER NOT NULL REFERENCES custom_contests(id) ON DELETE CASCADE,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_at REAL NOT NULL,
    PRIMARY KEY (contest_id, user_id)
);

-- ---- Moderation: Tier 2 reports, Tier 3 bans ---------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason            TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'open',
    created_at        REAL NOT NULL,
    decided_at        REAL
);

-- MBucks owed to a player for an approved contest completion. The client claims
-- these into its local (opaque) save on next load rather than the server editing
-- that JSON blob directly.
CREATE TABLE IF NOT EXISTS wallet_credits (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount     INTEGER NOT NULL,
    reason     TEXT NOT NULL,
    created_at REAL NOT NULL,
    claimed_at REAL
);

-- ---- Social: friends and profile visits --------------------------------------
-- One row per pair, with user_a < user_b so a pair can't be stored twice.
CREATE TABLE IF NOT EXISTS friendships (
    user_a       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status       TEXT NOT NULL DEFAULT 'pending',
    requested_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   REAL NOT NULL,
    PRIMARY KEY (user_a, user_b)
);
CREATE TABLE IF NOT EXISTS profile_views (
    viewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_at REAL NOT NULL,
    PRIMARY KEY (viewer_id, viewed_id)
);

-- ---- Hunt for the Traitor ----------------------------------------------------
-- Where an account was seen and when. The Hunt's cabin clue reads from this.
CREATE TABLE IF NOT EXISTS activity_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event       TEXT NOT NULL,
    location    TEXT,
    occurred_at REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);

-- Results of the Ruler Qualifier. Agent Y's entry matches the leaked answer key.
CREATE TABLE IF NOT EXISTS qualifier_entries (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answers  TEXT NOT NULL,
    score    INTEGER NOT NULL,
    won      INTEGER NOT NULL DEFAULT 0,
    taken_at REAL NOT NULL
);

-- Accusations made during the Hunt. Naming an innocent wipes the hunter's set,
-- so the six have to be identified from the clues rather than brute-forced.
CREATE TABLE IF NOT EXISTS hunt_accusations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accused_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    correct    INTEGER NOT NULL,
    created_at REAL NOT NULL
);
"""

# Columns added after the initial release: keep existing local databases working
# without wiping them (SQLite has no "ADD COLUMN IF NOT EXISTS").
_MIGRATIONS = [
    ("users", "tier", "INTEGER NOT NULL DEFAULT 0"),
    ("users", "banned", "INTEGER NOT NULL DEFAULT 0"),
]


def _migrate(db: sqlite3.Connection) -> None:
    for table, column, decl in _MIGRATIONS:
        cols = {row["name"] for row in db.execute(f"PRAGMA table_info({table})")}
        if column not in cols:
            db.execute(f"ALTER TABLE {table} ADD COLUMN {column} {decl}")
    # Rank and power used to be two separate ladders; fold the old pair into the
    # single `tier` by keeping whichever was higher. The dead columns are left in
    # place (SQLite DROP COLUMN is not available everywhere) but never read.
    user_cols = {row["name"] for row in db.execute("PRAGMA table_info(users)")}
    if {"admin_tier", "ruler_tier"} <= user_cols:
        db.execute("UPDATE users SET tier = MAX(tier, admin_tier, ruler_tier)")
    db.commit()


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(_exc=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db(app):
    db = sqlite3.connect(app.config["DATABASE"])
    db.row_factory = sqlite3.Row
    db.executescript(SCHEMA)
    _migrate(db)
    db.close()
    app.teardown_appcontext(close_db)


def upsert_user(provider: str, subject: str, email, name, picture) -> sqlite3.Row:
    db = get_db()
    db.execute(
        """
        INSERT INTO users (provider, subject, email, name, picture, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT (provider, subject) DO UPDATE SET
            email = excluded.email,
            name = excluded.name,
            picture = excluded.picture
        """,
        (provider, subject, email, name, picture, time.time()),
    )
    db.commit()
    return db.execute("SELECT * FROM users WHERE provider = ? AND subject = ?", (provider, subject)).fetchone()


def get_user(user_id: int):
    return get_db().execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def load_progress(user_id: int):
    row = get_db().execute("SELECT data, updated_at FROM progress WHERE user_id = ?", (user_id,)).fetchone()
    if row is None:
        return None
    return {"data": json.loads(row["data"]), "updated_at": row["updated_at"]}


def save_progress(user_id: int, data: dict) -> float:
    now = time.time()
    db = get_db()
    db.execute(
        """
        INSERT INTO progress (user_id, data, updated_at) VALUES (?, ?, ?)
        ON CONFLICT (user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
        """,
        (user_id, json.dumps(data), now),
    )
    db.commit()
    return now
