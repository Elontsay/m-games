"""Sign-in routes: Google OAuth (OpenID Connect), a dev-only login, logout, and /api/me."""
import re

from authlib.integrations.flask_client import OAuth
from flask import Blueprint, abort, current_app, jsonify, redirect, request, session, url_for
from markupsafe import escape

from .db import get_user, upsert_user

oauth = OAuth()
auth_bp = Blueprint("auth", __name__)


def current_user():
    user_id = session.get("user_id")
    return get_user(user_id) if user_id else None


def is_admin(user) -> bool:
    return bool(user) and (user["email"] or "").lower() in current_app.config["ADMIN_EMAILS"]


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
    )
