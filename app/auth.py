"""Sign-in routes: Google OAuth (OpenID Connect), a dev-only login, logout, and /api/me."""
import re

from authlib.integrations.flask_client import OAuth
from flask import Blueprint, abort, current_app, jsonify, redirect, request, session, url_for
from markupsafe import escape

from .db import get_user, upsert_user

oauth = OAuth()
auth_bp = Blueprint("auth", __name__)

# Arena of Champions governance tiers (separate from the legacy ADMIN_EMAILS
# "admin hacks" panel below). Tier 4 is permanently reserved for the owner's
# real, Google-authenticated account -- it is never stored or grantable.
OWNER_EMAIL = "elontsay@gmail.com"
# Same code the client's local "admin hacks" panel checks for. A signed-in
# account whose display name starts with this is auto-Tier 2 (can report
# players). It cannot reach Tier 3 (ban power) this way -- only the owner
# (Tier 4) can promote someone to Tier 3.
NAME_TIER2_PREFIX = "AY1234567YA"


def current_user():
    user_id = session.get("user_id")
    return get_user(user_id) if user_id else None


def is_admin(user) -> bool:
    return bool(user) and (user["email"] or "").lower() in current_app.config["ADMIN_EMAILS"]


def is_owner(user) -> bool:
    return bool(user) and (user["email"] or "").lower() == OWNER_EMAIL


def admin_tier(user) -> int:
    """Effective Arena governance tier: 0 (none) .. 4 (owner)."""
    if not user:
        return 0
    if is_owner(user):
        return 4
    stored = user["admin_tier"] or 0
    name_bonus = 2 if str(user["name"] or "").startswith(NAME_TIER2_PREFIX) else 0
    return max(stored, name_bonus)


def is_banned(user) -> bool:
    return bool(user) and bool(user["banned"])


def require_user():
    """Any signed-in account. Aborts 401 if not signed in."""
    user = current_user()
    if user is None:
        abort(401)
    return user


def require_active_user():
    """Signed in and not banned. Use for anything that changes shared state."""
    user = require_user()
    if is_banned(user):
        abort(403, "This account has been banned.")
    return user


def require_tier(n: int):
    """Signed in, not banned, and at least Arena governance tier `n`."""
    user = require_active_user()
    if admin_tier(user) < n:
        abort(403, f"Requires Tier {n}.")
    return user


def _sign_in(user) -> None:
    session.clear()
    session["user_id"] = user["id"]
    session.permanent = True


@auth_bp.get("/login")
def login():
    if not current_app.config["GOOGLE_CLIENT_ID"]:
        if current_app.config["DEV_LOGIN"]:
            return redirect(url_for("auth.dev_login"))
        abort(503, "Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.")
    redirect_uri = url_for("auth.callback", _external=True)
    return oauth.google.authorize_redirect(redirect_uri)


@auth_bp.get("/auth/callback")
def callback():
    token = oauth.google.authorize_access_token()
    info = token.get("userinfo") or oauth.google.userinfo()
    user = upsert_user(
        "google",
        info["sub"],
        info.get("email"),
        info.get("name") or info.get("email") or "Player",
        info.get("picture"),
    )
    _sign_in(user)
    return redirect("/")


@auth_bp.route("/dev-login", methods=["GET", "POST"])
def dev_login():
    """Local development only: sign in with just a name (enabled by DEV_LOGIN=1)."""
    if not current_app.config["DEV_LOGIN"]:
        abort(404)
    name = (request.form.get("name") or request.args.get("name") or "").strip()
    if name:
        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "player"
        user = upsert_user("dev", slug, f"{slug}@dev.local", name, None)
        _sign_in(user)
        return redirect("/")
    return (
        "<!doctype html><title>Dev login</title>"
        "<body style='font-family:system-ui;max-width:24rem;margin:4rem auto'>"
        "<h2>Dev login</h2><p>Google sign-in is not configured, so this local login stands in for it.</p>"
        "<form method='post'><input name='name' placeholder='Your name' autofocus required "
        "style='padding:.5rem;width:100%'><button style='margin-top:.75rem;padding:.5rem 1rem'>Sign in</button></form>"
        "</body>"
    )


@auth_bp.get("/logout")
def logout():
    session.clear()
    return redirect("/")


@auth_bp.get("/api/me")
def me():
    user = current_user()
    if user is None:
        return jsonify(
            signedIn=False,
            google=bool(current_app.config["GOOGLE_CLIENT_ID"]),
            devLogin=bool(current_app.config["DEV_LOGIN"]),
        )
    return jsonify(
        signedIn=True,
        name=user["name"],
        email=user["email"],
        picture=user["picture"],
        provider=user["provider"],
        admin=is_admin(user),
        rulerTier=user["ruler_tier"] or 0,
        adminTier=admin_tier(user),
        banned=is_banned(user),
    )
