/* Fusion data for the core panel: every nuclear process the model can switch on (Evolution
   stage.fusion.core / shells / extra), the reaction steps shown in the animation, element and
   layer colours, and the energy sources used when nothing fuses. Long explanations live in
   Content.info['fusion.<id>'] / ['bron.<id>'] (16-content-lab.js). */

Object.assign(Content, {
  /** Nuclides and particles drawn in the reaction animation: Z protons, A nucleons. */
  nuclides: {
    H1: { Z: 1, A: 1, l: '¹H' }, H2: { Z: 1, A: 2, l: '²H' }, He3: { Z: 2, A: 3, l: '³He' }, He4: { Z: 2, A: 4, l: '⁴He' },
    Li7: { Z: 3, A: 7, l: '⁷Li' }, Be8: { Z: 4, A: 8, l: '⁸Be' }, C12: { Z: 6, A: 12, l: '¹²C' }, C13: { Z: 6, A: 13, l: '¹³C' },
    N13: { Z: 7, A: 13, l: '¹³N' }, N14: { Z: 7, A: 14, l: '¹⁴N' }, N15: { Z: 7, A: 15, l: '¹⁵N' }, O15: { Z: 8, A: 15, l: '¹⁵O' },
    O16: { Z: 8, A: 16, l: '¹⁶O' }, Ne20: { Z: 10, A: 20, l: '²⁰Ne' }, Na23: { Z: 11, A: 23, l: '²³Na' }, Mg24: { Z: 12, A: 24, l: '²⁴Mg' },
    Si28: { Z: 14, A: 28, l: '²⁸Si' }, P31: { Z: 15, A: 31, l: '³¹P' }, S32: { Z: 16, A: 32, l: '³²S' }, Ar36: { Z: 18, A: 36, l: '³⁶Ar' },
    Ca40: { Z: 20, A: 40, l: '⁴⁰Ca' }, Fe52: { Z: 26, A: 52, l: '⁵²Fe' }, Ni56: { Z: 28, A: 56, l: '⁵⁶Ni' }, Co56: { Z: 27, A: 56, l: '⁵⁶Co' },
    Fe56: { Z: 26, A: 56, l: '⁵⁶Fe' }, Fe57: { Z: 26, A: 57, l: '⁵⁷Fe' }, Fe59: { Z: 26, A: 59, l: '⁵⁹Fe' }, Co59: { Z: 27, A: 59, l: '⁵⁹Co' },
    n: { Z: 0, A: 1, l: 'n' },
    g: { particle: 'gamma', l: 'γ' }, nu: { particle: 'nu', l: 'νₑ' }, nubar: { particle: 'nu', l: 'ν̄ₑ' },
    'e+': { particle: 'lepton', l: 'e⁺' }, 'e-': { particle: 'lepton', l: 'e⁻' },
  },

  /** Processes: name, net reaction, fuel → product, ignition temperature, colour, and the steps of the animation. */
  fusion: {
    deuterium: {
      name: 'Deuteriumfusie', net: '²H + ¹H → ³He + γ', fuel: 'deuterium', product: 'helium-3', temp: 'vanaf ~1 miljoen K', color: '#ff9f6e',
      steps: [{ in: ['H2', 'H1'], out: ['He3', 'g'], eq: '²H + ¹H → ³He + γ', txt: 'Een deuteriumkern vangt een proton.' }],
    },
    lithium: {
      name: 'Lithiumverbranding', net: '⁷Li + ¹H → 2 ⁴He', fuel: 'lithium', product: 'helium', temp: 'vanaf ~2,5 miljoen K', color: '#ff7eb6',
      steps: [{ in: ['Li7', 'H1'], out: ['He4', 'He4'], eq: '⁷Li + ¹H → 2 ⁴He', txt: 'Lithium valt uiteen in twee heliumkernen.' }],
    },
    pp: {
      name: 'pp-keten', net: '4 ¹H → ⁴He + 2 e⁺ + 2 νₑ', fuel: 'waterstof', product: 'helium', temp: 'vanaf ~4 miljoen K', color: '#ffb45c',
      steps: [
        { in: ['H1', 'H1'], out: ['H2', 'e+', 'nu'], eq: '¹H + ¹H → ²H + e⁺ + νₑ', txt: 'Twee protonen smelten samen; één verandert in een neutron.' },
        { in: ['H2', 'H1'], out: ['He3', 'g'], eq: '²H + ¹H → ³He + γ', txt: 'Deuterium vangt nog een proton.' },
        { in: ['He3', 'He3'], out: ['He4', 'H1', 'H1'], eq: '³He + ³He → ⁴He + 2 ¹H', txt: 'Twee helium-3-kernen worden helium-4; er komen 2 protonen vrij.' },
      ],
    },
    cno: {
      name: 'CNO-cyclus', net: '4 ¹H → ⁴He + 2 e⁺ + 2 νₑ', fuel: 'waterstof', product: 'helium', temp: 'boven ~17 miljoen K', color: '#6ee7ff',
      steps: [
        { in: ['C12', 'H1'], out: ['N13', 'g'], eq: '¹²C + ¹H → ¹³N + γ', txt: 'Koolstof vangt een proton.' },
        { in: ['N13'], out: ['C13', 'e+', 'nu'], eq: '¹³N → ¹³C + e⁺ + νₑ', txt: 'Stikstof-13 vervalt.' },
        { in: ['C13', 'H1'], out: ['N14', 'g'], eq: '¹³C + ¹H → ¹⁴N + γ', txt: 'Nog een proton erbij.' },
        { in: ['N14', 'H1'], out: ['O15', 'g'], eq: '¹⁴N + ¹H → ¹⁵O + γ', txt: 'Stikstof vangt een proton (de traagste stap).' },
        { in: ['O15'], out: ['N15', 'e+', 'nu'], eq: '¹⁵O → ¹⁵N + e⁺ + νₑ', txt: 'Zuurstof-15 vervalt.' },
        { in: ['N15', 'H1'], out: ['C12', 'He4'], eq: '¹⁵N + ¹H → ¹²C + ⁴He', txt: 'Helium komt vrij en de koolstof is terug: een kringloop.' },
      ],
    },
    triplealpha: {
      name: 'Heliumfusie (3-alfaproces)', net: '3 ⁴He → ¹²C + γ', fuel: 'helium', product: 'koolstof en zuurstof', temp: 'vanaf ~100 miljoen K', color: '#ffe066',
      steps: [
        { in: ['He4', 'He4'], out: ['Be8'], eq: '⁴He + ⁴He ⇄ ⁸Be', txt: 'Twee heliumkernen vormen heel even beryllium-8.' },
        { in: ['Be8', 'He4'], out: ['C12', 'g'], eq: '⁸Be + ⁴He → ¹²C + γ', txt: 'Een derde heliumkern maakt er koolstof van.' },
        { in: ['C12', 'He4'], out: ['O16', 'g'], eq: '¹²C + ⁴He → ¹⁶O + γ', txt: 'Een deel van de koolstof wordt zuurstof.' },
      ],
    },
    carbon: {
      name: 'Koolstoffusie', net: '¹²C + ¹²C → ²⁰Ne + ⁴He', fuel: 'koolstof', product: 'neon, natrium, magnesium', temp: '~0,8 miljard K', color: '#c4c4d4',
      steps: [
        { in: ['C12', 'C12'], out: ['Ne20', 'He4'], eq: '¹²C + ¹²C → ²⁰Ne + ⁴He', txt: 'Twee koolstofkernen worden neon.' },
        { in: ['C12', 'C12'], out: ['Na23', 'H1'], eq: '¹²C + ¹²C → ²³Na + ¹H', txt: 'Of natrium, met een los proton.' },
      ],
    },
    neon: {
      name: 'Neonfusie', net: '2 ²⁰Ne → ¹⁶O + ²⁴Mg', fuel: 'neon', product: 'zuurstof en magnesium', temp: '~1,5 miljard K', color: '#ff8ee0',
      steps: [
        { in: ['Ne20', 'g'], out: ['O16', 'He4'], eq: '²⁰Ne + γ → ¹⁶O + ⁴He', txt: 'Zo heet dat licht neonkernen kapotschiet.' },
        { in: ['Ne20', 'He4'], out: ['Mg24', 'g'], eq: '²⁰Ne + ⁴He → ²⁴Mg + γ', txt: 'De vrije heliumkern maakt magnesium.' },
      ],
    },
    oxygen: {
      name: 'Zuurstoffusie', net: '¹⁶O + ¹⁶O → ²⁸Si + ⁴He', fuel: 'zuurstof', product: 'silicium en zwavel', temp: '~2 miljard K', color: '#5ec8ff',
      steps: [
        { in: ['O16', 'O16'], out: ['Si28', 'He4'], eq: '¹⁶O + ¹⁶O → ²⁸Si + ⁴He', txt: 'Twee zuurstofkernen worden silicium.' },
        { in: ['O16', 'O16'], out: ['P31', 'H1'], eq: '¹⁶O + ¹⁶O → ³¹P + ¹H', txt: 'Of fosfor, met een los proton.' },
      ],
    },
    silicon: {
      name: 'Siliciumfusie', net: '²⁸Si + 7 ⁴He → ⁵⁶Ni', fuel: 'silicium', product: 'nikkel-56 → ijzer', temp: '~3–3,5 miljard K', color: '#e39b5e',
      steps: [
        { in: ['Si28', 'He4'], out: ['S32', 'g'], eq: '²⁸Si + ⁴He → ³²S + γ', txt: 'Silicium vangt heliumkernen, één voor één.' },
        { in: ['S32', 'He4'], out: ['Ar36', 'g'], eq: '³²S + ⁴He → ³⁶Ar + γ', txt: 'Zwavel wordt argon…' },
        { in: ['Ar36', 'He4'], out: ['Ca40', 'g'], eq: '³⁶Ar + ⁴He → ⁴⁰Ca + γ', txt: '…argon wordt calcium…' },
        { in: ['Fe52', 'He4'], out: ['Ni56', 'g'], eq: '⁵²Fe + ⁴He → ⁵⁶Ni + γ', txt: '…tot nikkel-56. Daarna levert fusie geen energie meer op.' },
      ],
    },
    collapse: {
      name: 'Kerninstorting', net: 'p + e⁻ → n + νₑ', fuel: 'ijzer', product: 'neutronen', temp: '> 10 miljard K', color: '#a99bff', notFusion: true,
      steps: [
        { in: ['Fe56', 'g'], out: ['He4', 'He4', 'He4', 'n', 'n'], eq: '⁵⁶Fe + γ → 13 ⁴He + 4 n', txt: 'Gammastraling schiet ijzerkernen kapot. Dat kost energie: de kern bezwijkt.' },
        { in: ['H1', 'e-'], out: ['n', 'nu'], eq: 'p + e⁻ → n + νₑ', txt: 'Protonen en elektronen worden neutronen en neutrino\'s.' },
      ],
    },
    explosive: {
      name: 'Explosieve nucleosynthese', net: '→ ⁵⁶Ni → ⁵⁶Co → ⁵⁶Fe', fuel: 'zuurstof en silicium', product: 'nikkel-56, later ijzer', temp: 'miljarden K (in seconden)', color: '#ff6b4a',
      steps: [
        { in: ['O16', 'O16'], out: ['Si28', 'He4'], eq: '¹⁶O + ¹⁶O → ²⁸Si + ⁴He', txt: 'De schokgolf laat de schillen in een flits fuseren.' },
        { in: ['Ni56'], out: ['Co56', 'e+', 'nu'], eq: '⁵⁶Ni → ⁵⁶Co + e⁺ + νₑ', txt: 'Radioactief nikkel vervalt (halveringstijd 6 dagen)…' },
        { in: ['Co56'], out: ['Fe56', 'e+', 'nu'], eq: '⁵⁶Co → ⁵⁶Fe + e⁺ + νₑ', txt: '…tot ijzer (77 dagen). Dat verval laat de supernova maandenlang nagloeien.' },
      ],
    },
    sprocess: {
      name: 's-proces', net: '⁵⁶Fe + n → … → Sr, Ba, Pb', fuel: 'ijzer + neutronen', product: 'zware elementen', temp: '~100–300 miljoen K', color: '#9be36e',
      steps: [
        { in: ['Fe56', 'n'], out: ['Fe57', 'g'], eq: '⁵⁶Fe + n → ⁵⁷Fe + γ', txt: 'IJzer vangt langzaam neutronen.' },
        { in: ['Fe59'], out: ['Co59', 'e-', 'nubar'], eq: '⁵⁹Fe → ⁵⁹Co + e⁻ + ν̄ₑ', txt: 'Te veel neutronen: een neutron wordt een proton (bètaverval).' },
      ],
    },
    pair: {
      name: 'Paarvorming', net: 'γ + γ → e⁻ + e⁺', fuel: 'licht (fotonen)', product: 'elektron-positronparen', temp: '~1 miljard K', color: '#ff5d8f', notFusion: true,
      steps: [
        { in: ['g', 'g'], out: ['e-', 'e+'], eq: 'γ + γ → e⁻ + e⁺', txt: 'Licht wordt materie: de druk valt weg en de kern stort in.' },
        { in: ['O16', 'O16'], out: ['Si28', 'He4'], eq: '¹⁶O + ¹⁶O → ²⁸Si + ⁴He', txt: 'Explosieve zuurstoffusie verscheurt de hele ster.' },
      ],
    },
  },

  /** What powers the object when no fusion runs (id matches stage.fusion.source; info in 'bron.<id>'). */
  sources: {
    cloud: { name: 'Nog geen ster', txt: 'Koud gas en stof van 10–20 K.' },
    gravity: { name: 'Samentrekking', txt: 'Zwaartekracht perst het gas samen en maakt het heet.' },
    cooling: { name: 'Restwarmte', txt: 'Geen fusie meer: het object koelt langzaam af.' },
    ns: { name: 'Afkoelen', txt: 'Geen fusie: de neutronenster koelt af, eerst vooral via neutrino\'s.' },
    bh: { name: 'Geen', txt: 'Geen fusie en geen licht: alles valt naar binnen.' },
    void: { name: 'Niets', txt: 'De ster is volledig uit elkaar geblazen.' },
  },

  /** Colours + names of elements (composition bar) and of layers (cross-section). */
  elements: {
    H: { name: 'Waterstof', color: '#ff7a8a' }, He: { name: 'Helium', color: '#ffd166' }, C: { name: 'Koolstof', color: '#c4c4d4' },
    O: { name: 'Zuurstof', color: '#5ec8ff' }, Ne: { name: 'Neon', color: '#ff8ee0' }, Mg: { name: 'Magnesium', color: '#9be36e' },
    Si: { name: 'Silicium', color: '#e39b5e' }, Fe: { name: 'IJzer', color: '#b5705a' }, n: { name: 'Neutronen', color: '#8f87ff' },
    Z: { name: 'Overige', color: '#5b6275' },
  },
  layers: {
    H: { name: 'Waterstof', color: '#ff7a8a' }, He: { name: 'Helium', color: '#ffd166' }, CO: { name: 'Koolstof + zuurstof', color: '#9fb4d0' },
    ONe: { name: 'Zuurstof, neon, magnesium', color: '#b58fe0' }, Si: { name: 'Silicium + zwavel', color: '#e39b5e' }, Fe: { name: 'IJzer', color: '#b5705a' },
    n: { name: 'Neutronen', color: '#8f87ff' },
  },
});

