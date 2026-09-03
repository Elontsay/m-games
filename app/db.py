"""SQLite storage for users and saved progress."""
import json
import sqlite3
import time

from flask import current_app, g

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    provider   TEXT NOT NULL,
    subject    TEXT NOT NULL,
    email      TEXT,
    name       TEXT,
    picture    TEXT,
    created_at REAL NOT NULL,
    UNIQUE (provider, subject)
);
CREATE TABLE IF NOT EXISTS progress (
    user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data       TEXT NOT NULL,
    updated_at REAL NOT NULL
);
"""


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
    db.executescript(SCHEMA)
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
