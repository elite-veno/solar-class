/* Shaders: shared GLSL chunks and global uniforms. Star-surface shaders are added to
   this object by 21-shaders-star.js (Object.assign(Shaders, {...})). */

const Shaders = {
  /** Global animation clock shared by all materials (seconds). Incremented by SceneManager. */
  uTime: { value: 0 },
  /** Drawing-buffer height in device pixels (for world-size point sprites). */
  uViewH: { value: 800 },
  /** Device pixel ratio actually used by the renderer. */
  uPixelRatio: { value: 1 },

  /** 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT) + fbm helpers. */
  noise: /* glsl */`
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
    }
    float fbm3(vec3 p) { float f = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { f += a * snoise(p); p = p * 2.03 + vec3(17.1, 3.3, 9.7); a *= 0.5; } return f; }
    float fbm5(vec3 p) { float f = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { f += a * snoise(p); p = p * 2.03 + vec3(17.1, 3.3, 9.7); a *= 0.5; } return f; }
    float ridged(vec3 p) { float f = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { f += a * (1.0 - abs(snoise(p))); p = p * 2.1 + 5.3; a *= 0.5; } return f; }
  `,

  /** Cheap hashes. */
  hash: /* glsl */`
    float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
    float hash13(vec3 p3) { p3 = fract(p3 * 0.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
    vec3 hash33(vec3 p3) { p3 = fract(p3 * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yxz + 33.33); return fract((p3.xxy + p3.yxx) * p3.zyx); }
  `,

  /** Fresnel rim glow (use on a slightly larger sphere, BackSide or FrontSide, additive). */
  rimGlow: {
    vertex: /* glsl */`
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragment: /* glsl */`
      uniform vec3 uColor; uniform float uIntensity; uniform float uPower; uniform float uHighlight;
      varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
        gl_FragColor = vec4(uColor * uIntensity * (1.0 + uHighlight), f);
      }`,
  },

  /** Create a rim-glow material. */
  makeRimGlow({ color = new THREE.Color(1, .8, .5), intensity = 1.5, power = 2.5, side = THREE.FrontSide } = {}) {
    return new THREE.ShaderMaterial({
      uniforms: { uColor: { value: color.clone ? color.clone() : new THREE.Color(color) }, uIntensity: { value: intensity }, uPower: { value: power }, uHighlight: { value: 0 } },
      vertexShader: Shaders.rimGlow.vertex, fragmentShader: Shaders.rimGlow.fragment,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side,
    });
  },
};

/** CPU-side 3D gradient noise (for distributing particles etc.). */
const Noise = (() => {
  const p = new Uint8Array(512);
  const r = U.rng(1337);
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const grad = (h, x, y, z) => { const u = h < 8 ? x : y, v = h < 4 ? y : (h === 12 || h === 14 ? x : z); return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); };
  function noise3(x, y, z) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z);
    const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z, B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
    const L = (a, b, t) => a + t * (b - a);
    return L(L(L(grad(p[AA] & 15, x, y, z), grad(p[BA] & 15, x - 1, y, z), u), L(grad(p[AB] & 15, x, y - 1, z), grad(p[BB] & 15, x - 1, y - 1, z), u), v),
      L(L(grad(p[AA + 1] & 15, x, y, z - 1), grad(p[BA + 1] & 15, x - 1, y, z - 1), u), L(grad(p[AB + 1] & 15, x, y - 1, z - 1), grad(p[BB + 1] & 15, x - 1, y - 1, z - 1), u), v), w);
  }
  function fbm3(x, y, z, oct = 4) { let f = 0, a = 0.5; for (let i = 0; i < oct; i++) { f += a * noise3(x, y, z); x = x * 2.03 + 17.1; y = y * 2.03 + 3.3; z = z * 2.03 + 9.7; a *= 0.5; } return f; }
  return { noise3, fbm3 };
})();
