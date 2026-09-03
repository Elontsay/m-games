const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve one-bar-math.html from the project root so the proxy panel can call /api/*.
app.get('/one-bar-math.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'one-bar-math.html'));
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Clearance passwords. SIV is the educator's level.
const CLEARANCE = {
  'QUAS@ARMT': 'SIV',
  'ZAFFAZ@13': 'III',
  'RAC@E@CAR': 'II',
  'BAS@IS':    'I',
};
const PROXY_LEVELS = new Set(['II', 'III', 'SIV']);

// In-memory stats — resets on restart; swap in a DB later
const stats = {
  totalSessions: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  topicStats: {
    addition:       { answered: 0, correct: 0 },
    multiplication: { answered: 0, correct: 0 },
    division:       { answered: 0, correct: 0 },
  },
  recentActivity: [],
};

app.post('/api/track', (req, res) => {
  const { event, data } = req.body || {};
  if (event === 'session_start') {
    stats.totalSessions++;
  } else if (event === 'answer') {
    stats.questionsAnswered++;
    if (data?.correct) stats.correctAnswers++;
    const topic = data?.topic;
    if (topic && stats.topicStats[topic]) {
      stats.topicStats[topic].answered++;
      if (data?.correct) stats.topicStats[topic].correct++;
    }
    stats.recentActivity.unshift({
      topic,
      correct: data?.correct,
      time: new Date().toISOString(),
    });
    if (stats.recentActivity.length > 100) stats.recentActivity.pop();
  }
  res.json({ ok: true });
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.get('/api/admin/stats', (req, res) => {
  const { password } = req.query;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(stats);
});

// --- Blocklist (SIV-managed) ----------------------------------------------
const BLOCKLIST_FILE = path.join(__dirname, 'blocklist.json');

function loadBlocklist() {
  try {
    const raw = fs.readFileSync(BLOCKLIST_FILE, 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}
function saveBlocklist(list) {
  fs.writeFileSync(BLOCKLIST_FILE, JSON.stringify(list, null, 2));
}
let blocklist = loadBlocklist();

function isBlocked(hostname) {
  const h = hostname.toLowerCase();
  return blocklist.some((entry) => {
    const e = entry.toLowerCase();
    return h === e || h.endsWith('.' + e);
  });
}

app.get('/api/blocklist', (_req, res) => {
  res.json({ blocklist });
});

app.post('/api/blocklist', (req, res) => {
  const { password, blocklist: next } = req.body || {};
  if (CLEARANCE[password] !== 'SIV') {
    return res.status(403).json({ error: 'SIV clearance required.' });
  }
  if (!Array.isArray(next)) {
    return res.status(400).json({ error: 'blocklist must be an array of hostnames.' });
  }
  const cleaned = next
    .map((s) => String(s).trim().toLowerCase())
    .filter((s) => s.length > 0 && /^[a-z0-9.-]+$/.test(s));
  blocklist = Array.from(new Set(cleaned));
  saveBlocklist(blocklist);
  res.json({ blocklist });
});

// --- Proxy fetch ----------------------------------------------------------
// Block private/loopback ranges to mitigate SSRF.
function isPrivateHost(hostname) {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost')) return true;
  // IPv6 loopback / unspecified
  if (h === '::1' || h === '::' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80')) return true;
  // IPv4 literal
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const [a, b] = [parseInt(m[1], 10), parseInt(m[2], 10)];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
}

app.post('/api/proxy', async (req, res) => {
  const { password, url } = req.body || {};
  const level = CLEARANCE[password];
  if (!level || !PROXY_LEVELS.has(level)) {
    return res.status(403).json({ error: 'Level II clearance or higher required.' });
  }

  let target;
  try {
    target = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL.' });
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only http and https URLs are allowed.' });
  }
  if (isPrivateHost(target.hostname)) {
    return res.status(400).json({ error: 'Private and loopback hosts are blocked.' });
  }
  if (isBlocked(target.hostname)) {
    return res.status(403).json({ error: `Host "${target.hostname}" is on the blocklist.` });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const upstream = await fetch(target.toString(), {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        // Identify ourselves and ask for plain HTML/text where possible.
        'User-Agent': 'OneBarMath-ProxyDemo/1.0 (educational)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(timeout);

    const contentType = upstream.headers.get('content-type') || '';
    // Cap response size to ~2 MB so a student can't tank the server.
    const MAX_BYTES = 2 * 1024 * 1024;
    const buf = Buffer.from(await upstream.arrayBuffer());
    const truncated = buf.length > MAX_BYTES;
    const body = (truncated ? buf.subarray(0, MAX_BYTES) : buf).toString('utf8');

    res.json({
      status: upstream.status,
      statusText: upstream.statusText,
      finalUrl: upstream.url,
      contentType,
      truncated,
      bytes: buf.length,
      body,
    });
  } catch (err) {
    res.status(502).json({ error: `Fetch failed: ${err.message}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Elon's Math Game running on port ${PORT}`));
