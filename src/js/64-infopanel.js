/* InfoPanel: the slide-in explanation panel. Renders Content.info entries:
   title, 2–4 paragraphs, key numbers, "Wist je dat?", "Dieper duiken", actions,
   related links and the Vorige fase / Volgende fase / Bekijk in 3D buttons. */

class InfoPanel {
  constructor(app) {
    this.app = app;
    this.el = document.getElementById('info-panel');
    this.scroll = document.getElementById('ip-scroll');
    this.currentId = null;
    this.history = [];
    document.getElementById('ip-close').addEventListener('click', () => this.close());
    this.el.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); this.close(); } });
  }

  get isOpen() { return this.el.classList.contains('open'); }

  open(infoId, { focus = false } = {}) {
    const info = Content.get(infoId);
    if (!info) { console.warn('[info] geen uitleg gevonden voor', infoId); return false; }
    if (this.currentId && this.currentId !== infoId) this.history.push(this.currentId);
    this.currentId = infoId;
    this.render(infoId, info);
    this.el.classList.add('open');
    this.el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('info-open');
    this.scroll.scrollTop = 0;
    if (focus) setTimeout(() => this.el.querySelector('.ip-title')?.focus(), 60);
    bus.emit('infoOpened', infoId);
    return true;
  }

  close() {
    if (!this.isOpen) return;
    this.el.classList.remove('open');
    this.el.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('info-open');
    this.currentId = null;
    this.history = [];
    bus.emit('infoClosed');
  }

  render(id, info) {
    const ui = Content.ui.infoPanel;
    const s = this.scroll;
    s.innerHTML = '';
    if (info.kicker) s.append(U.el('div', { class: 'ip-kicker', html: info.kicker }));
    s.append(U.el('h2', { class: 'ip-title', tabindex: '-1', html: info.title }));
    const badges = U.el('div', { class: 'ip-badges' });
    if (info.status && Content.ui.status[info.status]) badges.append(this.badge(Content.ui.status[info.status]));
    for (const b of info.badges || []) if (Content.ui.badges[b]) badges.append(this.badge(Content.ui.badges[b]));
    if (badges.childElementCount) s.append(badges);

    const body = U.el('div', { class: 'ip-body' });
    for (const p of [].concat(info.body || [])) body.append(U.el('p', { html: p }));
    s.append(body);

    if (info.stats?.length) {
      const dl = U.el('dl', { class: 'kv' });
      for (const [k, v] of info.stats) dl.append(U.el('dt', { html: k }), U.el('dd', { html: v }));
      s.append(U.el('section', { class: 'ip-card' }, [U.el('h3', { text: ui.stats }), dl]));
    }
    if (info.fact) s.append(U.el('section', { class: 'ip-card ip-fact' }, [U.el('h3', { text: ui.fact }), U.el('p', { html: info.fact })]));
    if (info.deeper?.length) {
      const d = U.el('details', { class: 'ip-deeper' });
      d.append(U.el('summary', { text: ui.deeper }));
      const db = U.el('div', { class: 'deeper-body' });
      for (const p of [].concat(info.deeper)) db.append(U.el(p.trim().startsWith('<') ? 'div' : 'p', { html: p }));
      d.append(db);
      s.append(d);
    }
    if (info.actions?.length) {
      const a = U.el('div', { class: 'ip-actions' });
      for (const act of info.actions) {
        a.append(U.el('button', { class: 'btn small', type: 'button', onclick: () => this.runAction(act) }, act.label));
      }
      s.append(a);
    }
    if (info.related?.length) {
      const rel = U.el('div', { class: 'ip-related' });
      for (const rid of info.related) {
        const r = Content.get(rid);
        if (r) rel.append(U.el('button', { type: 'button', onclick: () => this.open(rid, { focus: true }), html: r.title }));
      }
      if (rel.childElementCount) s.append(U.el('section', {}, [U.el('h3', { class: 'g-section', text: ui.related }), rel]));
    }

    // navigation footer
    let nav = this.el.querySelector('.ip-nav');
    if (!nav) { nav = U.el('div', { class: 'ip-nav' }); this.el.append(nav); }
    nav.innerHTML = '';
    const canStage = this.app.canStepStage();
    nav.append(U.el('button', { class: 'btn small', type: 'button', disabled: !canStage.prev, onclick: () => this.app.stepStage(-1, { openInfo: true }) }, [this.icon('M15 6l-6 6 6 6'), ui.prev]));
    nav.append(U.el('button', { class: 'btn small', type: 'button', disabled: !canStage.next, onclick: () => this.app.stepStage(1, { openInfo: true }) }, [ui.next, this.icon('M9 6l6 6-6 6')]));
    const scene = info.scene;
    if (scene && Registry.scenes[scene]) {
      nav.append(U.el('button', {
        class: 'btn small primary', type: 'button',
        onclick: () => { this.app.viewInfoIn3D(id); if (U.isMobile()) this.close(); },
      }, [this.icon('M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5'), ui.view3d]));
    }
  }

  badge(b) {
    return U.el('button', { class: 'badge ' + b.cls, type: 'button', style: { cursor: 'pointer' }, title: 'Wat betekent dit?', onclick: () => this.open(b.info, { focus: true }) }, b.label);
  }

  icon(d) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); svg.append(p);
    return svg;
  }

  /** actions: { label, scene, params, focus, info, mode, mass } */
  runAction(act) {
    if (act.mass !== undefined) this.app.setMass(act.mass);
    if (act.mode) this.app.setMode(act.mode);
    if (act.scene) this.app.goToScene(act.scene, act.params || {}, { focus: act.focus });
    if (act.info) this.open(act.info, { focus: true });
    if (act.toggle) this.app.togglePanel(act.toggle, true);
  }
}
