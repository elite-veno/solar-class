/* App: the main controller. Owns the mode (levensloop, eindproducten, binnenkant,
   vergelijken, rondleiding), the evolution path + playback, scene switching,
   panels, keyboard shortcuts, deep links and the self-test used during development. */

const App = {
  sm: null, info: null, timeline: null,
  hr: null, classification: null, tour: null, quiz: null, compare: null,
  mode: 'levensloop',
  panels: { hr: false, classificatie: false, gallery: false, quiz: false },
  mass: 1, lowZ: false, path: null,
  age: 0, stageIndex: 0, playing: false, speed: Math.pow(10, 8.5),
  minStageSeconds: 9,
  scenes: {}, lru: [], activeScene: null, activeSceneId: null, activeParams: {},
  state: null, errors: [], _switchToken: 0, _sceneErrors: new Set(), _captionInfo: null,

  // ------------------------------------------------------------------ boot
  init() {
    this.captureErrors();
    Settings.load();
    this.applyBodyClasses();
    try {
      this.sm = new SceneManager(document.getElementById('viewport'));
    } catch (e) {
      console.error(e);
      this.fatal(Content.ui.webglError);
      return;
    }
    this.sm.onUpdate = (dt) => this.update(dt);
    this.info = new InfoPanel(this);
    this.timeline = new Timeline(this);
    this.timeline.setSpeed(this.speed);
    const M = Registry.modules;
    const make = (name, fn) => { if (!M[name]) return null; try { return fn(M[name]); } catch (e) { console.error(`[${name}]`, e); return null; } };
    this.hr = make('HRDiagram', (C) => new C(document.getElementById('hr-body'), this));
    this.classification = make('ClassificationPanel', (C) => new C(document.getElementById('class-body'), this));
    this.tour = make('TourMode', (C) => new C(this, document.getElementById('tour-card')));
    this.quiz = make('QuizMode', (C) => new C(this, document.getElementById('quiz-body')));
    this.compare = make('CompareMode', (C) => new C(this, document.getElementById('compare-panel')));

    this.bindUI();
    this.buildMassPanel();
    this.buildGallery();
    document.getElementById('help-body').innerHTML = Content.help;

    bus.on('pick', ({ infoId, source }) => this.openInfo(infoId, { focus: source !== '3d' }));
    bus.on('info', (id) => this.openInfo(id, { focus: true }));
    bus.on('settings', ({ key }) => this.onSetting(key));
    bus.on('fps', (f) => { if (Settings.showFps) document.getElementById('fps').textContent = Math.round(f) + Content.ui.fpsSuffix; });

    this.setMass(1, { silent: true });
    const deep = this.applyDeepLink();
    if (!deep) this.goToStage(0, { instant: true });
    this.sm.start();
    let frames = 0;
    const hideLoader = () => { if (++frames < 3) return requestAnimationFrame(hideLoader); document.getElementById('loading').classList.add('done'); };
    requestAnimationFrame(hideLoader);
    window.App = this;
  },

  captureErrors() {
    const push = (msg) => { this.errors.push(String(msg).slice(0, 500)); if (this.errors.length > 200) this.errors.shift(); };
    window.addEventListener('error', (e) => push(e.message + (e.filename ? ` @${e.lineno}:${e.colno}` : '')));
    window.addEventListener('unhandledrejection', (e) => push('unhandled rejection: ' + (e.reason?.stack || e.reason)));
    const ce = console.error.bind(console);
    console.error = (...a) => { push(a.map((x) => (x?.stack || x?.message || String(x))).join(' ')); ce(...a); };
  },

  fatal(html) {
    document.getElementById('loading').classList.add('done');
    document.body.append(U.el('div', { class: 'fatal', html }));
  },

  applyBodyClasses() {
    const b = document.body.classList;
    b.toggle('reduced-motion', Settings.reducedMotion);
    b.toggle('no-labels', !Settings.labels);
    document.getElementById('fps').hidden = !Settings.showFps;
    b.forEach((c) => { if (c.startsWith('mode-')) b.remove(c); });
    b.add('mode-' + this.mode);
  },

  onSetting(key) {
    this.applyBodyClasses();
    if (key === 'quality') {
      // rebuild every scene with the new particle budget
      const id = this.activeSceneId, params = this.activeParams;
      for (const s of Object.values(this.scenes)) { if (s !== this.activeScene) { try { s.dispose(); } catch (e) { /* ignore */ } } }
      this.scenes = { [id]: this.activeScene }; this.lru = [id];
      if (this.activeScene) { this.activateScene(id, params, { instant: true, rebuild: true }); }
      this.toast(Content.ui.qualityChanged(Settings.quality));
    }
    if (key === 'reducedMotion' && Settings.reducedMotion) this.toast(Content.ui.reducedOn);
  },

  // ------------------------------------------------------------------ UI wiring
  bindUI() {
    document.querySelectorAll('#modes .mode-btn').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.mode) this.setMode(b.dataset.mode);
      else this.togglePanel(b.dataset.toggle);
      if (U.isMobile()) this.toggleMenu(false);
    }));
    document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => this.togglePanel(b.dataset.close, false)));
    document.querySelectorAll('[data-expand]').forEach((b) => b.addEventListener('click', () => {
      const p = document.getElementById(b.dataset.expand); p.classList.toggle('expanded'); setTimeout(() => this.hr?.resize?.(), 350);
    }));
    document.getElementById('btn-menu').addEventListener('click', () => this.toggleMenu());
    document.getElementById('btn-objects').addEventListener('click', () => this.toggleObjects());
    document.getElementById('btn-help').addEventListener('click', () => document.getElementById('help-dialog').showModal());
    document.getElementById('btn-settings').addEventListener('click', () => this.openSettings());
    document.getElementById('cap-more').addEventListener('click', () => { if (this._captionInfo) this.openInfo(this._captionInfo, { focus: true }); });
    document.getElementById('quiz-dialog').addEventListener('close', () => { this.panels.quiz = false; this.syncNav(); });

    // settings dialog
    const dlg = document.getElementById('settings-dialog');
    dlg.querySelectorAll('input[name=quality]').forEach((r) => r.addEventListener('change', () => Settings.set('quality', r.value)));
    const bindCheck = (id, key) => { const c = document.getElementById(id); c.addEventListener('change', () => Settings.set(key, c.checked)); };
    bindCheck('set-reduced', 'reducedMotion'); bindCheck('set-labels', 'labels'); bindCheck('set-autorotate', 'autoRotate'); bindCheck('set-fps', 'showFps');

    window.addEventListener('keydown', (e) => this.onKey(e));
  },

  openSettings() {
    const dlg = document.getElementById('settings-dialog');
    dlg.querySelectorAll('input[name=quality]').forEach((r) => { r.checked = r.value === Settings.quality; });
    document.getElementById('set-reduced').checked = Settings.reducedMotion;
    document.getElementById('set-labels').checked = Settings.labels;
    document.getElementById('set-autorotate').checked = Settings.autoRotate;
    document.getElementById('set-fps').checked = Settings.showFps;
    dlg.showModal();
  },

  toggleMenu(force) {
    const nav = document.getElementById('modes'), btn = document.getElementById('btn-menu');
    const open = force ?? !nav.classList.contains('open');
    nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open));
  },

  toggleObjects(force) {
    const panel = document.getElementById('objects-panel'), btn = document.getElementById('btn-objects');
    const open = force ?? panel.hidden;
    panel.hidden = !open; btn.setAttribute('aria-expanded', String(open));
    if (!open) return;
    const list = document.getElementById('objects-list');
    list.innerHTML = '';
    const seen = new Set();
    const ids = [];
    const meta = Registry.scenes[this.activeSceneId]?.meta;
    const main = this._captionInfo || meta?.infoId;
    if (main && Content.get(main)) { ids.push(main); seen.add(main); }
    for (const p of this.activeScene?.pickables || []) if (p.enabled !== false && !seen.has(p.infoId)) { seen.add(p.infoId); ids.push(p.infoId); }
    for (const l of this.activeScene?.labelDefs || []) if (!seen.has(l.infoId)) { seen.add(l.infoId); ids.push(l.infoId); }
    if (!ids.length) list.append(U.el('li', { class: 'muted', text: Content.ui.objectsEmpty }));
    for (const id of ids) {
      const inf = Content.get(id);
      if (!inf) continue;
      const b = U.el('button', { type: 'button', onclick: () => { this.openInfo(id, { focus: true }); this.toggleObjects(false); } }, [inf.title, inf.tooltip ? U.el('span', { class: 'ol-sub', text: inf.tooltip }) : null]);
      b.addEventListener('pointerenter', () => this.sm.setHoverByInfo(id, true));
      b.addEventListener('pointerleave', () => this.sm.setHoverByInfo(id, false));
      b.addEventListener('focus', () => this.sm.setHoverByInfo(id, true));
      b.addEventListener('blur', () => this.sm.setHoverByInfo(id, false));
      list.append(U.el('li', {}, b));
    }
    list.querySelector('button')?.focus();
  },

  onKey(e) {
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' && !['checkbox', 'radio', 'range'].includes(e.target.type) || tag === 'textarea' || tag === 'select';
    if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
    const inDialog = !!e.target.closest?.('dialog');
    if (e.key === 'Escape') {
      if (!document.getElementById('objects-panel').hidden) return this.toggleObjects(false);
      if (this.info.isOpen) return this.info.close();
      if (this.panels.classificatie) return this.togglePanel('classificatie', false);
      if (this.panels.gallery) return this.togglePanel('gallery', false);
      if (this.panels.hr) return this.togglePanel('hr', false);
      if (document.getElementById('modes').classList.contains('open')) return this.toggleMenu(false);
      return;
    }
    if (inDialog) return;
    const onControl = ['button', 'a', 'summary'].includes(tag) || tag === 'input';
    if (this.mode === 'rondleiding' && this.tour && !onControl) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); return this.tour.prev?.(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); return this.tour.next?.(); }
      if (e.key === ' ') { e.preventDefault(); return this.tour.togglePause?.(); }
    }
    switch (e.key) {
      case ' ':
        if (onControl) return;
        e.preventDefault(); this.togglePlay(); break;
      case 'ArrowLeft': case 'ArrowRight':
        if (tag === 'input') return;
        e.preventDefault(); this.stepStage(e.key === 'ArrowLeft' ? -1 : 1); break;
      case '1': this.setMode('levensloop'); break;
      case '2': this.setMode('eindproducten'); break;
      case '3': this.setMode('binnenkant'); break;
      case '4': case 'h': case 'H': this.togglePanel('hr'); break;
      case '5': this.togglePanel('classificatie'); break;
      case '6': this.setMode('vergelijken'); break;
      case '7': this.setMode('rondleiding'); break;
      case '8': this.togglePanel('quiz', true); break;
      case 'o': case 'O': this.toggleObjects(); break;
      case 'i': case 'I': if (this._captionInfo) this.openInfo(this._captionInfo, { focus: true }); break;
      case 'r': case 'R': if (this.activeScene) this.sm.flyTo(this.activeScene.getCameraPreset(), 1.4); break;
      case '?': document.getElementById('help-dialog').showModal(); break;
      default: return;
    }
  },

  buildMassPanel() {
    const slider = document.getElementById('mass-slider');
    slider.addEventListener('input', () => this.setMass(this.sliderToMass(Number(slider.value))));
    document.getElementById('lowz').addEventListener('change', (e) => { this.lowZ = e.target.checked; this.setMass(this.mass); });
    document.getElementById('mass-collapse').addEventListener('click', () => {
      const p = document.getElementById('mass-panel'); const c = p.classList.toggle('collapsed');
      document.getElementById('mass-collapse').setAttribute('aria-expanded', String(!c));
    });
    if (U.isMobile()) { document.getElementById('mass-panel').classList.add('collapsed'); document.getElementById('mass-collapse').setAttribute('aria-expanded', 'false'); }
    const pre = document.getElementById('mass-presets');
    for (const p of Content.ui.massPresets) pre.append(U.el('button', { type: 'button', 'aria-pressed': 'false', dataset: { m: p.m }, onclick: () => this.setMass(p.m) }, p.label));
    document.getElementById('mass-note').textContent = Content.ui.massNote;
  },
  sliderToMass(v) { return Math.pow(10, -2 + (v / 1000) * (Math.log10(150) + 2)); },
  massToSlider(m) { return Math.round(((Math.log10(m) + 2) / (Math.log10(150) + 2)) * 1000); },

  buildGallery() {
    const body = document.getElementById('gallery-body');
    body.innerHTML = '';
    body.append(U.el('p', { class: 'muted', text: Content.ui.galleryIntro, style: { marginTop: 0 } }));
    // meta.gallery may be one card or an array of cards: { order, section, title, blurb, art, params, status }
    const items = [];
    for (const [id, s] of Object.entries(Registry.scenes)) for (const g of [].concat(s.meta.gallery || [])) items.push({ id, s, g });
    items.sort((a, b) => (a.g.order ?? 99) - (b.g.order ?? 99));
    const sections = {};
    for (const it of items) (sections[it.g.section || 'eindproduct'] ||= []).push(it);
    for (const [sec, list] of Object.entries(sections)) {
      body.append(U.el('h3', { class: 'g-section', text: Content.ui.gallerySections[sec] || sec }));
      const grid = U.el('div', { class: 'gallery-grid' });
      for (const { id, s, g } of list) {
        const status = g.status || s.meta.status;
        const st = status && Content.ui.status[status];
        grid.append(U.el('button', { class: 'g-card', type: 'button', onclick: () => { this.togglePanel('gallery', false); this.goToScene(id, Object.assign({ mass: this.mass }, g.params || {})); } }, [
          U.el('div', { class: 'g-art', 'aria-hidden': 'true', style: { background: g.art || 'radial-gradient(circle at 50% 60%, #ffd28a 0 8%, #ff7a3a33 30%, transparent 60%), #0b0d1a' } }),
          U.el('div', { class: 'g-txt' }, [U.el('h3', { text: g.title || s.meta.title }), U.el('p', { text: g.blurb || '' }), st ? U.el('span', { class: 'badge ' + st.cls, text: st.label }) : null]),
        ]));
      }
      body.append(grid);
    }
    this.galleryItems = items;
    this.galleryOrder = [...new Set(items.map((it) => it.id))];
  },

  // ------------------------------------------------------------------ modes & panels
  setMode(mode, opts = {}) {
    if (mode === this.mode && !opts.force) {
      if (mode === 'eindproducten') this.togglePanel('gallery', true);
      if (mode === 'levensloop') this.goToStage(this.stageIndex);
      return;
    }
    const prev = this.mode;
    if (prev === 'vergelijken') { try { this.compare?.exit(); } catch (e) { console.error(e); } this.hr?.clearCompare?.(); }
    if (prev === 'rondleiding' && mode !== 'rondleiding') { try { this.tour?.stop({ silent: true }); } catch (e) { console.error(e); } }
    this.mode = mode;
    this.applyBodyClasses();
    this.syncNav();
    this.togglePanel('gallery', false);
    switch (mode) {
      case 'levensloop': if (!opts.skipStage) this.goToStage(this.stageIndex); break;
      case 'eindproducten': this.pause(); if (!opts.noGallery) this.togglePanel('gallery', true); break;
      case 'binnenkant': this.pause(); if (!opts.noScene) this.goToScene('interior', { variant: this.interiorVariant(this.mass), mass: this.mass }); break;
      case 'vergelijken':
        this.pause();
        if (this.compare) this.compare.enter(); else this.toast('Vergelijkingsmodus is niet beschikbaar.');
        break;
      case 'rondleiding':
        if (this.tour) this.tour.start(); else this.toast('De rondleiding is niet beschikbaar.');
        break;
    }
    bus.emit('mode', mode);
  },

  syncNav() {
    document.querySelectorAll('#modes .mode-btn').forEach((b) => {
      const on = b.dataset.mode ? b.dataset.mode === this.mode : !!this.panels[b.dataset.toggle];
      b.setAttribute('aria-pressed', String(on));
    });
  },

  togglePanel(name, force) {
    const open = force ?? !this.panels[name];
    if (name === 'quiz') {
      const d = document.getElementById('quiz-dialog');
      if (open) { if (!this.quiz) { this.toast('De quiz is niet beschikbaar.'); return; } this.pause(); this.quiz.open?.(); if (!d.open) d.showModal(); } else if (d.open) d.close();
      this.panels.quiz = open; this.syncNav(); return;
    }
    const el = { hr: 'hr-panel', classificatie: 'class-panel', gallery: 'gallery-panel' }[name];
    if (!el) return;
    this.panels[name] = open;
    document.getElementById(el).hidden = !open;
    if (open && name === 'classificatie') this.togglePanel('gallery', false);
    if (open && name === 'gallery') this.panels.classificatie && this.togglePanel('classificatie', false);
    if (name === 'hr') { if (open) { this.hr?.onShow?.(); requestAnimationFrame(() => this.hr?.resize?.()); } else this.hr?.onHide?.(); }
    if (name === 'classificatie') { if (open) this.classification?.onShow?.(); else this.classification?.onHide?.(); }
    if (open) document.getElementById(el).querySelector('button, [tabindex]')?.focus({ preventScroll: true });
    this.syncNav();
  },

  interiorVariant(m) { return m < 0.35 ? 'rodeDwerg' : m < 1.5 ? 'zon' : m < 8 ? 'heet' : 'uienschil'; },

  // ------------------------------------------------------------------ mass & path
  setMass(m, opts = {}) {
    m = U.clamp(m, Evolution.MIN_MASS ?? 0.01, Evolution.MAX_MASS ?? 150);
    this.mass = m;
    document.getElementById('mass-slider').value = this.massToSlider(m);
    document.getElementById('mass-value').textContent = U.fmtMass(m);
    document.querySelectorAll('#mass-presets button').forEach((b) => b.setAttribute('aria-pressed', String(Math.abs(Number(b.dataset.m) - m) / m < 0.02)));
    const oldStage = this.path?.stages[this.stageIndex];
    const oldF = this.state?.f ?? 0;
    this.path = Evolution.getPath(m, { lowZ: this.lowZ });
    this.timeline.setPath(this.path);
    this.hr?.setPath?.(this.path);
    this.renderFate();
    if (opts.silent) return;
    // keep the same stage (by id) when it still exists for the new mass
    let idx = oldStage ? this.path.stages.findIndex((s) => s.id === oldStage.id) : 0;
    if (idx < 0) idx = Math.min(this.stageIndex, this.path.stages.length - 1);
    if (this.mode === 'levensloop') {
      const s = this.path.stages[idx];
      const needSwitch = s.sceneId !== this.activeSceneId || (s.params?.variant ?? null) !== (this.activeParams?.variant ?? null);
      this.stageIndex = idx;
      this.age = s.start + U.clamp(oldF) * s.duration;
      if (needSwitch) this.goToStage(idx, { f: oldF });
      else { this.activeParams = Object.assign({}, s.params, { mass: m, stage: s, path: this.path, lowZ: this.lowZ }); this.activeScene.params = this.activeParams; this.activeScene.onParams?.(this.activeParams); this.updateCaptionForStage(); }
    } else if (this.mode === 'binnenkant' && this.activeSceneId === 'interior') {
      this.goToScene('interior', { variant: this.interiorVariant(m), mass: m });
    }
    bus.emit('mass', m);
  },

  renderFate() {
    const p = this.path, box = document.getElementById('mass-fate');
    const txt = Content.paths?.[p.category];
    const label = txt?.label || p.categoryLabel || p.category;
    const route = txt?.route || p.fate || p.stages.filter((s) => s.kind !== 'formation').map((s) => s.label).join(' → ');
    box.innerHTML = '';
    box.append(U.el('span', { class: 'fate-cat', html: label }), U.el('span', { class: 'fate-path', html: route }));
    if (p.msLifetime) box.append(U.el('span', { class: 'fate-path', html: `Hoofdreeks: ${U.fmtYears(p.msLifetime, 2)}` }));
    if (txt?.info && Content.get(txt.info)) box.append(U.el('button', { class: 'link-btn', type: 'button', onclick: () => this.openInfo(txt.info, { focus: true }) }, 'Meer over dit pad'));
  },

  // ------------------------------------------------------------------ timeline playback
  isTimelineMode() { return this.mode === 'levensloop' || (this.mode === 'rondleiding' && this.tour?.usesTimeline !== false); },

  goToStage(i, opts = {}) {
    const st = this.path.stages;
    i = U.clamp(i, 0, st.length - 1);
    if (this.mode !== 'levensloop' && this.mode !== 'rondleiding') this.setMode('levensloop', { skipStage: true });
    const s = st[i];
    this.stageIndex = i;
    this.age = s.start + U.clamp(opts.f || 0) * s.duration;
    this.state = Evolution.stateAt(this.path, this.age);
    const params = Object.assign({}, s.params, { mass: this.mass, stage: s, path: this.path, lowZ: this.lowZ });
    this.goToScene(s.sceneId, params, { instant: opts.instant, fromStage: true, focus: opts.focus });
    this.timeline.setActive(i, opts.f || 0);
    if (opts.openInfo) this.openInfo(s.infoId);
    bus.emit('stage', { index: i, stage: s });
  },

  canStepStage() {
    if (this.isTimelineMode()) return { prev: this.stageIndex > 0, next: this.stageIndex < this.path.stages.length - 1 };
    if (this.mode === 'eindproducten' && this.galleryOrder) { const k = this.galleryOrder.indexOf(this.activeSceneId); return { prev: k > 0, next: k >= 0 && k < this.galleryOrder.length - 1 }; }
    return { prev: this.stageIndex > 0, next: this.stageIndex < this.path.stages.length - 1 };
  },

  stepStage(d, opts = {}) {
    if (this.mode === 'eindproducten' && this.galleryOrder) {
      const k = this.galleryOrder.indexOf(this.activeSceneId) + d;
      if (k >= 0 && k < this.galleryOrder.length) {
        const id = this.galleryOrder[k];
        this.goToScene(id, Object.assign({ mass: this.mass }, Registry.scenes[id].meta.gallery?.params || {}));
        if (opts.openInfo) this.openInfo(Registry.scenes[id].meta.infoId);
      }
      return;
    }
    const i = this.stageIndex + d;
    if (i < 0 || i >= this.path.stages.length) return;
    this.goToStage(i, { openInfo: opts.openInfo || this.info.isOpen });
  },

  play() {
    if (!this.isTimelineMode() && this.mode !== 'vergelijken') this.setMode('levensloop');
    if (this.isTimelineMode() && this.stageIndex === this.path.stages.length - 1 && this.state && this.state.f >= 0.999) this.goToStage(0);
    this.playing = true; this.timeline.setPlaying(true); bus.emit('play', true);
  },
  pause() { this.playing = false; this.timeline?.setPlaying(false); bus.emit('play', false); },
  togglePlay() { this.playing ? this.pause() : this.play(); },
  setSpeed(yps) { this.speed = U.clamp(yps, 1, 1e9); this.timeline.setSpeed(this.speed); },

  advance(dt) {
    const st = this.path.stages, s = st[this.stageIndex];
    const minS = s.minSeconds || this.minStageSeconds;
    const rate = Math.min(this.speed, s.duration / minS);
    this.effectiveRate = rate;
    this.age += rate * dt;
    if (this.age >= s.start + s.duration) {
      if (this.stageIndex < st.length - 1) this.goToStage(this.stageIndex + 1, { fromPlayback: true, openInfo: this.info.isOpen && this.info.currentId === s.infoId });
      else { this.age = s.start + s.duration; this.pause(); }
    }
  },

  // ------------------------------------------------------------------ per-frame
  update(dt) {
    let state = null;
    if (this.mode === 'vergelijken' && this.compare) {
      const r = this.compare.update(dt, { playing: this.playing, speed: this.speed });
      if (r) {
        state = { compare: true, a: r.stateA, b: r.stateB, age: r.age };
        this.timeline.setAge(r.age, null);
        this.hr?.setCompare?.(r.stateA, r.stateB);
      }
    } else if (this.isTimelineMode() && this.path) {
      if (this.playing) this.advance(dt);
      state = this.state = Evolution.stateAt(this.path, this.age);
      this.timeline.setActive(this.stageIndex, state.f);
      this.timeline.setAge(state.starAge ?? (this.age - (this.path.birth || 0)));
      this.hr?.setState?.(state);
      const out = document.getElementById('tl-speed-value');
      if (this.playing && this.effectiveRate && this.effectiveRate < this.speed * 0.98) out.textContent = Content.ui.speedFmt(this.effectiveRate) + ' · fase vertraagd';
      else if (out.textContent.includes('vertraagd') || !this.playing) out.textContent = Content.ui.speedFmt(this.speed);
    }
    if (this.mode === 'rondleiding') { try { this.tour?.update?.(dt); } catch (e) { console.error(e); } }
    const sc = this.activeScene;
    if (sc) {
      sc.time += dt;
      try { sc.update(dt, state); } catch (e) {
        if (!this._sceneErrors.has(this.activeSceneId)) { this._sceneErrors.add(this.activeSceneId); console.error(`[scene ${this.activeSceneId}] update`, e); }
      }
    }
  },

  // ------------------------------------------------------------------ scenes
  getScene(id) {
    if (this.scenes[id]) return this.scenes[id];
    const reg = Registry.scenes[id];
    if (!reg) return null;
    const s = new reg.cls({ sm: this.sm, app: this });
    s.id = id;
    this.scenes[id] = s;
    return s;
  },

  touchLru(id) {
    this.lru = this.lru.filter((x) => x !== id); this.lru.push(id);
    while (this.lru.length > 4) {
      const old = this.lru.shift();
      if (old === this.activeSceneId) { this.lru.push(old); break; }
      try { this.scenes[old]?.dispose(); } catch (e) { console.warn(e); }
      delete this.scenes[old];
    }
  },

  /** Switch to a scene. params go to scene.enter(); opts: { instant, focus, fromStage } */
  async goToScene(id, params = {}, opts = {}) {
    if (!Registry.scenes[id]) { console.warn('[app] onbekende scène', id); return false; }
    const same = id === this.activeSceneId && this.activeScene;
    if (same && (params.variant ?? null) === (this.activeParams.variant ?? null) && !opts.force) {
      this.activeParams = params; this.activeScene.params = params;
      this.activeScene.onParams?.(params);
      this.updateCaption(id, opts);
      if (opts.focus) this.focusCamera(opts.focus);
      return true;
    }
    const token = ++this._switchToken;
    const quick = opts.instant || Settings.reducedMotion || !this.activeScene;
    const fade = document.getElementById('fade');
    if (!quick) { fade.classList.add('on'); await new Promise((r) => setTimeout(r, 380)); }
    if (token !== this._switchToken) return false;
    this.activateScene(id, params, opts);
    if (!quick) requestAnimationFrame(() => fade.classList.remove('on'));
    else fade.classList.remove('on');
    return true;
  },

  activateScene(id, params, opts = {}) {
    const old = this.activeScene;
    if (old) {
      try { old.exit(); } catch (e) { console.error(`[scene ${this.activeSceneId}] exit`, e); }
      old._active = false;
      this.sm.stage.remove(old.group);
      for (const d of old.labelDefs) d.handle = null;
      if (opts.rebuild) { try { old.dispose(); } catch (e) { /* ignore */ } delete this.scenes[this.activeSceneId]; }
    }
    this.sm.labels.clear();
    document.querySelectorAll('#labels .scene-hud').forEach((el) => el.remove());
    this.sm.setPickables([]);
    const s = this.getScene(id);
    this.activeScene = s; this.activeSceneId = id; this.activeParams = params;
    try {
      if (!s.built) { s.build(); s.built = true; }
      s.params = params; s.time = 0; s._active = true;
      this.sm.stage.add(s.group);
      s.enter(params);
    } catch (e) {
      console.error(`[scene ${id}] build/enter`, e);
      this.toast('Deze scène kon niet worden geladen.');
    }
    this.sm.setPickables(s.pickables);
    for (const d of s.labelDefs) d.handle = this.sm.labels.add(d);
    this.sm.setRenderSettings(s.renderSettings || {});
    const preset = (opts.focus && s.getFocus(opts.focus)) || s.getCameraPreset();
    if (opts.instant || Settings.reducedMotion) this.sm.flyTo(preset, 0, true);
    else {
      const p = new THREE.Vector3(...(preset.position instanceof THREE.Vector3 ? preset.position.toArray() : preset.position));
      const t = new THREE.Vector3(...(preset.target instanceof THREE.Vector3 ? preset.target.toArray() : (preset.target || [0, 0, 0])));
      this.sm.flyTo({ position: p.clone().sub(t).multiplyScalar(1.6).add(t), target: t, minDistance: preset.minDistance, maxDistance: preset.maxDistance, fov: preset.fov }, 0, true);
      this.sm.flyTo(preset, 2.2);
    }
    this.touchLru(id);
    this.updateCaption(id, opts);
    if (!document.getElementById('objects-panel').hidden) this.toggleObjects(true);
    bus.emit('scene', { id, params });
  },

  focusCamera(name) {
    const p = this.activeScene?.getFocus(name);
    if (p) this.sm.flyTo(p, 1.8);
  },

  // ------------------------------------------------------------------ caption & info
  updateCaption(id, opts = {}) {
    const meta = Registry.scenes[id]?.meta || {};
    const inTimeline = this.isTimelineMode() && this.path?.stages[this.stageIndex]?.sceneId === id;
    if (inTimeline) return this.updateCaptionForStage();
    this.setCaption({ kicker: meta.kicker || '', title: meta.title, infoId: meta.infoId, badges: meta.badges, status: meta.status });
  },

  updateCaptionForStage() {
    const s = this.path.stages[this.stageIndex];
    const meta = Registry.scenes[s.sceneId]?.meta || {};
    const nForm = this.path.stages.filter((x) => x.kind === 'formation').length;
    const kicker = s.kind === 'formation' ? `Stervorming · fase ${this.stageIndex + 1} van ${nForm}` : `${Content.paths?.[this.path.category]?.label || this.path.categoryLabel || 'Evolutie'} · fase ${this.stageIndex + 1} van ${this.path.stages.length}`;
    const info = Content.get(s.infoId);
    this.setCaption({ kicker, title: s.label, infoId: s.infoId, sub: info?.tooltip, badges: meta.badges, status: info?.status || meta.status });
  },

  setCaption({ kicker = '', title = '', sub = null, infoId = null, badges = [], status = null }) {
    const cap = document.getElementById('caption');
    const info = infoId ? Content.get(infoId) : null;
    this._captionInfo = info ? infoId : null;
    const apply = () => {
      document.getElementById('cap-kicker').textContent = kicker;
      document.getElementById('cap-title').innerHTML = title || info?.title || '';
      document.getElementById('cap-sub').innerHTML = sub ?? info?.tooltip ?? '';
      const bEl = document.getElementById('cap-badges');
      bEl.innerHTML = '';
      const add = (b) => b && bEl.append(U.el('button', { class: 'badge ' + b.cls, type: 'button', title: 'Wat betekent dit?', onclick: () => this.openInfo(b.info, { focus: true }) }, b.label));
      if (status) add(Content.ui.status[status]);
      for (const b of badges || []) add(Content.ui.badges[b]);
      document.getElementById('cap-more').hidden = !info;
      cap.classList.remove('changing');
    };
    if (Settings.reducedMotion) apply();
    else { cap.classList.add('changing'); clearTimeout(this._capT); this._capT = setTimeout(apply, 220); }
  },

  openInfo(id, opts = {}) { return this.info.open(id, opts); },

  /** "Bekijk in 3D": go to the scene of an info entry, via the timeline when that scene is part of the current path. */
  viewInfoIn3D(id) {
    const info = Content.get(id);
    if (!info?.scene) return;
    const reg = Registry.scenes[info.scene];
    if (!reg) return;
    if (this.activeSceneId === info.scene) { if (info.focus) this.focusCamera(info.focus); else this.sm.flyTo(this.activeScene.getCameraPreset(), 1.6); return; }
    const idx = this.path.stages.findIndex((s) => s.sceneId === info.scene && (!info.params?.variant || s.params?.variant === info.params.variant));
    if (idx >= 0 && reg.meta.group !== 'eindproduct' && reg.meta.group !== 'doorsnede') { this.goToStage(idx, { focus: info.focus }); return; }
    if (reg.meta.group === 'doorsnede') this.setMode('binnenkant', { noScene: true });
    else if (reg.meta.group === 'eindproduct') this.setMode('eindproducten', { noGallery: true });
    else if (this.mode === 'levensloop') this.setMode('eindproducten', { noGallery: true });
    this.goToScene(info.scene, Object.assign({ mass: this.mass }, info.params || {}), { focus: info.focus });
  },

  toast(msg, ms = 3200) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => { t.hidden = true; }, ms);
  },

  // ------------------------------------------------------------------ deep links & testing
  /** #scene=blackHole&variant=x&mass=20&lowz=1&stage=3|redGiant&mode=binnenkant&info=id&hr=1&class=1&gallery=1&quiz=1&play=1&speed=9&tour=1 */
  applyDeepLink() {
    const h = new URLSearchParams(location.hash.slice(1));
    if (![...h.keys()].length) return false;
    if (h.has('lowz')) { this.lowZ = h.get('lowz') === '1'; document.getElementById('lowz').checked = this.lowZ; }
    if (h.has('mass')) this.setMass(Number(h.get('mass')) || 1, { silent: true });
    if (h.has('speed')) this.setSpeed(Math.pow(10, Number(h.get('speed'))));
    let handled = false;
    if (h.has('stage')) {
      const v = h.get('stage');
      const i = isNaN(Number(v)) ? this.path.stages.findIndex((s) => s.id === v) : Number(v);
      this.goToStage(Math.max(0, i), { instant: true, f: Number(h.get('f') || 0) }); handled = true;
    }
    if (h.has('mode')) { this.setMode(h.get('mode'), { noScene: h.has('scene') }); handled = true; }
    if (h.has('scene')) {
      const params = { mass: this.mass };
      if (h.has('variant')) params.variant = h.get('variant');
      const reg = Registry.scenes[h.get('scene')];
      if (reg && !h.has('mode')) { this.mode = reg.meta.group === 'doorsnede' ? 'binnenkant' : reg.meta.group === 'eindproduct' ? 'eindproducten' : 'eindproducten'; this.applyBodyClasses(); this.syncNav(); }
      this.goToScene(h.get('scene'), params, { instant: true, focus: h.get('focus') || undefined }); handled = true;
    }
    if (h.get('hr') === '1') this.togglePanel('hr', true);
    if (h.get('class') === '1') this.togglePanel('classificatie', true);
    if (h.get('gallery') === '1') this.togglePanel('gallery', true);
    if (h.get('quiz') === '1') this.togglePanel('quiz', true);
    if (h.has('info')) this.openInfo(h.get('info'));
    if (h.get('play') === '1') this.play();
    if (h.get('tour') === '1') { this.setMode('rondleiding'); handled = true; }
    return handled;
  },

  debugInfo() {
    return {
      mode: this.mode, scene: this.activeSceneId, stage: this.path?.stages[this.stageIndex]?.id, mass: this.mass,
      fps: Math.round(this.sm?.fps || 0), pickables: this.activeScene?.pickables.length, labels: this.activeScene?.labelDefs.length,
      errors: this.errors.slice(-20), scenes: Object.keys(Registry.scenes), modules: Object.keys(Registry.modules),
      info: Object.keys(Content.info).length, calls: this.sm?.renderer.info.render.calls, triangles: this.sm?.renderer.info.render.triangles,
      points: this.sm?.renderer.info.render.points, textures: this.sm?.renderer.info.memory.textures, geometries: this.sm?.renderer.info.memory.geometries,
    };
  },

  /** Visit every registered scene (and every path) and report errors + missing content. */
  async selfTest({ dwell = 700, only = null } = {}) {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const report = { scenes: [], missingInfo: [], missingScenes: [], brokenRelated: [], brokenSceneRefs: [], errorsBefore: this.errors.length };
    const ids = only ? [].concat(only) : Object.keys(Registry.scenes);
    for (const id of ids) {
      const before = this.errors.length;
      this._sceneErrors.delete(id);
      const variants = Registry.scenes[id].meta.variants || [undefined];
      for (const v of variants) {
        await this.goToScene(id, { mass: this.mass, variant: v }, { instant: true, force: true });
        await wait(dwell);
        // also exercise update with a timeline-like state
        try {
          const path = Evolution.getPath(this.mass, {});
          const st = path.stages.find((s) => s.sceneId === id) || path.stages[path.stages.length - 1];
          for (const f of [0, 0.5, 0.99]) this.activeScene.update(0.016, Evolution.stateAt(path, st.start + f * st.duration));
        } catch (e) { this.errors.push(`[selftest ${id}] update with state: ${e.message}`); }
      }
      const sc = this.activeScene;
      const infoIds = new Set([Registry.scenes[id].meta.infoId, ...(sc?.pickables || []).map((p) => p.infoId), ...(sc?.labelDefs || []).map((l) => l.infoId)]);
      report.scenes.push({
        id, ok: this.errors.length === before, pickables: sc?.pickables.length || 0, labels: sc?.labelDefs.length || 0,
        missingInfo: [...infoIds].filter((i) => i && !Content.get(i)), errors: this.errors.slice(before),
        calls: this.sm.renderer.info.render.calls, points: this.sm.renderer.info.render.points,
      });
    }
    const masses = [0.012, 0.03, 0.07, 0.09, 0.2, 0.45, 0.6, 1, 1.8, 2.5, 5, 7.5, 9, 15, 24, 30, 60, 100, 140, 150];
    const mi = new Set(), ms = new Set();
    for (const m of masses) for (const lowZ of [false, true]) {
      const p = Evolution.getPath(m, { lowZ });
      for (const s of p.stages) { if (!Registry.scenes[s.sceneId]) ms.add(s.sceneId); if (!Content.get(s.infoId)) mi.add(s.infoId); }
      if (Content.paths && !Content.paths[p.category]) mi.add('paths.' + p.category);
    }
    for (const [id, e] of Object.entries(Content.info)) {
      for (const r of e.related || []) if (!Content.get(r)) report.brokenRelated.push(`${id} -> ${r}`);
      if (e.scene && !Registry.scenes[e.scene]) report.brokenSceneRefs.push(`${id} -> ${e.scene}`);
      for (const a of e.actions || []) if (a.scene && !Registry.scenes[a.scene]) report.brokenSceneRefs.push(`${id} action -> ${a.scene}`);
    }
    report.missingInfo = [...mi]; report.missingScenes = [...ms];
    report.totalErrors = this.errors.length - report.errorsBefore;
    return report;
  },
};

// ---------------------------------------------------------------- start
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => App.init());
else App.init();
