/* HRDiagram: Hertzsprung-Russell diagram in the floating #hr-panel (Canvas 2D).
   x = effective temperature (log, reversed: hot on the left), y = luminosity in L☉ (log).
   Layers: a cached background canvas (grid, axes, main-sequence band, regions), a cached track
   canvas (the whole evolutionary track of the current path, dim) and a cached top canvas (region
   labels, spectral classes, known stars) are redrawn only when the path or the size changes.
   The visible canvas composites them with the dynamic part (the part of the track already lived,
   the current position, compare markers) at most ~30× per second, only while the panel is visible. Clicking a star / region / the current star opens its info; clicking
   the background opens 'hr.diagram'. Keyboard: Enter = uitleg, arrow keys walk through items. */

class HRDiagram {
  constructor(containerEl, app) {
    this.container = containerEl;
    this.app = app;
    // plotted range (log10)
    this.LT_MAX = Math.log10(200000); this.LT_MIN = Math.log10(2000);
    this.LL_MIN = -5; this.LL_MAX = 7;
    this.visible = false;
    this.path = null; this.state = null;
    this.cmpA = null; this.cmpB = null;
    this.w = 0; this.h = 0; this.dpr = 1;
    this.plot = { x0: 0, y0: 0, x1: 0, y1: 0, w: 0, h: 0 };
    this.fs = 11;
    this._bgDirty = true; this._trkDirty = true; this._dynDirty = true;
    this._lastDraw = 0; this._raf = 0;
    this._last = { si: -1, f: -1, lt: 0, ll: 0 };
    this._legendKey = NaN; this._noteShown = false; this._noteStage = null; this._noteWhy = null;
    this._hover = null; this._focus = -1;
    this._items = [];          // clickable things: {kind, id, label, x, y, r | box}
    this._stars = [];
    this._n = 0;               // track point count
    this._cur = { x: 0, y: 0, on: false, out: false };

    // ---- DOM
    const wrap = this.wrap = document.createElement('div');
    wrap.className = 'hr-wrap';
    const cv = this.canvas = document.createElement('canvas');
    cv.className = 'hr-canvas';
    cv.tabIndex = 0;
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', 'Hertzsprung-Russelldiagram: temperatuur tegen lichtkracht, met het levenspad van de gekozen ster. Druk op Enter voor uitleg; met de pijltjestoetsen kies je een gebied of ster.');
    this.ctx = cv.getContext('2d');
    this.legend = document.createElement('div');
    this.legend.className = 'hr-legend';
    this.legend.setAttribute('aria-hidden', 'true');
    this.note = document.createElement('div');
    this.note.className = 'hr-note';
    this.note.hidden = true;
    this.tip = document.createElement('div');
    this.tip.className = 'hr-tip';
    this.tip.hidden = true;
    this.live = document.createElement('div');
    this.live.className = 'hr-sr';
    this.live.setAttribute('aria-live', 'polite');
    wrap.append(cv, this.legend, this.note, this.tip, this.live);
    containerEl.append(wrap);

    this._bg = document.createElement('canvas');
    this._trk = document.createElement('canvas');
    this._top = document.createElement('canvas');
    this._glows = [0, 1, 2].map(() => ({ canvas: document.createElement('canvas'), key: -1, col: '#fff' }));

    // ---- events
    cv.addEventListener('pointermove', (e) => this._onMove(e));
    cv.addEventListener('pointerleave', () => this._setHover(null));
    cv.addEventListener('click', (e) => this._onClick(e));
    cv.addEventListener('keydown', (e) => this._onKey(e));
    cv.addEventListener('blur', () => { if (this._focus >= 0) { this._focus = -1; this._requestDraw(); } });
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this.resize());
      this._ro.observe(wrap);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { this._bgDirty = true; this._trkDirty = true; this._requestDraw(); });
    if (app && app.path) this.setPath(app.path);
  }

  // ================================================================== public API
  setPath(path) {
    this.path = path || null;
    this._legendKey = NaN;
    this._buildTrack();
    this._trkDirty = true; this._dynDirty = true;
    if (this.visible) this._requestDraw();
  }

  setState(state) {
    this.state = state || null;
    if (!this.visible || !state) return;
    const L = this._last;
    if (L.si === state.stageIndex && L.f === state.f && L.lt === state.logT && L.ll === state.logL && !this._dynDirty) return;
    const now = performance.now();
    if (now - this._lastDraw < 32) { this._dynDirty = true; return; }
    this._draw(now);
  }

  setCompare(a, b) {
    this.cmpA = a || null; this.cmpB = b || null;
    this._dynDirty = true;
    if (!this.visible) return;
    const now = performance.now();
    if (now - this._lastDraw >= 32) this._draw(now);
  }

  clearCompare() {
    this.cmpA = this.cmpB = null;
    this._dynDirty = true; this._legendKey = NaN;
    this._requestDraw();
  }

  resize() {
    const w = Math.round(this.wrap.clientWidth), h = Math.round(this.wrap.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    if (w < 2 || h < 2) return;
    if (w === this.w && h === this.h && dpr === this.dpr) return;
    this.w = w; this.h = h; this.dpr = dpr;
    for (const c of [this.canvas, this._bg, this._trk, this._top]) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
    this.fs = U.clamp(w / 40, 10, 12.5);
    const fs = this.fs;
    this._markerFont = `600 ${fs}px 'Space Grotesk', Inter, sans-serif`;
    this.plot.x0 = Math.round(fs * 4.6); this.plot.x1 = w - 12;
    this.stripH = Math.round(fs * 1.15);
    this.plot.y0 = Math.round(fs * 2.3); this.plot.y1 = h - Math.round(fs * 3.5) - this.stripH;
    this.plot.w = this.plot.x1 - this.plot.x0; this.plot.h = this.plot.y1 - this.plot.y0;
    this.note.style.bottom = (h - this.plot.y1 + 7) + 'px'; this.note.style.right = (w - this.plot.x1 + 7) + 'px';
    this.legend.style.left = this.plot.x0 + 'px'; this.legend.style.right = (w - this.plot.x1) + 'px';
    this._layoutTrack();
    this._bgDirty = true; this._trkDirty = true; this._dynDirty = true;
    for (const g of this._glows) g.key = -1;
    if (this.visible) this._draw(performance.now());
  }

  onShow() {
    this.visible = true;
    this.resize();
    this._dynDirty = true;
    this._requestDraw();
  }

  onHide() {
    this.visible = false;
    this._setHover(null);
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
  }

  // ================================================================== coordinates
  xOf(logT) { const p = this.plot; return p.x0 + (this.LT_MAX - logT) / (this.LT_MAX - this.LT_MIN) * p.w; }
  yOf(logL) { const p = this.plot; return p.y1 - (logL - this.LL_MIN) / (this.LL_MAX - this.LL_MIN) * p.h; }
  _inRange(logT, logL) { return logT <= this.LT_MAX && logT >= this.LT_MIN && logL >= this.LL_MIN && logL <= this.LL_MAX; }

  // ================================================================== track data
  _buildTrack() {
    const pts = this.path ? Evolution.sampleTrack(this.path) : [];
    const n = this._n = pts.length;
    this._tLT = new Float32Array(n); this._tLL = new Float32Array(n);
    this._tX = new Float32Array(n); this._tY = new Float32Array(n);
    this._tS = new Int16Array(n); this._tF = new Float32Array(n); this._tBrk = new Uint8Array(n);
    this._segCol = new Array(n); this._segGlow = new Array(n);
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      this._tLT[i] = p.logT; this._tLL[i] = p.logL; this._tS[i] = p.stageIndex; this._tF[i] = p.f;
      // an excluded stage (hr:false) in between -> break the line
      this._tBrk[i] = i === 0 || p.stageIndex - pts[i - 1].stageIndex > 1 ? 1 : 0;
      const T = Math.pow(10, i === 0 ? p.logT : 0.5 * (p.logT + pts[i - 1].logT));
      this._segCol[i] = U.starCss(T, 1);
      this._segGlow[i] = U.starCss(T, 0.22);
    }
    this._layoutTrack();
  }

  _layoutTrack() {
    if (!this.plot.w) return;
    for (let i = 0; i < this._n; i++) { this._tX[i] = this.xOf(this._tLT[i]); this._tY[i] = this.yOf(this._tLL[i]); }
  }

  // ================================================================== drawing
  _requestDraw() {
    this._dynDirty = true;
    if (!this.visible || this._raf) return;
    this._raf = requestAnimationFrame(() => { this._raf = 0; if (this.visible) this._draw(performance.now()); });
  }

  _draw(now) {
    if (!this.w) { this.resize(); if (!this.w) return; }
    if (this._bgDirty) this._renderBg();
    if (this._trkDirty) this._renderTrack();
    this._lastDraw = now;
    this._dynDirty = false;
    const s = this.state, L = this._last;
    if (s) { L.si = s.stageIndex; L.f = s.f; L.lt = s.logT; L.ll = s.logL; }
    const ctx = this.ctx, dpr = this.dpr, p = this.plot;
    const cmp = !!(this.cmpA || this.cmpB);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this._bg, 0, 0);
    if (!cmp) ctx.drawImage(this._trk, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!cmp && s && this.path) {
      ctx.save();
      ctx.beginPath(); ctx.rect(p.x0, p.y0, p.w, p.h); ctx.clip();
      this._drawLived(s);
      ctx.restore();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this._top, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.save();
    ctx.beginPath(); ctx.rect(p.x0, p.y0, p.w, p.h); ctx.clip();
    let hideReason = null;
    if (cmp) {
      this._drawMarker(this.cmpA, 'A');
      this._drawMarker(this.cmpB, 'B');
    } else if (s && this.path) {
      const onHr = s.stage.hr !== false;
      const inR = this._inRange(s.logT, s.logL);
      this._cur.on = onHr && inR;
      if (onHr && inR) {
        const x = this.xOf(s.logT), y = this.yOf(s.logL);
        this._cur.x = x; this._cur.y = y;
        this._drawDot(x, y, s.T, 1);
      } else {
        hideReason = onHr ? this._outWhy(s.logT, s.logL) : '';
        if (onHr) this._drawEdgeArrow(s.logT, s.logL, s.T);
      }
    }
    ctx.restore();
    this._drawFocus();
    this._updateLegend(s, cmp);
    this._updateNote(cmp ? null : s, hideReason);
  }

  /** The part of the track already lived: brighter, coloured by temperature. */
  _drawLived(s) {
    const n = this._n; if (!n) return;
    const ctx = this.ctx, X = this._tX, Y = this._tY, S = this._tS, F = this._tF, B = this._tBrk;
    const si = s.stageIndex, sf = s.f;
    let k = 0;
    while (k < n && (S[k] < si || (S[k] === si && F[k] <= sf))) k++;
    const withCur = s.stage.hr !== false && k > 0 && S[k - 1] >= si - 1;
    const cx = this.xOf(s.logT), cy = this.yOf(s.logL);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let pass = 0; pass < 2; pass++) {
      ctx.lineWidth = pass === 0 ? 5.5 : 1.9;
      const cols = pass === 0 ? this._segGlow : this._segCol;
      for (let i = 1; i < k; i++) {
        if (B[i]) continue;
        ctx.strokeStyle = cols[i];
        ctx.beginPath(); ctx.moveTo(X[i - 1], Y[i - 1]); ctx.lineTo(X[i], Y[i]); ctx.stroke();
      }
      if (withCur && k > 0 && !(k < n && B[k] && S[k] === si)) {
        ctx.strokeStyle = cols[k < n ? k : n - 1];
        ctx.beginPath(); ctx.moveTo(X[k - 1], Y[k - 1]); ctx.lineTo(cx, cy); ctx.stroke();
      }
    }
  }

  /** Cached glow sprite per slot (0 = current star, 1/2 = compare markers); rebuilt only when the colour changes. */
  _glowSprite(T, slot = 0) {
    const g = this._glows[slot];
    const key = Math.round(Math.log10(Math.max(T, 1)) * 150);
    if (key === g.key) return g;
    g.key = key;
    const c = g.canvas, px = Math.round(64 * this.dpr);
    c.width = c.height = px;
    const x = c.getContext('2d'), r = px / 2;
    const grad = x.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.1, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.2, U.starCss(T, 0.8));
    grad.addColorStop(0.45, U.starCss(T, 0.22));
    grad.addColorStop(1, U.starCss(T, 0));
    x.fillStyle = grad; x.fillRect(0, 0, px, px);
    g.col = U.starCss(T, 1);
    return g;
  }

  _drawDot(x, y, T, alpha, slot = 0) {
    const ctx = this.ctx, g = this._glowSprite(T, slot), d = 34;
    ctx.globalAlpha = alpha;
    ctx.drawImage(g.canvas, x - d / 2, y - d / 2, d, d);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.4; ctx.strokeStyle = g.col;
    ctx.beginPath(); ctx.arc(x, y, 6.5, 0, 6.2832); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 6.2832); ctx.fill();
  }

  /** Small chevron on the plot edge pointing towards a position outside the range. */
  _drawEdgeArrow(logT, logL, T) {
    const p = this.plot, ctx = this.ctx;
    const x = U.clamp(this.xOf(logT), p.x0 + 7, p.x1 - 7), y = U.clamp(this.yOf(logL), p.y0 + 7, p.y1 - 7);
    const dx = logT < this.LT_MIN ? 1 : logT > this.LT_MAX ? -1 : 0;
    const dy = logL > this.LL_MAX ? -1 : logL < this.LL_MIN ? 1 : 0;
    const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
    ctx.fillStyle = T < 3500 ? '#ffc66e' : this._glowSprite(T, 0).col;
    ctx.beginPath();
    ctx.moveTo(x + ux * 6, y + uy * 6);
    ctx.lineTo(x - ux * 3 - uy * 5, y - uy * 3 + ux * 5);
    ctx.lineTo(x - ux * 3 + uy * 5, y - uy * 3 - ux * 5);
    ctx.closePath(); ctx.fill();
  }

  _drawMarker(st, letter) {
    if (!st || !st.stage || st.stage.hr === false || !this._inRange(st.logT, st.logL)) return;
    const x = this.xOf(st.logT), y = this.yOf(st.logL), ctx = this.ctx;
    this._drawDot(x, y, st.T, 0.9, letter === 'A' ? 1 : 2);
    ctx.font = this._markerFont;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(4,5,11,0.85)';
    ctx.strokeText(letter, x + 9, y - 9);
    ctx.fillStyle = letter === 'A' ? '#ffc66e' : '#86c8ff';
    ctx.fillText(letter, x + 9, y - 9);
  }

  _drawFocus() {
    const it = this._focus >= 0 ? this._items[this._focus] : this._hover;
    if (!it) return;
    const ctx = this.ctx;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = this._focus >= 0 ? '#9fd3ff' : 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    if (it.box) { const b = it.box; ctx.roundRect ? ctx.roundRect(b[0], b[1], b[2], b[3], 5) : ctx.rect(b[0], b[1], b[2], b[3]); }
    else ctx.arc(it.x, it.y, 7.5, 0, 6.2832);
    ctx.stroke();
  }

  _outWhy(logT, logL) {
    if (logT < this.LT_MIN) return 'te koel';
    if (logT > this.LT_MAX) return 'te heet';
    if (logL > this.LL_MAX) return 'te helder';
    if (logL < this.LL_MIN) return 'te zwak';
    return '';
  }

  _updateLegend(s, cmp) {
    if (cmp) {
      const a = this.cmpA, b = this.cmpB;
      const key = -1 - ((a ? a.stageIndex + 1 : 0) * 100 + (b ? b.stageIndex + 1 : 0));
      if (key === this._legendKey) return;
      this._legendKey = key;
      const part = (st, l, cls) => st ? `<span class="hr-cmp ${cls}">${l}</span><span class="hr-stage">${U.escapeHtml(st.stage.label)}</span>` : '';
      this.legend.innerHTML = part(a, 'A', 'a') + (a && b ? '<span class="hr-sep"></span>' : '') + part(b, 'B', 'b');
      return;
    }
    if (!s) return;
    const key = s.stageIndex * 1e8 + Math.round(s.logT * 300) * 1e4 + Math.round(s.logL * 60 + 1000);
    if (key === this._legendKey) return;
    this._legendKey = key;
    const noVals = s.stage.visual === 'bh' || s.stage.visual === 'void';
    const vals = noVals ? '' : `<span class="hr-vals">${U.fmtTemp(s.T)} · ${this._fmtL(s.L)}</span>`;
    this.legend.innerHTML = `<span class="hr-dot" style="background:${U.starCss(s.T, 1)};box-shadow:0 0 8px ${U.starCss(s.T, 0.8)}"></span>`
      + `<span class="hr-stage">${U.escapeHtml(s.stage.label)}</span>${vals}`;
  }

  /** Luminosity with ~2 significant digits (U.fmtLum shows every digit between 10⁴ and 10⁶). */
  _fmtL(L) { return L >= 1e4 && L < 1e6 ? U.fmt(Number(L.toPrecision(2)), 0) + ' L☉' : U.fmtLum(L); }

  _updateNote(s, reason) {
    const show = !!s && reason !== null;
    if (show === this._noteShown && (!show || (this._noteStage === s.stage && this._noteWhy === reason))) return;
    this._noteShown = show; this._noteStage = show ? s.stage : null; this._noteWhy = reason;
    const txt = show ? 'Buiten het diagram: ' + s.stage.label + (reason ? ' — ' + reason : '') : '';
    this.note.textContent = txt;
    this.note.hidden = !txt;
  }

  // ------------------------------------------------------------------ cached layers
  _renderTrack() {
    this._trkDirty = false;
    const c = this._trk.getContext('2d'), p = this.plot, n = this._n;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this._trk.width, this._trk.height);
    if (!n || !p.w) return;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.save();
    c.beginPath(); c.rect(p.x0, p.y0, p.w, p.h); c.clip();
    const X = this._tX, Y = this._tY, B = this._tBrk;
    c.lineCap = 'round'; c.lineJoin = 'round';
    // soft underlay + dashed line for the future part
    c.strokeStyle = 'rgba(200,210,240,0.07)'; c.lineWidth = 4.5;
    c.beginPath();
    for (let i = 0; i < n; i++) { if (B[i]) c.moveTo(X[i], Y[i]); else c.lineTo(X[i], Y[i]); }
    c.stroke();
    c.strokeStyle = 'rgba(225,232,255,0.42)'; c.lineWidth = 1.2; c.setLineDash([3, 3.5]);
    c.stroke();
    c.setLineDash([]);
    // small ticks where a new stage starts
    c.fillStyle = 'rgba(225,232,255,0.55)';
    for (let i = 1; i < n; i++) {
      if (this._tS[i] !== this._tS[i - 1] && !B[i] && this._inRange(this._tLT[i], this._tLL[i])) { c.beginPath(); c.arc(X[i], Y[i], 1.7, 0, 6.2832); c.fill(); }
    }
    c.restore();
  }

  _css(name, fallback) {
    const v = getComputedStyle(this.container).getPropertyValue(name).trim();
    return v || fallback;
  }

  _renderBg() {
    this._bgDirty = false;
    const c = this._bg.getContext('2d'), p = this.plot, fs = this.fs, H = this.h;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this._bg.width, this._bg.height);
    if (!p.w) return;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const textDim = this._css('--text-dim', '#a9b2cc'), textFaint = this._css('--text-faint', '#7c86a3');
    const fBody = this._css('--font', 'Inter, sans-serif'), fHead = this._css('--font-head', "'Space Grotesk', sans-serif");
    const items = this._items = [];
    const xOf = (t) => this.xOf(t), yOf = (l) => this.yOf(l);
    const lg = Math.log10;

    // ---- plot background tinted by star colour along x
    const tints = [200000, 40000, 20000, 10000, 7500, 6000, 5200, 4200, 3300, 2000];
    const gx = c.createLinearGradient(p.x0, 0, p.x1, 0);
    for (const T of tints) gx.addColorStop(U.clamp((this.LT_MAX - lg(T)) / (this.LT_MAX - this.LT_MIN), 0, 1), U.starCss(T, 0.055));
    c.fillStyle = 'rgba(3,5,14,0.55)';
    c.fillRect(p.x0, p.y0, p.w, p.h);
    c.fillStyle = gx;
    c.fillRect(p.x0, p.y0, p.w, p.h);
    const vg = c.createLinearGradient(0, p.y0, 0, p.y1);
    vg.addColorStop(0, 'rgba(4,5,11,0)'); vg.addColorStop(1, 'rgba(4,5,11,0.35)');
    c.fillStyle = vg; c.fillRect(p.x0, p.y0, p.w, p.h);

    c.save();
    c.beginPath(); c.rect(p.x0, p.y0, p.w, p.h); c.clip();

    // ---- grid: every decade in L; chosen temperatures in T
    c.lineWidth = 1;
    for (let e = Math.ceil(this.LL_MIN); e <= this.LL_MAX; e++) {
      const y = Math.round(yOf(e)) + 0.5;
      c.strokeStyle = e === 0 ? 'rgba(200,210,255,0.13)' : 'rgba(200,210,255,0.06)';
      c.beginPath(); c.moveTo(p.x0, y); c.lineTo(p.x1, y); c.stroke();
    }
    const xt = this._xTicks(c, fBody);
    c.strokeStyle = 'rgba(200,210,255,0.06)';
    for (const t of xt) { const x = Math.round(xOf(lg(t.T))) + 0.5; c.beginPath(); c.moveTo(x, p.y0); c.lineTo(x, p.y1); c.stroke(); }

    // ---- regions: soft blobs
    const blob = (lt, ll, rx, ry, rot, T, a) => {
      const x = xOf(lt), y = yOf(ll), sx = rx * p.w / (this.LT_MAX - this.LT_MIN), sy = ry * p.h / (this.LL_MAX - this.LL_MIN);
      c.save(); c.translate(x, y); c.rotate(rot); c.scale(1, sy / sx);
      const g = c.createRadialGradient(0, 0, 0, 0, 0, sx);
      g.addColorStop(0, U.starCss(T, a)); g.addColorStop(1, U.starCss(T, 0));
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, sx, 0, 6.2832); c.fill();
      c.restore();
    };
    blob(lg(4400), 2.1, 0.24, 1.5, 0, 4400, 0.1);                  // giants
    blob(lg(9000), 5.35, 0.75, 0.75, 0, 9000, 0.08);                // supergiants
    const wdA = Math.atan2(yOf(-3.9) - yOf(-1.2), xOf(lg(5000)) - xOf(lg(25000)));
    blob(lg(11000), -2.6, 0.5, 0.35, wdA, 12000, 0.1);              // white dwarfs

    // ---- main-sequence band from the ZAMS relation (+ a little brightening during the MS)
    const ms = [];
    for (let lm = Math.log10(0.08); lm <= Math.log10(150) + 1e-6; lm += 0.05) {
      const z = Evolution.zams(Math.pow(10, lm));
      ms.push([xOf(lg(z.T)), yOf(lg(z.L) + 0.18), z.T]);
    }
    const dex = p.h / (this.LL_MAX - this.LL_MIN);
    const gms = c.createLinearGradient(p.x0, 0, p.x1, 0);
    for (const T of tints) gms.addColorStop(U.clamp((this.LT_MAX - lg(T)) / (this.LT_MAX - this.LT_MIN), 0, 1), U.starCss(T, 1));
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = gms;
    const strokeMs = (w, a) => { c.globalAlpha = a; c.lineWidth = w; c.beginPath(); ms.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.stroke(); };
    strokeMs(Math.max(10, dex * 1.1), 0.045);
    strokeMs(Math.max(5, dex * 0.55), 0.06);
    strokeMs(1.2, 0.16);
    c.globalAlpha = 1;
    c.restore();
    this._renderTop(items, fs, fHead, fBody, textDim, dex);

    // ---- frame + colour strip under the x axis
    c.strokeStyle = 'rgba(190,205,255,0.16)'; c.lineWidth = 1;
    c.strokeRect(p.x0 + 0.5, p.y0 + 0.5, p.w - 1, p.h - 1);
    const strip = c.createLinearGradient(p.x0, 0, p.x1, 0);
    for (const T of tints) strip.addColorStop(U.clamp((this.LT_MAX - lg(T)) / (this.LT_MAX - this.LT_MIN), 0, 1), U.starCss(T, 0.85));
    const sh = this.stripH;
    c.fillStyle = strip;
    c.beginPath();
    if (c.roundRect) c.roundRect(p.x0, p.y1 + 3, p.w, sh, 3); else c.rect(p.x0, p.y1 + 3, p.w, sh);
    c.fill();
    // spectral classes inside the colour strip (main-sequence temperatures, ARCHITECTURE §7)
    c.font = `700 ${fs * 0.74}px ${fHead}`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const cls = [['O', 30000, 200000, 60000], ['B', 10000, 30000], ['A', 7500, 10000], ['F', 6000, 7500], ['G', 5200, 6000], ['K', 3700, 5200], ['M', 2400, 3700], ['L', 1300, 2400, 2170]];
    c.lineWidth = 1;
    for (const [l, lo, hi, mid] of cls) {
      const Tm = mid || Math.sqrt(lo * hi);
      c.fillStyle = 'rgba(8,10,22,0.78)';
      c.fillText(l, xOf(lg(Tm)), p.y1 + 3 + sh / 2 + 0.5);
      const x = Math.round(xOf(lg(lo))) + 0.5;
      if (x < p.x1 - 1) { c.strokeStyle = 'rgba(8,10,22,0.45)'; c.beginPath(); c.moveTo(x, p.y1 + 3); c.lineTo(x, p.y1 + 3 + sh); c.stroke(); }
    }

    // ---- tick labels
    c.font = `500 ${fs * 0.9}px ${fBody}`;
    c.fillStyle = textDim;
    c.textAlign = 'center'; c.textBaseline = 'top';
    for (const t of xt) c.fillText(t.label, xOf(lg(t.T)), p.y1 + sh + 7);
    c.textAlign = 'right'; c.textBaseline = 'middle';
    const step = dex >= fs * 2.1 ? 1 : 2;
    for (let e = -4; e <= 6; e += step) c.fillText(e === 0 ? '1' : '10' + U.superscript(e), p.x0 - 6, yOf(e));

    // ---- axis titles
    c.font = `500 ${fs * 0.88}px ${fBody}`;
    c.fillStyle = textFaint;
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    const ty = H - 5;
    c.fillText('Temperatuur (K)', p.x0 + p.w / 2, ty);
    c.textAlign = 'left'; c.fillText('← heter', p.x0, ty);
    c.textAlign = 'right'; c.fillText('koeler →', p.x1, ty);
    c.save();
    c.translate(fs * 1.0, p.y0 + p.h / 2); c.rotate(-Math.PI / 2);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('Lichtkracht (L☉)', 0, 0);
    c.restore();
    if (this._focus >= items.length) this._focus = -1;
  }

  /** Layer above the track: region labels, spectral classes, known stars (with a dark halo). */
  _renderTop(items, fs, fHead, fBody, textDim, dex) {
    const t = this._top.getContext('2d'), p = this.plot, lg = Math.log10;
    const xOf = (v) => this.xOf(v), yOf = (v) => this.yOf(v);
    t.setTransform(1, 0, 0, 1, 0, 0);
    t.clearRect(0, 0, this._top.width, this._top.height);
    t.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    t.lineJoin = 'round'; t.lineWidth = 1; t.globalAlpha = 1;
    // ---- region labels (clickable)
    const regionLabel = (text, id, x, y, rot = 0, align = 'center') => {
      t.save();
      t.font = `600 ${fs * 0.95}px ${fHead}`;
      if ('letterSpacing' in t) t.letterSpacing = '0.06em';
      t.translate(x, y); t.rotate(rot);
      t.textAlign = align; t.textBaseline = 'middle';
      t.lineWidth = 3; t.strokeStyle = 'rgba(5,7,17,0.55)';
      t.strokeText(text, 0, 0);
      t.fillStyle = 'rgba(214,222,250,0.5)';
      t.fillText(text, 0, 0);
      const tw = t.measureText(text).width;
      t.restore();
      // axis-aligned hit box around the (possibly rotated) label
      const hw = Math.abs(Math.cos(rot)) * tw / 2 + Math.abs(Math.sin(rot)) * fs * 0.7 + 4;
      const hh = Math.abs(Math.sin(rot)) * tw / 2 + Math.abs(Math.cos(rot)) * fs * 0.7 + 3;
      const cx = align === 'center' ? x : x + tw / 2;
      items.push({ kind: 'region', id, label: text, x: cx, y, box: [cx - hw, y - hh, hw * 2, hh * 2] });
    };
    // 'Hoofdreeks' along the band, placed just below it (cool/faint side)
    {
      const zA = Evolution.zams(1.6), zB = Evolution.zams(3.2);
      const ax = xOf(lg(zA.T)), ay = yOf(lg(zA.L) + 0.18), bx = xOf(lg(zB.T)), by = yOf(lg(zB.L) + 0.18);
      let ang = Math.atan2(by - ay, bx - ax);
      if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
      const mx = (ax + bx) / 2, my = (ay + by) / 2, off = Math.max(9, dex * 0.62) + fs * 0.45;
      regionLabel('Hoofdreeks', 'mainSequence', mx - Math.sin(ang) * off, my + Math.cos(ang) * off, ang);
    }
    regionLabel('Reuzen', 'redGiant', xOf(lg(5300)), yOf(2.55));
    regionLabel('Superreuzen', 'supergiant', xOf(lg(9000)), yOf(5.55));
    regionLabel('Witte dwergen', 'whiteDwarf', xOf(lg(17000)), yOf(-3.25), 0);

    // ---- known stars
    this._renderStars(t, items, fBody, textDim);

  }

  /** Temperature ticks that fit without overlapping (priority order). */
  _xTicks(c, fBody) {
    c.font = `500 ${this.fs * 0.9}px ${fBody}`;
    const cand = [10000, 100000, 5000, 3000, 20000, 40000, 7000, 4000, 60000, 15000, 30000, 2500, 150000];
    const placed = [];
    for (const T of cand) {
      const label = U.fmt(T, 0), x = this.xOf(Math.log10(T)), w = c.measureText(label).width;
      if (x - w / 2 < this.plot.x0 - 2 || x + w / 2 > this.plot.x1 + 2) continue;
      if (placed.some((q) => Math.abs(q.x - x) < (q.w + w) / 2 + 10)) continue;
      placed.push({ T, label, x, w });
    }
    return placed;
  }

  _starList() {
    const src = (typeof Content !== 'undefined' && Array.isArray(Content.stars) && Content.stars.length) ? Content.stars : [{ id: 'star.zon', name: 'Zon', T: PHYS.Tsun, L: 1 }];
    const out = [];
    for (const s of src) {
      if (!s) continue;
      const id = s.id || s.infoId || (s.key ? 'star.' + s.key : null);
      const T = s.T ?? s.teff ?? s.temp ?? (s.logT != null ? Math.pow(10, s.logT) : null);
      const L = s.L ?? s.lum ?? (s.logL != null ? Math.pow(10, s.logL) : null);
      if (!(T > 0) || !(L > 0)) continue;
      const info = id && Content.info ? Content.info[id] : null;
      const name = s.name || s.label || s.short || (info && info.title) || '';
      out.push({ id, name, T, L, showLabel: s.showLabel !== false && s.labelHidden !== true, tooltip: s.tooltip || (info && info.tooltip) || '' });
    }
    return out;
  }

  _renderStars(c, items, fBody, textDim) {
    const lg = Math.log10, fs = this.fs, p = this.plot;
    const stars = this._stars = this._starList();
    const boxes = [];
    for (const it of items) if (it.box) boxes.push(it.box);
    c.font = `500 ${fs * 0.82}px ${fBody}`;
    c.textBaseline = 'middle';
    const hit = (b) => boxes.some((q) => b[0] < q[0] + q[2] && b[0] + b[2] > q[0] && b[1] < q[1] + q[3] && b[1] + b[3] > q[1]);
    for (const s of stars) {
      const lt = lg(s.T), ll = lg(s.L);
      if (!this._inRange(lt, ll)) continue;
      const x = this.xOf(lt), y = this.yOf(ll);
      c.fillStyle = U.starCss(s.T, 0.25);
      c.beginPath(); c.arc(x, y, 4.2, 0, 6.2832); c.fill();
      c.fillStyle = U.starCss(s.T, 0.95);
      c.beginPath(); c.arc(x, y, 2, 0, 6.2832); c.fill();
      boxes.push([x - 4, y - 4, 8, 8]);
      items.push({ kind: 'star', id: s.id, label: s.name, tooltip: s.tooltip, x, y, r: 7 });
    }
    // labels after all dots, avoiding overlaps
    for (const it of items) {
      if (it.kind !== 'star') continue;
      const s = stars.find((q) => q.id === it.id);
      if (!s || !s.showLabel || !s.name) continue;
      const w = c.measureText(s.name).width, h = fs;
      const opts = [[it.x + 6, it.y, 'left'], [it.x - 6, it.y, 'right'], [it.x, it.y - h, 'center'], [it.x, it.y + h, 'center']];
      for (const [lx, ly, al] of opts) {
        const bx = al === 'left' ? lx : al === 'right' ? lx - w : lx - w / 2;
        const b = [bx - 1, ly - h / 2, w + 2, h];
        if (b[0] < p.x0 + 2 || b[0] + b[2] > p.x1 - 2 || b[1] < p.y0 + 2 || b[1] + b[3] > p.y1 - 2 || hit(b)) continue;
        c.textAlign = al;
        c.lineWidth = 3; c.strokeStyle = 'rgba(5,7,17,0.7)';
        c.strokeText(s.name, lx, ly);
        c.fillStyle = textDim; c.globalAlpha = 0.9;
        c.fillText(s.name, lx, ly);
        c.globalAlpha = 1;
        boxes.push(b);
        break;
      }
    }
  }

  // ================================================================== interaction
  _pick(x, y) {
    let best = null, bd = 1e9;
    for (const it of this._items) {
      if (it.box) {
        const b = it.box;
        if (x >= b[0] && x <= b[0] + b[2] && y >= b[1] && y <= b[1] + b[3]) { if (!best || best.box) best = it; }
      } else {
        const d = Math.hypot(x - it.x, y - it.y);
        if (d <= it.r + 3 && d < bd) { best = it; bd = d; }
      }
    }
    if (this._cur.on && !this.cmpA && !this.cmpB && this.state) {
      const d = Math.hypot(x - this._cur.x, y - this._cur.y);
      if (d <= 10 && (!best || best.box || d < bd)) best = { kind: 'current', id: this.state.stage.infoId, label: this.state.stage.label, x: this._cur.x, y: this._cur.y, r: 8 };
    }
    return best;
  }

  _local(e) { const r = this.canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }

  _onMove(e) {
    const [x, y] = this._local(e);
    const it = this._pick(x, y);
    this._setHover(it, x, y);
  }

  _setHover(it, x, y) {
    const prev = this._hover;
    const same = (prev && it && prev.kind === it.kind && prev.id === it.id) || (!prev && !it);
    this._hover = it;
    this.canvas.style.cursor = it ? 'pointer' : 'help';
    if (it && it.kind !== 'region' && it.label) {
      const txt = it.label + (it.tooltip ? ' — ' + it.tooltip : '');
      if (this.tip.textContent !== txt) this.tip.textContent = txt;
      this.tip.hidden = false;
      const tw = this.tip.offsetWidth;
      this.tip.style.left = U.clamp(x - tw / 2, 4, this.w - tw - 4) + 'px';
      this.tip.style.top = Math.max(2, y - 34) + 'px';
    } else this.tip.hidden = true;
    if (!same) this._requestDraw();
  }

  _onClick(e) {
    const [x, y] = this._local(e);
    const it = this._pick(x, y);
    bus.emit('info', it && it.id ? it.id : 'hr.diagram');
  }

  _onKey(e) {
    const n = this._items.length;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); e.stopPropagation();
      const it = this._focus >= 0 ? this._items[this._focus] : null;
      bus.emit('info', it && it.id ? it.id : 'hr.diagram');
      return;
    }
    if (!n) return;
    let d = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') d = 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') d = -1;
    else if (e.key === 'Escape' && this._focus >= 0) { this._focus = -1; this.live.textContent = ''; this._requestDraw(); e.stopPropagation(); return; }
    if (!d) return;
    e.preventDefault(); e.stopPropagation();
    this._focus = this._focus < 0 ? (d > 0 ? 0 : n - 1) : (this._focus + d + n) % n;
    const it = this._items[this._focus];
    this.live.textContent = (it.kind === 'region' ? 'Gebied: ' : 'Ster: ') + it.label + '. Druk op Enter voor uitleg.';
    this._requestDraw();
  }
}

Registry.register('HRDiagram', HRDiagram);
