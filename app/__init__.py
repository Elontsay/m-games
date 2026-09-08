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
from .forum import forum_bp  # noqa: E402
from .hunt import hunt_bp  # noqa: E402
from .players import players_bp  # noqa: E402
from .seed import seed_world  # noqa: E402
from .social import social_bp  # noqa: E402
from .tutor import tutor_bp  # noqa: E402
from .wallet import wallet_bp  # noqa: E402

GOOGLE_METADATA_URL = "https://accounts.google.com/.well-known/openid-configuration"


DEV_SECRET = "dev-only-change-me"


def _flag(name: str) -> bool:
    return os.environ.get(name, "").lower() in ("1", "true", "yes")


def create_app() -> Flask:
    app = Flask(__name__, static_folder=None, instance_path=str(ROOT / "instance"))

    # PRODUCTION says "this is served over HTTPS from behind a proxy". It turns on
    # secure cookies and the proxy header fix, and it makes a missing SECRET_KEY
    # fatal rather than silently falling back to a key that is public knowledge.
    production = _flag("PRODUCTION")
    secret = os.environ.get("SECRET_KEY", "")
    if production and (not secret or secret == DEV_SECRET):
        raise RuntimeError(
            "SECRET_KEY must be set to a real random value when PRODUCTION=1. "
            "Sessions are signed with it, so the default would let anyone forge a login. "
            'Generate one with: python -c "import secrets; print(secrets.token_hex(32))"'
        )

    # The database lives outside the checkout in production, because a host's
    # filesystem is wiped on every deploy and accounts should not be.
    database = os.environ.get("DATABASE_PATH") or str(ROOT / "instance" / "mgames.db")

    app.config.update(
        SECRET_KEY=secret or DEV_SECRET,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SECURE=production,
        GOOGLE_CLIENT_ID=os.environ.get("GOOGLE_CLIENT_ID", ""),
        GOOGLE_CLIENT_SECRET=os.environ.get("GOOGLE_CLIENT_SECRET", ""),
        ADMIN_EMAILS={e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()},
        # Never in production, whatever the environment says. /dev-login signs you
        # in as any account by typing its name, so a stray DEV_LOGIN=1 -- from a
        # .env that got deployed, or a copied config -- would be a way past Google
        # sign-in entirely.
        DEV_LOGIN=_flag("DEV_LOGIN") and not production,
        DATABASE=database,
    )
    os.makedirs(app.instance_path, exist_ok=True)
    os.makedirs(os.path.dirname(database) or ".", exist_ok=True)

    if production:
        # Behind a TLS-terminating proxy, Flask sees plain http and would build
        # the OAuth redirect_uri as http://... -- which Google rejects with
        # redirect_uri_mismatch. ProxyFix reads X-Forwarded-Proto and X-Forwarded-Host
        # so url_for(_external=True) produces the real https URL.
        from werkzeug.middleware.proxy_fix import ProxyFix

        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

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
    app.register_blueprint(hunt_bp)
    app.register_blueprint(social_bp)
    app.register_blueprint(forum_bp)
    app.register_blueprint(tutor_bp)

    seed_world(app)  # the Hunt's cast; no-op once they exist

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
