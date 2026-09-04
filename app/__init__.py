"""M Games backend.

Serves the static game (index.html, app.js, data.js) and adds:
  * Google sign-in with OAuth 2.0 / OpenID Connect (Authlib)
  * a SQLite store for users and their saved game progress
  * a dev-only login so the game can run locally without Google credentials

Configuration comes from environment variables (a .env file is loaded if present):
  SECRET_KEY            Flask session signing key            (required in production)
  GOOGLE_CLIENT_ID      OAuth client id from Google Cloud    (enables "Sign in with Google")
  GOOGLE_CLIENT_SECRET  OAuth client secret
  ADMIN_EMAILS          comma-separated emails that get admin hacks
  DEV_LOGIN             "1" to enable /dev-login (local development only)
"""
import os
from pathlib import Path

from flask import Flask, send_from_directory

ROOT = Path(__file__).resolve().parent.parent  # folder holding index.html, app.js, data.js

try:  # optional: load ROOT/.env into the environment
    from dotenv import load_dotenv

    load_dotenv(ROOT / ".env")
except ImportError:  # python-dotenv not installed; rely on real env vars
    pass

from .admin import admin_bp  # noqa: E402
from .api import api_bp  # noqa: E402
from .arena import arena_bp  # noqa: E402
from .auth import auth_bp, oauth  # noqa: E402
from .db import init_db  # noqa: E402
from .players import players_bp  # noqa: E402
from .wallet import wallet_bp  # noqa: E402

GOOGLE_METADATA_URL = "https://accounts.google.com/.well-known/openid-configuration"


def create_app() -> Flask:
    app = Flask(__name__, static_folder=None, instance_path=str(ROOT / "instance"))
    app.config.update(
        SECRET_KEY=os.environ.get("SECRET_KEY", "dev-only-change-me"),
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_HTTPONLY=True,
        GOOGLE_CLIENT_ID=os.environ.get("GOOGLE_CLIENT_ID", ""),
        GOOGLE_CLIENT_SECRET=os.environ.get("GOOGLE_CLIENT_SECRET", ""),
        ADMIN_EMAILS={e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()},
        DEV_LOGIN=os.environ.get("DEV_LOGIN", "").lower() in ("1", "true", "yes"),
        DATABASE=str(ROOT / "instance" / "mgames.db"),
    )
    os.makedirs(app.instance_path, exist_ok=True)

    init_db(app)

    oauth.init_app(app)
    if app.config["GOOGLE_CLIENT_ID"]:
        oauth.register(
            name="google",
            client_id=app.config["GOOGLE_CLIENT_ID"],
            client_secret=app.config["GOOGLE_CLIENT_SECRET"],
            server_metadata_url=GOOGLE_METADATA_URL,
            client_kwargs={"scope": "openid email profile"},
        )

    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(players_bp)
    app.register_blueprint(arena_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(wallet_bp)

    @app.get("/")
    def index():
        return send_from_directory(ROOT, "index.html")

    # The game's scripts sit next to index.html. The string converter refuses
    # slashes and send_from_directory blocks traversal, so this stays inside ROOT.
    @app.get("/<name>.js")
    def script(name):
        return send_from_directory(ROOT, f"{name}.js")

    @app.get("/assets/<path:name>")
    def assets(name):
        return send_from_directory(ROOT / "assets", name)

    return app
