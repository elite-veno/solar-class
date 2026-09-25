/* StarLabScene ('starLab'): one generic scene that shows YOUR star through its whole life, driven
   entirely by the evolution state (T, R, L, stage.visual, f). It is used for every timeline stage
   that has no dedicated scene of its own. The star grows, shrinks and changes colour continuously;
   clouds, disks, jets, winds, nebulae, supernova shells and remnants fade in and out per stage.
   Sizes are compressed (display radius ∝ R^0,33) so a neutron star and a red supergiant both fit;
   a dashed ring shows the size of the Sun at the same scale. */

class StarLabScene extends BaseScene {
  constructor(ctx) {
    super(ctx);
    this.renderSettings = { bloomStrength: 1.0, bloomRadius: 0.6, bloomThreshold: 0.8, exposure: 1.0, backgroundDim: 0.85 };
    this.w = {};        // current weights (0..1) per visual element
    this.dist = 12;     // desired camera distance
    this._v = new THREE.Vector3();
    this._c = new THREE.Color();
  }

  /** Display radius (scene units) for a radius in R☉. */
  static rDisp(R) { return Math.max(0.12, 2 * Math.pow(Math.max(R, 1e-9), 0.33)); }

  build() {
    const P = ParticleSystems;
    this.star = StarFactory.create({ T: 5772, radius: 2, brightness: 1.6, corona: 0.9, coronaScale: 1.7, rotationSpeed: 0.05 });
    this.group.add(this.star);
    this.starPick = this.addPickable(this.star.surface, 'lab.ster', { highlightTarget: this.star });

    // dashed outline of the Sun at the same (compressed) scale
    const pts = [];
    for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0)); }
    const rg = new THREE.BufferGeometry().setFromPoints(pts);
    this.sunRing = new THREE.Line(rg, new THREE.LineDashedMaterial({ color: 0xffd28a, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0.5, depthWrite: false }));
    this.sunRing.computeLineDistances();
    this.sunRing.material.depthTest = false;
    this.sunRing.renderOrder = 10;
    this.sunRing.scale.setScalar(StarLabScene.rDisp(1));
    this.group.add(this.sunRing);
    this.sunLabel = this.addLabel(this.sunRing, 'ui.schaal', { text: Content.ui.lab.sunSize, offset: [0, StarLabScene.rDisp(1) + 0.35, 0] });

    // molecular cloud (cloud → collapse → faint envelope)
    this.cloud = P.createCloud({ count: P.count(16000), radius: 16, scale: [1, 0.7, 1], size: 1.1, alpha: 0.32, colorA: new THREE.Color(0.28, 0.24, 0.42), colorB: new THREE.Color(0.85, 0.5, 0.42), drift: 0.25 });
    this.group.add(this.cloud);
    this.coreGlow = StarFactory.createGlow({ color: new THREE.Color(1, 0.55, 0.3), size: 3, intensity: 1.4 });
    this.group.add(this.coreGlow);

    // protoplanetary disk + jets
    this.disk = P.createDisk({ count: P.count(14000), rIn: 0.9, rOut: 8, thickness: 0.1, colorInner: new THREE.Color(1, 0.72, 0.45), colorOuter: new THREE.Color(0.55, 0.22, 0.16), omega: 1.6, size: 0.16, alpha: 0.55, spiral: 0.25, brightness: 1.1 });
    this.disk.rotation.x = 0.28;
    this.group.add(this.disk);
    this.jets = P.createJet({ count: P.count(4000), length: 15, radius: 0.5, speed: 7, size: 0.26, alpha: 0.55, brightness: 1.0 });
    this.jets.rotation.x = 0.28;
    this.group.add(this.jets);

    // stellar wind (giants, LBV, Wolf-Rayet) — scaled with the star
    this.windGroup = new THREE.Group();
    this.wind = P.createWind({ count: P.count(4000), rIn: 1.05, rOut: 3.2, speed: 0.6, size: 0.07, alpha: 0.4, color: new THREE.Color(1, 0.75, 0.55) });
    this.windGroup.add(this.wind);
    this.group.add(this.windGroup);

    // planetary nebula: inner [O III] shell and outer Hα shell
    this.nebIn = P.createShell({ count: P.count(12000), radius: 4, thickness: 0.5, size: 0.2, alpha: 0.5, brightness: 1.3, squash: [1, 1.3, 1], color: (i, c, r) => c.setRGB(0.3 + 0.2 * r(), 0.85, 0.95) });
    this.nebOut = P.createShell({ count: P.count(12000), radius: 5, thickness: 0.8, size: 0.26, alpha: 0.45, brightness: 1.2, squash: [1, 1.45, 1], color: (i, c, r) => c.setRGB(1, 0.3 + 0.25 * r(), 0.35) });
    this.group.add(this.nebIn, this.nebOut);

    // supernova debris shell + central flash glow
    this.sn = P.createShell({ count: P.count(9000), radius: 3, thickness: 0.6, size: 0.55, alpha: 0.4, brightness: 1.3, clump: 1,
      color: (i, c, r, d) => { const k = r(); if (k < 0.45) c.setRGB(1, 0.35 + 0.3 * r(), 0.18); else if (k < 0.75) c.setRGB(0.45, 0.75, 1); else c.setRGB(1, 0.9, 0.7); } });
    this.group.add(this.sn);
    this.snGlow = StarFactory.createGlow({ color: new THREE.Color(1, 0.78, 0.5), size: 10, intensity: 1.6 });
    this.group.add(this.snGlow);

    // neutron star beams (pulsar)
    this.beamPivot = new THREE.Group();
    this.beamPivot.rotation.z = 0.45;
    this.beams = P.createJet({ count: P.count(2500), length: 7, radius: 0.1, speed: 12, size: 0.16, alpha: 0.5, brightness: 1.1, color: new THREE.Color(0.6, 0.8, 1), colorEnd: new THREE.Color(0.45, 0.45, 1), knots: 0 });
    this.beamPivot.add(this.beams);
    this.spin = new THREE.Group();
    this.spin.add(this.beamPivot);
    this.group.add(this.spin);

    // black hole: shadow, photon-ring glow, hot accretion disk
    this.bh = new THREE.Group();
    this.bhShadow = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    this.bhShadow.scale.setScalar(1);
    this.bhGlow = StarFactory.createGlow({ color: new THREE.Color(1, 0.62, 0.3), size: 4.2, intensity: 1.5 });
    this.bhDisk = P.createDisk({ count: P.count(12000), rIn: 1.55, rOut: 6, thickness: 0.03, colorInner: new THREE.Color(1, 0.93, 0.8), colorOuter: new THREE.Color(0.85, 0.3, 0.1), omega: 4, size: 0.09, alpha: 0.65, brightness: 1.7 });
    this.bhDisk.rotation.x = 1.15;
    this.bh.add(this.bhGlow, this.bhShadow, this.bhDisk);
    this.bhPick = this.addPickable(this.bhShadow, 'blackHole', { priority: 1 });
    this.group.add(this.bh);

    // click target for clouds, nebulae and explosions
    this.proxy = this.makeProxy(1, 'lab.ster');
    this.proxyPick = this.proxy.userData.pickEntry;
  }

  enter(params) {
    this.userMoved = false;
    this.lastVisual = null;
    this._path = params.path;
    this.flashed = null;
    this.snR = 3;
    for (const k of ['star', 'cloud', 'core', 'disk', 'jets', 'wind', 'neb', 'sn', 'ns', 'bh']) this.w[k] = 0;
    const st = this.app.state;
    if (st) { this.applyState(st, 0, true); this.dist = this.targetDistance(st); }
  }

  /** Same scene, new params: a new mass (new path) snaps all effects to the new star at once. */
  onParams(params) {
    if (params.path && params.path !== this._path) { this._path = params.path; this.snap = true; this.userMoved = false; this.snR = 3; }
  }

  getCameraPreset() {
    const d = this.app.state ? this.targetDistance(this.app.state) : 12;
    return { position: [0, d * 0.22, d], target: [0, 0, 0], minDistance: 0.35, maxDistance: 600, fov: 50 };
  }

  /** How far the camera should be to frame the current state nicely. */
  targetDistance(s) {
    // portrait screens (phones) see less sideways: step back a little further
    const asp = this.sm.width / Math.max(1, this.sm.height);
    return this._targetDistance(s) * (asp < 1 ? Math.min(1.9, 0.85 / asp) : 1);
  }

  _targetDistance(s) {
    const r = StarLabScene.rDisp(s.R);
    const v = s.visual;
    // stay back while the supernova debris is still fading, then fly in to the remnant
    if ((v === 'ns' || v === 'bh') && this.w.sn > 0.04) return U.clamp(this.snR * 2.4, 12, 90);
    if (v === 'cloud') return 44;
    if (v === 'collapse') return U.lerp(44, 20, U.ease.inOutCubic(s.f));
    if (v === 'protostar' || v === 'jets' || v === 'ttauri') return 24;
    if (v === 'nebula') return Math.max(10, this.nebR(s) * 2.6);
    if (v === 'supernova' || v === 'pairSN' || v === 'void') return U.clamp(this.snR * 2.4, 12, 90);
    if (v === 'bh' || v === 'failedSN') return 13;
    if (v === 'ns' || v === 'wd' || v === 'blackDwarf') return 7;
    return U.clamp(r * 5.5, 9, 140);
  }

  nebR(s) { return U.lerp(2.5, 13, Math.pow(s.f, 0.6)); }

  /** Target weights per element for a state. */
  targets(s) {
    const v = s.visual, f = s.f;
    const T = { star: 0, cloud: 0, core: 0, disk: 0, jets: 0, wind: 0, neb: 0, sn: 0, ns: 0, bh: 0 };
    switch (v) {
      case 'cloud': T.cloud = 1; break;
      case 'collapse': T.cloud = 1; T.core = U.smoothstep(0.55, 1, f); break;
      case 'protostar': T.cloud = 0.35; T.core = 0.6; T.star = 0.8; T.disk = 1; T.jets = 0.35; break;
      case 'jets': T.cloud = 0.2; T.star = 1; T.disk = 1; T.jets = 1; break;
      case 'ttauri': T.star = 1; T.disk = 1 - 0.7 * f; T.jets = 0.3 * (1 - f); break;
      case 'nebula': T.star = 1; T.neb = U.smoothstep(0, 0.08, f) * (1 - 0.6 * U.smoothstep(0.7, 1, f)); break;
      case 'supernova': case 'pairSN': T.star = f < 0.015 ? 1 : 0; T.sn = 1; break;
      case 'failedSN': T.star = 1 - U.smoothstep(0.05, 0.35, f); T.bh = U.smoothstep(0.2, 0.5, f); break;
      case 'void': T.sn = 0.45 * (1 - f); break;
      case 'ns': T.star = 1; T.ns = 1; break;
      case 'bh': T.bh = 1; break;
      default: T.star = 1;
    }
    const id = s.stage.id;
    if (id === 'agb' || id === 'lbv' || id === 'wolfRayet' || id === 'redSupergiant' || (s.stage.lum === 'WR')) T.wind = 1;
    return T;
  }

  update(dt, state) {
    this.star.update(dt);
    if (!state || state.compare) return;
    this.applyState(state, dt, !!this.snap);
    this.snap = false;
  }

  applyState(s, dt, instant) {
    const T = this.targets(s);
    const v = s.visual;
    if (v !== this.lastVisual) {
      if (this.lastVisual && !['star', 'ttauri', 'wd', 'bd'].includes(v)) this.userMoved = false;
      if ((v === 'supernova' || v === 'pairSN') && this.flashed !== s.stage && s.f < 0.1) { this.flashed = s.stage; this.sm.flash({ intensity: 0.85, duration: 1.8 }); this.snR = StarLabScene.rDisp(s.stage.track[0][3]); }
      this.lastVisual = v;
    }
    // smooth weights (explosion debris fades slowly into the remnant stage)
    const k = instant || this.reducedMotion ? 1 : 1 - Math.exp(-dt * 3);
    for (const key in T) {
      const rate = key === 'sn' && T.sn < this.w.sn ? 1 - Math.exp(-dt * (v === 'void' ? 0.35 : 0.9)) : k;
      this.w[key] = U.lerp(this.w[key] ?? 0, T[key], instant ? 1 : rate);
    }
    const w = this.w;

    // the star
    const r = StarLabScene.rDisp(s.R) * (v === 'protostar' || v === 'jets' ? 0.55 : 1);
    this.star.visible = w.star > 0.01;
    if (this.star.visible) {
      this.star.setRadius(r);
      this.star.setTemperature(s.T);
      const bright = U.clamp(0.1 + (s.logT - 2.4) * 0.75, 0.04, 1.5);
      this.star.uniforms.uBrightness.value = bright * w.star;
      this.star.corona.material.opacity = w.star * (v === 'blackDwarf' ? 0.05 : v === 'bd' ? 0.35 : 1);
      this.star.surface.material.transparent = w.star < 0.99;
      this.star.surface.material.opacity = w.star;
    }
    this.starPick.infoId = s.stage.infoId;
    this.starPick.enabled = this.star.visible;

    // Sun reference ring: only when the star is noticeably smaller or larger than the Sun
    const sunR = StarLabScene.rDisp(1);
    const showSun = this.star.visible && (r / sunR > 1.35 || r / sunR < 0.7) && v !== 'nebula';
    this.sunRing.visible = showSun;
    this.sunRing.quaternion.copy(this.sm.camera.quaternion);
    if (this.sunLabel.handle) this.sunLabel.handle.setVisible(showSun && Settings.labels);

    // cloud + collapse
    this.cloud.visible = w.cloud > 0.01;
    if (this.cloud.visible) {
      const sc = v === 'collapse' ? U.lerp(1, 0.2, U.ease.inCubic(s.f)) : v === 'cloud' ? 1 : 0.28;
      this.cloud.scale.setScalar(this.cloud.scale.x + (sc - this.cloud.scale.x) * (instant ? 1 : k));
      this.cloud.material.uniforms.uOpacity.value = w.cloud;
    }
    this.coreGlow.visible = w.core > 0.01;
    this.coreGlow.material.opacity = w.core;
    this.coreGlow.scale.setScalar(2 + 4 * w.core);

    // disk + jets
    this.disk.visible = w.disk > 0.01;
    this.disk.material.uniforms.uOpacity.value = w.disk;
    this.jets.visible = w.jets > 0.01;
    this.jets.material.uniforms.uIntensity.value = w.jets;

    // wind
    this.windGroup.visible = w.wind > 0.01;
    this.windGroup.scale.setScalar(r);
    this.wind.material.uniforms.uOpacity.value = w.wind * (s.stage.lum === 'WR' ? 0.9 : 0.55);
    if (s.stage.lum === 'WR') this.wind.material.uniforms.uWindColor.value.setRGB(0.55, 0.75, 1);
    else this.wind.material.uniforms.uWindColor.value.setRGB(1, 0.72, 0.5);

    // planetary nebula
    const nb = w.neb > 0.01;
    this.nebIn.visible = this.nebOut.visible = nb;
    if (nb) {
      const R = this.nebR(s);
      this.nebIn.material.uniforms.uRadius.value = R * 0.72;
      this.nebOut.material.uniforms.uRadius.value = R;
      this.nebIn.material.uniforms.uOpacity.value = this.nebOut.material.uniforms.uOpacity.value = w.neb;
    }

    // supernova
    const snOn = w.sn > 0.01;
    this.sn.visible = snOn;
    this.snGlow.visible = snOn && (v === 'supernova' || v === 'pairSN');
    if (snOn) {
      if (v === 'supernova' || v === 'pairSN') {
        const grow = U.ease.outCubic(U.clamp(s.f / 0.9));
        this.snR = Math.max(this.snR, U.lerp(StarLabScene.rDisp(s.stage.track[0][3]), 34, grow));
      } else if (!this.reducedMotion) this.snR += dt * 0.8;
      this.sn.material.uniforms.uRadius.value = this.snR;
      this.sn.material.uniforms.uThickness.value = this.snR * 0.12;
      this.sn.material.uniforms.uOpacity.value = w.sn;
      const glow = v === 'supernova' || v === 'pairSN' ? Math.max(0, 1 - s.f * 1.5) : 0;
      this.snGlow.material.opacity = glow;
      this.snGlow.scale.setScalar(3 + this.snR * 0.45);
    }

    // neutron star beams
    this.spin.visible = w.ns > 0.01;
    if (this.spin.visible) {
      this.beams.material.uniforms.uIntensity.value = w.ns;
      if (!instant) this.spin.rotation.y += dt * (this.reducedMotion ? 0.4 : 2.2);
    }

    // black hole
    this.bh.visible = w.bh > 0.01;
    this.bhPick.enabled = this.bh.visible;
    if (this.bh.visible) {
      this.bhShadow.material.transparent = w.bh < 0.99;
      this.bhShadow.material.opacity = w.bh;
      this.bhGlow.material.opacity = w.bh;
      this.bhDisk.material.uniforms.uOpacity.value = w.bh;
    }

    // click proxy follows the largest visible element
    const pr = v === 'cloud' || v === 'collapse' ? 16 * this.cloud.scale.x : v === 'nebula' ? this.nebR(s) : snOn ? this.snR : v === 'protostar' || v === 'jets' || v === 'ttauri' ? 8 : 0;
    this.proxy.visible = pr > 0;
    this.proxy.scale.setScalar(Math.max(pr, 0.01));
    this.proxyPick.infoId = s.stage.infoId;
    this.proxyPick.enabled = pr > 0;

    // camera: keep the object framed while it grows or shrinks, until the user moves the camera
    this.autoFrame(s, dt, instant);
  }

  autoFrame(s, dt, instant) {
    const sm = this.sm;
    if (sm.userInteracting) this.userMoved = true;
    const want = this.targetDistance(s);
    if (this.userMoved || sm.tween || instant) { this.dist = want; return; }
    const t = sm.controls.target, cam = sm.camera.position;
    const off = this._v.copy(cam).sub(t);
    const d = off.length();
    if (d < 1e-4) return;
    const nd = U.lerp(d, want, 1 - Math.exp(-dt * (this.reducedMotion ? 0.6 : 1.4)));
    if (Math.abs(nd - d) > 1e-4) cam.copy(t).add(off.multiplyScalar(nd / d));
    this.dist = want;
  }
}

Registry.registerScene('starLab', StarLabScene, {
  title: 'Jouw ster', kicker: 'Sterrenlab', group: 'evolutie', infoId: 'lab.ster', badges: ['schaal', 'tijd'],
});
