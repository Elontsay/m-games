# M Games

A tiered math contest game (Bronze → Diamond), with Finn Reaper as your guide, a Diamond tournament, achievements, and the Dragon Hunter and Meteor Showdown minigames.

The game itself is static (`index.html`, `app.js`, `data.js`). The Python backend adds Google sign-in and saves each account's progress.

## Run it

```bash
pip install -r requirements.txt
copy .env.example .env      # then edit .env
python run.py
```

Open http://127.0.0.1:5000.

Without Google credentials, leave `DEV_LOGIN=1` in `.env` and the **Sign in** button uses a local name-only login instead. You can also still play as a guest (progress stays in the browser only).

## Google sign-in

1. Go to Google Cloud Console → APIs & Services → Credentials → **Create credentials → OAuth client ID**.
2. Application type **Web application**. Add the authorized redirect URI `http://127.0.0.1:5000/auth/callback`.
3. Put the client ID and secret in `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
4. Add your email to `ADMIN_EMAILS` to get the admin hacks panel on that account.

Progress is stored in `instance/mgames.db` (SQLite). Signing in on a new device loads the saved progress from the account.

## Endpoints

| Route | What it does |
| --- | --- |
| `GET /` | the game |
| `GET /login` | starts Google sign-in (or dev login) |
| `GET /auth/callback` | Google redirects back here |
| `GET /logout` | signs out |
| `GET /api/me` | who is signed in |
| `GET/PUT /api/progress` | the signed-in account's saved game |