Object.assign(Content.ui, {
  lab: {
    kicker: 'Maak je eigen ster',
    start: 'Laat je ster leven',
    panelTitle: 'In de kern',
    collapse: 'Kernpaneel in- of uitklappen',
    coreFusion: 'Fusie in de kern',
    shellFusion: 'Fusie in schillen',
    extra: 'Ook actief',
    noFusion: 'Geen fusie',
    energy: 'Energiebron',
    coreTemp: 'Kerntemperatuur',
    comp: 'Samenstelling van de kern',
    section: 'Doorsnede (schematisch)',
    surface: 'Aan de buitenkant',
    stats: { T: 'Temperatuur', L: 'Lichtkracht', R: 'Straal', M: 'Massa', cls: 'Klasse' },
    stepOf: (i, n) => `stap ${i} van ${n}`,
    noComp: 'Achter de waarnemingshorizon valt niets te meten.',
    nothing: 'Er is niets meer over.',
    convective: 'Volledig convectief: de hele ster mengt, dus alle waterstof kan opgebruikt worden.',
    degenerate: 'Ontaarde kern: de druk komt van dicht op elkaar geperste elektronen, niet van de temperatuur.',
    sunSize: 'Grootte van de Zon',
    thresholds: [[1e6, 'D'], [1e7, 'H'], [1e8, 'He'], [8e8, 'C'], [3e9, 'Si']],
    clickHint: 'Klik voor uitleg',
    phaseFast: 'fase versneld',
  },
});
