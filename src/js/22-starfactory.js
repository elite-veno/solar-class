/* StarFactory — MINIMAL STUB implementing the full public API from ARCHITECTURE.md.
   The star-shader module replaces this file with the complete implementation. */

class Star extends THREE.Group {
  constructor(opts = {}) {
    super();
    this.opts = Object.assign({ T: 5772, radius: 1, granulation: 1, spots: 0.3, limbDarkening: 0.6, corona: 1, coronaScale: 1.6, convection: 0, activity: 0, rotationSpeed: 0.03, brightness: 1.6, banded: 0, lensflare: false, seed: 1 }, opts);
    const seg = opts.segments || Q().sphereSeg;
    this.uniforms = { uColor: { value: StarFactory.colorForT(this.opts.T) }, uBrightness: { value: this.opts.brightness }, uLimb: { value: this.opts.limbDarkening }, uHighlight: { value: 0 }, uTime: Shaders.uTime };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); vP = position; gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `${Shaders.noise} uniform vec3 uColor; uniform float uBrightness; uniform float uLimb; uniform float uHighlight; uniform float uTime; varying vec3 vN; varying vec3 vV; varying vec3 vP;
        void main(){ float mu = max(dot(normalize(vN), normalize(vV)), 0.0); float limb = 1.0 - uLimb*(1.0 - pow(mu, 0.6));
          float g = 0.85 + 0.15*snoise(normalize(vP)*18.0 + uTime*0.15);
          gl_FragColor = vec4(uColor*uBrightness*limb*g*(1.0+0.5*uHighlight), 1.0); }`,
    });
    this.surface = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.round(seg / 2)), mat);
    this.surface.name = 'starSurface';
    this.add(this.surface);
    this.corona = StarFactory.createGlow({ color: StarFactory.colorForT(this.opts.T), size: this.opts.coronaScale * 2.4, intensity: this.opts.corona });
    this.add(this.corona);
    this.setRadius(this.opts.radius);
  }
  get radius() { return this.opts.radius; }
  get temperature() { return this.opts.T; }
  setTemperature(T) { this.opts.T = T; StarFactory.colorForT(T, this.uniforms.uColor.value); this.corona.material.color.copy(this.uniforms.uColor.value).multiplyScalar(this.opts.corona); return this; }
  setRadius(r) { this.opts.radius = r; this.surface.scale.setScalar(r); this.corona.scale.setScalar(r * this.opts.coronaScale * 2.4); return this; }
  setParams(p = {}) { Object.assign(this.opts, p); if (p.T !== undefined) this.setTemperature(p.T); if (p.radius !== undefined || p.coronaScale !== undefined) this.setRadius(this.opts.radius); if (p.brightness !== undefined) this.uniforms.uBrightness.value = p.brightness; if (p.limbDarkening !== undefined) this.uniforms.uLimb.value = p.limbDarkening; return this; }
  setHighlight(v) { this.uniforms.uHighlight.value = v; }
  update(dt) { this.surface.rotation.y += dt * this.opts.rotationSpeed; }
  dispose() { this.traverse((o) => { o.geometry?.dispose(); if (o.material && o.material.map !== StarFactory._glowTex) o.material.dispose(); }); }
}

const StarFactory = {
  _glowTex: null,
  create(opts = {}) { return new Star(opts); },
  colorForT(T, out) { return U.starColor(T, out); },
  glowTexture() {
    if (this._glowTex) return this._glowTex;
    const s = 256, cv = document.createElement('canvas'); cv.width = cv.height = s;
    const g = cv.getContext('2d'), grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.2, 'rgba(255,255,255,0.55)'); grd.addColorStop(0.45, 'rgba(255,255,255,0.16)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
    this._glowTex = new THREE.CanvasTexture(cv); this._glowTex.colorSpace = THREE.SRGBColorSpace;
    return this._glowTex;
  },
  createGlow({ color = new THREE.Color(1, 0.8, 0.5), size = 4, intensity = 1 } = {}) {
    const m = new THREE.SpriteMaterial({ map: this.glowTexture(), color: color.clone().multiplyScalar(intensity), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    const sp = new THREE.Sprite(m); sp.scale.setScalar(size); return sp;
  },
  createLensflare() { return null; },
};
