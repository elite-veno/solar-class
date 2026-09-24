# Het leven van sterren — architecture contract

Interactive, educational 3D simulation of stellar evolution. **One self-contained `index.html`**
(HTML + CSS + JS, Three.js r169 via CDN import map). **All visible text is Dutch.** Must be
beautiful *and* scientifically correct. No placeholders, no "TODO", no lorem ipsum, no "coming soon".

The final `index.html` is assembled from `src/` by `tools/build.py`. Everything runs in **one
shared ES-module scope** (all `src/js/*.js` files are concatenated in filename order into a single
`<script type="module">`).

---------------------------------------------------------------------------------------------------

## 1. Files, build, test

```
src/html/00-head.html      doctype + <head> (meta, fonts)                     [core]
src/html/10-body.html      static UI shell (panels, timeline, dialogs)         [core]
src/css/00-base.css        design tokens + all shared UI classes               [core]
src/css/NN-*.css           extra CSS for a module (owner writes its own file)
src/js/05-imports.js       THREE + addons imports (ONLY file with imports)     [core]
src/js/10-utils.js         PHYS, U, EventBus/bus, QUALITY/Q(), Settings, Registry  [core]
src/js/15-content-base.js  `const Content = {...}` + UI strings                [core]
src/js/16-content-*.js     Object.assign(Content.info, {...}) etc. (per owner)
src/js/20-shaders.js       Shaders (noise GLSL, global uniforms), Noise (CPU)  [core]
src/js/21-shaders-star.js  star-surface / corona GLSL (Object.assign(Shaders,…)) [star agent]
src/js/22-starfactory.js   Star class + StarFactory                            [star agent]
src/js/24-particles.js     ParticleSystems (GPU point sprites + presets)       [core]
src/js/30-scenemanager.js  Background, LabelLayer, SceneManager, BaseScene     [core]
src/js/40-evolution.js     Evolution (physical model, paths, HR tracks)        [evolution agent]
src/js/52-scene-<id>.js    one file per 3D scene (class + Registry.registerScene)
src/js/60-hrdiagram.js     HRDiagram                                           [hr agent]
src/js/62-classification.js ClassificationPanel (+ size comparison)            [classification agent]
src/js/64-infopanel.js     InfoPanel                                           [core]
src/js/66-timeline.js      Timeline                                            [core]
src/js/70-tour.js 72-quiz.js 74-compare.js   TourMode, QuizMode, CompareMode   [modes agent]
src/js/90-app.js           App controller (+ boot)                             [core]
```

### Build
```
python3 tools/build.py --check                         # full build -> index.html, fails on duplicate top-level names
python3 tools/build.py --stage work/<you> --out work/<you>/index.html --check   # private build incl. your unpublished files
```
`--stage DIR` overlays `DIR/js/*.js`, `DIR/css/*.css` (and `DIR/html/*`) on top of `src/`: same
filename = replaces, new filename = added.

### Parallel-work protocol (IMPORTANT — other agents are working at the same time)
1. Develop ONLY in your private dir `work/<your-agent-name>/js/` and `work/<your-agent-name>/css/`, using the
   exact final filenames. Build with `--stage work/<you> --out work/<you>/index.html`.
