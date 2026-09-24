/* Utilities shared by every module: math, easing, seeded randomness, Dutch number
   formatting, star colours, spectral types, DOM helpers, event bus, settings, quality
   presets and the module/scene registry. */

const PHYS = {
  G: 6.674e-11,          // m^3 kg^-1 s^-2
  c: 2.998e8,            // m/s
  sigma: 5.670e-8,       // Stefan-Boltzmann, W m^-2 K^-4
  h: 6.626e-34,
  kB: 1.381e-23,
  Msun: 1.989e30,        // kg
  Rsun: 6.957e8,         // m
  Lsun: 3.828e26,        // W
  Tsun: 5772,            // K
  Mearth: 5.972e24,
  Rearth: 6.371e6,
  Mjup: 1.898e27,
  Rjup: 6.9911e7,
  AU: 1.496e11,
  ly: 9.461e15,
  pc: 3.086e16,
  yr: 3.156e7,           // s
};

const U = {
  clamp: (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)),
  lerp: (a, b, t) => a + (b - a) * t,
  invLerp: (a, b, x) => (x - a) / (b - a),
  mapRange: (x, a, b, c, d, clamp = true) => { let t = (x - a) / (b - a); if (clamp) t = Math.min(1, Math.max(0, t)); return c + (d - c) * t; },
  smoothstep: (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); },
  logLerp: (a, b, t) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * t),
  fract: (x) => x - Math.floor(x),
  deg: (r) => r * 180 / Math.PI,
  rad: (d) => d * Math.PI / 180,

  ease: {
    linear: (t) => t,
    inQuad: (t) => t * t,
    outQuad: (t) => 1 - (1 - t) * (1 - t),
    inOutQuad: (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    inCubic: (t) => t * t * t,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOutCubic: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
    outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  },

  /** Seeded PRNG (mulberry32). Returns () => [0,1). */
  rng(seed = 1) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  /** Standard normal sample using a PRNG from U.rng. */
  gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); },
  /** Uniform random point in the unit ball, written into out (THREE.Vector3). */
  randInSphere(r, out) { let x, y, z; do { x = r() * 2 - 1; y = r() * 2 - 1; z = r() * 2 - 1; } while (x * x + y * y + z * z > 1); return out.set(x, y, z); },
  /** Uniform random direction on the unit sphere. */
  randDir(r, out) { const z = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - z * z); return out.set(s * Math.cos(a), z, s * Math.sin(a)); },

  // ---------------------------------------------------------------- formatting (nl-NL)
  _nf: {},
  nf(maxFrac, minFrac = 0) {
    const k = maxFrac + ':' + minFrac;
    return this._nf[k] || (this._nf[k] = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: maxFrac, minimumFractionDigits: minFrac }));
  },
  /** Plain Dutch number: 1234.5 -> "1.234,5" */
  fmt(n, maxFrac = 2, minFrac = 0) { return this.nf(maxFrac, minFrac).format(n); },
  /** Number with ~sig significant digits, Dutch separators. */
  fmtSig(n, sig = 3) {
    if (n === 0 || !isFinite(n)) return this.fmt(n);
    const mag = Math.floor(Math.log10(Math.abs(n)));
    const frac = Math.max(0, Math.min(8, sig - 1 - mag));
    const rounded = Number(n.toPrecision(sig));
    return this.fmt(rounded, frac);
  },
  _sup: { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' },
  superscript(s) { return String(s).split('').map((c) => this._sup[c] ?? c).join(''); },
  /** Scientific notation: 1.989e30 -> "1,99 × 10³⁰" */
  fmtSci(n, sig = 3) {
    if (n === 0) return '0';
    const e = Math.floor(Math.log10(Math.abs(n)));
    const m = n / Math.pow(10, e);
    const ms = this.fmt(Number(m.toPrecision(sig)), sig - 1);
    return (ms === '1' ? '' : ms + ' × ') + '10' + this.superscript(e);
  },
  _bigWords: [[1e24, 'quadriljoen'], [1e21, 'triljard'], [1e18, 'triljoen'], [1e15, 'biljard'], [1e12, 'biljoen'], [1e9, 'miljard'], [1e6, 'miljoen']],
  /** 4.6e9 -> "4,6 miljard"; 12000 -> "12.000"; 3.2e40 -> "3,2 × 10⁴⁰" */
  fmtBig(n, sig = 3) {
    const a = Math.abs(n);
    if (a >= 1e27) return this.fmtSci(n, sig);
    for (const [v, w] of this._bigWords) if (a >= v) return this.fmtSig(n / v, sig) + ' ' + w;
    if (a >= 1000) return this.fmt(Math.round(Number(n.toPrecision(Math.max(sig, Math.floor(Math.log10(a)) + 1)))), 0);
    if (a >= 1) return this.fmtSig(n, sig);
    if (a === 0) return '0';
    if (a >= 1e-4) return this.fmtSig(n, sig);
    return this.fmtSci(n, sig);
  },
  /** Durations given in years. Tiny values are shown in seconds/milliseconds. */
  fmtYears(y, sig = 3) {
    const a = Math.abs(y);
    if (a === 0) return '0 jaar';
    const s = a * PHYS.yr;
    if (s < 1) { const ms = s * 1000; return ms < 1 ? this.fmtSig(ms * 1000, 2) + ' microseconden' : this.fmtSig(ms, 2) + (Math.round(ms) === 1 ? ' milliseconde' : ' milliseconden'); }
    if (s < 60) return this.fmtSig(s, 2) + (Math.round(s) === 1 ? ' seconde' : ' seconden');
    if (s < 3600) { const m = s / 60; return this.fmtSig(m, 2) + (Math.round(m) === 1 ? ' minuut' : ' minuten'); }
    if (s < 86400) { const h = s / 3600; return this.fmtSig(h, 2) + ' uur'; }
    if (a < 1) { const d = s / 86400; return this.fmtSig(d, 2) + (Math.round(d) === 1 ? ' dag' : ' dagen'); }
    return this.fmtBig(y, sig) + ' jaar';
  },
  fmtTemp(K) { return (K >= 1e6 ? this.fmtBig(K, 3) : this.fmt(Math.round(K / 10) * 10, 0)) + ' K'; },
  fmtMass(m) { return this.fmtSig(m, m < 1 ? 2 : 3) + ' M☉'; },
  fmtLum(l) { return (l >= 1e4 ? this.fmtBig(l, 2) : this.fmtSig(l, 2)) + ' L☉'; },
  fmtRadius(r) {
    const km = r * PHYS.Rsun / 1000;
    if (km < 1e5) return this.fmtBig(Math.round(km), 3) + ' km';
    return (r >= 1e4 ? this.fmtBig(r, 3) : this.fmtSig(r, r < 1 ? 2 : 3)) + ' R☉';
  },

  // ---------------------------------------------------------------- colour
  _bb: [ // blackbody sRGB (D65), after M. Charity's table: [T, r, g, b]
    [1000, 255, 56, 0], [1500, 255, 109, 0], [2000, 255, 137, 18], [2500, 255, 161, 72], [3000, 255, 180, 107],
    [3500, 255, 196, 137], [4000, 255, 209, 163], [4500, 255, 219, 186], [5000, 255, 228, 206], [5500, 255, 236, 224],
    [6000, 255, 243, 239], [6500, 255, 249, 253], [7000, 245, 243, 255], [7500, 235, 238, 255], [8000, 227, 233, 255],
    [9000, 214, 225, 255], [10000, 204, 219, 255], [12000, 191, 211, 255], [15000, 179, 204, 255], [20000, 168, 197, 255],
    [25000, 162, 192, 255], [30000, 159, 189, 255], [40000, 155, 188, 255],
  ],
  _disp: [ // display palette, slightly saturated so the classes read clearly: O blue ... M red
    [400, .30, .10, .16], [800, .45, .13, .16], [1300, .70, .17, .10], [2000, .92, .25, .10], [2800, 1.0, .38, .16],
    [3500, 1.0, .52, .26], [4400, 1.0, .72, .40], [5300, 1.0, .86, .56], [5800, 1.0, .93, .68], [6600, 1.0, .98, .86],
    [7500, .98, .98, .96], [9000, .88, .92, 1.0], [12000, .78, .86, 1.0], [20000, .67, .78, 1.0], [30000, .60, .72, 1.0],
    [50000, .54, .66, 1.0],
  ],
  _interp(table, T, scale) {
    if (T <= table[0][0]) return table[0].slice(1).map((v) => v / scale);
    for (let i = 1; i < table.length; i++) {
      if (T <= table[i][0]) {
        const a = table[i - 1], b = table[i], t = (Math.log(T) - Math.log(a[0])) / (Math.log(b[0]) - Math.log(a[0]));
        return [1, 2, 3].map((k) => (a[k] + (b[k] - a[k]) * t) / scale);
      }
    }
    return table[table.length - 1].slice(1).map((v) => v / scale);
  },
  /** Physically faithful blackbody colour (sRGB, normalised). Returns THREE.Color (linear working space). */
  blackbody(T, out = new THREE.Color()) { const [r, g, b] = this._interp(this._bb, T, 255); return out.setRGB(r, g, b, THREE.SRGBColorSpace); },
  /** Display colour per temperature: O blue, B blue-white, A white, F yellow-white, G yellow, K orange, M red. */
  starColor(T, out = new THREE.Color()) { const [r, g, b] = this._interp(this._disp, T, 1); return out.setRGB(r, g, b, THREE.SRGBColorSpace); },
  /** CSS colour string for a temperature (display palette). */
  starCss(T, alpha = 1) { const [r, g, b] = this._interp(this._disp, T, 1); return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${alpha})`; },

  // ---------------------------------------------------------------- spectral type
  _spt: [ // [Teff, class, subclass] main-sequence scale (after Pecaut & Mamajek 2013)
    [54000, 'O', 2], [44900, 'O', 3], [41400, 'O', 5], [38000, 'O', 6], [35800, 'O', 7], [33000, 'O', 8], [31900, 'O', 9],
    [31400, 'B', 0], [26000, 'B', 1], [20600, 'B', 2], [17000, 'B', 3], [16700, 'B', 4], [15700, 'B', 5], [14500, 'B', 6], [14000, 'B', 7], [12500, 'B', 8], [10700, 'B', 9],
    [9700, 'A', 0], [9300, 'A', 1], [8800, 'A', 2], [8600, 'A', 3], [8250, 'A', 4], [8100, 'A', 5], [7910, 'A', 6], [7760, 'A', 7], [7590, 'A', 8], [7400, 'A', 9],
    [7220, 'F', 0], [7020, 'F', 1], [6820, 'F', 2], [6750, 'F', 3], [6670, 'F', 4], [6550, 'F', 5], [6350, 'F', 6], [6280, 'F', 7], [6180, 'F', 8], [6050, 'F', 9],
    [5930, 'G', 0], [5860, 'G', 1], [5770, 'G', 2], [5720, 'G', 3], [5680, 'G', 4], [5660, 'G', 5], [5600, 'G', 6], [5550, 'G', 7], [5480, 'G', 8], [5380, 'G', 9],
    [5270, 'K', 0], [5170, 'K', 1], [5100, 'K', 2], [4830, 'K', 3], [4600, 'K', 4], [4440, 'K', 5], [4300, 'K', 6], [4100, 'K', 7], [3990, 'K', 8], [3930, 'K', 9],
    [3850, 'M', 0], [3660, 'M', 1], [3560, 'M', 2], [3430, 'M', 3], [3210, 'M', 4], [3060, 'M', 5], [2810, 'M', 6], [2680, 'M', 7], [2570, 'M', 8], [2380, 'M', 9],
    [2270, 'L', 0], [2160, 'L', 1], [2060, 'L', 2], [1920, 'L', 3], [1870, 'L', 4], [1710, 'L', 5], [1550, 'L', 6], [1450, 'L', 7], [1350, 'L', 8], [1300, 'L', 9],
    [1250, 'T', 0], [1200, 'T', 2], [1100, 'T', 4], [1000, 'T', 5], [900, 'T', 6], [800, 'T', 7], [700, 'T', 8], [550, 'T', 9],
    [450, 'Y', 0], [350, 'Y', 1], [250, 'Y', 2],
  ],
  /** Spectral class for an effective temperature: { cls:'G', sub:2, label:'G2' } */
  spectralType(T) {
    const t = this._spt;
    let best = t[0], d = Infinity;
    for (const row of t) { const dd = Math.abs(Math.log(row[0]) - Math.log(T)); if (dd < d) { d = dd; best = row; } }
    return { cls: best[1], sub: best[2], label: best[1] + best[2] };
  },

  // ---------------------------------------------------------------- DOM
  $: (sel, root = document) => root.querySelector(sel),
  $$: (sel, root = document) => Array.from(root.querySelectorAll(sel)),
  /** el('button', {class:'btn', onclick: fn, 'aria-label': 'x'}, 'text' | Node | [..]) */
  el(tag, attrs = {}, children = []) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(e.dataset, v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of [].concat(children)) if (c !== null && c !== undefined && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
    return e;
  },
  escapeHtml: (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  isTouch: () => matchMedia('(pointer: coarse)').matches,
  isMobile: () => matchMedia('(max-width: 760px)').matches,
  /** localStorage that never throws (private mode, blocked storage). */
  store: {
    get(k, d = null) { try { const v = localStorage.getItem('sterren:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('sterren:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  },
};

/** Tiny pub/sub used for loose coupling between modules. */
class EventBus {
  constructor() { this.map = new Map(); }
  on(evt, fn) { if (!this.map.has(evt)) this.map.set(evt, new Set()); this.map.get(evt).add(fn); return () => this.off(evt, fn); }
  off(evt, fn) { this.map.get(evt)?.delete(fn); }
  emit(evt, data) { for (const fn of [...(this.map.get(evt) || [])]) { try { fn(data); } catch (e) { console.error(`[bus:${evt}]`, e); } } }
}
const bus = new EventBus();

const QUALITY = {
  laag: { pixelRatio: 1, antialias: false, particles: 0.35, stars: 3500, bloomStrength: 0.9, bloomRes: 0.5, outline: false, lensflare: false, sphereSeg: 48, bhSteps: 90, bhScale: 0.5, lod: 0 },
  middel: { pixelRatio: 1.5, antialias: true, particles: 0.7, stars: 9000, bloomStrength: 1.0, bloomRes: 0.75, outline: true, lensflare: true, sphereSeg: 96, bhSteps: 160, bhScale: 0.75, lod: 1 },
  hoog: { pixelRatio: 2, antialias: true, particles: 1.0, stars: 16000, bloomStrength: 1.0, bloomRes: 1.0, outline: true, lensflare: true, sphereSeg: 128, bhSteps: 260, bhScale: 1.0, lod: 2 },
};

/** User settings, persisted. Change with Settings.set(key, value) -> emits bus 'settings'. */
const Settings = {
  quality: 'middel',
  reducedMotion: false,
  labels: true,
  autoRotate: false,
  showFps: false,
  load() {
    const mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
    this.quality = U.store.get('quality', mobile ? 'laag' : 'middel');
    if (!QUALITY[this.quality]) this.quality = 'middel';
    this.reducedMotion = U.store.get('reducedMotion', matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.labels = U.store.get('labels', true);
    this.autoRotate = U.store.get('autoRotate', false);
    this.showFps = U.store.get('showFps', false);
    const q = new URLSearchParams(location.search);
    if (q.get('quality') && QUALITY[q.get('quality')]) this.quality = q.get('quality');
    if (q.has('reducedMotion')) this.reducedMotion = q.get('reducedMotion') !== '0';
  },
  set(key, value) {
    if (this[key] === value) return;
    this[key] = value;
    U.store.set(key, value);
    bus.emit('settings', { key, value });
  },
};
/** Current quality preset object. */
const Q = () => QUALITY[Settings.quality] || QUALITY.middel;

/** Registry: scenes and optional feature modules register themselves here, so a
    missing or failing module never breaks the rest of the app. */
const Registry = {
  scenes: {},   // id -> { cls, meta }
  modules: {},  // name -> class / object
  /** meta: { title, kicker, subtitle, group:'vorming'|'evolutie'|'eindproduct'|'doorsnede'|'overig',
              infoId, badges:['schaal','tijd','traag'], status:'waargenomen'|'theorie'|'deels', gallery:{order, blurb, art} } */
  registerScene(id, cls, meta = {}) { this.scenes[id] = { cls, meta: Object.assign({ title: id, group: 'overig', infoId: id, badges: [] }, meta) }; },
  register(name, mod) { this.modules[name] = mod; },
};
