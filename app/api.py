"""Saved-progress API. The game keeps its state in the browser and mirrors it here per account."""
from flask import Blueprint, abort, jsonify, request

from .auth import current_user
from .db import load_progress, save_progress

api_bp = Blueprint("api", __name__, url_prefix="/api")

MAX_PROGRESS_BYTES = 256 * 1024


def _require_user():
    user = current_user()
    if user is None:
        abort(401)
    return user


@api_bp.get("/progress")
def get_progress():
    user = _require_user()
    saved = load_progress(user["id"])
    if saved is None:
        return jsonify(state=None, achievements=None, updatedAt=None)
    data = saved["data"]
    return jsonify(state=data.get("state"), achievements=data.get("achievements"), updatedAt=saved["updated_at"])


@api_bp.put("/progress")
def put_progress():
    user = _require_user()
    if request.content_length and request.content_length > MAX_PROGRESS_BYTES:
        abort(413)
    body = request.get_json(silent=True)
    if not isinstance(body, dict) or not isinstance(body.get("state"), dict):
        abort(400, "Expected JSON with a 'state' object.")
    data = {"state": body["state"], "achievements": body.get("achievements") or {}}
    updated_at = save_progress(user["id"], data)
    return jsonify(ok=True, updatedAt=updated_at)
