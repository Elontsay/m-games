# M Games

A tiered math contest game (Bronze → Diamond), with Finn Reaper as your guide, a Diamond tournament, achievements, and the Dragon Hunter and Meteor Showdown minigames.

Players who have beaten Finn can write their own contests; once a Tier 3 approves one it goes in the **📝 Contests** catalog, which anyone can browse (signing in is only needed to sit one). **💬 Forum** is where problems get argued about — threads are public to read, and a thread can be filed under the contest it is about.

## Project M

The app opens on a **Project M** menu rather than the game itself. Two entries so far:
the **M Games**, and the **M Games Player Handbook**.

The handbook is a map of all 32 subjects, a tier to a row, with lines running from each
subject into the ones that build on it. Every subject has three levels, and a level is a
2–4 page guide to read — all 96 of them are written, in `guides.js`. Each has the rules, worked
examples, the mistakes that level reliably produces, and practice questions with hidden answers.

Prerequisites are matched level for level: level 2 of a subject needs level 2 of everything
it comes after, not merely level 1. So finishing Linear Equations level 1 opens Factoring
Polynomials level 1 and nothing past it. A subject's own levels are independent of each
other — level 2 does not wait on level 1. Levels
show red when their prerequisites aren't met, yellow when they are, and green once finished;
a subject's outgoing lines turn green as soon as any one of its levels is done. Progress
lives in `state.guides` and is kept separately from the game's contest results.

The handbook and the game are two views of the same 32 subjects and link both ways: a stadium's
lesson has a **📕 Full guide** button into the handbook, and a subject or guide page has a
**🎮 Play the stadium** button back into the game when you are standing on that tier.

Every stadium teaches its subject before it opens: the first visit shows a lesson with the rules and two worked examples, and the stadium keeps a **📖 Read the lesson** button afterwards. Any question you get wrong on a results screen has an **✨ Explain it** button that asks Claude to work it through — see AI review below.

The game itself is static (`index.html`, `app.js`, `data.js`). The Python backend adds Google sign-in and saves each account's progress.

## Run it

```bash
pip install -r requirements.txt
cp .env.example .env      # then edit .env
PORT=5001 python run.py
```

Open http://127.0.0.1:5001.

The port matters, because Google sign-in only works at a URL you have registered
(see below). `run.py` listens on 5000 by default and `PORT` moves it. On macOS,
port 5000 is taken by Control Center's AirPlay Receiver, so use 5001 there —
or turn AirPlay Receiver off in System Settings → General → AirDrop & Handoff.

Without Google credentials, leave `DEV_LOGIN=1` in `.env` and the **Sign in** button uses a local name-only login instead. You can also still play as a guest (progress stays in the browser only).

## Google sign-in

1. Go to Google Cloud Console → APIs & Services → Credentials → **Create credentials → OAuth client ID**.
2. Application type **Web application**. Under **Authorized redirect URIs**, add the URL you
   actually open the game at, with `/auth/callback` on the end. For local development that is:

   ```
   http://127.0.0.1:5001/auth/callback
   http://localhost:5001/auth/callback
   ```

   Add both. Google treats `127.0.0.1` and `localhost` as different, and it matches the
   redirect URI exactly — a different port, or the other spelling of the host, is
   `Error 400: redirect_uri_mismatch`. The app builds its redirect URI from the address in
   the browser bar, so whatever you type there has to be on this list.
3. Put the client ID and secret in `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
4. Add your email to `ADMIN_EMAILS` to get the admin hacks panel on that account.
5. Deploying somewhere? Add that origin's `/auth/callback` to the same list.

Reaching Tier 2 — by winning an Arena month — makes Finn interrupt with an urgent alert that
opens Hunt for the Traitor, rather than leaving it behind a button to be noticed. It fires
once and is remembered in the save.

Progress is stored in `instance/mgames.db` (SQLite). Signing in on a new device loads the saved progress from the account.

## AI review

Put an Anthropic API key in `.env` as `ANTHROPIC_API_KEY` and the results screens grow an
**Explain it** button on every question the player got wrong. The server sends the question,
the player's answer and the right answer to Claude and shows the worked explanation that
comes back. Without a key the feature reports itself unavailable and the button never appears,
so the game still runs exactly as before.

Costs are kept in check three ways: it needs a signed-in account, identical
(question, wrong answer) pairs are answered from a cache in the database, and each account gets
40 uncached explanations a day (`DAILY_LIMIT` in `app/tutor.py`).

## Endpoints

| Route | What it does |
| --- | --- |
| `GET /` | the game |
| `GET /login` | starts Google sign-in (or dev login) |
| `GET /auth/callback` | Google redirects back here |
| `GET /logout` | signs out |
| `GET /api/me` | who is signed in |
| `GET/PUT /api/progress` | the signed-in account's saved game |
| `GET /api/admin/contests/approved` | the player-written contest catalog (open to guests) |
| `GET /api/admin/contests/<id>/play` | the questions for one contest, no answer key |
| `POST /api/admin/contests/<id>/submit` | hand a contest in; the server marks it |
| `POST /api/review` | AI review: explain one wrong question |
| `GET/POST /api/forum/threads` | forum index (open to guests) / start a thread |
| `GET /api/forum/threads/<id>` | one thread and its posts (open to guests) |
| `POST /api/forum/threads/<id>/posts` | reply |
| `POST /api/forum/posts/<id>/delete` | take a post down (your own, or Tier 3) |
| `POST /api/forum/threads/<id>/lock` | Tier 3: lock or unlock (`/unlock`) a thread |
