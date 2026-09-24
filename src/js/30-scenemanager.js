/* SceneManager: renderer, camera + OrbitControls, HDR post-processing (bloom, outline),
   the deep-space background, picking (hover/click), 3D labels and camera transitions.
   BaseScene: the base class every 3D scene extends (see ARCHITECTURE.md). */

class Background {
  constructor(sm) {
    this.sm = sm;
    this.group = new THREE.Group();
    this.group.name = 'background';
    this.layers = [];
    this.dim = 1;
    this.uTwinkle = { value: 1 };
    this.uDim = { value: 1 };
    this.bandNormal = new THREE.Vector3(0.22, 0.93, -0.3).normalize();
    this.centerDir = new THREE.Vector3(0.95, -0.12, 0.28).normalize();
    this.buildStars();
  }

  buildStars() {
    for (const l of this.layers) { this.group.remove(l.points); l.points.geometry.dispose(); l.points.material.dispose(); }
    this.layers = [];
    const total = Q().stars;
    const defs = [
      { frac: 0.58, radius: 9000, follow: 1.0, size: [0.7, 1.7], seed: 21 },
      { frac: 0.3, radius: 5200, follow: 0.985, size: [0.9, 2.2], seed: 22 },
      { frac: 0.12, radius: 2600, follow: 0.94, size: [1.1, 3.0], seed: 23 },
    ];
    const tmp = new THREE.Vector3(), c = new THREE.Color(), white = new THREE.Color(1, 1, 1);
    for (const d of defs) {
      const n = Math.round(total * d.frac);
      const r = U.rng(d.seed);
      const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n), seed = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        if (r() < 0.42) { // concentrate towards the Milky Way band
          U.randDir(r, tmp);
          const along = tmp.clone().sub(this.bandNormal.clone().multiplyScalar(tmp.dot(this.bandNormal))).normalize();
          const lat = U.gauss(r) * 0.16;
          tmp.copy(along).multiplyScalar(Math.cos(lat)).addScaledVector(this.bandNormal, Math.sin(lat)).normalize();
        } else U.randDir(r, tmp);
        tmp.multiplyScalar(d.radius * (0.9 + r() * 0.2));
        pos.set([tmp.x, tmp.y, tmp.z], i * 3);
        const x = r();
        const T = x < 0.45 ? U.lerp(3200, 5000, r()) : x < 0.78 ? U.lerp(5000, 7000, r()) : x < 0.94 ? U.lerp(7000, 12000, r()) : U.lerp(12000, 30000, r());
        U.blackbody(T, c).lerp(white, 0.25);
        const mag = Math.pow(r(), 6); // most stars are faint
        const b = 0.35 + 1.9 * mag;
        col.set([c.r * b, c.g * b, c.b * b], i * 3);
        size[i] = U.lerp(d.size[0], d.size[1], Math.pow(r(), 3)) + (mag > 0.6 ? 1.2 : 0);
        seed[i] = r();
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
      g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
      g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
      const m = new THREE.ShaderMaterial({
        uniforms: { uTime: Shaders.uTime, uPR: Shaders.uPixelRatio, uTwinkle: this.uTwinkle, uDim: this.uDim },
        vertexShader: /* glsl */`
          uniform float uTime; uniform float uPR; uniform float uTwinkle;
          attribute vec3 aColor; attribute float aSize; attribute float aSeed;
          varying vec3 vC;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            float tw = 1.0 - uTwinkle * 0.45 * step(0.55, aSeed) * (0.5 + 0.5 * sin(uTime * (1.3 + 4.0 * aSeed) + aSeed * 91.0));
            vC = aColor * tw;
            gl_PointSize = aSize * uPR * 1.6;
          }`,
        fragmentShader: /* glsl */`
          uniform float uDim; varying vec3 vC;
          void main() {
            float d = length(gl_PointCoord - 0.5) * 2.0;
            float a = exp(-d * d * 5.0);
            if (a < 0.01) discard;
            gl_FragColor = vec4(vC * uDim, a);
          }`,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      });
      const pts = new THREE.Points(g, m);
      pts.frustumCulled = false;
      pts.renderOrder = -9;
      this.group.add(pts);
      this.layers.push({ points: pts, follow: d.follow });
    }
  }

  /** Milky Way band + faint nebulae, baked once into a cube texture used as scene.background. */
  bakeSky(renderer) {
    const skyScene = new THREE.Scene();
    const band = new THREE.Mesh(new THREE.SphereGeometry(100, 64, 32), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { uN: { value: this.bandNormal }, uC: { value: this.centerDir } },
      vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: /* glsl */`
        ${Shaders.noise}
        uniform vec3 uN; uniform vec3 uC; varying vec3 vD;
        void main() {
          vec3 d = normalize(vD);
          float lat = asin(clamp(dot(d, uN), -1.0, 1.0));
          float n = fbm5(d * 3.2) * 0.5 + 0.5;
          float band = exp(-pow(lat / (0.2 + 0.08 * n), 2.0));
          float toC = max(0.0, dot(d, uC));
          float bulge = exp(-pow(lat / 0.3, 2.0)) * pow(toC, 5.0);
          float dust = smoothstep(0.1, 0.55, fbm5(d * 7.0 + 3.0) * 0.5 + 0.5) * exp(-pow((lat - 0.02) / 0.06, 2.0));
          vec3 cool = vec3(0.52, 0.58, 0.8), warm = vec3(1.0, 0.8, 0.58);
          vec3 col = mix(cool, warm, clamp(bulge * 2.5 + 0.2 * toC, 0.0, 1.0));
          float I = (band * (0.35 + 0.9 * n * n) + bulge * 1.6) * (1.0 - 0.85 * dust);
          float grain = snoise(d * 90.0) * 0.5 + 0.5;
          I *= 0.75 + 0.5 * grain;
          gl_FragColor = vec4(col * I * 0.07, 1.0);
        }`,
    }));
    skyScene.add(band);
    const r = U.rng(99);
    const nebColors = [[0.9, 0.25, 0.35], [0.25, 0.7, 0.75], [0.35, 0.45, 0.95], [0.85, 0.35, 0.6], [0.95, 0.55, 0.3]];
    for (let i = 0; i < 5; i++) {
      const dir = U.randDir(r, new THREE.Vector3());
      const q = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        uniforms: { uCol: { value: new THREE.Color(...nebColors[i]) }, uSeed: { value: r() * 50 } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: /* glsl */`
          ${Shaders.noise}
          uniform vec3 uCol; uniform float uSeed; varying vec2 vUv;
          void main() {
            vec2 p = vUv - 0.5;
            float fall = smoothstep(0.5, 0.05, length(p));
            float n = fbm5(vec3(p * 3.5, uSeed)) * 0.5 + 0.5;
            float w = fbm3(vec3(p * 9.0, uSeed + 7.0)) * 0.5 + 0.5;
            float a = fall * pow(n, 2.2) * (0.6 + 0.6 * w);
            gl_FragColor = vec4(uCol * a * 0.09, 1.0);
          }`,
      }));
      q.position.copy(dir.multiplyScalar(80));
      q.lookAt(0, 0, 0);
      q.scale.setScalar(20 + r() * 26);
      skyScene.add(q);
    }
    const size = Settings.quality === 'laag' ? 512 : 1024;
    const rt = new THREE.WebGLCubeRenderTarget(size, { type: THREE.HalfFloatType, generateMipmaps: false });
    const cam = new THREE.CubeCamera(0.1, 1000, rt);
    cam.update(renderer, skyScene);
    skyScene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
    if (this.skyRT) this.skyRT.dispose();
    this.skyRT = rt;
    return rt.texture;
  }

  setDim(v) { this.dim = v; this.uDim.value = v; }

  update(camera) {
    for (const l of this.layers) l.points.position.copy(camera.position).multiplyScalar(l.follow);
    this.uTwinkle.value = Settings.reducedMotion ? 0 : 1;
  }
}

