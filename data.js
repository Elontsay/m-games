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

  // Platinum
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

  // Crystal
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

  // Emerald
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

  // Amethyst
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

  // Ruby
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
  lawCos: {
    name: "Law of Cosines",
    levels: [
      () => { const [a, b, c] = pick([[3, 8, 7], [5, 8, 7], [7, 15, 13], [8, 15, 13], [5, 21, 19], [16, 21, 19]]); return Q(`Two sides of a triangle are ${a} and ${b} with a 60° angle between them. Third side?`, c); },
      () => { const [a, b, c] = pick([[3, 5, 7], [5, 16, 19], [7, 8, 13], [3, 5, 7], [11, 24, 31], [9, 15, 21]]); return Q(`Two sides of a triangle are ${a} and ${b} with a 120° angle between them. Third side?`, c); },
      () => { const set = pick([[3, 8, 7, 60], [5, 8, 7, 60], [7, 15, 13, 60], [3, 5, 7, 120], [7, 8, 13, 120], [5, 16, 19, 120], [3, 4, 5, 90], [5, 12, 13, 90], [8, 15, 17, 90]]); return Q(`A triangle has sides ${set[0]}, ${set[1]}, and ${set[2]}. What is the angle (in degrees) opposite the side of length ${set[2]}?`, set[3]); },
    ],
  },
  lawSines: {
    name: "Law of Sines",
    levels: [
      () => { const k = rnd(2, 15); return Math.random() < 0.5 ? Q(`In triangle ABC, angle A = 30°, angle B = 90°, and side a = ${k}. Find side b.`, 2 * k) : Q(`In triangle ABC, angle A = 90°, angle B = 30°, and side a = ${2 * k}. Find side b.`, k); },
      () => { const k = rnd(2, 15); return Math.random() < 0.5 ? Q(`In triangle ABC, angle A = 30°, side a = ${k}, side b = ${2 * k}. Find angle B in degrees.`, 90) : Q(`In triangle ABC, angle A = 30°, side a = ${k}, side b = ${k}. Find angle B in degrees.`, 30); },
      () => { const k = rnd(2, 15); return Math.random() < 0.5 ? Q(`In triangle ABC, angle A = 30°, angle B = 60°, side a = ${k}. Find side c.`, 2 * k) : Q(`In triangle ABC, angle A = 90°, angle B = 60°, side a = ${2 * k}. Find side c.`, k); },
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

  // Obsidian
  derivatives: {
    name: "Derivatives",
    levels: [
      () => { const a = rnd(1, 9), n = rnd(2, 5); return Q(`d/dx of ${a === 1 ? "" : a}x^${n}?  (e.g. 6x^2)`, poly([a * n, ...Array(n - 1).fill(0)])); },
      () => { const a = nz(-6, 6), b = nz(-9, 9), c = rnd(-9, 9); return Q(`d/dx of ${polyDisp([a, b, c])}?`, poly([2 * a, b])); },
      () => { const a = rnd(1, 4), b = nz(-5, 5), n = rnd(2, 3), c = rnd(-3, 3); return Q(`f(x) = (${lin(a, b)})^${n}. Find f′(${c}).`, n * a * (a * c + b) ** (n - 1)); },
    ],
  },
  integrals: {
    name: "Integrals",
    levels: [
      () => { const n = rnd(1, 4), k = rnd(1, 6); const a = k * (n + 1); const body = poly([k, ...Array(n + 1).fill(0)]); return Q(`∫ ${a}x^${n} dx = ?  (e.g. 2x^3+C)`, [`${body}+c`, body]); },
      () => { const a = rnd(1, 9), b = rnd(1, 8); const v = (a * b * b) / 2; if (!Number.isInteger(v)) return TOPICS.integrals.levels[1](); return Q(`∫ from 0 to ${b} of ${a === 1 ? "" : a}x dx = ?`, v); },
      () => { const a = pick([3, 6, 9]), p = rnd(0, 3), q = rnd(p + 1, 5); return Q(`∫ from ${p} to ${q} of ${a}x² dx = ?`, (a * (q ** 3 - p ** 3)) / 3); },
    ],
  },
  limits: {
    name: "Limits",
    levels: [
      () => { const a = nz(-5, 5), b = nz(-9, 9), d = rnd(-9, 9), c = rnd(-5, 5); return Q(`lim (x→${c}) of ${polyDisp([a, b, d])} = ?`, a * c * c + b * c + d); },
      () => { const c = nz(-9, 9); return Q(`lim (x→${c}) of (x² − ${c * c}) / (x ${c < 0 ? "+" : "−"} ${Math.abs(c)}) = ?`, 2 * c); },
      () => { const a = nz(-9, 9), b = rnd(-9, 9), c = rnd(1, 9), d = rnd(-9, 9); return Q(`lim (x→∞) of (${polyDisp([a, b, 0])}) / (${polyDisp([c, 0, d])}) = ? (fraction if needed)`, fracAns(a, c)); },
    ],
  },
  vectors: {
    name: "Vectors",
    levels: [
      () => { const [p, q, r] = pick(TRIPLES.slice(0, 4)); const k = rnd(1, 3); const sp = pick([-1, 1]), sq = pick([-1, 1]); return Q(`Magnitude of the vector ⟨${sp * p * k}, ${sq * q * k}⟩?`, r * k); },
      () => { const a = nz(-9, 9), b = nz(-9, 9), c = nz(-9, 9), d = nz(-9, 9); return Q(`⟨${a}, ${b}⟩ · ⟨${c}, ${d}⟩ = ?`, a * c + b * d); },
      () => { const a = nz(-9, 9), b = nz(-9, 9), c = nz(-9, 9), d = nz(-9, 9), k = rnd(2, 4), m = rnd(1, 3); return Q(`u = ⟨${a}, ${b}⟩, v = ⟨${c}, ${d}⟩. Find ${k}u ${Math.random() < 0.5 ? "+" : "−"} ${m === 1 ? "" : m}v.`.replace(/(\d)u ([+−]) (\d*)v/, (s, kk, op, mm) => s), pairAns(k * a + m * c, k * b + m * d)); },
    ],
  },
};

// Vectors L3 needs the sign to match the prompt; rebuild it cleanly.
TOPICS.vectors.levels[2] = () => {
  const a = nz(-9, 9), b = nz(-9, 9), c = nz(-9, 9), d = nz(-9, 9), k = rnd(2, 4), m = rnd(1, 3);
  const plus = Math.random() < 0.5;
  const x = k * a + (plus ? m * c : -m * c), y = k * b + (plus ? m * d : -m * d);
  return Q(`u = ⟨${a}, ${b}⟩, v = ⟨${c}, ${d}⟩. Find ${k}u ${plus ? "+" : "−"} ${m === 1 ? "" : m}v. Answer as (x, y).`, pairAns(x, y));
};

// Systems L1 written plainly (the first draft above was convoluted).
TOPICS.systems.levels[0] = () => {
  const x = rnd(-6, 6), y = rnd(-6, 6), a = nz(-4, 4), c = nz(-4, 4), d = nz(-4, 4);
  const b = y - a * x;
  return Q(`y = ${lin(a, b)};  ${axby(c, d)} = ${c * x + d * y}. Solve for (x, y).`, pairAns(x, y));
};

// ---- tiers -------------------------------------------------------------------------------------
// Points per question by stadium position (1st..4th) and level (1..3), times the tier multiplier.
const POINTS = [[10, 20, 30], [10, 20, 30], [20, 30, 40], [30, 40, 50]];

const TIER_DEFS = [
  { name: "Bronze", mult: 1, xp: 800, topics: ["addition", "subtraction", "multiplication", "division"], theme: ["#ffd1e8", "#ff8fc8", "#2ea86a"] },
  { name: "Silver", mult: 10, xp: 8000, topics: ["fractions", "orderOps", "exponents", "linear"], theme: ["#f8fafc", "#cbd5e1", "#3b82f6"] },
  { name: "Gold", mult: 100, xp: 80000, topics: ["areaPerimeter", "distance", "circles", "pythagorean"], theme: ["#fff7cc", "#fbbf24", "#b45309"] },
  { name: "Platinum", mult: 1000, xp: 800000, topics: ["sectors", "functions", "graphing", "factoring"], theme: ["#ecfeff", "#a5f3fc", "#0e7490"] },
  { name: "Crystal", mult: 1e4, xp: 8e6, topics: ["multiplyPoly", "systems", "quadratics", "complexIntro"], theme: ["#eef2ff", "#c7d2fe", "#7c3aed"] },
  { name: "Emerald", mult: 1e5, xp: 8e7, topics: ["addComplex", "mulComplex", "conjugates", "divComplex"], theme: ["#d1fae5", "#34d399", "#047857"] },
  { name: "Amethyst", mult: 1e6, xp: 8e8, topics: ["graphQuad", "stats1", "stats2", "stats3"], theme: ["#f3e8ff", "#c084fc", "#6b21a8"] },
  { name: "Ruby", mult: 1e7, xp: 8e9, topics: ["trig", "lawCos", "lawSines", "sinusoid"], theme: ["#ffe4e6", "#fb7185", "#9f1239"] },
  { name: "Obsidian", mult: 1e8, xp: 8e10, topics: ["derivatives", "integrals", "limits", "vectors"], theme: ["#cbd5e1", "#64748b", "#991b1b"] },
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
    coronation: { name: "Coronation Series", xpRequired: def.xp, cooldownHours: 12, maxWrong: 2, drawLevel2: 5, drawLevel3: 5 },
    stadiums: def.topics.map((key, i) => {
      const t = TOPICS[key];
      return {
        id: key,
        name: t.name,
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
