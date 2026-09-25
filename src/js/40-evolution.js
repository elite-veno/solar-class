/* Evolution: the physical model behind the timeline. Evolution.getPath(mass, {lowZ}) returns the
   full life of a star of that initial mass as a list of stages. Every stage carries an HR track
   (L, T, R, M over the stage), the core temperature, the composition of the core, which fusion
   reactions run in the core and in shells around it, and a schematic cross-section (layers).

   Numbers are approximate, taken from standard stellar models (e.g. Woosley, Heger & Weaver 2002
   for massive stars; ARCHITECTURE.md §7). Mass limits between the paths are approximate as well. */

const Evolution = {
  MIN_MASS: 0.01, MAX_MASS: 150,

  /** Element keys used in compositions and layers (colours/labels live in Content.elements). */
  ELEMENTS: ['H', 'He', 'C', 'O', 'Ne', 'Mg', 'Si', 'Fe', 'n', 'Z'],

  category(mass, lowZ = false) {
    if (mass < 0.08) return 'bruineDwerg';
    if (mass < 0.5) return 'rodeDwerg';
    if (mass < 8) return 'zonachtig';
    if (mass < 25) return 'zwaar';
    if (lowZ && mass >= 130) return 'paarInstabiliteit';
    return 'zeerZwaar';
  },

  /** Zero-age main sequence: L (L☉), R (R☉), T (K). */
  zams(mass) {
    const L = mass < 0.43 ? 0.23 * Math.pow(mass, 2.3) : mass < 2 ? Math.pow(mass, 4) : mass < 55 ? 1.4 * Math.pow(mass, 3.5) : 32000 * mass;
    const R = mass < 1 ? Math.pow(mass, 0.9) : Math.pow(mass, 0.6);
    const T = PHYS.Tsun * Math.pow(L / (R * R), 0.25);
    return { L, R, T };
  },

  /** Central temperature on the zero-age main sequence (K), log-log interpolation in a model table. */
  zamsTc(mass) {
    const tab = [[0.08, 4], [0.1, 5], [0.3, 7.5], [0.5, 9.5], [1, 13.6], [1.5, 18], [2, 21], [3, 24], [5, 27], [10, 32], [15, 35], [25, 38], [40, 40], [60, 42], [100, 44], [150, 46]];
    const lm = Math.log10(U.clamp(mass, 0.08, 150));
    for (let i = 0; i < tab.length - 1; i++) {
      const a = Math.log10(tab[i][0]), b = Math.log10(tab[i + 1][0]);
      if (lm <= b) return 1e6 * Math.pow(10, U.lerp(Math.log10(tab[i][1]), Math.log10(tab[i + 1][1]), (lm - a) / (b - a)));
    }
    return 46e6;
  },

  /** Main-sequence lifetime (yr): ~10¹⁰ (M/M☉)^−2,5, flattening to ~3 million years for the heaviest stars. */
  msLifetime(mass) { return 1e10 * Math.pow(mass, -2.5) + 3e6; },

  /** Initial–final mass relation for white dwarfs (M☉). */
  wdMass(mass) { return Math.min(1.33, 0.101 * mass + 0.463); },
  /** White-dwarf radius (R☉): smaller for heavier white dwarfs (~Earth size at 0,6 M☉). */
  wdRadius(m) { return 0.0127 * Math.pow(m / 0.6, -1 / 3) * Math.sqrt(Math.max(0.02, 1 - Math.pow(m / 1.44, 4 / 3))) / Math.sqrt(1 - Math.pow(0.6 / 1.44, 4 / 3)); },

  getPath(mass, opts = {}) {
    const lowZ = !!opts.lowZ;
    const m = U.clamp(mass, this.MIN_MASS, this.MAX_MASS);
    const cat = this.category(m, lowZ);
    const z = this.zams(m);
    const ms = this.msLifetime(m);
    const tc0 = this.zamsTc(m);
    const lg = Math.log10, Ts = PHYS.Tsun;
    // track points: [f, logL, logT, R, M]; give (L,T) or (L,R) or (R,T) — the third follows from L = R² (T/T☉)⁴
    const LT = (f, L, T, M = m) => [f, lg(Math.max(L, 1e-30)), lg(T), Math.sqrt(L) / Math.pow(T / Ts, 2), M];
    const LR = (f, L, R, M = m) => [f, lg(Math.max(L, 1e-30)), lg(Ts * Math.pow(L / (R * R), 0.25)), R, M];
    const RT = (f, R, T, M = m) => { const L = R * R * Math.pow(T / Ts, 4); return [f, lg(Math.max(L, 1e-30)), lg(T), R, M]; };
    const C = (o) => Object.assign({ H: 0, He: 0, C: 0, O: 0, Ne: 0, Mg: 0, Si: 0, Fe: 0, n: 0, Z: 0 }, o);
    const PRIM = C({ H: 0.71, He: 0.27, Z: 0.02 });
    const HE = C({ He: 0.98, Z: 0.02 });
    const CO = C({ C: 0.3, O: 0.68, Z: 0.02 });
    const ONE = C({ O: 0.62, Ne: 0.28, Mg: 0.08, Z: 0.02 });

    const S = (id, sceneId, label, duration, track, x = {}) => Object.assign({
      id, sceneId, label, short: label, duration, track, kind: 'evolution', params: {}, infoId: sceneId,
      tc: [[0, 1e7], [1, 1e7]], fusion: { core: null, shells: [], extra: [], source: null },
      comp: [PRIM, PRIM], layers: [['H', 1]], burns: [], visual: 'star', lum: 'V', hr: true,
    }, x);
    const F = (core, shells = [], extra = [], source = null) => ({ core, shells, extra, source });

    const st = [];
    const bd = cat === 'bruineDwerg';
    const zL = Math.max(z.L, 1e-4);
    // ---------------------------------------------------------------- formation
    const tPMS = U.clamp(4e7 * Math.pow(m, -2.2), 3e4, 2e9);
    const dBurn = m >= 0.012;
    st.push(S('cloud', 'cloud', 'Moleculaire wolk', 1e7, [LT(0, 1e-6, 15, m), LT(1, 1e-6, 15, m)],
      { kind: 'formation', short: 'Wolk', tc: [[0, 12], [1, 15]], fusion: F(null, [], [], 'cloud'), visual: 'cloud', hr: false, lum: '' }));
    st.push(S('collapse', 'collapse', 'Instorting', 2e5, [LT(0, 1e-5, 20), LT(1, 1e-3, 30)],
      { kind: 'formation', short: 'Instorting', tc: [[0, 15], [0.7, 2000], [1, 1e5]], fusion: F(null, [], [], 'gravity'), visual: 'collapse', hr: false, lum: '' }));
    const Lproto = bd ? 0.01 * m / 0.05 : Math.min(10 * Math.max(z.L, 0.05), 3 * z.L + 5);
    st.push(S('protostar', 'protostar', 'Protoster', 1e5, [LT(0, Lproto * 1.5, 3000), LT(1, Lproto, 3300)],
      { kind: 'formation', tc: [[0, 1e5], [0.5, 1e6], [1, 1.5e6]], fusion: F(dBurn ? 'deuterium' : null, [], [], dBurn ? null : 'gravity'), visual: 'protostar', lum: '' }));
    st.push(S('jets', 'jets', 'Jets', 5e5, [LT(0, Lproto, 3300), LT(1, Lproto * 0.7, 3600)],
      { kind: 'formation', tc: [[0, 1.5e6], [1, 2e6]], fusion: F(dBurn ? 'deuterium' : null, [], [], dBurn ? null : 'gravity'), visual: 'jets', lum: '' }));
    const ttv = m < 0.08 ? 'bruineDwerg' : m < 2 ? 'ttauri' : m < 8 ? 'herbig' : 'massief';
    const ttInfo = ttv === 'ttauri' ? 'ttauri' : 'ttauri.' + ttv;
    const Ltt = bd ? 0.005 * m / 0.05 : Math.max(1.5 * z.L, 0.02);
    const Ttt = bd ? 2600 : ttv === 'ttauri' ? 4000 : Math.min(z.T * 0.8, 25000);
    st.push(S('ttauri', 'ttauri', ttv === 'ttauri' ? 'T Tauri-fase' : ttv === 'herbig' ? 'Herbig Ae/Be-ster' : ttv === 'massief' ? 'Jonge zware ster' : 'Jonge bruine dwerg', bd ? 3e6 : 0.2 * tPMS,
      [LT(0, Lproto * 0.7, 3600), LT(1, Ltt, Ttt)],
      { kind: 'formation', short: ttv === 'ttauri' ? 'T Tauri' : ttv === 'herbig' ? 'Herbig' : ttv === 'massief' ? 'Jonge ster' : 'Jong', params: { variant: ttv }, infoId: ttInfo,
        tc: [[0, 2e6], [1, bd ? 2.5e6 : Math.min(0.5 * tc0, 6e6)]], fusion: F(null, [], m >= 0.065 && m < 1.2 ? ['lithium'] : [], 'gravity'), visual: 'ttauri', lum: '' }));

    // ---------------------------------------------------------------- brown dwarf
    if (bd) {
      const R = 0.1;
      if (dBurn) {
        st.push(S('deuterium', 'ignition', 'Deuteriumfusie', U.clamp(4e7 * 0.02 / m, 4e6, 5e7), [LT(0, Ltt, 2600), LT(1, 2e-3 * Math.pow(m / 0.05, 2), 2650)],
          { kind: 'formation', short: 'Deuterium', params: { variant: 'deuterium' }, infoId: 'ignition.deuterium',
            tc: [[0, 1e6], [1, 1.5e6 + 2e7 * m]], fusion: F('deuterium', [], [], null), visual: 'bd', lum: '' }));
      }
      const Lstart = Math.pow(10, st[st.length - 1].track[1][1]);
      const tL = 3e8 * Math.pow(m / 0.05, 2);
      const tcBD = 1.5e6 + 2e7 * m;
      st.push(S('brownDwarf', 'brownDwarf', 'Bruine dwerg (type L)', tL, [LT(0, Lstart, 2600), RT(1, R, 1350)],
        { short: 'Type L', params: { variant: 'L' }, tc: [[0, tcBD], [1, tcBD * 0.7]], fusion: F(null, [], m >= 0.065 ? ['lithium'] : [], 'cooling'), visual: 'bd', lum: '' }));
      st.push(S('brownDwarfT', 'brownDwarf', 'Bruine dwerg (type T)', tL * 10, [RT(0, R, 1350), RT(1, R * 0.95, 550)],
        { short: 'Type T', params: { variant: 'T' }, infoId: 'brownDwarf.T', tc: [[0, tcBD * 0.7], [1, tcBD * 0.35]], fusion: F(null, [], [], 'cooling'), visual: 'bd', lum: '' }));
      st.push(S('brownDwarfY', 'brownDwarf', 'Bruine dwerg (type Y)', 1e12, [RT(0, R * 0.95, 550), RT(1, R * 0.9, 200)],
        { short: 'Type Y', params: { variant: 'Y' }, infoId: 'brownDwarf.Y', tc: [[0, tcBD * 0.35], [1, tcBD * 0.1]], fusion: F(null, [], [], 'cooling'), visual: 'bd', lum: '' }));
      return this.finish(m, lowZ, cat, st, ms, { type: 'bruine dwerg', mass: m });
    }

    // ---------------------------------------------------------------- ignition + main sequence
    const hProc = m >= 1.3 ? 'cno' : 'pp';
    st.push(S('ignition', 'ignition', 'Ontsteking', 0.8 * tPMS, [LT(0, Ltt, Ttt), LR(1, 0.8 * z.L, 0.9 * z.R)],
      { kind: 'formation', params: { variant: 'waterstof' }, tc: [[0, Math.min(0.5 * tc0, 6e6)], [1, tc0]], fusion: F(hProc, [], [], null),
        comp: [PRIM, PRIM], layers: [['core', 0.25], ['H', 1]], burns: [[hProc, 0, 0.25]] }));

    const redD = cat === 'rodeDwerg';
    const massive = m >= 8;
    const msEndL = massive ? 1.7 : 1.9, msEndR = massive ? 2.4 : 1.6;
    const coreR = massive ? 0.32 : m >= 1.3 ? 0.22 : 0.2;
    if (redD) {
      // fully convective below ~0,35 M☉: the whole star mixes and slowly turns into helium
      const blueing = m < 0.25;
      st.push(S('mainSequence', 'redDwarf', 'Rode dwerg', blueing ? 0.8 * ms : ms,
        [LR(0, 0.8 * z.L, 0.9 * z.R), LR(0.5, z.L, z.R), LR(1, blueing ? 2.5 * z.L : 1.9 * z.L, blueing ? z.R : 1.3 * z.R)],
        { short: 'Rode dwerg', params: { variant: 'rood' }, infoId: 'redDwarf', tc: [[0, tc0], [1, tc0 * 1.3]], fusion: F('pp'),
          comp: [PRIM, blueing ? C({ H: 0.2, He: 0.78, Z: 0.02 }) : C({ H: 0.0, He: 0.98, Z: 0.02 })],
          layers: m < 0.35 ? [['core', 1]] : [['core', 0.3], ['H', 1]], burns: [['pp', 0, 0.2]], convective: m < 0.35 }));
      let wdM, prevL = Math.pow(10, st[st.length - 1].track[2][1]);
      if (blueing) {
        const Tb = 6000 + (m - 0.08) * 20000, Lb = 0.01 * Math.pow(m / 0.1, 1.5);
        st.push(S('blueDwarf', 'redDwarf', 'Blauwe dwerg', 0.2 * ms, [LT(0, prevL, Math.pow(10, st[st.length - 1].track[2][2])), LT(0.7, Lb, Tb), LT(1, Lb * 0.5, Tb * 1.1)],
          { short: 'Blauwe dwerg', params: { variant: 'blauw' }, infoId: 'redDwarf.blauw', tc: [[0, tc0 * 1.3], [1, tc0 * 2]], fusion: F('pp'),
            comp: [C({ H: 0.2, He: 0.78, Z: 0.02 }), HE], layers: [['core', 0.35], ['H', 1]], burns: [['pp', 0, 0.2]], lum: 'V' }));
        wdM = 0.95 * m;
      } else {
        const Ltip = 200 * Math.pow(m / 0.45, 2);
        st.push(S('redGiant', 'redGiant', 'Rode reus', 0.1 * ms, [LR(0, prevL, 1.3 * z.R), LT(0.4, 3 * prevL, 4200), LT(1, Ltip, 3600, 0.95 * m)],
          { short: 'Rode reus', params: { variant: 'rodeReus' }, tc: [[0, tc0 * 1.4], [1, 7e7]], fusion: F(null, ['pp'], [], null),
            comp: [HE, HE], layers: [['He', 0.1], ['H', 1]], burns: [['pp', 0.1, 0.13]], lum: 'III' }));
        wdM = 0.2 + 0.4 * (m - 0.25);
      }
      const R = this.wdRadius(wdM);
      st.push(S('whiteDwarf', 'whiteDwarf', 'Heliumwitte dwerg', 1e11, [RT(0, R, 1.5e4, wdM), RT(0.01, R, 9000, wdM), RT(0.1, R, 5500, wdM), RT(1, R, 3000, wdM)],
        { params: { variant: 'He' }, infoId: 'whiteDwarf.He', tc: [[0, 3e7], [0.1, 5e6], [1, 1e6]], fusion: F(null, [], [], 'cooling'),
          comp: [HE, HE], layers: [['He', 0.97], ['H', 1]], burns: [], visual: 'wd', lum: 'D' }));
      st.push(S('blackDwarf', 'blackDwarf', 'Zwarte dwerg', 1e15, [RT(0, R, 3000, wdM), RT(1, R, 5, wdM)],
        { tc: [[0, 1e6], [1, 10]], fusion: F(null, [], [], 'cooling'), comp: [HE, HE], layers: [['He', 0.97], ['H', 1]], visual: 'blackDwarf', lum: 'D', hr: false }));
      return this.finish(m, lowZ, cat, st, ms, { type: 'heliumwitte dwerg', mass: wdM });
    }

    st.push(S('mainSequence', 'mainSequence', 'Hoofdreeks', ms,
      [LR(0, 0.8 * z.L, 0.9 * z.R), LR(0.46, z.L, z.R), LR(1, msEndL * z.L, msEndR * z.R)],
      { tc: [[0, tc0], [1, tc0 * 1.35]], fusion: F(hProc), comp: [PRIM, HE], layers: [['core', coreR], ['H', 1]], burns: [[hProc, 0, coreR]] }));
    const tams = st[st.length - 1].track[2];
    const Ltams = Math.pow(10, tams[1]), Ttams = Math.pow(10, tams[2]);

    // ---------------------------------------------------------------- sun-like: 0,5–8 M☉
    if (cat === 'zonachtig') {
      const low = m < 2;
      const mwd = this.wdMass(m);
      const one = m >= 7;
      const shellH = m < 1.3 ? 'pp' : 'cno';
      const tcSub = Math.max(3e7, tc0 * 1.6);
      st.push(S('subgiant', 'redGiant', 'Subreus', ms * (low ? 0.12 : 0.012),
        low ? [LT(0, Ltams, Ttams), LT(1, 2.6 * z.L, 4900 + (lowZ ? 300 : 0))] : [LT(0, Ltams, Ttams), LT(1, 1.2 * Ltams, 5200)],
        { short: 'Subreus', params: { variant: 'subreus' }, infoId: 'redGiant.subreus', tc: [[0, tc0 * 1.35], [1, tcSub]], fusion: F(null, [shellH]),
          comp: [HE, HE], layers: [['He', 0.12], ['H', 1]], burns: [[shellH, 0.12, 0.16]], lum: 'IV' }));
      const L0 = Math.pow(10, st[st.length - 1].track[1][1]), T0 = Math.pow(10, st[st.length - 1].track[1][2]);
      const Ltip = low ? 2500 : 2.5 * Ltams, Ttip = low ? 3100 + (lowZ ? 500 : 0) : 4200;
      const mRgb = low ? 0.88 * m : 0.98 * m;
      st.push(S('redGiant', 'redGiant', 'Rode reus', ms * (low ? 0.08 : 0.02), [LT(0, L0, T0), LT(0.6, Math.sqrt(L0 * Ltip) * 0.5, (T0 + Ttip) / 2), LT(1, Ltip, Ttip, mRgb)],
        { short: 'Rode reus', params: { variant: 'rodeReus' }, tc: [[0, tcSub], [1, 1e8]], fusion: F(null, ['cno']),
          comp: [HE, HE], layers: [['He', 0.1], ['H', 1]], burns: [['cno', 0.1, 0.13]], lum: 'III', degenerate: low }));
      if (low) {
        st.push(S('heliumFlash', 'heliumFlash', 'Heliumflits', 5e-6, [LT(0, Ltip, Ttip, mRgb), LT(1, Ltip, Ttip, mRgb)],
          { short: 'Heliumflits', minSeconds: 10, tc: [[0, 1e8], [0.4, 3e8], [1, 1.2e8]], fusion: F('triplealpha', ['cno']),
            comp: [HE, C({ He: 0.93, C: 0.05, Z: 0.02 })], layers: [['He', 0.1], ['H', 1]], burns: [['triplealpha', 0.03, 0.07], ['cno', 0.1, 0.13]], lum: 'III', degenerate: true }));
      }
      const Lhb = low ? 50 * Math.pow(m, 0.3) : 1.1 * Ltip, Thb = low ? (lowZ ? 8000 : 4800) : 5000 + 1500 * (m - 2);
      st.push(S('horizontalBranch', 'horizontalBranch', low ? 'Horizontale tak' : 'Heliumfusie in de kern', low ? 1.1e8 : 0.15 * ms,
        low ? [LT(0, Ltip, Ttip, mRgb), LT(0.04, Lhb, Thb, mRgb), LT(1, 1.3 * Lhb, Thb * 0.95, mRgb)]
          : [LT(0, Ltip, Ttip, mRgb), LT(0.1, 0.8 * Ltip, 4600, mRgb), LT(0.5, Lhb, Math.min(Thb, 12000), mRgb), LT(0.9, 1.3 * Ltip, 4800, mRgb), LT(1, 1.5 * Ltip, 4200, mRgb)],
        { short: low ? 'Hor. tak' : 'Heliumkern', params: { variant: low ? 'horizontaleTak' : 'heliumKern' }, infoId: low ? 'horizontalBranch' : 'horizontalBranch.heliumKern',
          tc: [[0, 1.1e8], [1, 1.4e8]], fusion: F('triplealpha', ['cno']), comp: [HE, CO],
          layers: [['core', 0.1], ['He', 0.14], ['H', 1]], burns: [['triplealpha', 0, 0.1], ['cno', 0.14, 0.17]], lum: 'III' }));
      const Lagb = Math.max(3000, 59250 * (mwd - 0.495));
      const Lh = Math.pow(10, st[st.length - 1].track.at(-1)[1]), Th = Math.pow(10, st[st.length - 1].track.at(-1)[2]);
      st.push(S('agb', 'agb', 'Asymptotische reuzentak', U.clamp(1.5e7 * Math.pow(m, -1.5), 5e5, 3e7),
        [LT(0, Lh, Th, mRgb), LT(0.6, 0.4 * Lagb, 3400, 0.9 * mRgb), LT(1, Lagb, 3000, mwd + 0.05)],
        { short: 'AGB', tc: [[0, 1.4e8], [1, one ? 7e8 : 2.2e8]], fusion: F(one ? 'carbon' : null, ['triplealpha', 'cno'], ['sprocess']),
          comp: [CO, one ? ONE : CO], layers: [[one ? 'core' : 'CO', 0.08], ['He', 0.11], ['H', 1]],
          burns: [...(one ? [['carbon', 0.02, 0.06]] : []), ['triplealpha', 0.08, 0.1], ['cno', 0.11, 0.13]], lum: 'II', degenerate: true }));
      const coreK = one ? ONE : CO, coreL = one ? 'ONe' : 'CO';
      st.push(S('planetaryNebula', 'planetaryNebula', 'Planetaire nevel', 2.5e4, [LT(0, Lagb, 3000, mwd + 0.05), LT(0.1, Lagb, 10000, mwd), LT(0.6, 0.9 * Lagb, 1e5, mwd), LT(1, 200, 1.2e5, mwd)],
        { short: 'Nevel', tc: [[0, 2e8], [1, 1.2e8]], fusion: F(null, ['cno']), comp: [coreK, coreK],
          layers: [[coreL, 0.85], ['He', 0.93], ['H', 1]], burns: [['cno', 0.93, 0.96]], visual: 'nebula', lum: '' }));
      const R = this.wdRadius(mwd);
      st.push(S('whiteDwarf', 'whiteDwarf', 'Witte dwerg', 1e10, [RT(0, R, 1.2e5, mwd), RT(0.001, R, 5e4, mwd), RT(0.01, R, 1.2e4, mwd), RT(0.1, R, 7000, mwd), RT(1, R, 4000, mwd)],
        { params: { variant: one ? 'ONe' : 'CO' }, infoId: one ? 'whiteDwarf.ONe' : 'whiteDwarf', tc: [[0, 1e8], [0.1, 1e7], [1, 3e6]], fusion: F(null, [], [], 'cooling'),
          comp: [coreK, coreK], layers: [[coreL, 0.96], ['He', 0.99], ['H', 1]], visual: 'wd', lum: 'D' }));
      st.push(S('blackDwarf', 'blackDwarf', 'Zwarte dwerg', 1e15, [RT(0, R, 4000, mwd), RT(1, R, 5, mwd)],
        { tc: [[0, 3e6], [1, 10]], fusion: F(null, [], [], 'cooling'), comp: [coreK, coreK], layers: [[coreL, 0.96], ['He', 0.99], ['H', 1]], visual: 'blackDwarf', lum: 'D', hr: false }));
      return this.finish(m, lowZ, cat, st, ms, { type: one ? 'zuurstof-neon-witte dwerg' : 'koolstof-zuurstof-witte dwerg', mass: mwd });
    }

    // ---------------------------------------------------------------- massive: > 8 M☉
    const wr = cat === 'zeerZwaar' && !lowZ;           // strong winds strip the hydrogen envelope
    const pair = cat === 'paarInstabiliteit';
    const hasH = !wr;
    const Hsh = hasH ? ['cno'] : [];
    const env = hasH ? [['H', 1]] : [['He', 1]];
    const HeB = C({ C: 0.25, O: 0.73, Z: 0.02 });
    const scnLate = wr ? 'wolfRayet' : 'supergiant';
    let Lcur = Ltams, Tcur = Ttams, Mcur = m;
    const push = (id, sceneId, label, dur, pts, x) => { st.push(S(id, sceneId, label, dur, pts, x)); const e = pts.at(-1); Lcur = Math.pow(10, e[1]); Tcur = Math.pow(10, e[2]); Mcur = e[4]; };
    const inertHe = { tc: [[0, tc0 * 1.35], [1, 1.1e8]], fusion: F(null, ['cno']), comp: [HE, HE], layers: [['He', 0.22], ['H', 1]], burns: [['cno', 0.22, 0.25]] };
    if (wr) {
      const mWR = m >= 40 ? 10 + 0.12 * (m - 40) : 0.45 * m;
      let heDur = 0.11 * ms;
      if (m >= 40) {
        push('lbv', 'wolfRayet', 'Lichtkrachtige blauwe veranderlijke', 0.012 * ms, [LT(0, Lcur, Tcur), LT(0.3, 1.1 * Ltams, 20000, 0.85 * m), LT(0.6, 1.15 * Ltams, 9000, 0.75 * m), LT(1, 1.1 * Ltams, 25000, 0.6 * m)],
          Object.assign({ short: 'LBV', params: { variant: 'lbv' }, infoId: 'wolfRayet.lbv', lum: 'Ia' }, inertHe));
      } else {
        // 25–40 M☉: a short red-supergiant phase in which helium ignites, then winds strip the hydrogen envelope
        push('blueSupergiant', 'supergiant', 'Blauwe superreus', 0.02 * ms, [LT(0, Lcur, Tcur), LT(1, 1.2 * Ltams, 10000, 0.95 * m)],
          Object.assign({ short: 'Blauwe superreus', params: { variant: 'blauw' }, infoId: 'supergiant.blauw', lum: 'Ia' }, inertHe));
        push('redSupergiant', 'supergiant', 'Rode superreus', 0.04 * ms, [LT(0, Lcur, Tcur, Mcur), LT(0.2, 1.8 * Ltams, 3800, 0.85 * m), LT(1, 1.8 * Ltams, 3900, 0.65 * m)],
          { short: 'Rode superreus', params: { variant: 'rood' }, infoId: 'supergiant', tc: [[0, 1.1e8], [1, 1.9e8]], fusion: F('triplealpha', ['cno']),
            comp: [HE, C({ He: 0.75, C: 0.14, O: 0.09, Z: 0.02 })], layers: [['core', 0.14], ['He', 0.22], ['H', 1]], burns: [['triplealpha', 0, 0.14], ['cno', 0.22, 0.25]], lum: 'Ia' });
        heDur = 0.07 * ms;
      }
      const cWR = m >= 40 ? HE : C({ He: 0.75, C: 0.14, O: 0.09, Z: 0.02 });
      push('wolfRayet', 'wolfRayet', 'Wolf-Rayetster', heDur, [LT(0, Lcur, Tcur, Mcur), LT(0.1, 0.8 * Ltams, 60000, 0.5 * m), LT(1, 0.7 * Ltams, 110000, mWR)],
        { short: 'Wolf-Rayet', params: { variant: 'wr' }, tc: [[0, m >= 40 ? 1.1e8 : 1.9e8], [1, 2.5e8]], fusion: F('triplealpha'),
          comp: [cWR, HeB], layers: [['core', 0.35], ['He', 1]], burns: [['triplealpha', 0, 0.35]], lum: 'WR' });
    } else {
      const Tblue = pair || lowZ ? 15000 : 10000;
      push('blueSupergiant', 'supergiant', 'Blauwe superreus', 0.03 * ms, [LT(0, Lcur, Tcur), LT(1, 1.2 * Ltams, Tblue, 0.97 * m)],
        Object.assign({ short: 'Blauwe superreus', params: { variant: 'blauw' }, infoId: 'supergiant.blauw', lum: 'Ia' }, inertHe));
      const stayBlue = pair || lowZ;
      push('redSupergiant', 'supergiant', stayBlue ? 'Heliumfusie (blauwe superreus)' : 'Rode superreus', 0.1 * ms,
        stayBlue ? [LT(0, Lcur, Tcur, Mcur), LT(1, 1.5 * Ltams, 12000, 0.95 * m)] : [LT(0, Lcur, Tcur, Mcur), LT(0.15, 2 * Ltams, 3800, 0.95 * m), LT(1, 2.2 * Ltams, 3600, 0.85 * m)],
        { short: stayBlue ? 'Helium' : 'Rode superreus', params: { variant: stayBlue ? 'blauw' : 'rood' }, infoId: stayBlue ? 'supergiant.blauw' : 'supergiant',
          tc: [[0, 1.1e8], [1, 2.2e8]], fusion: F('triplealpha', Hsh), comp: [HE, HeB],
          layers: [['core', 0.14], ['He', 0.22], ['H', 1]], burns: [['triplealpha', 0, 0.14], ['cno', 0.22, 0.25]], lum: 'Ia' });
    }
    const late = (id, label, short, dur, L1, tc, fus, comp, layers, burns, infoId, variant) => push(id, scnLate, label, dur,
      [LT(0, Lcur, Tcur, Mcur), LT(1, L1, Tcur, Mcur)],
      { short, params: { variant: wr ? 'wr' : variant }, infoId, tc, fusion: fus, comp, layers, burns, lum: wr ? 'WR' : 'Ia' });
    const shHe = hasH ? [['triplealpha', 0.12, 0.135], ['cno', 0.2, 0.215]] : [['triplealpha', 0.12, 0.135]];
    const lyr = (...inner) => [...inner, ['He', 0.2], ...env];
    const vPre = wr || lowZ || pair ? 'blauw' : 'rood';
    late('carbonBurning', 'Koolstoffusie', 'Koolstof', 2000 * Math.pow(m / 15, -2.63), Lcur * 1.05, [[0, 8e8], [1, 9e8]],
      F('carbon', ['triplealpha', ...Hsh]), [HeB, ONE], lyr(['core', 0.07], ['CO', 0.12]), [['carbon', 0, 0.07], ...shHe], 'evo.koolstof', vPre);
    if (pair) {
      // low metallicity, ≥ ~130 M☉: the oxygen core becomes unstable through pair production
      push('pairInstability', 'pairInstability', 'Paarinstabiliteitssupernova', 2, [LT(0, Lcur, Tcur, Mcur), LT(0.03, 3e9, 12000, 0), LT(0.3, 1e9, 8000, 0), LT(1, 3e7, 6000, 0)],
        { short: 'Supernova', params: { variant: 'explosie' }, minSeconds: 14, tc: [[0, 1.5e9], [0.02, 3.5e9], [1, 1e8]], fusion: F('pair', [], ['explosive']),
          comp: [ONE, C({ Si: 0.3, Fe: 0.6, O: 0.1 })], layers: [['core', 0.5], ['CO', 0.7], ['He', 1]], burns: [['explosive', 0, 0.6]], visual: 'pairSN', lum: '' });
      push('pairRest', 'pairInstability', 'Er blijft niets over', 1e5, [LT(0, 3e7, 6000, 0), LT(1, 1e-3, 5000, 0)],
        { short: 'Niets', params: { variant: 'rest' }, infoId: 'pairInstability.rest', tc: [[0, 1e4], [1, 100]], fusion: F(null, [], [], 'void'),
          comp: null, layers: [], burns: [], visual: 'void', lum: '', hr: false });
      return this.finish(m, lowZ, cat, st, ms, { type: 'niets (de ster wordt volledig verscheurd)', mass: 0 });
    }
    late('neonBurning', 'Neonfusie', 'Neon', 0.8, Lcur * 1.02, [[0, 1.5e9], [1, 1.65e9]],
      F('neon', ['carbon', 'triplealpha', ...Hsh]), [ONE, C({ O: 0.75, Mg: 0.14, Si: 0.09, Z: 0.02 })], lyr(['core', 0.05], ['ONe', 0.08], ['CO', 0.12]),
      [['neon', 0, 0.05], ['carbon', 0.08, 0.095], ...shHe], 'evo.neon', vPre);
    late('oxygenBurning', 'Zuurstoffusie', 'Zuurstof', m <= 25 ? 2.6 * Math.pow(m / 15, -3.66) : 0.4 * Math.pow(m / 25, -1), Lcur * 1.02, [[0, 1.9e9], [1, 2.3e9]],
      F('oxygen', ['neon', 'carbon', 'triplealpha', ...Hsh]), [C({ O: 0.75, Mg: 0.14, Si: 0.09, Z: 0.02 }), C({ Si: 0.9, O: 0.08, Z: 0.02 })],
      lyr(['core', 0.04], ['ONe', 0.08], ['CO', 0.12]), [['oxygen', 0, 0.04], ['neon', 0.065, 0.075], ['carbon', 0.08, 0.095], ...shHe], 'evo.zuurstof', vPre);
    late('siliconBurning', 'Siliciumfusie', 'Silicium', m <= 25 ? 0.049 * Math.pow(m / 15, -6.2) : 0.002 * Math.pow(m / 25, -1), Lcur * 1.01, [[0, 2.8e9], [1, 3.6e9]],
      F('silicon', ['oxygen', 'neon', 'carbon', 'triplealpha', ...Hsh]), [C({ Si: 0.9, O: 0.08, Z: 0.02 }), C({ Fe: 0.97, Si: 0.03 })],
      lyr(['core', 0.03], ['Si', 0.05], ['ONe', 0.08], ['CO', 0.12]), [['silicon', 0, 0.03], ['oxygen', 0.05, 0.06], ['neon', 0.065, 0.072], ['carbon', 0.08, 0.09], ...shHe],
      'supergiant.schillen', 'schillen');

    // ---------------------------------------------------------------- the end: core collapse
    const bh = cat === 'zeerZwaar';
    const direct = bh && (lowZ || m >= 40);
    const mRem = !bh ? 1.25 + 0.025 * (m - 8) : lowZ ? Math.min(45, 0.45 * m) : m >= 40 ? Math.min(20, 10 + 0.1 * (m - 40)) : 5 + 0.33 * (m - 25);
    const variant = direct ? 'direct' : bh ? 'Ibc' : 'II';
    const snTrack = direct
      ? [LT(0, Lcur, Tcur, Mcur), LT(0.2, 0.5 * Lcur, Tcur * 0.8, mRem), LT(1, 1e-6, 3000, mRem)]
      : bh ? [LT(0, Lcur, Tcur, Mcur), LT(0.03, 1.5e9, 15000, mRem), LT(0.25, 3e8, 7000, mRem), LT(1, 3e6, 5000, mRem)]
        : [LT(0, Lcur, Tcur, Mcur), LT(0.02, 1e9, 12000, mRem), LT(0.3, 4e8, 6000, mRem), LT(1, 1e7, 5000, mRem)];
    push('coreCollapse', 'coreCollapse', direct ? 'Directe instorting' : 'Supernova', direct ? 0.05 : 0.6, snTrack,
      { short: direct ? 'Instorting' : 'Supernova', params: { variant }, infoId: variant === 'II' ? 'coreCollapse' : 'coreCollapse.' + variant, minSeconds: 14,
        tc: [[0, 3.6e9], [0.01, 1e11], [1, 1e10]], fusion: F('collapse', [], direct ? [] : ['explosive']), compEnd: 0.01,
        comp: [C({ Fe: 0.97, Si: 0.03 }), C({ n: 1 })], layers: [['core', 0.03], ['Si', 0.05], ['ONe', 0.08], ['CO', 0.12], ['He', 0.2], ...env],
        burns: direct ? [] : [['explosive', 0.03, 0.1]], visual: direct ? 'failedSN' : 'supernova', lum: '', hr: !direct });
    if (!bh) {
      const R = 1.7e-5;
      push('neutronStar', 'neutronStar', 'Neutronenster', 1e9, [RT(0, R, 3e6, mRem), RT(1e-3, R, 1e6, mRem), RT(0.01, R, 3e5, mRem), RT(1, R, 3e4, mRem)],
        { params: { variant: 'pulsar' }, tc: [[0, 1e10], [1e-6, 1e9], [1e-3, 1e8], [1, 1e7]], fusion: F(null, [], [], 'ns'),
          comp: [C({ n: 0.95, Fe: 0.05 }), C({ n: 0.95, Fe: 0.05 })], layers: [['n', 0.92], ['Fe', 1]], visual: 'ns', lum: '', hr: false });
      return this.finish(m, lowZ, cat, st, ms, { type: 'neutronenster', mass: mRem });
    }
    const rs = 2.95 * mRem / 696000;
    push('blackHole', 'blackHole', 'Zwart gat', 1e20, [RT(0, rs, 1, mRem), RT(1, rs, 1, mRem)],
      { params: { variant: 'stellair' }, tc: [[0, 1], [1, 1]], fusion: F(null, [], [], 'bh'), comp: null, layers: [], visual: 'bh', lum: '', hr: false });
    return this.finish(m, lowZ, cat, st, ms, { type: 'zwart gat', mass: mRem });
  },

  /** Add start times + summary fields to a list of stages. */
  finish(mass, lowZ, category, stages, ms, remnant) {
    let t = 0;
    for (const s of stages) { s.start = t; t += s.duration; }
    const birth = stages.find((s) => s.id === 'protostar').start;
    const labels = { bruineDwerg: 'Bruine dwerg', rodeDwerg: 'Rode dwerg', zonachtig: 'Zonachtige ster', zwaar: 'Zware ster', zeerZwaar: 'Zeer zware ster', paarInstabiliteit: 'Reuzenster uit het vroege heelal' };
    const fate = stages.filter((s) => s.kind !== 'formation').map((s) => s.short).filter((x, i, a) => a.indexOf(x) === i).join(' → ');
    return { mass, lowZ, category, categoryLabel: labels[category], fate, summary: '', stages, totalAge: t, birth, msLifetime: category === 'bruineDwerg' ? 0 : ms, remnant };
  },

  stageIndexAt(path, age) {
    const s = path.stages;
    for (let i = s.length - 1; i >= 0; i--) if (age >= s[i].start) return i;
    return 0;
  },

  /** Piecewise-linear interpolation of [[f, value], …] in log space. */
  _logInterp(pts, f) {
    if (f <= pts[0][0]) return pts[0][1];
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k], b = pts[k + 1];
      if (f <= b[0]) { const t = b[0] > a[0] ? (f - a[0]) / (b[0] - a[0]) : 1; return Math.pow(10, U.lerp(Math.log10(a[1]), Math.log10(b[1]), t)); }
    }
    return pts[pts.length - 1][1];
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
    const Tc = this._logInterp(stage.tc, f);
    let comp = null;
    if (stage.comp) {
      comp = {};
      const [c0, c1] = stage.comp;
      const cf = U.clamp(f / (stage.compEnd || 1));
      for (const k of this.ELEMENTS) comp[k] = U.lerp(c0[k] || 0, c1[k] || 0, cf);
    }
    const lum = stage.lum || '';
    return {
      age, stageIndex: i, stage, f, L, T, R, M, logL, logT, spectral: sp, lumClass: lum, mk: lum && lum !== 'WR' ? sp.label + lum : lum === 'WR' ? 'WR' : '',
      starAge: age - path.birth, Tc, fusion: stage.fusion, comp, visual: stage.visual,
    };
  },

  /** Points for the HR diagram: [{logL, logT, stageIndex, f}] (stages with hr:false are left out). */
  sampleTrack(path) {
    const out = [];
    for (const [i, s] of path.stages.entries()) {
      if (s.hr === false) continue;
      for (const p of s.track) out.push({ logL: p[1], logT: p[2], stageIndex: i, f: p[0] });
    }
    return out;
  },
};
