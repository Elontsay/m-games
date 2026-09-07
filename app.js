// ============================================================================
// M GAMES — app logic
// Flow: welcome/intro video → Finn intro → demo contest → the System →
//       stadium tour → Planet M → stadium → contest → bonus → results
//       → Coronation Series → promotion … → Diamond Arena tournament.
// Progress is saved in localStorage. Game content lives in data.js.
// ============================================================================
(() => {
  const STORAGE_KEY = "mgames-state-v3";
  const GUIDE = GAME_DATA.guide;
  const CHAIN = GAME_DATA.tierChain;
  const DIAMOND = GAME_DATA.diamond;

  // ==========================================================================
  // SERVER SYNC — optional Flask backend (sign-in + saved progress)
  // When the game is served as plain files there is no backend; everything
  // then stays in localStorage and the player continues as a guest.
  // ==========================================================================
  const API = { available: false, me: null, pushTimer: null };
  async function apiJson(url, opts) {
    const r = await fetch(url, { credentials: "same-origin", ...opts });
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  }
  function schedulePush() {
    if (!API.me) return;
    clearTimeout(API.pushTimer);
    API.pushTimer = setTimeout(pushProgress, 800);
  }
  async function pushProgress() {
    if (!API.me) return;
    try {
      await apiJson("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, achievements: ach }),
      });
    } catch {}
  }
  // Ask the backend who we are and pull the account's saved game (the account wins over local data).
  async function bootSync() {
    try {
      const me = await apiJson("/api/me");
      API.available = true;
      API.google = !!me.google;
      API.aiReview = !!me.aiReview;   // false when the server has no Anthropic key
      if (!me.signedIn) return;
      API.me = me;
      const saved = await apiJson("/api/progress");
      if (saved && saved.state) state = { ...defaultState(), ...saved.state };
      if (saved && saved.achievements) ach = { ...defaultAch(), ...saved.achievements };
      state.playerName = me.name || state.playerName;
      state.serverAdmin = !!me.admin;
      saveState();
      saveAch();
      if (!saved || !saved.state) pushProgress();
      await claimWalletCredits();
    } catch {}
  }
  // MBucks earned server-side (an approved contest completion) aren't in the
  // local save until claimed -- the server never edits that opaque blob itself.
  async function claimWalletCredits() {
    try {
      const { credits } = await apiJson("/api/wallet/credits");
      if (credits && credits.length) {
        mmcState().bucks = mmcBucks() + credits.reduce((t, c) => t + c.amount, 0);
        saveState();
        pushProgress();
      }
    } catch {}
  }

  // ==========================================================================
  // ACHIEVEMENTS — stored separately so they survive "Reset progress"
  // ==========================================================================
  const ACH_KEY = "mgames-achievements-v1";
  const ACHIEVEMENTS = [
    { id: "start", name: "Start the Game", desc: "Log in." },
    { id: "player", name: "Player", desc: "Take a contest." },
    { id: "daredevil", name: "Daredevil", desc: "Take a Level 3 contest." },
    { id: "contestant", name: "Contestant", desc: "Get promoted to Silver." },
    { id: "midas", name: "Midas Touch", desc: "Get promoted to Gold." },
    { id: "perfect", name: "Perfect Score", desc: "Complete a contest with a perfect score." },
    { id: "l3a", name: "Level 3 I", desc: "Complete every Level 3 contest in a Silver or higher arena." },
    { id: "l3b", name: "Level 3 II", desc: "Complete every Level 3 contest in a Gold or higher arena." },
    { id: "l3c", name: "Level 3 III", desc: "Complete every Level 3 contest in a Crystal or higher arena." },
    { id: "architect", name: "Architect", desc: "Play a game of Meteor Showdown." },
    { id: "protector", name: "Protector", desc: "Survive every wave of Meteor Showdown." },
    { id: "dragon", name: "Dragon Quest", desc: "Play a game of Dragon Hunter." },
    { id: "dragonhunter", name: "Dragon Hunter", desc: "Defeat every dragon in Dragon Hunter." },
    { id: "show", name: "Welcome to the Show", desc: "Answer 10 bonus round questions." },
    { id: "green", name: "As Green as the Grass", desc: "Get promoted to Emerald." },
    { id: "streak1", name: "Streak 1", desc: "Answer 10 questions correctly in a row." },
    { id: "streak2", name: "Streak 2", desc: "Answer 50 questions correctly in a row." },
    { id: "streak3", name: "Streak 3", desc: "Answer 100 questions correctly in a row." },
    { id: "purple", name: "Purple Grass", desc: "Get promoted twice within 36 hours from an Emerald or higher arena." },
    { id: "diamond", name: "Shine Bright Like a Diamond", desc: "Get promoted to Diamond." },
    { id: "finnmatch", name: "Finn's Match", desc: "Play Finn in the Diamond championship final." },
    { id: "bee1", name: "Busy Bee I", desc: "Complete 200 problems in a week." },
    { id: "bee2", name: "Busy Bee II", desc: "Complete 400 problems in a week." },
    { id: "bee3", name: "Busy Bee III", desc: "Complete 600 problems in a week." },
    { id: "built", name: "Built Different", desc: "Beat Finn." },
    // secret
    { id: "quit", name: "Did You Quit?", desc: "Reach the Diamond arena, then get sent all the way back to Bronze.", secret: true },
    { id: "soclose", name: "So Close, Yet So Far", desc: "Lose to Finn in the Diamond final.", secret: true },
    { id: "luck", name: "Was It Just Luck?", desc: "Get swept 5–0 by Finn in the Diamond final.", secret: true },
    { id: "revenge", name: "Finn's Revenge", desc: "Lose to Finn in a Diamond final rematch.", secret: true },
  ];
  const ACH_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
  const defaultAch = () => ({ unlocked: {}, streak: 0, bestStreak: 0, bonusAnswered: 0, problemsByDay: {}, promotions: [], reachedDiamond: false });
  let ach = loadAch();

  function loadAch() {
    try {
      const saved = JSON.parse(localStorage.getItem(ACH_KEY));
      if (saved && typeof saved === "object") return { ...defaultAch(), ...saved };
    } catch {}
    return defaultAch();
  }
  function saveAch() {
    try { localStorage.setItem(ACH_KEY, JSON.stringify(ach)); } catch {}
    schedulePush();
  }
  function unlock(id) {
    if (ach.unlocked[id]) return;
    ach.unlocked[id] = Date.now();
    saveAch();
    toast(`🏆 Achievement unlocked: ${ACH_BY_ID[id].name}`);
  }
  function toast(text) {
    let box = document.getElementById("toasts");
    if (!box) { box = document.createElement("div"); box.id = "toasts"; document.body.appendChild(box); }
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = text;
    box.appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 400); }, 4000);
  }
  // Correct-answer streak: every correct submission adds one; a wrong answer, give-up or skip resets it.
  function streakHit() {
    ach.streak += 1;
    if (ach.streak > ach.bestStreak) ach.bestStreak = ach.streak;
    if (ach.streak >= 10) unlock("streak1");
    if (ach.streak >= 50) unlock("streak2");
    if (ach.streak >= 100) unlock("streak3");
    saveAch();
  }
  function streakBreak() {
    if (ach.streak) { ach.streak = 0; saveAch(); }
  }
  // Problems completed, kept per day for the rolling 7-day Busy Bee count.
  const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
  function problemsThisWeek() {
    const cutoff = Date.now() - 7 * 864e5;
    return Object.entries(ach.problemsByDay).reduce((t, [k, n]) => (new Date(k).getTime() >= cutoff ? t + n : t), 0);
  }
  function problemDone() {
    const k = dayKey();
    ach.problemsByDay[k] = (ach.problemsByDay[k] || 0) + 1;
    for (const old of Object.keys(ach.problemsByDay)) if (new Date(old).getTime() < Date.now() - 8 * 864e5) delete ach.problemsByDay[old];
    const n = problemsThisWeek();
    if (n >= 200) unlock("bee1");
    if (n >= 400) unlock("bee2");
    if (n >= 600) unlock("bee3");
    saveAch();
  }
  // Called right after state.tierIndex has been incremented.
  function recordPromotion() {
    const to = state.tierIndex, now = Date.now();
    ach.promotions.push({ from: to - 1, to, at: now });
    ach.promotions = ach.promotions.filter((p) => now - p.at < 40 * 3600e3);
    const name = CHAIN[to];
    if (name === "Silver") unlock("contestant");
    if (name === "Gold") unlock("midas");
    if (name === "Emerald") unlock("green");
    if (name === "Diamond") { ach.reachedDiamond = true; unlock("diamond"); }
    const emeraldIdx = CHAIN.indexOf("Emerald");
    const recent = ach.promotions.filter((p) => p.from >= emeraldIdx && now - p.at <= 36 * 3600e3);
    if (recent.length >= 2) unlock("purple");
    saveAch();
  }
  function checkLevel3Sets() {
    const t = tier();
    if (!t || t.tournament) return;
    const all = t.stadiums.every((s) => state.results[levelId(s, s.levels[2])]);
    if (!all) return;
    if (state.tierIndex >= CHAIN.indexOf("Silver")) unlock("l3a");
    if (state.tierIndex >= CHAIN.indexOf("Gold")) unlock("l3b");
    if (state.tierIndex >= CHAIN.indexOf("Crystal")) unlock("l3c");
  }
  function achButton() {
    const n = Object.keys(ach.unlocked).length;
    return `<button class="btn sm secondary" data-achievements title="Achievements">🏆 ${n}/${ACHIEVEMENTS.length}</button>`;
  }
  function achievementsScreen(back) {
    const fmtDate = (ts) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const row = (a) => {
      const ts = ach.unlocked[a.id];
      const hidden = a.secret && !ts;
      return `<div class="ach ${ts ? "unlocked" : ""}">
        <div class="ach-icon">${ts ? "🏆" : a.secret ? "❔" : "🔒"}</div>
        <div>
          <div class="ach-name">${hidden ? "???" : esc(a.name)}</div>
          <div class="small muted">${hidden ? "Secret achievement. Keep playing to find out." : esc(a.desc)}${a.soon && !ts ? " (minigame coming soon)" : ""}</div>
        </div>
        <div class="small muted ach-date">${ts ? fmtDate(ts) : ""}</div>
      </div>`;
    };
    const normal = ACHIEVEMENTS.filter((a) => !a.secret);
    const secret = ACHIEVEMENTS.filter((a) => a.secret);
    const n = Object.keys(ach.unlocked).length;
    show(`<main class="screen">${bar("Achievements")}
      <div class="content">
        <h2>Achievements <span class="muted" style="font-weight:500;font-size:1rem">${n} / ${ACHIEVEMENTS.length}</span></h2>
        <div class="stats">
          <div class="stat"><div class="stat-n">${ach.streak}</div><div class="small muted">current streak</div></div>
          <div class="stat"><div class="stat-n">${ach.bestStreak}</div><div class="small muted">best streak</div></div>
          <div class="stat"><div class="stat-n">${problemsThisWeek()}</div><div class="small muted">problems this week</div></div>
          <div class="stat"><div class="stat-n">${ach.bonusAnswered}</div><div class="small muted">bonus answers</div></div>
        </div>
        ${normal.map(row).join("")}
        <h3 style="margin-top:1.5rem">Secret achievements</h3>
        ${secret.map(row).join("")}
      </div>
      <div class="footer between">
        <button class="btn link" data-reset-ach>Reset achievements</button>
        <button class="btn secondary" data-back>Back</button>
      </div>
    </main>`);
    on("[data-back]", "click", () => back());
    on("[data-reset-ach]", "click", async () => {
      if (await askConfirm("Reset all achievements and stats?")) { ach = defaultAch(); saveAch(); achievementsScreen(back); }
    });
  }

  // ---- state ---------------------------------------------------------------
  const defaultState = () => ({
    playerName: "Player",
    admin: { infiniteXp: false },
    dragon: { owned: [], team: [], defeated: [] },
    meteor: { played: 0, wins: 0 },
    mmc: { bucks: 0, exams: {} },   // MBucks balance + per-exam formal history
    avatar: { owned: [], equipped: { ...AVATAR.defaults } },
    tierIndex: 0,
    xp: 0,
    results: {},                 // contestId -> { earned, total, marks, wrong, bonus }
    lessons: {},                 // "Tier:stadiumId" -> true once its lesson has been read
    guides: {},                  // "subjectId:L1" -> true once that handbook guide is finished
    introDone: false,
    coronationLastAttempt: null, // timestamp (ms) of the last Coronation entry
    diamond: { active: false, round: 0, opponent: null },
    champion: false,
    titles: 0,
    finnRecord: { wins: 0, losses: 0 },
  });

  let state = loadState();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === "object") return { ...defaultState(), ...saved };
    } catch {}
    return defaultState();
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    schedulePush();
  }
  function resetProgress() {
    if (ach.reachedDiamond) unlock("quit"); // reached Diamond, now back to Bronze
    state = defaultState();
    saveState();
    welcome();
  }
  async function confirmReset() {
    if (await askConfirm("Reset all progress? Achievements are kept.")) resetProgress();
  }

  // ---- helpers -------------------------------------------------------------
  const app = document.getElementById("app");
  let activeTimer = null; // interval used by tournament matches
  const tierName = () => CHAIN[state.tierIndex] || "Beyond";
  const nextTierName = () => CHAIN[state.tierIndex + 1] || null;
  const tier = () => GAME_DATA.tiers[tierName()] || null;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const normalize = (s) => String(s).toLowerCase()
    .replace(/\s+/g, "").replace(/π/g, "pi").replace(/√/g, "sqrt").replace(/²/g, "^2").replace(/³/g, "^3")
    .replace(/\*\*/g, "^").replace(/[−–]/g, "-").replace(/×/g, "*").replace(/⟨/g, "<").replace(/⟩/g, ">");
  const isCorrect = (q, value) => q.a.map(normalize).includes(normalize(value));
  const fmtXp = (n) => Number(n).toLocaleString("en-US");
  // Admin hacks: any username that starts with this code unlocks the Admin panel.
  const ADMIN_PREFIX = "AY1234567YA";
  const hasAdminPrefix = () => String(state.playerName || "").startsWith(ADMIN_PREFIX);
  const isAdmin = () => hasAdminPrefix() || !!state.serverAdmin;
  const displayName = () => (hasAdminPrefix() ? state.playerName.slice(ADMIN_PREFIX.length).trim() || "Admin" : state.playerName);
  const infiniteXp = () => isAdmin() && !!(state.admin && state.admin.infiniteXp);
  const xpText = () => (infiniteXp() ? "∞" : fmtXp(state.xp));
  // Champions (beat Finn) roam freely: any tier, replayable contests, no XP resets.
  const freeRoam = () => !!state.champion;
  const totalPts = (qs) => qs.reduce((t, q) => t + q.points, 0);
  const levelId = (stadium, level) => `${tierName()}:${stadium.id}:L${level.level}`;
  const coronationId = () => `${tierName()}:coronation`;
  const levelXp = (l) => l.count * l.points;
  const buildQuestions = (make, count, points) => Array.from({ length: count }, () => ({ ...make(), points }));

  function show(html) {
    if (activeTimer) { clearInterval(activeTimer); activeTimer = null; }
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function on(selector, event, handler) {
    app.querySelectorAll(selector).forEach((el) => el.addEventListener(event, handler));
  }
  // In-app replacement for window.confirm(): some browsers/embedded webviews silently
  // suppress native confirm() dialogs (it just returns false), which made every button
  // gated behind one look broken. This renders its own overlay instead.
  function askConfirm(message) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "confirm-overlay";
      overlay.innerHTML = `<div class="confirm-box" role="alertdialog" aria-modal="true">
        <p>${esc(message)}</p>
        <div class="confirm-actions">
          <button class="btn secondary" data-no>Cancel</button>
          <button class="btn" data-yes>OK</button>
        </div>
      </div>`;
      document.body.appendChild(overlay);
      const done = (v) => { overlay.remove(); resolve(v); };
      overlay.querySelector("[data-yes]").addEventListener("click", () => done(true));
      overlay.querySelector("[data-no]").addEventListener("click", () => done(false));
      overlay.addEventListener("click", (e) => { if (e.target === overlay) done(false); });
      overlay.querySelector("[data-yes]").focus();
    });
  }
  function bar(sub) {
    return `<header class="bar">
      <div><strong>M Games</strong>${sub ? ` · ${esc(sub)}` : ""}</div>
      <div class="xp">${esc(displayName())}${isAdmin() ? " ⚙" : ""} · ${esc(tierName())} tier · ${xpText()} XP</div>
    </header>`;
  }
  function avatar() {
    return GUIDE.image
      ? `<img class="avatar" src="${esc(GUIDE.image)}" alt="">`
      : `<div class="avatar" aria-hidden="true">${esc(GUIDE.name[0])}</div>`;
  }
  function finn(text) {
    return `<div class="finn">
      ${avatar()}
      <div><div class="name">${esc(GUIDE.name)}</div><p id="finn-text">${esc(text)}</p></div>
    </div>`;
  }
  // Finn alone on screen (intro, tour, promotion): show the wide shot above his dialogue.
  function finnSolo(text) {
    const portrait = GUIDE.portrait ? `<img class="finn-portrait" src="${esc(GUIDE.portrait)}" alt="${esc(GUIDE.name)}">` : "";
    return portrait + finn(text);
  }
  function markEl(status) {
    const symbol = { open: "·", green: "✓", yellow: "✓", red: "✗", purple: "✗" }[status];
    const label = {
      open: "Not answered yet",
      green: "Right on 1st try",
      yellow: "Right on 2nd try",
      red: "Wrong once, 1 try left",
      purple: "Wrong on both tries",
    }[status];
    return `<span class="mark ${status}" title="${label}" aria-label="${label}">${symbol}</span>`;
  }
  const legend = () => `<div class="legend">
    <span>${markEl("green")} Right on 1st try · full points</span>
    <span>${markEl("yellow")} Right on 2nd try · half points</span>
    <span>${markEl("red")} Wrong once · 1 try left</span>
    <span>${markEl("purple")} Wrong on both tries</span>
  </div>`;
  function profileCard() {
    return `<button class="profile" data-profile title="Your profile and the player directory">
      ${myAvatar("xs")}
      <span class="ptext">
        <span class="pname">${esc(displayName())}${isAdmin() ? " ⚙" : ""}${state.champion ? " 👑" : ""}</span>
        <span class="pmeta">${esc(tierName())} tier · ${xpText()} XP</span>
      </span>
    </button>`;
  }
  function themeStyle(t) {
    const [a, b, c] = t.theme || ["#ffd1e8", "#ff8fc8", "#2ea86a"];
    return `style="--p1:${a};--p2:${b};--p3:${c}"`;
  }

  // Coronation gate: enough XP, and outside the cooldown window.
  function coronationStatus() {
    const c = tier().coronation;
    const hasXp = infiniteXp() || state.xp >= c.xpRequired;
    const last = state.coronationLastAttempt;
    const msLeft = last ? last + c.cooldownHours * 3600e3 - Date.now() : 0;
    return { hasXp, coolingDown: msLeft > 0, msLeft, open: hasXp && msLeft <= 0 };
  }
  function fmtLeft(ms) {
    const totalMin = Math.ceil(ms / 60e3);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  // ---- 0. Project M: the front door ----------------------------------------
  // Everything under the Project M umbrella lives here. The M Games is the first
  // entry and the only one with anything behind it so far; the handbook is a
  // placeholder waiting to be written.
  const PROJECT_M = [
    {
      id: "games",
      icon: "🎮",
      name: "The M Games",
      blurb: "The tiered maths contest, Bronze through Diamond. Beat Finn Reaper, take the crown, and run the place.",
      action: "Play",
      open: () => welcome(),
    },
    {
      id: "handbook",
      icon: "📕",
      name: "M Games Player Handbook",
      blurb: "A map of every subject in the games, and a written guide to all 96 levels — what each one leads to, and what you need before you can read it.",
      action: "Open",
      open: () => handbook(),
    },
  ];

  function projectM() {
    show(`<main class="screen">
      <h1 class="title">Project M</h1>
      <p class="hub-sub">Pick where you're going.</p>
      <div class="hub">
        ${PROJECT_M.map((entry) => `<div class="hub-card${entry.empty ? " empty" : ""}">
          <div class="hub-icon" aria-hidden="true">${entry.icon}</div>
          <div class="hub-body">
            <h2>${esc(entry.name)}</h2>
            <p class="small muted">${esc(entry.blurb)}</p>
          </div>
          <button class="btn" data-open="${entry.id}">${esc(entry.action)}</button>
        </div>`).join("")}
      </div>
      <div class="footer between">
        ${API.me
          ? `<span class="small muted">Signed in as <strong>${esc(API.me.name)}</strong> · <a class="link-btn" href="/logout">Sign out</a></span>`
          : API.available ? `<a class="btn secondary" href="/login">${API.google ? "Sign in with Google" : "Sign in"}</a>` : "<span></span>"}
      </div>
    </main>`);
    on("[data-open]", "click", (e) => {
      const entry = PROJECT_M.find((x) => x.id === e.currentTarget.dataset.open);
      if (entry) entry.open();
    });
  }

  // ---- the Player Handbook: a map of every subject --------------------------
  // One box per subject, laid out a tier to a row. Solid lines run from a subject
  // to the ones that lean on it; inside each box sit its three levels, numbered
  // in order but readable in any order. Every level has a written guide behind
  // it, in guides.js.
  const HB_STATUS = {
    locked: "prerequisites not met",
    open: "ready to read",
    done: "complete",
  };
  const HB = {
    boxW: 160, boxH: 104,     // one subject
    colGap: 44, rowGap: 80,
    gutter: 100,              // room on the left for the tier name
    top: 34, pad: 24,
  };
  const hbX = (col) => HB.gutter + col * (HB.boxW + HB.colGap);
  const hbY = (row) => HB.top + row * (HB.boxH + HB.rowGap);

  // Subject names run to three words; wrap them rather than letting them spill.
  function wrapLabel(text, perLine = 18, maxLines = 3) {
    const lines = [];
    let line = "";
    for (const word of String(text).split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > perLine && line) { lines.push(line); line = word; } else { line = next; }
      if (lines.length === maxLines) break;
    }
    if (line && lines.length < maxLines) lines.push(line);
    return lines;
  }

  // ---- guide progress -------------------------------------------------------
  // A handbook level is a 2-4 page guide to read, not a contest to win, so it is
  // tracked apart from the game's own results: finishing a guide is reading, not
  // scoring, and promotion never wipes it.
  const guideKey = (subjectId, n) => `${subjectId}:L${n}`;
  const guideDone = (subjectId, n) => !!(state.guides || {})[guideKey(subjectId, n)];
  function setGuideDone(subjectId, n, done) {
    if (!state.guides) state.guides = {};
    if (done) state.guides[guideKey(subjectId, n)] = true;
    else delete state.guides[guideKey(subjectId, n)];
    saveState();
  }
  // Any level at all: this is what turns a subject's outgoing lines green.
  const guideStarted = (subject) =>
    !!subject && Array.from({ length: subject.levels }, (_, i) => i + 1).some((n) => guideDone(subject.id, n));

  // Prerequisites are matched level for level: level 2 of a subject needs level 2
  // of everything it comes after, not merely level 1. Finishing Linear Equations
  // level 1 opens Factoring level 1 and nothing beyond it.
  //
  // A subject's own levels are not a chain: each guide stands on its own, so
  // level 2 can be read without level 1. The only thing gating a level is the
  // same level of the subjects it comes after.
  function hbBlockers(subject, n, at) {
    return subject.prereqs
      .filter((id) => at[id] && !guideDone(id, n))
      .map((id) => `${at[id].name} level ${n}`);
  }

  // done (green) · open (yellow) · locked (red)
  function hbLevelStatus(subject, n, at) {
    if (guideDone(subject.id, n)) return "done";
    return hbBlockers(subject, n, at).length ? "locked" : "open";
  }

  // Every subject with the tier it sits on and where its box goes.  // Every subject with the tier it sits on and where its box goes.
  function handbookSubjects() {
    const out = [];
    CHAIN.forEach((tierName) => {
      const t = GAME_DATA.tiers[tierName];
      if (!t || t.tournament || !t.stadiums.length) return;
      const row = out.length ? out[out.length - 1].row + 1 : 0;
      t.stadiums.forEach((s, col) => {
        out.push({ id: s.id, name: s.name, tier: tierName, theme: t.theme, levels: s.levels.length,
                   prereqs: s.prereqs || [], row, col });
      });
    });
    return out;
  }

  function handbookMap() {
    const subjects = handbookSubjects();
    const at = Object.fromEntries(subjects.map((s) => [s.id, s]));
    const rows = subjects.length ? subjects[subjects.length - 1].row + 1 : 0;
    const cols = Math.max(...subjects.map((s) => s.col)) + 1;
    const width = HB.gutter + cols * HB.boxW + (cols - 1) * HB.colGap + HB.pad;
    const height = hbY(rows - 1) + HB.boxH + HB.pad + 10;

    // Prerequisite lines. A link down the tiers drops out of the bottom of one
    // box into the top of the next; a link across a tier loops under the row,
    // so it never runs through the boxes sitting between them.
    const edges = subjects.flatMap((s) => s.prereqs.map((id) => {
      const from = at[id];
      if (!from) return "";
      // Every line leaving a subject goes green as soon as any one of its levels
      // is finished, so you can see at a glance what you have opened up.
      const cls = `hb-edge${guideStarted(from) ? " done" : ""}`;
      const fx = hbX(from.col) + HB.boxW / 2;
      const tx = hbX(s.col) + HB.boxW / 2;
      if (from.row === s.row) {
        const y = hbY(s.row) + HB.boxH;
        return `<path class="${cls}" d="M ${fx} ${y} C ${fx} ${y + 44}, ${tx} ${y + 44}, ${tx} ${y}"/>`;
      }
      const fy = hbY(from.row) + HB.boxH;
      const ty = hbY(s.row);
      const bend = Math.min(46, (ty - fy) / 2);
      return `<path class="${cls}" d="M ${fx} ${fy} C ${fx} ${fy + bend}, ${tx} ${ty - bend}, ${tx} ${ty}"/>`;
    })).join("");

    const tierLabels = subjects.filter((s) => s.col === 0).map((s) => `
      <text class="hb-tier" x="${HB.gutter - 20}" y="${hbY(s.row) + HB.boxH / 2}"
            fill="${s.theme[2]}">${esc(s.tier)}</text>`).join("");

    const boxes = subjects.map((s) => {
      const x = hbX(s.col);
      const y = hbY(s.row);
      const lines = wrapLabel(s.name);
      // The three levels, chained left to right along the bottom of the box.
      const chipW = 22, chipH = 16, chipGap = 14;
      const chainW = s.levels * chipW + (s.levels - 1) * chipGap;
      const cx0 = x + (HB.boxW - chainW) / 2;
      const cy = y + HB.boxH - 30;
      const chain = Array.from({ length: s.levels }, (_, i) => {
        const cx = cx0 + i * (chipW + chipGap);
        const status = hbLevelStatus(s, i + 1, at);
        const link = i === 0 ? "" :
          `<line class="hb-level-link" x1="${cx - chipGap}" y1="${cy + chipH / 2}" x2="${cx}" y2="${cy + chipH / 2}"/>`;
        return `${link}<rect class="hb-level ${status}" x="${cx}" y="${cy}" width="${chipW}" height="${chipH}" rx="3">
            <title>Level ${i + 1}: ${HB_STATUS[status]}</title>
          </rect>
          <text class="hb-level-n ${status}" x="${cx + chipW / 2}" y="${cy + chipH / 2 + 4}">${i + 1}</text>`;
      }).join("");
      return `<g class="hb-node" data-subject="${esc(s.id)}" tabindex="0" role="button"
                 aria-label="${esc(s.name)}, ${esc(s.tier)} tier. ${Array.from({ length: s.levels }, (_, i) =>
                   `Level ${i + 1} ${HB_STATUS[hbLevelStatus(s, i + 1, at)]}`).join(", ")}.">
        <rect class="hb-box" x="${x}" y="${y}" width="${HB.boxW}" height="${HB.boxH}" rx="10"
              style="--tier:${s.theme[2]}"/>
        ${lines.map((line, i) => `<text class="hb-name" x="${x + HB.boxW / 2}" y="${y + 26 + i * 15}">${esc(line)}</text>`).join("")}
        ${chain}
      </g>`;
    }).join("");

    return `<svg class="hb-map" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"
                 role="img" aria-label="Map of every M Games subject and what it depends on">
      <g class="hb-edges">${edges}</g>${tierLabels}${boxes}
    </svg>`;
  }

  function handbook() {
    show(`<main class="screen">${bar("Player handbook")}
      <div class="content wide">
        <h2>📕 M Games Player Handbook</h2>
        <p class="small muted">Every subject in the M Games, a tier to a row. Each numbered square is a
          level — a 2–4 page guide to read. Prerequisites match level for level: finishing level 1 of a
          subject opens level 1 of everything it leads to and nothing further, and level 2 of a subject
          needs level 2 of everything it comes after. A subject's own levels are independent, so level 2
          can be read without level 1.</p>
        <div class="hb-legend">
          <span><svg width="34" height="10" aria-hidden="true"><path class="hb-edge" d="M 1 9 C 12 9, 22 1, 33 1"/></svg> leads to</span>
          <span><svg width="34" height="10" aria-hidden="true"><path class="hb-edge done" d="M 1 9 C 12 9, 22 1, 33 1"/></svg> opened up</span>
          <span><svg width="46" height="16" aria-hidden="true"><rect class="hb-level" x="1" y="0" width="18" height="15" rx="3"/><line class="hb-level-link" x1="19" y1="8" x2="27" y2="8"/><rect class="hb-level" x="27" y="0" width="18" height="15" rx="3"/></svg> level 1 → 2 → 3</span>
          <span><span class="hb-swatch locked"></span> prerequisites not met</span>
          <span><span class="hb-swatch open"></span> ready to read</span>
          <span><span class="hb-swatch done"></span> complete</span>
        </div>
        <div class="hb-scroll">${handbookMap()}</div>
      </div>
      <div class="footer"><button class="btn secondary" data-back>Back to Project M</button></div>
    </main>`);
    on("[data-back]", "click", projectM);
    on("[data-subject]", "click", (e) => handbookSubject(e.currentTarget.dataset.subject));
    on("[data-subject]", "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handbookSubject(e.currentTarget.dataset.subject); }
    });
  }

  // The stadium that teaches this subject, if the player is standing on its tier.
  // Handbook and game are two views of the same 32 subjects, so each should be
  // able to reach the other; you can only walk into a stadium on your own planet.
  function stadiumFor(subject) {
    if (!state.introDone || !subject || subject.tier !== tierName()) return null;
    const t = tier();
    return (t && t.stadiums.find((x) => x.id === subject.id)) || null;
  }

  // One subject's page: what it comes after, what it leads to, and its levels.
  // `back` is where the Back button goes -- the map by default, but the lesson
  // or the stadium when the player arrived from inside the game.
  function handbookSubject(id, back) {
    const subjects = handbookSubjects();
    const s = subjects.find((x) => x.id === id);
    if (!s) return handbook();
    const at = Object.fromEntries(subjects.map((x) => [x.id, x]));
    const comesAfter = s.prereqs.map((p) => at[p]).filter(Boolean);
    const leadsTo = subjects.filter((x) => x.prereqs.includes(id));

    // How far through a related subject you are, level by level -- which is what
    // decides whether this subject's matching level is open.
    const levelDots = (x) => Array.from({ length: x.levels }, (_, i) =>
      `<span class="hb-dot ${guideDone(x.id, i + 1) ? "done" : ""}" title="Level ${i + 1}${
        guideDone(x.id, i + 1) ? " finished" : " not finished"}">${i + 1}</span>`).join("");

    const list = (items) => (items.length
      ? `<ul class="hb-list">${items.map((x) => `<li>
          <button class="link-btn" data-goto="${esc(x.id)}">${esc(x.name)}</button>
          <span class="small muted">· ${esc(x.tier)}</span>
          <span class="hb-dots">${levelDots(x)}</span>
        </li>`).join("")}</ul>`
      : `<p class="small muted">Nothing — this is a starting point.</p>`);

    show(`<main class="screen">${bar("Player handbook")}
      <div class="content">
        <h2>${esc(s.name)}</h2>
        <p class="small muted">${esc(s.tier)} tier · ${s.levels} levels</p>
        <div class="hb-block"><h3>Comes after</h3>${list(comesAfter)}</div>
        <div class="hb-block"><h3>Leads to</h3>${list(leadsTo)}</div>
        <div class="hb-block"><h3>Levels</h3>
          <ul class="hb-levels">${Array.from({ length: s.levels }, (_, i) => {
            const n = i + 1;
            const status = hbLevelStatus(s, n, at);
            const blockers = hbBlockers(s, n, at);
            return `<li class="hb-level-row">
              <span class="hb-swatch ${status}"></span>
              <span class="hb-level-body">
                <strong>Level ${n}</strong>
                <span class="small muted">— ${esc(HB_STATUS[status])}${
                  blockers.length ? `. Needs ${esc(blockers.join(", "))}.` : ""}</span>
              </span>
              <button class="btn sm ${status === "locked" ? "secondary" : ""}" data-guide="${n}"
                ${status === "locked" ? "disabled" : ""}>${
                  !guideFor(s.id, n) ? "Not written" : status === "done" ? "Reread" : "Read guide"}</button>
            </li>`;
          }).join("")}</ul>
        </div>
      </div>
      <div class="footer between">
        <button class="btn secondary" data-back>${back ? "Back" : "Back to the map"}</button>
        ${stadiumFor(s) ? `<button class="btn" data-play>🎮 Play the ${esc(s.name)} stadium</button>`
          : `<span class="small muted">Played in the ${esc(s.tier)} tier.</span>`}
      </div>
    </main>`);
    on("[data-back]", "click", () => (back ? back() : handbook()));
    on("[data-goto]", "click", (e) => handbookSubject(e.currentTarget.dataset.goto, back));
    on("[data-guide]", "click", (e) => handbookGuide(id, Number(e.currentTarget.dataset.guide), back));
    on("[data-play]", "click", () => { const st = stadiumFor(s); if (st) stadium(st); });
  }

  // The written guide for one level, when there is one. Subjects still waiting to
  // be written fall back to a placeholder, so the map works either way.
  const guideFor = (subjectId, n) => (typeof GUIDES === "object" && GUIDES[subjectId] || [])[n - 1] || null;

  function guideBody(s, n) {
    const g = guideFor(s.id, n);
    if (!g) {
      return `<div class="hb-guide">
        <p>This guide hasn't been written yet.</p>
        <p class="small muted">Two to four pages on ${esc(s.name.toLowerCase())} at level ${n}.</p>
      </div>`;
    }
    const example = (eg) => (eg ? `<div class="guide-eg">
      <p class="eg-q">${esc(eg.q)}</p>
      <ol>${eg.steps.map((step) => `<li>${esc(step)}</li>`).join("")}</ol>
      <p class="eg-a">Answer: ${esc(eg.a)}</p>
    </div>` : "");

    return `<h3 class="guide-title">${esc(g.title)}</h3>
      <p class="guide-intro">${esc(g.intro)}</p>
      ${g.sections.map((sec) => `<section class="guide-section">
        <h3>${esc(sec.heading)}</h3>
        ${sec.paras.map((para) => `<p>${esc(para)}</p>`).join("")}
        ${example(sec.example)}
      </section>`).join("")}
      ${g.mistakes && g.mistakes.length ? `<div class="guide-box warn">
        <h3>Where it goes wrong</h3>
        <ul>${g.mistakes.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
      </div>` : ""}
      ${g.recap && g.recap.length ? `<div class="guide-box recap">
        <h3>In short</h3>
        <ul>${g.recap.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      </div>` : ""}
      ${g.practice && g.practice.length ? `<div class="guide-box guide-practice">
        <h3>Try these</h3>
        <ol>${g.practice.map((p) => `<li>${esc(p.q)} —
          <details><summary>show answer</summary><span class="ans">${esc(p.a)}</span></details>
        </li>`).join("")}</ol>
      </div>` : ""}`;
  }

  // One level: the guide itself. There is nothing written in it yet, but marking
  // it finished is what opens the matching level of everything downstream, so
  // the button is real even while the pages are blank.
  function handbookGuide(id, n, back) {
    const subjects = handbookSubjects();
    const s = subjects.find((x) => x.id === id);
    if (!s) return handbook();
    const at = Object.fromEntries(subjects.map((x) => [x.id, x]));
    const status = hbLevelStatus(s, n, at);
    const blockers = hbBlockers(s, n, at);
    const opens = subjects.filter((x) => x.prereqs.includes(id));

    show(`<main class="screen">${bar(`${s.name} · Level ${n}`)}
      <div class="content">
        <h2>${esc(s.name)} — Level ${n}</h2>
        <p class="small muted">${esc(s.tier)} tier · guide ${n} of ${s.levels} · ${esc(HB_STATUS[status])}</p>
        ${status === "locked"
          ? `<p class="notice-light">Read ${esc(blockers.length > 1
              ? `${blockers.slice(0, -1).join(", ")} and ${blockers[blockers.length - 1]}`
              : blockers[0])} first.</p>`
          : ""}
        ${guideBody(s, n)}
        ${opens.length ? `<p class="small muted">Finishing this opens level ${n} of ${
          esc(opens.map((x) => x.name).join(", "))}.</p>` : ""}
      </div>
      <div class="footer between">
        <button class="btn secondary" data-back>Back to ${esc(s.name)}</button>
        ${stadiumFor(s) ? `<button class="btn secondary" data-play>🎮 Play the stadium</button>` : ""}
        ${status === "locked" ? ""
          : status === "done"
            ? `<button class="btn secondary" data-unmark>Mark as unfinished</button>`
            : `<button class="btn" data-mark>I've finished this guide</button>`}
      </div>
    </main>`);
    on("[data-back]", "click", () => handbookSubject(id, back));
    on("[data-play]", "click", () => { const st = stadiumFor(s); if (st) stadium(st); });
    on("[data-mark]", "click", () => { setGuideDone(id, n, true); handbookSubject(id, back); });
    on("[data-unmark]", "click", async () => {
      // Un-finishing can strand levels downstream, so make it a deliberate act.
      if (await askConfirm("Mark this guide unfinished? Anything it opened up will lock again.")) {
        setGuideDone(id, n, false);
        handbookSubject(id, back);
      }
    });
  }

  // ---- 1. welcome + intro video --------------------------------------------
  function welcome() {
    show(`<main class="screen">
      <h1 class="title">Welcome to the M Games</h1>
      <div class="video-area">
        <video class="video-slot" controls preload="metadata" playsinline
               src="assets/intro.mp4" aria-label="M Games intro"></video>
      </div>
      ${!API.me && /[?&]signin=retry\b/.test(location.search)
        ? `<div class="name-row"><span class="small muted">That sign-in didn't go through — it may have expired. Try again.</span></div>`
        : ""}
      ${API.me
        ? `<div class="name-row"><span class="small muted">Signed in as <strong>${esc(API.me.name)}</strong>${API.me.email ? ` · ${esc(API.me.email)}` : ""} · <a class="link-btn" href="/logout">Sign out</a></span></div>`
        : `<form class="name-row" data-name-form>
        <label class="small muted" for="player-name">Your name</label>
        <input id="player-name" type="text" maxlength="40" autocomplete="off" placeholder="Player" value="${state.playerName === "Player" ? "" : esc(state.playerName)}">
        ${API.available ? `<a class="btn secondary sign-in" href="/login">${API.google ? "Sign in with Google" : "Sign in"}</a><span class="small muted">or continue as a guest with the name above</span>` : ""}
      </form>`}
      <div class="footer between">
        <button class="btn secondary" data-project>← Project M</button>
        <button class="btn link" data-reset>Reset progress</button>
        <button class="btn" data-next>Next</button>
      </div>
    </main>`);
    on("[data-project]", "click", projectM);
    const goNext = () => {
      const input = app.querySelector("#player-name");
      if (input) state.playerName = input.value.trim() || "Player";
      saveState();
      unlock("start");
      state.introDone ? planet() : finnIntro();
    };
    on("[data-next]", "click", goNext);
    const nameForm = app.querySelector("[data-name-form]");
    if (nameForm) nameForm.addEventListener("submit", (e) => { e.preventDefault(); goNext(); });
    on("[data-reset]", "click", confirmReset);
  }

  // ---- 2. Finn introduces himself -----------------------------------------
  const introLines = () => [
    `Hey, ${displayName()}! I'm ${GUIDE.name}, your guide to the M Games. Welcome to the world.`,
    "Before you step into a real stadium, let's run a quick demo contest so you know how everything works.",
    "Every question has a box to type your answer in, and you get two tries. Right on the first try is a green check for full points. Right on the second try is a yellow check for half.",
    "Miss once and you'll see a red X, but you still have one try left. Miss twice and it's a purple X. Ready to try it?",
  ];

  function finnIntro(step = 0) {
    const lines = introLines();
    const last = step === lines.length - 1;
    show(`<main class="screen">${bar("Introduction")}
      <div class="content center">${finnSolo(lines[step])}</div>
      <div class="footer">
        <button class="btn" data-next>${last ? "Start the demo contest" : "Continue"}</button>
      </div>
    </main>`);
    on("[data-next]", "click", () => (last ? demoContest() : finnIntro(step + 1)));
  }

  // ---- 3. demo contest (guided) -------------------------------------------
  function demoContest() {
    const d = GAME_DATA.demoContest;
    runContest({
      id: d.id,
      name: d.name,
      questions: buildQuestions(d.make, d.count, d.points),
      guided: true,
      awardsXp: false,
      onFinish: () => systemIntro(),
    });
  }

  // ---- 4. the System --------------------------------------------------------
  function systemIntro() {
    const t = tier();
    const c = t.coronation;
    show(`<main class="screen">${bar("The System")}
      <div class="content">
        ${finn("Nice work. Now let me explain the System of the M Games.")}
        <h2>How the M Games work</h2>
        <ul>
          <li>The Games climb through <strong>${CHAIN.length} tiers</strong>: ${CHAIN.join(" → ")}. You start in <strong>${esc(tierName())}</strong>.</li>
          <li>Each tier lives on a planet with <strong>${t.stadiums.length} stadiums</strong>: ${t.stadiums.map((s) => esc(s.name)).join(", ")}. Every stadium has a Level 1, Level 2, and Level 3 contest, and each tier's topics get harder.</li>
          <li>Every contest has 10 questions and awards <strong>XP</strong>. A green check earns a question's full points and a yellow check earns half. Each tier pays 10× the one before.</li>
          <li>You can only take each contest <strong>once</strong>, so make your tries count.</li>
          <li>A <strong>perfect score</strong> triggers a bonus round: one extra question worth bonus XP.</li>
          <li>The fifth stadium is the <strong>${esc(c.name)}</strong>. You need <strong>${fmtXp(c.xpRequired)} XP</strong> to enter, and you get one shot every <strong>${c.cooldownHours} hours</strong>.</li>
          <li>The Coronation draws ${c.drawLevel2} random Level 2 and ${c.drawLevel3} random Level 3 questions from all stadiums. Get <strong>${c.maxWrong} or fewer wrong</strong> and you're promoted to <strong>${esc(nextTierName() || "the top")}</strong> with fresh XP and new stadiums.</li>
          <li>At the top sits <strong>Diamond</strong>: a 64-player tournament where the final is against me.</li>
        </ul>
        ${legend()}
      </div>
      <div class="footer"><button class="btn" data-next>Tour the stadiums</button></div>
    </main>`);
    on("[data-next]", "click", () => stadiumTour(0));
  }

  // ---- 5. Finn shows the stadiums -----------------------------------------
  function stadiumTour(index) {
    const t = tier();
    if (t.tournament) return diamondIntro(0);
    const stadiums = t.stadiums;
    const isCoronation = index === stadiums.length;
    let text;
    if (!isCoronation) {
      const s = stadiums[index];
      const xp = s.levels.map((l) => `Level ${l.level} pays ${fmtXp(levelXp(l))} XP`).join(", ");
      text = `Stadium ${index + 1} of ${stadiums.length}: the ${s.name} stadium. ${xp}. A perfect contest unlocks a bonus question worth ${fmtXp(s.levels[0].bonus.xp)} XP.`;
    } else {
      const c = t.coronation;
      text = `And finally, the ${c.name}. You need ${fmtXp(c.xpRequired)} XP to enter, and only one attempt every ${c.cooldownHours} hours. It draws ${c.drawLevel2} Level 2 and ${c.drawLevel3} Level 3 questions from all four stadiums. Get ${c.maxWrong} or fewer wrong and you're promoted to ${nextTierName() || "the top"}. Good luck!`;
    }
    show(`<main class="screen">${bar("Stadium tour")}
      <div class="content center">${finnSolo(text)}</div>
      <div class="footer">
        <button class="btn" data-next>${isCoronation ? "Enter Planet " + esc(t.planet) : "Next stadium"}</button>
      </div>
    </main>`);
    on("[data-next]", "click", () => {
      if (isCoronation) {
        state.introDone = true;
        saveState();
        planet();
      } else {
        stadiumTour(index + 1);
      }
    });
  }

  // ---- 6. Planet M: the main screen --------------------------------------
  function planet() {
    const t = tier();
    if (!t) return promoted();
    if (t.tournament) return diamond();
    const c = t.coronation;
    const cs = coronationStatus();
    const coroResult = state.results[coronationId()];

    let coroText;
    if (!cs.hasXp) coroText = `${fmtXp(state.xp)} / ${fmtXp(c.xpRequired)} XP`;
    else if (cs.coolingDown) coroText = `Next try in ${fmtLeft(cs.msLeft)}`;
    else coroText = coroResult ? "Try again" : "Open";

    const doors = t.stadiums.map((s) => {
      const done = s.levels.filter((l) => state.results[levelId(s, l)]).length;
      return `<button class="door-btn" data-stadium="${s.id}">
        <span class="subject">${esc(s.name)}</span>
        <span class="door"><span class="knob"></span></span>
        <span class="progress">${done}/${s.levels.length} done</span>
      </button>`;
    }).join("");

    show(`<main class="screen space">
      <div class="topbar">
        <div class="brand">M Games</div>
        <div class="topbar-right">${adminButton()}${councilButton()}${huntButton()}${travelButton()}<button class="btn sm secondary" data-mmc title="M Math Competition">📋 MMC</button><button class="btn sm secondary" data-contests title="Contests written by other players">📝 Contests</button><button class="btn sm secondary" data-forum title="Discuss problems with other players">💬 Forum</button><button class="btn sm secondary" data-games title="Other games">🎮 Games</button>${achButton()}${profileCard()}</div>
      </div>
      <div class="planet-area">
        <div class="planet" ${themeStyle(t)}>
          <div class="planet-name">${esc(t.planet)}</div>
          <div class="planet-sub">Planet ${esc(t.planet)} · ${esc(tierName())} tier</div>
          ${freeRoam() ? `<div class="ruler">👑 Ruler of the M Games · free roam</div>` : ""}
          <div class="doors">${doors}</div>
          <button class="door-btn coronation-door" data-coronation ${cs.open ? "" : "disabled"}>
            <span class="subject">Coronation</span>
            <span class="door ${cs.open ? "gold" : "locked"}"><span class="knob"></span></span>
            <span class="progress" id="coro-status">${esc(coroText)}</span>
          </button>
        </div>
      </div>
      <div class="footer between">
        <button class="btn link" data-reset>Reset progress</button>
        <button class="btn secondary" data-home>Back to start</button>
      </div>
    </main>`);

    on("[data-stadium]", "click", (e) => {
      const s = t.stadiums.find((x) => x.id === e.currentTarget.dataset.stadium);
      // First time in this stadium, the lesson comes first; after that, straight in.
      if (s.lesson && !lessonSeen(s)) return lessonScreen(s, () => stadium(s));
      stadium(s);
    });
    on("[data-coronation]", "click", playCoronation);
    on("[data-home]", "click", welcome);
    on("[data-reset]", "click", confirmReset);
    on("[data-achievements]", "click", () => achievementsScreen(planet));
    on("[data-admin]", "click", () => adminPanel(planet));
    on("[data-council]", "click", () => councilScreen(planet));
    on("[data-hunt]", "click", () => huntScreen(planet));
    on("[data-games]", "click", () => games(planet));
    on("[data-contests]", "click", () => contestList(planet));
    on("[data-forum]", "click", () => forumScreen(planet));
    on("[data-travel]", "click", () => travel(planet));
    on("[data-profile]", "click", () => profileScreen(planet));
    on("[data-mmc]", "click", () => mmcHall(planet));
  }

  // ---- 7a. the lesson: taught before the stadium opens --------------------------
  // Every stadium has one, written in data.js next to the question generators.
  // The first visit to a stadium goes through it; after that the stadium screen
  // keeps a button to read it again, since nobody wants the same lesson twice.
  const lessonSeen = (s) => !!(state.lessons || {})[`${tierName()}:${s.id}`];
  function markLessonSeen(s) {
    if (!state.lessons) state.lessons = {};
    state.lessons[`${tierName()}:${s.id}`] = true;
    saveState();
  }

  function lessonScreen(s, onDone) {
    const l = s.lesson;
    if (!l) return onDone();
    show(`<main class="screen">${bar(`${s.name} lesson`)}
      <div class="content">
        ${finn(`Before you go in: here's how ${s.name.toLowerCase()} works. Read it once and the contests get a lot easier.`)}
        <h2>📖 ${esc(s.name)}</h2>
        <p class="lesson-idea">${esc(l.idea)}</p>
        <div class="lesson-block">
          <h3>How to do it</h3>
          <ul class="lesson-rules">${l.rules.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
        </div>
        ${l.examples.map((ex, i) => `<div class="lesson-block worked">
          <h3>Worked example${l.examples.length > 1 ? ` ${i + 1}` : ""}</h3>
          <p class="qtext">${esc(ex.q)}</p>
          <ol class="lesson-steps">${ex.steps.map((st) => `<li>${esc(st)}</li>`).join("")}</ol>
          <p class="lesson-answer">Answer: <strong>${esc(ex.a)}</strong></p>
        </div>`).join("")}
        ${l.watch ? `<div class="lesson-watch"><strong>Watch out.</strong> ${esc(l.watch)}</div>` : ""}
      </div>
      <div class="footer between">
        <button class="btn secondary" data-back>Back to Planet ${esc(tier().planet)}</button>
        ${guideFor(s.id, 1) ? `<button class="btn secondary" data-guide>📕 Full guide</button>` : ""}
        <button class="btn" data-go>Into the stadium</button>
      </div>
    </main>`);
    on("[data-go]", "click", () => { markLessonSeen(s); onDone(); });
    on("[data-back]", "click", () => { markLessonSeen(s); planet(); });
    // The lesson is the short version; the handbook holds the long one. Coming
    // back from it returns here rather than dumping the player in the handbook.
    on("[data-guide]", "click", () => handbookSubject(s.id, () => lessonScreen(s, onDone)));
  }

  // ---- 7b. a stadium: pick a level ----------------------------------------------
  function stadium(s) {
    show(`<main class="screen">${bar(s.name)}
      <div class="content">
        <h2>${esc(s.name)} stadium</h2>
        <p class="muted small">Three contests, 10 questions each. Green checks earn full points, yellow checks earn half. One attempt per contest.${s.lesson ? " The lesson is always there to re-read." : ""}</p>
        <div class="levels">${s.levels.map((l) => {
          const r = state.results[levelId(s, l)];
          return `<div class="level">
            <div>
              <strong>Level ${l.level}</strong>
              <div class="small muted">${l.count} questions · ${fmtXp(l.points)} XP each · ${fmtXp(levelXp(l))} XP total · bonus: ${esc(l.bonus.label)} for +${fmtXp(l.bonus.xp)} XP</div>
            </div>
            ${r
              ? `<span class="done">Done · ${fmtXp(r.earned)}/${fmtXp(r.total)} XP${r.bonus ? (r.bonus.correct ? ` · bonus +${fmtXp(r.bonus.xp)}` : " · bonus missed") : ""}</span>${freeRoam() ? `<button class="btn sm secondary" data-level="${l.level}">Play again</button>` : ""}`
              : `<button class="btn sm" data-level="${l.level}">Play</button>${isAdmin() ? `<button class="btn sm secondary" data-skip-level="${l.level}" title="Admin: mark as done with full XP">Skip</button>` : ""}`}
          </div>`;
        }).join("")}</div>
      </div>
      <div class="footer between">
        <button class="btn secondary" data-back>Back to Planet ${esc(tier().planet)}</button>
        ${s.lesson ? `<button class="btn secondary" data-lesson>📖 Read the lesson</button>` : ""}
        ${guideFor(s.id, 1) ? `<button class="btn secondary" data-guide>📕 Full guide</button>` : ""}
      </div>
    </main>`);
    on("[data-lesson]", "click", () => lessonScreen(s, () => stadium(s)));
    on("[data-guide]", "click", () => handbookSubject(s.id, () => stadium(s)));
    on("[data-level]", "click", (e) => playLevel(s, s.levels.find((l) => l.level === Number(e.currentTarget.dataset.level))));
    on("[data-skip-level]", "click", (e) => {
      if (!isAdmin()) return;
      adminCompleteLevel(s, s.levels.find((l) => l.level === Number(e.currentTarget.dataset.skipLevel)));
      stadium(s);
    });
    on("[data-back]", "click", planet);
  }

  function playLevel(s, l) {
    if (state.results[levelId(s, l)] && !freeRoam()) return stadium(s); // no retakes (champions may replay)
    runContest({
      id: levelId(s, l),
      name: `${s.name} · Level ${l.level}`,
      questions: buildQuestions(l.make, l.count, l.points),
      awardsXp: true,
      level: l.level,
      bonus: l.bonus,
      onFinish: () => stadium(s),
    });
  }

  // ---- 8. Coronation Series ----------------------------------------------------
  function drawCoronation() {
    const t = tier();
    const c = t.coronation;
    const qs = [];
    const draw = (lvl, n) => {
      for (let i = 0; i < n; i++) {
        const s = t.stadiums[rnd(0, t.stadiums.length - 1)];
        const l = s.levels.find((x) => x.level === lvl);
        qs.push({ ...l.make(), points: l.points, tag: `${s.name} · Level ${lvl}` });
      }
    };
    draw(2, c.drawLevel2);
    draw(3, c.drawLevel3);
    return qs;
  }

  function playCoronation() {
    const t = tier();
    if (!coronationStatus().open) return planet();
    state.coronationLastAttempt = Date.now(); // the 12-hour clock starts on entry
    saveState();
    runContest({
      id: coronationId(),
      name: t.coronation.name,
      questions: drawCoronation(),
      awardsXp: false,
      isCoronation: true,
      onFinish: (result) => (result.wrong <= t.coronation.maxWrong ? promote() : planet()),
    });
  }

  function promote() {
    state.tierIndex += 1;
    recordPromotion();
    if (!freeRoam()) {
      state.xp = 0;
      state.results = {};
    }
    state.coronationLastAttempt = null;
    saveState();
    promoted();
  }

  function promoted() {
    const next = tier();
    const from = CHAIN[state.tierIndex - 1] || "";
    let text;
    if (!next) text = `You did it! You've been crowned in the ${from} tier. The ${tierName()} tier isn't open yet, so this is the end of the road for now.`;
    else if (next.tournament) text = `You did it! You've been crowned in the ${from} tier. Welcome to ${tierName()}, the top of the M Games. There's only one stadium here, and it's a tournament.`;
    else if (freeRoam()) text = `Crowned in ${from} again, Ruler. Welcome to ${tierName()}: you keep your XP and progress, and every planet stays open.`;
    else text = `You did it! You've been crowned in the ${from} tier. Welcome to ${tierName()}: your XP is reset and brand-new stadiums are waiting.`;
    show(`<main class="screen">${bar("Promotion")}
      <div class="content center">${finnSolo(text)}</div>
      <div class="footer between">
        <button class="btn link" data-reset>Reset progress</button>
        ${next ? `<button class="btn" data-next>${next.tournament ? "Enter the Arena" : "See the new stadiums"}</button>` : ""}
      </div>
    </main>`);
    on("[data-next]", "click", () => stadiumTour(0));
    on("[data-reset]", "click", confirmReset);
  }

  // ==========================================================================
  // ADMIN HACKS — only for usernames starting with ADMIN_PREFIX
  // ==========================================================================
  function adminButton() {
    return isAdmin() ? `<button class="btn sm secondary" data-admin title="Admin hacks">⚙ Admin</button>` : "";
  }
  // One ladder for rank and power: 1 beat Finn, 2 won an Arena month, 3 solved
  // Hunt for the Traitor, 4 the owner. The server is the authority; this is only
  // for deciding what to show.
  const myTier = () => (API.me ? API.me.tier || 0 : 0);
  function councilButton() {
    const t = myTier();
    return t >= 1 ? `<button class="btn sm secondary" data-council title="Arena governance">🏛 Tier ${t}</button>` : "";
  }
  function huntButton() {
    return myTier() >= 2 ? `<button class="btn sm secondary" data-hunt title="Hunt for the Traitor">🔎 Hunt</button>` : "";
  }
  function adminAutoBeatFinn() {
    if (!isAdmin()) return;
    state.tierIndex = CHAIN.indexOf("Diamond");
    state.introDone = true;
    const round = DIAMOND.rounds.length - 1;
    state.diamond = { active: true, round, opponent: GUIDE.name };
    saveState();
    const qs = Array.from({ length: DIAMOND.questionsPerMatch }, () => {
      const p = DIAMOND.pool[rnd(0, DIAMOND.pool.length - 1)];
      return { ...p.make(), tag: `${p.tier} · ${p.topic}` };
    });
    const perQ = DIAMOND.aiSecondsPerQuestion[round];
    const aiTime = qs.reduce((t) => t + perQ * (0.75 + Math.random() * 0.5), 0);
    unlock("finnmatch");
    matchResult({ round, opponent: GUIDE.name, rematch: false }, { playerTime: 1.0, aiTime, wrongs: 0, qs, firstCorrectAt: 0.2 });
  }
  function adminCompleteLevel(s, l) {
    const xp = levelXp(l);
    state.results[levelId(s, l)] = { earned: xp, total: xp, marks: Array(l.count).fill("green"), wrong: 0, bonus: null, admin: true };
    state.xp += xp;
    saveState();
  }
  function adminPanel(back, notice) {
    if (!isAdmin()) return back();
    const t = tier();
    const tierOptions = CHAIN.map((n, i) => `<option value="${i}" ${i === state.tierIndex ? "selected" : ""}>${esc(n)}</option>`).join("");
    show(`<main class="screen">${bar("Admin")}
      <div class="content">
        <h2>⚙ Admin hacks</h2>
        <p class="small muted">Signed in as <strong>${esc(state.playerName)}</strong>. These shortcuts exist because your username starts with the admin code.</p>
        ${notice ? `<p class="notice-light">${esc(notice)}</p>` : ""}
        <div class="admin-grid">
          <div class="admin-row">
            <div><strong>Infinite XP</strong><div class="small muted">XP shows as ∞ and every Coronation XP gate is open. Currently ${infiniteXp() ? "ON" : "OFF"}.</div></div>
            <button class="btn sm" data-act="infinite">${infiniteXp() ? "Turn off" : "Turn on"}</button>
          </div>
          <div class="admin-row">
            <div><strong>Add XP</strong><div class="small muted">Current: ${fmtXp(state.xp)} XP</div></div>
            <form data-add-xp class="answer" style="flex:0 1 auto">
              <input type="number" min="1" step="1" value="1000000" aria-label="XP amount" style="width:9rem">
              <button type="submit" class="btn sm">Add</button>
            </form>
          </div>
          <div class="admin-row">
            <div><strong>Jump to tier</strong><div class="small muted">Resets XP and contest results for the new tier.</div></div>
            <div class="answer" style="flex:0 1 auto">
              <select data-tier-select aria-label="Tier">${tierOptions}</select>
              <button class="btn sm" data-act="jump">Go</button>
            </div>
          </div>
          <div class="admin-row">
            <div><strong>Promote now</strong><div class="small muted">Skip the Coronation and move up one tier (counts for achievements).</div></div>
            <button class="btn sm" data-act="promote" ${nextTierName() ? "" : "disabled"}>Promote</button>
          </div>
          <div class="admin-row">
            <div><strong>Complete every contest here</strong><div class="small muted">Marks all 12 contests in ${esc(tierName())} as perfect and pays their XP.</div></div>
            <button class="btn sm" data-act="complete" ${t && !t.tournament ? "" : "disabled"}>Complete all</button>
          </div>
          <div class="admin-row">
            <div><strong>Clear Coronation cooldown</strong><div class="small muted">Lets you retry the Coronation immediately.</div></div>
            <button class="btn sm" data-act="cooldown">Clear</button>
          </div>
          <div class="admin-row">
            <div><strong>Auto-beat Finn</strong><div class="small muted">Instantly win a Diamond Final against ${esc(GUIDE.name)} with a 1.0s time.</div></div>
            <button class="btn sm" data-act="autobeat">Auto-beat</button>
          </div>
          <div class="admin-row">
            <div><strong>Jump to the Diamond Final</strong><div class="small muted">Puts you in Diamond with a bracket at the Final vs ${esc(GUIDE.name)}.</div></div>
            <button class="btn sm" data-act="final">Go to Final</button>
          </div>
          <div class="admin-row">
            <div><strong>Enter the Arena of Champions</strong><div class="small muted">Skip beating ${esc(GUIDE.name)} and go straight to the Arena as a Tier 1 Ruler. Needs sign-in.</div></div>
            <button class="btn sm" data-act="arena">Enter Arena</button>
          </div>
        </div>
      </div>
      <div class="footer between">
        <button class="btn link" data-reset>Reset progress</button>
        <button class="btn secondary" data-back>Back</button>
      </div>
    </main>`);

    const again = (msg) => adminPanel(back, msg);
    on("[data-act]", "click", async (e) => {
      const act = e.currentTarget.dataset.act;
      if (act === "infinite") {
        state.admin = { ...(state.admin || {}), infiniteXp: !infiniteXp() };
        saveState();
        return again(`Infinite XP ${infiniteXp() ? "on" : "off"}.`);
      }
      if (act === "jump") {
        const idx = Number(app.querySelector("[data-tier-select]").value);
        state.tierIndex = idx;
        state.xp = 0;
        state.results = {};
        state.coronationLastAttempt = null;
        state.diamond = { active: false, round: 0, opponent: null };
        state.introDone = true;
        saveState();
        return planet();
      }
      if (act === "promote") return promote();
      if (act === "complete") {
        t.stadiums.forEach((s) => s.levels.forEach((l) => { if (!state.results[levelId(s, l)]) adminCompleteLevel(s, l); }));
        return again(`Every contest in ${tierName()} is now complete. XP: ${fmtXp(state.xp)}.`);
      }
      if (act === "cooldown") {
        state.coronationLastAttempt = null;
        saveState();
        return again("Coronation cooldown cleared.");
      }
      if (act === "autobeat") return adminAutoBeatFinn();
      if (act === "final") {
        state.tierIndex = CHAIN.indexOf("Diamond");
        state.xp = 0;
        state.results = {};
        state.introDone = true;
        state.diamond = { active: true, round: DIAMOND.rounds.length - 1, opponent: GUIDE.name };
        saveState();
        return diamond();
      }
      if (act === "arena") {
        if (!API.me) return again("Sign in first — the Arena tracks real accounts.");
        state.champion = true;
        saveState();
        await arenaEnter();
        return arenaScreen();
      }
    });
    app.querySelector("[data-add-xp]").addEventListener("submit", (e) => {
      e.preventDefault();
      const n = Math.max(0, Math.floor(Number(app.querySelector("[data-add-xp] input").value) || 0));
      state.xp += n;
      saveState();
      again(`Added ${fmtXp(n)} XP.`);
    });
    on("[data-back]", "click", () => back());
    on("[data-reset]", "click", confirmReset);
  }

  // ==========================================================================
  // OTHER GAMES — Dragon Hunter (playable), Meteor Showdown (coming soon)
  // ==========================================================================
  const DH = GAME_DATA.dragonHunter;
  const petById = (id) => DH.pets.find((p) => p.id === id);
  const elIcon = (el) => DH.elements[el] || "";
  function effectiveness(moveEl, targetEl) {
    if ((DH.strong[moveEl] || []).includes(targetEl)) return 2;
    if ((DH.strong[targetEl] || []).includes(moveEl)) return 0.5;
    return 1;
  }
  function canAfford(price) {
    return infiniteXp() || state.xp >= price;
  }
  function spendXp(price) {
    if (!infiniteXp()) state.xp -= price;
  }
  function dragonState() {
    if (!state.dragon) state.dragon = { owned: [], team: [], defeated: [] };
    return state.dragon;
  }

  function games(back) {
    show(`<main class="screen">${bar("Games")}
      <div class="content">
        <h2>Other games</h2>
        <p class="small muted">Side games that spend your XP. Your tier progress is untouched.</p>
        <div class="games-list">
          <div class="game-card">
            <div class="game-icon">🐉</div>
            <div>
              <h3>Dragon Hunter</h3>
              <p class="small muted">Use your XP to buy pets with special moves, then take down the five evil dragons. More XP means more powerful pets. Beat them all for the Dragon Hunter achievement.</p>
            </div>
            <button class="btn" data-dragon>Play</button>
          </div>
          <div class="game-card">
            <div class="game-icon">☄️</div>
            <div>
              <h3>Meteor Showdown</h3>
              <p class="small muted">Meteors rain from the sky and you build an underground bunker to survive ${MS.waves} waves. One round costs ${fmtXp(MS.price)} XP. Survive them all for the Protector achievement.${state.meteor && state.meteor.played ? ` Record: ${state.meteor.wins} win${state.meteor.wins === 1 ? "" : "s"} in ${state.meteor.played} round${state.meteor.played === 1 ? "" : "s"}.` : ""}</p>
            </div>
            <button class="btn" data-meteor ${canAfford(MS.price) ? "" : "disabled"} title="${canAfford(MS.price) ? "" : `You need ${fmtXp(MS.price)} XP`}">Play · ${fmtXp(MS.price)} XP</button>
          </div>
          <div class="game-card">
            <div class="game-icon">📝</div>
            <div>
              <h3>Player contests</h3>
              <p class="small muted">Contests written by other players and approved by a Tier 3. Each question pays its own MBucks, and you get one sitting at each. Also on the 📝 Contests button up top.</p>
            </div>
            <button class="btn" data-contests>Browse</button>
          </div>
        </div>
      </div>
      <div class="footer between"><button class="btn secondary" data-back>Back</button></div>
    </main>`);
    on("[data-contests]", "click", () => contestList(() => games(back)));
    on("[data-dragon]", "click", () => dragonHub(back));
    on("[data-meteor]", "click", () => {
      if (!canAfford(MS.price)) return;
      spendXp(MS.price);
      if (!state.meteor) state.meteor = { played: 0, wins: 0 };
      state.meteor.played += 1;
      saveState();
      unlock("architect");
      meteorShowdown(back);
    });
    on("[data-back]", "click", () => back());
  }

  // ---- Dragon Hunter hub: shop, team, dragon ladder -------------------------
  function dragonHub(back, notice) {
    const d = dragonState();
    const nextDragon = DH.dragons.find((x) => !d.defeated.includes(x.id));
    const allDone = !nextDragon;

    const petCard = (p) => {
      const owned = d.owned.includes(p.id);
      const inTeam = d.team.includes(p.id);
      let action;
      if (!owned) action = `<button class="btn sm" data-buy="${p.id}" ${canAfford(p.price) ? "" : "disabled"}>Buy · ${fmtXp(p.price)} XP</button>`;
      else if (inTeam) action = `<button class="btn sm secondary" data-team="${p.id}">Leave team</button>`;
      else action = `<button class="btn sm" data-team="${p.id}" ${d.team.length >= DH.teamSize ? "disabled" : ""}>Add to team</button>`;
      return `<div class="pet-card ${owned ? "owned" : ""} ${inTeam ? "in-team" : ""}">
        <div class="pet-emoji">${p.emoji}</div>
        <div class="pet-body">
          <div><strong>${esc(p.name)}</strong> <span class="small">${elIcon(p.element)} ${p.element}</span>${inTeam ? ` <span class="tag">team</span>` : owned ? ` <span class="tag">owned</span>` : ""}</div>
          <div class="small muted">HP ${p.hp} · ATK ${p.atk} · ${p.moves.map((m) => m.heal ? `${m.name} (heal ${m.heal})` : `${m.name} (${m.power} ${elIcon(m.element)})`).join(", ")}</div>
        </div>
        ${action}
      </div>`;
    };
    const dragonRow = (x, i) => {
      const done = d.defeated.includes(x.id);
      const isNext = nextDragon && nextDragon.id === x.id;
      return `<div class="dragon-row ${done ? "done" : ""} ${isNext ? "next" : ""}">
        <div class="pet-emoji">${x.emoji}</div>
        <div class="pet-body">
          <div><strong>${i + 1}. ${esc(x.name)}</strong> <span class="small">${elIcon(x.element)} ${x.element}</span></div>
          <div class="small muted">HP ${x.hp} · ATK ${x.atk} · ${x.moves.map((m) => m.heal ? `${m.name} (heal)` : `${m.name} (${m.power} ${elIcon(m.element)})`).join(", ")}</div>
        </div>
        ${done ? `<span class="done">Defeated ✓</span>` : isNext ? `<button class="btn sm" data-fight ${d.team.length ? "" : "disabled"}>Fight</button>` : `<span class="small muted">Locked</span>`}
      </div>`;
    };

    show(`<main class="screen">${bar("Dragon Hunter")}
      <div class="content">
        <h2>🐉 Dragon Hunter</h2>
        <p class="small muted">You have <strong>${xpText()} XP</strong>. Buy pets, pick a team of up to ${DH.teamSize}, and fight the dragons in order. Pets heal fully between battles.</p>
        ${notice ? `<p class="notice-light">${esc(notice)}</p>` : ""}
        ${allDone ? `<p class="notice-light">🏆 Every dragon is defeated. You are a Dragon Hunter!</p>` : ""}
        <h3>The dragons</h3>
        ${DH.dragons.map(dragonRow).join("")}
        <h3 style="margin-top:1.25rem">Pet shop &amp; team <span class="small muted" style="font-weight:500">(${d.team.length}/${DH.teamSize} in team)</span></h3>
        <div class="small muted" style="margin-bottom:0.5rem">Element chart: 🔥 beats 🌿 ❄️ · 💧 beats 🔥 · 🌿 beats 💧 · ⚡ beats 💧 · ❄️ beats 🌿 · ✨ and 🌑 beat each other. Strong hits do double, weak hits do half.</div>
        ${DH.pets.map(petCard).join("")}
      </div>
      <div class="footer between"><button class="btn secondary" data-back>Back to games</button></div>
    </main>`);

    on("[data-buy]", "click", (e) => {
      const p = petById(e.currentTarget.dataset.buy);
      if (!canAfford(p.price) || d.owned.includes(p.id)) return;
      spendXp(p.price);
      d.owned.push(p.id);
      if (d.team.length < DH.teamSize) d.team.push(p.id);
      saveState();
      dragonHub(back, `${p.name} joined your pets${d.team.includes(p.id) ? " and your team" : ""}.`);
    });
    on("[data-team]", "click", (e) => {
      const id = e.currentTarget.dataset.team;
      if (d.team.includes(id)) d.team = d.team.filter((x) => x !== id);
      else if (d.team.length < DH.teamSize) d.team.push(id);
      saveState();
      dragonHub(back);
    });
    on("[data-fight]", "click", () => nextDragon && dragonBattle(nextDragon, back));
    on("[data-back]", "click", () => games(back));
  }

  // ---- Dragon Hunter battle ------------------------------------------------------
  function dragonBattle(dragon, back) {
    const d = dragonState();
    unlock("dragon");
    const team = d.team.map((id) => ({ ...petById(id), cur: petById(id).hp }));
    const foe = { ...dragon, cur: dragon.hp };
    let active = 0;
    let log = [`A wild ${dragon.name} appears! Go, ${team[0].name}!`];
    let over = null; // "win" | "lose"
    let needSwitch = false;

    const say = (t) => { log.push(t); log = log.slice(-6); };
    const dmg = (power, atk, moveEl, targetEl) => Math.max(1, Math.round(power * (atk / 10) * effectiveness(moveEl, targetEl) * (0.85 + Math.random() * 0.15)));
    const effText = (moveEl, targetEl) => { const e = effectiveness(moveEl, targetEl); return e === 2 ? " It's super effective!" : e === 0.5 ? " It's not very effective." : ""; };

    function petMove(m) {
      const pet = team[active];
      if (m.heal) {
        const before = pet.cur;
        pet.cur = Math.min(pet.hp, pet.cur + m.heal);
        say(`${pet.name} used ${m.name} and healed ${pet.cur - before} HP.`);
      } else {
        const n = dmg(m.power, pet.atk, m.element, foe.element);
        foe.cur = Math.max(0, foe.cur - n);
        say(`${pet.name} used ${m.name} for ${n} damage.${effText(m.element, foe.element)}`);
      }
      if (foe.cur <= 0) return win();
      dragonTurn();
    }
    function dragonTurn() {
      const pet = team[active];
      const heals = foe.moves.filter((m) => m.heal), attacks = foe.moves.filter((m) => !m.heal);
      const m = heals.length && foe.cur < foe.hp * 0.35 && Math.random() < 0.5 ? heals[0] : attacks[rnd(0, attacks.length - 1)];
      if (m.heal) {
        const before = foe.cur;
        foe.cur = Math.min(foe.hp, foe.cur + m.heal);
        say(`${foe.name} used ${m.name} and healed ${foe.cur - before} HP.`);
      } else {
        const n = dmg(m.power, foe.atk, m.element, pet.element);
        pet.cur = Math.max(0, pet.cur - n);
        say(`${foe.name} used ${m.name} for ${n} damage.${effText(m.element, pet.element)}`);
      }
      if (pet.cur <= 0) {
        say(`${pet.name} fainted!`);
        if (team.every((p) => p.cur <= 0)) return lose();
        needSwitch = true;
      }
      render();
    }
    function switchTo(i, free) {
      if (i === active || team[i].cur <= 0) return;
      active = i;
      needSwitch = false;
      say(`Go, ${team[i].name}!`);
      if (free) return render();
      dragonTurn();
    }
    function win() {
      over = "win";
      if (!d.defeated.includes(dragon.id)) d.defeated.push(dragon.id);
      saveState();
      say(`${foe.name} is defeated!`);
      if (DH.dragons.every((x) => d.defeated.includes(x.id))) unlock("dragonhunter");
      render();
    }
    function lose() {
      over = "lose";
      say(`Your whole team fainted. ${foe.name} wins this round.`);
      render();
    }
    const hpBar = (cur, max, cls) => `<div class="hpbar"><div class="${cls}" style="width:${Math.round((cur / max) * 100)}%"></div></div><div class="small muted">${cur} / ${max} HP</div>`;

    function render() {
      const pet = team[active];
      show(`<main class="screen">${bar("Dragon Hunter")}
        <div class="content">
          <div class="fighter foe">
            <div class="pet-emoji big">${foe.emoji}</div>
            <div class="pet-body"><strong>${esc(foe.name)}</strong> <span class="small">${elIcon(foe.element)} ${foe.element}</span>${hpBar(foe.cur, foe.hp, "hp-foe")}</div>
          </div>
          <div class="battle-log">${log.map((l) => `<div>${esc(l)}</div>`).join("")}</div>
          <div class="fighter">
            <div class="pet-emoji big">${pet.emoji}</div>
            <div class="pet-body"><strong>${esc(pet.name)}</strong> <span class="small">${elIcon(pet.element)} ${pet.element}</span>${hpBar(pet.cur, pet.hp, "hp-pet")}</div>
          </div>
          ${over ? `<p class="notice-light">${over === "win" ? `🎉 You beat ${esc(foe.name)}!` : `💀 Defeated. Buy stronger pets or rethink your team, then try again.`}</p>` : needSwitch ? `<p class="notice-light">Choose your next pet.</p>` : ""}
          ${!over && !needSwitch ? `<div class="moves">${pet.moves.map((m, i) => `<button class="btn sm" data-move="${i}">${esc(m.name)} <span class="small">${m.heal ? `heal ${m.heal}` : `${m.power} ${elIcon(m.element)}`}</span></button>`).join("")}</div>` : ""}
          ${!over && team.length > 1 ? `<div class="switch"><span class="small muted">Switch${needSwitch ? "" : " (uses your turn)"}:</span>${team.map((p, i) => `<button class="btn sm secondary" data-switch="${i}" ${i === active || p.cur <= 0 ? "disabled" : ""}>${p.emoji} ${esc(p.name)} ${p.cur}/${p.hp}</button>`).join("")}</div>` : ""}
        </div>
        <div class="footer between">
          <button class="btn secondary" data-flee>${over ? "Back to Dragon Hunter" : "Flee"}</button>
        </div>
      </main>`);
      on("[data-move]", "click", (e) => petMove(pet.moves[Number(e.currentTarget.dataset.move)]));
      on("[data-switch]", "click", (e) => switchTo(Number(e.currentTarget.dataset.switch), needSwitch));
      on("[data-flee]", "click", () => dragonHub(back, over === "win" ? `${foe.name} defeated!` : over === "lose" ? "Your team was defeated." : "You fled the battle."));
    }
    render();
  }

  // ==========================================================================
  // AVATAR SHOP — spend MBucks on avatar pieces
  // ==========================================================================
  function avatarShop(back, notice) {
    const av = avatarState();
    const section = (slot) => {
      const items = AVATAR.catalog[slot].filter((it) => !it.photo || myPhoto());
      return `<h3 style="margin-top:1.25rem">${esc(AVATAR.slotLabel[slot])}</h3>
      <div class="shop-grid">${items.map((it) => {
        const owned = avatarOwned(slot, it);
        const on = av.equipped[slot] === it.id;
        const preview = avatarMarkup({ ...av.equipped, [slot]: it.id }, "sm", myPhoto());
        return `<div class="shop-item ${on ? "equipped" : ""}">
          ${preview}
          <div class="shop-body">
            <div class="shop-name">${esc(it.label)}</div>
            <div class="small muted">${owned ? (on ? "Equipped" : "Owned") : mmcMoney(it.price)}</div>
          </div>
          ${on
            ? `<span class="tag">on</span>`
            : owned
              ? `<button class="btn sm secondary" data-equip="${slot}:${it.id}">Equip</button>`
              : `<button class="btn sm" data-buy-av="${slot}:${it.id}" ${canAffordBucks(it.price) ? "" : "disabled"}>Buy</button>`}
        </div>`;
      }).join("")}</div>`;
    };

    show(`<main class="screen">${bar("Avatar")}
      <div class="content">
        <div class="mmc-title">
          <div>
            <h2>🎨 Customise your avatar</h2>
            <p class="small muted">Pieces are bought with MBucks earned from formal MMC sittings. Your avatar shows on your profile card and to every other player.</p>
          </div>
          <div class="bucks"><div class="bucks-n">${esc(mmcMoney(mmcBucks()))}</div><div class="small muted">${esc(MMC.currency)}</div></div>
        </div>
        ${notice ? `<p class="notice-light">${esc(notice)}</p>` : ""}
        <div class="av-preview">${myAvatar("lg")}<div><strong>${esc(displayName())}</strong><div class="small muted">Live preview</div></div></div>
        ${AVATAR.slots.map(section).join("")}
      </div>
      <div class="footer between"><button class="btn secondary" data-back>Back to profile</button></div>
    </main>`);

    on("[data-buy-av]", "click", (e) => {
      const [slot, id] = e.currentTarget.dataset.buyAv.split(":");
      const item = avatarItem(slot, id);
      if (!canAffordBucks(item.price) || avatarOwned(slot, item)) return;
      spendBucks(item.price);
      avatarState().owned.push(avatarKey(slot, id));
      avatarState().equipped[slot] = id;
      saveState();
      avatarShop(back, `${item.label} bought and equipped.`);
    });
    on("[data-equip]", "click", (e) => {
      const [slot, id] = e.currentTarget.dataset.equip.split(":");
      avatarState().equipped[slot] = id;
      saveState();
      avatarShop(back);
    });
    on("[data-back]", "click", () => profileScreen(back));
  }

  // ==========================================================================
  // MMC — the M Math Competition
  // Formal sittings are once per calendar month with no retakes and pay
  // MBucks; informal sittings are unlimited practice on different questions.
  // ==========================================================================
  function mmcState() {
    if (!state.mmc) state.mmc = { bucks: 0, exams: {} };
    if (!state.mmc.exams) state.mmc.exams = {};
    return state.mmc;
  }
  function mmcRecord(examId) {
    const m = mmcState();
    if (!m.exams[examId]) m.exams[examId] = { formal: [], practiceCount: 0, best: null };
    return m.exams[examId];
  }
  const mmcBucks = () => mmcState().bucks || 0;
  // MBucks purchases (avatar pieces). XP purchases use canAfford/spendXp.
  const canAffordBucks = (price) => infiniteXp() || mmcBucks() >= price;
  function spendBucks(price) {
    if (!infiniteXp()) mmcState().bucks = Math.max(0, mmcBucks() - price);
  }
  const mmcMoney = (n) => `${MMC.currencySymbol}${fmtXp(n)}`;
  // The formal paper is locked once you have sat it this calendar month.
  function mmcFormalStatus(exam) {
    const rec = mmcRecord(exam.id);
    const period = MMC.period();
    const taken = (rec.formal || []).find((a) => a.period === period);
    return { period, taken: !!taken, attempt: taken || null };
  }
  const mmcScoreText = (exam, score) => `${Number.isInteger(score) ? score : score.toFixed(1)} / ${exam.max}`;

  function mmcHall(back) {
    const cards = MMC.exams.map((exam) => {
      const rec = mmcRecord(exam.id);
      const st = mmcFormalStatus(exam);
      const best = (rec.formal || []).reduce((b, a) => (b === null || a.score > b ? a.score : b), null);
      const formalBtn = st.taken
        ? `<span class="done">Sat this month · ${esc(mmcScoreText(exam, st.attempt.score))}</span>`
        : `<button class="btn sm" data-formal="${exam.id}">Sit the formal exam</button>`;
      return `<div class="mmc-card">
        <div class="mmc-head">
          <div>
            <h3>${esc(exam.name)}</h3>
            <div class="small muted">${esc(exam.blurb)}</div>
            <div class="small muted">${exam.questions} questions · ${exam.minutes} minutes · ${exam.scoring.correct} per correct${exam.scoring.blank ? `, ${exam.scoring.blank} per blank` : ""}, 0 per wrong · max ${exam.max}</div>
          </div>
        </div>
        <div class="mmc-rows">
          <div class="mmc-row">
            <div><strong>Formal</strong><div class="small muted">${esc(MMC.periodLabel())} sitting · one attempt, no retakes · pays ${exam.payout.perPoint} ${MMC.currency} per point${best !== null ? ` · best ${esc(mmcScoreText(exam, best))}` : ""}</div></div>
            ${formalBtn}
          </div>
          <div class="mmc-row">
            <div><strong>Informal</strong><div class="small muted">Practice on different questions. Not scored on your profile and pays nothing.${rec.practiceCount ? ` ${rec.practiceCount} taken.` : ""}</div></div>
            <button class="btn sm secondary" data-practice="${exam.id}">Practice</button>
          </div>
        </div>
      </div>`;
    }).join("");

    show(`<main class="screen">${bar("MMC")}
      <div class="content">
        <div class="mmc-title">
          <div>
            <h2>📋 M Math Competition</h2>
            <p class="small muted">Three exams in the style of the AMC 8, 10 and 12. Every question is original, written to the same difficulty.</p>
          </div>
          <div class="bucks"><div class="bucks-n">${esc(mmcMoney(mmcBucks()))}</div><div class="small muted">${esc(MMC.currency)}</div></div>
        </div>
        ${cards}
        <p class="small muted">The formal paper for a given month is the same for every contestant, and it can only be sat once. Practice papers are freshly generated each time, so they are never the real questions.</p>
      </div>
      <div class="footer between"><button class="btn secondary" data-back>Back</button></div>
    </main>`);
    on("[data-formal]", "click", (e) => mmcConfirm(MMC.exams.find((x) => x.id === e.currentTarget.dataset.formal), true, back));
    on("[data-practice]", "click", (e) => mmcConfirm(MMC.exams.find((x) => x.id === e.currentTarget.dataset.practice), false, back));
    on("[data-back]", "click", () => back());
  }

  function mmcConfirm(exam, formal, back) {
    if (formal && mmcFormalStatus(exam).taken) return mmcHall(back);
    show(`<main class="screen">${bar(exam.name)}
      <div class="content">
        ${finn(formal
          ? `This is the formal ${exam.name} for ${MMC.periodLabel()}. ${exam.questions} questions, ${exam.minutes} minutes, one sitting only. The clock starts the moment you begin, and there are no retakes this month.`
          : `Practice ${exam.name}. Same format and difficulty, different questions, and nothing here touches your profile. Take as many as you like.`)}
        <h2>${esc(exam.name)} · ${formal ? "Formal" : "Practice"}</h2>
        <ul>
          <li><strong>${exam.questions} multiple-choice questions</strong>, five options each.</li>
          <li><strong>${exam.minutes} minutes.</strong> The exam submits itself when the clock runs out.</li>
          <li>Scoring: <strong>${exam.scoring.correct}</strong> per correct answer${exam.scoring.blank ? `, <strong>${exam.scoring.blank}</strong> per question left blank` : ""}, <strong>0</strong> for a wrong answer. Maximum ${exam.max}.</li>
          ${exam.scoring.blank ? `<li>Because blanks are worth ${exam.scoring.blank}, a wild guess can cost you. Leave it blank if you have no idea.</li>` : ""}
          ${formal ? `<li><strong>One attempt.</strong> Once you begin, this month's ${exam.name} is used up whether you finish or not.</li>` : ""}
        </ul>
        <p class="small muted">Leaving the page mid-exam ends it, so start when you have ${exam.minutes} clear minutes.</p>
      </div>
      <div class="footer between">
        <button class="btn secondary" data-cancel>Not now</button>
        <button class="btn" data-begin>Begin the ${formal ? "formal exam" : "practice exam"}</button>
      </div>
    </main>`);
    on("[data-cancel]", "click", () => mmcHall(back));
    on("[data-begin]", "click", () => mmcRun(exam, formal, back));
  }

  function mmcRun(exam, formal, back) {
    const period = MMC.period();
    const paper = mmcBuildPaper(exam, formal ? `${exam.id}-${period}` : null);
    const picked = new Array(paper.length).fill(null);
    let index = 0;
    const endsAt = Date.now() + exam.minutes * 60000;

    // A formal sitting is consumed the moment it starts, so quitting cannot dodge it.
    if (formal) {
      const rec = mmcRecord(exam.id);
      rec.formal.push({ period, score: 0, correct: 0, blank: paper.length, wrong: 0, bucks: 0, at: Date.now(), started: true });
      saveState();
    }

    show(`<main class="screen">${bar(`${exam.name} · ${formal ? "Formal" : "Practice"}`)}
      <div class="content">
        <div class="exam-head">
          <div><strong id="exam-progress"></strong><div class="small muted">${esc(exam.name)} · ${formal ? esc(MMC.periodLabel()) : "practice paper"}</div></div>
          <div class="clock" id="exam-clock">--:--</div>
        </div>
        <div id="exam-q"></div>
        <div class="exam-nav">
          <button class="btn sm secondary" data-prev>Previous</button>
          <button class="btn sm secondary" data-next-q>Next</button>
          <button class="btn sm secondary" data-clear>Clear answer</button>
        </div>
        <div class="grid-nav" id="exam-grid"></div>
      </div>
      <div class="footer between">
        <button class="btn secondary" data-quit>Quit exam</button>
        <button class="btn" data-submit>Submit exam</button>
      </div>
    </main>`);

    const qBox = app.querySelector("#exam-q");
    const gridBox = app.querySelector("#exam-grid");
    const progress = app.querySelector("#exam-progress");
    const clock = app.querySelector("#exam-clock");

    function paintQuestion() {
      const q = paper[index];
      qBox.innerHTML = `<div class="question exam-q">
        <div class="qhead"><strong>Question ${q.n} of ${paper.length}</strong></div>
        <p class="qtext">${esc(q.q)}</p>
        <div class="choices">${q.choices.map((c, i) => `<button class="choice ${picked[index] === c ? "picked" : ""}" data-choice="${i}">
          <span class="letter">${"ABCDE"[i]}</span><span>${esc(c)}</span>
        </button>`).join("")}</div>
      </div>`;
      qBox.querySelectorAll("[data-choice]").forEach((b) => b.addEventListener("click", () => {
        picked[index] = q.choices[Number(b.dataset.choice)];
        paintQuestion();
        paintGrid();
      }));
      progress.textContent = `${picked.filter((p) => p !== null).length} of ${paper.length} answered`;
      app.querySelector("[data-prev]").disabled = index === 0;
      app.querySelector("[data-next-q]").disabled = index === paper.length - 1;
      app.querySelector("[data-clear]").disabled = picked[index] === null;
    }
    function paintGrid() {
      gridBox.innerHTML = paper.map((q, i) => `<button class="gnum ${picked[i] !== null ? "answered" : ""} ${i === index ? "current" : ""}" data-go="${i}">${q.n}</button>`).join("");
      gridBox.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => { index = Number(b.dataset.go); paintQuestion(); paintGrid(); }));
    }
    function tick() {
      const left = Math.max(0, endsAt - Date.now());
      const mins = Math.floor(left / 60000);
      const secs = Math.floor((left % 60000) / 1000);
      clock.textContent = `${mins}:${String(secs).padStart(2, "0")}`;
      clock.classList.toggle("low", left <= 60000);
      if (left <= 0) finish(true);
    }

    let finishing = false;
    async function finish(auto) {
      if (finishing) return;
      if (!auto) {
        finishing = true;
        const ok = await askConfirm(`Submit your ${exam.name}? ${picked.filter((p) => p === null).length} question(s) are blank.`);
        finishing = false;
        if (!ok) return;
      }
      if (finishing) return;
      finishing = true;
      if (activeTimer) { clearInterval(activeTimer); activeTimer = null; }
      let correct = 0, wrong = 0, blank = 0;
      paper.forEach((q, i) => {
        if (picked[i] === null) blank++;
        else if (picked[i] === q.correct) correct++;
        else wrong++;
      });
      const score = correct * exam.scoring.correct + blank * exam.scoring.blank + wrong * exam.scoring.wrong;
      const reward = mmcReward(exam, score);
      const rec = mmcRecord(exam.id);
      let paid = 0;
      if (formal) {
        paid = reward.bucks;
        const entry = rec.formal[rec.formal.length - 1];
        Object.assign(entry, { score, correct, blank, wrong, bucks: paid, at: Date.now(), started: false });
        if (rec.best === null || score > rec.best) rec.best = score;
        mmcState().bucks = mmcBucks() + paid;
      } else {
        rec.practiceCount = (rec.practiceCount || 0) + 1;
      }
      saveState();
      mmcResults(exam, formal, { paper, picked, score, correct, blank, wrong, reward, paid, auto }, back);
    }

    on("[data-prev]", "click", () => { if (index > 0) { index--; paintQuestion(); paintGrid(); } });
    on("[data-next-q]", "click", () => { if (index < paper.length - 1) { index++; paintQuestion(); paintGrid(); } });
    on("[data-clear]", "click", () => { picked[index] = null; paintQuestion(); paintGrid(); });
    on("[data-submit]", "click", () => finish(false));
    on("[data-quit]", "click", async () => {
      const ok = await askConfirm(formal ? "Quit? This month's formal sitting is already used up, and your paper will be scored as it stands." : "Quit this practice exam?");
      if (!ok) return;
      if (formal) finish(true);
      else { if (activeTimer) { clearInterval(activeTimer); activeTimer = null; } mmcHall(back); }
    });

    paintQuestion();
    paintGrid();
    tick();
    activeTimer = setInterval(tick, 500);
  }

  function mmcResults(exam, formal, r, back) {
    const pct = Math.round((r.score / exam.max) * 100);
    const headline = formal
      ? `${exam.name} for ${MMC.periodLabel()} is in the books: ${mmcScoreText(exam, r.score)}. ${r.reward.title}, worth ${mmcMoney(r.paid)}.`
      : `Practice ${exam.name} done: ${mmcScoreText(exam, r.score)}. Nothing recorded, so run it again whenever you like.`;
    show(`<main class="screen">${bar(`${exam.name} results`)}
      <div class="content">
        ${finn(headline)}
        <h2>${esc(exam.name)} · ${formal ? "Formal" : "Practice"}</h2>
        ${r.auto ? `<p class="notice-light">Time ran out, so the paper was submitted as it stood.</p>` : ""}
        <div class="score">${esc(mmcScoreText(exam, r.score))} <span class="muted" style="font-size:1rem;font-weight:500">· ${pct}%</span></div>
        <div class="stats">
          <div class="stat"><div class="stat-n">${r.correct}</div><div class="small muted">correct</div></div>
          <div class="stat"><div class="stat-n">${r.wrong}</div><div class="small muted">wrong</div></div>
          <div class="stat"><div class="stat-n">${r.blank}</div><div class="small muted">blank</div></div>
          <div class="stat"><div class="stat-n">${formal ? esc(mmcMoney(r.paid)) : "—"}</div><div class="small muted">${esc(MMC.currency)} earned</div></div>
        </div>
        ${formal ? `<p><strong>${esc(r.reward.title)}</strong> · ${esc(mmcMoney(r.reward.fromScore))} for your grade${r.reward.bonus ? ` plus ${esc(mmcMoney(r.reward.bonus))} honor-roll bonus` : ""} = <strong>${esc(mmcMoney(r.paid))}</strong>. Balance: ${esc(mmcMoney(mmcBucks()))}.</p>` : ""}
        <h3>Review</h3>
        ${r.paper.map((q, i) => {
          const yours = r.picked[i];
          const state = yours === null ? "purple" : yours === q.correct ? "green" : "red";
          return `<div class="result-row">${markEl(state)}<span>${q.n}. ${esc(q.q)}
            <span class="muted small">Your answer: ${yours === null ? "blank" : esc(yours)} · correct: ${esc(q.correct)}</span></span></div>`;
        }).join("")}
      </div>
      <div class="footer"><button class="btn" data-next>Back to the MMC</button></div>
    </main>`);
    on("[data-next]", "click", () => mmcHall(back));
  }

  // ==========================================================================
  // PROFILE — your own card, plus the directory of registered players
  // ==========================================================================
  function avatarState() {
    if (!state.avatar) state.avatar = { owned: [], equipped: { ...AVATAR.defaults } };
    if (!state.avatar.equipped) state.avatar.equipped = { ...AVATAR.defaults };
    if (!Array.isArray(state.avatar.owned)) state.avatar.owned = [];
    return state.avatar;
  }
  const avatarKey = (slot, id) => `${slot}:${id}`;
  function avatarOwned(slot, item) {
    return item.price === 0 || avatarState().owned.includes(avatarKey(slot, item.id));
  }
  const myPhoto = () => (API.me ? API.me.picture : null);
  const myAvatar = (size) => avatarMarkup(avatarState().equipped, size, myPhoto());

  const fmtDay = (ts) => (ts ? new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");
  const initials = (name) => String(name || "?").trim().slice(0, 1).toUpperCase();
  function faceEl(person, cls) {
    return avatarMarkup(person.avatar, cls === "big" ? "lg" : "sm", person.picture);
  }
  // Your profile built from local state, for guests and as the fallback while loading.
  function localProfile() {
    const d = dragonState();
    return {
      name: displayName(),
      picture: myPhoto(),
      avatar: avatarState().equipped,
      tier: tierName(),
      xp: state.xp,
      achievements: Object.keys(ach.unlocked).length,
      titles: state.titles || 0,
      champion: !!state.champion,
      finnWins: (state.finnRecord || {}).wins || 0,
      finnLosses: (state.finnRecord || {}).losses || 0,
      bestStreak: ach.bestStreak || 0,
      bonusAnswered: ach.bonusAnswered || 0,
      bucks: mmcBucks(),
      mmc: Object.fromEntries(MMC.exams.map((ex) => [ex.id, mmcRecord(ex.id).best])),
      dragonsDefeated: (d.defeated || []).length,
      petsOwned: (d.owned || []).length,
      meteorWins: (state.meteor || {}).wins || 0,
      meteorPlayed: (state.meteor || {}).played || 0,
      contestsDone: Object.keys(state.results || {}).length,
      you: true,
    };
  }
  function statGrid(p) {
    const cells = [
      [fmtXp(p.xp), "XP"],
      [`${MMC.currencySymbol}${fmtXp(p.bucks || 0)}`, MMC.currency],
      [`${p.achievements} / ${ACHIEVEMENTS.length}`, "achievements"],
      [p.contestsDone, "contests done"],
      [p.bestStreak, "best streak"],
      [p.titles, `title${p.titles === 1 ? "" : "s"}`],
      [`${p.finnWins}–${p.finnLosses}`, `vs ${GUIDE.name}`],
      [`${p.dragonsDefeated} / ${DH.dragons.length}`, "dragons slain"],
      [`${p.meteorWins} / ${p.meteorPlayed}`, "meteor rounds won"],
      [p.bonusAnswered, "bonus answers"],
      [p.petsOwned, "pets owned"],
    ];
    const mmcCells = MMC.exams.map((ex) => {
      const best = (p.mmc || {})[ex.id];
      return [best === null || best === undefined ? "—" : `${Number.isInteger(best) ? best : best.toFixed(1)}`, `best ${ex.name}`];
    });
    cells.push(...mmcCells);
    return `<div class="stats">${cells.map(([n, label]) => `<div class="stat"><div class="stat-n">${esc(n)}</div><div class="small muted">${esc(label)}</div></div>`).join("")}</div>`;
  }
  function profileHero(p) {
    return `<div class="profile-hero">
      ${faceEl(p, "big")}
      <div>
        <h2 style="margin-bottom:0.15rem">${esc(p.name)}${p.champion ? " 👑" : ""}</h2>
        <div class="muted">${esc(p.tier)} tier${p.champion ? " · Ruler of the M Games" : ""}${p.rank ? ` · rank #${p.rank}` : ""}</div>
        ${p.joined ? `<div class="small muted">Joined ${esc(fmtDay(p.joined))}${p.lastSeen ? ` · last played ${esc(fmtDay(p.lastSeen))}` : ""}</div>` : ""}
      </div>
    </div>`;
  }

  function profileScreen(back) {
    const mine = localProfile();
    const render = (body) => {
      show(`<main class="screen">${bar("Profile")}
        <div class="content">
          ${profileHero(mine)}
          ${statGrid(mine)}
          <h3 style="margin-top:1.5rem">Players</h3>
          <div id="directory">${body}</div>
        </div>
        <div class="footer between">
          <button class="btn secondary" data-back>Back</button>
          <span style="display:flex;gap:0.5rem;flex-wrap:wrap">
            <button class="btn secondary" data-achievements>🏆 Achievements</button>
            <button class="btn" data-customise>🎨 Customise avatar</button>
          </span>
        </div>
      </main>`);
      on("[data-back]", "click", () => back());
      on("[data-achievements]", "click", () => achievementsScreen(() => profileScreen(back)));
      on("[data-customise]", "click", () => avatarShop(back));
      on("[data-player]", "click", (e) => playerScreen(Number(e.currentTarget.dataset.player), back));
    };

    if (!API.available) return render(`<p class="small muted">The player directory needs the M Games server. You're playing from a plain file, so only your own profile is available.</p>`);
    if (!API.me) return render(`<p class="small muted">Sign in to see everyone else playing the M Games. <a class="link-btn" href="/login">Sign in</a></p>`);

    render(`<p class="small muted">Loading players…</p>`);
    apiJson("/api/players").then((data) => {
      const box = app.querySelector("#directory");
      if (!box) return;
      const list = data.players || [];
      box.innerHTML = list.length
        ? `<p class="small muted">${list.length} registered player${list.length === 1 ? "" : "s"}, ranked by tier then XP.</p>` +
          list.map((p) => `<button class="player-row ${p.you ? "you" : ""}" data-player="${p.id}">
            <span class="rank">#${p.rank}</span>
            ${faceEl(p, "")}
            <span class="player-body">
              <span class="player-name">${esc(p.name)}${p.champion ? " 👑" : ""}${p.you ? ` <span class="tag">you</span>` : ""}</span>
              <span class="small muted">${esc(p.tier)} tier · ${fmtXp(p.xp)} XP · ${p.achievements} achievement${p.achievements === 1 ? "" : "s"}</span>
            </span>
          </button>`).join("")
        : `<p class="small muted">No other players yet.</p>`;
      on("[data-player]", "click", (e) => playerScreen(Number(e.currentTarget.dataset.player), back));
    }).catch(() => {
      const box = app.querySelector("#directory");
      if (box) box.innerHTML = `<p class="small muted">Couldn't load the player directory.</p>`;
    });
  }

  function playerScreen(id, back) {
    show(`<main class="screen">${bar("Player")}<div class="content"><p class="muted">Loading…</p></div></main>`);
    apiJson(`/api/players/${id}`).then((p) => {
      const canReport = myTier() >= 2 && !p.you;
      show(`<main class="screen">${bar(p.name)}
        <div class="content">
          ${profileHero(p)}
          ${statGrid(p)}
        </div>
        <div class="footer between">
          <button class="btn secondary" data-back>Back to players</button>
          ${canReport ? `<button class="btn link" data-report>🚩 Report player</button>` : ""}
        </div>
      </main>`);
      on("[data-back]", "click", () => profileScreen(back));
      if (canReport) on("[data-report]", "click", () => reportScreen(p.id, p.name, back));
    }).catch(() => profileScreen(back));
  }

  function reportScreen(id, name, back) {
    show(`<main class="screen">${bar(`Report ${name}`)}
      <div class="content">
        ${finn("Tell a Tier 3 moderator what happened. False reports can get your own account actioned.")}
        <h2>Report ${esc(name)}</h2>
        <form data-form>
          <textarea data-reason rows="4" style="width:100%;padding:0.75rem;border:1px solid #cbd5e1;border-radius:0.5rem;font:inherit" placeholder="What happened?" required></textarea>
        </form>
      </div>
      <div class="footer between">
        <button class="btn secondary" data-back>Cancel</button>
        <button class="btn" data-submit>Submit report</button>
      </div>
    </main>`);
    on("[data-back]", "click", () => playerScreen(id, back));
    on("[data-submit]", "click", async () => {
      const reason = app.querySelector("[data-reason]").value.trim();
      if (!reason) return;
      try {
        await apiJson("/api/admin/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportedUserId: id, reason }),
        });
      } catch {}
      playerScreen(id, back);
    });
  }

  // ---- Free roam: travel between tiers (champions only) ---------------------------
  function travelButton() {
    return freeRoam() ? `<button class="btn sm secondary" data-travel title="Travel to any tier">🌍 Travel</button>` : "";
  }
  function travel(back) {
    if (!freeRoam()) return back();
    show(`<main class="screen">${bar("Travel")}
      <div class="content">
        <h2>🌍 Travel</h2>
        <p class="small muted">You've beaten ${esc(GUIDE.name)}, so every planet is open. Your XP and progress come with you, and finished contests can be played again.</p>
        <div class="levels">${CHAIN.map((name, i) => {
          const t = GAME_DATA.tiers[name];
          const current = i === state.tierIndex;
          const stadiums = t.tournament ? DIAMOND.name : t.stadiums.map((x) => x.name).join(", ");
          return `<div class="level">
            <div><strong>${esc(name)}</strong>${current ? ` <span class="tag">here</span>` : ""}<div class="small muted">${esc(stadiums)}</div></div>
            <button class="btn sm ${current ? "secondary" : ""}" data-go="${i}" ${current ? "disabled" : ""}>Go</button>
          </div>`;
        }).join("")}</div>
      </div>
      <div class="footer between"><button class="btn secondary" data-back>Back</button></div>
    </main>`);
    on("[data-go]", "click", (e) => {
      state.tierIndex = Number(e.currentTarget.dataset.go);
      state.introDone = true;
      saveState();
      planet();
    });
    on("[data-back]", "click", () => back());
  }

  // ---- Meteor Showdown ---------------------------------------------------------------------
  const MS = GAME_DATA.meteorShowdown;

  function meteorShowdown(back) {
    const armor = Array.from({ length: MS.rows + 1 }, () => Array(MS.cols + 1).fill(MS.armorStart));
    const crew = { ...MS.crewStart };
    let supply = MS.startSupply;
    let wave = 1;
    let mode = "armor";      // "armor" | "move"
    let phase = "build";     // "build" | "won" | "lost"
    let log = ["Supplies dropped. Armor the ground above your crew or move them somewhere safer, then launch the wave."];
    let meteors = genWave(wave);

    function genWave(w) {
      return Array.from({ length: MS.meteorsForWave(w) }, () => ({ col: rnd(1, MS.cols), power: MS.powerForWave(w) }));
    }
    function incoming() {
      const inc = Array(MS.cols + 1).fill(0);
      for (const m of meteors) {
        inc[m.col] += m.power;
        const splash = Math.floor(m.power / 2);
        if (m.col > 1) inc[m.col - 1] += splash;
        if (m.col < MS.cols) inc[m.col + 1] += splash;
      }
      return inc;
    }
    const say = (t) => { log.push(t); log = log.slice(-5); };
    const crewDefense = () => { let d = 0; for (let r = 1; r < crew.row; r++) d += armor[r][crew.col]; return d; };

    function clickCell(r, c) {
      if (phase !== "build") return;
      const isCrew = crew.row === r && crew.col === c;
      if (mode === "armor") {
        if (isCrew) return say("That's the bunker itself. Armor the ground above it instead.");
        if (armor[r][c] >= MS.armorMax) return say("That cell is fully armored.");
        if (supply < MS.armorCost) return say("Out of supplies. Launch the wave.");
        armor[r][c] += 1;
        supply -= MS.armorCost;
      } else {
        if (isCrew) return;
        if (supply < MS.moveCost) return say(`Moving the crew costs ${MS.moveCost} supplies.`);
        crew.row = r;
        crew.col = c;
        supply -= MS.moveCost;
        say(`Crew moved to column ${c}, depth ${r}.`);
      }
      render();
    }

    function buySupplies(qty) {
      qty = Math.max(1, Math.floor(qty || 0));
      const cost = qty * MS.supplyPrice;
      if (!canAfford(cost)) { say(`You need ${fmtXp(cost)} XP for ${qty} supplies.`); return render(); }
      spendXp(cost);
      saveState();
      supply += qty;
      say(`Bought ${qty} supplies for ${fmtXp(cost)} XP.`);
      render();
    }

    function launch() {
      const inc = incoming();
      const notes = [];
      let lost = false;
      for (let c = 1; c <= MS.cols; c++) {
        let power = inc[c];
        if (!power) continue;
        let chewed = 0;
        for (let r = 1; r <= MS.rows && power > 0; r++) {
          if (crew.row === r && crew.col === c) { lost = true; break; }
          const take = Math.min(armor[r][c], power);
          armor[r][c] -= take;
          power -= take;
          chewed += take;
        }
        notes.push(`col ${c}: ${inc[c]} power, ${chewed} armor destroyed${lost && crew.col === c ? ", bunker breached!" : power > 0 ? ", bottomed out" : ""}`);
      }
      say(`Wave ${wave}: ${notes.join(" · ")}`);
      if (lost) {
        phase = "lost";
        say("A meteor reached the crew. The bunker is gone.");
        return render();
      }
      wave += 1;
      if (wave > MS.waves) {
        phase = "won";
        state.meteor.wins += 1;
        saveState();
        unlock("protector");
        say("The sky is clear. Everyone made it.");
        return render();
      }
      supply += MS.supplyPerWave;
      meteors = genWave(wave);
      say(`Wave ${wave} incoming. +${MS.supplyPerWave} supplies.`);
      render();
    }

    function render() {
      const inc = incoming();
      const counts = Array(MS.cols + 1).fill(0);
      meteors.forEach((m) => (counts[m.col] += 1));
      const grid = `<div class="bunker-wrap"><div class="bunker" style="grid-template-columns: 2.4rem repeat(${MS.cols}, minmax(2.6rem, 1fr))">
        <div class="bunker-corner"></div>
        ${Array.from({ length: MS.cols }, (_, i) => i + 1).map((c) => `<div class="sky ${inc[c] >= crewDefense() + 1 && c === crew.col ? "danger" : ""}">
          <div>${"☄️".repeat(counts[c]) || "·"}</div>
          <div class="small">${inc[c]} power</div>
        </div>`).join("")}
        ${Array.from({ length: MS.rows }, (_, i) => i + 1).map((r) => `<div class="depth small muted" title="Depth ${r}">D${r}</div>` + Array.from({ length: MS.cols }, (_, j) => j + 1).map((c) => {
          const isCrew = crew.row === r && crew.col === c;
          const a = armor[r][c];
          return `<button class="cell ${isCrew ? "crew" : ""} a${a}" data-cell="${r},${c}" ${phase !== "build" ? "disabled" : ""} title="${isCrew ? "Your crew" : `Armor ${a}/${MS.armorMax}`}">
            ${isCrew ? "👥" : `<span class="pips">${"▮".repeat(a)}${"▯".repeat(MS.armorMax - a)}</span>`}
          </button>`;
        }).join("")).join("")}
      </div></div>`;

      show(`<main class="screen">${bar("Meteor Showdown")}
        <div class="content">
          <div class="ms-head">
            <div><strong>Wave ${Math.min(wave, MS.waves)} of ${MS.waves}</strong> · Supplies: <strong>${supply}</strong></div>
            <div class="small muted">Armor above the crew: ${crewDefense()} · incoming on their column: ${inc[crew.col]}</div>
          </div>
          ${phase === "build" ? `<div class="ms-modes">
            <button class="btn sm ${mode === "armor" ? "" : "secondary"}" data-mode="armor">Reinforce (+1 armor, ${MS.armorCost} supply)</button>
            <button class="btn sm ${mode === "move" ? "" : "secondary"}" data-mode="move">Move crew (${MS.moveCost} supplies)</button>
          </div>
          <form class="ms-shop" data-buy-supplies>
            <span class="small">Buy protective supplies with XP · ${fmtXp(MS.supplyPrice)} XP each · you have ${xpText()} XP</span>
            <input type="number" min="1" max="50" step="1" value="5" aria-label="Supplies to buy">
            <button type="submit" class="btn sm secondary">Buy</button>
          </form>` : ""}
          ${grid}
          <p class="small muted">Meteors burrow straight down their column, destroying one armor point per power. Neighbouring columns take half-power splash. If any power is left when a meteor reaches the crew's cell, the round is over. Damage stays between waves.</p>
          ${phase === "won" ? `<p class="notice-light">🛡️ You survived all ${MS.waves} waves. Protector!</p>` : phase === "lost" ? `<p class="notice-light">☄️ The bunker was breached on wave ${wave}. Better luck next round.</p>` : ""}
          <div class="battle-log">${log.map((l) => `<div>${esc(l)}</div>`).join("")}</div>
        </div>
        <div class="footer between">
          <button class="btn secondary" data-quit>${phase === "build" ? "Abandon round" : "Back to games"}</button>
          ${phase === "build" ? `<button class="btn" data-launch>Launch wave ${wave}</button>` : ""}
        </div>
      </main>`);
      on("[data-cell]", "click", (e) => { const [r, c] = e.currentTarget.dataset.cell.split(",").map(Number); clickCell(r, c); });
      on("[data-mode]", "click", (e) => { mode = e.currentTarget.dataset.mode; render(); });
      on("[data-launch]", "click", launch);
      const shop = app.querySelector("[data-buy-supplies]");
      if (shop) shop.addEventListener("submit", (e) => { e.preventDefault(); buySupplies(Number(shop.querySelector("input").value)); });
      on("[data-quit]", "click", async () => {
        if (phase === "build" && !(await askConfirm("Abandon this round? The XP is spent either way."))) return;
        games(back);
      });
    }
    render();
  }

  // ---- contest engine ------------------------------------------------------
  // opts: { id, name, questions, guided, awardsXp, isCoronation, bonus, onFinish }
  function runContest(opts) {
    const qs = opts.questions.map((q) => ({ ...q, attempts: 0, status: "open", gaveUp: false }));
    const totalPoints = totalPts(qs);
    let firstResultSeen = false;
    const isClosed = (q) => q.status === "green" || q.status === "yellow" || q.status === "purple";

    show(`<main class="screen">${bar(opts.name)}
      <div class="content">
        ${opts.guided ? finn("Here's your first contest. Type an answer and hit Submit. I'll walk you through what the marks mean.") : ""}
        <h2>${esc(opts.name)}</h2>
        <p class="small muted">${qs.length} questions · ${fmtXp(totalPoints)} ${opts.isCoronation ? "points" : "XP"} · 2 tries each${opts.bonus ? ` · perfect score unlocks a bonus question (+${fmtXp(opts.bonus.xp)} XP)` : ""}</p>
        ${qs.map((q, i) => `<div class="question" data-q="${i}">
          <div class="qhead"><strong>Question ${i + 1} <span class="muted small">· ${fmtXp(q.points)} pts</span>${q.tag ? `<span class="qtag">${esc(q.tag)}</span>` : ""}</strong>${markEl("open")}</div>
          <p class="qtext">${esc(q.q)}</p>
          <form class="answer" data-form>
            <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Your answer" aria-label="Answer to question ${i + 1}">
            <button type="submit" class="btn sm" data-submit>Submit</button>
            <button type="button" class="btn sm secondary" data-giveup>Give up</button>
          </form>
          <div class="tries">2 tries left</div>
        </div>`).join("")}
      </div>
      <div class="footer between">
        <button class="btn secondary" data-giveup-all>Give up remaining</button>
        <button class="btn" data-finish disabled>Finish contest</button>
      </div>
    </main>`);

    const finishBtn = app.querySelector("[data-finish]");
    const giveUpAllBtn = app.querySelector("[data-giveup-all]");
    const finnText = app.querySelector("#finn-text");

    function say(text) {
      if (finnText) finnText.textContent = text;
    }

    function paint(i) {
      const q = qs[i];
      const box = app.querySelector(`[data-q="${i}"]`);
      box.querySelector(".mark").outerHTML = markEl(q.status);
      const left = 2 - q.attempts;
      box.querySelector(".tries").textContent =
        q.status === "green" ? "Right on the 1st try · full points" :
        q.status === "yellow" ? "Right on the 2nd try · half points" :
        q.status === "purple" ? (q.gaveUp ? "Given up" : "Wrong on both tries") :
        `${left} ${left === 1 ? "try" : "tries"} left`;
      if (isClosed(q)) {
        box.classList.add("closed");
        box.querySelector("input").disabled = true;
        box.querySelectorAll("button").forEach((b) => (b.disabled = true));
      }
      const allDone = qs.every(isClosed);
      finishBtn.disabled = !allDone;
      giveUpAllBtn.disabled = allDone;
      if (opts.guided && allDone) say("That's every question. Hit Finish contest to see your score and how XP gets awarded.");
    }

    function submit(i) {
      const q = qs[i];
      if (isClosed(q)) return;
      const box = app.querySelector(`[data-q="${i}"]`);
      const input = box.querySelector("input");
      if (!normalize(input.value)) {
        input.focus();
        return;
      }
      q.attempts += 1;
      const correct = isCorrect(q, input.value);
      if (!correct) q.given = input.value;   // kept for AI review
      if (correct) q.status = q.attempts === 1 ? "green" : "yellow";
      else q.status = q.attempts === 1 ? "red" : "purple";
      if (correct) streakHit(); else streakBreak();

      if (opts.guided) {
        if (!firstResultSeen) {
          firstResultSeen = true;
          say(q.status === "green"
            ? "Green check! Right on the first try, so that's full points."
            : "Red X: that one's wrong, but you still have one more try. Get it now for a yellow check and half points.");
        } else if (q.status === "yellow") {
          say("Yellow check. Second-try answers earn half the points.");
        } else if (q.status === "purple") {
          say("Purple X. Both tries used, so no points on that one. On to the next.");
        }
      }
      if (q.status === "red") input.select();
      paint(i);
      if (isClosed(q)) {
        problemDone();
        const nextOpen = app.querySelector(`[data-q="${i + 1}"] input`);
        if (nextOpen && !nextOpen.disabled) nextOpen.focus();
      }
    }

    function giveUp(i) {
      const q = qs[i];
      if (isClosed(q)) return;
      q.status = "purple";
      q.gaveUp = true;
      q.attempts = 2;
      streakBreak();
      problemDone();
      paint(i);
    }

    app.querySelectorAll("[data-q]").forEach((box) => {
      const i = Number(box.dataset.q);
      box.querySelector("[data-form]").addEventListener("submit", (e) => {
        e.preventDefault();
        submit(i);
      });
      box.querySelector("[data-giveup]").addEventListener("click", () => giveUp(i));
    });
    giveUpAllBtn.addEventListener("click", async () => {
      if (await askConfirm("Give up on all remaining questions?")) qs.forEach((_, i) => giveUp(i));
    });
    finishBtn.addEventListener("click", finish);

    function finish() {
      const earned = qs.reduce((t, q) => t + (q.status === "green" ? q.points : q.status === "yellow" ? q.points / 2 : 0), 0);
      const wrong = qs.filter((q) => q.status === "purple").length;
      const result = { earned, total: totalPoints, marks: qs.map((q) => q.status), wrong, bonus: null };
      state.results[opts.id] = result;
      if (opts.awardsXp) state.xp += earned;
      saveState();
      const perfect = qs.every((q) => q.status === "green");
      if (!opts.guided) {
        unlock("player");
        if (opts.level === 3) unlock("daredevil");
        if (perfect) unlock("perfect");
        checkLevel3Sets();
      }
      if (perfect && opts.bonus) bonusRound(opts, qs, result);
      else results(opts, qs, result);
    }
  }

  // ---- bonus round: one question, one try, bonus XP if correct -----------
  function bonusRound(opts, qs, result) {
    const b = opts.bonus;
    const q = b.make();
    show(`<main class="screen">${bar("Bonus round")}
      <div class="content">
        ${finn(`Perfect score! That unlocks the bonus round: one ${b.label} question, one try, +${fmtXp(b.xp)} XP if you get it.`)}
        <h2>Bonus round</h2>
        <div class="bonus-box">
          <p class="qtext">${esc(q.q)}</p>
          <form class="answer" data-form>
            <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Your answer" aria-label="Bonus answer" autofocus>
            <button type="submit" class="btn sm">Submit</button>
          </form>
        </div>
      </div>
      <div class="footer between">
        <button class="btn secondary" data-skip>Skip bonus</button>
      </div>
    </main>`);

    function settle(correct) {
      result.bonus = { q: q.q, correct, xp: b.xp };
      if (correct) state.xp += b.xp;
      state.results[opts.id] = result;
      saveState();
      results(opts, qs, result);
    }
    app.querySelector("[data-form]").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = app.querySelector("[data-form] input");
      if (!normalize(input.value)) return input.focus();
      const ok = isCorrect(q, input.value);
      ach.bonusAnswered += 1;
      if (ach.bonusAnswered >= 10) unlock("show");
      if (ok) streakHit(); else streakBreak();
      problemDone();
      saveAch();
      settle(ok);
    });
    on("[data-skip]", "click", () => settle(false));
  }

  // ---- AI review -----------------------------------------------------------
  // A wrong question and only the right answer next to it teaches nothing, so
  // any question you missed can be handed to Finn for a worked explanation.
  // The server does the asking (and the rate limiting); it also decides whether
  // the feature exists at all, via API.aiReview.
  const canExplain = () => !!API.aiReview;

  function explainRow(i) {
    return `<div class="explain-row">
      <button class="btn sm secondary" data-explain="${i}">✨ Explain it</button>
      <div class="explain" data-explain-box="${i}" hidden></div>
    </div>`;
  }

  // `items` maps a row index to what the server needs: { question, answer, given, topic }.
  function wireExplain(items) {
    on("[data-explain]", "click", async (e) => {
      const button = e.currentTarget;
      const i = button.dataset.explain;
      const box = app.querySelector(`[data-explain-box="${i}"]`);
      const item = items[i];
      if (!item) return;
      if (box.dataset.filled) {                     // already fetched: just fold it away
        box.hidden = !box.hidden;
        button.textContent = box.hidden ? "✨ Explain it" : "Hide the explanation";
        return;
      }
      if (!API.me) {
        box.hidden = false;
        box.innerHTML = `<p class="small muted">AI review needs an account, so your daily allowance can be counted. <a class="link-btn" href="/login">Sign in</a> and take another look.</p>`;
        return;
      }
      button.disabled = true;
      box.hidden = false;
      box.innerHTML = `<p class="small muted">Finn is working it out…</p>`;
      let result = null;
      let why = "";
      try {
        result = await apiJson("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
      } catch (ex) {
        why = String(ex.message) === "429" ? "That's your AI reviews used up for today. They come back 24 hours after each one."
          : String(ex.message) === "503" ? "AI review isn't switched on for this server."
          : "Finn couldn't get to that one. Try again in a moment.";
      }
      button.disabled = false;
      if (!result) {
        box.innerHTML = `<p class="small muted">${esc(why)}</p>`;
        return;
      }
      box.dataset.filled = "1";
      box.innerHTML = `<p class="explain-text">${esc(result.explanation)}</p>`;
      button.textContent = "Hide the explanation";
    });
  }

  // ---- results ---------------------------------------------------------------
  function results(opts, qs, result) {
    const pct = Math.round((result.earned / result.total) * 100);
    const c = tier() && tier().coronation;
    const passed = opts.isCoronation && c && result.wrong <= c.maxWrong;
    let headline;
    if (opts.guided) {
      headline = "Demo over. XP from the demo doesn't count, but from here on every contest earns you XP.";
    } else if (opts.isCoronation) {
      headline = passed
        ? `${result.wrong} wrong. That's a coronation! Promotion time.`
        : `${result.wrong} wrong. You need ${c.maxWrong} or fewer to be crowned. The next attempt opens in ${c.cooldownHours} hours.`;
    } else if (result.bonus) {
      headline = result.bonus.correct
        ? `Perfect contest and you nailed the bonus: ${fmtXp(result.earned)} XP plus ${fmtXp(result.bonus.xp)} bonus XP.`
        : `Perfect contest for ${fmtXp(result.earned)} XP. The bonus question got away, but that's still a clean sweep.`;
    } else {
      headline = `You earned ${fmtXp(result.earned)} XP. Contests can't be retaken, so on to the next one.`;
    }

    show(`<main class="screen">${bar(opts.name)}
      <div class="content">
        ${finn(headline)}
        <h2>${esc(opts.name)}</h2>
        <div class="score">${fmtXp(result.earned)} / ${fmtXp(result.total)} <span class="muted" style="font-size:1rem;font-weight:500">points · ${pct}%${opts.isCoronation ? ` · ${result.wrong} wrong` : ""}</span></div>
        ${opts.awardsXp ? `<p><strong>+${fmtXp(result.earned)} XP</strong>${result.bonus && result.bonus.correct ? ` <strong>+${fmtXp(result.bonus.xp)} bonus XP</strong>` : ""} awarded. Total: ${fmtXp(state.xp)} XP.</p>` : ""}
        ${qs.map((q, i) => {
          // "Wrong" here means it took more than one try, or never landed at all.
          const missed = q.status === "yellow" || q.status === "purple";
          return `<div class="result-row">${markEl(q.status)}<span>${i + 1}. ${esc(q.q)} <span class="muted">→ ${esc(q.a[0])}</span>${q.tag ? `<span class="qtag">${esc(q.tag)}</span>` : ""}</span></div>${
            missed && canExplain() ? explainRow(i) : ""}`;
        }).join("")}
        ${result.bonus ? `<div class="result-row">${markEl(result.bonus.correct ? "green" : "purple")}<span>Bonus: ${esc(result.bonus.q)} · ${result.bonus.correct ? `+${fmtXp(result.bonus.xp)} XP` : "no bonus"}</span></div>` : ""}
        ${legend()}
      </div>
      <div class="footer"><button class="btn" data-next>${opts.guided ? "Learn the System" : passed ? "Get promoted" : opts.isCoronation ? "Back to the planet" : "Back to the stadium"}</button></div>
    </main>`);
    on("[data-next]", "click", () => opts.onFinish(result));
    wireExplain(Object.fromEntries(qs.map((q, i) => [i, {
      question: q.q, answer: q.a[0], given: q.given || "", topic: q.tag || opts.name,
    }])));
  }

  // ==========================================================================
  // DIAMOND ARENA — 64-player single-elimination tournament
  // ==========================================================================
  const diamondIntroLines = () => [
    `Welcome to Diamond, ${displayName()}. There's only one stadium up here: the Arena.`,
    `${DIAMOND.players} players enter, single elimination. Every round you're paired at random, you both get the same ${DIAMOND.questionsPerMatch} questions, and whoever finishes faster wins.`,
    `A wrong answer just costs you time, so keep typing. Skipping a question adds ${DIAMOND.skipPenaltySeconds} seconds. Lose once and you're out, but you can always enter the next tournament.`,
    "Win five rounds and you'll meet me in the final. Beat me, and you become the Ruler of the M Games. After that you can rematch me whenever you like.",
  ];

  function diamondIntro(step) {
    const lines = diamondIntroLines();
    const last = step === lines.length - 1;
    show(`<main class="screen">${bar("Diamond")}
      <div class="content center">${finnSolo(lines[step])}</div>
      <div class="footer"><button class="btn" data-next>${last ? "Enter the Arena" : "Continue"}</button></div>
    </main>`);
    on("[data-next]", "click", () => {
      if (last) { state.introDone = true; saveState(); diamond(); }
      else diamondIntro(step + 1);
    });
  }

  const roundName = (i) => DIAMOND.rounds[i];
  const isFinal = (i) => i === DIAMOND.rounds.length - 1;
  const pickOpponent = (i) => (isFinal(i) ? GUIDE.name : DIAMOND.aiNames[rnd(0, DIAMOND.aiNames.length - 1)]);

  function diamond(notice) {
    if (typeof notice !== "string") notice = "";
    const t = tier();
    const d = state.diamond;
    const bracket = DIAMOND.rounds.map((name, i) => {
      let status, cls;
      if (d.active && i < d.round) { status = "Won"; cls = "won"; }
      else if (d.active && i === d.round) { status = `Up next · vs ${d.opponent}`; cls = "current"; }
      else { status = isFinal(i) ? `vs ${GUIDE.name}` : "—"; cls = ""; }
      return `<li class="round ${cls}"><span>${esc(name)}</span><span class="muted small">${esc(status)}</span></li>`;
    }).join("");

    let actions;
    if (d.active) actions = `<button class="btn" data-play>Play the ${esc(roundName(d.round))}</button>`;
    else actions = `<button class="btn" data-enter>${state.titles ? "Enter another tournament" : "Enter the tournament"}</button>`;
    if (state.champion) actions += `<button class="btn secondary" data-rematch>Rematch ${esc(GUIDE.name)}</button>`;
    if (state.champion) actions += `<button class="btn secondary" data-arena>🏟 Arena of Champions</button>`;
    if (isAdmin()) actions += `<button class="btn secondary" data-autobeat title="Admin: win the Final in 1.0s">⚙ Auto-beat Finn</button>`;

    show(`<main class="screen space">
      <div class="topbar">
        <div class="brand">M Games</div>
        <div class="topbar-right">${adminButton()}${councilButton()}${huntButton()}${travelButton()}<button class="btn sm secondary" data-mmc title="M Math Competition">📋 MMC</button><button class="btn sm secondary" data-contests title="Contests written by other players">📝 Contests</button><button class="btn sm secondary" data-forum title="Discuss problems with other players">💬 Forum</button><button class="btn sm secondary" data-games title="Other games">🎮 Games</button>${achButton()}${profileCard()}</div>
      </div>
      <div class="planet-area">
        <div class="planet arena" ${themeStyle(t)}>
          <div class="planet-name">${state.champion ? "👑" : "◆"}</div>
          <div class="planet-sub">${esc(DIAMOND.name)} · Diamond tier</div>
          ${state.champion ? `<div class="ruler">Ruler of the M Games · ${state.titles} title${state.titles === 1 ? "" : "s"} · vs ${esc(GUIDE.name)}: ${state.finnRecord.wins}–${state.finnRecord.losses}</div>` : ""}
          ${notice ? `<div class="notice">${esc(notice)}</div>` : ""}
          <ol class="bracket">${bracket}</ol>
          <div class="arena-actions">${actions}</div>
        </div>
      </div>
      <div class="footer between">
        <button class="btn link" data-reset>Reset progress</button>
        <button class="btn secondary" data-home>Back to start</button>
      </div>
    </main>`);

    on("[data-enter]", "click", () => {
      state.diamond = { active: true, round: 0, opponent: pickOpponent(0) };
      saveState();
      diamond();
    });
    on("[data-play]", "click", () => match({ round: d.round, opponent: d.opponent, rematch: false }));
    on("[data-rematch]", "click", () => match({ round: DIAMOND.rounds.length - 1, opponent: GUIDE.name, rematch: true }));
    on("[data-arena]", "click", () => arenaScreen());
    on("[data-autobeat]", "click", adminAutoBeatFinn);
    on("[data-home]", "click", welcome);
    on("[data-reset]", "click", confirmReset);
    on("[data-achievements]", "click", () => achievementsScreen(diamond));
    on("[data-admin]", "click", () => adminPanel(diamond));
    on("[data-council]", "click", () => councilScreen(diamond));
    on("[data-hunt]", "click", () => huntScreen(diamond));
    on("[data-games]", "click", () => games(diamond));
    on("[data-contests]", "click", () => contestList(diamond));
    on("[data-forum]", "click", () => forumScreen(diamond));
    on("[data-travel]", "click", () => travel(diamond));
    on("[data-profile]", "click", () => profileScreen(diamond));
    on("[data-mmc]", "click", () => mmcHall(diamond));
  }

  // One match: 5 questions against the clock. Wrong answers cost time only.
  function match(opts) {
    const qs = Array.from({ length: DIAMOND.questionsPerMatch }, () => {
      const p = DIAMOND.pool[rnd(0, DIAMOND.pool.length - 1)];
      return { ...p.make(), tag: `${p.tier} · ${p.topic}` };
    });
    const perQ = DIAMOND.aiSecondsPerQuestion[opts.round];
    const aiTime = qs.reduce((t) => t + perQ * (0.75 + Math.random() * 0.5), 0);
    const vsFinn = opts.opponent === GUIDE.name;
    let index = 0, penalty = 0, wrongs = 0, firstCorrectAt = null;
    if (isFinal(opts.round) && !opts.rematch) unlock("finnmatch");
    const started = performance.now();
    const elapsed = () => (performance.now() - started) / 1000 + penalty;

    show(`<main class="screen">${bar(opts.rematch ? `Rematch · vs ${opts.opponent}` : `${roundName(opts.round)} · vs ${opts.opponent}`)}
      <div class="content">
        <div class="match-head">
          <div><div class="small muted">Opponent</div><strong>${esc(opts.opponent)}${vsFinn ? " 👑" : ""}</strong></div>
          <div class="clock" id="clock">0.0s</div>
        </div>
        <div class="small muted" id="progress">Question 1 of ${qs.length}</div>
        <div class="question match-q">
          <div class="qtag" id="qtag"></div>
          <p class="qtext" id="qtext"></p>
          <form class="answer" data-form>
            <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Your answer" aria-label="Answer" autofocus>
            <button type="submit" class="btn sm">Submit</button>
            <button type="button" class="btn sm secondary" data-skip>Skip (+${DIAMOND.skipPenaltySeconds}s)</button>
          </form>
          <div class="tries" id="feedback">Fastest to ${qs.length} correct answers wins.</div>
        </div>
      </div>
      <div class="footer between">
        <button class="btn link" data-forfeit>Forfeit match</button>
      </div>
    </main>`);

    const input = app.querySelector("[data-form] input");
    const clock = app.querySelector("#clock");
    const feedback = app.querySelector("#feedback");
    activeTimer = setInterval(() => { clock.textContent = `${elapsed().toFixed(1)}s`; }, 100);

    function render() {
      const q = qs[index];
      app.querySelector("#progress").textContent = `Question ${index + 1} of ${qs.length}`;
      app.querySelector("#qtag").textContent = q.tag;
      app.querySelector("#qtext").textContent = q.q;
      input.value = "";
      input.focus();
    }
    function advance() {
      index += 1;
      if (index >= qs.length) return finishMatch();
      render();
    }
    function finishMatch() {
      const playerTime = elapsed();
      if (activeTimer) { clearInterval(activeTimer); activeTimer = null; }
      matchResult(opts, { playerTime, aiTime, wrongs, qs, firstCorrectAt });
    }

    app.querySelector("[data-form]").addEventListener("submit", (e) => {
      e.preventDefault();
      if (!normalize(input.value)) return input.focus();
      if (isCorrect(qs[index], input.value)) {
        if (firstCorrectAt === null) firstCorrectAt = elapsed();
        streakHit();
        problemDone();
        feedback.textContent = "Correct!";
        advance();
      } else {
        wrongs += 1;
        streakBreak();
        feedback.textContent = "Not quite. Keep going, the clock is running.";
        input.select();
      }
    });
    on("[data-skip]", "click", () => {
      penalty += DIAMOND.skipPenaltySeconds;
      streakBreak();
      problemDone();
      feedback.textContent = `Skipped. +${DIAMOND.skipPenaltySeconds}s.`;
      advance();
    });
    on("[data-forfeit]", "click", async () => {
      if (!(await askConfirm("Forfeit this match?"))) return;
      if (activeTimer) { clearInterval(activeTimer); activeTimer = null; }
      matchResult(opts, { playerTime: Infinity, aiTime, wrongs, qs, firstCorrectAt, forfeit: true });
    });
    render();
  }

  function matchResult(opts, r) {
    const won = r.playerTime < r.aiTime;
    const final = isFinal(opts.round);
    let headline, next;

    if (opts.opponent === GUIDE.name) {
      if (won) unlock("built");
      else if (opts.rematch) unlock("revenge");
      else {
        unlock("soclose");
        // A sweep: Finn finished all five before the player got a single one right.
        if (r.forfeit || r.firstCorrectAt === null || r.firstCorrectAt >= r.aiTime) unlock("luck");
      }
    }

    if (opts.rematch) {
      state.finnRecord[won ? "wins" : "losses"] += 1;
      headline = won ? "You beat me again. The crown stays exactly where it is." : "Got you this time! The crown is still yours, though. Come back whenever you want another go.";
      next = () => diamond();
    } else if (won && final) {
      const firstTime = !state.champion;
      state.champion = true;
      state.titles += 1;
      state.diamond = { active: false, round: 0, opponent: null };
      headline = `You beat me in the final. ${displayName()}, you are the Ruler of the M Games!`;
      next = firstTime ? () => arenaCutscene() : () => diamond();
    } else if (won) {
      state.diamond.round += 1;
      state.diamond.opponent = pickOpponent(state.diamond.round);
      headline = `You win the ${roundName(opts.round)}! Next up: the ${roundName(opts.round + 1)} against ${state.diamond.opponent}.`;
      next = () => diamond();
    } else {
      state.diamond = { active: false, round: 0, opponent: null };
      headline = `Eliminated in the ${roundName(opts.round)}. Tough break. The next tournament is open whenever you're ready.`;
      next = () => diamond();
    }
    saveState();

    show(`<main class="screen">${bar(opts.rematch ? "Rematch" : roundName(opts.round))}
      <div class="content">
        ${finn(headline)}
        <h2>${won ? "Victory" : "Defeat"}</h2>
        <div class="times">
          <div class="time ${won ? "win" : ""}"><div class="small muted">${esc(displayName())}</div><div class="score">${r.forfeit ? "Forfeit" : `${r.playerTime.toFixed(1)}s`}</div><div class="small muted">${r.wrongs} wrong attempt${r.wrongs === 1 ? "" : "s"}</div></div>
          <div class="time ${won ? "" : "win"}"><div class="small muted">${esc(opts.opponent)}</div><div class="score">${r.aiTime.toFixed(1)}s</div></div>
        </div>
        <h3>The questions</h3>
        ${r.qs.map((q, i) => `<div class="result-row"><span>${i + 1}. ${esc(q.q)} <span class="muted">→ ${esc(q.a[0])}</span><span class="qtag">${esc(q.tag)}</span></span></div>`).join("")}
      </div>
      <div class="footer"><button class="btn" data-next>${won && final && !opts.rematch ? "Claim the crown" : "Back to the Arena"}</button></div>
    </main>`);
    on("[data-next]", "click", next);
  }

  // ---- Arena of Champions ---------------------------------------------------
  // Beating Finn only makes you a Tier 1 Ruler, the lowest rank. The real ladder
  // is a monthly time trial (three tries, fastest one counts, skipping costs a
  // time penalty) tracked server-side across every ruler's account. Until real
  // opponents exist, the field is one placeholder NPC with a fixed unbeatable
  // time -- see NPC_TIME_SECONDS in app/arena.py for the server-side half of this.
  async function arenaEnter() {
    if (!API.me) return;
    try { await apiJson("/api/arena/enter", { method: "POST" }); } catch {}
  }

  function arenaCutscene() {
    arenaEnter();
    show(`<main class="screen">
      <div class="video-area"><div class="video-slot"></div></div>
      <div class="content center">
        <h2 style="text-align:center">The gates of the Arena of Champions open.</h2>
        <p class="muted" style="text-align:center;max-width:32rem">
          Beating ${esc(GUIDE.name)} only makes you a <strong>Tier 1 Ruler</strong> — the lowest rank.
          Somewhere out there, other rulers are already racing the clock for the next promotion.
        </p>
      </div>
      <div class="footer"><button class="btn" data-next>Enter the Arena of Champions</button></div>
    </main>`);
    on("[data-next]", "click", () => arenaScreen());
  }

  async function arenaScreen() {
    if (!API.me) {
      show(`<main class="screen">${bar("Arena of Champions")}
        <div class="content">
          ${finn("The Arena of Champions ranks real rulers against each other, so it only runs for signed-in accounts. Sign in to enter it — your local progress stays right where it is.")}
          <h2>Sign in to enter</h2>
        </div>
        <div class="footer between">
          <button class="btn secondary" data-back>Back to the Arena</button>
          <a class="btn" href="/login">${API.google ? "Sign in with Google" : "Sign in"}</a>
        </div>
      </main>`);
      on("[data-back]", "click", () => diamond());
      return;
    }
    let status = null;
    try { status = await apiJson("/api/arena/status"); } catch {}
    if (!status) {
      show(`<main class="screen">${bar("Arena of Champions")}
        <div class="content">${finn("Couldn't reach the Arena right now. Try again in a moment.")}</div>
        <div class="footer"><button class="btn secondary" data-back>Back to the Arena</button></div>
      </main>`);
      on("[data-back]", "click", () => diamond());
      return;
    }
    if (!status.entered) {
      show(`<main class="screen">${bar("Arena of Champions")}
        <div class="content">${finn(`Beat ${esc(GUIDE.name)} in the Diamond Final first — that's what opens the gates here.`)}</div>
        <div class="footer"><button class="btn secondary" data-back>Back to the Arena</button></div>
      </main>`);
      on("[data-back]", "click", () => diamond());
      return;
    }
    const canPlay = status.attemptsLeft > 0;
    const gotPB = status.personalBestSeconds !== null;
    const board = status.leaderboard || [];
    const leader = board[0];
    const youLead = !!(leader && leader.you);
    show(`<main class="screen">${bar("Arena of Champions")}
      <div class="content">
        <h2>👑 Tier ${status.tier} Ruler</h2>
        <p class="muted">Monthly ladder · ${esc(status.period)} · you're racing every ruler who attempts this month — fastest single time wins.</p>
        <div class="times">
          <div class="time ${youLead ? "win" : ""}">
            <div class="small muted">Your best this month</div>
            <div class="score">${gotPB ? `${status.personalBestSeconds.toFixed(1)}s` : "—"}</div>
          </div>
          <div class="time">
            <div class="small muted">${leader ? (leader.you ? "You're leading" : `Leading: ${esc(leader.name)}`) : "No times set yet"}</div>
            <div class="score">${leader ? `${leader.timeSeconds.toFixed(1)}s` : "—"}</div>
          </div>
        </div>
        <p class="small muted">${status.attemptsLeft} of ${status.maxAttempts} attempts left this month · skipping a question costs +${status.skipPenaltySeconds}s.</p>
        ${board.length ? `
          <h3 style="margin-top:1.5rem">This month's field</h3>
          ${board.map((r, i) => `<div class="admin-row"><div>#${i + 1} ${esc(r.name)}${r.you ? " (you)" : ""}</div><div>${r.timeSeconds.toFixed(1)}s</div></div>`).join("")}
        ` : `<p class="small muted">Nobody has set a time yet this month — be the first.</p>`}
        ${status.lastResult ? `<p class="small muted" style="margin-top:1rem">Last month (${esc(status.lastResult.period)}): ${status.lastResult.noEntrants ? "nobody attempted, so no promotion." : `${esc(status.lastResult.winnerName)} took it at ${status.lastResult.timeSeconds.toFixed(1)}s and was promoted.`}</p>` : ""}
      </div>
      <div class="footer between">
        <button class="btn secondary" data-back>Back to the Arena</button>
        <button class="btn" data-attempt ${canPlay ? "" : "disabled"}>${canPlay ? "Attempt the ladder" : "No attempts left this month"}</button>
      </div>
    </main>`);
    on("[data-back]", "click", () => diamond());
    on("[data-attempt]", "click", () => arenaAttempt(status));
  }

  function arenaAttempt(status) {
    const qs = Array.from({ length: DIAMOND.questionsPerMatch }, () => {
      const p = DIAMOND.pool[rnd(0, DIAMOND.pool.length - 1)];
      return { ...p.make(), tag: `${p.tier} · ${p.topic}` };
    });
    let index = 0, penalty = 0, wrongs = 0;
    const started = performance.now();
    const elapsed = () => (performance.now() - started) / 1000 + penalty;

    show(`<main class="screen">${bar("Arena of Champions")}
      <div class="content">
        <div class="match-head">
          <div><div class="small muted">Attempt ${status.attemptsUsed + 1} of ${status.maxAttempts}</div><strong>${status.leaderboard && status.leaderboard[0] ? `Beat ${esc(status.leaderboard[0].name)}'s ${status.leaderboard[0].timeSeconds.toFixed(1)}s` : "Set the first time this month"}</strong></div>
          <div class="clock" id="clock">0.0s</div>
        </div>
        <div class="small muted" id="progress">Question 1 of ${qs.length}</div>
        <div class="question match-q">
          <div class="qtag" id="qtag"></div>
          <p class="qtext" id="qtext"></p>
          <form class="answer" data-form>
            <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Your answer" aria-label="Answer" autofocus>
            <button type="submit" class="btn sm">Submit</button>
            <button type="button" class="btn sm secondary" data-skip>Skip (+${status.skipPenaltySeconds}s)</button>
          </form>
          <div class="tries" id="feedback">Fastest time wins the month.</div>
        </div>
      </div>
      <div class="footer between">
        <button class="btn link" data-forfeit>Forfeit attempt</button>
      </div>
    </main>`);

    const input = app.querySelector("[data-form] input");
    const clock = app.querySelector("#clock");
    const feedback = app.querySelector("#feedback");
    activeTimer = setInterval(() => { clock.textContent = `${elapsed().toFixed(1)}s`; }, 100);

    function render() {
      const q = qs[index];
      app.querySelector("#progress").textContent = `Question ${index + 1} of ${qs.length}`;
      app.querySelector("#qtag").textContent = q.tag;
      app.querySelector("#qtext").textContent = q.q;
      input.value = "";
      input.focus();
    }
    function advance() {
      index += 1;
      if (index >= qs.length) return finishAttempt();
      render();
    }
    async function finishAttempt() {
      if (activeTimer) { clearInterval(activeTimer); activeTimer = null; }
      const timeSeconds = elapsed();
      let result = null;
      try {
        result = await apiJson("/api/arena/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeSeconds }),
        });
      } catch {}
      arenaResult(timeSeconds, wrongs, result);
    }

    app.querySelector("[data-form]").addEventListener("submit", (e) => {
      e.preventDefault();
      if (!normalize(input.value)) return input.focus();
      if (isCorrect(qs[index], input.value)) {
        streakHit();
        problemDone();
        feedback.textContent = "Correct!";
        advance();
      } else {
        wrongs += 1;
        streakBreak();
        feedback.textContent = "Not quite. Keep going, the clock is running.";
        input.select();
      }
    });
    on("[data-skip]", "click", () => {
      penalty += status.skipPenaltySeconds;
      streakBreak();
      problemDone();
      feedback.textContent = `Skipped. +${status.skipPenaltySeconds}s.`;
      advance();
    });
    on("[data-forfeit]", "click", async () => {
      if (!(await askConfirm("Forfeit this attempt? It won't count toward your 3 tries this month."))) return;
      if (activeTimer) { clearInterval(activeTimer); activeTimer = null; }
      arenaScreen();
    });
    render();
  }

  function arenaResult(timeSeconds, wrongs, result) {
    const leader = result && result.leaderboard && result.leaderboard[0];
    const leading = !!(leader && leader.you);
    show(`<main class="screen">${bar("Arena of Champions")}
      <div class="content">
        ${finn(leading
          ? "You're in the lead! If that holds up when the month closes, you'll be promoted a Ruler tier."
          : "Recorded. You get more tries this month, and a fresh field next month.")}
        <h2>Attempt result</h2>
        <div class="times">
          <div class="time ${leading ? "win" : ""}"><div class="small muted">You</div><div class="score">${timeSeconds.toFixed(1)}s</div><div class="small muted">${wrongs} wrong attempt${wrongs === 1 ? "" : "s"}</div></div>
          ${leader && !leading ? `<div class="time win"><div class="small muted">Leading: ${esc(leader.name)}</div><div class="score">${leader.timeSeconds.toFixed(1)}s</div></div>` : ""}
        </div>
        ${result
          ? `<p class="small muted">${result.attemptsLeft} of ${result.maxAttempts} tries left this month · personal best ${result.personalBestSeconds.toFixed(1)}s</p>`
          : `<p class="small muted">Couldn't reach the server to record this attempt — it may not have been saved.</p>`}
      </div>
      <div class="footer"><button class="btn" data-back>Back to the Arena</button></div>
    </main>`);
    on("[data-back]", "click", () => arenaScreen());
  }

  // ---- Arena governance (Tier 1-4) -------------------------------------------
  async function councilScreen(back, notice) {
    const tier = myTier();
    if (tier < 1) return back();

    show(`<main class="screen">${bar("Arena Governance")}<div class="content"><p class="muted">Loading…</p></div></main>`);
    const [mineData, reportsData] = await Promise.allSettled([
      apiJson("/api/admin/contests"),
      tier >= 3 ? apiJson("/api/admin/reports") : Promise.resolve({ reports: [] }),
    ]);
    const contests = mineData.status === "fulfilled" ? mineData.value.contests : [];
    const reports = reportsData.status === "fulfilled" ? reportsData.value.reports.filter((r) => r.status === "open") : [];

    const inputStyle = "padding:0.6rem;border:1px solid #cbd5e1;border-radius:0.5rem;font:inherit";
    const contestRow = (c) => `<div class="admin-row" style="flex-direction:column;align-items:stretch;gap:0.5rem">
      <div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start">
        <div>
          <strong>${esc(c.title)}</strong> <span class="small muted">· ${esc(c.status)} · ${c.questionCount} question${c.questionCount === 1 ? "" : "s"}${c.mbucksReward ? ` · pays ${fmtXp(c.mbucksReward)} MBucks` : ""}</span>
          <div class="small muted">${esc(c.description)}</div>
          <div class="small muted">by ${esc(c.creatorName || "a player")}${c.status === "approved" ? ` · ${fmtXp(c.takenCount)} sitting${c.takenCount === 1 ? "" : "s"}` : ""}</div>
        </div>
        ${tier >= 3 && c.status === "pending" ? `<span style="display:flex;gap:0.5rem;flex:none">
          <button class="btn sm" data-approve="${c.id}">Approve</button>
          <button class="btn sm secondary" data-reject="${c.id}">Reject</button>
        </span>` : ""}
      </div>
      ${c.questions.length && c.questions.some((q) => q.a !== undefined) ? `<ol class="small muted" style="margin:0;padding-left:1.25rem">
        ${c.questions.map((q) => `<li>${esc(q.q)} → <strong>${esc(q.a)}</strong> · ${fmtXp(q.mbucks)} MBucks</li>`).join("")}
      </ol>` : ""}
    </div>`;
    const reportRow = (r) => `<div class="admin-row">
      <div>
        <strong>${esc(r.reportedName)}</strong>
        <div class="small muted">reported by ${esc(r.reporterName)} · ${esc(r.reason)}</div>
      </div>
      <span style="display:flex;gap:0.5rem">
        ${tier >= 4 ? `<button class="btn sm" data-ban="${r.reportedUserId}">Ban</button>` : ""}
        <button class="btn sm secondary" data-dismiss="${r.id}">Dismiss</button>
      </span>
    </div>`;

    show(`<main class="screen">${bar("Arena Governance")}
      <div class="content">
        <h2>🏛 Tier ${tier} Governance</h2>
        <p class="small muted">Tier 1+ can propose contests. Tier 3 approves them and reviews reports. Tier 4 (the owner) bans players and hands out Tier 3.</p>
        ${notice ? `<p class="notice-light">${esc(notice)}</p>` : ""}

        <h3 style="margin-top:1.5rem">Propose a contest</h3>
        <p class="small muted">Write it out in full: every question, the answer you'll accept, and what that
          question pays. Separate alternative answers with <code>|</code>, as in <code>5 | five</code>.</p>
        <form data-contest-form class="admin-row" style="flex-direction:column;align-items:stretch;gap:0.5rem">
          <input data-title placeholder="Title" maxlength="80" style="${inputStyle}">
          <textarea data-desc rows="2" placeholder="Description" maxlength="1000" style="${inputStyle}"></textarea>
          <div data-questions></div>
          <div style="display:flex;gap:0.5rem;align-items:center">
            <button type="button" class="btn sm secondary" data-add-q>+ Add question</button>
            <span class="small muted" data-total></span>
          </div>
          <button type="submit" class="btn sm">Submit for approval</button>
        </form>

        <h3 style="margin-top:1.5rem">${tier >= 3 ? "All contests" : "Your contests"}</h3>
        ${contests.length ? contests.map(contestRow).join("") : `<p class="small muted">None yet.</p>`}

        ${tier >= 3 ? `
          <h3 style="margin-top:1.5rem">Open reports</h3>
          ${reports.length ? reports.map(reportRow).join("") : `<p class="small muted">No open reports.</p>`}
        ` : ""}

        ${tier >= 4 ? `
          <h3 style="margin-top:1.5rem">Promote to Tier 3</h3>
          <form data-promote-form class="admin-row" style="gap:0.5rem">
            <input data-promote-id type="number" min="1" placeholder="Player ID" style="${inputStyle};width:8rem">
            <button type="submit" class="btn sm">Promote</button>
          </form>
          <p class="small muted">Find a player's ID by opening their profile from the player directory.</p>
        ` : ""}
      </div>
      <div class="footer"><button class="btn secondary" data-back>Back</button></div>
    </main>`);

    const refresh = () => councilScreen(back);
    on("[data-back]", "click", () => back());

    // The authored questions, as rows the writer can add to and take away.
    const qBox = app.querySelector("[data-questions]");
    const totalBox = app.querySelector("[data-total]");
    const readQuestions = () => [...qBox.querySelectorAll("[data-qrow]")].map((row) => ({
      q: row.querySelector("[data-q]").value.trim(),
      a: row.querySelector("[data-a]").value.trim(),
      mbucks: Number(row.querySelector("[data-m]").value) || 0,
    }));
    function paintTotal() {
      const rows = readQuestions();
      totalBox.textContent = `${rows.length} question${rows.length === 1 ? "" : "s"} · pays ${fmtXp(rows.reduce((t, r) => t + r.mbucks, 0))} MBucks in total`;
    }
    function addRow() {
      if (qBox.querySelectorAll("[data-qrow]").length >= 10) return;
      const row = document.createElement("div");
      row.dataset.qrow = "";
      row.style.cssText = "display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center";
      row.innerHTML = `
        <input data-q placeholder="Question" maxlength="1000" style="${inputStyle};flex:2 1 14rem">
        <input data-a placeholder="Answer (a | b)" maxlength="120" style="${inputStyle};flex:1 1 8rem">
        <input data-m type="number" min="0" placeholder="MBucks" style="${inputStyle};width:7rem">
        <button type="button" class="btn sm secondary" data-drop>Remove</button>`;
      qBox.appendChild(row);
      row.querySelector("[data-drop]").addEventListener("click", () => { row.remove(); paintTotal(); });
      row.querySelector("[data-m]").addEventListener("input", paintTotal);
      paintTotal();
    }
    addRow();
    app.querySelector("[data-add-q]").addEventListener("click", addRow);

    app.querySelector("[data-contest-form]").addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = app.querySelector("[data-title]").value.trim();
      const description = app.querySelector("[data-desc]").value.trim();
      const questions = readQuestions().filter((r) => r.q && r.a);
      if (!title || !description) return refresh0("Give the contest a title and a description.");
      if (!questions.length) return refresh0("Every contest needs at least one question with an answer.");
      try {
        await apiJson("/api/admin/contests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, questions }),
        });
      } catch {
        return refresh0("That contest wasn't accepted. Check the questions and try again.");
      }
      refresh();
    });
    function refresh0(msg) { councilScreen(back, msg); }
    on("[data-approve]", "click", async (e) => {
      try { await apiJson(`/api/admin/contests/${e.currentTarget.dataset.approve}/approve`, { method: "POST" }); } catch {}
      refresh();
    });
    on("[data-reject]", "click", async (e) => {
      try { await apiJson(`/api/admin/contests/${e.currentTarget.dataset.reject}/reject`, { method: "POST" }); } catch {}
      refresh();
    });
    on("[data-ban]", "click", async (e) => {
      // Read the id up front: awaiting the dialog outlives the event, and by
      // then e.currentTarget is null (which is why Ban used to do nothing).
      const banId = e.currentTarget.dataset.ban;
      if (!(await askConfirm("Ban this player? They keep their save but can no longer play or save progress."))) return;
      try { await apiJson(`/api/admin/users/${banId}/ban`, { method: "POST" }); } catch {}
      refresh();
    });
    on("[data-dismiss]", "click", async (e) => {
      try { await apiJson(`/api/admin/reports/${e.currentTarget.dataset.dismiss}/dismiss`, { method: "POST" }); } catch {}
      refresh();
    });
    const promoteForm = app.querySelector("[data-promote-form]");
    if (promoteForm) promoteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = Number(app.querySelector("[data-promote-id]").value);
      if (!id) return;
      try {
        await apiJson(`/api/admin/users/${id}/promote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: 3 }),
        });
      } catch {}
      refresh();
    });
  }

  // ---- Player-written contests ------------------------------------------------
  // Approved contests anyone can sit, once each. The answer key never reaches the
  // browser: what you typed goes to the server and comes back marked, so each
  // question pays only if it was actually right.
  async function contestList(back, notice) {
    show(`<main class="screen">${bar("Player contests")}<div class="content"><p class="muted">Loading…</p></div></main>`);
    let list = [];
    let failed = false;
    // Browsing needs no account: the shelf is public so a contest somebody wrote
    // can actually be found. Sitting one still needs signing in.
    try { list = (await apiJson("/api/admin/contests/approved")).contests || []; } catch { failed = true; }

    const card = (c) => {
      const why = c.taken ? `<span class="tag">Taken</span>`
        : c.mine ? `<span class="tag">Yours</span>` : "";
      const sittings = `${fmtXp(c.takenCount)} sitting${c.takenCount === 1 ? "" : "s"}`;
      const action = !API.me
        ? `<a class="btn sm" href="/login">Sign in to take it</a>`
        : c.mine ? `<button class="btn sm" disabled title="You wrote this one">Take it</button>`
        : c.taken ? `<button class="btn sm" disabled title="One sitting each">Taken</button>`
        : `<button class="btn sm" data-take="${c.id}">Take it</button>`;
      return `<div class="admin-row">
        <div>
          <strong>${esc(c.title)}</strong> ${why}
          <div class="small muted">${esc(c.description)}</div>
          <div class="small muted">by ${esc(c.creatorName || "a player")} · ${c.questionCount} question${c.questionCount === 1 ? "" : "s"} · up to ${fmtXp(c.mbucksReward)} MBucks · ${sittings}</div>
        </div>
        <div class="row-actions">
          <button class="btn sm secondary" data-discuss="${c.id}" data-title="${esc(c.title)}">💬 Discuss</button>
          ${action}
        </div>
      </div>`;
    };

    const empty = failed
      ? `<p class="notice-light">The contest shelf couldn't be loaded. Try again in a moment.</p>`
      : `<p class="small muted">Nobody has had a contest approved yet.${myTier() >= 1 ? " You're Tier 1, so you can write the first one from the 🏛 panel." : ""}</p>`;

    show(`<main class="screen">${bar("Player contests")}
      <div class="content">
        <h2>📝 Player contests</h2>
        <p class="small muted">Written by other players and approved by a Tier 3. One sitting each — every question pays its own MBucks.</p>
        ${notice ? `<p class="notice-light">${esc(notice)}</p>` : ""}
        ${!API.me && !failed ? `<p class="notice-light">You're browsing as a guest. Sign in to sit one and keep what it pays.</p>` : ""}
        ${list.length ? list.map(card).join("") : empty}
      </div>
      <div class="footer between">
        <button class="btn secondary" data-back>Back</button>
        <button class="btn secondary" data-forum>💬 Forum</button>
      </div>
    </main>`);
    on("[data-back]", "click", () => back());
    on("[data-forum]", "click", () => forumScreen(() => contestList(back)));
    on("[data-take]", "click", (e) => contestPlay(Number(e.currentTarget.dataset.take), back));
    on("[data-discuss]", "click", (e) => forumScreen(() => contestList(back), {
      contestId: Number(e.currentTarget.dataset.discuss),
      contestTitle: e.currentTarget.dataset.title,
    }));
  }

  async function contestPlay(id, back) {
    let contest = null;
    let why = "";
    try {
      contest = await apiJson(`/api/admin/contests/${id}/play`);
    } catch (err) {
      why = String(err.message) === "409" ? "You've already taken that one — one sitting each."
        : String(err.message) === "403" ? "That's your own contest, so you can't earn from it."
        : "That contest couldn't be opened.";
    }
    if (!contest) return contestList(back, why);

    show(`<main class="screen">${bar(contest.title)}
      <div class="content">
        <h2>${esc(contest.title)}</h2>
        <p class="small muted">${esc(contest.description)}</p>
        <p class="small muted">One sitting, and each question pays on its own. Worth up to ${fmtXp(contest.mbucksReward)} MBucks.</p>
        ${contest.questions.map((q, i) => `<div class="question">
          <div class="qhead"><strong>Question ${i + 1} <span class="muted small">· ${fmtXp(q.mbucks)} MBucks</span></strong></div>
          <p class="qtext">${esc(q.q)}</p>
          <form class="answer" data-answer="${i}" onsubmit="return false">
            <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Your answer" aria-label="Answer to question ${i + 1}">
          </form>
        </div>`).join("")}
      </div>
      <div class="footer between">
        <button class="btn secondary" data-back>Back</button>
        <button class="btn" data-submit>Hand it in</button>
      </div>
    </main>`);
    on("[data-back]", "click", () => contestList(back));
    on("[data-submit]", "click", async () => {
      if (!(await askConfirm("Hand this in? You only get one sitting."))) return;
      const answers = [...app.querySelectorAll("[data-answer] input")].map((i) => i.value);
      let result = null;
      try {
        result = await apiJson(`/api/admin/contests/${id}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });
      } catch {}
      if (!result) return contestList(back, "That submission didn't reach the server — nothing was recorded.");
      contestResult(result, back, answers);
    });
  }

  function contestResult(r, back, given) {
    show(`<main class="screen">${bar(r.title)}
      <div class="content">
        ${finn(r.mbucksEarned > 0
          ? `${r.correct} of ${r.total} right — that's ${fmtXp(r.mbucksEarned)} MBucks in your pocket.`
          : "Nothing landed this time. The MBucks only pay out for correct answers.")}
        <h2>${r.correct} / ${r.total} · ${fmtXp(r.mbucksEarned)} of ${fmtXp(r.mbucksPossible)} MBucks</h2>
        ${r.marks.map((m, i) => `<div class="result-row"><span>
          ${i + 1}. ${esc(m.q)} <span class="muted">→ ${esc(m.answer)}</span>
          <span class="qtag">${m.correct ? `+${fmtXp(m.mbucks)}` : "0"} MBucks</span>
        </span></div>${!m.correct && canExplain() ? explainRow(i) : ""}`).join("")}
      </div>
      <div class="footer between">
        <button class="btn" data-back>Back to contests</button>
        <button class="btn secondary" data-discuss>💬 Discuss these questions</button>
      </div>
    </main>`);
    wireExplain(Object.fromEntries(r.marks.map((m, i) => [i, {
      question: m.q, answer: m.answer, given: (given || [])[i] || "", topic: r.title,
    }])));
    on("[data-back]", "click", () => {
      claimWalletCredits().finally(() => contestList(back));
    });
    on("[data-discuss]", "click", () => {
      claimWalletCredits().finally(() => forumScreen(() => contestList(back), {
        contestId: r.contestId, contestTitle: r.title,
      }));
    });
  }

  // ---- Forum ------------------------------------------------------------------
  // Somewhere to argue about the problems themselves. Reading is open to guests
  // -- a worked answer nobody signed out can find is a worked answer nobody
  // finds -- and posting needs an account. A thread can hang off a player
  // contest, which is what the Discuss buttons open.
  const FORUM_MAX_TITLE = 100;
  const FORUM_MAX_BODY = 4000;

  function agoText(ts) {
    if (!ts) return "";
    const sec = Math.max(0, Math.floor(Date.now() / 1000 - ts));
    if (sec < 60) return "just now";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
    return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const signInPrompt = (what) =>
    `<p class="notice-light">You're reading as a guest. <a class="link-btn" href="/login">Sign in</a> to ${esc(what)}.</p>`;

  // opts: { contestId, contestTitle, notice } -- with a contestId the screen is
  // that one contest's threads instead of the whole board.
  async function forumScreen(back, opts) {
    const o = opts || {};
    const scoped = Number.isFinite(o.contestId);
    const heading = scoped ? `💬 ${o.contestTitle || "Contest"}` : "💬 Forum";
    show(`<main class="screen">${bar("Forum")}<div class="content"><p class="muted">Loading…</p></div></main>`);

    let data = null;
    try {
      data = await apiJson(`/api/forum/threads${scoped ? `?contest=${o.contestId}` : ""}`);
    } catch {}
    if (!data) {
      show(`<main class="screen">${bar("Forum")}
        <div class="content"><h2>${heading}</h2>
          <p class="notice-light">The forum couldn't be loaded. Try again in a moment.</p></div>
        <div class="footer"><button class="btn secondary" data-back>Back</button></div>
      </main>`);
      return on("[data-back]", "click", () => back());
    }

    const threads = data.threads || [];
    const row = (t) => `<div class="thread-row">
      <div>
        <div class="t-title">${esc(t.title)}${t.locked ? ` <span class="tag">Locked</span>` : ""}</div>
        <div class="small muted">by ${esc(t.authorName)} · ${fmtXp(t.replyCount)} repl${t.replyCount === 1 ? "y" : "ies"} · last post ${esc(agoText(t.lastPostAt))}</div>
        ${!scoped && t.contestTitle ? `<div class="small muted">on the contest “${esc(t.contestTitle)}”</div>` : ""}
      </div>
      <button class="btn sm secondary" data-thread="${t.id}">Open</button>
    </div>`;

    show(`<main class="screen">${bar("Forum")}
      <div class="content">
        <h2>${heading}</h2>
        <p class="small muted">${scoped
          ? "Threads about this contest. Say how you got a question, or make the case that an answer is wrong."
          : "Ask about a problem, post how you got it, or argue about an answer. Every thread is public to read."}</p>
        ${o.notice ? `<p class="notice-light">${esc(o.notice)}</p>` : ""}
        ${data.canPost ? "" : data.signedIn
          ? `<p class="notice-light">This account can read the forum but not post in it.</p>`
          : signInPrompt("start a thread or reply")}
        ${threads.length ? threads.map(row).join("")
          : `<p class="small muted">${scoped ? "No threads about this contest yet — start the first one." : "No threads yet. Start the first one."}</p>`}
      </div>
      <div class="footer between">
        <button class="btn secondary" data-back>Back</button>
        ${data.canPost ? `<button class="btn" data-new>New thread</button>` : ""}
      </div>
    </main>`);
    const reopen = (notice) => forumScreen(back, { ...o, notice });
    on("[data-back]", "click", () => back());
    on("[data-thread]", "click", (e) => forumThread(Number(e.currentTarget.dataset.thread), reopen));
    on("[data-new]", "click", () => forumCompose(reopen, o));
  }

  function forumCompose(back, opts) {
    const o = opts || {};
    const scoped = Number.isFinite(o.contestId);
    show(`<main class="screen">${bar("Forum")}
      <div class="content">
        <h2>New thread</h2>
        ${scoped ? `<p class="small muted">This one will be filed under the contest “${esc(o.contestTitle || "")}”.</p>` : ""}
        <p class="small muted">Post the working, not just the answer — that's what makes a thread worth reading.</p>
        <form class="compose" data-form onsubmit="return false">
          <input type="text" data-title maxlength="${FORUM_MAX_TITLE}" placeholder="What's the question?" aria-label="Thread title">
          <textarea data-body maxlength="${FORUM_MAX_BODY}" placeholder="Where you got stuck, what you tried, what you think the answer is…" aria-label="Your first post"></textarea>
        </form>
        <p class="notice-light" data-error hidden></p>
      </div>
      <div class="footer between">
        <button class="btn secondary" data-back>Cancel</button>
        <button class="btn" data-post>Post it</button>
      </div>
    </main>`);
    const err = (msg) => {
      const box = app.querySelector("[data-error]");
      box.textContent = msg;
      box.hidden = false;
    };
    on("[data-back]", "click", () => back());
    on("[data-post]", "click", async (e) => {
      const button = e.currentTarget;
      const title = app.querySelector("[data-title]").value.trim();
      const body = app.querySelector("[data-body]").value.trim();
      if (!title || !body) return err("A thread needs a title and something to say.");
      button.disabled = true;
      let created = null;
      try {
        created = await apiJson("/api/forum/threads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, body, contestId: scoped ? o.contestId : null }),
        });
      } catch (ex) {
        button.disabled = false;
        return err(String(ex.message) === "429"
          ? "That was quick — give it a few seconds between posts."
          : "That didn't post. Check you're still signed in and try again.");
      }
      forumThread(created.id, back);
    });
  }

  async function forumThread(id, back) {
    show(`<main class="screen">${bar("Forum")}<div class="content"><p class="muted">Loading…</p></div></main>`);
    let t = null;
    try { t = await apiJson(`/api/forum/threads/${id}`); } catch {}
    if (!t) return back("That thread couldn't be opened.");

    const post = (p, i) => `<div class="post ${i === 0 ? "op" : ""} ${p.deleted ? "removed" : ""}">
      <div class="post-head">
        <strong>${esc(p.authorName)}${i === 0 ? " · started this" : ""}</strong>
        <span class="small muted">${esc(agoText(p.createdAt))}${p.canDelete ? ` · <button class="btn link" data-del="${p.id}">Delete</button>` : ""}</span>
      </div>
      <p class="post-body">${p.deleted ? "This post was taken down." : esc(p.body)}</p>
    </div>`;

    show(`<main class="screen">${bar("Forum")}
      <div class="content">
        <h2>${esc(t.title)}${t.locked ? ` <span class="tag">Locked</span>` : ""}</h2>
        <p class="small muted">Started by ${esc(t.authorName)} ${esc(agoText(t.createdAt))}${
          t.contestTitle ? ` · on the contest “${esc(t.contestTitle)}”` : ""}</p>
        ${(t.posts || []).map(post).join("")}
        ${t.canPost ? `<form class="compose" onsubmit="return false">
            <textarea data-reply maxlength="${FORUM_MAX_BODY}" placeholder="Add to the thread…" aria-label="Your reply"></textarea>
            <div class="row-actions"><button class="btn" data-send>Post reply</button></div>
          </form>`
          : t.locked ? `<p class="notice-light">This thread is locked — no new replies.</p>`
          : t.signedIn ? `<p class="notice-light">This account can read the forum but not post in it.</p>`
          : signInPrompt("reply")}
        <p class="notice-light" data-error hidden></p>
      </div>
      <div class="footer between">
        <button class="btn secondary" data-back>Back to threads</button>
        ${t.canModerate ? `<button class="btn secondary" data-lock>${t.locked ? "Unlock thread" : "Lock thread"}</button>` : ""}
      </div>
    </main>`);
    const again = () => forumThread(id, back);
    const err = (msg) => {
      const box = app.querySelector("[data-error]");
      box.textContent = msg;
      box.hidden = false;
    };
    on("[data-back]", "click", () => back());
    on("[data-send]", "click", async (e) => {
      const button = e.currentTarget;
      const body = app.querySelector("[data-reply]").value.trim();
      if (!body) return err("Write something first.");
      button.disabled = true;
      try {
        await apiJson(`/api/forum/threads/${id}/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });
      } catch (ex) {
        button.disabled = false;
        return err(String(ex.message) === "429"
          ? "That was quick — give it a few seconds between posts."
          : String(ex.message) === "409" ? "This thread was locked while you were typing."
          : "That reply didn't post. Try again.");
      }
      again();
    });
    on("[data-del]", "click", async (e) => {
      // Read the id before awaiting: once the event has finished dispatching,
      // e.currentTarget is null.
      const postId = e.currentTarget.dataset.del;
      if (!(await askConfirm("Take this post down? The text goes for good."))) return;
      try { await apiJson(`/api/forum/posts/${postId}/delete`, { method: "POST" }); } catch {}
      again();
    });
    on("[data-lock]", "click", async () => {
      try {
        await apiJson(`/api/forum/threads/${id}/${t.locked ? "unlock" : "lock"}`, { method: "POST" });
      } catch {}
      again();
    });
  }

  // ---- Hunt for the Traitor (Tier 2 → Tier 3) --------------------------------
  // Finn opens the directory: profiles, friends, who viewed whom, where accounts
  // have been. Six of them are the ring described in the letters. Naming an
  // innocent wipes the case file, so this has to be read, not brute-forced.
  const achName = (id) => (ACHIEVEMENTS.find((a) => a.id === id) || {}).name || id;
  const fmtWhen = (ts) => (ts
    ? new Date(ts * 1000).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "—");
  const coolText = (sec) => (sec >= 60 ? `${Math.ceil(sec / 60)} min` : `${sec}s`);

  async function huntScreen(back, notice) {
    if (myTier() < 2) return back();
    show(`<main class="screen">${bar("Hunt for the Traitor")}
      <div class="content"><p class="muted">Opening the case file…</p></div></main>`);

    const [statusRes, dossierRes] = await Promise.allSettled([
      apiJson("/api/hunt/status"),
      apiJson("/api/hunt/dossiers"),
    ]);
    if (statusRes.status !== "fulfilled") {
      show(`<main class="screen">${bar("Hunt for the Traitor")}
        <div class="content">${finn("I can't get to the case file right now. Try again in a moment.")}</div>
        <div class="footer"><button class="btn secondary" data-back>Back</button></div>
      </main>`);
      on("[data-back]", "click", () => back());
      return;
    }
    const hunt = statusRes.value;
    const people = dossierRes.status === "fulfilled" ? dossierRes.value.dossiers : [];
    const namedIds = hunt.named.map((n) => n.userId);

    const letter = (l) => `<div class="letter">
      <div class="letter-head">
        <strong>Letter #${l.n}</strong>
        <span class="small muted">${esc(l.from)} → ${esc(l.to)}</span>
      </div>
      <pre class="cipher">${esc(l.body)}</pre>
      ${l.attachment ? `<div class="small muted"><strong>${esc(l.attachment.label)}</strong> — ${l.attachment.rows.map(esc).join(" · ")}</div>` : ""}
      <div class="small muted" style="margin-top:0.5rem">🔑 ${esc(l.hint)} · <a href="${esc(l.tool)}" target="_blank" rel="noopener">open decoder</a></div>
    </div>`;

    const row = (p) => {
      const done = namedIds.includes(p.id);
      return `<button class="player-row ${done ? "you" : ""}" data-dossier="${p.id}">
        <span class="player-body">
          <span class="player-name">${esc(p.name)}${done ? ` <span class="tag">named</span>` : ""}</span>
          <span class="small muted">Tier ${p.accountTier} · ${p.dragonsDefeated} dragon${p.dragonsDefeated === 1 ? "" : "s"} · ${p.petsOwned} pet${p.petsOwned === 1 ? "" : "s"} · ${p.achievements} achievement${p.achievements === 1 ? "" : "s"}</span>
        </span>
      </button>`;
    };

    show(`<main class="screen">${bar("Hunt for the Traitor")}
      <div class="content">
        ${finn(hunt.solved
          ? "That's all six. The ring is finished, and Tier 3 is yours — you can act on reports now, not just file them."
          : hunt.briefing)}
        ${notice ? `<p class="notice-light">${esc(notice)}</p>` : ""}
        <h2>🔎 Named ${hunt.named.length} of ${hunt.needed}</h2>
        ${hunt.cooldownSeconds > 0
          ? `<p class="notice-light">⏳ Finn is still checking your last name — ${coolText(hunt.cooldownSeconds)} before you can name anyone else.</p>`
          : ""}
        ${hunt.named.length
          ? `<p class="small muted">So far: ${hunt.named.map((n) => esc(n.name)).join(", ")}</p>`
          : `<p class="small muted">Name an innocent player and I won't take another name from you for ten minutes.</p>`}

        <h3 style="margin-top:1.5rem">The intercepted letters</h3>
        ${hunt.letters.map(letter).join("")}

        <h3 style="margin-top:1.5rem">The directory</h3>
        <p class="small muted">Every account, with its friends, its visitors, and where it has been. Open a file to read it.</p>
        ${people.map(row).join("")}
      </div>
      <div class="footer"><button class="btn secondary" data-back>Back</button></div>
    </main>`);
    on("[data-back]", "click", () => back());
    on("[data-dossier]", "click", (e) => {
      const id = Number(e.currentTarget.dataset.dossier);
      huntDossier(people.find((p) => p.id === id), hunt, back);
    });
  }

  function huntDossier(p, hunt, back) {
    if (!p) return huntScreen(back);
    const named = hunt.named.some((n) => n.userId === p.id);
    const line = (label, value) => `<div class="admin-row"><div><strong>${label}</strong></div><div class="small" style="text-align:right">${value}</div></div>`;

    show(`<main class="screen">${bar(p.name)}
      <div class="content">
        <h2>${esc(p.name)}</h2>
        <p class="small muted">Tier ${p.accountTier} · ${esc(p.tier)} tier · ${fmtXp(p.xp)} XP · joined ${esc(fmtDay(p.joined))}</p>

        ${line("Dragon bosses beaten", p.dragonsDefeated)}
        ${line("Pets owned", p.petsOwned)}
        ${line("Achievements", (p.achievementIds || []).length ? (p.achievementIds || []).map((a) => esc(achName(a))).join(", ") : "none")}
        ${line("Friends", p.friends.length
          ? p.friends.map((f) => `${esc(f.name)}${f.status === "pending" ? ` <span class="muted">(request ${f.requestedByThem ? "they sent" : "sent to them"}, not accepted)</span>` : ""}`).join("<br>")
          : "none")}
        ${line("Viewed their profile", p.viewedBy.length ? p.viewedBy.map((v) => esc(v.name)).join(", ") : "nobody")}
        ${line("Movements", p.activity.length
          ? p.activity.map((a) => `${esc(a.event)} ${esc(a.location)}<br><span class="muted">${esc(fmtWhen(a.at))}</span>`).join("<br>")
          : "nothing logged")}
        ${line("Ruler Qualifier", p.qualifier
          ? `answers ${p.qualifier.answers.join(", ")}<br><span class="muted">scored ${p.qualifier.score}/5${p.qualifier.won ? " · won" : ""}</span>`
          : "did not enter")}
      </div>
      <div class="footer between">
        <button class="btn secondary" data-back>Back to the directory</button>
        ${hunt.solved || named || hunt.cooldownSeconds > 0
          ? `<button class="btn" disabled>${named ? "Already named" : hunt.solved ? "Case closed" : `Wait ${coolText(hunt.cooldownSeconds)}`}</button>`
          : `<button class="btn" data-accuse>Name as traitor</button>`}
      </div>
    </main>`);
    on("[data-back]", "click", () => huntScreen(back));
    on("[data-accuse]", "click", async () => {
      if (!(await askConfirm(`Name ${p.name} as one of the six? If they are innocent, Finn won't take another name for ten minutes.`))) return;
      let res = null;
      let failed = "";
      try {
        res = await apiJson("/api/hunt/accuse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: p.id }),
        });
      } catch (err) {
        // A refusal and a dead connection are different problems; say which.
        failed = String(err.message) === "409" ? "Finn has already closed this case."
          : String(err.message) === "429" ? "Finn is still checking your last name. Give it a few minutes."
          : "That accusation never reached Finn. Try again.";
      }
      if (!res) return huntScreen(back, failed);
      if (res.solved) {
        if (API.me) API.me.tier = res.tier;
        return huntScreen(back, `That is all six. You are a Tier ${res.tier} ruler now.`);
      }
      if (res.correct) return huntScreen(back, `${p.name} was one of them. ${res.named.length} of ${res.needed} named.`);
      return huntScreen(back, `${p.name} was innocent. Finn won't take another name for ten minutes.`);
    });
  }

  function bannedScreen() {
    show(`<main class="screen">
      <div class="content center">
        <h2>Account banned</h2>
        <p class="muted" style="max-width:28rem;text-align:center">
          A Tier 3 moderator has banned this account for a reported violation.
          Your saved progress is preserved but can no longer be changed.
        </p>
      </div>
      <div class="footer"><a class="btn secondary" href="/logout">Sign out</a></div>
    </main>`);
  }

  // ---- boot ---------------------------------------------------------------------
  show(`<main class="screen"><div class="content center"><p class="muted">Loading…</p></div></main>`);
  bootSync().then(() => {
    if (API.me && API.me.banned) return bannedScreen();
    if (API.me) unlock("start"); // "Log in"
    projectM();
  });
})();