/** HTML labels anchored to 3D objects. Each label is a real <button>, so it is keyboard accessible. */
class LabelLayer {
  constructor(root, sm) { this.root = root; this.sm = sm; this.items = []; this._v = new THREE.Vector3(); }
  add({ object = null, position = null, offset = null, text, infoId, color = null, always = false }) {
    const el = U.el('button', { class: 'scene-label' + (always ? ' always' : ''), type: 'button', 'aria-label': `${text}: uitleg openen` }, text);
    if (color) el.style.setProperty('--dot', color);
    el.addEventListener('click', (e) => { e.stopPropagation(); bus.emit('pick', { infoId, source: 'label' }); });
    el.addEventListener('pointerenter', () => this.sm.setHoverByInfo(infoId, true));
    el.addEventListener('pointerleave', () => this.sm.setHoverByInfo(infoId, false));
    el.addEventListener('focus', () => this.sm.setHoverByInfo(infoId, true));
    el.addEventListener('blur', () => this.sm.setHoverByInfo(infoId, false));
    this.root.append(el);
    const item = { el, object, position: position ? new THREE.Vector3().copy(position) : null, offset: offset ? new THREE.Vector3().copy(offset) : null, infoId, visible: true };
    item.setText = (t) => { el.textContent = t; el.setAttribute('aria-label', `${t}: uitleg openen`); };
    item.setVisible = (v) => { item.visible = v; el.style.display = v ? '' : 'none'; };
    item.remove = () => { el.remove(); this.items = this.items.filter((x) => x !== item); };
    this.items.push(item);
    return item;
  }
  clear() { for (const i of this.items) i.el.remove(); this.items = []; }
  setHot(infoId, hot) { for (const i of this.items) if (i.infoId === infoId) i.el.classList.toggle('hot', hot); }
  update() {
    const cam = this.sm.camera, w = this.sm.width, h = this.sm.height, v = this._v;
    for (const it of this.items) {
      if (!it.visible) continue;
      if (it.object) { it.object.getWorldPosition(v); if (!it.object.visible && !it.always) { it.el.classList.add('behind'); continue; } } else v.set(0, 0, 0);
      if (it.position) v.add(it.position);
      if (it.offset) v.add(it.offset);
      v.project(cam);
      const behind = v.z > 1 || v.z < -1 || Math.abs(v.x) > 1.2 || Math.abs(v.y) > 1.2;
      it.el.classList.toggle('behind', behind);
      if (!behind) it.el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px) translate(-50%, -50%)`;
    }
  }
}

class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth || innerWidth;
    this.height = container.clientHeight || innerHeight;
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', stencil: false });
    r.setClearColor(0x000000, 1);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.0;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.info.autoReset = false;
    container.appendChild(r.domElement);
    r.domElement.setAttribute('tabindex', '0');
    r.domElement.setAttribute('aria-label', '3D-weergave. Gebruik de knop "In beeld" of de labels om onderdelen met het toetsenbord te kiezen.');

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.02, 40000);
    this.camera.position.set(0, 3, 14);
    this.stage = new THREE.Group();
    this.stage.name = 'stage';
    this.scene.add(this.stage);

    this.controls = new OrbitControls(this.camera, r.domElement);
    Object.assign(this.controls, { enableDamping: true, dampingFactor: 0.07, rotateSpeed: 0.55, zoomSpeed: 0.9, panSpeed: 0.6, autoRotateSpeed: 0.35 });
    this.controls.addEventListener('start', () => { this.tween = null; this.userInteracting = true; });
    this.controls.addEventListener('end', () => { this.userInteracting = false; });

    this.background = new Background(this);
    this.scene.add(this.background.group);
    this.scene.background = this.background.bakeSky(r);
    this.scene.backgroundIntensity = 1;

    this.dynScale = 1;
    this.applyPixelRatio();
    this.buildComposer();

    this.labels = new LabelLayer(document.getElementById('labels'), this);
    this.pickables = [];
    this.hovered = null;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.params.Points.threshold = 0.15;
    this.raycaster.params.Line.threshold = 0.1;
    this.pointer = new THREE.Vector2(9, 9);
    this.pointerPx = { x: 0, y: 0 };
    this.needsPick = false;
    this.tooltip = document.getElementById('tooltip');
    this.clock = new THREE.Clock();
    this.fps = 60; this._fpsAcc = 0; this._fpsN = 0; this._slowT = 0; this._fastT = 0;
    this.onUpdate = null;
    this.tween = null;
    this.bindPointer();
    new ResizeObserver(() => this.resize()).observe(container);
    bus.on('settings', ({ key }) => { if (key === 'quality') this.applyQuality(); });
  }

  // ------------------------------------------------------------------ rendering setup
  applyPixelRatio() {
    const pr = Math.min(window.devicePixelRatio || 1, Q().pixelRatio) * this.dynScale;
    this.pixelRatio = Math.max(0.5, pr);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(this.width, this.height, false);
    Shaders.uViewH.value = this.height * this.pixelRatio;
    Shaders.uPixelRatio.value = this.pixelRatio;
  }

  buildComposer() {
    const q = Q();
    const w = Math.floor(this.width * this.pixelRatio), h = Math.floor(this.height * this.pixelRatio);
    const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: q.antialias ? 4 : 0 });
    if (this.composer) this.composer.dispose();
    this.composer = new EffectComposer(this.renderer, rt);
    this.composer.setPixelRatio(this.pixelRatio);
    this.composer.setSize(this.width, this.height);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    this.extraPasses = this.extraPasses || [];
    for (const p of this.extraPasses) this.composer.addPass(p);
    this.outlinePass = null;
    if (q.outline) {
      const op = new OutlinePass(new THREE.Vector2(this.width, this.height), this.scene, this.camera);
      Object.assign(op, { edgeStrength: 3.2, edgeGlow: 0.6, edgeThickness: 1.4, pulsePeriod: 0 });
      op.visibleEdgeColor.set(0xffd08a); op.hiddenEdgeColor.set(0x6a5030);
      op.enabled = false;
      this.outlinePass = op;
      this.composer.addPass(op);
    }
    const br = q.bloomRes;
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(this.width * br, this.height * br), 0.9, 0.55, 0.82);
    this.composer.addPass(this.bloomPass);
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
    this.setRenderSettings(this.renderSettings || {});
  }

  /** Scene-specific post settings: { bloomStrength, bloomRadius, bloomThreshold, exposure, backgroundDim } */
  setRenderSettings(s = {}) {
    this.renderSettings = s;
    const q = Q();
    this.bloomPass.strength = (s.bloomStrength ?? 0.9) * q.bloomStrength;
    this.bloomPass.radius = s.bloomRadius ?? 0.55;
    this.bloomPass.threshold = s.bloomThreshold ?? 0.82;
    this.renderer.toneMappingExposure = s.exposure ?? 1.0;
    this.background.setDim(s.backgroundDim ?? 1);
    this.scene.backgroundIntensity = s.backgroundDim ?? 1;
  }

  /** Add a post-processing pass (inserted before outline/bloom/output). Remove it again in scene.exit(). */
  addPass(pass) { this.extraPasses.push(pass); this.composer.insertPass(pass, 1 + this.extraPasses.length - 1); return pass; }
  removePass(pass) { this.extraPasses = this.extraPasses.filter((p) => p !== pass); this.composer.removePass(pass); }

  applyQuality() {
    this.applyPixelRatio();
    this.background.buildStars();
    this.scene.background = this.background.bakeSky(this.renderer);
    this.buildComposer();
  }

  resize() {
    this.width = this.container.clientWidth || innerWidth;
    this.height = this.container.clientHeight || innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.applyPixelRatio();
    this.composer.setPixelRatio(this.pixelRatio);
    this.composer.setSize(this.width, this.height);
    if (this.outlinePass) this.outlinePass.setSize(this.width * this.pixelRatio, this.height * this.pixelRatio);
    bus.emit('resize', { width: this.width, height: this.height });
  }

  /** Render the background (stars + Milky Way) into a cube map, e.g. for gravitational lensing. */
  captureEnvironment(size = 1024) {
    const rt = new THREE.WebGLCubeRenderTarget(size, { type: THREE.HalfFloatType, generateMipmaps: false });
    const cc = new THREE.CubeCamera(1, 40000, rt);
    const stageVis = this.stage.visible;
    this.stage.visible = false;
    const saved = this.background.layers.map((l) => l.points.position.clone());
    for (const l of this.background.layers) l.points.position.set(0, 0, 0);
    const oldDim = this.background.uDim.value;
    this.background.uDim.value = 1;
    cc.update(this.renderer, this.scene);
    this.background.uDim.value = oldDim;
    this.background.layers.forEach((l, i) => l.points.position.copy(saved[i]));
    this.stage.visible = stageVis;
    return rt;
  }

  // ------------------------------------------------------------------ camera
  /** Fly the camera. preset: { position:[x,y,z]|Vector3, target, fov, minDistance, maxDistance }. */
  flyTo(preset, duration = 2.0, instant = false) {
    const toV = (a) => (a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(...a));
    const p = toV(preset.position || [0, 2, 12]);
    const t = toV(preset.target || [0, 0, 0]);
    this.controls.minDistance = preset.minDistance ?? 0.1;
    this.controls.maxDistance = preset.maxDistance ?? 5000;
    if (preset.fov && preset.fov !== this.camera.fov) { this.camera.fov = preset.fov; this.camera.updateProjectionMatrix(); }
    if (instant || Settings.reducedMotion || duration <= 0) {
      this.tween = null;
      this.camera.position.copy(p); this.controls.target.copy(t); this.controls.update();
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.tween = { p0: this.camera.position.clone(), t0: this.controls.target.clone(), p1: p, t1: t, time: 0, duration, resolve };
    });
  }

  stepTween(dt) {
    const tw = this.tween;
    if (!tw) return;
    tw.time += dt;
    const k = U.ease.inOutCubic(Math.min(1, tw.time / tw.duration));
    // arc slightly outward so the camera does not cut through objects
    const mid = tw.p0.clone().lerp(tw.p1, k);
    const bulge = Math.sin(k * Math.PI) * 0.12 * tw.p0.distanceTo(tw.p1);
    const out = mid.clone().sub(tw.t0.clone().lerp(tw.t1, k)).normalize().multiplyScalar(bulge);
    this.camera.position.copy(mid.add(out));
    this.controls.target.copy(tw.t0.clone().lerp(tw.t1, k));
    if (k >= 1) { this.tween = null; tw.resolve(); }
  }

  /** Short white flash (ignition, supernova). Respects "minder beweging". */
  flash({ intensity = 1, duration = 1.2 } = {}) {
    const el = document.getElementById('flash');
    if (!el) return;
    const peak = Settings.reducedMotion ? Math.min(0.18, intensity * 0.18) : Math.min(0.95, intensity);
    const attack = Settings.reducedMotion ? 0.6 : 0.08;
    el.animate([{ opacity: 0 }, { opacity: peak, offset: attack / (duration + attack) }, { opacity: 0 }], { duration: (duration + attack) * 1000, easing: 'ease-out' });
  }

  // ------------------------------------------------------------------ picking
  setPickables(list) {
    if (this.hovered) this.applyHover(this.hovered, false);
    this.hovered = null;
    this.pickables = list || [];
    this.hideTooltip();
  }

  bindPointer() {
    const el = this.renderer.domElement;
    let down = null;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      this.pointerPx = { x: e.clientX, y: e.clientY };
      this.pointerType = e.pointerType;
      if (e.pointerType === 'mouse') this.needsPick = true;
    });
    el.addEventListener('pointerleave', () => { this.pointer.set(9, 9); this.needsPick = true; });
    el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    el.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t;
      down = null;
      if (moved > 7 || dt > 600) return;
      const r = el.getBoundingClientRect();
      this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      const hit = this.pick();
      if (hit) bus.emit('pick', { infoId: hit.infoId, entry: hit, source: '3d' });
    });
  }

  /** Returns the best pickable entry under the pointer (highest priority, then nearest). */
  pick() {
    if (!this.pickables.length || Math.abs(this.pointer.x) > 1) return null;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const objs = this.pickables.filter((p) => p.enabled !== false).map((p) => p.object);
    let hits;
    try { hits = this.raycaster.intersectObjects(objs, true); } catch (e) { return null; }
    let best = null, bestPri = -Infinity, bestDist = Infinity;
    for (const h of hits) {
      let o = h.object, entry = null;
      while (o && !entry) { entry = o.userData.pickEntry; o = o.parent; }
      if (!entry || entry.enabled === false) continue;
      const pri = entry.priority || 0;
      if (pri > bestPri || (pri === bestPri && h.distance < bestDist)) { best = entry; bestPri = pri; bestDist = h.distance; }
    }
    return best;
  }

  applyHover(entry, on) {
    if (!entry) return;
    try {
      if (entry.onHover) { entry.onHover(on); } else {
        const t = entry.highlightTarget || entry.object;
        let handled = false;
        if (typeof t.setHighlight === 'function') { t.setHighlight(on ? 1 : 0); handled = true; }
        t.traverse?.((o) => {
          const u = o.userData?.highlightUniform || o.material?.uniforms?.uHighlight;
          if (u) { u.value = on ? 1 : 0; handled = true; }
        });
        if (!handled && this.outlinePass) {
          const meshes = [];
          t.traverse?.((o) => { if ((o.isMesh || o.isLine) && o.visible) meshes.push(o); });
          this.outlinePass.selectedObjects = on ? meshes : [];
          this.outlinePass.enabled = on && meshes.length > 0;
        }
      }
    } catch (e) { console.warn('highlight failed', e); }
    this.labels.setHot(entry.infoId, on);
    this.renderer.domElement.parentElement.classList.toggle('hovering', on);
  }

  /** Highlight every pickable with this infoId (used by labels and the objects list). */
  setHoverByInfo(infoId, on) {
    for (const p of this.pickables) if (p.infoId === infoId) this.applyHover(p, on);
  }

  updateHover() {
    if (!this.needsPick) return;
    this.needsPick = false;
    const hit = this.userInteracting ? null : this.pick();
    if (hit !== this.hovered) {
      if (this.hovered) this.applyHover(this.hovered, false);
      this.hovered = hit;
      if (hit) this.applyHover(hit, true);
    }
    if (hit) this.showTooltip(hit); else this.hideTooltip();
  }

  showTooltip(entry) {
    const info = Content.get(entry.infoId);
    const title = entry.label || info?.title || entry.infoId;
    const sub = entry.tooltip || info?.tooltip || '';
    this.tooltip.innerHTML = `<b>${title}</b>${sub ? `<span>${sub}</span>` : ''}<span class="tt-hint">${Content.ui.tooltipHint}</span>`;
    this.tooltip.hidden = false;
    const tw = this.tooltip.offsetWidth, th = this.tooltip.offsetHeight;
    const x = Math.min(this.pointerPx.x, innerWidth - tw - 24), y = Math.min(this.pointerPx.y, innerHeight - th - 24);
    this.tooltip.style.left = x + 'px'; this.tooltip.style.top = y + 'px';
  }
  hideTooltip() { this.tooltip.hidden = true; }

  /** Screen position of a world point: { x, y, visible } in CSS pixels. */
  project(v3) {
    const v = v3.clone().project(this.camera);
    return { x: ((v.x + 1) / 2) * this.width, y: ((1 - v.y) / 2) * this.height, visible: v.z < 1 && v.z > -1 };
  }

  // ------------------------------------------------------------------ loop
  start() { this.renderer.setAnimationLoop(() => this.tick()); }

  tick() {
    const dt = Math.min(0.1, this.clock.getDelta());
    this.renderer.info.reset();
    Shaders.uTime.value += dt;
    this.measureFps(dt);
    this.stepTween(dt);
    this.controls.autoRotate = Settings.autoRotate && !Settings.reducedMotion && !this.tween;
    this.controls.update();
    this.background.update(this.camera);
    try { this.onUpdate?.(dt); } catch (e) { console.error('update error', e); }
    this.updateHover();
    this.labels.update();
    this.composer.render(dt);
  }

  measureFps(dt) {
    this._fpsAcc += dt; this._fpsN++;
    if (this._fpsAcc >= 0.5) {
      this.fps = this._fpsN / this._fpsAcc;
      this._fpsAcc = 0; this._fpsN = 0;
      bus.emit('fps', this.fps);
      // dynamic resolution: keep the frame rate up on slower GPUs
      if (this.fps < 40) { this._slowT += 0.5; this._fastT = 0; } else if (this.fps > 57) { this._fastT += 0.5; this._slowT = 0; } else { this._slowT = 0; this._fastT = 0; }
      if (this._slowT >= 2 && this.dynScale > 0.6) { this.dynScale = Math.max(0.6, this.dynScale - 0.15); this._slowT = 0; this.resize(); }
      if (this._fastT >= 6 && this.dynScale < 1) { this.dynScale = Math.min(1, this.dynScale + 0.1); this._fastT = 0; this.resize(); }
    }
  }
}

/** Base class for all 3D scenes. Subclasses override build/enter/update/exit/getCameraPreset. */
class BaseScene {
  constructor(ctx) {
    this.ctx = ctx;           // { sm, app }
    this.sm = ctx.sm;
    this.app = ctx.app;
    this.group = new THREE.Group();
    this.pickables = [];
    this.labelDefs = [];
    this.params = {};
    this.time = 0;            // seconds since enter()
    this.built = false;
    this._disposables = [];
    /** Post settings applied when the scene becomes active. */
    this.renderSettings = { bloomStrength: 0.9, bloomRadius: 0.55, bloomThreshold: 0.82, exposure: 1.0, backgroundDim: 1 };
  }
  get reducedMotion() { return Settings.reducedMotion; }
  get quality() { return Q(); }

  /** Create objects (called once, lazily, before the first enter). */
  build() {}
  /** Called every time the scene becomes active. params: { variant, mass, stage, path, ... } */
  enter(params) {}
  /** Per frame. dt = real seconds. state = current simulation state (may be null), see Evolution.stateAt. */
  update(dt, state) {}
  /** Called when the scene is deactivated. Remove extra passes etc. here. */
  exit() {}
  /** Default camera placement for this scene. */
  getCameraPreset() { return { position: [0, 2, 12], target: [0, 0, 0], minDistance: 1, maxDistance: 400 }; }
  /** Optional named camera focus ('disk', 'core', ...) -> preset or null. */
  getFocus(name) { return null; }

  /** Register an object as clickable. opts: { priority, highlightTarget, label, tooltip, onHover(on) } */
  addPickable(object, infoId, opts = {}) {
    const entry = { object, infoId, priority: opts.priority ?? 0, highlightTarget: opts.highlightTarget || object, label: opts.label, tooltip: opts.tooltip, onHover: opts.onHover, enabled: true };
    object.userData.pickEntry = entry;
    this.pickables.push(entry);
    return entry;
  }
  removePickable(object) { const i = this.pickables.findIndex((p) => p.object === object); if (i >= 0) this.pickables.splice(i, 1); delete object.userData.pickEntry; }
  /** Declare an HTML label for an object (created when the scene is active). opts: { text, offset:[x,y,z], color, always } */
  addLabel(object, infoId, opts = {}) {
    const def = { object, infoId, text: opts.text || Content.get(infoId)?.title || infoId, offset: opts.offset ? new THREE.Vector3(...opts.offset) : null, color: opts.color, always: opts.always, handle: null };
    this.labelDefs.push(def);
    if (this._active) def.handle = this.sm.labels.add(def);
    return def;
  }
  /** Invisible sphere used as a click target for particle clouds etc. (lower priority by default). */
  makeProxy(radius, infoId, opts = {}) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), new THREE.MeshBasicMaterial({ visible: false }));
    if (opts.position) m.position.set(...opts.position);
    if (opts.scale) m.scale.set(...opts.scale);
    this.group.add(m);
    this.addPickable(m, infoId, Object.assign({ priority: -1 }, opts));
    return m;
  }
  track(...things) { this._disposables.push(...things); return things[0]; }
  /** Small on-screen HUD for this scene (e.g. phase captions, a live counter). html=null removes it.
      Removed automatically when the scene is left. Returns the element. */
  setHud(html, opts = {}) {
    let el = this._hud && this._hud.isConnected ? this._hud : null;
    if (html === null) { el?.remove(); this._hud = null; return null; }
    if (!el) { el = U.el('div', { class: 'scene-hud', role: 'status', 'aria-live': 'polite' }); document.getElementById('labels').append(el); this._hud = el; }
    if (el._html !== html) { el.innerHTML = html; el._html = html; }
    el.classList.toggle('hud-wide', !!opts.wide);
    return el;
  }

  dispose() {
    this.group.traverse((o) => {
      if (o.userData?.shared) return;
      o.geometry?.dispose?.();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of mats) { if (!m.userData?.shared) m.dispose(); }
      if (typeof o.dispose === 'function' && !o.isScene && o !== this.group) { try { o.dispose(); } catch (e) { /* already disposed */ } }
    });
    for (const d of this._disposables) { try { d.dispose?.(); } catch (e) { /* ignore */ } }
    this._disposables = [];
    this.group.clear();
    this.pickables = [];
    this.labelDefs = [];
    this.built = false;
  }
}
