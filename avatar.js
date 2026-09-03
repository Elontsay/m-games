// ============================================================================
// M GAMES — avatars
//
// Your avatar is assembled from four slots: a face, a background, a frame and
// a badge. Starter pieces are free; everything else is bought with MBucks
// earned from formal MMC sittings. The equipped set shows on your profile
// card, your profile page, and every other player's copy of the directory.
//
// Prices are PLACEHOLDERS, sized against the current MMC payouts (a decent
// formal MMC 8 pays a few hundred MBucks, a strong MMC 12 a few thousand).
// ============================================================================

const AVATAR = {
  slots: ["face", "bg", "frame", "badge"],
  defaults: { face: "smile", bg: "slate", frame: "none", badge: "none" },

  // The face is the main character. "photo" uses the picture from your
  // sign-in provider, and is only offered when the account actually has one.
  faces: [
    { id: "smile", label: "Smiley", emoji: "🙂", price: 0 },
    { id: "star", label: "Star", emoji: "⭐", price: 0 },
    { id: "book", label: "Bookworm", emoji: "📚", price: 0 },
    { id: "pencil", label: "Pencil", emoji: "✏️", price: 0 },
    { id: "photo", label: "Your photo", emoji: "🖼️", price: 0, photo: true },
    { id: "fox", label: "Fox", emoji: "🦊", price: 200 },
    { id: "owl", label: "Owl", emoji: "🦉", price: 200 },
    { id: "robot", label: "Robot", emoji: "🤖", price: 400 },
    { id: "alien", label: "Alien", emoji: "👾", price: 400 },
    { id: "rocket", label: "Rocket", emoji: "🚀", price: 600 },
    { id: "wizard", label: "Wizard", emoji: "🧙", price: 1000 },
    { id: "dragon", label: "Dragon", emoji: "🐉", price: 1500 },
    { id: "phoenix", label: "Phoenix", emoji: "🐦‍🔥", price: 2500 },
    { id: "crown", label: "Crown", emoji: "👑", price: 4000 },
  ],

  backgrounds: [
    { id: "slate", label: "Slate", css: "#1e293b", price: 0 },
    { id: "paper", label: "Paper", css: "#e2e8f0", price: 0 },
    { id: "sky", label: "Sky", css: "linear-gradient(135deg,#38bdf8,#0369a1)", price: 150 },
    { id: "moss", label: "Moss", css: "linear-gradient(135deg,#86efac,#15803d)", price: 150 },
    { id: "sunset", label: "Sunset", css: "linear-gradient(135deg,#fda4af,#f97316)", price: 300 },
    { id: "grape", label: "Grape", css: "linear-gradient(135deg,#c084fc,#6b21a8)", price: 300 },
    { id: "ember", label: "Ember", css: "linear-gradient(135deg,#fbbf24,#b91c1c)", price: 500 },
    { id: "deep", label: "Deep space", css: "radial-gradient(circle at 30% 25%,#818cf8,#0b1020 70%)", price: 900 },
    { id: "aurora", label: "Aurora", css: "linear-gradient(135deg,#22d3ee,#a78bfa,#f472b6)", price: 1500 },
  ],

  frames: [
    { id: "none", label: "No frame", style: "", price: 0 },
    { id: "bronze", label: "Bronze ring", style: "box-shadow:0 0 0 3px #b45309", price: 250 },
    { id: "silver", label: "Silver ring", style: "box-shadow:0 0 0 3px #94a3b8", price: 500 },
    { id: "gold", label: "Gold ring", style: "box-shadow:0 0 0 3px #eab308", price: 1000 },
    { id: "neon", label: "Neon glow", style: "box-shadow:0 0 0 3px #22d3ee, 0 0 12px #22d3ee", price: 2000 },
    { id: "diamond", label: "Diamond halo", style: "box-shadow:0 0 0 3px #bae6fd, 0 0 16px #7dd3fc, 0 0 0 6px rgba(125,211,252,0.35)", price: 3500 },
  ],

  badges: [
    { id: "none", label: "No badge", emoji: "", price: 0 },
    { id: "spark", label: "Spark", emoji: "✨", price: 200 },
    { id: "fire", label: "Fire", emoji: "🔥", price: 400 },
    { id: "grad", label: "Scholar", emoji: "🎓", price: 800 },
    { id: "medal", label: "Medal", emoji: "🏅", price: 1200 },
    { id: "gem", label: "Gem", emoji: "💎", price: 2000 },
    { id: "trophy", label: "Trophy", emoji: "🏆", price: 3000 },
  ],
};

AVATAR.catalog = {
  face: AVATAR.faces,
  bg: AVATAR.backgrounds,
  frame: AVATAR.frames,
  badge: AVATAR.badges,
};
AVATAR.slotLabel = { face: "Face", bg: "Background", frame: "Frame", badge: "Badge" };

// Look an item up, always returning something sensible for unknown ids.
function avatarItem(slot, id) {
  const list = AVATAR.catalog[slot] || [];
  return list.find((x) => x.id === id) || list.find((x) => x.id === AVATAR.defaults[slot]) || list[0];
}

// `cfg` is { face, bg, frame, badge }; `photo` is the account picture URL, used
// only when the equipped face is the photo option.
function avatarMarkup(cfg, sizeClass = "sm", photo = null) {
  const c = cfg && typeof cfg === "object" ? cfg : {};
  const face = avatarItem("face", c.face);
  const bg = avatarItem("bg", c.bg);
  const frame = avatarItem("frame", c.frame);
  const badge = avatarItem("badge", c.badge);
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const inner = face.photo && photo
    ? `<img class="av-photo" src="${esc(photo)}" alt="" referrerpolicy="no-referrer">`
    : `<span class="av-face">${face.photo ? avatarItem("face", AVATAR.defaults.face).emoji : face.emoji}</span>`;
  return `<span class="av ${esc(sizeClass)}" style="background:${esc(bg.css)};${esc(frame.style)}">
    ${inner}${badge.emoji ? `<span class="av-badge">${badge.emoji}</span>` : ""}
  </span>`;
}
