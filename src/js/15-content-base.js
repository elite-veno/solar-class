/* Content: ALL Dutch text lives in this one data object. Other files in the
   16-content-*.js range only add entries to it (Object.assign), so the whole
   text base stays together in one section of the final file. */

const Content = {
  ui: {
    appTitle: 'Het leven van sterren',
    status: {
      waargenomen: { label: 'Waargenomen', cls: 'badge-obs', info: 'ui.waargenomen' },
      deels: { label: 'Deels waargenomen', cls: 'badge-partial', info: 'ui.deels' },
      theorie: { label: 'Theorie', cls: 'badge-theory', info: 'ui.theorie' },
    },
    badges: {
      schaal: { label: 'Niet op schaal', cls: 'badge-scale', info: 'ui.schaal' },
      tijd: { label: 'Tijd versneld', cls: 'badge-time', info: 'ui.tijd' },
      traag: { label: 'Slow motion', cls: 'badge-slow', info: 'ui.traag' },
    },
    modes: {
      levensloop: 'Levensloop', eindproducten: 'Eindproducten', binnenkant: 'Binnenkant', vergelijken: 'Vergelijken', rondleiding: 'Rondleiding',
    },
    infoPanel: { stats: 'Kerngetallen', fact: 'Wist je dat?', deeper: 'Dieper duiken', prev: 'Vorige fase', next: 'Volgende fase', view3d: 'Bekijk in 3D', related: 'Zie ook' },
    tooltipHint: 'Klik voor uitleg',
    tooltipHintTouch: 'Tik voor uitleg',
    play: 'Afspelen (spatie)', pause: 'Pauzeren (spatie)',
    speedFmt: (yps) => '1 s = ' + U.fmtYears(yps, 2),
    ageFmt: (y) => U.fmtYears(y, 3),
    stageN: (i, n) => `Fase ${i} van ${n}`,
    massPresets: [
      { m: 0.05, label: 'Bruine dwerg' }, { m: 0.2, label: 'Rode dwerg' }, { m: 1, label: 'Zon' },
      { m: 3, label: '3 M☉' }, { m: 15, label: '15 M☉' }, { m: 40, label: '40 M☉' },
    ],
    massNote: 'De grenzen tussen de paden zijn bij benadering: ze hangen af van het metaalgehalte, de rotatie en of de ster een begeleider heeft in een dubbelstersysteem.',
    webglError: '<h2>3D-weergave niet beschikbaar</h2><p>Je browser of apparaat ondersteunt geen WebGL, of het staat uit.<br>Probeer een recente versie van Chrome, Firefox, Edge of Safari, of zet hardwareversnelling aan.</p>',
    loadError: '<h2>Er ging iets mis bij het laden</h2><p>Controleer je internetverbinding: de 3D-bibliotheek (Three.js) wordt van internet geladen.</p>',
    objectsEmpty: 'In deze scène zijn geen aparte onderdelen.',
    gallerySections: { eindproduct: 'Eindproducten van sterren', explosie: 'Explosies en botsingen' },
    galleryIntro: 'Wat blijft er over als een ster sterft? Dat hangt vooral af van de beginmassa. Kies een eindproduct om het in 3D te bekijken.',
    fpsSuffix: ' fps',
    qualityChanged: (q) => `Kwaliteit: ${q}`,
    reducedOn: 'Minder beweging staat aan: geen flitsen en geen automatische camerabewegingen.',
  },

  help: `
    <p>Deze simulatie laat zien hoe sterren ontstaan, leven en sterven. Alles wat je ziet is aanklikbaar: sterren, lagen, schijven, jets, nevels, punten in het HR-diagram en de fasen in de tijdlijn.</p>
    <div class="help-grid">
      <kbd>Slepen</kbd><span>Camera draaien (op een touchscreen: één vinger)</span>
      <kbd>Scrollen</kbd><span>In- en uitzoomen (op een touchscreen: knijpen)</span>
      <kbd>Rechts slepen</kbd><span>Camera verschuiven (touchscreen: twee vingers)</span>
      <kbd>Spatie</kbd><span>Tijd afspelen of pauzeren</span>
      <kbd>← →</kbd><span>Vorige of volgende fase</span>
      <kbd>1 – 8</kbd><span>Onderdelen: levensloop, eindproducten, binnenkant, HR-diagram, classificatie, vergelijken, rondleiding, quiz</span>
      <kbd>O</kbd><span>Lijst met aanklikbare objecten in beeld</span>
      <kbd>H</kbd><span>HR-diagram tonen of verbergen</span>
      <kbd>I</kbd><span>Uitleg van de huidige fase openen</span>
      <kbd>R</kbd><span>Camera terugzetten</span>
      <kbd>Esc</kbd><span>Paneel of venster sluiten</span>
      <kbd>Tab</kbd><span>Door knoppen en labels lopen; <kbd>Enter</kbd> kiest</span>
    </div>
    <p class="hint">Labels met <span class="badge badge-scale">Niet op schaal</span> en <span class="badge badge-time">Tijd versneld</span> geven aan waar afmetingen of tijd zijn aangepast om alles zichtbaar te maken. <span class="badge badge-obs">Waargenomen</span> en <span class="badge badge-theory">Theorie</span> laten zien wat astronomen echt gezien hebben en wat (nog) alleen voorspeld is.</p>`,

  /** Info entries: id -> { title, tooltip, kicker, status, body[], stats[[k,v]], fact, deeper[], scene, params, focus, related[], actions[] } */
  info: {
    'ui.schaal': {
      title: 'Niet op schaal', kicker: 'Over deze simulatie', tooltip: 'Afmetingen zijn aangepast',
      body: [
        'Sterren verschillen enorm in grootte. Een neutronenster is ongeveer 20 kilometer groot, een rode superreus kan meer dan een miljard kilometer groot zijn. Als we alles op ware grootte zouden tekenen, zag je het ene object helemaal niet of paste het andere niet in beeld.',
        'Daarom zijn afmetingen en afstanden in veel scènes aangepast. Waar dat zo is, staat het label <b>Niet op schaal</b>. De getallen in de uitleg zijn wel de echte waarden.',
      ],
      fact: 'Als de Zon zo groot was als een voetbal, dan was de Aarde een peperkorrel op 25 meter afstand, en de dichtstbijzijnde ster (Proxima Centauri) een pingpongbal op zo\'n 6500 kilometer afstand.',
      related: ['ui.tijd'],
    },
    'ui.tijd': {
      title: 'Tijd versneld', kicker: 'Over deze simulatie', tooltip: 'De tijd loopt veel sneller',
      body: [
        'Het leven van een ster duurt miljoenen tot biljoenen jaren. Om dat in een paar minuten te laten zien, laten we de tijd enorm veel sneller lopen. Met de snelheidsregelaar kies je hoeveel jaar er in één seconde voorbijgaat: van 1 jaar tot 1 miljard jaar per seconde.',
        'Korte gebeurtenissen, zoals een supernova of een heliumflits, zouden dan in een flits voorbij zijn. Daarom krijgt elke fase in de tijdlijn minimaal een paar seconden. De leeftijdsteller laat altijd de echte leeftijd van de ster zien.',
      ],
      fact: 'De instorting van de kern van een zware ster duurt minder dan een seconde, maar het licht van de explosie blijft maandenlang zichtbaar.',
      related: ['ui.schaal', 'ui.traag'],
    },
    'ui.traag': {
      title: 'Slow motion', kicker: 'Over deze simulatie', tooltip: 'Deze gebeurtenis is vertraagd',
      body: [
        'Sommige gebeurtenissen gaan zo snel dat je ze in het echt nooit zou kunnen volgen, zoals de instorting van een sterkern (milliseconden) of het samensmelten van twee neutronensterren. Die tonen we vertraagd, als in een slow-motionfilm.',
      ],
      related: ['ui.tijd'],
    },
    'ui.waargenomen': {
      title: 'Waargenomen', kicker: 'Wetenschap', tooltip: 'Dit hebben astronomen echt gezien',
      body: [
        'Dit label betekent dat astronomen dit verschijnsel echt hebben waargenomen met telescopen of andere instrumenten, bijvoorbeeld in zichtbaar licht, infrarood, röntgenstraling, radiostraling, neutrino\'s of zwaartekrachtgolven.',
        'De details in de animatie zijn natuurlijk wel een artistieke weergave: we kunnen de meeste sterren alleen als lichtpuntje zien.',
      ],
      related: ['ui.theorie', 'ui.deels'],
    },
    'ui.deels': {
      title: 'Deels waargenomen', kicker: 'Wetenschap', tooltip: 'Een deel is gezien, een deel is theorie',
      body: [
        'Van dit verschijnsel is een deel echt waargenomen, maar andere delen volgen alleen uit berekeningen en modellen. Een voorbeeld: we zien witte dwergen en planetaire nevels, maar het precieze verloop van de heliumflits in de kern van een rode reus kunnen we niet direct zien.',
      ],
      related: ['ui.waargenomen', 'ui.theorie'],
    },
    'ui.theorie': {
      title: 'Theorie', kicker: 'Wetenschap', tooltip: 'Voorspeld, maar (nog) niet gezien',
      body: [
        'Dit label betekent dat het verschijnsel voorspeld wordt door natuurkundige theorieën, maar nog niet is waargenomen. Soms kan dat ook helemaal nog niet: een zwarte dwerg (een volledig afgekoelde witte dwerg) bestaat nog niet, omdat het heelal met 13,8 miljard jaar veel te jong is.',
        'Ook Hawkingstraling van zwarte gaten en paarinstabiliteitssupernova\'s zijn (nog) niet met zekerheid waargenomen.',
      ],
      related: ['ui.waargenomen', 'ui.deels'],
    },
  },

  // Filled by other content files:
  stars: [],              // known stars for the HR diagram (16-content-hr.js)
  spectralClasses: [],    // Morgan-Keenan classes (16-content-classification.js)
  luminosityClasses: [],
  sizeComparison: [],
  tour: [],               // guided tour steps (16-content-tour.js)
  quiz: [],               // quiz questions (16-content-quiz.js)
  paths: {},              // evolution-path texts per mass category (16-content-evolution.js)
};

/** Look up an info entry; returns a friendly fallback instead of throwing. */
Content.get = function (id) {
  return Content.info[id] || null;
};