2. Never edit files you do not own (core files, other agents' files). If you need a core change,
   work around it inside your own files and mention the need in your final report.
3. When your work is complete and tested, **publish** by copying your files into `src/js/` / `src/css/`,
   then run `python3 tools/build.py --check` and a smoke test of the full build (`tools/cdp.py index.html …`).
   If the full build shows errors caused by your files, fix them immediately.
4. Throw-away test scenes/helpers stay in your work dir (e.g. `work/<you>/js/99-dev.js`), never publish them.

### Headless browser test harness (stdlib Python + Chrome/SwiftShader)
```
python3 tools/cdp.py work/<you>/index.html --hash "scene=protostar" --wait 6 --shot work/<you>/shots/protostar.png
python3 tools/cdp.py work/<you>/index.html --hash "scene=neutronStar&variant=magnetar" --wait 6 --shot ...
python3 tools/cdp.py work/<you>/index.html --hash "stage=redGiant&mass=1" --wait 6 --shot ...   # via the timeline
python3 tools/cdp.py work/<you>/index.html --wait 5 --eval "App.selfTest({only:['cloud','collapse']}).then(r=>JSON.stringify(r))"
python3 tools/cdp.py work/<you>/index.html --wait 5 --eval "App.goToScene('jets'); 1" --wait 4 --shot a.png --eval "JSON.stringify(App.debugInfo())"
python3 tools/cdp.py work/<you>/index.html --mobile --hash "scene=cloud" --wait 6 --shot m.png    # 390x844 phone
```
Steps (`--wait`, `--eval`, `--shot`) run in command-line order. Exit code 1 + printed messages when
there are uncaught exceptions or `console.error`s. Chrome runs are serialised by a lock (other
agents share the machine; RAM is limited): keep runs short (≤ ~20 s of waits), don't loop needlessly.
**Always look at your screenshots with the Read tool** and iterate on the visuals. SwiftShader is a
slow software renderer: headless fps numbers are meaningless; judge performance by budgets (§8).

Deep-link hash keys (also useful for testing): `scene`, `variant`, `focus`, `mass`, `lowz=1`,
`stage=<index|stageId>`, `f=<0..1 progress within stage>`, `mode=<levensloop|eindproducten|binnenkant|vergelijken|rondleiding>`,
`info=<infoId>`, `hr=1`, `class=1`, `gallery=1`, `quiz=1`, `play=1`, `speed=<log10 yr/s>`, `tour=1`.
Query `?quality=laag|middel|hoog` and `?reducedMotion=1` override settings.

---------------------------------------------------------------------------------------------------

## 2. Shared-scope rules (the #1 source of integration bugs)
- One module scope. **Top-level names must be unique across ALL files.** Each file may declare only
  the top-level names listed for it (§3, §5, §6). Put helpers *inside* your class/object, or give
  them a unique prefix (e.g. `_cloudMakeTexture`). `build.py --check` fails on duplicates at column 0.
- No `import`/`export` (only 05-imports.js imports). Available globals: `THREE`, `OrbitControls`,
  `EffectComposer`, `RenderPass`, `ShaderPass`, `UnrealBloomPass`, `OutlinePass`, `OutputPass`,
  `Lensflare`, `LensflareElement`, `BufferGeometryUtils`, plus everything in §3.
- No top-level side effects except registration (`Registry.registerScene(...)`, `Registry.register(...)`,
  `Object.assign(Content..., ...)`). Never touch the DOM or WebGL at load time — do it in constructors / build().
- A file may reference classes from *later* files only inside functions that run after boot.
- Never throw out of `update()` in normal operation; guard against `state === null`.

## 3. Core API (already implemented — read the source for details)

**`PHYS`** constants (SI): G, c, sigma, h, kB, Msun, Rsun, Lsun, Tsun=5772, Mearth, Rearth, Mjup, Rjup, AU, ly, pc, yr.

**`U`** utilities: `clamp lerp invLerp mapRange smoothstep logLerp fract deg rad`, `U.ease.{linear,inQuad,outQuad,inOutQuad,inCubic,outCubic,inOutCubic,inOutSine,outExpo,inExpo,outBack}`,
`U.rng(seed)` → `() => [0,1)`, `U.gauss(rng)`, `U.randInSphere(rng, v3)`, `U.randDir(rng, v3)`,
Dutch formatting: `U.fmt(n,maxFrac)` "1.234,5", `U.fmtSig(n,sig)`, `U.fmtSci(n)` "1,99 × 10³⁰", `U.fmtBig(n)` "4,6 miljard",
`U.fmtYears(yr)` "10 miljard jaar" / "0,2 seconden", `U.fmtTemp(K)`, `U.fmtMass(Msun)` "1,4 M☉", `U.fmtLum(Lsun)`, `U.fmtRadius(Rsun)` (km for compact objects), `U.superscript`.
Colour: `U.starColor(T, out?)` → THREE.Color (display palette: O blue, B blue-white, A white, F yellow-white, G yellow, K orange, M red; use this for stars),
`U.blackbody(T)` (physically faithful, paler), `U.starCss(T, alpha)` CSS string. `U.spectralType(T)` → `{cls:'G', sub:2, label:'G2'}`.
DOM: `U.$ U.$$ U.el(tag, attrs, children) U.escapeHtml U.isTouch() U.isMobile() U.store.get/set`.

**`bus`** (EventBus): `bus.on(evt, fn)` → unsubscribe fn, `bus.emit(evt, data)`. Events: `pick {infoId, source}`,
`info (infoId)` → App opens the info panel, `scene {id, params}`, `stage {index, stage}`, `mode (name)`, `mass (m)`,
`play (bool)`, `settings {key, value}`, `resize {width, height}`, `fps (n)`, `infoOpened (id)`, `infoClosed`.

**`Settings`** `{quality:'laag'|'middel'|'hoog', reducedMotion, labels, autoRotate, showFps}`; `Settings.set(k,v)`.
**`Q()`** current quality preset: `{pixelRatio, antialias, particles (0.35/0.7/1), stars, bloomStrength, bloomRes, outline, lensflare, sphereSeg (48/96/128), bhSteps (90/160/260), bhScale (0.5/0.75/1), lod (0/1/2)}`.

**`Registry`**: `Registry.registerScene(id, Class, meta)`, `Registry.register(name, ClassOrObject)`.
Scene meta: `{ title, kicker, group:'vorming'|'evolutie'|'eindproduct'|'doorsnede'|'overig', infoId, badges:['schaal','tijd','traag'], status:'waargenomen'|'deels'|'theorie', variants:[...] (all variant names, used by selfTest), gallery: card | [cards] }`,
gallery card: `{ order, section:'eindproduct'|'explosie', title?, blurb, art (CSS background, e.g. radial-gradients), params:{variant}, status? }`.

**`Shaders`**: `Shaders.uTime` (global clock uniform object — share it: `uniforms: { uTime: Shaders.uTime }`), `Shaders.uViewH`, `Shaders.uPixelRatio`,
GLSL chunks `Shaders.noise` (snoise(vec3), fbm3, fbm5, ridged), `Shaders.hash` (hash11, hash13, hash33), `Shaders.makeRimGlow({color,intensity,power,side})`.
Do not paste `Shaders.noise` twice into one shader. **`Noise`** CPU: `Noise.noise3(x,y,z)`, `Noise.fbm3(x,y,z,oct)`.

**`ParticleSystems`** (GPU sprites, motion in vertex shader, additive by default, world-space sizes):
`ParticleSystems.count(n)` (scale by quality — ALWAYS use), `createPoints(opts)` (general; see source doc comment:
position/color/size/alpha callbacks, extra `attributes`, `uniforms`, `vertexHead`, `vertexMotion` GLSL that edits
`pos, col, alpha, size`; `shape:'soft'|'dust'|'spark'|'ring'|'disc'`, `blending:'add'|'normal'`, `brightness` HDR multiplier, `noise:true` to include snoise in the vertex shader),
presets `createCloud`, `createDisk` (Kepler rotation, `uOmega`), `createJet` (±Y, `uLength uSpeed uRadius uIntensity`), `createShell` (`uRadius uThickness`), `createWind` (`uSpeed uRIn uROut`).
Every material gets `uHighlight` (hover) + `uOpacity` + `uBrightness` + `uProgress`.

**`StarFactory` / `Star`** (star agent owns; API is FIXED):
```
const star = StarFactory.create({ T:5772, radius:1, granulation:1, spots:0.3, limbDarkening:0.6, corona:1, coronaScale:1.6,
   convection:0 (0..1 giant cells, red giants/supergiants), activity:0 (0..1 prominences/flares), rotationSpeed:0.03,
   brightness:1.6 (HDR; >1 blooms), banded:0 (0..1 brown-dwarf/gas-giant bands), lensflare:false, seed:1, segments? })
star (extends THREE.Group): .surface (Mesh — make THIS pickable), .corona (Object3D|null), .radius, .temperature,
  .setTemperature(T) .setRadius(r) .setParams({...any option}) .setHighlight(0|1) .update(dt) .dispose()
StarFactory.colorForT(T, out?)  StarFactory.createGlow({color,size,intensity}) → additive Sprite
StarFactory.glowTexture()  StarFactory.createLensflare(color, size) → Lensflare|null (respects Q().lensflare)
```
Call `star.update(dt)` every frame from your scene.

**`SceneManager`** (`this.sm` inside scenes): `.renderer .scene .camera .controls .stage .background .labels .composer .bloomPass`,
`.flyTo(preset, duration, instant)`, `.flash({intensity, duration})` (DOM white flash; auto-softened for reduced motion — use this, never your own full-screen strobe),
`.addPass(pass)` / `.removePass(pass)` (scene-specific post passes; remove in `exit()`), `.captureEnvironment(size)` → WebGLCubeRenderTarget of stars+Milky Way (for lensing),
`.project(v3)`, `.setRenderSettings()` (called by App from `scene.renderSettings`), `.width .height .pixelRatio`.

**`BaseScene`** — every scene extends it:
```js
class ProtostarScene extends BaseScene {
  constructor(ctx) { super(ctx); this.renderSettings = { bloomStrength: 1.1, bloomRadius: 0.6, bloomThreshold: 0.75, exposure: 1.0, backgroundDim: 0.8 }; }
  build() { /* create objects into this.group; addPickable/addLabel; runs once (lazily) */ }
  enter(params) { /* params: { variant, mass, stage, path, lowZ } — reset per-visit animation */ }
  update(dt, state) { /* dt real seconds. state: Evolution.stateAt(...) when driven by the timeline (state.f = 0..1
                         progress in the stage, state.T/L/R/M/stage), or null in free view (gallery etc.) → use this.time */ }
  exit() { /* remove passes, stop sounds, etc. */ }
  getCameraPreset() { return { position: [0, 3, 14], target: [0, 0, 0], minDistance: 2, maxDistance: 120, fov: 50 }; }
  getFocus(name) { return name === 'disk' ? { position: [...], target: [...] } : null; }
  onParams(params) { /* optional: same scene, new params (mass slider moved, same-scene stage change) */ }
}
Registry.registerScene('protostar', ProtostarScene, { title: 'Protoster', group: 'vorming', infoId: 'protostar', badges: ['schaal', 'tijd'], status: 'waargenomen' });
```
Helpers: `this.setHud(html | null, {wide})` (small on-screen caption/counter box for this scene, e.g. supernova phase ticker; auto-removed on scene change; classes `hud-row`, `hud-step`, `hud-step on` available),
`this.addPickable(object3D, infoId, {priority, highlightTarget, label, tooltip, onHover})`,
`this.makeProxy(radius, infoId, {position, scale, priority:-1})` (invisible click target for particle clouds —
Points are NOT reliable to raycast because their motion is in the shader), `this.addLabel(object3D, infoId, {text, offset:[x,y,z], color, always})`,
`this.track(disposable)`, `this.time` (s since enter), `this.reducedMotion`, `this.quality`, `this.sm`, `this.app`.
Picking: highest `priority` wins, then nearest. Hover highlight: Star.setHighlight / `uHighlight` uniforms / OutlinePass for meshes (automatic).

**`App`** (global, `window.App`): `goToScene(id, params, {focus, instant})`, `goToStage(i, {openInfo, f})`, `stepStage(±1)`,
`setMass(m)`, `setMode(mode)`, `togglePanel('hr'|'classificatie'|'gallery'|'quiz', force)`, `openInfo(id, {focus})`, `play() pause() togglePlay() setSpeed(yps)`,
`.mass .lowZ .path .state .age .stageIndex .playing .speed .mode .activeScene .activeSceneId .sm`, `toast(msg)`, `debugInfo()`, `selfTest({only, dwell})`.

---------------------------------------------------------------------------------------------------

## 4. Content (all Dutch text)

`Content.info[id]` entries — every clickable thing, every stage, every scene has one:
```js
Object.assign(Content.info, {
  'protostar': {
    title: 'Protoster',                          // short, Dutch
    tooltip: 'Jonge ster die nog groeit',        // ≤ ~60 chars, shown on hover and in captions
    kicker: 'Stervorming · fase 3',              // optional small label above the title
    status: 'waargenomen',                       // 'waargenomen' | 'deels' | 'theorie'
    badges: ['schaal'],                          // optional: 'schaal' | 'tijd' | 'traag'
    body: ['…', '…', '…'],                       // 2–4 paragraphs, plain language (B1, "je"-vorm), HTML allowed (<b>, <i>, <sub>, <sup>)
    stats: [['Temperatuur', '2.000–5.000 K'], ['Massa', '…'], ['Straal', '…'], ['Lichtkracht', '…'], ['Duur', '…']],   // kerngetallen, 3–6 rows
    fact: '…',                                   // "Wist je dat?" — surprising, correct
    deeper: ['…<span class="formula">E = mc²</span>…', '<div class="formula-block">L = 4πR²σT⁴</div>'],   // "Dieper duiken" for advanced readers (formulas, numbers, derivations)
    scene: 'protostar', params: { variant: '…' }, focus: 'disk',   // for the "Bekijk in 3D" button
    related: ['collapse', 'jets'],               // 2–5 existing ids
    actions: [{ label: 'Snijd open', scene: 'interior', params: { variant: 'zon' } }],   // optional extra buttons (scene/params/focus/info/mode/mass/toggle)
  },
});
```
Dutch style: correct spelling, Dutch number format (`1,4 M☉`, `15 miljoen K`, `10.000 jaar`, "miljard" = 10⁹, "biljoen" = 10¹²),
units K, M☉, R☉, L☉, km, lichtjaar. Distinguish observed vs theory explicitly (status + wording). Give approximate/uncertain
values as such ("ongeveer", "rond de", ranges). Formulas in "Dieper duiken" with worked examples where useful.

### ID namespaces & ownership (write ONLY your own; reference others' ids only from the lists below)
| owner | ids |
|---|---|
| core | `ui.*` |
| scene owners | `<sceneId>` and `<sceneId>.<part>` for their scenes (see §5) — including all variant ids listed there |
| evolution | `path.<category>`, `evo.*`; plus `Content.paths[category] = { label, route, info:'path.<category>' }` |
| hr | `star.<name>` for the known stars below, `hr.*`; `Content.stars` |
| classification | `class.<O…Y>`, `lum.<0|Ia|Ib|II|III|IV|V|VI|D>`, `size.<name>` (non-star objects), `mk.*`; `Content.spectralClasses/luminosityClasses/sizeComparison` |
| modes | `tour.*`, `quiz.*`, `compare`, `compare.*`; `Content.tour`, `Content.quiz` |

Shared star ids (owned by the HR agent, may be referenced by everyone):
`star.zon star.proxima star.alphaCenA star.siriusA star.siriusB star.vega star.arcturus star.aldebaran star.betelgeuze star.rigel
star.antares star.polaris star.deneb star.etaCarinae star.uyScuti star.barnard star.procyonB star.spica star.mira star.eridaniB`.
Stable scene infoIds everyone may reference: every `<sceneId>` in §5.

---------------------------------------------------------------------------------------------------

## 5. Scenes — ids, variants, owners

| sceneId | owner | group | variants (`params.variant`, first = default) | info ids the owner MUST write (plus any `<sceneId>.<part>` you add) |
|---|---|---|---|---|
| cloud | S1 | vorming | – | cloud |
| collapse | S1 | vorming | – | collapse, collapse.jeans |
| protostar | S1 | vorming | – | protostar |
| jets | S1 | vorming | – | jets, jets.hh |
| ttauri | S2 | vorming | ttauri, herbig, massief, bruineDwerg | ttauri, ttauri.herbig, ttauri.massief, ttauri.bruineDwerg |
| ignition | S2 | vorming | waterstof, deuterium | ignition, ignition.deuterium |
| mainSequence | S2 | vorming | – (colour/size from state/mass: O…K stars) | mainSequence |
| redDwarf | S2 | evolutie | rood, blauw | redDwarf, redDwarf.blauw |
| brownDwarf | S2 | evolutie | L, T, Y | brownDwarf, brownDwarf.T, brownDwarf.Y |
| redGiant | S3 | evolutie | rodeReus, subreus | redGiant, redGiant.subreus |
| heliumFlash | S3 | evolutie | – | heliumFlash |
| horizontalBranch | S3 | evolutie | horizontaleTak, heliumKern (2–8 M☉: quiet non-degenerate He ignition) | horizontalBranch, horizontalBranch.heliumKern |
| agb | S3 | evolutie | – | agb |
| supergiant | S3 | evolutie | rood, blauw, schillen | supergiant, supergiant.blauw, supergiant.schillen |
| wolfRayet | S3 | evolutie | wr, lbv | wolfRayet, wolfRayet.lbv |
| planetaryNebula | S4 | eindproduct | – | planetaryNebula |
| whiteDwarf | S4 | eindproduct | CO, He, ONe | whiteDwarf, whiteDwarf.He, whiteDwarf.ONe, whiteDwarf.chandrasekhar |
| blackDwarf | S4 | eindproduct | – | blackDwarf |
| typeIa | S4 | eindproduct (gallery section 'explosie') | – | typeIa |
| coreCollapse | S5 | eindproduct ('explosie') | II, Ibc, direct | coreCollapse, coreCollapse.Ibc, coreCollapse.direct |
| pairInstability | S5 | eindproduct ('explosie') | explosie, rest | pairInstability, pairInstability.rest |
| neutronStar | S5 | eindproduct | pulsar, magnetar | neutronStar, neutronStar.magnetar, neutronStar.tov |
| kilonova | S5 | eindproduct ('explosie') | – | kilonova |
| blackHole | S6 | eindproduct | stellair, superzwaar | blackHole, blackHole.horizon, blackHole.photonSphere, blackHole.disk, blackHole.jets, blackHole.superzwaar |
| interior | S7 | doorsnede | zon, rodeDwerg, heet, uienschil | interior, + one id per layer/phenomenon (see S7 brief) |
| compare | modes | overig | – | compare |

Every end product (group 'eindproduct') gets a `gallery` card (or several — e.g. neutronStar: pulsar + magnetar; blackHole: stellair + superzwaar).
Scenes must work for all their variants, with `state === null` (free view, loop the animation on `this.time`)
AND with timeline state (drive the sequence with `state.f`, read `state.T`, `state.R`, `state.L`, `state.M`, `state.stage`).
While paused (f constant) the scene must still look alive (rotation, turbulence, twinkling) and complete.

### Canonical evolution paths (evolution agent implements; stage `sceneId`/`params.variant`/`infoId` must come from §5)
Formation stages (kind 'formation') for every mass: cloud → collapse → protostar → jets → ttauri (variant by mass:
<0.08 'bruineDwerg', 0.08–2 'ttauri', 2–8 'herbig', >8 'massief') → ignition ('waterstof'; brown dwarfs: stage id 'deuterium', variant 'deuterium', infoId 'ignition.deuterium')
→ main sequence (sceneId 'mainSequence' for ≥0.5 M☉, 'redDwarf' for 0.08–0.5, 'brownDwarf' for <0.08).
Then: brown dwarf: brownDwarf(L) → brownDwarf(T) → brownDwarf(Y). Red dwarf: redDwarf(rood) → redDwarf(blauw, <~0.25 M☉) → whiteDwarf(He) → blackDwarf.
Sun-like 0.5–8: redGiant(subreus) → redGiant(rodeReus) → [< ~2 M☉: heliumFlash → horizontalBranch(horizontaleTak) | 2–8 M☉: horizontalBranch(heliumKern)] → agb → planetaryNebula → whiteDwarf(CO, or ONe near 7–8) → blackDwarf.
Massive 8–25: supergiant(blauw) → supergiant(rood) → supergiant(schillen) → coreCollapse(II) → neutronStar(pulsar).
Very massive >25: wolfRayet(lbv) → wolfRayet(wr) → coreCollapse(Ibc, or 'direct' for the heaviest) → blackHole(stellair).
Low metallicity ≥ ~130 M☉ (lowZ): supergiant(blauw) → pairInstability(explosie) → pairInstability(rest).
Stage object: `{ id, kind:'formation'|'evolution', sceneId, params:{variant}, infoId, label, short, duration (yr), start (yr), track:[[f, logL, logT, R(R☉), M(M☉)], …], minSeconds? }`.

---------------------------------------------------------------------------------------------------

## 6. Module interfaces
- **HRDiagram** (`60-hrdiagram.js`, top-level name `HRDiagram` only; `Registry.register('HRDiagram', HRDiagram)`):
  `new HRDiagram(containerEl, app)`, `.setPath(path)`, `.setState(state)` (called every frame — must be cheap: redraw at most ~30×/s,
  only the dynamic layer), `.setCompare(stateA, stateB)`, `.clearCompare()`, `.resize()`, `.onShow()`, `.onHide()`.
  Clicking a star / region → `bus.emit('info', id)`.
- **ClassificationPanel** (`62-classification.js`; `Registry.register('ClassificationPanel', ClassificationPanel)`): `new ClassificationPanel(containerEl, app)`, `.onShow()`, `.onHide()`.
- **TourMode** (`70-tour.js`), **QuizMode** (`72-quiz.js`), **CompareMode** (`74-compare.js`) — see the modes brief.
  Register as `Registry.register('TourMode', TourMode)` etc. `new TourMode(app, cardEl)`, `new QuizMode(app, bodyEl)`, `new CompareMode(app, panelEl)`.

---------------------------------------------------------------------------------------------------

## 7. Science reference (use these values so all parts agree; give ranges/uncertainty where noted)
- **Zon**: 1,989 × 10³⁰ kg; straal 696.000 km; L☉ = 3,83 × 10²⁶ W; T_eff 5.772 K; kern ~15,7 miljoen K, ~150 g/cm³; leeftijd 4,6 miljard jaar; hoofdreeks ~10 miljard jaar; G2V.
  Stralingszone ~0,25–0,7 R☉; convectiezone 0,7–1 R☉; fotosfeer ~5.800 K; chromosfeer ~4.000–25.000 K; corona 1–3 miljoen K (coronaal verhittingsprobleem: deels onopgelost).
  Foton-"random walk" door de stralingszone: tienduizenden tot honderdduizenden jaren (schattingen ~10.000–170.000 jaar).
- Fusie start bij ~10 miljoen K in de kern. pp-keten domineert tot ~1,3 M☉; daarboven CNO-cyclus (kern > ~17 miljoen K).
  4 ¹H → ⁴He + 2 e⁺ + 2 νₑ + 26,7 MeV; ~0,7 % van de massa wordt energie (E = mc²); de Zon zet ~4 miljoen ton massa per seconde om in energie (~600 miljoen ton H → He per seconde).
- Grenzen (bij benadering; hangen af van metaalgehalte, rotatie, dubbelsterren): waterstoffusie ≥ ~0,075–0,08 M☉ (~75–80 M_Jupiter); deuteriumfusie ≥ ~13 M_J;
  rode dwergen volledig convectief < ~0,35 M☉; heliumflits ~0,5–2 M☉; witte dwerg < ~8 M☉ beginmassa; neutronenster ~8–25 M☉; zwart gat > ~25 M☉; paarinstabiliteit ~130–250 M☉ bij laag metaalgehalte.
- Hoofdreekslevensduur ≈ 10¹⁰ jaar × (M/M☉)^−2,5 (grof); rode dwerg 0,1 M☉: biljoenen jaren (~10¹²–10¹³); 15 M☉: ~12–15 miljoen jaar; 40 M☉: ~5 miljoen jaar.
- Moleculaire wolk: 10–20 K, 10²–10⁶ moleculen/cm³, reuzenwolken 10⁴–10⁶ M☉; vrije-valtijd ~10⁵–10⁶ jaar. Jeans-massa M_J ∝ T^(3/2) ρ^(−1/2).
- Protoster (klasse 0/I) ~10⁵ jaar; jets 100–1.000 km/s; Herbig-Haro-objecten (HH 46/47, HH 211); T Tauri 1–10 miljoen jaar (HL Tauri-schijf, ALMA 2014).
- Heliumflits bij ~100 miljoen K in een ontaarde heliumkern van ~0,45 M☉; duurt seconden–minuten, onzichtbaar aan het oppervlak (energie wordt in de ster geabsorbeerd).
- Planetaire nevel: ~10.000–50.000 jaar zichtbaar; centrale ster 25.000–200.000 K; Ringnevel M57 (~2.600 lj), Kattenoognevel NGC 6543 (~3.300 lj), Helixnevel.
- Witte dwerg: typisch ~0,6 M☉, ~Aarde-groot (Sirius B: 1,02 M☉, straal ~5.800 km); elektronendegeneratiedruk; Chandrasekhar-limiet ~1,4 M☉ (1,44); theelepel ~5–15 ton.
  Zwarte dwerg: afkoeling duurt > 10¹⁵ jaar; bestaat nog niet (heelal 13,8 miljard jaar) → 'theorie'.
- Type Ia: witte dwerg nadert ~1,4 M☉ (of fusie van twee witte dwergen); ~0,6 M☉ ⁵⁶Ni; piek ~5 miljard L☉ (M ≈ −19,3); standaardkaarsen → versnelde uitdijing (Nobelprijs 2011); SN 1572 (Tycho), SN 2011fe.
- Kerninstorting (type II): ijzerkern ~1,4 M☉ stort in ~0,1–0,25 s in, snelheden tot ~70.000 km/s (~¼ c); terugkaatsing bij kerndichtheid; ~10⁵⁸ neutrino's, ~99 % van ~10⁴⁶ J in neutrino's; ~10⁴⁴ J kinetische energie;
  SN 1987A (25 neutrino's gedetecteerd); Krabnevel = restant van SN 1054. Schillenfusie (15–25 M☉): H ~10 miljoen jaar, He ~1 miljoen jaar, C ~1.000 jaar, Ne ~1 jaar, O ~1 jaar (maanden), Si ~1 dag. IJzer-56 (nikkel-62) heeft de hoogste bindingsenergie per nucleon → fusie voorbij ijzer kost energie.
- Neutronenster: 1,1–2,3 M☉ (typisch ~1,4), diameter ~20–24 km, dichtheid ~4 × 10¹⁷ kg/m³, theelepel ~ miljarden ton; snelste pulsar 716 keer per seconde (PSR J1748−2446ad);
  magnetar 10⁹–10¹¹ tesla; TOV-limiet ~2,2–2,3 M☉ (onzeker, 2–3 M☉); zwaarste gemeten ~2,35 M☉ (PSR J0952−0607). Pulsars ontdekt door Jocelyn Bell Burnell (1967).
- Zwart gat: r_s = 2GM/c² ≈ 2,95 km per M☉ (10 M☉ → ~30 km); fotonsfeer 1,5 r_s; ISCO 3 r_s (niet-draaiend); Cygnus X-1 ~21 M☉; GW150914 (36 + 29 → 62 M☉, 2015);
  Sgr A* ~4,3 miljoen M☉ (EHT-beeld 2022), M87* ~6,5 miljard M☉ (EHT-beeld 2019). Hawkingtemperatuur 1 M☉ ~6 × 10⁻⁸ K, verdamping ~10⁶⁷ jaar → 'theorie'.
- Kilonova: GW170817 (17 augustus 2017), ~130 miljoen lichtjaar, NGC 4993, gammaflits 1,7 s na het zwaartekrachtgolfsignaal; r-proces → goud/platina (schatting: enkele aardmassa's zware elementen).
- Paarinstabiliteitssupernova: kern zo heet (~10⁹ K) dat fotonen e⁺e⁻-paren vormen → drukverlies → instorting → thermonucleaire explosie die de ster volledig verscheurt; kandidaat SN 2007bi (niet zeker) → 'deels'/'theorie'.
- Wolf-Rayet: 30.000–200.000 K, winden ~10⁻⁵ M☉/jaar bij ~1.000–3.000 km/s. LBV: Eta Carinae (Grote Uitbarsting 1843, ~10 M☉ uitgestoten → Homunculusnevel), P Cygni.
- Spectraalklassen (hoofdreeks): O ≥ 30.000 K; B 10.000–30.000; A 7.500–10.000; F 6.000–7.500; G 5.200–6.000; K 3.700–5.200; M 2.400–3.700; L 1.300–2.400; T 550–1.300; Y < 550.
  Aandeel hoofdreekssterren: O ~0,00003 %, B ~0,1 %, A ~0,6 %, F ~3 %, G ~7,6 %, K ~12 %, M ~76 %.

---------------------------------------------------------------------------------------------------

## 8. Visual, performance & accessibility rules
- Look: deep space, HDR + bloom. Values > 1 in colour bloom (threshold ~0.8). Use `U.starColor(T)` for anything star-coloured.
  Rich shader work (FBM noise, fresnel, additive glows, soft particles). Cinematic but readable; avoid a blown-out white screen.
  Tune `this.renderSettings` per scene. Background stars stay visible unless the scene needs darkness (`backgroundDim`).
- World units: keep scene geometry within ~1.500 units of the origin (background shells sit at 2.600–9.000).
  Typical star radius 1–6 units, camera 6–80 units away. Set sensible `minDistance`/`maxDistance`.
- Label anything re-scaled with badge `'schaal'` (Niet op schaal), time-lapsed with `'tijd'` (Tijd versneld), slowed with `'traag'` (Slow motion) in the scene meta.
- Performance (target 60 fps on an ordinary laptop iGPU at 'middel'): per scene ≤ ~150k particles at 'hoog' (always via `ParticleSystems.count`),
  ≤ ~120 draw calls, no per-frame CPU loops over > ~5k elements, no per-frame allocations in hot paths (reuse vectors),
  no full-screen per-pixel raymarching except the black hole (which must scale with `Q().bhSteps`/`Q().bhScale`). Sphere segments from `Q().sphereSeg`.
  Dispose everything you create (BaseScene.dispose handles objects in `this.group`; `track()` other resources).
- **Everything is clickable**: every distinct visual element (star, layer, disk, jet, nebula shell, field line, companion, …) is a pickable with
  its own info entry (use `makeProxy` for particle volumes). Add labels (`addLabel`) for the main parts so keyboard/touch users can reach them.
- `Settings.reducedMotion` (`this.reducedMotion`): no strobing, no fast flashes (use `sm.flash`, which softens itself), slower spins, no camera shake.
- Mobile/touch: everything must work with taps (no hover-only information).

## 9. Definition of done (every agent)
1. Only your own files; published to `src/`; `python3 tools/build.py --check` passes.
2. `tools/cdp.py` on the full build with your scenes / modules: **0 errors**; `App.selfTest({only:[your scene ids]})` → all ok, `missingInfo: []` for your scenes.
3. Screenshots reviewed with the Read tool for every scene/variant (desktop) and at least one mobile screenshot; visuals are beautiful and correct.
4. All Dutch text complete, correct and checked against §7; no TODO/placeholder text.
5. Final report: files, top-level names, scene ids + variants, info ids written, ids you reference that others own, known limitations.
