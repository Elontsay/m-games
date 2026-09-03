// ============================================================================
// M GAMES — MMC (M Math Competition)
//
// Three exams modeled on the AMC 8 / 10 / 12 format:
//   MMC 8   25 questions, 40 minutes, 1 point per correct answer
//   MMC 10  25 questions, 75 minutes, 6 correct / 1.5 blank / 0 wrong
//   MMC 12  same scoring as MMC 10, harder material
//
// Two ways to sit an exam:
//   FORMAL    one sitting per calendar month, no retakes. The paper is built
//             from a seed derived from the month, so every contestant taking
//             the formal MMC 10 in a given month sees the same real questions.
//             Scores go on the player's profile and pay MBucks.
//   INFORMAL  unlimited practice. Same format and difficulty, but freshly
//             randomized questions, so it is never the real paper. Nothing is
//             recorded on the profile and no MBucks are paid.
//
// Every question here is ORIGINAL, written to the style and difficulty of the
// matching AMC contest. No actual AMC problems are reproduced; those are the
// Mathematical Association of America's copyrighted material.
// ============================================================================

// ---- swappable randomness ---------------------------------------------------
// Formal papers run on a seeded generator so the month's exam is identical for
// everyone. Practice papers run on Math.random.
let MMC_SRC = Math.random;
function mmcSeeded(seedText) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedText.length; i++) {
    h ^= seedText.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  let a = h >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const mr = (min, max) => Math.floor(MMC_SRC() * (max - min + 1)) + min;
const mpick = (arr) => arr[mr(0, arr.length - 1)];
const mcoin = () => MMC_SRC() < 0.5;
function mshuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(MMC_SRC() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const mgcd = (a, b) => (b ? mgcd(b, a % b) : Math.abs(a));
function mfrac(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = mgcd(Math.abs(n), d) || 1;
  return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`;
}
const mpi = (k) => (k === 1 ? "π" : k === -1 ? "−π" : `${k}π`);

// ---- multiple choice --------------------------------------------------------
// Builds an A–E question. Distractors are common-mistake values; anything
// missing is padded with near misses. Numeric option sets are sorted ascending,
// the way a real contest prints them.
function MC(q, correct, wrongs = []) {
  const c = String(correct);
  const seen = new Set([c]);
  const out = [];
  for (const w of wrongs) {
    if (w === null || w === undefined) continue;
    const s = String(w);
    if (!s || s === "NaN" || s === "Infinity" || s === "-Infinity" || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length === 4) break;
  }
  const n = Number(c);
  if (Number.isFinite(n)) {
    for (const off of [1, -1, 2, -2, 3, -3, 4, 5, -5, 6, 8, 10, -10, 12, 15, 20]) {
      if (out.length === 4) break;
      const cand = String(Number((n + off).toFixed(4)));
      if (!seen.has(cand)) { seen.add(cand); out.push(cand); }
    }
  }
  let pad = 2;
  while (out.length < 4) {
    const cand = `${c} + ${pad}`;
    if (!seen.has(cand)) { seen.add(cand); out.push(cand); }
    pad++;
  }
  const all = [c, ...out];
  const numeric = all.every((v) => v !== "" && Number.isFinite(Number(v)));
  return { q, correct: c, choices: numeric ? all.sort((a, b) => Number(a) - Number(b)) : mshuffle(all) };
}

// =============================== MMC 8 =======================================
// AMC 8 territory: arithmetic, percents, ratios, averages, counting, basic
// geometry and number sense.
const MMC8_POOL = [
  () => {
    const n = mr(2, 50) * 20, p = mpick([15, 20, 25, 30, 40, 60, 75]);
    return MC(`What is ${p}% of ${n}?`, (n * p) / 100, [(n * (100 - p)) / 100, (n * p) / 1000, n / 10, (n * p) / 50]);
  },
  () => {
    const k = mpick([4, 5, 6]), mean = mr(6, 30);
    const rest = Array.from({ length: k - 1 }, () => mr(2, 40));
    const missing = mean * k - rest.reduce((a, b) => a + b, 0);
    const shown = mshuffle(rest).join(", ");
    return MC(
      `The average of ${k} numbers is ${mean}. ${k - 1} of the numbers are ${shown}. What is the remaining number?`,
      missing,
      [mean, mean * (k - 1) - rest.reduce((a, b) => a + b, 0), rest.reduce((a, b) => a + b, 0) - mean, missing + mean]
    );
  },
  () => {
    const a = mr(2, 7); let b = mr(2, 7); while (b === a) b = mr(2, 7);
    const unit = mr(3, 25) * 2;
    const total = (a + b) * unit;
    const big = Math.max(a, b) * unit, small = Math.min(a, b) * unit;
    return MC(
      `Ana and Ben share $${total} in the ratio ${a}:${b}, with Ana receiving the ${a >= b ? "larger" : "smaller"} share. How many dollars does Ana receive?`,
      a >= b ? big : small,
      [a >= b ? small : big, total / (a + b), Math.abs(big - small), total / 2]
    );
  },
  () => {
    const k = mpick([3, 4, 6, 7, 8, 9, 11, 12]), n = mr(8, 60) * 10;
    return MC(`How many integers from 1 to ${n} inclusive are multiples of ${k}?`, Math.floor(n / k), [
      Math.floor(n / k) + 1,
      Math.ceil(n / k) + 1,
      Math.floor(n / (k + 1)),
      Math.round(n / k) + 2,
    ]);
  },
  () => {
    const r = mr(2, 9), b = mr(2, 9), g = mr(1, 6);
    const t = r + b + g;
    return MC(
      `A jar holds ${r} red, ${b} blue, and ${g} green marbles. One marble is drawn at random. What is the probability it is red?`,
      mfrac(r, t),
      [mfrac(b, t), mfrac(g, t), mfrac(r, r + b), mfrac(r + b, t)]
    );
  },
  () => {
    const speed = mpick([12, 15, 20, 24, 30, 40, 45, 60]), hours = mpick([2, 3, 4, 5, 6]);
    const d = speed * hours;
    return MC(`A cyclist rides at a steady ${speed} miles per hour for ${hours} hours. How many miles does the cyclist travel?`, d, [
      speed + hours,
      d / 2,
      speed * (hours + 1),
      Math.round(speed / hours),
    ]);
  },
  () => {
    const a = mr(2, 15), d = mr(2, 9), n = mr(8, 25);
    const term = a + (n - 1) * d;
    return MC(
      `A sequence begins ${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, … and continues with the same constant difference. What is the ${n}th term?`,
      term,
      [a + n * d, a + (n - 1) * (d + 1), term - d, a * n]
    );
  },
  () => {
    const a = mr(25, 95), b = mr(20, 170 - a);
    const third = 180 - a - b;
    return MC(`Two angles of a triangle measure ${a}° and ${b}°. What is the measure of the third angle?`, third, [
      180 - a,
      360 - a - b,
      a + b,
      90 - Math.abs(third - 90),
    ]);
  },
  () => {
    const w = mr(3, 20), h = mr(3, 20);
    if (mcoin()) {
      return MC(`A rectangle measures ${w} by ${h}. What is its area?`, w * h, [2 * (w + h), w + h, 2 * w * h, (w * h) / 2]);
    }
    return MC(`A rectangle has area ${w * h} and one side of length ${w}. What is its perimeter?`, 2 * (w + h), [
      w + h,
      w * h,
      2 * w + h,
      4 * w,
    ]);
  },
  () => {
    const d = mpick([3, 4, 6, 7, 8, 9, 11]), q = mr(12, 90), r = mr(1, d - 1);
    const n = d * q + r;
    return MC(`What is the remainder when ${n} is divided by ${d}?`, r, [d - r, r + 1, q % d, (n % (d + 1)) || 1]);
  },
  () => {
    const k = mpick([3, 4, 5, 6]), start = mr(4, 40);
    const nums = Array.from({ length: k }, (_, i) => start + i);
    const sum = nums.reduce((a, b) => a + b, 0);
    return MC(`The sum of ${k} consecutive integers is ${sum}. What is the smallest of these integers?`, start, [
      start + k - 1,
      Math.round(sum / k),
      start + 1,
      sum - start,
    ]);
  },
  () => {
    const price = mr(2, 20) * 20, off = mpick([10, 15, 20, 25, 40, 50]);
    const sale = (price * (100 - off)) / 100;
    return MC(`A jacket costs $${price} and is marked down by ${off}%. What is the sale price in dollars?`, sale, [
      (price * off) / 100,
      price - off,
      sale - off,
      price + (price * off) / 100,
    ]);
  },
];

// =============================== MMC 10 ======================================
// AMC 10 territory: algebra through quadratics, counting and probability,
// coordinate and plane geometry, elementary number theory. No trig, no logs.
const MMC10_POOL = [
  () => {
    const p = mr(-9, 9) || 2, q = mr(-9, 9) || 3;
    const b = -(p + q), c = p * q;
    const wantSum = mcoin();
    const poly = `x² ${b < 0 ? "−" : "+"} ${Math.abs(b)}x ${c < 0 ? "−" : "+"} ${Math.abs(c)}`;
    return MC(
      `The equation ${poly} = 0 has roots r and s. What is ${wantSum ? "r + s" : "rs"}?`,
      wantSum ? p + q : p * q,
      [wantSum ? p * q : p + q, -b, -c, wantSum ? -(p + q) : -(p * q)]
    );
  },
  () => {
    const n = mr(6, 12), k = mr(2, Math.min(5, n - 2));
    const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
    let P = 1; for (let i = 0; i < k; i++) P *= n - i;
    return MC(
      `A club has ${n} members. In how many ways can a committee of ${k} members be chosen, if order does not matter?`,
      C(n, k),
      [P, C(n, k + 1), C(n - 1, k), n * k]
    );
  },
  () => {
    const trip = mpick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15]]);
    const x = mr(-8, 8), y = mr(-8, 8);
    const sx = mcoin() ? 1 : -1, sy = mcoin() ? 1 : -1;
    return MC(
      `What is the distance between the points (${x}, ${y}) and (${x + sx * trip[0]}, ${y + sy * trip[1]})?`,
      trip[2],
      [trip[0] + trip[1], Math.abs(trip[0] - trip[1]), trip[2] * 2, Math.round(Math.sqrt(trip[0] + trip[1]) * 10) / 10]
    );
  },
  () => {
    const a = mr(6, 40), b = mr(6, 40);
    const g = mgcd(a, b), l = (a * b) / g;
    const wantG = mcoin();
    return MC(
      `What is the ${wantG ? "greatest common divisor" : "least common multiple"} of ${a} and ${b}?`,
      wantG ? g : l,
      [wantG ? l : g, a * b, Math.abs(a - b), wantG ? g * 2 : l / 2]
    );
  },
  () => {
    const base = mpick([2, 3, 4, 7, 8, 9, 12, 13]), exp = mr(15, 120);
    const cycle = [];
    let d = 1;
    for (let i = 0; i < 4; i++) { d = (d * base) % 10; cycle.push(d); }
    const ans = cycle[(exp - 1) % 4];
    return MC(`What is the units digit of ${base}^${exp}?`, ans, mshuffle(cycle.filter((v) => v !== ans)).concat([(ans + 5) % 10]));
  },
  () => {
    const a = mr(2, 6), r = mpick([2, 3]), n = mr(4, 8);
    const sum = (a * (r ** n - 1)) / (r - 1);
    return MC(
      `The first term of a geometric sequence is ${a} and the common ratio is ${r}. What is the sum of the first ${n} terms?`,
      sum,
      [a * r ** (n - 1), a * r ** n, sum - a * r ** (n - 1), sum + a]
    );
  },
  () => {
    const t1 = mpick([2, 3, 4, 6]), t2 = mpick([6, 8, 12]);
    const together = (t1 * t2) / (t1 + t2);
    return MC(
      `Working alone, Ana paints a room in ${t1} hours and Ben paints it in ${t2} hours. Working together at these rates, how many hours do they need? Express your answer as a fraction in lowest terms if it is not an integer.`,
      mfrac(t1 * t2, t1 + t2),
      [mfrac(t1 + t2, 2), String(t1 + t2), mfrac(t1 * t2, 2), String(Math.round(together * 10) / 10)]
    );
  },
  () => {
    const r = mr(2, 14);
    const wantArea = mcoin();
    return MC(
      `A circle has radius ${r}. What is its ${wantArea ? "area" : "circumference"}? Express your answer in terms of π.`,
      wantArea ? mpi(r * r) : mpi(2 * r),
      [wantArea ? mpi(2 * r) : mpi(r * r), mpi(r), mpi(4 * r), mpi(r * r * 2)]
    );
  },
  () => {
    const x = mr(-7, 7), y = mr(-7, 7);
    let a = mr(-5, 5) || 2, b = mr(-5, 5) || 3, c = mr(-5, 5) || 1, d = mr(-5, 5) || 4;
    if (a * d === b * c) d = d + 1 || 1;
    const e1 = a * x + b * y, e2 = c * x + d * y;
    const term = (k, v) => `${k === 1 ? "" : k === -1 ? "−" : k < 0 ? `−${Math.abs(k)}` : k}${v}`;
    return MC(
      `If ${term(a, "x")} ${b < 0 ? "−" : "+"} ${term(Math.abs(b), "y")} = ${e1} and ${term(c, "x")} ${d < 0 ? "−" : "+"} ${term(Math.abs(d), "y")} = ${e2}, what is x + y?`,
      x + y,
      [x - y, x * y, x, y]
    );
  },
  () => {
    const target = mr(4, 10);
    const ways = [];
    for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === target) ways.push(1);
    return MC(
      `Two standard six-sided dice are rolled. What is the probability that the sum of the two numbers shown is ${target}?`,
      mfrac(ways.length, 36),
      [mfrac(ways.length, 12), mfrac(ways.length + 1, 36), mfrac(1, 36), mfrac(6, 36)]
    );
  },
  () => {
    const a = mr(-5, 5) || 2, b = mr(-9, 9), c = mr(-6, 6) || 3, k = mr(-5, 5);
    const f = (x) => a * x + b, g = (x) => x * x + c;
    return MC(
      `Let f(x) = ${a === 1 ? "" : a === -1 ? "−" : a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} and g(x) = x² ${c < 0 ? "−" : "+"} ${Math.abs(c)}. What is f(g(${k}))?`,
      f(g(k)),
      [g(f(k)), f(k) + g(k), a * k * k + b, g(k)]
    );
  },
  () => {
    const a = mr(2, 12), d = mr(2, 9), n = mpick([10, 12, 15, 20, 25]);
    const sum = (n * (2 * a + (n - 1) * d)) / 2;
    return MC(
      `What is the sum of the first ${n} terms of the arithmetic sequence whose first term is ${a} and whose common difference is ${d}?`,
      sum,
      [a + (n - 1) * d, n * (a + (n - 1) * d), sum / 2, sum - n]
    );
  },
];

// =============================== MMC 12 ======================================
// AMC 12 territory: logarithms, trigonometry, complex numbers, polynomials,
// series and heavier counting.
const MMC12_POOL = [
  () => {
    const base = mpick([2, 3, 5]), k = mr(2, 6);
    const wantValue = mcoin();
    return wantValue
      ? MC(`If log_${base}(x) = ${k}, what is x?`, base ** k, [base * k, k ** base, base ** (k + 1), base ** (k - 1)])
      : MC(`What is log_${base}(${base ** k})?`, k, [base ** k, base * k, k + base, k - 1]);
  },
  () => {
    const table = {
      sin: { 30: "1/2", 45: "√2/2", 60: "√3/2", 120: "√3/2", 135: "√2/2", 150: "1/2", 210: "−1/2", 240: "−√3/2" },
      cos: { 30: "√3/2", 45: "√2/2", 60: "1/2", 120: "−1/2", 135: "−√2/2", 150: "−√3/2", 240: "−1/2" },
      tan: { 30: "√3/3", 45: "1", 60: "√3", 120: "−√3", 135: "−1", 150: "−√3/3" },
    };
    const fn = mpick(["sin", "cos", "tan"]);
    const ang = mpick(Object.keys(table[fn]));
    const ans = table[fn][ang];
    const others = ["1/2", "√2/2", "√3/2", "1", "√3", "√3/3", "−1/2", "−√2/2", "−√3/2", "−√3", "−1"].filter((v) => v !== ans);
    return MC(`What is the exact value of ${fn}(${ang}°)?`, ans, mshuffle(others));
  },
  () => {
    const a = mr(-6, 6) || 3, b = mr(-6, 6) || 4;
    const im = (v) => (Math.abs(v) === 1 ? "i" : `${Math.abs(v)}i`);
    const z = `${a} ${b < 0 ? "−" : "+"} ${im(b)}`;
    if (mcoin()) {
      const re = a * a - b * b, imag = 2 * a * b;
      const fmt = (r, i) => (i === 0 ? String(r) : `${r} ${i < 0 ? "−" : "+"} ${Math.abs(i) === 1 ? "i" : `${Math.abs(i)}i`}`);
      return MC(`If z = ${z}, what is z²?`, fmt(re, imag), [fmt(a * a + b * b, 0), fmt(re, -imag), fmt(a * a, b * b), fmt(2 * a, 2 * b)]);
    }
    const leg = mpick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20]]);
    const re = leg[0] * (mcoin() ? 1 : -1), imv = leg[1] * (mcoin() ? 1 : -1);
    const zz = `${re} ${imv < 0 ? "−" : "+"} ${Math.abs(imv) === 1 ? "i" : `${Math.abs(imv)}i`}`;
    return MC(`If z = ${zz}, what is |z|?`, leg[2], [leg[0] + leg[1], leg[2] * leg[2], Math.abs(leg[0] * leg[1]), Math.abs(leg[1] - leg[0])]);
  },
  () => {
    const r1 = mr(-5, 5) || 1, r2 = mr(-5, 5) || 2, r3 = mr(-5, 5) || 3;
    const b = -(r1 + r2 + r3), c = r1 * r2 + r1 * r3 + r2 * r3, d = -(r1 * r2 * r3);
    const want = mpick(["sum", "product", "pairs"]);
    const t = (v, s) => `${v < 0 ? "− " : "+ "}${Math.abs(v)}${s}`;
    const poly = `x³ ${t(b, "x²")} ${t(c, "x")} ${t(d, "")}`;
    const ans = want === "sum" ? r1 + r2 + r3 : want === "product" ? r1 * r2 * r3 : c;
    const label = want === "sum" ? "the sum of the roots" : want === "product" ? "the product of the roots" : "the sum of the products of the roots taken two at a time";
    return MC(`The polynomial ${poly} has three real roots. What is ${label}?`, ans, [-ans, r1 + r2 + r3, r1 * r2 * r3, c]);
  },
  () => {
    const den = mpick([2, 3, 4, 5, 6]), a = mr(2, 12) * (den - 1);
    const sum = a / (1 - 1 / den);
    return MC(
      `An infinite geometric series has first term ${a} and common ratio 1/${den}. What is its sum?`,
      Number.isInteger(sum) ? sum : mfrac(a * den, den - 1),
      [a * den, Math.round((a / den) * 100) / 100, a * (den - 1), a + den]
    );
  },
  () => {
    const n = mr(5, 9), k = mr(2, n - 2);
    const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
    return MC(
      `What is the coefficient of x^${k} in the expansion of (1 + x)^${n}?`,
      C(n, k),
      [C(n, k + 1), C(n, k - 1), n * k, 2 ** n]
    );
  },
  () => {
    const set = mpick([[3, 8, 7, 60], [5, 8, 7, 60], [7, 15, 13, 60], [3, 5, 7, 120], [7, 8, 13, 120], [5, 16, 19, 120]]);
    const [a, b, c, ang] = set;
    if (mcoin()) {
      return MC(`In a triangle, two sides of length ${a} and ${b} meet at an angle of ${ang}°. What is the length of the third side?`, c, [a + b, Math.abs(a - b), c + 1, Math.round(Math.sqrt(a * a + b * b))]);
    }
    return MC(`A triangle has sides of length ${a}, ${b}, and ${c}. What is the measure, in degrees, of the angle opposite the side of length ${c}?`, ang, [180 - ang, ang / 2, 90, 45]);
  },
  () => {
    const a1 = mr(1, 5), mult = mr(2, 3), add = mr(1, 6), n = mr(4, 7);
    let v = a1;
    for (let i = 2; i <= n; i++) v = mult * v + add;
    return MC(
      `A sequence is defined by a₁ = ${a1} and aₙ = ${mult}aₙ₋₁ + ${add} for n > 1. What is a${["", "₁", "₂", "₃", "₄", "₅", "₆", "₇"][n]}?`,
      v,
      [v - add, mult * v, a1 * mult ** (n - 1), v + mult]
    );
  },
  () => {
    const a = mr(-4, 4) || 2, b = mr(-9, 9), c = mr(-9, 9), k = mr(-4, 4) || 1;
    const val = a * k ** 3 + b * k + c;
    const t = (v, s) => `${v < 0 ? "− " : "+ "}${Math.abs(v)}${s}`;
    return MC(
      `What is the remainder when ${a === 1 ? "" : a === -1 ? "−" : a}x³ ${t(b, "x")} ${t(c, "")} is divided by x ${k < 0 ? "+" : "−"} ${Math.abs(k)}?`,
      val,
      [a * k ** 3 + b * k - c, -val, a + b + c, val - c]
    );
  },
  () => {
    const total = mr(30, 60), inA = mr(12, 25), inB = mr(12, 25), both = mr(3, Math.min(inA, inB) - 2);
    const neither = total - (inA + inB - both);
    if (neither < 0) return MC(`In a class of 40 students, 22 study French, 18 study Spanish, and 7 study both. How many study neither?`, 7, [3, 40 - 22 - 18, 33, 11]);
    return MC(
      `In a group of ${total} students, ${inA} play chess, ${inB} play go, and ${both} play both. How many play neither?`,
      neither,
      [total - inA - inB, inA + inB - both, both, total - both]
    );
  },
  () => {
    const n = mpick([5, 6, 7, 8, 9, 10, 12]);
    const sum = (n * (n - 3)) / 2;
    return MC(`How many diagonals does a convex polygon with ${n} sides have?`, sum, [n, (n * (n - 1)) / 2, n - 3, sum + n]);
  },
  () => {
    const b = mpick([2, 3, 5, 10]), x = mr(2, 5), y = mr(2, 5);
    return MC(
      `If log_${b}(m) = ${x} and log_${b}(n) = ${y}, what is log_${b}(mn)?`,
      x + y,
      [x * y, x - y, b ** (x + y), Math.round((x / y) * 100) / 100]
    );
  },
];

// ---- exam definitions -------------------------------------------------------
// MBucks amounts are PLACEHOLDERS. Replace `rewards` with the real bands.
const MMC = {
  currency: "MBucks",
  currencySymbol: "Ⓜ",
  periodLabel: (d = new Date()) => d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  period: (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
  exams: [
    {
      id: "mmc8",
      name: "MMC 8",
      blurb: "Arithmetic, ratios, counting and basic geometry. Written to AMC 8 difficulty.",
      questions: 25,
      minutes: 40,
      scoring: { correct: 1, blank: 0, wrong: 0 },
      max: 25,
      pool: MMC8_POOL,
      // MBucks scale with the grade: perPoint per point scored, plus a bonus
      // for an honor-roll finish. TODO: swap in the real numbers.
      payout: {
        perPoint: 20,
        bonus: [
          { min: 25, bucks: 200, title: "Perfect paper" },
          { min: 23, bucks: 100, title: "Distinguished Honor Roll" },
          { min: 20, bucks: 50, title: "Honor Roll" },
          { min: 16, bucks: 0, title: "Solid showing" },
          { min: 0, bucks: 0, title: "Participation" },
        ],
      },
    },
    {
      id: "mmc10",
      name: "MMC 10",
      blurb: "Algebra, counting and probability, coordinate and plane geometry. Written to AMC 10 difficulty.",
      questions: 25,
      minutes: 75,
      scoring: { correct: 6, blank: 1.5, wrong: 0 },
      max: 150,
      pool: MMC10_POOL,
      // TODO: swap in the real numbers.
      payout: {
        perPoint: 10,
        bonus: [
          { min: 150, bucks: 500, title: "Perfect paper" },
          { min: 120, bucks: 250, title: "Distinguished Honor Roll" },
          { min: 100, bucks: 100, title: "Honor Roll" },
          { min: 75, bucks: 0, title: "Solid showing" },
          { min: 0, bucks: 0, title: "Participation" },
        ],
      },
    },
    {
      id: "mmc12",
      name: "MMC 12",
      blurb: "Logarithms, trigonometry, complex numbers, polynomials and series. Written to AMC 12 difficulty.",
      questions: 25,
      minutes: 75,
      scoring: { correct: 6, blank: 1.5, wrong: 0 },
      max: 150,
      pool: MMC12_POOL,
      // TODO: swap in the real numbers.
      payout: {
        perPoint: 20,
        bonus: [
          { min: 150, bucks: 1000, title: "Perfect paper" },
          { min: 120, bucks: 500, title: "Distinguished Honor Roll" },
          { min: 100, bucks: 200, title: "Honor Roll" },
          { min: 75, bucks: 0, title: "Solid showing" },
          { min: 0, bucks: 0, title: "Participation" },
        ],
      },
    },
  ],
};

// Build one paper. `seed` makes it deterministic (the month's formal exam);
// omit it for a freshly randomized practice paper.
function mmcBuildPaper(exam, seed) {
  MMC_SRC = seed ? mmcSeeded(seed) : Math.random;
  try {
    const order = [];
    while (order.length < exam.questions) order.push(...mshuffle(exam.pool));
    return order.slice(0, exam.questions).map((make, i) => ({ n: i + 1, ...make() }));
  } finally {
    MMC_SRC = Math.random;
  }
}

// MBucks depend on the grade you earn: a per-point rate on your score, plus an
// honor-roll bonus on top.
function mmcReward(exam, score) {
  const bands = exam.payout.bonus;
  const band = bands.find((b) => score >= b.min) || bands[bands.length - 1];
  return {
    title: band.title,
    perPoint: exam.payout.perPoint,
    fromScore: Math.round(score * exam.payout.perPoint),
    bonus: band.bucks,
    bucks: Math.round(score * exam.payout.perPoint) + band.bucks,
  };
}
