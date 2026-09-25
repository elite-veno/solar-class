/* CorePanel: live view of what happens inside the star during the timeline — the fusion in the core
   (with an animation of the nuclear reaction, step by step), fusion in shells, extra processes,
   the core temperature, the core composition, a schematic cross-section and the surface values.
   Fed by App.update() via setState(state) every frame; the DOM is rebuilt only when the stage
   changes, numbers refresh ~8×/s, and the canvas animates only while the panel is visible. */

class CorePanel {
  constructor(el, app) {
    this.el = el;
    this.app = app;
    this.state = null;
    this.stage = null;
    this.featured = null;       // process id shown in the animation
    this.anim = { step: 0, t: 0 };
    this._numT = 0;
    this._sprites = new Map();
    this.build();
  }

  build() {
    const ui = Content.ui.lab;
    const E = U.el;
    this.el.innerHTML = '';
    this.sumEl = E('span', { class: 'cp-sum' });
    this.collapseBtn = E('button', { class: 'icon-btn small', type: 'button', 'aria-label': ui.collapse, 'aria-expanded': 'true', onclick: () => this.toggle() },
      [this.svgIcon('M6 15l6-6 6 6')]);
    this.el.append(E('div', { class: 'cp-head' }, [E('h2', { text: ui.panelTitle }), this.sumEl, this.collapseBtn]));
    const body = E('div', { class: 'cp-body' });
    this.el.append(body);

    // fusion card with the reaction animation
    this.fLabel = E('div', { class: 'cp-label' });
    this.fName = E('button', { class: 'cp-fname', type: 'button', onclick: () => this.openFeatured() });
    this.fNet = E('div', { class: 'cp-net' });
    this.canvas = E('canvas', { class: 'cp-anim', 'aria-hidden': 'true' });
    this.canvas.addEventListener('click', () => this.openFeatured());
    this.fEq = E('div', { class: 'cp-eq' });
    this.fTxt = E('div', { class: 'cp-txt' });
    this.fCard = E('section', { class: 'cp-card cp-fusion' }, [this.fLabel, this.fName, this.fNet, this.canvas, this.fEq, this.fTxt]);
    body.append(this.fCard);
    this.chips = E('div', { class: 'cp-chips' });
    body.append(this.chips);

    // core temperature
    this.tcVal = E('span', { class: 'cp-val' });
    this.tcFill = E('div', { class: 'cp-tc-fill' });
    this.tcMarks = E('div', { class: 'cp-tc-marks' });
    for (const [T, lab] of ui.thresholds) {
      const x = this.tcX(T) * 100;
      this.tcMarks.append(E('span', { class: 'cp-tc-mark', style: { left: x + '%' }, title: `${lab}-fusie vanaf ~${U.fmtTemp(T)}` }, lab));
    }
    body.append(E('section', { class: 'cp-sec' }, [
      E('div', { class: 'cp-row' }, [E('button', { class: 'cp-label link', type: 'button', text: ui.coreTemp, onclick: () => this.app.openInfo('lab.kern', { focus: true }) }), this.tcVal]),
      E('div', { class: 'cp-tc' }, [this.tcFill]), this.tcMarks,
    ]));

    // composition
    this.compBar = E('div', { class: 'cp-comp' });
    this.compLegend = E('div', { class: 'cp-legend' });
    this.compSec = E('section', { class: 'cp-sec' }, [
      E('button', { class: 'cp-label link', type: 'button', text: ui.comp, onclick: () => this.app.openInfo('lab.samenstelling', { focus: true }) }), this.compBar, this.compLegend,
    ]);
    body.append(this.compSec);

    // cross-section + surface
    this.onion = E('div', { class: 'cp-onion', role: 'button', tabindex: '0', 'aria-label': ui.section, onclick: () => this.app.openInfo('lab.doorsnede', { focus: true }) });
    this.onion.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.app.openInfo('lab.doorsnede', { focus: true }); });
    this.layerLegend = E('ul', { class: 'cp-layers' });
    body.append(E('section', { class: 'cp-sec' }, [
      E('button', { class: 'cp-label link', type: 'button', text: ui.section, onclick: () => this.app.openInfo('lab.doorsnede', { focus: true }) }),
      E('div', { class: 'cp-split' }, [this.onion, this.layerLegend]),
    ]));
    this.note = E('p', { class: 'cp-note' });
    body.append(this.note);
    this.stats = {};
    const grid = E('dl', { class: 'cp-stats' });
    for (const k of ['T', 'L', 'R', 'M', 'cls']) { this.stats[k] = E('dd'); grid.append(E('div', {}, [E('dt', { text: ui.stats[k] }), this.stats[k]])); }
    body.append(E('section', { class: 'cp-sec' }, [E('div', { class: 'cp-label', text: ui.surface }), grid]));
    this.ctx = this.canvas.getContext('2d');
    if (U.isMobile()) this.toggle(true);
  }

  svgIcon(d) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); svg.append(p);
    return svg;
  }

  toggle(force) {
    const c = this.el.classList.toggle('collapsed', force);
    this.collapseBtn.setAttribute('aria-expanded', String(!c));
  }

  get visible() { return !this.el.classList.contains('collapsed') && this.el.offsetParent !== null && !document.hidden; }

  tcX(T) { return U.clamp((Math.log10(Math.max(T, 1)) - 5) / 6); }

  // ------------------------------------------------------------------ state
  setState(state) {
    if (!state) return;
    this.state = state;
    const now = performance.now();
    if (state.stage !== this.stage) { this.onStage(state.stage); this._numT = 0; }
    if (now - this._numT > 120) { this._numT = now; this.updateNumbers(state); }
  }

  onStage(stage) {
    const ui = Content.ui.lab;
    const E = U.el;
    this.stage = stage;
    const fu = stage.fusion || {};
    const procs = [fu.core, ...(fu.shells || []), ...(fu.extra || [])].filter(Boolean);
    this.featured = procs[0] || null; this.anim.step = 0; this.anim.t = 0;
    this.renderFeatured();

    // shell + extra chips
    this.chips.innerHTML = '';
    const chip = (id, kind) => {
      const p = Content.fusion[id];
      if (!p) return;
      const b = E('button', { class: 'cp-chip' + (id === this.featured ? ' on' : ''), type: 'button', dataset: { p: id }, title: p.net, onclick: () => this.feature(id) },
        [E('span', { class: 'dot', style: { background: p.color } }), E('span', { class: 'k', text: kind }), p.name]);
      this.chips.append(b);
    };
    if (fu.core) chip(fu.core, 'kern');
    for (const s of fu.shells || []) chip(s, 'schil');
    for (const s of fu.extra || []) chip(s, 'ook');
    this.chips.hidden = !this.chips.childElementCount;

    // composition segments
    this.compBar.innerHTML = '';
    this.compSegs = {};
    this.compSec.classList.toggle('empty', !stage.comp);
    if (stage.comp) {
      for (const k of Evolution.ELEMENTS) {
        const seg = E('span', { style: { background: Content.elements[k].color }, title: Content.elements[k].name });
        this.compSegs[k] = seg; this.compBar.append(seg);
      }
    } else this.compBar.append(E('span', { class: 'cp-empty', text: stage.visual === 'void' ? ui.nothing : ui.noComp }));

    this.renderOnion(stage);
    const notes = [];
    if (stage.convective) notes.push(ui.convective);
    if (stage.degenerate) notes.push(ui.degenerate);
    this.note.textContent = notes.join(' ');
    this.note.hidden = !notes.length;
  }

  feature(id) {
    this.featured = id; this.anim.step = 0; this.anim.t = 0;
    this.chips.querySelectorAll('.cp-chip').forEach((c) => c.classList.toggle('on', c.dataset.p === id));
    this.renderFeatured();
  }

  openFeatured() {
    if (this.featured) this.app.openInfo('fusion.' + this.featured, { focus: true });
    else if (this.stage?.fusion?.source) this.app.openInfo('bron.' + this.stage.fusion.source, { focus: true });
  }

  renderFeatured() {
    const ui = Content.ui.lab;
    const fu = this.stage?.fusion || {};
    const p = this.featured && Content.fusion[this.featured];
    this.fCard.classList.toggle('idle', !p);
    if (p) {
      const where = this.featured === fu.core ? ui.coreFusion : (fu.shells || []).includes(this.featured) ? ui.shellFusion : ui.extra;
      this.fLabel.textContent = where;
      this.fName.innerHTML = `<span class="dot" style="background:${p.color}"></span>${p.name}`;
      this.fNet.textContent = `${p.net} · ${p.temp}`;
      this.sumEl.textContent = p.name;
      this.fCard.style.setProperty('--proc', p.color);
    } else {
      const src = Content.sources[fu.source] || Content.sources.gravity;
      this.fLabel.textContent = `${ui.noFusion} · ${ui.energy}`;
      this.fName.innerHTML = src.name;
      this.fNet.textContent = src.txt;
      this.sumEl.textContent = ui.noFusion;
      this.fCard.style.setProperty('--proc', '#7c86a3');
      this.fEq.textContent = ''; this.fTxt.textContent = '';
    }
    this.fName.title = ui.clickHint;
    this.showStepText();
  }

  showStepText() {
    const p = this.featured && Content.fusion[this.featured];
    if (!p) return;
    const s = p.steps[this.anim.step % p.steps.length];
    this.fEq.innerHTML = `<b>${s.eq}</b>` + (p.steps.length > 1 ? ` <span class="cp-step">${Content.ui.lab.stepOf((this.anim.step % p.steps.length) + 1, p.steps.length)}</span>` : '');
    this.fTxt.textContent = s.txt;
  }

  updateNumbers(s) {
    const ui = Content.ui.lab;
    const noBody = s.visual === 'bh' || s.visual === 'void';
    this.tcVal.textContent = noBody ? '—' : this.fmtT(s.Tc);
    this.tcFill.style.width = noBody ? '0%' : (this.tcX(s.Tc) * 100).toFixed(1) + '%';
    if (s.comp && this.compSegs) {
      const parts = [];
      for (const k of Evolution.ELEMENTS) {
        const v = s.comp[k] || 0;
        this.compSegs[k].style.width = (v * 100).toFixed(2) + '%';
        if (v >= 0.01 && k !== 'Z') parts.push([k, v]);
      }
      parts.sort((a, b) => b[1] - a[1]);
      const html = parts.slice(0, 4).map(([k, v]) => `<span><i style="background:${Content.elements[k].color}"></i>${Content.elements[k].name} ${U.fmt(v * 100, 0)} %</span>`).join('');
      if (html !== this._legendHtml) { this.compLegend.innerHTML = html; this._legendHtml = html; }
    } else if (this._legendHtml !== '') { this.compLegend.innerHTML = ''; this._legendHtml = ''; }
    const st = this.stats;
    const dark = s.visual === 'bh' || s.visual === 'void' || s.visual === 'cloud';
    const set = (el, t) => { if (el.textContent !== t) el.textContent = t; };
    set(st.T, s.visual === 'bh' || s.visual === 'void' ? '—' : this.fmtT(s.T));
    set(st.L, dark ? '—' : U.fmtLum(s.L));
    set(st.R, s.visual === 'void' ? '—' : s.visual === 'cloud' || s.visual === 'collapse' ? ui.cloudSize || '—' : U.fmtRadius(s.R));
    set(st.M, s.visual === 'void' ? '0' : U.fmtMass(s.M));
    set(st.cls, s.visual === 'bh' ? 'zwart gat' : s.visual === 'ns' ? 'neutronenster' : s.lumClass === 'D' ? 'D' + (s.spectral?.cls || '') : s.mk || (dark ? '—' : s.spectral?.label || '—'));
  }

  fmtT(K) { return K < 1000 ? U.fmt(Math.round(K), 0) + ' K' : U.fmtTemp(K); }

  renderOnion(stage) {
    const layers = stage.layers || [];
    const size = 116, c = size / 2, R = size / 2 - 3;
    const map = (r) => Math.sqrt(U.clamp(r)) * R;
    const comp = stage.comp ? stage.comp[1] : null;
    const coreColor = () => {
      if (!stage.comp) return '#222';
      // blend of the composition in the middle of the stage
      const mix = [0, 0, 0]; let tot = 0;
      for (const k of Evolution.ELEMENTS) {
        const v = ((stage.comp[0][k] || 0) + (stage.comp[1][k] || 0)) / 2;
        if (!v) continue;
        const col = new THREE.Color(Content.elements[k].color);
        mix[0] += col.r * v; mix[1] += col.g * v; mix[2] += col.b * v; tot += v;
      }
      const col = new THREE.Color(mix[0] / tot, mix[1] / tot, mix[2] / tot);
      return '#' + col.getHexString();
    };
    let svg = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">`;
    svg += `<defs><radialGradient id="cp-shade"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></radialGradient></defs>`;
    const vis = stage.visual;
    if (!layers.length) {
      svg += vis === 'bh' ? `<circle cx="${c}" cy="${c}" r="${R * 0.55}" fill="#000" stroke="#ffb46a" stroke-opacity=".6" stroke-width="2"/>` : `<circle cx="${c}" cy="${c}" r="${R * 0.8}" fill="none" stroke="#7c86a3" stroke-dasharray="3 4"/>`;
    }
    for (let i = layers.length - 1; i >= 0; i--) {
      const [k, r] = layers[i];
      const col = k === 'core' ? coreColor() : Content.layers[k]?.color || '#888';
      svg += `<circle cx="${c}" cy="${c}" r="${Math.max(map(r), 2).toFixed(1)}" fill="${col}" fill-opacity="${k === 'H' && i === layers.length - 1 ? 0.35 : 0.8}"/>`;
    }
    if (layers.length) svg += `<circle cx="${c}" cy="${c}" r="${R}" fill="url(#cp-shade)"/>`;
    for (const [proc, r0, r1] of stage.burns || []) {
      const p = Content.fusion[proc];
      if (!p) continue;
      if (r0 <= 0) svg += `<circle class="cp-burn" cx="${c}" cy="${c}" r="${Math.max(map(r1), 3).toFixed(1)}" fill="${p.color}" style="color:${p.color}"/>`;
      else {
        const a = map(r0), b = map(r1);
        svg += `<circle class="cp-burn" cx="${c}" cy="${c}" r="${((a + b) / 2).toFixed(1)}" fill="none" stroke="${p.color}" stroke-width="${Math.max(b - a, 2.2).toFixed(1)}" style="color:${p.color}"/>`;
      }
    }
    svg += '</svg>';
    this.onion.innerHTML = svg;

    // legend: layers from the core outwards, with the fusion running in / around them
    const E = U.el;
    this.layerLegend.innerHTML = '';
    const burnsByLayer = new Map();
    for (const [proc, r0] of stage.burns || []) {
      let idx = layers.findIndex(([, r]) => r0 < r - 1e-6);
      if (idx < 0) idx = layers.length - 1;
      if (!burnsByLayer.has(idx)) burnsByLayer.set(idx, []);
      burnsByLayer.get(idx).push(proc);
    }
    layers.forEach(([k, r], i) => {
      let name = Content.layers[k]?.name;
      let col = Content.layers[k]?.color;
      if (k === 'core') {
        col = coreColor();
        const main = comp ? Evolution.ELEMENTS.filter((e) => e !== 'Z' && (comp[e] || 0) >= 0.1).sort((a, b) => comp[b] - comp[a]).map((e) => Content.elements[e].name.toLowerCase()) : [];
        name = 'Kern' + (main.length ? ': ' + main.slice(0, 2).join(' + ') : '');
      }
      const procs = (burnsByLayer.get(i) || []).map((p) => Content.fusion[p]);
      this.layerLegend.append(E('li', {}, [
        E('i', { style: { background: col } }),
        E('span', { class: 'n', text: name }),
        ...procs.map((p) => E('span', { class: 'b', style: { color: p.color }, text: '● ' + p.name })),
      ]));
    });
    if (!layers.length) this.layerLegend.append(E('li', { class: 'muted', text: vis === 'bh' ? Content.ui.lab.noComp : Content.ui.lab.nothing }));
  }

  // ------------------------------------------------------------------ reaction animation
  tick(dt) {
    if (!this.featured || !this.visible) return;
    const p = Content.fusion[this.featured];
    const cv = this.canvas, dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const g = this.ctx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    const reduced = Settings.reducedMotion;
    const D = 2.4, HOLD = reduced ? 3.2 : 0.7;
    this.anim.t += dt;
    if (this.anim.t > (reduced ? 0 : D) + HOLD) { this.anim.t = 0; this.anim.step = (this.anim.step + 1) % p.steps.length; this.showStepText(); }
    const s = p.steps[this.anim.step % p.steps.length];
    const ph = reduced ? 1.2 : this.anim.t / D;
    this.drawStep(g, w, h, s, ph, p.color, reduced);
  }

  /** Draw one reaction step at phase ph (0..1 = collision + products; >1 = products resting). */
  drawStep(g, w, h, s, ph, color, reduced) {
    const cx = w / 2, cy = h / 2 - 6;
    const N = Content.nuclides;
    const ins = s.in, outs = s.out;
    const e = U.ease;
    if (reduced) {
      // static equation: inputs left, arrow, outputs right
      const lay = (list, x0, x1) => list.forEach((id, i) => this.drawItem(g, id, list.length === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * (i / (list.length - 1)), cy, 1, 0));
      lay(ins, w * 0.1, w * 0.36);
      g.fillStyle = 'rgba(237,240,250,.7)'; g.font = '600 18px Inter, sans-serif'; g.textAlign = 'center'; g.fillText('→', cx, cy + 6);
      lay(outs, w * 0.6, w * 0.92);
      return;
    }
    const a = e.inQuad(U.clamp(ph / 0.45));
    // inputs
    if (ph < 0.5) {
      if (ins.length === 1) {
        const sh = ph * 6;
        this.drawItem(g, ins[0], cx + Math.sin(sh * 9) * 2 * a, cy + Math.cos(sh * 7) * 2 * a, 1, 0);
      } else {
        ins.forEach((id, i) => {
          const side = i === 0 ? -1 : 1;
          const x0 = cx + side * w * 0.42, x1 = cx + side * (this.itemR(id) * 0.6);
          const yOff = (i === 0 ? -1 : 1) * 6 * (1 - a);
          this.drawItem(g, id, U.lerp(x0, x1, a), cy + yOff, 1, side);
        });
      }
    }
    // flash
    const fl = 1 - Math.abs(ph - 0.5) / 0.08;
    if (fl > 0) {
      const rr = 10 + 30 * U.clamp((ph - 0.42) / 0.16);
      const grd = g.createRadialGradient(cx, cy, 0, cx, cy, rr);
      grd.addColorStop(0, `rgba(255,255,255,${0.95 * fl})`); grd.addColorStop(0.4, this.rgba(color, 0.7 * fl)); grd.addColorStop(1, this.rgba(color, 0));
      g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.fill();
    }
    // products
    if (ph >= 0.5) {
      const b = e.outCubic(U.clamp((ph - 0.5) / 0.5));
      // the heaviest product stays near the centre, the rest flies out in a fan
      let heavy = 0;
      outs.forEach((id, i) => { if ((N[id]?.A || 0) > (N[outs[heavy]]?.A || 0)) heavy = i; });
      const others = outs.map((id, i) => i).filter((i) => i !== heavy);
      outs.forEach((id, i) => {
        if (i === heavy) { this.drawItem(g, id, cx - w * 0.12 * b, cy, 1, 0); return; }
        const k = others.indexOf(i), n = others.length;
        const ang = (n === 1 ? 0 : -0.55 + 1.1 * (k / (n - 1)));
        const light = !!N[id]?.particle;
        const dist = (light ? 0.46 : 0.3) * w * b;
        const x = cx + Math.cos(ang) * dist, y = cy + Math.sin(ang) * dist * 0.45;
        const alpha = light ? 1 - U.clamp((ph - 0.85) / 0.3) : 1;
        this.drawItem(g, id, x, y, alpha, 1, ang);
      });
    }
  }

  rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  itemR(id) {
    const nu = Content.nuclides[id];
    if (!nu || nu.particle) return 4;
    return this.ballR(nu.A) * 1.08 * Math.sqrt(nu.A) + 1;
  }
  ballR(A) { return A <= 4 ? 6.5 : A <= 16 ? 4.2 : A <= 32 ? 3.2 : 2.5; }

  /** Draw a nucleus (cached sprite) or a particle (γ wave, neutrino, lepton) with its label. */
  drawItem(g, id, x, y, alpha = 1, dir = 1, ang = 0) {
    const nu = Content.nuclides[id];
    if (!nu) return;
    g.globalAlpha = alpha;
    g.textAlign = 'center';
    g.font = '600 10.5px Inter, sans-serif';
    if (nu.particle === 'gamma') {
      g.strokeStyle = '#ffe27a'; g.lineWidth = 1.6; g.beginPath();
      const L = 22, ca = Math.cos(ang), sa = Math.sin(ang);
      for (let k = 0; k <= L; k++) {
        const u = k - L / 2, v = Math.sin(k * 1.2 + performance.now() * 0.02) * 3;
        const px = x + u * ca - v * sa * dir, py = y + u * sa + v * ca;
        if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.stroke();
      g.fillStyle = '#ffe27a'; g.fillText(nu.l, x, y - 8);
    } else if (nu.particle === 'nu') {
      g.fillStyle = 'rgba(220,225,240,.9)'; g.beginPath(); g.arc(x, y, 2.2, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(220,225,240,.35)'; g.lineWidth = 1; g.setLineDash([2, 3]); g.beginPath();
      g.moveTo(x - Math.cos(ang) * 14, y - Math.sin(ang) * 14 * 0.45); g.lineTo(x, y); g.stroke(); g.setLineDash([]);
      g.fillStyle = 'rgba(220,225,240,.85)'; g.fillText(nu.l, x, y - 7);
    } else if (nu.particle === 'lepton') {
      const pos = id === 'e+';
      g.fillStyle = pos ? '#7fe3ff' : '#9fd0ff'; g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill();
      g.fillText(nu.l, x, y - 8);
    } else {
      const spr = this.sprite(id);
      const r = spr.r;
      g.drawImage(spr.cv, x - r - 2, y - r - 2, spr.cv.width / spr.dpr, spr.cv.height / spr.dpr);
      g.fillStyle = 'rgba(237,240,250,.9)';
      g.fillText(nu.l, x, y + r + 12);
    }
    g.globalAlpha = 1;
  }

  /** Nucleus sprite: Z protons (red) + A−Z neutrons (blue-grey) packed on a sunflower spiral. */
  sprite(id) {
    let s = this._sprites.get(id);
    if (s) return s;
    const nu = Content.nuclides[id];
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const b = this.ballR(nu.A), r = this.itemR(id);
    const cv = document.createElement('canvas');
    cv.width = cv.height = Math.ceil((r * 2 + 4) * dpr);
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);
    const c = r + 2;
    const rng = U.rng(nu.A * 31 + nu.Z);
    // decide which balls are protons, spread evenly
    const types = [];
    for (let k = 0; k < nu.A; k++) types.push(k < nu.Z ? 1 : 0);
    for (let k = types.length - 1; k > 0; k--) { const j = Math.floor(rng() * (k + 1)); [types[k], types[j]] = [types[j], types[k]]; }
    const pts = [];
    for (let k = 0; k < nu.A; k++) {
      const rr = nu.A === 1 ? 0 : b * 1.08 * Math.sqrt(k + 0.5), th = k * 2.39996;
      pts.push([c + rr * Math.cos(th), c + rr * Math.sin(th), types[k]]);
    }
    pts.reverse(); // outer balls first, inner on top
    for (const [x, y, p] of pts) {
      const grd = g.createRadialGradient(x - b * 0.35, y - b * 0.35, b * 0.1, x, y, b);
      if (p) { grd.addColorStop(0, '#ffc2b8'); grd.addColorStop(0.5, '#ff6b5b'); grd.addColorStop(1, '#b8322a'); } else { grd.addColorStop(0, '#e8eefc'); grd.addColorStop(0.5, '#9fb0d4'); grd.addColorStop(1, '#58688e'); }
      g.fillStyle = grd; g.beginPath(); g.arc(x, y, b, 0, Math.PI * 2); g.fill();
    }
    s = { cv, r, dpr };
    this._sprites.set(id, s);
    return s;
  }
}

Registry.register('CorePanel', CorePanel);
