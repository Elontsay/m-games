// ============================================================================
// M GAMES — GAME DATA
// Tier chain, topics, XP, and the random question generators for every tier.
//
// Every generator returns { q: "prompt", a: ["accepted", "answers"] }.
// Answers are compared after normalizing: lowercase, no spaces, π→pi, √→sqrt,
// ²→^2, ³→^3, −→-, ×→*.  Where several orderings or forms are valid, all of
// them are listed in `a`.
// ============================================================================

// ---- random + formatting helpers ------------------------------------------
function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// A random number with exactly `d` digits (1-digit means 1–9).
function nDigit(d) {
  return rnd(10 ** (d - 1), 10 ** d - 1);
}
const pick = (arr) => arr[rnd(0, arr.length - 1)];
const nz = (min, max) => { let v = 0; while (v === 0) v = rnd(min, max); return v; }; // non-zero
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const Q = (q, a) => ({ q, a: (Array.isArray(a) ? a : [a]).map(String) });

// Accepted answers for the fraction n/d: reduced form, plus a short decimal.
function fracAns(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(Math.abs(n), d) || 1;
  const rn = n / g, rd = d / g;
  if (rd === 1) return [String(rn)];
  const out = [`${rn}/${rd}`];
  const dec = rn / rd;
  if (Number.isInteger(dec * 1000)) out.push(String(dec));
  if (n !== rn) out.push(`${n}/${d}`);
  return out;
}
function fracStr(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(Math.abs(n), d) || 1;
  return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`;
}
// "3x + 5", "-x − 2", "4x"
function lin(a, b, v = "x") {
  const ax = a === 1 ? v : a === -1 ? `-${v}` : `${a}${v}`;
  if (b === 0) return ax;
  return `${ax} ${b < 0 ? "−" : "+"} ${Math.abs(b)}`;
}
// Canonical polynomial (descending coefficients) e.g. [2,-3,5] → "2x^2-3x+5"
function poly(coeffs) {
  const deg = coeffs.length - 1;
  let s = "";
  coeffs.forEach((c, i) => {
    if (c === 0) return;
    const p = deg - i;
    const abs = Math.abs(c);
    let term = abs === 1 && p > 0 ? "" : String(abs);
    term += p === 0 ? "" : p === 1 ? "x" : `x^${p}`;
    s += (c < 0 ? "-" : s ? "+" : "") + term;
  });
  return s || "0";
}
// Pretty version for prompts: "2x² − 3x + 5"
function polyDisp(coeffs) {
  return poly(coeffs)
    .replace(/\^2/g, "²").replace(/\^3/g, "³")
    .replace(/([+-])/g, " $1 ").trim()
    .replace(/^- /, "-").replace(/-/g, "−").replace(/^−(?=\S)/, "-");
}
// Complex number a+bi: accepted strings and display string.
function cplx(re, im) {
  const imCore = (v) => (Math.abs(v) === 1 ? "i" : `${Math.abs(v)}i`);
  if (im === 0) return [String(re)];
  if (re === 0) return [(im < 0 ? "-" : "") + imCore(im)];
  return [`${re}${im < 0 ? "-" : "+"}${imCore(im)}`, `${im < 0 ? "-" : ""}${imCore(im)}${re < 0 ? "-" : "+"}${Math.abs(re)}`];
}
function cplxDisp(re, im) {
  if (im === 0) return String(re);
  const i = Math.abs(im) === 1 ? "i" : `${Math.abs(im)}i`;
  if (re === 0) return (im < 0 ? "−" : "") + i;
  return `${re} ${im < 0 ? "−" : "+"} ${i}`;
}
// "3x − y", "-2x + 4y"
const axby = (a, b) => `${lin(a, 0)} ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}y`;
const coef = (k) => (k === 1 ? "" : k === -1 ? "-" : String(k));
const pairAns = (x, y) => [`(${x},${y})`, `${x},${y}`, `<${x},${y}>`];
function bothOrders(av, bv) {
  const out = new Set();
  for (const a of av) for (const b of bv) { out.add(`${a},${b}`); out.add(`${b},${a}`); }
  return [...out];
}
// Linear factor (ax + r): canonical + display
function factor(a, r) {
  const co = a === 1 ? "" : String(a);
  return {
    canon: `(${co}x${r < 0 ? "-" : "+"}${Math.abs(r)})`,
    disp: `(${co}x ${r < 0 ? "−" : "+"} ${Math.abs(r)})`,
  };
}
const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37]];
const piStr = (k) => (k === 1 ? "pi" : `${k}pi`);
const piDisp = (k) => (k === 1 ? "π" : `${k}π`);

// Accepted spellings of √n. A whole number when n is a perfect square, otherwise
// both the raw form (sqrt48) and the simplified one (4sqrt3), with or without
// parentheses and times signs, since all of those are the same answer.
function sqrtAns(n) {
  const root = Math.sqrt(n);
  if (Number.isInteger(root)) return [String(root)];
  const out = [`sqrt${n}`, `sqrt(${n})`];
  let outside = 1, inside = n;
  for (let d = 2; d * d <= inside; d++) {
    while (inside % (d * d) === 0) { inside /= d * d; outside *= d; }
  }
  if (outside > 1) {
    for (const core of [`${outside}sqrt`, `${outside}*sqrt`]) out.push(`${core}${inside}`, `${core}(${inside})`);
  }
  return out;
}
// How √n reads back in a prompt, e.g. "4sqrt3".
const sqrtHint = (n) => sqrtAns(n)[sqrtAns(n).length - 1].replace("*", "").replace(/[()]/g, "");

// ---- Bronze: arithmetic ------------------------------------------------------
function addQ(d1, d2) { const a = nDigit(d1), b = nDigit(d2); return Q(`${a} + ${b} = ?`, a + b); }
function subQ(d1, d2) { let a = nDigit(d1), b = nDigit(d2); if (b > a) [a, b] = [b, a]; return Q(`${a} − ${b} = ?`, a - b); }
function mulQ(d1, d2) { const a = nDigit(d1), b = nDigit(d2); return Q(`${a} × ${b} = ?`, a * b); }
function divQ(dividendDigits, divisorDigits) {
  const lo = 10 ** (dividendDigits - 1), hi = 10 ** dividendDigits - 1;
  for (let tries = 0; tries < 1000; tries++) {
    const d = divisorDigits === 1 ? rnd(2, 9) : nDigit(divisorDigits);
    const qMin = Math.max(2, Math.ceil(lo / d)), qMax = Math.floor(hi / d);
    if (qMax < qMin) continue;
    const q = rnd(qMin, qMax);
    return Q(`${d * q} ÷ ${d} = ?`, q);
  }
  return Q("12 ÷ 3 = ?", 4);
}
const BONUS = {
  add3: { label: "3-digit addition", xp: 50, make: () => addQ(3, 3) },
  add3x2: { label: "double 3-digit addition", xp: 50, make: () => addQ(3, 3) },
  mul2x2: { label: "double 2-digit multiplication", xp: 50, make: () => mulQ(2, 2) },
};

// ---- topic library -------------------------------------------------------------------
const TOPICS = {
  // Bronze
  addition: { name: "Addition", levels: [() => addQ(2, 2), () => addQ(2, 3), () => addQ(3, 3)], bonus: [BONUS.add3, BONUS.add3x2, BONUS.add3x2] },
  subtraction: { name: "Subtraction", levels: [() => subQ(2, 2), () => subQ(3, 2), () => subQ(3, 3)], bonus: [BONUS.add3, BONUS.add3x2, BONUS.add3x2] },
  multiplication: { name: "Multiplication", levels: [() => mulQ(1, 1), () => mulQ(2, 1), () => mulQ(2, 2)], bonus: [BONUS.add3x2, BONUS.add3x2, BONUS.mul2x2] },
  division: { name: "Division", levels: [() => divQ(2, 1), () => divQ(3, 1), () => divQ(3, 2)], bonus: [BONUS.mul2x2, BONUS.mul2x2, BONUS.mul2x2] },

  // Silver
  fractions: {
    name: "Fractions",
    levels: [
      () => { const d = rnd(3, 12), n1 = rnd(1, d - 1), n2 = rnd(1, d - 1); return Q(`${n1}/${d} + ${n2}/${d} = ? (reduced fraction)`, fracAns(n1 + n2, d)); },
      () => {
        let d1 = rnd(2, 9), d2 = rnd(2, 9); while (d2 === d1) d2 = rnd(2, 9);
        let n1 = rnd(1, d1 - 1), n2 = rnd(1, d2 - 1);
        const sub = Math.random() < 0.5;
        if (sub && n1 * d2 < n2 * d1) { [n1, n2] = [n2, n1]; [d1, d2] = [d2, d1]; }
        const num = sub ? n1 * d2 - n2 * d1 : n1 * d2 + n2 * d1;
        return Q(`${n1}/${d1} ${sub ? "−" : "+"} ${n2}/${d2} = ? (reduced fraction)`, fracAns(num, d1 * d2));
      },
      () => {
        const d1 = rnd(2, 9), d2 = rnd(2, 9), n1 = rnd(1, d1 - 1), n2 = rnd(1, d2 - 1);
        return Math.random() < 0.5
          ? Q(`${n1}/${d1} ÷ ${n2}/${d2} = ? (reduced fraction)`, fracAns(n1 * d2, d1 * n2))
          : Q(`${n1}/${d1} × ${n2}/${d2} = ? (reduced fraction)`, fracAns(n1 * n2, d1 * d2));
      },
    ],
  },
  orderOps: {
    name: "Order of Operations",
    levels: [
      () => { const a = rnd(2, 20), b = rnd(2, 9), c = rnd(2, 9); return Q(`${a} + ${b} × ${c} = ?`, a + b * c); },
      () => { const a = rnd(2, 12), b = rnd(2, 12), c = rnd(2, 9), d = rnd(1, 20); return Q(`(${a} + ${b}) × ${c} − ${d} = ?`, (a + b) * c - d); },
      () => {
        if (Math.random() < 0.5) { const a = rnd(2, 30), b = rnd(2, 9), c = rnd(4, 12), d = rnd(1, c - 2); return Q(`${a} + ${b} × (${c} − ${d})² = ?`, a + b * (c - d) ** 2); }
        const d = rnd(2, 9), k = rnd(2, 12), a = rnd(3, 12), b = rnd(3, 12); const c = a * b - d * k;
        if (c <= 0) return Q(`(${a} × ${b} + ${-c}) ÷ ${d} = ?`, k);
        return Q(`(${a} × ${b} − ${c}) ÷ ${d} = ?`, k);
      },
    ],
  },
  exponents: {
    name: "Exponents",
    levels: [
      () => { const a = rnd(2, 9), b = rnd(2, 3); return Q(`${a}^${b} = ?`, a ** b); },
      () => Math.random() < 0.6 ? (() => { const k = rnd(2, 20); return Q(`√${k * k} = ?`, k); })() : (() => { const k = rnd(2, 10); return Q(`∛${k ** 3} = ?`, k); })(),
      () => { const base = pick([2, 3, 5, 10]); const maxX = { 2: 8, 3: 5, 5: 4, 10: 6 }[base]; const x = rnd(2, maxX); return Q(`Solve for x: ${base}^x = ${base ** x}`, x); },
    ],
  },
  linear: {
    name: "Linear Equations",
    levels: [
      () => { const x = nz(-9, 9), a = rnd(2, 9), b = nz(-20, 20); return Q(`Solve for x: ${lin(a, b)} = ${a * x + b}`, x); },
      () => { const x = nz(-9, 9), a = rnd(2, 9); let c = rnd(2, 9); while (c === a) c = rnd(2, 9); const b = nz(-15, 15); const d = a * x + b - c * x; return Q(`Solve for x: ${lin(a, b)} = ${lin(c, d)}`, x); },
      () => { const x = nz(-9, 9), a = rnd(2, 6), b = nz(-9, 9); let c = rnd(2, 9); while (c === a) c = rnd(2, 9); const d = a * (x + b) - c * x; return Q(`Solve for x: ${a}(${lin(1, b)}) = ${lin(c, d)}`, x); },
    ],
  },

  // Gold
  areaPerimeter: {
    name: "Area and Perimeter",
    levels: [
      () => { const w = rnd(2, 30), h = rnd(2, 30); return Math.random() < 0.3 ? Q(`Perimeter of a square with side ${w}?`, 4 * w) : Q(`Perimeter of a rectangle ${w} by ${h}?`, 2 * (w + h)); },
      () => { const w = rnd(2, 25), h = rnd(2, 25); return Math.random() < 0.5 ? Q(`Area of a rectangle ${w} by ${h}?`, w * h) : Q(`Area of a triangle with base ${w * 2} and height ${h}?`, w * h); },
      () => { let b1 = rnd(2, 20), b2 = rnd(2, 20); if ((b1 + b2) % 2) b2 += 1; const h = rnd(2, 15); return Math.random() < 0.5 ? Q(`Area of a trapezoid with bases ${b1} and ${b2} and height ${h}?`, ((b1 + b2) / 2) * h) : Q(`Area of a parallelogram with base ${b1} and height ${h}?`, b1 * h); },
    ],
  },
  distance: {
    name: "Distance",
    levels: [
      () => { const a = rnd(-20, 20), b = rnd(-20, 20); let c = rnd(-20, 20); while (c === a) c = rnd(-20, 20); return Math.random() < 0.5 ? Q(`Distance between (${a}, ${b}) and (${c}, ${b})?`, Math.abs(a - c)) : Q(`Distance between (${b}, ${a}) and (${b}, ${c})?`, Math.abs(a - c)); },
      () => { const [p, q, r] = pick(TRIPLES.slice(0, 3)); const x = rnd(-5, 5), y = rnd(-5, 5); return Q(`Distance between (${x}, ${y}) and (${x + p}, ${y + q})?`, r); },
      () => { const [p, q, r] = pick(TRIPLES); const k = rnd(1, 3); const x = rnd(-15, 15), y = rnd(-15, 15); const sx = pick([-1, 1]), sy = pick([-1, 1]); return Q(`Distance between (${x}, ${y}) and (${x + sx * p * k}, ${y + sy * q * k})?`, r * k); },
    ],
  },
  circles: {
    name: "Circles",
    levels: [
      () => { const r = rnd(1, 20); return Math.random() < 0.5 ? Q(`Circumference of a circle with radius ${r}? (in terms of π, e.g. 6pi)`, [piStr(2 * r)]) : Q(`Circumference of a circle with diameter ${2 * r}? (in terms of π)`, [piStr(2 * r)]); },
      () => { const r = rnd(1, 20); return Math.random() < 0.5 ? Q(`Area of a circle with radius ${r}? (in terms of π, e.g. 9pi)`, [piStr(r * r)]) : Q(`Area of a circle with diameter ${2 * r}? (in terms of π)`, [piStr(r * r)]); },
      () => { const r = rnd(2, 20); return Math.random() < 0.5 ? Q(`A circle has area ${piDisp(r * r)}. What is its radius?`, r) : Q(`A circle has circumference ${piDisp(2 * r)}. What is its diameter?`, 2 * r); },
    ],
  },
  pythagorean: {
    name: "Pythagorean Theorem",
    levels: [
      () => { const [p, q, r] = pick(TRIPLES.slice(0, 4)); return Q(`A right triangle has legs ${p} and ${q}. Hypotenuse?`, r); },
      () => { const [p, q, r] = pick(TRIPLES.slice(0, 4)); return Math.random() < 0.5 ? Q(`A right triangle has hypotenuse ${r} and a leg ${p}. Other leg?`, q) : Q(`A right triangle has hypotenuse ${r} and a leg ${q}. Other leg?`, p); },
      () => { const [p, q, r] = pick(TRIPLES); const k = rnd(2, 5); const which = rnd(0, 2); if (which === 0) return Q(`A right triangle has legs ${p * k} and ${q * k}. Hypotenuse?`, r * k); if (which === 1) return Q(`A right triangle has hypotenuse ${r * k} and a leg ${p * k}. Other leg?`, q * k); return Q(`A ladder ${r * k} long leans against a wall, its foot ${p * k} from the wall. How high does it reach?`, q * k); },
    ],
  },

  // Platinum (now Crystal's topics)
  sectors: {
    name: "Circle Sectors",
    levels: [
      () => { for (;;) { const th = pick([30, 45, 60, 90, 120, 180, 270]), r = rnd(2, 12); const v = (th / 360) * r * r; if (Number.isInteger(v)) return Q(`Area of a ${th}° sector of a circle with radius ${r}? (in terms of π)`, [piStr(v)]); } },
      () => { for (;;) { const th = pick([30, 45, 60, 90, 120, 180, 270]), r = rnd(2, 12); const v = (th / 360) * 2 * r; if (Number.isInteger(v)) return Q(`Arc length of a ${th}° sector of a circle with radius ${r}? (in terms of π)`, [piStr(v)]); } },
      () => { for (;;) { const th = pick([30, 45, 60, 90, 120, 180, 270]), r = rnd(2, 12); const v = (th / 360) * r * r; if (Number.isInteger(v)) return Q(`A sector of a circle with radius ${r} has area ${piDisp(v)}. What is its central angle in degrees?`, th); } },
    ],
  },
  functions: {
    name: "Functions",
    levels: [
      () => { const a = nz(-9, 9), b = rnd(-20, 20), c = rnd(-9, 9); return Q(`f(x) = ${lin(a, b)}. Find f(${c}).`, a * c + b); },
      () => { const a = nz(-5, 5), b = rnd(-9, 9), c = rnd(-20, 20), d = rnd(-6, 6); return Q(`f(x) = ${polyDisp([a, b, c])}. Find f(${d}).`, a * d * d + b * d + c); },
      () => { const a = nz(-5, 5), b = rnd(-9, 9), c = rnd(-9, 9), d = rnd(-5, 5); const g = (x) => x * x + c, f = (x) => a * x + b; return Math.random() < 0.5 ? Q(`f(x) = ${lin(a, b)}, g(x) = ${polyDisp([1, 0, c])}. Find f(g(${d})).`, f(g(d))) : Q(`f(x) = ${lin(a, b)}, g(x) = ${polyDisp([1, 0, c])}. Find g(f(${d})).`, g(f(d))); },
    ],
  },
  graphing: {
    name: "Graphing Equations",
    levels: [
      () => { const x1 = rnd(-9, 9), y1 = rnd(-9, 9); let x2 = rnd(-9, 9); while (x2 === x1) x2 = rnd(-9, 9); const y2 = rnd(-9, 9); return Q(`Slope of the line through (${x1}, ${y1}) and (${x2}, ${y2})? (fraction if needed)`, fracAns(y2 - y1, x2 - x1)); },
      () => { const m = nz(-6, 6), b = rnd(-15, 15); const x1 = rnd(-9, 9); let x2 = rnd(-9, 9); while (x2 === x1) x2 = rnd(-9, 9); return Q(`A line passes through (${x1}, ${m * x1 + b}) and (${x2}, ${m * x2 + b}). What is its y-intercept?`, b); },
      () => { const p = nz(-12, 12), a = nz(-6, 6), b = nz(-6, 6); return Math.random() < 0.5 ? Q(`Where does ${axby(a, b)} = ${a * p} cross the x-axis? (give x)`, p) : Q(`What is the y-intercept of ${axby(a, b)} = ${b * p}? (give y)`, p); },
    ],
  },
  factoring: {
    name: "Factoring Polynomials",
    levels: [
      () => { const p = rnd(1, 9), q = rnd(1, 9); const f1 = factor(1, p), f2 = factor(1, q); return Q(`Factor: ${polyDisp([1, p + q, p * q])}  (e.g. (x+2)(x+3))`, [f1.canon + f2.canon, f2.canon + f1.canon]); },
      () => { const p = nz(-9, 9), q = nz(-9, 9); const f1 = factor(1, p), f2 = factor(1, q); return Q(`Factor: ${polyDisp([1, p + q, p * q])}`, [f1.canon + f2.canon, f2.canon + f1.canon]); },
      () => { const a = rnd(2, 4); let p = nz(-7, 7); while (gcd(a, Math.abs(p)) !== 1) p = nz(-7, 7); const q = nz(-7, 7); const f1 = factor(a, p), f2 = factor(1, q); return Q(`Factor: ${polyDisp([a, a * q + p, p * q])}`, [f1.canon + f2.canon, f2.canon + f1.canon]); },
    ],
  },

  // Crystal (now Emerald's topics)
  multiplyPoly: {
    name: "Multiplying Polynomials",
    levels: [
      () => { const p = nz(-9, 9), q = nz(-9, 9); return Q(`Expand: ${factor(1, p).disp}${factor(1, q).disp}  (e.g. x^2+5x+6)`, poly([1, p + q, p * q])); },
      () => { const a = rnd(2, 5), b = nz(-6, 6), c = rnd(2, 5), d = nz(-6, 6); return Q(`Expand: ${factor(a, b).disp}${factor(c, d).disp}`, poly([a * c, a * d + b * c, b * d])); },
      () => { const a = rnd(1, 5), b = nz(-9, 9); return Q(`Expand: ${factor(a, b).disp}²`, poly([a * a, 2 * a * b, b * b])); },
    ],
  },
  systems: {
    name: "Systems of Equations",
    levels: [
      () => { const x = rnd(-6, 6), y = rnd(-6, 6), a = nz(-4, 4), b = rnd(-9, 9); const c = nz(-4, 4), d = nz(-4, 4); return Q(`Solve: y = ${lin(a, b)} and ${lin(c, 0)} ${d < 0 ? "−" : "+"} ${Math.abs(d)}y = ${c * x + d * y}. Answer as (x, y).`, pairAns(x, y)).a.length && Q(`y = ${lin(a, y - a * x)};  ${lin(c, 0)} ${d < 0 ? "−" : "+"} ${Math.abs(d)}y = ${c * x + d * y}. Solve for (x, y).`, pairAns(x, y)); },
      () => { const x = rnd(-6, 6), y = rnd(-6, 6); const a = nz(-5, 5), b = nz(-5, 5), c = nz(-5, 5), d = nz(-5, 5); if (a * d === b * c) return TOPICS.systems.levels[1](); return Q(`${axby(a, b)} = ${a * x + b * y};  ${axby(c, d)} = ${c * x + d * y}. Solve for (x, y).`, pairAns(x, y)); },
      () => { const x = rnd(-9, 9), y = rnd(-9, 9); const a = nz(-9, 9), b = nz(-9, 9), c = nz(-9, 9), d = nz(-9, 9); if (a * d === b * c) return TOPICS.systems.levels[2](); return Q(`${axby(a, b)} = ${a * x + b * y};  ${axby(c, d)} = ${c * x + d * y}. Solve for (x, y).`, pairAns(x, y)); },
    ],
  },
  quadratics: {
    name: "Solving Quadratics",
    levels: [
      () => { const n = rnd(2, 15); return Math.random() < 0.5 ? Q(`x² = ${n * n}. Positive solution?`, n) : Q(`x² − ${n * n} = 0. Positive solution?`, n); },
      () => { const p = nz(-9, 9), q = nz(-9, 9); const ans = p === q ? [String(p)] : bothOrders([String(p)], [String(q)]); return Q(`Solve ${polyDisp([1, -(p + q), p * q])} = 0. ${p === q ? "Give the solution." : "Give both solutions, comma-separated."}`, ans); },
      () => { const a = rnd(2, 5), b = nz(-7, 7), c = nz(-7, 7); const r1 = fracAns(-b, a), r2 = [String(-c)]; return Q(`Solve ${polyDisp([a, a * c + b, b * c])} = 0. Give both solutions, comma-separated (fractions if needed).`, bothOrders(r1, r2)); },
    ],
  },
  complexIntro: {
    name: "Complex Numbers",
    levels: [
      () => { const k = rnd(2, 12); return Q(`Simplify: √(−${k * k})`, cplx(0, k)); },
      () => { const n = rnd(2, 60); const v = [[1, 0], [0, 1], [-1, 0], [0, -1]][n % 4]; return Q(`Simplify: i^${n}`, cplx(v[0], v[1])); },
      () => { const [p, q, r] = pick(TRIPLES.slice(0, 4)); const sp = pick([-1, 1]), sq = pick([-1, 1]); return Q(`|${cplxDisp(sp * p, sq * q)}| = ?`, r); },
    ],
  },

  // Emerald (now Amethyst's topics)
  addComplex: {
    name: "Adding Complex Numbers",
    levels: [
      () => { const a = rnd(1, 9), b = rnd(1, 9), c = rnd(1, 9), d = rnd(1, 9); return Q(`(${cplxDisp(a, b)}) + (${cplxDisp(c, d)}) = ?`, cplx(a + c, b + d)); },
      () => { const a = nz(-9, 9), b = nz(-9, 9), c = nz(-9, 9), d = nz(-9, 9); return Q(`(${cplxDisp(a, b)}) − (${cplxDisp(c, d)}) = ?`, cplx(a - c, b - d)); },
      () => { const a = nz(-12, 12), b = nz(-12, 12), c = nz(-12, 12), d = nz(-12, 12), e = nz(-12, 12), f = nz(-12, 12); return Q(`(${cplxDisp(a, b)}) + (${cplxDisp(c, d)}) − (${cplxDisp(e, f)}) = ?`, cplx(a + c - e, b + d - f)); },
    ],
  },
  mulComplex: {
    name: "Multiplying Complex Numbers",
    levels: [
      () => { const k = nz(-6, 6), a = nz(-9, 9), b = nz(-9, 9); return Q(`${k}(${cplxDisp(a, b)}) = ?`, cplx(k * a, k * b)); },
      () => { const a = nz(-6, 6), b = nz(-6, 6), c = nz(-6, 6), d = nz(-6, 6); return Q(`(${cplxDisp(a, b)})(${cplxDisp(c, d)}) = ?`, cplx(a * c - b * d, a * d + b * c)); },
      () => { const a = nz(-7, 7), b = nz(-7, 7); return Q(`(${cplxDisp(a, b)})² = ?`, cplx(a * a - b * b, 2 * a * b)); },
    ],
  },
  conjugates: {
    name: "Conjugates",
    levels: [
      () => { const a = nz(-9, 9), b = nz(-9, 9); return Q(`Conjugate of ${cplxDisp(a, b)}?`, cplx(a, -b)); },
      () => { const a = nz(-9, 9), b = nz(-9, 9); return Q(`(${cplxDisp(a, b)})(${cplxDisp(a, -b)}) = ?`, a * a + b * b); },
      () => { const a = nz(-5, 5), b = nz(-5, 5), c = nz(-5, 5), d = nz(-5, 5); return Q(`Conjugate of (${cplxDisp(a, b)})(${cplxDisp(c, d)})?`, cplx(a * c - b * d, -(a * d + b * c))); },
    ],
  },
  divComplex: {
    name: "Dividing Complex Numbers",
    levels: [
      () => { const k = rnd(2, 6), p = nz(-6, 6), q = nz(-6, 6); return Q(`(${cplxDisp(k * p, k * q)}) ÷ ${k} = ?`, cplx(p, q)); },
      () => { const p = nz(-5, 5), q = nz(-5, 5), c = nz(-4, 4), d = nz(-4, 4); const nr = p * c - q * d, ni = p * d + q * c; return Q(`(${cplxDisp(nr, ni)}) ÷ (${cplxDisp(c, d)}) = ?`, cplx(p, q)); },
      () => { const p = nz(-8, 8), q = nz(-8, 8), c = nz(-7, 7), d = nz(-7, 7); const nr = p * c - q * d, ni = p * d + q * c; return Q(`(${cplxDisp(nr, ni)}) / (${cplxDisp(c, d)}) = ?`, cplx(p, q)); },
    ],
  },

  // Amethyst (now Ruby's topics)
  graphQuad: {
    name: "Graphing Quadratics",
    levels: [
      () => { const h = nz(-9, 9), k = nz(-9, 9); return Q(`Vertex of y = (x ${h < 0 ? "+" : "−"} ${Math.abs(h)})² ${k < 0 ? "−" : "+"} ${Math.abs(k)}? Answer as (h, k).`, pairAns(h, k)); },
      () => { const a = nz(-3, 3), h = nz(-6, 6), k = rnd(-9, 9); return Q(`Vertex of y = ${polyDisp([a, -2 * a * h, a * h * h + k])}? Answer as (h, k).`, pairAns(h, k)); },
      () => { const p = nz(-9, 9); let q = nz(-9, 9); while (q === p) q = nz(-9, 9); return Q(`x-intercepts of y = ${polyDisp([1, -(p + q), p * q])}? Give both x values, comma-separated.`, bothOrders([String(p)], [String(q)])); },
    ],
  },
  stats1: {
    name: "Statistics I",
    levels: [
      () => { const m = rnd(5, 40); const devs = [nz(-6, 6), nz(-6, 6), nz(-6, 6), nz(-6, 6)]; const last = -devs.reduce((s, v) => s + v, 0); const vals = [...devs, last].map((d) => m + d); return Q(`Mean of ${vals.join(", ")}?`, m); },
      () => { const n = pick([5, 7]); const vals = Array.from({ length: n }, () => rnd(1, 50)); const sorted = [...vals].sort((x, y) => x - y); return Q(`Median of ${vals.join(", ")}?`, sorted[(n - 1) / 2]); },
      () => { const mode = rnd(1, 30); const others = []; while (others.length < 4) { const v = rnd(1, 30); if (v !== mode && !others.includes(v)) others.push(v); } const vals = [mode, mode, mode, ...others].sort(() => Math.random() - 0.5); return Q(`Mode of ${vals.join(", ")}?`, mode); },
    ],
  },
  stats2: {
    name: "Statistics II",
    levels: [
      () => { const vals = Array.from({ length: 6 }, () => rnd(1, 99)); return Q(`Range of ${vals.join(", ")}?`, Math.max(...vals) - Math.min(...vals)); },
      () => { const m = rnd(10, 40), a = rnd(1, 8); const vals = [m - a, m - a, m + a, m + a].sort(() => Math.random() - 0.5); return Q(`Population variance of ${vals.join(", ")}?`, a * a); },
      () => { const m = rnd(20, 60); const [a, b, sd] = pick([[1, 7, 5], [7, 17, 13], [5, 5, 5], [7, 1, 5]]); const vals = [m - a, m + a, m - b, m + b].sort(() => Math.random() - 0.5); return Q(`Population standard deviation of ${vals.join(", ")}?`, sd); },
    ],
  },
  stats3: {
    name: "Statistics III",
    levels: [
      () => { const r = rnd(1, 9), b = rnd(1, 9); return Math.random() < 0.5 ? Q(`A bag has ${r} red and ${b} blue marbles. P(red)? (fraction)`, fracAns(r, r + b)) : Q(`A bag has ${r} red and ${b} blue marbles. P(blue)? (fraction)`, fracAns(b, r + b)); },
      () => { const n = rnd(4, 10), k = rnd(2, n - 2); const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); }; return Q(`How many ways to choose ${k} items from ${n}? (${n} choose ${k})`, C(n, k)); },
      () => { const n = rnd(4, 9), k = rnd(2, 3); let P = 1; for (let i = 0; i < k; i++) P *= n - i; return Q(`How many ordered arrangements of ${k} items from ${n}? (P(${n}, ${k}))`, P); },
    ],
  },

  // Ruby (now Obsidian's topics)
  trig: {
    name: "Trigonometry",
    levels: [
      () => {
        const table = {
          sin: { 0: ["0"], 30: ["1/2", "0.5"], 45: ["sqrt2/2", "sqrt(2)/2", "1/sqrt2", "1/sqrt(2)"], 60: ["sqrt3/2", "sqrt(3)/2"], 90: ["1"] },
          cos: { 0: ["1"], 30: ["sqrt3/2", "sqrt(3)/2"], 45: ["sqrt2/2", "sqrt(2)/2", "1/sqrt2", "1/sqrt(2)"], 60: ["1/2", "0.5"], 90: ["0"] },
          tan: { 0: ["0"], 30: ["sqrt3/3", "sqrt(3)/3", "1/sqrt3", "1/sqrt(3)"], 45: ["1"], 60: ["sqrt3", "sqrt(3)"] },
        };
        const fn = pick(["sin", "cos", "tan"]); const ang = pick(Object.keys(table[fn]));
        return Q(`${fn}(${ang}°) = ? (exact, e.g. sqrt3/2)`, table[fn][ang]);
      },
      () => { const [p, q, r] = pick(TRIPLES.slice(0, 4)); const k = rnd(1, 3); const fn = pick(["sin", "cos", "tan"]); const opp = p * k, adj = q * k, hyp = r * k; const ans = fn === "sin" ? fracAns(opp, hyp) : fn === "cos" ? fracAns(adj, hyp) : fracAns(opp, adj); return Q(`In a right triangle, the side opposite θ is ${opp}, the adjacent side is ${adj}, and the hypotenuse is ${hyp}. ${fn} θ = ? (fraction)`, ans); },
      () => { const inv = pick([["sin", "1/2", 30], ["sin", "√3/2", 60], ["cos", "1/2", 60], ["cos", "√3/2", 30], ["tan", "1", 45], ["tan", "√3", 60], ["sin", "√2/2", 45], ["cos", "√2/2", 45], ["tan", "√3/3", 30]]); return Q(`${inv[0]} θ = ${inv[1]} and 0° < θ < 90°. θ in degrees?`, inv[2]); },
    ],
  },
  // XZ² = XY² + YZ² − 2·XY·YZ·cos(XYZ). The included angle is kept to 60°, 90°
  // or 120° so that cos is ±1/2 or 0 and XZ² lands on a whole number -- the
  // answer is then an integer or a clean surd. At 30° or 45° it would be a
  // nested radical like √(200−100√3), which nobody can reasonably type.
  lawCos: {
    name: "Law of Cosines",
    levels: [
      // Sides chosen so XZ comes out whole.
      () => {
        const [a, b, ang, c] = pick([
          [3, 8, 60, 7], [5, 8, 60, 7], [7, 15, 60, 13], [8, 15, 60, 13], [5, 21, 60, 19], [16, 21, 60, 19],
          [3, 5, 120, 7], [7, 8, 120, 13], [5, 16, 120, 19], [11, 24, 120, 31], [9, 15, 120, 21],
        ]);
        return Q(`In triangle XYZ, side XY = ${a} and side YZ = ${b}, and angle XYZ = ${ang}°. How long is side XZ?`, c);
      },
      // Any small triangle: the answer is usually a surd.
      () => {
        const a = rnd(2, 9), b = rnd(2, 9), ang = pick([60, 90, 120]);
        const sq = a * a + b * b - (ang === 60 ? a * b : ang === 120 ? -a * b : 0);
        return Q(
          `In triangle XYZ, side XY = ${a} and side YZ = ${b}, and angle XYZ = ${ang}°. How long is side XZ? (exact form, e.g. ${sqrtHint(21)})`,
          sqrtAns(sq),
        );
      },
      // All three sides given: work backwards to the angle.
      () => {
        const [a, b, c, ang] = pick([
          [3, 8, 7, 60], [5, 8, 7, 60], [7, 15, 13, 60], [8, 15, 13, 60],
          [3, 5, 7, 120], [7, 8, 13, 120], [5, 16, 19, 120],
          [3, 4, 5, 90], [5, 12, 13, 90], [8, 15, 17, 90],
        ]);
        return Q(`In triangle XYZ, side XY = ${a}, side YZ = ${b}, and side XZ = ${c}. Find angle XYZ in degrees.`, ang);
      },
    ],
  },
  // YZ/sin X = XZ/sin Y = XY/sin Z. Angle pairs are picked so the ratio of sines
  // is a whole number, √2 or √3, keeping answers exact. Every SSA setup here is
  // one where the obtuse solution would overshoot 180°, so there is no ambiguous
  // second triangle to argue about.
  lawSines: {
    name: "Law of Sines",
    levels: [
      // Two sides and the angle opposite one of them: find the other angle.
      () => {
        const k = rnd(2, 12);
        const [angX, sideYZ, sideXZ, angY] = pick([
          [30, k, 2 * k, 90], [30, k, k, 30], [90, 2 * k, k, 30], [45, k, k, 45],
        ]);
        return Q(
          `In triangle XYZ, angle X = ${angX}°, side YZ = ${sideYZ} (opposite X), and side XZ = ${sideXZ} (opposite Y). Find angle Y in degrees.`,
          angY,
        );
      },
      // Two angles and the side opposite one: find the side opposite the other.
      () => {
        const a = rnd(2, 12);
        const [angX, angY, mult] = pick([
          [30, 90, 4], [30, 60, 3], [30, 45, 2], [45, 90, 2], [30, 120, 3],
        ]);
        // XZ = YZ·sin Y / sin X, and mult is (XZ/YZ)² so the answer stays exact.
        return Q(
          `In triangle XYZ, angle X = ${angX}° and angle Y = ${angY}°, and side YZ = ${a} (opposite X). How long is side XZ (opposite Y)? (exact form, e.g. ${sqrtHint(12)})`,
          sqrtAns(mult * a * a),
        );
      },
      // Two angles and a side: find the third side, which needs angle Z first.
      () => {
        const a = rnd(2, 12);
        const [angX, angY, mult] = pick([
          [30, 90, 3], [45, 90, 1], [30, 30, 3], [60, 60, 1], [30, 120, 1], [45, 45, 2],
        ]);
        const angZ = 180 - angX - angY;
        // XY = YZ·sin Z / sin X, with mult = (XY/YZ)².
        return Q(
          `In triangle XYZ, angle X = ${angX}° and angle Y = ${angY}°, and side YZ = ${a} (opposite X). How long is side XY (opposite Z = ${angZ}°)? (exact form, e.g. ${sqrtHint(8)})`,
          sqrtAns(mult * a * a),
        );
      },
    ],
  },
  sinusoid: {
    name: "Sinusoidal Waves",
    levels: [
      () => { const A = nz(-9, 9), B = rnd(1, 4), C = rnd(-5, 5); return Q(`Amplitude of y = ${coef(A)}${pick(["sin", "cos"])}(${B === 1 ? "" : B}x) ${C < 0 ? "−" : "+"} ${Math.abs(C)}?`, Math.abs(A)); },
      () => { const [B, ans] = pick([["1", ["2pi"]], ["2", ["pi"]], ["3", ["2pi/3"]], ["4", ["pi/2"]], ["x/2", ["4pi"]], ["x/4", ["8pi"]]]); const arg = B.startsWith("x") ? B : `${B === "1" ? "" : B}x`; return Q(`Period of y = ${rnd(1, 5)}${pick(["sin", "cos"])}(${arg})? (in terms of π, e.g. pi/2)`, ans); },
      () => { const A = nz(-9, 9), C = rnd(-9, 9); return Math.random() < 0.5 ? Q(`Maximum value of y = ${coef(A)}sin(x) ${C < 0 ? "−" : "+"} ${Math.abs(C)}?`, C + Math.abs(A)) : Q(`Minimum value of y = ${coef(A)}cos(x) ${C < 0 ? "−" : "+"} ${Math.abs(C)}?`, C - Math.abs(A)); },
    ],
  },
};

// Systems L1 written plainly (the first draft above was convoluted).
TOPICS.systems.levels[0] = () => {
  const x = rnd(-6, 6), y = rnd(-6, 6), a = nz(-4, 4), c = nz(-4, 4), d = nz(-4, 4);
  const b = y - a * x;
  return Q(`y = ${lin(a, b)};  ${axby(c, d)} = ${c * x + d * y}. Solve for (x, y).`, pairAns(x, y));
};

// ---- prerequisites ---------------------------------------------------------------------------
// What a subject leans on. Used by the Player Handbook to draw the subject map:
// every entry points backwards, to subjects on the same tier or an earlier one,
// so the map lays out in tier order with no edge ever pointing up the ladder.
const PREREQS = {
  // Bronze
  addition: [],
  subtraction: ["addition"],
  multiplication: ["addition"],
  division: ["multiplication", "subtraction"],
  // Silver
  fractions: ["division"],
  orderOps: ["multiplication", "subtraction"],
  exponents: ["multiplication"],
  linear: ["subtraction", "division"],
  // Gold
  areaPerimeter: ["multiplication", "orderOps"],
  distance: ["subtraction", "exponents"],
  circles: ["exponents", "fractions"],
  pythagorean: ["exponents", "distance"],
  // Crystal
  sectors: ["circles", "fractions"],
  functions: ["linear", "orderOps"],
  graphing: ["linear", "fractions"],
  factoring: ["linear", "exponents"],
  // Emerald
  multiplyPoly: ["factoring"],
  systems: ["linear", "graphing"],
  quadratics: ["factoring"],
  complexIntro: ["exponents", "pythagorean"],
  // Amethyst
  addComplex: ["complexIntro"],
  mulComplex: ["complexIntro", "multiplyPoly"],
  conjugates: ["mulComplex"],
  divComplex: ["conjugates", "fractions"],
  // Ruby
  graphQuad: ["quadratics", "graphing"],
  stats1: ["functions", "graphQuad"],
  stats2: ["stats1", "exponents", "functions", "graphQuad"],
  stats3: ["stats1", "fractions", "functions", "graphQuad"],
  // Obsidian
  trig: ["pythagorean", "fractions", "circles", "functions", "graphQuad"],
  lawCos: ["trig", "pythagorean"],
  lawSines: ["trig"],
  sinusoid: ["trig", "graphing"],
};

// ---- lessons ---------------------------------------------------------------------------------
// One per topic, taught before the stadium opens. `idea` is the one-line point,
// `rules` are what you actually do, `examples` are worked end to end, and `watch`
// is the mistake this topic reliably produces. Keyed by TOPICS id.
const LESSONS = {
  addition: {
    idea: "Adding multi-digit numbers is column work: line the place values up and carry when a column passes 9.",
    rules: [
      "Write the numbers so ones sit over ones and tens over tens.",
      "Add one column at a time, right to left.",
      "If a column comes to 10 or more, write its ones digit and carry the ten into the next column.",
    ],
    examples: [
      { q: "47 + 68", steps: ["Ones: 7 + 8 = 15. Write 5, carry 1.", "Tens: 4 + 6 = 10, plus the carried 1 makes 11."], a: "115" },
      { q: "286 + 457", steps: ["Ones: 6 + 7 = 13. Write 3, carry 1.", "Tens: 8 + 5 + 1 = 14. Write 4, carry 1.", "Hundreds: 2 + 4 + 1 = 7."], a: "743" },
    ],
    watch: "Forgetting the carry is the usual slip: 47 + 68 is 115, not 105.",
  },
  subtraction: {
    idea: "Subtraction is column work too, but where addition carries, subtraction borrows.",
    rules: [
      "Line up the place values and work right to left.",
      "If the top digit is smaller than the bottom one, borrow 10 from the column to its left.",
      "Borrowing drops the column you took from by 1.",
    ],
    examples: [
      { q: "62 − 38", steps: ["Ones: 2 − 8 won't go, so borrow: 12 − 8 = 4.", "Tens: the 6 became 5, so 5 − 3 = 2."], a: "24" },
      { q: "803 − 47", steps: ["The tens are 0, so borrow from the hundreds first: 7 hundreds, 10 tens, 3 ones.", "Now move a ten across: 9 tens, 13 ones. 13 − 7 = 6.", "Tens: 9 − 4 = 5. Hundreds: 7."], a: "756" },
    ],
    watch: "Borrowing across a zero catches most people: the zero becomes 9, not 10.",
  },
  multiplication: {
    idea: "Multiplying multi-digit numbers means multiplying by each digit separately and adding the pieces.",
    rules: [
      "Multiply the top number by the ones digit of the bottom, then by its tens digit.",
      "The tens row shifts one place left, because you are really multiplying by tens.",
      "Add the rows.",
    ],
    examples: [
      { q: "34 × 26", steps: ["34 × 6 = 204.", "34 × 20 = 680.", "204 + 680 = 884."], a: "884" },
      { q: "57 × 8", steps: ["7 × 8 = 56. Write 6, carry 5.", "5 × 8 = 40, plus the carried 5 is 45."], a: "456" },
    ],
    watch: "Skipping the shift on the second row is the classic error: it is 34 × 20, not 34 × 2.",
  },
  division: {
    idea: "Long division asks how many times the divisor fits, one place value at a time.",
    rules: [
      "Work left to right through the digits of the number being divided.",
      "At each step: how many times does it fit? Write that digit, multiply back, subtract, bring down the next digit.",
      "Whatever is left at the end is the remainder.",
    ],
    examples: [
      { q: "476 ÷ 7", steps: ["7 into 4 is 0, so take 47. It fits 6 times (42), leaving 5.", "Bring down the 6 to make 56. 7 fits 8 times exactly."], a: "68" },
      { q: "912 ÷ 4", steps: ["4 into 9 is 2 (8), leaving 1.", "Bring down 1 to make 11. 4 fits 2 times (8), leaving 3.", "Bring down 2 to make 32. 4 fits 8 times."], a: "228" },
    ],
    watch: "Line each new answer digit up over the digit you just brought down, or the place values drift.",
  },

  fractions: {
    idea: "Fractions only add when they share a denominator, but they multiply straight across.",
    rules: [
      "Same denominator: add the numerators and keep the denominator.",
      "Different denominators: rewrite over a common one first. (a/b) ± (c/d) = (ad ± bc)/bd always works.",
      "Multiply across the top and across the bottom. To divide, flip the second fraction and multiply.",
      "Reduce at the end by dividing top and bottom by their common factor.",
    ],
    examples: [
      { q: "2/5 + 3/7", steps: ["Common denominator 35.", "2/5 = 14/35 and 3/7 = 15/35.", "14 + 15 = 29."], a: "29/35" },
      { q: "3/4 ÷ 2/9", steps: ["Flip the second and multiply: 3/4 × 9/2.", "3 × 9 = 27 over 4 × 2 = 8.", "27 and 8 share no factor."], a: "27/8" },
    ],
    watch: "Never add the denominators. 1/2 + 1/3 is 5/6, not 2/5.",
  },
  orderOps: {
    idea: "An expression is evaluated in a fixed order, not left to right.",
    rules: [
      "Brackets, then exponents, then multiplication and division, then addition and subtraction.",
      "Multiplication does not beat division, and addition does not beat subtraction: equal rank means left to right.",
      "A bracket has to be fully finished before anything outside it happens.",
    ],
    examples: [
      { q: "6 + 4 × (9 − 5)²", steps: ["Brackets: 9 − 5 = 4.", "Exponent: 4² = 16.", "Multiply: 4 × 16 = 64.", "Add: 6 + 64."], a: "70" },
      { q: "(7 × 6 − 12) ÷ 5", steps: ["Inside the bracket, multiply first: 7 × 6 = 42.", "Then subtract: 42 − 12 = 30.", "Finally divide: 30 ÷ 5."], a: "6" },
    ],
    watch: "6 + 4 × 4 is 22, not 40. The multiplication happens before the addition.",
  },
  exponents: {
    idea: "An exponent counts how many copies of the base get multiplied; a root runs that backwards.",
    rules: [
      "a^b means b copies of a multiplied together, so 3^4 = 3 × 3 × 3 × 3 = 81.",
      "√n asks what squares to n. ∛n asks what cubes to n.",
      "To solve a^x = n, write n as a power of a and read off the exponent.",
    ],
    examples: [
      { q: "2^5", steps: ["2 × 2 = 4, × 2 = 8, × 2 = 16, × 2 = 32."], a: "32" },
      { q: "Solve 3^x = 243", steps: ["Powers of 3: 3, 9, 27, 81, 243.", "243 is the fifth one."], a: "5" },
    ],
    watch: "3^4 is 81, not 12. Exponents are repeated multiplication, not multiplication.",
  },
  linear: {
    idea: "Solving for x means undoing what was done to it, keeping the two sides equal at every step.",
    rules: [
      "Whatever you do, do it to both sides.",
      "Collect every x on one side and every plain number on the other.",
      "Undo in reverse order: additions and subtractions first, then the coefficient.",
    ],
    examples: [
      { q: "Solve 5x + 7 = 32", steps: ["Subtract 7 from both sides: 5x = 25.", "Divide both sides by 5."], a: "x = 5" },
      { q: "Solve 4(x − 3) = 6x + 2", steps: ["Expand: 4x − 12 = 6x + 2.", "Subtract 4x: −12 = 2x + 2.", "Subtract 2: −14 = 2x."], a: "x = −7" },
    ],
    watch: "Whatever you do to one side goes to the whole other side, not just one term of it.",
  },

  areaPerimeter: {
    idea: "Perimeter is the distance around a shape; area is the space inside it.",
    rules: [
      "Rectangle: perimeter 2(w + h), area w × h. Square of side s: perimeter 4s, area s².",
      "Triangle: area = ½ × base × height.",
      "Parallelogram: base × height. Trapezoid: ½(b₁ + b₂) × height.",
      "The height is always perpendicular to the base, never the slanted side.",
    ],
    examples: [
      { q: "Area of a triangle with base 14 and height 9", steps: ["½ × 14 = 7.", "7 × 9 = 63."], a: "63" },
      { q: "Area of a trapezoid with bases 6 and 10 and height 7", steps: ["Average the bases: (6 + 10)/2 = 8.", "8 × 7 = 56."], a: "56" },
    ],
    watch: "Perimeter and area are different questions. Read which one is being asked.",
  },
  distance: {
    idea: "The distance between two points is the hypotenuse of the right triangle they make.",
    rules: [
      "Same y: the distance is just the difference in x. Same x: the difference in y.",
      "Otherwise distance = √((x₂ − x₁)² + (y₂ − y₁)²).",
      "The differences get squared, so their signs never matter.",
    ],
    examples: [
      { q: "Distance between (2, 3) and (7, 15)", steps: ["Across: 7 − 2 = 5. Up: 15 − 3 = 12.", "5² + 12² = 25 + 144 = 169.", "√169 = 13."], a: "13" },
      { q: "Distance between (−4, 6) and (−4, −1)", steps: ["The x values match, so it is a straight vertical drop.", "6 − (−1) = 7."], a: "7" },
    ],
    watch: "Look for 3-4-5, 5-12-13 and 8-15-17. Most of these are built from those triples.",
  },
  circles: {
    idea: "Everything about a circle follows from its radius.",
    rules: [
      "Diameter = 2r. Circumference = 2πr. Area = πr².",
      "An answer in terms of π keeps the symbol: write 18pi, not 56.5.",
      "Backwards: area 49π means r² = 49, so r = 7.",
    ],
    examples: [
      { q: "Circumference of a circle with radius 9", steps: ["2 × 9 = 18.", "So the circumference is 18π."], a: "18pi" },
      { q: "A circle has area 36π. What is its radius?", steps: ["πr² = 36π, so r² = 36."], a: "6" },
    ],
    watch: "Circumference doubles the radius, area squares it. 2πr and πr² are easy to swap by accident.",
  },
  pythagorean: {
    idea: "In a right triangle the two legs and the hypotenuse are tied together by a² + b² = c².",
    rules: [
      "c is always the hypotenuse: opposite the right angle, and the longest side.",
      "Missing hypotenuse: add the squares of the legs, then take the root.",
      "Missing leg: subtract, don't add. a² = c² − b².",
      "Common triples: 3-4-5, 5-12-13, 8-15-17, 7-24-25, and every multiple of them.",
    ],
    examples: [
      { q: "A right triangle has legs 9 and 12. Hypotenuse?", steps: ["81 + 144 = 225.", "√225 = 15. (It is 3-4-5 tripled.)"], a: "15" },
      { q: "Hypotenuse 26, one leg 10. Other leg?", steps: ["26² = 676 and 10² = 100.", "676 − 100 = 576.", "√576 = 24."], a: "24" },
    ],
    watch: "Adding where you should subtract is the whole trap. Work out which side is the hypotenuse first.",
  },

  sectors: {
    idea: "A sector is a slice of a circle, and it keeps exactly its share of the whole.",
    rules: [
      "A θ° sector is θ/360 of the circle.",
      "Sector area = (θ/360) × πr². Arc length = (θ/360) × 2πr.",
      "Backwards: divide the sector's area by the whole circle's area to get θ/360.",
    ],
    examples: [
      { q: "Area of a 90° sector of a circle with radius 6", steps: ["90/360 = 1/4.", "Whole circle: π × 36 = 36π.", "A quarter of that."], a: "9pi" },
      { q: "Arc length of a 120° sector with radius 9", steps: ["120/360 = 1/3.", "Circumference: 2π × 9 = 18π.", "A third of that."], a: "6pi" },
    ],
    watch: "Area uses r², arc length uses r. The θ/360 fraction is the same for both.",
  },
  functions: {
    idea: "f(x) is a rule. f(3) means run that rule with 3 in place of every x.",
    rules: [
      "Substitute the number for x everywhere, then evaluate in the usual order.",
      "Negative inputs need brackets: if f(x) = x², then f(−4) = (−4)² = 16.",
      "f(g(x)) means do g first, then feed its answer into f.",
    ],
    examples: [
      { q: "f(x) = 2x² − 3x + 1. Find f(−2).", steps: ["(−2)² = 4, so 2 × 4 = 8.", "−3 × (−2) = +6.", "8 + 6 + 1 = 15."], a: "15" },
      { q: "f(x) = 3x + 1, g(x) = x² + 2. Find f(g(2)).", steps: ["Inside first: g(2) = 4 + 2 = 6.", "Then f(6) = 18 + 1."], a: "19" },
    ],
    watch: "f(g(x)) and g(f(x)) are different numbers. Work from the inside out.",
  },
  graphing: {
    idea: "A straight line is pinned down by its slope and where it crosses the y-axis.",
    rules: [
      "Slope m = (y₂ − y₁)/(x₂ − x₁), rise over run.",
      "Slope-intercept form is y = mx + b, where b is the y-intercept.",
      "x-intercept: set y = 0 and solve. y-intercept: set x = 0 and solve.",
    ],
    examples: [
      { q: "Slope of the line through (−2, 5) and (4, −7)", steps: ["Rise: −7 − 5 = −12.", "Run: 4 − (−2) = 6.", "−12/6 = −2."], a: "−2" },
      { q: "Where does 3x + 4y = 12 cross the x-axis?", steps: ["Crossing the x-axis means y = 0.", "3x = 12."], a: "x = 4" },
    ],
    watch: "Subtract the coordinates in the same order on the top and the bottom, or the sign flips.",
  },
  factoring: {
    idea: "Factoring runs multiplication backwards: turn a quadratic into two brackets.",
    rules: [
      "For x² + bx + c, find two numbers that multiply to c and add to b.",
      "Those two numbers go straight into (x + p)(x + q).",
      "If c is positive the two share a sign, and b says which. If c is negative they differ.",
      "With a leading coefficient, look for the split of the middle term that lets you group.",
    ],
    examples: [
      { q: "Factor x² + 7x + 12", steps: ["Multiply to 12, add to 7: 3 and 4."], a: "(x+3)(x+4)" },
      { q: "Factor x² − 2x − 15", steps: ["Multiply to −15, add to −2: 3 and −5."], a: "(x+3)(x−5)" },
    ],
    watch: "Check by expanding. The middle term is where a wrong sign shows up.",
  },

  multiplyPoly: {
    idea: "Multiplying brackets means every term in the first meets every term in the second.",
    rules: [
      "(a + b)(c + d) = ac + ad + bc + bd, then collect like terms.",
      "(x + p)(x + q) = x² + (p + q)x + pq.",
      "(ax + b)² = a²x² + 2abx + b²: square each end and double the cross term.",
    ],
    examples: [
      { q: "Expand (x − 4)(x + 9)", steps: ["x × x = x².", "x × 9 and −4 × x give 9x − 4x = 5x.", "−4 × 9 = −36."], a: "x^2+5x-36" },
      { q: "Expand (3x + 5)²", steps: ["(3x)² = 9x².", "2 × 3x × 5 = 30x.", "5² = 25."], a: "9x^2+30x+25" },
    ],
    watch: "(x + 5)² is not x² + 25. The middle term 10x is real.",
  },
  systems: {
    idea: "Two equations and two unknowns: use one of them to knock a variable out of the other.",
    rules: [
      "Substitution: if one equation already gives y, put that expression into the other.",
      "Elimination: scale the equations so one variable cancels when you add or subtract them.",
      "Once you have one variable, put it back to get the other. Answer as (x, y).",
    ],
    examples: [
      { q: "y = 2x − 1 and 3x + 2y = 12", steps: ["Substitute: 3x + 2(2x − 1) = 12.", "7x − 2 = 12, so x = 2.", "y = 2(2) − 1 = 3."], a: "(2, 3)" },
      { q: "2x + 3y = 12 and 4x − 3y = 6", steps: ["The 3y terms cancel when you add: 6x = 18.", "x = 3, so 6 + 3y = 12."], a: "(3, 2)" },
    ],
    watch: "Answer both variables. Half a solution scores nothing.",
  },
  quadratics: {
    idea: "A quadratic is zero exactly when one of its factors is zero.",
    rules: [
      "x² = n has two roots, +√n and −√n.",
      "Factor first: (x − p)(x − q) = 0 gives x = p and x = q.",
      "x² − (p + q)x + pq = 0 has roots p and q, readable straight off the factors.",
      "With a leading coefficient a root can be a fraction: ax + b = 0 gives x = −b/a.",
    ],
    examples: [
      { q: "Solve x² − 7x + 10 = 0", steps: ["Multiply to 10, add to −7: −2 and −5.", "(x − 2)(x − 5) = 0."], a: "2, 5" },
      { q: "Solve 3x² + 5x − 2 = 0", steps: ["Factors: (3x − 1)(x + 2).", "3x − 1 = 0 gives x = 1/3.", "x + 2 = 0 gives x = −2."], a: "1/3, −2" },
    ],
    watch: "Two brackets mean two answers. Give both unless the question asks for one.",
  },
  complexIntro: {
    idea: "i is defined by i² = −1, which is what gives negative numbers square roots.",
    rules: [
      "√(−n) = i√n, so √(−25) = 5i.",
      "Powers of i cycle every four: i, −1, −i, 1. Divide the exponent by 4 and use the remainder.",
      "|a + bi| = √(a² + b²), the same distance formula, measured from the origin.",
    ],
    examples: [
      { q: "Simplify √(−49)", steps: ["√49 = 7.", "The minus under the root becomes i."], a: "7i" },
      { q: "Simplify i^27", steps: ["27 ÷ 4 leaves remainder 3.", "i³ = −i."], a: "−i" },
    ],
    watch: "i⁴ = 1, so only the remainder matters. i^100 is just 1.",
  },

  addComplex: {
    idea: "Complex numbers add in two separate columns: reals with reals, imaginaries with imaginaries.",
    rules: [
      "(a + bi) + (c + di) = (a + c) + (b + d)i.",
      "Subtracting flips the sign of both parts of the second number.",
      "Leave the answer in a + bi form.",
    ],
    examples: [
      { q: "(3 + 5i) + (8 + 2i)", steps: ["Reals: 3 + 8 = 11.", "Imaginaries: 5 + 2 = 7."], a: "11+7i" },
      { q: "(4 − 6i) − (9 + 2i)", steps: ["Reals: 4 − 9 = −5.", "Imaginaries: −6 − 2 = −8."], a: "−5−8i" },
    ],
    watch: "A minus in front of a bracket hits both parts of it, not just the first.",
  },
  mulComplex: {
    idea: "Multiply complex numbers like brackets, then use i² = −1 to fold the last term into the real part.",
    rules: [
      "(a + bi)(c + di) = ac + adi + bci + bdi², and bdi² is just −bd.",
      "So the real part is ac − bd and the imaginary part is ad + bc.",
      "(a + bi)² = (a² − b²) + 2abi.",
    ],
    examples: [
      { q: "(2 + 3i)(4 − 5i)", steps: ["Real: 2×4 − 3×(−5) = 8 + 15 = 23.", "Imaginary: 2×(−5) + 3×4 = −10 + 12 = 2."], a: "23+2i" },
      { q: "(3 − 4i)²", steps: ["a = 3, b = −4.", "Real: 9 − 16 = −7.", "Imaginary: 2 × 3 × (−4) = −24."], a: "−7−24i" },
    ],
    watch: "i² = −1 is what turns the last term real. Dropping it is the usual slip.",
  },
  conjugates: {
    idea: "The conjugate of a + bi is a − bi, and multiplying the two clears i away entirely.",
    rules: [
      "Only the sign of the imaginary part changes.",
      "(a + bi)(a − bi) = a² + b², always a positive real number.",
      "The conjugate of a product is the product of the conjugates.",
    ],
    examples: [
      { q: "Conjugate of −6 + 7i", steps: ["The real part stays −6.", "The imaginary sign flips."], a: "−6−7i" },
      { q: "(5 + 2i)(5 − 2i)", steps: ["a² + b² = 25 + 4."], a: "29" },
    ],
    watch: "It is a² + b², not a² − b². The minus in the bracket and the minus from i² cancel.",
  },
  divComplex: {
    idea: "You cannot leave i on the bottom, so multiply top and bottom by the denominator's conjugate.",
    rules: [
      "Dividing by a plain number: divide both parts by it.",
      "Dividing by c + di: multiply top and bottom by c − di.",
      "The new denominator is c² + d², a real number, and the rest is just splitting the fraction.",
    ],
    examples: [
      { q: "(12 − 18i) ÷ 6", steps: ["12 ÷ 6 = 2.", "−18 ÷ 6 = −3."], a: "2−3i" },
      { q: "(1 + 7i) ÷ (3 + i)", steps: ["Multiply top and bottom by 3 − i.", "Bottom: 3² + 1² = 10.", "Top: (1 + 7i)(3 − i) = 3 − i + 21i + 7 = 10 + 20i.", "Divide by 10."], a: "1+2i" },
    ],
    watch: "Top and bottom get the same conjugate, or you have changed the number.",
  },

  graphQuad: {
    idea: "A parabola is described by its vertex and by where it crosses the x-axis.",
    rules: [
      "y = a(x − h)² + k has vertex (h, k). Note the sign flip on h.",
      "From y = ax² + bx + c the vertex sits at x = −b/(2a); put that back in for y.",
      "x-intercepts come from factoring: y = (x − p)(x − q) crosses at p and q.",
    ],
    examples: [
      { q: "Vertex of y = (x − 3)² + 5", steps: ["The bracket reads x − 3, so h = 3.", "k is the 5 outside."], a: "(3, 5)" },
      { q: "x-intercepts of y = x² − x − 12", steps: ["Multiply to −12, add to −1: 3 and −4.", "(x + 3)(x − 4) = 0."], a: "−3, 4" },
    ],
    watch: "(x + 4)² has its vertex at x = −4, not 4.",
  },
  stats1: {
    idea: "Mean, median and mode are three different answers to “what is typical here?”",
    rules: [
      "Mean: add everything, divide by how many there are.",
      "Median: sort the list first, then take the middle value (average the middle two if the count is even).",
      "Mode: whichever value appears most often.",
    ],
    examples: [
      { q: "Mean of 12, 19, 7, 22", steps: ["Sum: 60.", "60 ÷ 4 = 15."], a: "15" },
      { q: "Median of 9, 3, 14, 7, 5", steps: ["Sorted: 3, 5, 7, 9, 14.", "The middle of five is the third."], a: "7" },
    ],
    watch: "The median needs the list sorted. The middle of the unsorted list is not the median.",
  },
  stats2: {
    idea: "Range, variance and standard deviation measure spread rather than centre.",
    rules: [
      "Range = largest − smallest.",
      "Population variance: find the mean, square each value's distance from it, then average those squares.",
      "Population standard deviation is the square root of the variance.",
    ],
    examples: [
      { q: "Range of 14, 3, 27, 8", steps: ["Largest 27, smallest 3."], a: "24" },
      { q: "Population variance of 4, 4, 10, 10", steps: ["Mean is 7.", "Every value is 3 away, so every squared distance is 9.", "The average of four 9s is 9."], a: "9" },
    ],
    watch: "Divide by n for the population version. The sample version divides by n − 1.",
  },
  stats3: {
    idea: "Counting problems all turn on one question: does the order matter?",
    rules: [
      "Probability = favourable outcomes ÷ total outcomes.",
      "Combinations, where order does not matter: C(n, k) = n! ÷ (k!(n − k)!).",
      "Permutations, where order does matter: P(n, k) = n × (n − 1) × … , k factors in all.",
    ],
    examples: [
      { q: "A bag has 4 red and 6 blue marbles. P(red)?", steps: ["4 red out of 10 marbles.", "4/10 reduces."], a: "2/5" },
      { q: "How many ways to choose 3 items from 7?", steps: ["(7 × 6 × 5) ÷ (3 × 2 × 1).", "210 ÷ 6."], a: "35" },
    ],
    watch: "Picking a committee is a combination. Picking 1st, 2nd and 3rd place is a permutation.",
  },

  trig: {
    idea: "In a right triangle, sine, cosine and tangent are just ratios of two sides.",
    rules: [
      "SOH-CAH-TOA: sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent.",
      "Learn the exact values: sin30 = 1/2, sin45 = √2/2, sin60 = √3/2. Cosine is the same list backwards.",
      "tan30 = √3/3, tan45 = 1, tan60 = √3.",
      "A question that gives you the ratio and asks for θ is the same table read the other way.",
    ],
    examples: [
      { q: "Opposite 8, adjacent 15, hypotenuse 17. cos θ = ?", steps: ["Cosine is adjacent over hypotenuse."], a: "15/17" },
      { q: "tan θ = √3 and 0° < θ < 90°. Find θ.", steps: ["From the table, tan 60° = √3."], a: "60" },
    ],
    watch: "Which side counts as “adjacent” depends on which angle you are standing at. The hypotenuse is never the adjacent side.",
  },
  lawCos: {
    idea: "The Law of Cosines is Pythagoras with a correction term for angles that are not 90°.",
    rules: [
      "c² = a² + b² − 2ab·cos C, where C is the angle between sides a and b.",
      "cos 60° = 1/2, so the term becomes −ab. cos 120° = −1/2, so it becomes +ab. cos 90° = 0 and you are back to Pythagoras.",
      "Given all three sides, rearrange: cos C = (a² + b² − c²)/(2ab).",
    ],
    examples: [
      { q: "XY = 3, YZ = 8, angle XYZ = 60°. Find XZ.", steps: ["XZ² = 9 + 64 − 2(3)(8)(1/2).", "= 73 − 24 = 49."], a: "7" },
      { q: "Sides 3 and 5 around an unknown angle, with 7 opposite it.", steps: ["cos C = (9 + 25 − 49)/(2 × 3 × 5) = −15/30 = −1/2.", "That is 120°."], a: "120" },
    ],
    watch: "The angle in the formula must be the one between the two sides you squared.",
  },
  lawSines: {
    idea: "In any triangle, each side is proportional to the sine of the angle opposite it.",
    rules: [
      "a/sin A = b/sin B = c/sin C.",
      "Pair each side with the angle across from it, never one touching it.",
      "The three angles add to 180°, which is how you get the third one.",
    ],
    examples: [
      { q: "Angle X = 30°, side opposite X is 5, side opposite Y is 10. Find angle Y.", steps: ["5/sin30 = 10/sin Y.", "sin30 = 1/2, so the left side is 10.", "sin Y = 1."], a: "90" },
      { q: "Angle X = 30°, angle Y = 45°, side opposite X is 6. Find the side opposite Y.", steps: ["6/sin30 = b/sin45.", "6 ÷ (1/2) = 12.", "b = 12 × (√2/2)."], a: "6√2" },
    ],
    watch: "Match sides to opposite angles. Pairing a side with an angle touching it gives nonsense.",
  },
  sinusoid: {
    idea: "y = A·sin(Bx) + C is a wave: A sets its height, B its speed, C the level it sits on.",
    rules: [
      "Amplitude is |A|, the distance from the middle to a peak. A negative A flips the wave but not its amplitude.",
      "Period is 2π/B, how far along x before the wave repeats.",
      "The wave runs from C − |A| at the bottom to C + |A| at the top.",
    ],
    examples: [
      { q: "Amplitude of y = −4sin(3x) + 2", steps: ["A is −4.", "Amplitude is its size, |−4|."], a: "4" },
      { q: "Maximum of y = 5cos(x) − 3", steps: ["The middle sits at −3.", "The wave rises 5 above that."], a: "2" },
    ],
    watch: "Amplitude is never negative, and the period depends only on B.",
  },
};

// ---- tiers -------------------------------------------------------------------------------------
// Points per question by stadium position (1st..4th) and level (1..3), times the tier multiplier.
const POINTS = [[10, 20, 30], [10, 20, 30], [20, 30, 40], [30, 40, 50]];

// Platinum was removed and its topics folded into the tier below it, cascading all the
// way up: Platinum → Crystal → Emerald → Amethyst → Ruby → Obsidian. Obsidian's own old
// topics (derivatives, integrals, limits, vectors) fell off the end and are no longer used.
// Ruby and Obsidian (with their new, post-cascade topics) also got an easier Coronation:
// more forgiving maxWrong and a level mix weighted toward level 2 over level 3.
const TIER_DEFS = [
  { name: "Bronze", mult: 1, xp: 800, topics: ["addition", "subtraction", "multiplication", "division"], theme: ["#ffd1e8", "#ff8fc8", "#2ea86a"] },
  { name: "Silver", mult: 10, xp: 8000, topics: ["fractions", "orderOps", "exponents", "linear"], theme: ["#f8fafc", "#cbd5e1", "#3b82f6"] },
  { name: "Gold", mult: 100, xp: 80000, topics: ["areaPerimeter", "distance", "circles", "pythagorean"], theme: ["#fff7cc", "#fbbf24", "#b45309"] },
  { name: "Crystal", mult: 1e4, xp: 8e6, topics: ["sectors", "functions", "graphing", "factoring"], theme: ["#eef2ff", "#c7d2fe", "#7c3aed"] },
  { name: "Emerald", mult: 1e5, xp: 8e7, topics: ["multiplyPoly", "systems", "quadratics", "complexIntro"], theme: ["#d1fae5", "#34d399", "#047857"] },
  { name: "Amethyst", mult: 1e6, xp: 8e8, topics: ["addComplex", "mulComplex", "conjugates", "divComplex"], theme: ["#f3e8ff", "#c084fc", "#6b21a8"] },
  { name: "Ruby", mult: 1e7, xp: 8e9, topics: ["graphQuad", "stats1", "stats2", "stats3"], theme: ["#ffe4e6", "#fb7185", "#9f1239"], maxWrong: 4, drawLevel2: 7, drawLevel3: 3 },
  { name: "Obsidian", mult: 1e8, xp: 8e10, topics: ["trig", "lawCos", "lawSines", "sinusoid"], theme: ["#cbd5e1", "#64748b", "#991b1b"], maxWrong: 4, drawLevel2: 7, drawLevel3: 3 },
  { name: "Diamond", tournament: true, theme: ["#ffffff", "#bae6fd", "#0284c7"] },
];

function level(n, count, points, make, bonus) {
  return { level: n, count, points, make, bonus };
}

const tiers = {};
for (const def of TIER_DEFS) {
  if (def.tournament) {
    tiers[def.name] = { planet: "M", theme: def.theme, tournament: true, stadiums: [], coronation: null };
    continue;
  }
  tiers[def.name] = {
    planet: "M",
    theme: def.theme,
    coronation: {
      name: "Coronation Series",
      xpRequired: def.xp,
      cooldownHours: 12,
      maxWrong: def.maxWrong ?? 2,
      drawLevel2: def.drawLevel2 ?? 5,
      drawLevel3: def.drawLevel3 ?? 5,
    },
    stadiums: def.topics.map((key, i) => {
      const t = TOPICS[key];
      return {
        id: key,
        name: t.name,
        lesson: LESSONS[key],
        prereqs: PREREQS[key] || [],
        levels: t.levels.map((make, li) => {
          const bonus = (t.bonus && t.bonus[li]) || { label: `hard ${t.name}`, xp: 50 * def.mult, make: t.levels[2] };
          return level(li + 1, 10, POINTS[i][li] * def.mult, make, bonus);
        }),
      };
    }),
  };
}

// ---- Diamond tournament ------------------------------------------------------------------------
const DIAMOND = {
  name: "Diamond Arena",
  players: 64,
  questionsPerMatch: 5,
  skipPenaltySeconds: 20,
  rounds: ["Round of 64", "Round of 32", "Round of 16", "Quarterfinal", "Semifinal", "Final"],
  // Average seconds per question the AI opponent needs, by round (Finn is the final).
  aiSecondsPerQuestion: [12, 10, 8.5, 7.5, 6.5, 5],
  aiNames: ["Nova Kestrel", "Idris Vale", "Mara Quill", "Theo Brandt", "Suki Aoyama", "Lena Marsh", "Rafael Oduya", "Priya Nair", "Cole Whitaker", "Anya Petrov", "Kenji Sato", "Zara Okafor", "Milo Reyes", "Freya Lund", "Dev Malhotra", "Ines Duarte", "Jonah Weiss", "Tamsin Hale", "Luca Moretti", "Amara Diallo", "Beck Sorensen", "Wren Calloway", "Elio Ferreira", "Nadia Haddad", "Oscar Lindqvist", "Yuki Tanaka", "Ravi Chandra", "Sloane Barrett", "Ezra Coleman", "Halle Winters"],
  // Question pool: the hardest level of every stadium from Bronze through Obsidian.
  pool: TIER_DEFS.filter((d) => !d.tournament).flatMap((d) => d.topics.map((key) => ({ topic: TOPICS[key].name, tier: d.name, make: TOPICS[key].levels[2] }))),
};

// ---- Dragon Hunter minigame ------------------------------------------------------------------
// Buy pets with XP, pick a team of three, and fight the dragon ladder in order.
// Damage = power × (attacker atk / 10) × element effectiveness × 0.85–1.0.
const DRAGON_HUNTER = {
  teamSize: 3,
  elements: { fire: "🔥", water: "💧", grass: "🌿", electric: "⚡", ice: "❄️", light: "✨", shadow: "🌑", normal: "•" },
  // element → elements it hits for double damage (the reverse pairing does half)
  strong: { fire: ["grass", "ice"], water: ["fire"], grass: ["water"], electric: ["water"], ice: ["grass"], light: ["shadow"], shadow: ["light"] },
  pets: [
    { id: "fox", name: "Ember Fox", emoji: "🦊", element: "fire", price: 100, hp: 60, atk: 10, moves: [{ name: "Scratch", power: 10, element: "normal" }, { name: "Flame Bite", power: 16, element: "fire" }, { name: "Curl Up", heal: 15 }] },
    { id: "newt", name: "Puddle Newt", emoji: "🦎", element: "water", price: 250, hp: 70, atk: 11, moves: [{ name: "Splash", power: 10, element: "normal" }, { name: "Water Jet", power: 18, element: "water" }, { name: "Soak", heal: 18 }] },
    { id: "hare", name: "Sprout Hare", emoji: "🐇", element: "grass", price: 500, hp: 80, atk: 12, moves: [{ name: "Nibble", power: 12, element: "normal" }, { name: "Leaf Blade", power: 20, element: "grass" }, { name: "Photosynthesis", heal: 22 }] },
    { id: "pup", name: "Static Pup", emoji: "🐕", element: "electric", price: 1000, hp: 85, atk: 14, moves: [{ name: "Nip", power: 12, element: "normal" }, { name: "Thunder Jolt", power: 22, element: "electric" }, { name: "Recharge", heal: 25 }] },
    { id: "owl", name: "Frost Owl", emoji: "🦉", element: "ice", price: 2500, hp: 95, atk: 16, moves: [{ name: "Peck", power: 14, element: "normal" }, { name: "Ice Shard", power: 24, element: "ice" }, { name: "Roost", heal: 28 }] },
    { id: "tortoise", name: "Magma Tortoise", emoji: "🐢", element: "fire", price: 5000, hp: 130, atk: 17, moves: [{ name: "Slam", power: 16, element: "normal" }, { name: "Lava Burst", power: 28, element: "fire" }, { name: "Shell Rest", heal: 35 }] },
    { id: "serpent", name: "Tide Serpent", emoji: "🐍", element: "water", price: 15000, hp: 140, atk: 20, moves: [{ name: "Coil", power: 18, element: "normal" }, { name: "Tidal Crash", power: 32, element: "water" }, { name: "Deep Rest", heal: 40 }] },
    { id: "griffin", name: "Storm Griffin", emoji: "🦅", element: "electric", price: 50000, hp: 160, atk: 24, moves: [{ name: "Talon", power: 20, element: "normal" }, { name: "Lightning Dive", power: 36, element: "electric" }, { name: "Wind Rest", heal: 45 }] },
    { id: "bear", name: "Glacier Bear", emoji: "🐻‍❄️", element: "ice", price: 200000, hp: 200, atk: 28, moves: [{ name: "Maul", power: 24, element: "normal" }, { name: "Blizzard", power: 42, element: "ice" }, { name: "Hibernate", heal: 60 }] },
    { id: "phoenix", name: "Radiant Phoenix", emoji: "🐦‍🔥", element: "light", price: 1000000, hp: 240, atk: 34, moves: [{ name: "Wing Strike", power: 26, element: "normal" }, { name: "Solar Flare", power: 50, element: "light" }, { name: "Rebirth", heal: 80 }] },
  ],
  dragons: [
    { id: "bog", name: "Bog Wyrm", emoji: "🐉", element: "grass", hp: 90, atk: 10, moves: [{ name: "Vine Lash", power: 14, element: "grass" }, { name: "Bite", power: 10, element: "normal" }] },
    { id: "cinder", name: "Cinder Drake", emoji: "🐲", element: "fire", hp: 150, atk: 13, moves: [{ name: "Fireball", power: 18, element: "fire" }, { name: "Tail Whip", power: 12, element: "normal" }] },
    { id: "tempest", name: "Tempest Wyvern", emoji: "🐉", element: "electric", hp: 220, atk: 17, moves: [{ name: "Thunderclap", power: 22, element: "electric" }, { name: "Wing Slash", power: 16, element: "normal" }, { name: "Static Rest", heal: 30 }] },
    { id: "frost", name: "Frost Leviathan", emoji: "🐲", element: "ice", hp: 320, atk: 21, moves: [{ name: "Glacier Breath", power: 26, element: "ice" }, { name: "Crush", power: 20, element: "normal" }, { name: "Deep Freeze", heal: 40 }] },
    { id: "king", name: "Shadow Dragon King", emoji: "👑", element: "shadow", hp: 480, atk: 27, moves: [{ name: "Void Breath", power: 34, element: "shadow" }, { name: "Dark Claw", power: 24, element: "normal" }, { name: "Drain", heal: 40 }] },
  ],
};

// ---- Meteor Showdown minigame ---------------------------------------------------------------
// Pay XP for one round. The ground is a grid of columns × depth layers. Each wave, meteors hit
// random columns (with half-power splash on the neighbours) and burrow downward, chewing through
// armor one point at a time. If a meteor reaches the crew's bunker cell, the round is lost.
// Between waves you spend supplies to armor cells or move the crew. Survive every wave to win.
const METEOR_SHOWDOWN = {
  price: 500000,
  cols: 5,
  rows: 4,
  waves: 5,
  startSupply: 10,
  supplyPerWave: 8,
  armorStart: 1,     // plain soil
  armorMax: 4,
  armorCost: 1,      // supplies per armor point
  moveCost: 3,       // supplies to relocate the crew
  supplyPrice: 20000, // XP per extra supply bought mid-round
  crewStart: { row: 2, col: 3 },
  meteorsForWave: (w) => w + 1,
  powerForWave: (w) => rnd(w, w + 2),
};

const GAME_DATA = {
  guide: {
    name: "Finn Reaper",
    image: "assets/finn-avatar.jpg",   // square face crop, used for the dialogue avatar
    portrait: "assets/finn-full.jpg",  // wide publicity shot, used on his intro screens
  },
  tierChain: TIER_DEFS.map((d) => d.name),
  demoContest: { id: "demo", name: "Demo Contest", count: 2, points: 10, make: () => addQ(2, 2) },
  tiers,
  diamond: DIAMOND,
  dragonHunter: DRAGON_HUNTER,
  meteorShowdown: METEOR_SHOWDOWN,
};
