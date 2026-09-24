/* Timeline: bottom bar with play/pause, prev/next, speed (1 yr/s … 1 billion yr/s),
   the age counter and one clickable chip per stage of the current evolution path. */

class Timeline {
  constructor(app) {
    this.app = app;
    this.chipsEl = document.getElementById('tl-chips');
    this.playBtn = document.getElementById('tl-play');
    this.speed = document.getElementById('tl-speed-slider');
    this.speedOut = document.getElementById('tl-speed-value');
    this.ageOut = document.getElementById('tl-age-value');
    this.ageLabel = document.querySelector('.tl-age-label');
    this.chips = [];
    this.active = -1;
    this.playBtn.addEventListener('click', () => app.togglePlay());
    document.getElementById('tl-prev').addEventListener('click', () => app.stepStage(-1));
    document.getElementById('tl-next').addEventListener('click', () => app.stepStage(1));
    this.speed.addEventListener('input', () => app.setSpeed(Math.pow(10, Number(this.speed.value))));
    this._lastAgeText = '';
  }

  setPath(path) {
    this.chipsEl.innerHTML = '';
    this.chips = [];
    this.active = -1;
    let lastKind = null;
    path.stages.forEach((s, i) => {
      if (lastKind === 'formation' && s.kind !== 'formation') this.chipsEl.append(U.el('li', { class: 'tl-chip sep', 'aria-hidden': 'true' }));
      lastKind = s.kind;
      const bar = U.el('span', { class: 'bar' });
      const btn = U.el('button', {
        type: 'button', 'aria-label': `${Content.ui.stageN(i + 1, path.stages.length)}: ${s.label}`,
        onclick: () => this.app.goToStage(i, { openInfo: false }),
        onkeydown: (e) => { if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); this.app.goToStage(i, { openInfo: true }); } },
      }, [U.el('span', { class: 'n', text: String(i + 1) }), U.el('span', { class: 'l', text: s.short || s.label }), bar]);
      btn.title = `${s.label} – ${U.fmtYears(s.duration, 2)}`;
      const li = U.el('li', { class: 'tl-chip' + (s.kind === 'formation' ? ' formation' : '') }, btn);
      this.chipsEl.append(li);
      this.chips.push({ li, bar, btn });
    });
  }

  setActive(i, f = 0) {
    if (i !== this.active) {
      this.chips.forEach((c, k) => {
        c.li.classList.toggle('active', k === i);
        c.li.classList.toggle('done', k < i);
        c.btn.setAttribute('aria-current', k === i ? 'step' : 'false');
        if (k !== i) c.bar.style.width = '';
      });
      this.active = i;
      const c = this.chips[i];
      if (c) c.li.scrollIntoView({ block: 'nearest', inline: 'center', behavior: Settings.reducedMotion ? 'auto' : 'smooth' });
    }
    const c = this.chips[i];
    if (c) c.bar.style.width = (U.clamp(f) * 100).toFixed(1) + '%';
  }

  setPlaying(p) {
    this.playBtn.classList.toggle('playing', p);
    this.playBtn.setAttribute('aria-label', p ? Content.ui.pause : Content.ui.play);
  }

  setSpeed(yps) {
    this.speed.value = String(Math.log10(yps));
    const t = Content.ui.speedFmt(yps);
    this.speedOut.textContent = t;
    this.speed.setAttribute('aria-valuetext', t.replace('1 s =', '1 seconde is'));
  }

  /** Show the star's age (negative = before birth). */
  setAge(starAge, label) {
    let txt, lab;
    if (label) { lab = label; txt = starAge; } else if (starAge < 0) { lab = 'Geboorte over'; txt = Content.ui.ageFmt(-starAge); } else { lab = 'Leeftijd'; txt = Content.ui.ageFmt(starAge); }
    if (txt !== this._lastAgeText) { this.ageOut.textContent = txt; this._lastAgeText = txt; }
    if (this.ageLabel.textContent !== lab) this.ageLabel.textContent = lab;
  }
}
