/* Evolution — MINIMAL STUB of the API in ARCHITECTURE.md (replaced by the full model). */

const Evolution = {
  MIN_MASS: 0.01, MAX_MASS: 150,

  category(mass, lowZ = false) {
    if (mass < 0.08) return 'bruineDwerg';
    if (mass < 0.5) return 'rodeDwerg';
    if (mass < 8) return 'zonachtig';
    if (mass < 25) return 'zwaar';
    if (lowZ && mass >= 130) return 'paarInstabiliteit';
    return 'zeerZwaar';
  },

  zams(mass) {
    const L = mass < 0.43 ? 0.23 * Math.pow(mass, 2.3) : mass < 2 ? Math.pow(mass, 4) : mass < 55 ? 1.4 * Math.pow(mass, 3.5) : 32000 * mass;
    const R = mass < 1 ? Math.pow(mass, 0.8) : Math.pow(mass, 0.57);
    const T = PHYS.Tsun * Math.pow(L / (R * R), 0.25);
    return { L, R, T };
  },

  msLifetime(mass) { return 1e10 * Math.pow(mass, -2.5); },

  getPath(mass, opts = {}) {
    const lowZ = !!opts.lowZ;
    const cat = this.category(mass, lowZ);
    const z = this.zams(mass);
    const ms = this.msLifetime(mass);
    const lg = Math.log10;
    const S = (id, sceneId, label, duration, pts, extra = {}) => Object.assign({ id, sceneId, infoId: extra.infoId || sceneId, label, short: extra.short || label, kind: extra.kind || 'evolution', params: extra.params || {}, duration, track: pts }, extra);
    const P = (f, L, T, R, M = mass) => [f, lg(Math.max(L, 1e-9)), lg(T), R, M];
    const st = [
      S('cloud', 'cloud', 'Moleculaire wolk', 1e7, [P(0, 1e-6, 15, 2e7), P(1, 1e-6, 15, 1e7)], { kind: 'formation', short: 'Wolk' }),
      S('collapse', 'collapse', 'Instorting', 2e5, [P(0, 1e-5, 20, 5e6), P(1, 1e-3, 30, 1e5)], { kind: 'formation', short: 'Instorting' }),
      S('protostar', 'protostar', 'Protoster', 1e5, [P(0, 10 * Math.max(z.L, 0.01), 3000, 5), P(1, 5 * Math.max(z.L, 0.01), 3500, 3)], { kind: 'formation' }),
      S('jets', 'jets', 'Jets', 5e5, [P(0, 5 * Math.max(z.L, 0.01), 3500, 3), P(1, 3 * Math.max(z.L, 0.01), 3800, 2.5)], { kind: 'formation', short: 'Jets' }),
      S('ttauri', 'ttauri', 'T Tauri-fase', 1e7, [P(0, 3 * Math.max(z.L, 0.01), 3800, 2.5), P(1, 1.2 * z.L, 4200, 1.3 * z.R)], { kind: 'formation', short: 'T Tauri' }),
    ];
    if (cat === 'bruineDwerg') {
      st.push(S('deuterium', 'ignition', 'Deuteriumfusie', 1e7, [P(0, 1e-3, 2800, 0.2), P(1, 1e-4, 2400, 0.12)], { kind: 'formation', params: { variant: 'deuterium' }, short: 'Deuterium' }));
      st.push(S('brownDwarf', 'brownDwarf', 'Bruine dwerg', 1e13, [P(0, 1e-4, 2400, 0.12), P(1, 1e-8, 300, 0.09)]));
    } else {
      st.push(S('ignition', 'ignition', 'Ontsteking', 3e7, [P(0, 1.2 * z.L, 4500, 1.3 * z.R), P(1, z.L, z.T, z.R)], { kind: 'formation' }));
      st.push(S('mainSequence', cat === 'rodeDwerg' ? 'redDwarf' : 'mainSequence', 'Hoofdreeks', ms, [P(0, z.L, z.T, z.R), P(1, z.L * 2, z.T * 0.97, z.R * 1.5)], { kind: 'formation', infoId: 'mainSequence' }));
      if (cat === 'rodeDwerg') st.push(S('whiteDwarf', 'whiteDwarf', 'Heliumwitte dwerg', 1e12, [P(0, 1e-2, 20000, 0.015, 0.2), P(1, 1e-5, 4000, 0.015, 0.2)], { params: { variant: 'He' } }));
      if (cat === 'zonachtig') {
        st.push(S('redGiant', 'redGiant', 'Rode reus', ms * 0.1, [P(0, z.L * 2, z.T * 0.97, z.R * 1.5), P(1, 2000 * z.L, 3200, 150)]));
        st.push(S('planetaryNebula', 'planetaryNebula', 'Planetaire nevel', 2e4, [P(0, 5000, 30000, 0.2, 0.6), P(1, 100, 100000, 0.03, 0.6)]));
        st.push(S('whiteDwarf', 'whiteDwarf', 'Witte dwerg', 1e10, [P(0, 1, 50000, 0.013, 0.6), P(1, 1e-4, 4000, 0.013, 0.6)]));
      }
      if (cat === 'zwaar' || cat === 'zeerZwaar' || cat === 'paarInstabiliteit') {
        st.push(S('supergiant', 'supergiant', 'Superreus', ms * 0.1, [P(0, z.L * 1.5, z.T * 0.9, z.R * 1.3), P(1, z.L * 2, 3500, 800)]));
        if (cat === 'paarInstabiliteit') st.push(S('pairInstability', 'pairInstability', 'Paarinstabiliteitssupernova', 1, [P(0, 1e10, 20000, 100), P(1, 1e9, 10000, 1e5)]));
        else {
          st.push(S('coreCollapse', 'coreCollapse', 'Supernova', 1, [P(0, 1e9, 20000, 800), P(1, 1e8, 10000, 1e5)]));
          if (cat === 'zwaar') st.push(S('neutronStar', 'neutronStar', 'Neutronenster', 1e10, [P(0, 1e-1, 1e6, 1.4e-5, 1.4), P(1, 1e-6, 1e5, 1.4e-5, 1.4)], { params: { variant: 'pulsar' } }));
          else st.push(S('blackHole', 'blackHole', 'Zwart gat', 1e20, [P(0, 1e-12, 1000, 1e-4, 10), P(1, 1e-12, 1000, 1e-4, 10)]));
        }
      }
    }
    let t = 0;
    for (const s of st) { s.start = t; t += s.duration; }
    const birth = st.find((s) => s.id === 'protostar').start;
    return { mass, lowZ, category: cat, categoryLabel: cat, fate: '', summary: '', stages: st, totalAge: t, birth, msLifetime: ms, remnant: { type: '', mass: 0 } };
  },

  stageIndexAt(path, age) {
    const s = path.stages;
    for (let i = s.length - 1; i >= 0; i--) if (age >= s[i].start) return i;
    return 0;
  },

  stateAt(path, age) {
    const i = this.stageIndexAt(path, age), stage = path.stages[i];
    const f = U.clamp((age - stage.start) / stage.duration);
    const tr = stage.track;
    let a = tr[0], b = tr[tr.length - 1];
    for (let k = 0; k < tr.length - 1; k++) if (f >= tr[k][0] && f <= tr[k + 1][0]) { a = tr[k]; b = tr[k + 1]; break; }
    const t = b[0] > a[0] ? (f - a[0]) / (b[0] - a[0]) : 0;
    const logL = U.lerp(a[1], b[1], t), logT = U.lerp(a[2], b[2], t), R = U.logLerp(Math.max(a[3], 1e-9), Math.max(b[3], 1e-9), t), M = U.lerp(a[4], b[4], t);
    const T = Math.pow(10, logT), L = Math.pow(10, logL);
    const sp = U.spectralType(T);
    return { age, stageIndex: i, stage, f, L, T, R, M, logL, logT, spectral: sp, lumClass: 'V', mk: sp.label + 'V', starAge: age - path.birth };
  },

  sampleTrack(path, n = 400) {
    const out = [];
    for (const [i, s] of path.stages.entries()) for (const p of s.track) out.push({ logL: p[1], logT: p[2], stageIndex: i, f: p[0] });
    return out;
  },
};
