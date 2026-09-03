#!/usr/bin/env python3
"""Tiny stdlib-only server for the One Bar Math proxy demo.

Run:
    python3 server.py

Then open http://localhost:3000/one-bar-math.html
"""

import ipaddress
import json
import os
import re
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = os.path.dirname(os.path.abspath(__file__))
BLOCKLIST_FILE = os.path.join(ROOT, "blocklist.json")
MAX_BYTES = 2 * 1024 * 1024  # 2 MB response cap

CLEARANCE = {
    "QUAS@ARMT": "SIV",
    "ZAFFAZ@13": "III",
    "RAC@E@CAR": "II",
    "BAS@IS":    "I",
}
PROXY_LEVELS = {"II", "III", "SIV"}


def load_blocklist():
    try:
        with open(BLOCKLIST_FILE) as f:
            data = json.load(f)
        return [str(x) for x in data] if isinstance(data, list) else []
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def save_blocklist(lst):
    with open(BLOCKLIST_FILE, "w") as f:
        json.dump(lst, f, indent=2)


blocklist = load_blocklist()


def is_blocked(hostname):
    h = hostname.lower()
    for entry in blocklist:
        e = entry.lower()
        if h == e or h.endswith("." + e):
            return True
    return False


def is_private_host(hostname):
    h = (hostname or "").lower()
    if not h or h == "localhost" or h.endswith(".localhost"):
        return True
    try:
        ip = ipaddress.ip_address(h)
        return ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_unspecified
    except ValueError:
        return False


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))

    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {}

    def _serve_file(self, path, content_type):
        try:
            with open(path, "rb") as f:
                data = f.read()
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()
            return
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    # --- routing ----------------------------------------------------------
    def do_GET(self):
        url = urlparse(self.path)
        if url.path in ("/", "/one-bar-math.html"):
            return self._serve_file(
                os.path.join(ROOT, "one-bar-math.html"),
                "text/html; charset=utf-8",
            )
        if url.path == "/api/blocklist":
            return self._send_json(200, {"blocklist": blocklist})

        # Optionally serve anything under public/ for the rest of the math game.
        sub = url.path.lstrip("/")
        public_dir = os.path.join(ROOT, "public")
        candidate = os.path.normpath(os.path.join(public_dir, sub))
        if candidate.startswith(public_dir) and os.path.isfile(candidate):
            ctype = "text/html; charset=utf-8" if sub.endswith(".html") else "application/octet-stream"
            return self._serve_file(candidate, ctype)

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        url = urlparse(self.path)
        body = self._read_body()
        if url.path == "/api/proxy":
            return self._handle_proxy(body)
        if url.path == "/api/blocklist":
            return self._handle_blocklist(body)
        if url.path == "/api/ai":
            return self._handle_ai(body)
        self.send_response(404)
        self.end_headers()

    # --- handlers ---------------------------------------------------------
    def _handle_proxy(self, body):
        password = body.get("password")
        target_url = body.get("url")
        level = CLEARANCE.get(password)
        if not level or level not in PROXY_LEVELS:
            return self._send_json(403, {"error": "Level II clearance or higher required."})
        if not target_url or not isinstance(target_url, str):
            return self._send_json(400, {"error": "Missing url."})
        try:
            target = urlparse(target_url)
        except Exception:
            return self._send_json(400, {"error": "Invalid URL."})
        if target.scheme not in ("http", "https"):
            return self._send_json(400, {"error": "Only http and https URLs are allowed."})
        host = target.hostname or ""
        if is_private_host(host):
            return self._send_json(400, {"error": "Private and loopback hosts are blocked."})
        if is_blocked(host):
            return self._send_json(403, {"error": 'Host "%s" is on the blocklist.' % host})

        req = Request(target_url, headers={
            "User-Agent": "OneBarMath-ProxyDemo/1.0 (educational)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        })

        try:
            with urlopen(req, timeout=10) as resp:
                status = resp.status
                reason = resp.reason or ""
                content_type = resp.headers.get("Content-Type", "")
                final_url = resp.geturl()
                buf = b""
                truncated = False
                while True:
                    chunk = resp.read(65536)
                    if not chunk:
                        break
                    buf += chunk
                    if len(buf) >= MAX_BYTES:
                        buf = buf[:MAX_BYTES]
                        truncated = True
                        break
        except HTTPError as e:
            # Non-2xx responses still get returned to the client.
            content_type = e.headers.get("Content-Type", "") if e.headers else ""
            err_body = b""
            try:
                err_body = e.read() or b""
            except Exception:
                pass
            return self._send_json(200, {
                "status": e.code,
                "statusText": e.reason or "",
                "finalUrl": target_url,
                "contentType": content_type,
                "truncated": False,
                "bytes": len(err_body),
                "body": err_body.decode("utf-8", errors="replace"),
            })
        except URLError as e:
            return self._send_json(502, {"error": "Fetch failed: %s" % e.reason})
        except Exception as e:
            return self._send_json(502, {"error": "Fetch failed: %s" % e})

        self._send_json(200, {
            "status": status,
            "statusText": reason,
            "finalUrl": final_url,
            "contentType": content_type,
            "truncated": truncated,
            "bytes": len(buf),
            "body": buf.decode("utf-8", errors="replace"),
        })

    def _handle_ai(self, body):
        password = body.get("password")
        messages = body.get("messages")
        level = CLEARANCE.get(password)
        if not level or level not in ("III", "SIV"):
            return self._send_json(403, {"error": "Level III clearance or higher required."})
        if not isinstance(messages, list) or not messages:
            return self._send_json(400, {"error": "messages must be a non-empty list."})

        key = os.environ.get("OPENAI_API_KEY")
        if not key:
            return self._send_json(500, {
                "error": "OPENAI_API_KEY is not set on the server. "
                         "Set it before running: "
                         'export OPENAI_API_KEY="sk-..." then restart server.py'
            })

        system_prompt = os.environ.get(
            "AI_SYSTEM_PROMPT",
            "You are a friendly tutor helping a student learn math. "
            "Keep explanations clear and encouraging, and walk through "
            "problems step by step in simple language."
        )

        safe_messages = []
        for m in messages[-20:]:  # cap context length
            role = str(m.get("role", "user"))
            if role not in ("user", "assistant", "system"):
                role = "user"
            content = str(m.get("content", ""))[:4000]
            safe_messages.append({"role": role, "content": content})

        payload = {
            "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
            "messages": [{"role": "system", "content": system_prompt}] + safe_messages,
            "temperature": 0.4,
        }

        req = Request(
            "https://api.openai.com/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": "Bearer " + key,
            },
        )
        try:
            with urlopen(req, timeout=30) as resp:
                raw = resp.read().decode("utf-8")
            data = json.loads(raw)
            reply = (
                data.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "")
            )
            return self._send_json(200, {"reply": reply, "model": payload["model"]})
        except HTTPError as e:
            err_body = ""
            try:
                err_body = e.read().decode("utf-8", errors="replace")
            except Exception:
                pass
            return self._send_json(e.code, {"error": "OpenAI error %d: %s" % (e.code, err_body[:300])})
        except URLError as e:
            return self._send_json(502, {"error": "Could not reach OpenAI: %s" % e.reason})
        except Exception as e:
            return self._send_json(502, {"error": "AI request failed: %s" % e})

    def _handle_blocklist(self, body):
        global blocklist
        password = body.get("password")
        next_list = body.get("blocklist")
        if CLEARANCE.get(password) != "SIV":
            return self._send_json(403, {"error": "SIV clearance required."})
        if not isinstance(next_list, list):
            return self._send_json(400, {"error": "blocklist must be an array of hostnames."})
        cleaned = []
        seen = set()
        for s in next_list:
            v = str(s).strip().lower()
            if v and re.fullmatch(r"[a-z0-9.-]+", v) and v not in seen:
                cleaned.append(v)
                seen.add(v)
        blocklist = cleaned
        save_blocklist(blocklist)
        self._send_json(200, {"blocklist": blocklist})


def main():
    port = int(os.environ.get("PORT", "3000"))
    server = HTTPServer(("0.0.0.0", port), Handler)
    print("One Bar Math (Python proxy) running on port %d" % port)
    print("Open http://localhost:%d/one-bar-math.html" % port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")


if __name__ == "__main__":
    main()
