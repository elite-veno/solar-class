/* ParticleSystems: GPU point sprites. All motion runs in the vertex shader (driven by
   the shared Shaders.uTime clock), so tens of thousands of particles cost almost no CPU.

   ParticleSystems.createPoints(opts) is the general builder; createCloud / createDisk /
   createJet / createShell / createWind are ready-made presets built on top of it. */

const ParticleSystems = {
  /** Scale a desired particle count by the quality setting. */
  count(n) { return Math.max(24, Math.round(n * Q().particles)); },

  SHAPES: {
    soft: 'float a = pow(max(0.0, 1.0 - d), 1.7);',
    dust: 'float a = exp(-d * d * 3.5) * (1.0 - smoothstep(0.85, 1.0, d));',
    spark: 'float a = exp(-d * d * 18.0) + 0.35 * pow(max(0.0, 1.0 - d), 3.0);',
    ring: 'float a = smoothstep(0.55, 0.8, d) * (1.0 - smoothstep(0.8, 1.0, d));',
    disc: 'float a = 1.0 - smoothstep(0.8, 1.0, d);',
  },

  /**
   * opts:
   *  count            number of particles (NOT auto-scaled; wrap with ParticleSystems.count())
   *  position(i, v3, rng)   fill THREE.Vector3 (or Float32Array of 3*count)
   *  color(i, c, rng)       fill THREE.Color (or THREE.Color for all, or Float32Array)
   *  size(i, rng) | number  world-space diameter
   *  alpha(i, rng) | number
   *  attributes: { aName: { size: 1..4, fn: (i, rng) => number | number[] } }  extra per-particle data
   *  uniforms: { uName: { value } }       extra uniforms (shared objects allowed)
   *  vertexHead: GLSL declared before main (uniforms/attributes/functions you use)
   *  vertexMotion: GLSL inside main; may modify: vec3 pos, vec3 col, float alpha, float size.
   *                available: aSeed (0..1 random), uTime, uProgress, position, aColor ...
   *  shape: 'soft' | 'dust' | 'spark' | 'ring' | 'disc'
   *  blending: 'add' | 'normal'
   *  brightness (HDR multiplier, >1 blooms), opacity, maxSize (px), seed, depthTest
   */
  createPoints(opts) {
    const n = Math.max(1, Math.floor(opts.count));
    const rng = U.rng(opts.seed ?? 7);
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), siz = new Float32Array(n), alp = new Float32Array(n), seed = new Float32Array(n);
    const v = new THREE.Vector3(), c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      if (opts.position instanceof Float32Array) v.fromArray(opts.position, i * 3);
      else if (opts.position) { v.set(0, 0, 0); opts.position(i, v, rng); } else v.set(0, 0, 0);
      pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
      if (opts.color instanceof Float32Array) c.fromArray(opts.color, i * 3);
      else if (typeof opts.color === 'function') { c.setRGB(1, 1, 1); opts.color(i, c, rng); } else if (opts.color) c.copy(opts.color); else c.setRGB(1, 1, 1);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      siz[i] = typeof opts.size === 'function' ? opts.size(i, rng) : (opts.size ?? 0.1);
      alp[i] = typeof opts.alpha === 'function' ? opts.alpha(i, rng) : (opts.alpha ?? 1);
      seed[i] = rng();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(siz, 1));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(alp, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    let extraAttr = '';
    for (const [name, def] of Object.entries(opts.attributes || {})) {
      const s = def.size || 1, arr = new Float32Array(n * s);
      for (let i = 0; i < n; i++) { const r = def.fn(i, rng); if (s === 1) arr[i] = r; else for (let k = 0; k < s; k++) arr[i * s + k] = r[k]; }
      g.setAttribute(name, new THREE.BufferAttribute(arr, s));
      extraAttr += `attribute ${['float', 'float', 'vec2', 'vec3', 'vec4'][s]} ${name};\n`;
    }
    const uniforms = Object.assign({
      uTime: Shaders.uTime, uViewH: Shaders.uViewH,
      uProgress: { value: 0 }, uOpacity: { value: opts.opacity ?? 1 }, uBrightness: { value: opts.brightness ?? 1 },
      uHighlight: { value: 0 }, uMaxSize: { value: opts.maxSize ?? 180 }, uSizeScale: { value: 1 },
    }, opts.uniforms || {});
    const vs = /* glsl */`
      uniform float uTime; uniform float uViewH; uniform float uProgress; uniform float uMaxSize; uniform float uSizeScale;
      attribute vec3 aColor; attribute float aSize; attribute float aAlpha; attribute float aSeed;
      ${extraAttr}
      varying vec3 vColor; varying float vAlpha;
      ${opts.noise ? Shaders.noise : ''}
      ${opts.vertexHead || ''}
      void main() {
        vec3 pos = position; vec3 col = aColor; float alpha = aAlpha; float size = aSize;
        ${opts.vertexMotion || ''}
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        float ps = size * uSizeScale * projectionMatrix[1][1] * uViewH * 0.5 / max(0.0001, -mv.z);
        alpha *= clamp(ps * 0.7, 0.0, 1.0);
        gl_PointSize = clamp(ps, 1.0, uMaxSize);
        vColor = col; vAlpha = alpha;
      }`;
    const fs = /* glsl */`
      uniform float uOpacity; uniform float uBrightness; uniform float uHighlight;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        ${ParticleSystems.SHAPES[opts.shape || 'soft']}
        a *= vAlpha * uOpacity;
        if (a < 0.002) discard;
        gl_FragColor = vec4(vColor * uBrightness * (1.0 + 0.8 * uHighlight), a);
      }`;
    const m = new THREE.ShaderMaterial({
      uniforms, vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false,
      depthTest: opts.depthTest ?? true,
      blending: opts.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
    });
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = opts.frustumCulled ?? false;
    pts.userData.highlightUniform = uniforms.uHighlight;
    return pts;
  },

  /** Volumetric cloud: particles distributed by fbm density inside an ellipsoid; slow turbulent drift. */
  createCloud({ count = 20000, radius = 10, scale = [1, 0.6, 1], noiseScale = 0.35, threshold = 0.0, colorA = new THREE.Color(0.35, 0.3, 0.45), colorB = new THREE.Color(0.9, 0.55, 0.45), size = 0.6, alpha = 0.25, drift = 0.15, blending = 'normal', shape = 'dust', seed = 3, brightness = 1 } = {}) {
    const rng = U.rng(seed);
    const tmp = new THREE.Vector3();
    const pts = [];
    let guard = 0;
    while (pts.length < count * 3 && guard++ < count * 40) {
      U.randInSphere(rng, tmp);
      const d = Noise.fbm3(tmp.x / noiseScale * 0.35 + 5, tmp.y / noiseScale * 0.35, tmp.z / noiseScale * 0.35 - 3, 4) * 1.6 + 0.55 - tmp.length() * 0.55;
      if (d < threshold + rng() * 0.35) continue;
      pts.push(tmp.x * radius * scale[0], tmp.y * radius * scale[1], tmp.z * radius * scale[2]);
    }
    const n = pts.length / 3;
    return this.createPoints({
      count: n, seed, blending, shape, brightness,
      position: (i, v) => v.set(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]),
      color: (i, c, r) => c.copy(colorA).lerp(colorB, Math.pow(r(), 1.5)),
      size: (i, r) => size * (0.5 + r() * 1.2),
      alpha: (i, r) => alpha * (0.5 + r() * 0.5),
      uniforms: { uDrift: { value: drift } },
      vertexHead: 'uniform float uDrift;',
      vertexMotion: `
        float t = uTime * 0.05;
        pos += uDrift * vec3(sin(t + aSeed * 40.0 + pos.y * 0.2), sin(t * 1.3 + aSeed * 23.0 + pos.z * 0.2), cos(t * 0.9 + aSeed * 31.0 + pos.x * 0.2));`,
    });
  },

  /** Rotating disk with Kepler-like angular speed (inner parts faster). Uniforms: uOmega, uRadiusScale. */
  createDisk({ count = 20000, rIn = 1.5, rOut = 10, thickness = 0.08, flare = 1.0, colorInner = new THREE.Color(1, 0.85, 0.6), colorOuter = new THREE.Color(0.6, 0.25, 0.15), omega = 1.2, size = 0.12, alpha = 0.6, spiral = 0, arms = 2, seed = 5, brightness = 1.2, blending = 'add', shape = 'soft' } = {}) {
    const rad = new Float32Array(count), ang = new Float32Array(count), hei = new Float32Array(count);
    const rng = U.rng(seed);
    for (let i = 0; i < count; i++) {
      const r = rIn + (rOut - rIn) * Math.pow(rng(), 1.35);
      let a = rng() * Math.PI * 2;
      if (spiral > 0 && rng() < spiral) a = Math.floor(rng() * arms) * (Math.PI * 2 / arms) + Math.log(r / rIn) * 2.2 + U.gauss(rng) * 0.25;
      rad[i] = r; ang[i] = a;
      hei[i] = U.gauss(rng) * thickness * Math.pow(r / rOut, flare) * rOut * 0.5;
    }
    const cIn = colorInner, cOut = colorOuter;
    return this.createPoints({
      count, seed, blending, shape, brightness,
      position: (i, v) => v.set(Math.cos(ang[i]) * rad[i], hei[i], Math.sin(ang[i]) * rad[i]),
      color: (i, c) => c.copy(cIn).lerp(cOut, Math.pow((rad[i] - rIn) / (rOut - rIn), 0.6)),
      size: (i, r) => size * (0.6 + r() * 0.9) * (0.6 + 0.8 * rad[i] / rOut),
      alpha: (i, r) => alpha * (0.4 + r() * 0.6),
      attributes: { aR: { fn: (i) => rad[i] }, aA: { fn: (i) => ang[i] }, aH: { fn: (i) => hei[i] } },
      uniforms: { uOmega: { value: omega }, uRadiusScale: { value: 1 } },
      vertexHead: 'uniform float uOmega; uniform float uRadiusScale;',
      vertexMotion: `
        float rr = aR * uRadiusScale;
        float an = aA - uTime * uOmega * pow(max(aR, 0.05), -1.5);
        pos = vec3(cos(an) * rr, aH, sin(an) * rr);`,
    });
  },

  /** Bipolar jets along ±Y. Uniforms: uLength, uSpeed, uOpen (opening), uIntensity. */
  createJet({ count = 6000, length = 20, radius = 0.6, speed = 6, color = new THREE.Color(0.55, 0.75, 1.0), colorEnd = new THREE.Color(0.9, 0.4, 0.7), size = 0.35, alpha = 0.8, seed = 9, brightness = 2.0, bipolar = true, knots = 0.6 } = {}) {
    return this.createPoints({
      count, seed, brightness, shape: 'soft',
      color: (i, c, r) => c.copy(color),
      size: (i, r) => size * (0.5 + r()),
      alpha: (i, r) => alpha * (0.5 + 0.5 * r()),
      attributes: { aSide: { fn: (i) => (bipolar ? (i % 2 ? 1 : -1) : 1) }, aAng: { fn: (i, r) => r() * Math.PI * 2 }, aRr: { fn: (i, r) => Math.sqrt(r()) }, aSp: { fn: (i, r) => 0.7 + 0.6 * r() } },
      uniforms: { uLength: { value: length }, uSpeed: { value: speed }, uRadius: { value: radius }, uIntensity: { value: 1 }, uColorEnd: { value: colorEnd.clone() }, uKnots: { value: knots } },
      vertexHead: 'uniform float uLength; uniform float uSpeed; uniform float uRadius; uniform float uIntensity; uniform vec3 uColorEnd; uniform float uKnots;',
      vertexMotion: `
        float life = fract(aSeed * 13.7 + uTime * uSpeed * aSp / uLength);
        float y = life * uLength;
        float rr = uRadius * aRr * (0.25 + 1.4 * life);
        float knot = 1.0 + uKnots * smoothstep(0.6, 1.0, sin(life * 18.0 - uTime * 2.0));
        pos = vec3(cos(aAng) * rr, aSide * y, sin(aAng) * rr);
        col = mix(col, uColorEnd, life);
        alpha *= smoothstep(0.0, 0.04, life) * (1.0 - smoothstep(0.7, 1.0, life)) * uIntensity * knot;
        size *= (0.6 + life * 1.6);`,
    });
  },

  /** Expanding shell of gas. Set uniforms.uRadius / uThickness / uOpacity from the scene. */
  createShell({ count = 15000, radius = 5, thickness = 0.6, color = (i, c, r, dir) => c.setRGB(1, 0.5, 0.3), clump = 0.8, size = 0.25, alpha = 0.6, seed = 11, brightness = 1.4, blending = 'add', shape = 'soft', squash = [1, 1, 1] } = {}) {
    const rng = U.rng(seed);
    const dirs = [];
    const tmp = new THREE.Vector3();
    let guard = 0;
    while (dirs.length < count * 3 && guard++ < count * 30) {
      U.randDir(rng, tmp);
      const dens = 0.5 + Noise.fbm3(tmp.x * 2.2 + 3, tmp.y * 2.2, tmp.z * 2.2 - 1, 4) * 1.8;
      if (rng() > U.lerp(1, U.clamp(dens), clump)) continue;
      dirs.push(tmp.x * squash[0], tmp.y * squash[1], tmp.z * squash[2]);
    }
    const n = dirs.length / 3;
    const d3 = new THREE.Vector3();
    return this.createPoints({
      count: n, seed, blending, shape, brightness,
      color: (i, c, r) => { d3.set(dirs[i * 3], dirs[i * 3 + 1], dirs[i * 3 + 2]); color(i, c, r, d3); },
      size: (i, r) => size * (0.5 + r()),
      alpha: (i, r) => alpha * (0.4 + 0.6 * r()),
      attributes: { aDir: { size: 3, fn: (i) => [dirs[i * 3], dirs[i * 3 + 1], dirs[i * 3 + 2]] }, aOff: { fn: (i, r) => U.gauss(r) * 0.5 } },
      uniforms: { uRadius: { value: radius }, uThickness: { value: thickness } },
      vertexHead: 'uniform float uRadius; uniform float uThickness;',
      vertexMotion: `
        pos = aDir * (uRadius + aOff * uThickness);
        pos += 0.02 * uRadius * vec3(sin(uTime * 0.3 + aSeed * 50.0), cos(uTime * 0.23 + aSeed * 31.0), sin(uTime * 0.27 + aSeed * 17.0));`,
    });
  },

  /** Radial outflow (stellar wind) from rIn to rOut, looping. Uniforms: uSpeed, uRIn, uROut. */
  createWind({ count = 5000, rIn = 1.1, rOut = 8, speed = 1.5, color = new THREE.Color(1, 0.8, 0.6), size = 0.08, alpha = 0.5, seed = 13, brightness = 1.2, flatten = 1 } = {}) {
    const rng = U.rng(seed);
    const tmp = new THREE.Vector3();
    return this.createPoints({
      count, seed, brightness,
      color: () => {}, size: (i, r) => size * (0.5 + r()), alpha: (i, r) => alpha * (0.5 + 0.5 * r()),
      position: (i, v) => v.set(0, 0, 0),
      attributes: { aDir: { size: 3, fn: () => { U.randDir(rng, tmp); return [tmp.x, tmp.y * flatten, tmp.z]; } } },
      uniforms: { uSpeed: { value: speed }, uRIn: { value: rIn }, uROut: { value: rOut }, uWindColor: { value: color.clone() } },
      vertexHead: 'uniform float uSpeed; uniform float uRIn; uniform float uROut; uniform vec3 uWindColor;',
      vertexMotion: `
        float life = fract(aSeed * 17.3 + uTime * uSpeed / (uROut - uRIn));
        pos = normalize(aDir) * mix(uRIn, uROut, life);
        col = uWindColor;
        alpha *= smoothstep(0.0, 0.08, life) * (1.0 - life);`,
    });
  },

  /** Utility: dispose geometry + material of a Points object. */
  dispose(pts) { pts.geometry?.dispose(); pts.material?.dispose(); },
};
