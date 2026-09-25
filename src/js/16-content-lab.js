/* Content for "Maak je eigen ster": the explanation of every stage in the evolution model
   (stage.infoId in 40-evolution.js), every nuclear process in the core panel ('fusion.<id>'),
   every energy source when nothing fuses ('bron.<id>'), the help texts of the lab panels
   ('lab.*', 'hr.diagram') and the six evolution paths ('path.<category>' + Content.paths).
   Numbers follow ARCHITECTURE.md §7 and the model in 40-evolution.js. */

// ================================================================= stages: star formation
Object.assign(Content.info, {
  'cloud': {
    title: 'Moleculaire wolk',
    tooltip: 'Koud gas en stof waaruit sterren ontstaan',
    kicker: 'Stervorming',
    status: 'waargenomen',
    body: [
      'Elke ster begint in een <b>moleculaire wolk</b>: een enorme, donkere wolk van gas (vooral waterstofmoleculen, H<sub>2</sub>) en een beetje stof. Het is er ijskoud: maar <b>10 tot 20 K</b>, dat is ongeveer −260 °C.',
      'Het gas is heel ijl: een paar honderd tot een miljoen moleculen per kubieke centimeter. Dat is ijler dan het beste vacuüm dat we op aarde kunnen maken. Maar zo\'n wolk is zo groot dat hij toch duizenden tot miljoenen keren zoveel massa heeft als de Zon.',
      '<b>Fusie:</b> nergens. Er is nog geen ster, dus ook geen kern en geen kernfusie. De wolk wordt alleen een beetje verwarmd door sterlicht en kosmische straling, en koelt weer af doordat moleculen en stofkorrels infraroodstraling uitzenden.',
      'Zolang de gasdruk de zwaartekracht in evenwicht houdt, gebeurt er weinig. Pas als een deel van de wolk dichter of kouder wordt, bijvoorbeeld door de schokgolf van een supernova in de buurt, kan het onder zijn eigen gewicht gaan instorten.',
    ],
    stats: [['Temperatuur', '10–20 K'], ['Dichtheid', '10²–10⁶ moleculen/cm³'], ['Massa (reuzenwolk)', '10⁴–10⁶ M☉'], ['Grootte', 'tot honderden lichtjaren'], ['Energiebron', 'geen (koud gas)']],
    fact: 'De Orionnevel, op ongeveer 1.350 lichtjaar, is het deel van een reusachtige moleculaire wolk dat al "aan" is: daar zijn net nieuwe sterren ontstaan die het gas laten oplichten.',
    deeper: [
      'Of een wolk instort, hangt af van de strijd tussen zwaartekracht en gasdruk. Een wolkdeel stort in als zijn massa groter is dan de <b>Jeans-massa</b>:',
      '<div class="formula-block">M<sub>J</sub> ∝ T<sup>3/2</sup> · ρ<sup>−1/2</sup></div>',
      'Een koude, dichte wolk heeft dus een kleine Jeans-massa en stort makkelijk in. Bij 10 K en 10⁴ moleculen per cm³ ligt die rond een paar zonsmassa\'s.',
    ],
    related: ['collapse', 'bron.cloud', 'protostar'],
  },

  'collapse': {
    title: 'Instorting',
    tooltip: 'Zwaartekracht trekt een wolkdeel samen',
    kicker: 'Stervorming',
    status: 'deels',
    body: [
      'Een dicht stuk van de wolk begint onder zijn eigen zwaartekracht in te storten. Het midden stort het snelst in, en daar ontstaat een steeds dichtere, warmere bol gas.',
      '<b>Fusie:</b> nog niet. Wat het gas opwarmt is <b>zwaartekracht</b>: als gas naar binnen valt, wordt de valenergie omgezet in warmte. In het begin kan die warmte nog makkelijk weg als infraroodstraling, maar als het midden zo dicht wordt dat de straling niet meer ontsnapt, loopt de temperatuur snel op, tot ongeveer 100.000 K aan het eind van deze fase.',
      'Omdat de wolk altijd een beetje draait, gaat hij sneller draaien als hij kleiner wordt (net als een kunstschaatser die de armen intrekt). Zo ontstaat een platte, draaiende schijf rond het groeiende midden.',
      'Het instorten duurt ongeveer 100.000 tot een miljoen jaar. Astronomen zien veel dichte "kernen" in wolken die op het punt staan in te storten, maar het instorten zelf is zo verborgen in stof dat een deel van het verloop uit modellen komt.',
    ],
    stats: [['Duur', 'ongeveer 10⁵–10⁶ jaar (vrije-valtijd)'], ['Temperatuur midden', 'van ~15 K tot ~100.000 K'], ['Energiebron', 'zwaartekracht (samentrekking)'], ['Fusie', 'nog geen']],
    fact: 'Uit één instortende wolk ontstaat bijna nooit één ster, maar een hele groep. De meeste sterren worden geboren in sterrenhopen, en ongeveer de helft van de zonachtige sterren heeft een begeleider.',
    deeper: [
      'De tijd die een wolk nodig heeft om zonder tegendruk in te storten is de <b>vrije-valtijd</b>. Die hangt alleen af van de dichtheid ρ:',
      '<div class="formula-block">t<sub>ff</sub> = √(3π / (32 G ρ))</div>',
      'Voor 10⁴ waterstofmoleculen per cm³ (ρ ≈ 3 × 10⁻¹⁷ kg/m³) geeft dat ongeveer 4 × 10⁵ jaar.',
    ],
    related: ['cloud', 'bron.gravity', 'protostar'],
  },

  'protostar': {
    title: 'Protoster',
    tooltip: 'Jonge ster die nog groeit uit de wolk',
    kicker: 'Stervorming',
    status: 'waargenomen',
    body: [
      'In het midden van de instortende wolk ligt nu een <b>protoster</b>: een hete bol gas die nog steeds groeit doordat er materie op valt vanuit de schijf eromheen. De protoster zelf is nog verborgen in een cocon van stof en is alleen in infrarood en radiostraling te zien.',
      '<b>Fusie in de kern:</b> <b>deuteriumfusie</b>. Rond 1 miljoen K begint de kern deuterium (zware waterstof, ²H) om te zetten in helium-3. Er is maar weinig deuterium, dus dit levert niet veel op, maar het werkt als een thermostaat: de kern blijft een tijd rond 1 miljoen K. Het meeste licht komt nog van het invallende gas en de samentrekking.',
      'Waterstoffusie is nog niet mogelijk: daarvoor moet de kern minstens een paar miljoen K heet worden, voor een ster als de Zon zelfs meer dan 10 miljoen K.',
      'Heel lichte objecten (minder dan ongeveer 13 Jupitermassa\'s, 0,012 M☉) worden nooit heet genoeg voor deuteriumfusie. Bij hen komt alle warmte uit samentrekking.',
    ],
    stats: [['Duur', 'ongeveer 100.000 jaar'], ['Kerntemperatuur', '~0,1 → 1,5 miljoen K'], ['Oppervlak', '~3.000 K (verborgen in stof)'], ['Fusie in de kern', 'deuterium (²H + ¹H → ³He)'], ['Zichtbaar in', 'infrarood en radio']],
    fact: 'Een protoster kan tientallen keren zo helder zijn als de Zon, terwijl er nog geen gewone waterstoffusie is: het licht komt van gas dat met grote snelheid op de ster valt.',
    deeper: [
      'Astronomen verdelen jonge sterren in klassen op basis van hun infraroodspectrum: <b>klasse 0</b> (vooral nog omhulsel), <b>klasse I</b> (schijf + omhulsel), <b>klasse II</b> (T Tauri-ster met schijf) en <b>klasse III</b> (bijna kale ster).',
      'Het licht van invallend gas is de accretielichtkracht <span class="formula">L<sub>acc</sub> ≈ G M Ṁ / R</span>. Met M = 0,5 M☉, R = 2 R☉ en Ṁ = 10⁻⁵ M☉ per jaar kom je op ongeveer 80 L☉.',
    ],
    related: ['collapse', 'jets', 'fusion.deuterium', 'bron.gravity'],
  },

  'jets': {
    title: 'Jets',
    tooltip: 'Stralen gas die uit de polen schieten',
    kicker: 'Stervorming',
    status: 'waargenomen',
    body: [
      'Terwijl de protoster groeit, schiet hij aan zijn noord- en zuidpool twee smalle <b>jets</b> de ruimte in, met snelheden van 100 tot 1.000 km/s. Magnetische velden in de draaiende schijf slingeren een deel van het gas omhoog en bundelen het langs de draai-as.',
      'De jets voeren draaiing (impulsmoment) af. Zonder dat zou het gas uit de schijf nooit op de ster kunnen vallen: het zou te snel blijven ronddraaien.',
      '<b>Fusie in de kern:</b> nog steeds <b>deuteriumfusie</b>, bij 1,5 tot 2 miljoen K. Het meeste licht komt nog van samentrekking en van gas dat op de ster valt.',
      'Waar een jet tegen het omringende gas botst, ontstaan gloeiende knopen: <b>Herbig-Haro-objecten</b>, zoals HH 46/47 en HH 211.',
    ],
    stats: [['Snelheid', '100–1.000 km/s'], ['Lengte', 'tot enkele lichtjaren'], ['Duur (model)', 'ongeveer 500.000 jaar'], ['Kerntemperatuur', '~1,5–2 miljoen K'], ['Fusie in de kern', 'deuterium']],
    fact: 'Sommige Herbig-Haro-objecten verschuiven zo snel dat je ze op foto\'s van de Hubble-telescoop van een paar jaar na elkaar echt ziet bewegen.',
    deeper: [
      'Een jet kan een paar procent tot ongeveer tien procent van het invallende gas weer wegblazen. Omdat dat gas ver van de as wordt gelanceerd, neemt het veel impulsmoment mee: <span class="formula">L = m · v · r</span>.',
    ],
    related: ['protostar', 'ttauri', 'fusion.deuterium'],
  },

  'ttauri': {
    title: 'T Tauri-ster',
    tooltip: 'Jonge ster die nog krimpt, met een schijf',
    kicker: 'Stervorming',
    status: 'waargenomen',
    body: [
      'De ster is uit zijn stofcocon tevoorschijn gekomen en is nu een <b>T Tauri-ster</b> (genoemd naar de ster T in het sterrenbeeld Stier). Hij is nog groter dan hij later wordt, heeft een stofschijf waarin planeten kunnen ontstaan, veel vlekken en felle uitbarstingen.',
      '<b>Fusie in de kern:</b> geen. Het deuterium is op, en voor waterstoffusie is de kern nog te koel. De ster schijnt door <b>samentrekking</b>: hij krimpt langzaam en de vrijgekomen zwaartekrachtsenergie wordt warmte. De kern warmt zo op van ongeveer 2 naar 6 miljoen K.',
      'Bij sterren tot ongeveer 1,2 M☉ loopt daarnaast de <b>lithiumverbranding</b>: vanaf ongeveer 2,5 miljoen K wordt lithium vernietigd. Omdat deze sterren grotendeels convectief zijn, wordt het lithium aan het oppervlak mee naar binnen gevoerd en verdwijnt het langzaam.',
      'Het hele krimpen tot de hoofdreeks duurt voor een ster als de Zon enkele tientallen miljoenen jaren; voor lichtere sterren veel langer. Waargenomen T Tauri-sterren zijn meestal 1 tot 10 miljoen jaar oud.',
    ],
    stats: [['Massa', 'tot ~2 M☉'], ['Leeftijd', '1–10 miljoen jaar (waargenomen)'], ['Kerntemperatuur', '~2 → 6 miljoen K'], ['Fusie in de kern', 'geen (lithiumverbranding als extra)'], ['Energiebron', 'samentrekking']],
    fact: 'De ALMA-telescoop maakte in 2014 een foto van de schijf rond de jonge ster HL Tauri, met donkere ringen waar waarschijnlijk planeten aan het ontstaan zijn.',
    deeper: [
      'Een krimpende ster volgt de <b>viriaalstelling</b>: van de zwaartekrachtsenergie die vrijkomt, gaat de helft naar het opwarmen van het gas en wordt de andere helft uitgestraald. Daardoor wordt een ster die energie verliest juist heter.',
      'Lichte T Tauri-sterren zakken in het HR-diagram bijna recht naar beneden (Hayashi-spoor: volledig convectief, oppervlak ~4.000 K). Iets zwaardere sterren buigen daarna naar links af (Henyey-spoor), als hun binnenste stralend wordt.',
    ],
    related: ['bron.gravity', 'fusion.lithium', 'ignition', 'ttauri.herbig'],
  },

  'ttauri.herbig': {
    title: 'Herbig Ae/Be-ster',
    tooltip: 'Jonge ster van 2 tot 8 zonsmassa\'s',
    kicker: 'Stervorming',
    status: 'waargenomen',
    body: [
      'Een jonge ster van ongeveer 2 tot 8 M☉ is een <b>Herbig Ae/Be-ster</b>: de zwaardere broer van een T Tauri-ster. Hij is heter (spectraalklasse A of B, dus wit tot blauwwit) en heeft ook nog een schijf van gas en stof.',
      '<b>Fusie in de kern:</b> geen. De ster krimpt nog en schijnt door <b>samentrekking</b>. De kern warmt op tot een paar miljoen K; pas daarna begint de waterstoffusie.',
      'Zwaardere sterren doen alles sneller: deze fase duurt maar enkele honderdduizenden jaren tot een paar miljoen jaar. Een ster van 3 M☉ is na ongeveer 1,5 miljoen jaar al klaar met krimpen.',
    ],
    stats: [['Massa', '~2–8 M☉'], ['Oppervlak', '~7.500–25.000 K'], ['Duur', '~0,2–2 miljoen jaar'], ['Fusie in de kern', 'nog geen'], ['Energiebron', 'samentrekking']],
    fact: 'Deze sterren zijn genoemd naar George Herbig, die ze in 1960 als groep beschreef. Bekende voorbeelden zijn AB Aurigae en HD 163296, waar ALMA ringen in de schijf zag.',
    deeper: [
      'De Kelvin-Helmholtz-tijd <span class="formula">t<sub>KH</sub> ≈ G M² / (R L)</span> is voor zware sterren kort, omdat L veel sneller groeit dan M². Voor 3 M☉, 3 R☉ en 100 L☉ is dat ongeveer 1 miljoen jaar.',
    ],
    related: ['ttauri', 'ttauri.massief', 'bron.gravity', 'ignition'],
  },

  'ttauri.massief': {
    title: 'Jonge zware ster',
    tooltip: 'Een zware ster die nog groeit in zijn wolk',
    kicker: 'Stervorming',
    status: 'deels',
    body: [
      'Sterren van meer dan ongeveer 8 M☉ hebben geen rustige "jeugd" zoals T Tauri-sterren. Ze krimpen zo snel dat ze al volwassen zijn terwijl er nog gas op ze valt. Hun felle uv-straling maakt een bel van heet, geïoniseerd gas in de wolk: een <b>H II-gebied</b>.',
      '<b>Fusie in de kern:</b> in dit model nog geen, want de ster schijnt hier nog door <b>samentrekking</b>. In werkelijkheid begint de waterstoffusie bij zware sterren vaak al terwijl ze nog groeien, zo kort is deze fase: een paar tienduizend jaar.',
      'Hoe zware sterren precies ontstaan is nog niet helemaal duidelijk. Hun licht is zo sterk dat het invallend gas zou moeten wegduwen. Waarschijnlijk valt het gas toch binnen via een schijf en via dichte stromen.',
    ],
    stats: [['Massa', 'meer dan ~8 M☉'], ['Duur', 'enkele 10.000 jaar'], ['Oppervlak', 'tot ~25.000 K'], ['Fusie in de kern', 'nog geen (in dit model)'], ['Energiebron', 'samentrekking']],
    fact: 'Zware sterren worden bijna altijd in groepen geboren. De Trapeziumsterren in het hart van de Orionnevel zijn zo\'n groep jonge, zware sterren.',
    deeper: [
      'De stralingsdruk op stof wordt belangrijk als de ster de <b>Eddington-limiet</b> voor stof nadert: <span class="formula">L<sub>Edd</sub> = 4π G M c / κ</span>. Stof heeft een veel grotere opaciteit κ dan kaal gas, daarom is dit bij stervorming al een probleem vanaf ~20 M☉.',
    ],
    related: ['ttauri.herbig', 'ignition', 'mainSequence', 'bron.gravity'],
  },

  'ttauri.bruineDwerg': {
    title: 'Jonge bruine dwerg',
    tooltip: 'Een "mislukte ster" die nog krimpt',
    kicker: 'Stervorming',
    status: 'waargenomen',
    body: [
      'Als er minder dan ongeveer 0,08 M☉ (ongeveer 80 keer de massa van Jupiter) bij elkaar komt, ontstaat een <b>bruine dwerg</b>. In zijn jeugd lijkt hij op een kleine, koele T Tauri-ster, soms zelfs met een eigen schijfje.',
      '<b>Fusie in de kern:</b> geen. De bruine dwerg schijnt door <b>samentrekking</b>. De kern komt maar tot een paar miljoen K: te weinig voor waterstoffusie.',
      'De zwaarste bruine dwergen (meer dan ongeveer 0,065 M☉) worden net heet genoeg om <b>lithium</b> te verbranden. Lichtere houden hun lithium voor altijd. Dat verschil gebruiken astronomen als test.',
    ],
    stats: [['Massa', '~13–80 Jupitermassa\'s (0,012–0,08 M☉)'], ['Oppervlak', '~2.600–3.600 K'], ['Kerntemperatuur', '~2–2,5 miljoen K'], ['Fusie in de kern', 'geen (zwaarste: lithium)'], ['Energiebron', 'samentrekking']],
    fact: 'Een pas geboren bruine dwerg is veel groter en helderder dan later: hij krimpt in honderden miljoenen jaren tot ongeveer de grootte van Jupiter.',
    deeper: [
      'Bij een bruine dwerg stopt het krimpen niet door fusie, maar doordat de elektronen zo dicht opeengepakt raken dat ze niet verder samen te persen zijn (<b>ontaarding</b>). Daardoor blijft de kern steken onder de ~3 miljoen K die nodig is voor waterstoffusie.',
    ],
    related: ['ignition.deuterium', 'brownDwarf', 'fusion.lithium', 'path.bruineDwerg'],
  },

  'ignition': {
    title: 'Ontsteking',
    tooltip: 'Waterstoffusie begint: een echte ster!',
    kicker: 'Stervorming',
    status: 'deels',
    body: [
      'De kern krimpt en wordt steeds heter. Vanaf een paar miljoen K begint <b>waterstoffusie</b>: waterstofkernen smelten samen tot helium en daarbij komt energie vrij. Vanaf nu is het een echte ster.',
      '<b>Fusie in de kern:</b> bij sterren lichter dan ongeveer 1,3 M☉ de <b>pp-keten</b>; bij zwaardere sterren de <b>CNO-cyclus</b>, die bij hogere temperaturen veel sneller gaat. In de schillen gebeurt nog niets.',
      'De fusie levert steeds meer druk, tot die de zwaartekracht precies in evenwicht houdt. Dan stopt het krimpen en staat de ster op de <b>nulleeftijd-hoofdreeks</b>. Voor de Zon ligt de kerntemperatuur dan rond 13,6 miljoen K.',
      'Hoe zwaarder de ster, hoe sneller dit gaat: voor de Zon ongeveer 25 miljoen jaar, voor een ster van 15 M☉ maar zo\'n 60.000 jaar.',
    ],
    stats: [['Kerntemperatuur', 'van enkele miljoenen tot ~10–45 miljoen K'], ['Fusie in de kern', 'pp-keten (< ~1,3 M☉) of CNO-cyclus'], ['Minimale massa', '~0,08 M☉'], ['Duur (1 M☉)', '~25 miljoen jaar']],
    fact: 'Het ontbranden gaat niet met een klap: de ster zakt geleidelijk in een evenwicht. De fusie is een thermostaat: wordt de kern te heet, dan zet hij uit en koelt hij af, en omgekeerd.',
    deeper: [
      'Het evenwicht op de hoofdreeks heet <b>hydrostatisch evenwicht</b>: in elke laag houdt de drukgradiënt het gewicht van de lagen erboven tegen:',
      '<div class="formula-block">dP/dr = −G m(r) ρ(r) / r²</div>',
      'De energie die de fusie in de kern levert, is gelijk aan de lichtkracht aan het oppervlak. Zo lang dat klopt, blijft de ster stabiel.',
    ],
    related: ['fusion.pp', 'fusion.cno', 'mainSequence', 'lab.kern'],
  },

  'ignition.deuterium': {
    title: 'Deuteriumfusie',
    tooltip: 'De enige fusie die een bruine dwerg lukt',
    kicker: 'Bruine dwerg',
    status: 'deels',
    body: [
      'Een bruine dwerg wordt nooit heet genoeg voor gewone waterstoffusie. Maar als hij zwaarder is dan ongeveer <b>13 Jupitermassa\'s</b> (0,012 M☉), wordt de kern wel heet genoeg voor <b>deuteriumfusie</b>: vanaf ongeveer 1 miljoen K.',
      '<b>Fusie in de kern:</b> deuterium (²H) + proton → helium-3. Er is maar heel weinig deuterium: ongeveer 2 atomen op elke 100.000 waterstofatomen. Daarom is de brandstof na een paar miljoen tot enkele tientallen miljoenen jaren op, eerder naarmate de dwerg zwaarder is.',
      'Daarna is er geen fusie meer. De bruine dwerg koelt de rest van zijn leven langzaam af. Objecten onder de 13 Jupitermassa\'s beginnen zelfs nooit met deuteriumfusie; zij worden soms "planeetachtige objecten" genoemd.',
    ],
    stats: [['Reactie', '²H + ¹H → ³He + γ'], ['Temperatuur', 'vanaf ~1 miljoen K'], ['Ondergrens', '~13 M<sub>Jupiter</sub> (0,012 M☉)'], ['Duur', '~4–50 miljoen jaar (model)'], ['Daarna', 'geen fusie, alleen afkoelen']],
    fact: 'De grens van 13 Jupitermassa\'s wordt vaak gebruikt als scheidslijn tussen een reuzenplaneet en een bruine dwerg. Toch is die grens niet scherp: hij hangt af van de samenstelling en ligt ergens tussen 11 en 16 Jupitermassa\'s.',
    deeper: [
      'Per reactie komt 5,5 MeV vrij. Omdat er zo weinig deuterium is (D/H ≈ 2 × 10⁻⁵), levert het hele deuteriumvoorraadje van een bruine dwerg veel minder energie dan de waterstof in een ster zou geven.',
    ],
    related: ['fusion.deuterium', 'ttauri.bruineDwerg', 'brownDwarf', 'path.bruineDwerg'],
  },
});

// ================================================================= stages: main sequence, dwarfs
Object.assign(Content.info, {
  'mainSequence': {
    title: 'Hoofdreeks',
    tooltip: 'Rustige waterstoffusie: 90 % van het sterrenleven',
    kicker: 'Levensfase',
    status: 'waargenomen',
    body: [
      'De ster is nu volwassen en staat op de <b>hoofdreeks</b>. In deze fase brengt een ster ongeveer 90 % van zijn leven door. Hij verandert maar heel langzaam: hij wordt een beetje groter en helderder.',
      '<b>Fusie in de kern:</b> waterstof wordt helium. Bij sterren tot ongeveer 1,3 M☉ gebeurt dat met de <b>pp-keten</b>, bij zwaardere sterren met de <b>CNO-cyclus</b>. In de schillen gebeurt nog niets.',
      'Omdat er steeds meer helium in de kern komt, moet de kern iets heter worden om evenveel energie te blijven maken: bij de Zon van ongeveer 13,6 naar 18 miljoen K. Nu is de Zon 4,6 miljard jaar oud en is haar kern ongeveer 15,7 miljoen K.',
      'De massa bepaalt alles. Een zware ster verbrandt zijn brandstof veel sneller: de Zon doet ongeveer 10 miljard jaar met haar waterstof, een ster van 15 M☉ maar zo\'n 15 miljoen jaar.',
    ],
    stats: [['Duur', '≈ 10¹⁰ jaar × (M/M☉)<sup>−2,5</sup>'], ['Zon', '~10 miljard jaar, kern 15,7 miljoen K'], ['15 M☉', '~15 miljoen jaar, kern ~35–47 miljoen K'], ['Fusie in de kern', 'pp-keten of CNO-cyclus'], ['Kern aan het eind', 'bijna puur helium']],
    fact: 'De Zon zet elke seconde ongeveer 600 miljoen ton waterstof om in helium. Het verschil, ongeveer 4 miljoen ton per seconde, wordt energie volgens E = mc².',
    deeper: [
      'De levensduur volgt uit brandstof gedeeld door verbruik. De brandstof groeit met M, maar de lichtkracht ongeveer met M<sup>3,5</sup>:',
      '<div class="formula-block">t ≈ M / L ∝ M / M<sup>3,5</sup> = M<sup>−2,5</sup></div>',
      'Voorbeeld: een ster van 2 M☉ leeft ongeveer 10 miljard × 2<sup>−2,5</sup> ≈ 1,8 miljard jaar. Voor de allerzwaarste sterren vlakt dit af tot ongeveer 3 miljoen jaar, omdat hun lichtkracht minder snel groeit.',
    ],
    related: ['fusion.pp', 'fusion.cno', 'hr.diagram', 'redGiant.subreus', 'lab.ster'],
  },

  'redDwarf': {
    title: 'Rode dwerg',
    tooltip: 'Kleine, zuinige ster die biljoenen jaren leeft',
    kicker: 'Levensfase',
    status: 'waargenomen',
    body: [
      'Sterren van ongeveer 0,08 tot 0,5 M☉ zijn <b>rode dwergen</b>: klein, koel (2.400–3.900 K) en zwak. Ze zijn verreweg de meest voorkomende sterren: ongeveer driekwart van alle sterren in de Melkweg. Toch is er met het blote oog vrijwel geen enkele te zien.',
      '<b>Fusie in de kern:</b> de <b>pp-keten</b>, bij een lage kerntemperatuur van ongeveer 5 tot 12 miljoen K. In de schillen gebeurt niets.',
      'Rode dwergen lichter dan ongeveer 0,35 M☉ zijn <b>volledig convectief</b>: het gas wordt als in een pan kokende soep steeds rondgeroerd. Zo komt alle waterstof uiteindelijk in de kern terecht en kan de ster bijna al zijn brandstof opgebruiken.',
      'Daardoor leven ze extreem lang: honderden miljarden tot biljoenen jaren. Een ster van 0,1 M☉ doet er ongeveer 3 biljoen jaar over. Omdat het heelal pas 13,8 miljard jaar oud is, is er nog nooit een rode dwerg doodgegaan.',
    ],
    stats: [['Massa', '~0,08–0,5 M☉'], ['Oppervlak', '~2.400–3.900 K (klasse M)'], ['Kerntemperatuur', '~5–12 miljoen K'], ['Levensduur', 'honderden miljarden tot biljoenen jaren'], ['Fusie in de kern', 'pp-keten']],
    fact: 'De dichtstbijzijnde ster na de Zon, Proxima Centauri (4,2 lichtjaar), is een rode dwerg van 0,12 M☉. Hij is zo zwak dat je een telescoop nodig hebt om hem te zien.',
    deeper: [
      'Rode dwergen hebben veel magnetische activiteit: door hun convectie en snelle draaiing kunnen ze enorme uitbarstingen (flares) hebben, waarbij de ster in minuten meerdere keren zo helder wordt. Dat is belangrijk voor de leefbaarheid van hun planeten, zoals die rond TRAPPIST-1.',
      'Bij de lichtste rode dwergen is de lichtkracht ongeveer <span class="formula">L ≈ 0,23 · M<sup>2,3</sup></span> (L en M in zonne-eenheden): een ster van 0,1 M☉ geeft ongeveer een duizendste van het licht van de Zon.',
    ],
    related: ['fusion.pp', 'redDwarf.blauw', 'whiteDwarf.He', 'path.rodeDwerg'],
  },

  'redDwarf.blauw': {
    title: 'Blauwe dwerg',
    tooltip: 'Een oude rode dwerg die heter wordt (theorie)',
    kicker: 'Levensfase · verre toekomst',
    status: 'theorie',
    body: [
      'Een rode dwerg lichter dan ongeveer 0,25 M☉ wordt aan het eind van zijn leven geen rode reus. Omdat hij volledig gemengd is, verandert bijna al zijn waterstof langzaam in helium. Daardoor krimpt de ster en wordt het oppervlak <b>heter en blauwer</b>, in het model tot ongeveer 7.000–9.000 K.',
      '<b>Fusie in de kern:</b> nog steeds de <b>pp-keten</b>, bij een kern die opwarmt tot ongeveer 10 à 13 miljoen K. In de schillen gebeurt niets.',
      'Als de waterstof op is, stopt de fusie. Wat overblijft is een <b>heliumwitte dwerg</b>.',
      'Een blauwe dwerg is nog nooit gezien en kan ook nog niet bestaan: dit gebeurt pas na honderden miljarden tot biljoenen jaren. Alles wat we erover weten komt uit computermodellen.',
    ],
    stats: [['Beginmassa', 'minder dan ~0,25 M☉'], ['Oppervlak', 'tot ~7.000–9.000 K'], ['Kerntemperatuur', '~7–13 miljoen K'], ['Wanneer', 'na honderden miljarden jaren'], ['Fusie in de kern', 'pp-keten (de laatste waterstof)']],
    fact: 'De naam "blauwe dwerg" is door astronomen bedacht voor iets wat nog niet bestaat. De eerste blauwe dwergen verschijnen pas als het heelal honderden keren zo oud is als nu.',
    deeper: [
      'Als het gemiddelde molecuulgewicht μ stijgt (meer helium, minder waterstof), moet de ster heter worden om dezelfde druk te leveren: <span class="formula">P = ρ k T / (μ m<sub>H</sub>)</span>. Daardoor stijgt de lichtkracht en krimpt de straal. Modellen van Laughlin, Bodenheimer en Adams (1997) lieten dit als eersten zien.',
    ],
    related: ['redDwarf', 'whiteDwarf.He', 'fusion.pp', 'ui.theorie'],
  },

  'brownDwarf': {
    title: 'Bruine dwerg (type L)',
    tooltip: 'Te licht voor waterstoffusie: koelt langzaam af',
    kicker: 'Bruine dwerg',
    status: 'waargenomen',
    body: [
      'Een <b>bruine dwerg</b> zit tussen een planeet en een ster in: 13 tot ongeveer 80 keer zo zwaar als Jupiter, maar ongeveer net zo groot. Hij is te licht om waterstof te laten fuseren.',
      '<b>Fusie:</b> geen (meer). Het deuterium is op. Alleen de zwaarste bruine dwergen (boven ongeveer 0,065 M☉) verbranden nog een tijd hun <b>lithium</b>. De energiebron is <b>restwarmte</b>: de bruine dwerg koelt af en wordt steeds zwakker.',
      'Jonge bruine dwergen zijn van <b>type L</b>: 1.300 tot 2.400 K aan het oppervlak, dieprood. In hun atmosfeer vormen zich wolken van kleine druppels ijzer en silicaat (gesteente).',
    ],
    stats: [['Massa', '~13–80 M<sub>Jupiter</sub>'], ['Straal', '~0,1 R☉ (ongeveer Jupiter)'], ['Oppervlak (type L)', '~2.600 → 1.350 K'], ['Kerntemperatuur', 'enkele miljoenen K, dalend'], ['Energiebron', 'restwarmte (afkoelen)']],
    fact: 'Op een bruine dwerg van type L kan het "regenen" van gesmolten ijzer en gesteente. Metingen van helderheidsschommelingen laten zien dat er echte wolkenpatronen rondtrekken.',
    deeper: [
      'De eerste bruine dwergen werden in 1995 bevestigd: Teide 1 in de Plejaden (dankzij de lithiumtest) en Gliese 229B, een koele begeleider van een rode dwerg.',
      'De lichtkracht van een bruine dwerg daalt grofweg als <span class="formula">L ∝ t<sup>−1,3</sup> · M<sup>2,6</sup></span>: een oude, lichte bruine dwerg is dus heel zwak.',
    ],
    related: ['brownDwarf.T', 'bron.cooling', 'fusion.lithium', 'path.bruineDwerg'],
  },

  'brownDwarf.T': {
    title: 'Bruine dwerg (type T)',
    tooltip: 'Koele bruine dwerg met methaan in de lucht',
    kicker: 'Bruine dwerg',
    status: 'waargenomen',
    body: [
      'Na honderden miljoenen jaren is de bruine dwerg afgekoeld tot <b>type T</b>: 550 tot 1.300 K aan het oppervlak. De stofwolken zakken dieper weg en in de atmosfeer vormt zich <b>methaan</b>, net als bij Jupiter.',
      '<b>Fusie:</b> geen. De energiebron is alleen <b>restwarmte</b>. De kern koelt ook af, tot onder de miljoen K.',
      'Een bruine dwerg van type T geeft bijna geen zichtbaar licht. Voor het oog zou hij donker magenta lijken; het meeste straalt hij uit in infrarood.',
    ],
    stats: [['Oppervlak', '~1.350 → 550 K'], ['Kenmerk', 'methaan en water in het spectrum'], ['Duur (model)', 'miljarden jaren'], ['Energiebron', 'restwarmte'], ['Fusie', 'geen']],
    fact: 'Gliese 229B, ontdekt in 1995, was de eerste bruine dwerg van type T. Hij draait om een rode dwerg op 19 lichtjaar.',
    deeper: [
      'De overgang van L naar T gebeurt als de temperatuur onder ~1.300 K zakt: koolmonoxide (CO) wordt dan omgezet in methaan (CH₄) volgens <span class="formula">CO + 3 H₂ → CH₄ + H₂O</span>.',
    ],
    related: ['brownDwarf', 'brownDwarf.Y', 'bron.cooling'],
  },

  'brownDwarf.Y': {
    title: 'Bruine dwerg (type Y)',
    tooltip: 'De koudste "sterren": koeler dan een oven',
    kicker: 'Bruine dwerg',
    status: 'waargenomen',
    body: [
      'Oude, lichte bruine dwergen koelen af tot <b>type Y</b>: kouder dan 550 K. De koudste bekende zijn ongeveer zo warm als een zomerse dag op aarde. In hun atmosfeer kunnen zelfs <b>waterwolken</b> ontstaan.',
      '<b>Fusie:</b> geen. De bruine dwerg straalt alleen zijn laatste <b>restwarmte</b> uit, heel zwak en vooral in infrarood.',
      'Hij blijft zo langzaam afkoelen, biljoenen jaren lang, tot hij bijna niet meer te onderscheiden is van een koude, zware planeet.',
    ],
    stats: [['Oppervlak', 'minder dan ~550 K (model tot 200 K)'], ['Kenmerk', 'ammoniak, waterwolken'], ['Duur', 'biljoenen jaren van afkoelen'], ['Energiebron', 'restwarmte'], ['Fusie', 'geen']],
    fact: 'WISE 0855−0714, op ongeveer 7,4 lichtjaar, is met zo\'n 250–285 K de koudste bekende bruine dwerg. De James Webb-telescoop vond waterdamp in zijn atmosfeer.',
    deeper: [
      'Door de wet van Wien (<span class="formula">λ<sub>max</sub> = 2,9 mm·K / T</span>) straalt een object van 300 K het meest uit rond 10 micrometer: midden in het infrarood, waar de WISE- en James Webb-telescopen gevoelig zijn.',
    ],
    related: ['brownDwarf.T', 'bron.cooling', 'path.bruineDwerg'],
  },
});

// ================================================================= stages: giants (sun-like stars)
Object.assign(Content.info, {
  'redGiant.subreus': {
    title: 'Subreus',
    tooltip: 'De kern is op: de ster begint op te zwellen',
    kicker: 'Levensfase',
    status: 'waargenomen',
    body: [
      'De waterstof in de kern is op. De kern bestaat nu uit helium en <b>er is geen fusie meer in de kern</b>. Zonder fusie krimpt de kern en wordt hij heter, van ongeveer 18 naar 30 miljoen K.',
      '<b>Fusie in een schil:</b> in een dunne schil van waterstof rond de heliumkern gaat de waterstoffusie door. Bij sterren tot ongeveer 1,3 M☉ met de <b>pp-keten</b>, bij zwaardere met de <b>CNO-cyclus</b>.',
      'De buitenlagen zetten langzaam uit en koelen af: de ster wordt een <b>subreus</b>, groter en iets geler of oranjer. Voor een zonachtige ster duurt deze fase ongeveer een miljard jaar; voor zwaardere sterren gaat het veel sneller.',
    ],
    stats: [['Fusie in de kern', 'geen (heliumkern)'], ['Fusie in schil', 'waterstof (pp-keten of CNO)'], ['Kerntemperatuur', '~18 → 30 miljoen K'], ['Duur (1 M☉)', '~1 miljard jaar'], ['Klasse', 'IV (subreus)']],
    fact: 'Over ongeveer 5 miljard jaar wordt de Zon een subreus. Ze wordt dan zo helder dat de oceanen op aarde al lang verdampt zijn.',
    deeper: [
      'Waarom zwelt een ster op als de kern krimpt? Dat heet het <b>spiegeleffect</b>: als de kern krimpt, zet de mantel uit. Het precieze mechanisme is ingewikkeld en hangt samen met hoe de energie van de schil naar buiten wordt vervoerd.',
    ],
    related: ['mainSequence', 'redGiant', 'fusion.pp', 'fusion.cno'],
  },

  'redGiant': {
    title: 'Rode reus',
    tooltip: 'Opgezwollen ster met een schil van fusie',
    kicker: 'Levensfase',
    status: 'waargenomen',
    body: [
      'De ster zwelt op tot een <b>rode reus</b>: tientallen tot meer dan honderd keer zo groot als de Zon, met een koel, oranjerood oppervlak (3.000–4.500 K). Toch is hij honderden tot duizenden keren zo helder, omdat hij zo groot is.',
      '<b>Fusie in de kern:</b> geen. De heliumkern krimpt en wordt steeds heter, tot bijna 100 miljoen K. Bij sterren tot ongeveer 2 M☉ is de kern zo samengeperst dat hij <b>ontaard</b> is: de druk komt van dicht op elkaar geperste elektronen.',
      '<b>Fusie in een schil:</b> in een dunne waterstofschil rond de kern loopt de <b>CNO-cyclus</b>. Het helium dat daar ontstaat, valt op de kern, die zo steeds zwaarder wordt.',
      'De ster verliest via een sterrenwind ongeveer een tiende deel van zijn massa. Bij de zwaarste rode dwergen (0,25–0,5 M☉) gebeurt in de verre toekomst iets vergelijkbaars, maar dan met de pp-keten in de schil, en wordt de kern nooit heet genoeg voor helium.',
    ],
    stats: [['Straal', '~10–200 R☉ (1 M☉: tot ~170 R☉)'], ['Lichtkracht', 'tot ~2.500 L☉ (1 M☉)'], ['Kerntemperatuur', '~30 → 100 miljoen K'], ['Fusie in de kern', 'geen'], ['Fusie in schil', 'waterstof (CNO-cyclus)'], ['Duur (1 M☉)', '~0,5–1 miljard jaar']],
    fact: 'Arcturus en Aldebaran, twee van de helderste sterren aan de hemel, zijn rode reuzen. Als de Zon een rode reus wordt, slokt ze Mercurius en Venus op, en misschien ook de Aarde.',
    deeper: [
      'Een ontaarde kern gedraagt zich vreemd: bij ontaard gas hangt de druk alleen af van de dichtheid, <span class="formula">P ∝ ρ<sup>5/3</sup></span>, en niet van de temperatuur. Daardoor kan de kern niet uitzetten als hij opwarmt. Dat leidt straks tot de heliumflits.',
      'Tijdens de rode-reuzenfase mengt de convectie de buitenlagen tot diep in de ster (<b>eerste "dredge-up"</b>). Zo komt stikstof uit de CNO-cyclus aan het oppervlak: astronomen meten dat echt in de spectra van rode reuzen.',
    ],
    related: ['redGiant.subreus', 'heliumFlash', 'horizontalBranch.heliumKern', 'fusion.cno'],
  },

  'heliumFlash': {
    title: 'Heliumflits',
    tooltip: 'Explosieve start van heliumfusie in de kern',
    kicker: 'Levensfase',
    status: 'deels',
    body: [
      'Bij sterren van ongeveer 0,5 tot 2 M☉ wordt de ontaarde heliumkern (ongeveer 0,45 M☉) uiteindelijk ongeveer <b>100 miljoen K</b> heet. Dan begint in één klap de heliumfusie: de <b>heliumflits</b>.',
      '<b>Fusie in de kern:</b> het <b>3-alfaproces</b>: drie heliumkernen worden koolstof. Omdat de druk in een ontaarde kern niet van de temperatuur afhangt, zet de kern niet uit als hij heter wordt. De fusie versnelt zichzelf en loopt op hol: de temperatuur schiet in het model tot rond 300 miljoen K.',
      '<b>Fusie in een schil:</b> de waterstofschil (<b>CNO-cyclus</b>) blijft branden.',
      'Binnen enkele seconden tot minuten maakt de kern zo veel energie als een heel sterrenstelsel. Toch zie je er aan de buitenkant niets van: alle energie wordt gebruikt om de kern op te blazen en de ontaarding op te heffen. Na de flits volgen nog een reeks kleinere flitsen.',
    ],
    stats: [['Temperatuur ontsteking', '~100 miljoen K'], ['Kernmassa', '~0,45 M☉'], ['Duur van de piek', 'seconden tot minuten'], ['Fusie in de kern', '3-alfaproces'], ['Fusie in schil', 'CNO-cyclus'], ['Beginmassa', '~0,5–2 M☉']],
    fact: 'Het vermogen van de heliumflits kan kort tientallen miljarden keren zo groot zijn als dat van de Zon, maar het oppervlak van de ster verandert er niet door. De flits is dus onzichtbaar.',
    deeper: [
      'In gewoon gas werkt fusie als thermostaat: heter → meer druk → uitzetten → afkoelen. In ontaard gas ontbreekt die terugkoppeling, zodat de fusiesnelheid (∝ T⁴⁰ voor het 3-alfaproces) op hol slaat tot de temperatuur zo hoog is dat de ontaarding verdwijnt.',
      'Waarnemingen kunnen de flits niet direct zien. Wel meten sterseismologen (bijvoorbeeld met de Kepler-telescoop) trillingen die laten zien of een rode reus al helium in de kern verbrandt of niet.',
    ],
    related: ['redGiant', 'horizontalBranch', 'fusion.triplealpha', 'ui.deels'],
  },

  'horizontalBranch': {
    title: 'Horizontale tak',
    tooltip: 'Rustige heliumfusie in de kern',
    kicker: 'Levensfase',
    status: 'waargenomen',
    body: [
      'Na de heliumflits krimpt de ster weer tot ongeveer 10 keer de Zon en wordt hij een stabiele ster op de <b>horizontale tak</b>. Hij is ongeveer 50 keer zo helder als de Zon.',
      '<b>Fusie in de kern:</b> het <b>3-alfaproces</b>: helium wordt koolstof, en een deel van de koolstof wordt zuurstof. De kern is ongeveer 110 tot 140 miljoen K heet.',
      '<b>Fusie in een schil:</b> rond de kern brandt nog een waterstofschil met de <b>CNO-cyclus</b>.',
      'Heliumfusie levert veel minder energie per kilogram dan waterstoffusie, dus deze fase duurt veel korter: ongeveer 100 miljoen jaar. Sterren met weinig metalen staan verder links (heter, blauwer) op de horizontale tak; sterren zoals de Zon vormen samen de "rode klomp".',
    ],
    stats: [['Lichtkracht', '~50 L☉'], ['Kerntemperatuur', '~110–140 miljoen K'], ['Fusie in de kern', '3-alfaproces (He → C, O)'], ['Fusie in schil', 'waterstof (CNO-cyclus)'], ['Duur', '~100 miljoen jaar']],
    fact: 'RR Lyrae-sterren zijn sterren op de horizontale tak die regelmatig pulseren. Ze zijn allemaal ongeveer even helder en worden daarom gebruikt om afstanden in de Melkweg te meten.',
    deeper: [
      'De naam komt uit het HR-diagram van bolvormige sterrenhopen: daar liggen deze sterren op een horizontale lijn, omdat ze allemaal ongeveer dezelfde lichtkracht hebben (dezelfde kernmassa van ~0,5 M☉), maar verschillende temperaturen door een verschillend dikke waterstofmantel.',
    ],
    related: ['heliumFlash', 'agb', 'fusion.triplealpha', 'fusion.cno'],
  },

  'horizontalBranch.heliumKern': {
    title: 'Heliumfusie in de kern',
    tooltip: 'Helium ontbrandt rustig, zonder flits',
    kicker: 'Levensfase',
    status: 'waargenomen',
    body: [
      'Bij sterren van ongeveer 2 tot 8 M☉ wordt de heliumkern niet ontaard. Als de kern ongeveer 100 miljoen K bereikt, begint de heliumfusie daarom <b>rustig</b>, zonder flits.',
      '<b>Fusie in de kern:</b> het <b>3-alfaproces</b>, bij ongeveer 110 tot 140 miljoen K. Helium wordt koolstof en zuurstof.',
      '<b>Fusie in een schil:</b> rond de heliumkern brandt een waterstofschil met de <b>CNO-cyclus</b>.',
      'Tijdens deze fase maakt de ster in het HR-diagram vaak een "blauwe lus": hij krimpt even en wordt heter, en zwelt daarna weer op. Deze fase duurt ongeveer 10 tot 20 % van de hoofdreekstijd.',
    ],
    stats: [['Beginmassa', '~2–8 M☉'], ['Kerntemperatuur', '~110–140 miljoen K'], ['Fusie in de kern', '3-alfaproces'], ['Fusie in schil', 'waterstof (CNO-cyclus)'], ['Duur', '~10–20 % van de hoofdreeks']],
    fact: 'Tijdens die blauwe lus kunnen sterren gaan pulseren als <b>cepheïde</b>. De Poolster is een cepheïde. Henrietta Leavitt ontdekte in 1912 dat hun pulsatieperiode hun helderheid verraadt: zo meten we afstanden tot andere sterrenstelsels.',
    deeper: [
      'Bij cepheïden geldt de periode-lichtkrachtrelatie (Leavittwet), ongeveer <span class="formula">M<sub>V</sub> ≈ −2,8 · log(P/dag) − 1,4</span>. Een cepheïde met een periode van 10 dagen heeft dus M<sub>V</sub> ≈ −4,2: ruim 4.000 keer zo helder als de Zon.',
    ],
    related: ['redGiant', 'agb', 'fusion.triplealpha', 'path.zonachtig'],
  },

  'agb': {
    title: 'Asymptotische reuzentak',
    tooltip: 'Tweede reuzenfase met twee brandende schillen',
    kicker: 'Levensfase',
    status: 'waargenomen',
    body: [
      'Het helium in de kern is op. De kern bestaat nu uit <b>koolstof en zuurstof</b> en is ontaard. De ster zwelt nog verder op: honderden keren zo groot als de Zon en duizenden keren zo helder. Dit is de <b>asymptotische reuzentak</b> (AGB).',
      '<b>Fusie in de kern:</b> geen. Alleen bij de zwaarste sterren van dit pad (ongeveer 7–8 M☉) wordt de kern heet genoeg (~0,7 miljard K) voor <b>koolstoffusie</b>, zodat er een kern van zuurstof, neon en magnesium ontstaat.',
      '<b>Fusie in schillen:</b> twee schillen, om en om: een <b>heliumschil</b> (3-alfaproces) en daarbuiten een <b>waterstofschil</b> (CNO-cyclus). De heliumschil ontsteekt steeds met korte flitsen (thermische pulsen). Tussen de schillen maakt het <b>s-proces</b> zware elementen, zoals barium en lood.',
      'De ster pulseert en verliest via een krachtige, stoffige wind tot de helft of meer van zijn massa. Zo komen koolstof, stikstof en s-proceselementen in de ruimte terecht.',
    ],
    stats: [['Straal', '~200–800 R☉'], ['Lichtkracht', '~3.000–40.000 L☉'], ['Fusie in de kern', 'geen (7–8 M☉: koolstof)'], ['Fusie in schillen', 'helium + waterstof'], ['Ook actief', 's-proces'], ['Duur', '~0,5–15 miljoen jaar']],
    fact: 'Mira, in het sterrenbeeld Walvis, is een AGB-ster die in 332 dagen van met het blote oog goed zichtbaar tot onzichtbaar dimt en weer terug. Ze laat een staart van gas achter van 13 lichtjaar lang.',
    deeper: [
      'De massaverliessnelheid loopt op tot een "superwind" van <span class="formula">10⁻⁵–10⁻⁴ M☉ per jaar</span>. De wind wordt aangedreven door stralingsdruk op stofkorrels die ontstaan in de koele, gepulseerde buitenlagen.',
      'Een groot deel van de koolstof en de stikstof in je lichaam is ooit gemaakt in AGB-sterren.',
    ],
    related: ['fusion.sprocess', 'fusion.triplealpha', 'planetaryNebula', 'horizontalBranch'],
  },

  'planetaryNebula': {
    title: 'Planetaire nevel',
    tooltip: 'Afgestoten gaswolk, verlicht door de hete kern',
    kicker: 'Einde van een zonachtige ster',
    status: 'waargenomen',
    body: [
      'Aan het eind van de AGB-fase heeft de ster zijn buitenlagen weggeblazen. Wat overblijft is de hete, kale kern. Die krimpt en wordt heel snel heet: tot meer dan <b>100.000 K</b>. Zijn uv-straling laat het weggeblazen gas oplichten: een <b>planetaire nevel</b>.',
      '<b>Fusie in de kern:</b> geen. De koolstof-zuurstofkern is "uit".',
      '<b>Fusie in een schil:</b> een heel dun laagje waterstof aan de buitenkant van de kern brandt nog even met de <b>CNO-cyclus</b>, tot de brandstof op is. Daarna wordt de kern een witte dwerg.',
      'De nevel zet uit met ongeveer 20–30 km/s en is maar zo\'n 10.000 tot 50.000 jaar zichtbaar. Daarna is hij te ijl geworden en vermengt het gas zich met de rest van de ruimte.',
    ],
    stats: [['Temperatuur kern', '~25.000–200.000 K'], ['Zichtbaar', '~10.000–50.000 jaar'], ['Fusie in de kern', 'geen'], ['Fusie in schil', 'laatste waterstof (CNO)'], ['Voorbeelden', 'Ringnevel M57, Kattenoognevel, Helixnevel']],
    fact: 'Een planetaire nevel heeft niets met planeten te maken. De naam komt van William Herschel, die in zijn telescoop ronde vlekjes zag die op planeten leken.',
    deeper: [
      'De kleuren komen van atomen die door uv-licht worden geïoniseerd en daarna licht uitzenden: groen van zuurstof ([O III], 500,7 nm), rood van waterstof (Hα, 656,3 nm) en stikstof ([N II], 658,4 nm).',
    ],
    related: ['agb', 'whiteDwarf', 'fusion.cno', 'path.zonachtig'],
  },

  'whiteDwarf': {
    title: 'Witte dwerg',
    tooltip: 'Uitgebluste kern ter grootte van de Aarde',
    kicker: 'Eindproduct',
    status: 'waargenomen',
    body: [
      'Een <b>witte dwerg</b> is de overgebleven kern van een zonachtige ster: ongeveer 0,5 tot 1,3 M☉, samengeperst tot ongeveer de grootte van de Aarde. Een theelepel witte-dwergmaterie weegt tonnen.',
      '<b>Fusie:</b> geen. Er brandt niets meer: de witte dwerg bestaat vooral uit <b>koolstof en zuurstof</b>, met een dun laagje helium en waterstof erop. Hij schijnt alleen door zijn <b>restwarmte</b>, en koelt heel langzaam af.',
      'Wat houdt hem dan op? Niet de temperatuur, maar de <b>elektronendegeneratiedruk</b>: elektronen kunnen niet in dezelfde toestand zitten en verzetten zich daarom tegen verder samenpersen. Dat werkt maar tot ongeveer <b>1,4 M☉</b> (de Chandrasekhar-limiet).',
      'Hoe zwaarder een witte dwerg, hoe kleiner hij is. In het model wordt een ster van 1 M☉ een witte dwerg van ongeveer 0,56 M☉, een ster van 3 M☉ een van ongeveer 0,77 M☉.',
    ],
    stats: [['Massa', 'typisch ~0,6 M☉ (max ~1,4 M☉)'], ['Straal', '~5.000–10.000 km (ongeveer de Aarde)'], ['Oppervlak', '~120.000 K → 4.000 K in ~10 miljard jaar'], ['Dichtheid', '~10⁹ kg/m³ (theelepel ~5–15 ton)'], ['Energiebron', 'restwarmte (geen fusie)']],
    fact: 'Sirius B, de begeleider van de helderste ster aan de hemel, is een witte dwerg van 1,02 M☉ met een straal van maar ongeveer 5.800 km.',
    deeper: [
      'Voor een niet-relativistisch ontaard elektronengas geldt <span class="formula">R ∝ M<sup>−1/3</sup></span>: twee keer zo zwaar betekent ongeveer 20 % kleiner. Bij het naderen van de Chandrasekhar-limiet krimpt de straal naar nul:',
      '<div class="formula-block">M<sub>Ch</sub> ≈ 1,44 M☉ (voor 2 nucleonen per elektron)</div>',
      'Als witte dwergen afkoelen, <b>kristalliseert</b> hun binnenste. De Gaia-satelliet zag in 2019 een ophoping van witte dwergen precies bij de temperatuur waarbij dat gebeurt: de vrijkomende warmte vertraagt hun afkoeling.',
    ],
    related: ['bron.cooling', 'planetaryNebula', 'blackDwarf', 'whiteDwarf.ONe', 'whiteDwarf.He'],
  },

  'whiteDwarf.He': {
    title: 'Heliumwitte dwerg',
    tooltip: 'Lichte witte dwerg die uit helium bestaat',
    kicker: 'Eindproduct',
    status: 'deels',
    body: [
      'Een rode dwerg wordt nooit heet genoeg om helium te laten fuseren. Als zijn waterstof op is, blijft er een <b>heliumwitte dwerg</b> over: een witte dwerg van puur helium, lichter dan ongeveer 0,45 M☉. In het model wordt een ster van 0,1–0,5 M☉ een heliumwitte dwerg van ongeveer 0,1 tot 0,3 M☉.',
      '<b>Fusie:</b> geen. De heliumwitte dwerg schijnt alleen door zijn <b>restwarmte</b> en koelt langzaam af, net als een gewone witte dwerg.',
      'Er zijn wel heliumwitte dwergen waargenomen, maar die zijn allemaal in dubbelsterren ontstaan: een begeleider heeft de mantel van een rode reus weggetrokken voordat helium kon ontbranden. Uit een losse rode dwerg is er nog geen een ontstaan: daarvoor is het heelal veel te jong.',
    ],
    stats: [['Massa', 'minder dan ~0,45 M☉'], ['Samenstelling', 'helium'], ['Energiebron', 'restwarmte'], ['Uit een losse rode dwerg', 'pas over honderden miljarden jaren'], ['Waargenomen', 'alleen in dubbelsterren']],
    fact: 'Sommige heliumwitte dwergen zijn extreem licht, minder dan 0,2 M☉. Ze draaien soms in minder dan een uur om een andere witte dwerg of een pulsar.',
    deeper: [
      'Om helium te ontsteken moet een ontaarde kern ongeveer 0,45 M☉ zijn. Lichtere heliumkernen worden nooit heet genoeg (~10⁸ K), zodat de fusie stopt na de waterstof.',
    ],
    related: ['redDwarf', 'redDwarf.blauw', 'whiteDwarf', 'bron.cooling'],
  },

  'whiteDwarf.ONe': {
    title: 'Zuurstof-neon-witte dwerg',
    tooltip: 'Zware witte dwerg uit een ster van ~7–8 M☉',
    kicker: 'Eindproduct',
    status: 'deels',
    body: [
      'Sterren van ongeveer 7 tot 8 M☉ worden in hun AGB-fase net heet genoeg voor <b>koolstoffusie</b> in de kern. Daardoor bestaat hun witte dwerg niet uit koolstof en zuurstof, maar uit <b>zuurstof, neon en magnesium</b>.',
      '<b>Fusie:</b> geen meer. Voor neonfusie was de kern net niet heet genoeg. De witte dwerg schijnt door <b>restwarmte</b>.',
      'Deze witte dwergen zijn zwaar, ongeveer 1,1 tot 1,3 M☉, en daardoor extra klein: in het model ongeveer 3.700 km in straal, dus ongeveer twee keer zo groot als de Maan.',
    ],
    stats: [['Beginmassa ster', '~7–8 M☉'], ['Massa', '~1,1–1,3 M☉'], ['Samenstelling', 'zuurstof, neon, magnesium'], ['Straal', '~3.000–4.000 km'], ['Energiebron', 'restwarmte']],
    fact: 'Als zo\'n witte dwerg in een dubbelster gas opslokt, kan er een nova ontstaan waarin veel neon wordt weggeslingerd. Zulke "neonnova\'s", zoals Nova Cygni 1992, verraden dat er zuurstof-neon-witte dwergen bestaan.',
    deeper: [
      'De grens tussen een zuurstof-neon-witte dwerg en een supernova is onzeker. Sterren net boven de grens kunnen een <b>elektronenvangst-supernova</b> krijgen: elektronen worden door neon en magnesium ingevangen, de druk valt weg en de kern stort in tot een neutronenster.',
    ],
    related: ['whiteDwarf', 'agb', 'fusion.carbon', 'bron.cooling'],
  },

  'blackDwarf': {
    title: 'Zwarte dwerg',
    tooltip: 'Een volledig afgekoelde witte dwerg (theorie)',
    kicker: 'Eindproduct · verre toekomst',
    status: 'theorie',
    body: [
      'Een witte dwerg koelt heel langzaam af. Na ongeveer <b>10¹⁵ jaar</b> (een biljard jaar) is hij zo koud dat hij geen licht of warmte van betekenis meer geeft: een <b>zwarte dwerg</b>.',
      '<b>Fusie:</b> geen. Ook geen andere energiebron: alleen de laatste <b>restwarmte</b>, die bijna helemaal op is. De zwarte dwerg is een koude, kristallijne bol van koolstof en zuurstof (of helium), zo groot als de Aarde.',
      'Een zwarte dwerg bestaat nog niet: het heelal is pas 13,8 miljard jaar oud, dat is honderdduizenden keren te kort. De koelste witte dwergen die we kennen zijn nog steeds een paar duizend K.',
    ],
    stats: [['Tijd om af te koelen', 'meer dan 10¹⁵ jaar'], ['Temperatuur', 'bijna het absolute nulpunt'], ['Grootte', 'ongeveer de Aarde'], ['Energiebron', 'geen (restwarmte op)'], ['Bestaat nu?', 'nee, het heelal is te jong']],
    fact: 'Omdat witte dwergen zo voorspelbaar afkoelen, kun je aan de koelste witte dwergen in de Melkweg aflezen hoe oud de Melkweg is: ongeveer 8 tot 10 miljard jaar voor de schijf.',
    deeper: [
      'Volgens Mestel neemt de lichtkracht van een afkoelende witte dwerg af als <span class="formula">L ∝ t<sup>−7/5</sup></span>. In de allerlaatste fase koelt het oppervlak veel langzamer af dan in het begin.',
    ],
    related: ['whiteDwarf', 'bron.cooling', 'ui.theorie'],
  },
});

// ================================================================= stages: massive stars
Object.assign(Content.info, {
  'supergiant.blauw': {
    title: 'Blauwe superreus',
    tooltip: 'Zware ster net na de hoofdreeks',
    kicker: 'Zware ster',
    status: 'waargenomen',
    body: [
      'Als de waterstof in de kern van een zware ster op is, trekt de kern samen en zet de ster uit. Hij wordt een <b>blauwe superreus</b>: tientallen keren zo groot als de Zon, tienduizenden tot miljoenen keren zo helder, en met een oppervlak van 10.000 tot 30.000 K.',
      '<b>Fusie in de kern:</b> nog geen. De kern bestaat nu uit helium; hij trekt samen en wordt heter, van ongeveer 50 naar 110 miljoen K. Rond 100 miljoen K begint het <b>3-alfaproces</b>: helium wordt koolstof en zuurstof.',
      '<b>Fusie in een schil:</b> rond de kern brandt waterstof met de <b>CNO-cyclus</b>.',
      'Bij sterren met weinig metalen (vroeg heelal) blijft de ster ook tijdens de hele heliumfusie blauw. Bij sterren met een samenstelling zoals de Zon zwelt hij verder op tot een rode superreus, en daar gaat de heliumfusie door.',
    ],
    stats: [['Oppervlak', '~10.000–30.000 K'], ['Lichtkracht', '10⁴–10⁶ L☉'], ['Kerntemperatuur', '~50 → 110 miljoen K'], ['Fusie in de kern', 'eerst geen, daarna 3-alfaproces'], ['Fusie in schil', 'waterstof (CNO-cyclus)']],
    fact: 'De ster die in 1987 ontplofte als supernova SN 1987A was een blauwe superreus van ongeveer 20 M☉. Astronomen hadden verwacht dat alleen rode superreuzen konden ontploffen.',
    deeper: [
      'Rigel en Deneb zijn bekende blauwe superreuzen. Deneb staat zo ver weg (ruwweg 2.600 lichtjaar, onzeker) dat hij meer dan 100.000 keer zo helder moet zijn als de Zon om zo helder aan onze hemel te staan.',
    ],
    related: ['supergiant', 'fusion.triplealpha', 'fusion.cno', 'coreCollapse'],
  },

  'supergiant': {
    title: 'Rode superreus',
    tooltip: 'De grootste sterren: honderden keren de Zon',
    kicker: 'Zware ster',
    status: 'waargenomen',
    body: [
      'Een zware ster (ongeveer 8 tot 25 M☉) zwelt op tot een <b>rode superreus</b>: honderden tot ruim duizend keer zo groot als de Zon. Als hij op de plaats van de Zon stond, reikte hij tot voorbij de baan van Mars, soms zelfs Jupiter.',
      '<b>Fusie in de kern:</b> het <b>3-alfaproces</b> bij ongeveer 110 tot 220 miljoen K: helium wordt koolstof en zuurstof. Dit duurt ongeveer een tiende van de hoofdreekstijd: voor 15 M☉ ongeveer 1,5 miljoen jaar.',
      '<b>Fusie in een schil:</b> een waterstofschil met de <b>CNO-cyclus</b>.',
      'Daarna volgen koolstof-, neon-, zuurstof- en siliciumfusie steeds sneller na elkaar. Aan de buitenkant zie je daar bijna niets van: de ster blijft een rode superreus tot hij ontploft.',
    ],
    stats: [['Straal', '~500–1.500 R☉'], ['Oppervlak', '~3.500–4.000 K'], ['Lichtkracht', '~10⁴–10⁵ L☉ en meer'], ['Kerntemperatuur', '~110–220 miljoen K'], ['Fusie in de kern', '3-alfaproces'], ['Fusie in schil', 'waterstof (CNO-cyclus)']],
    fact: 'Betelgeuze in Orion is een rode superreus op ongeveer 550 lichtjaar. Eind 2019 werd hij opeens veel zwakker (de "Grote Verduistering"): hij had een stofwolk uitgestoten. Hij ontploft ergens in de komende 100.000 jaar.',
    deeper: [
      'Met <span class="formula">L = 4πR²σT⁴</span> kun je de straal uitrekenen. Voor L = 10⁵ L☉ en T = 3.600 K: R/R☉ = √(L/L☉) · (5.772/3.600)² ≈ 316 × 2,57 ≈ 810 R☉.',
    ],
    related: ['supergiant.blauw', 'evo.koolstof', 'supergiant.schillen', 'fusion.triplealpha'],
  },

  'wolfRayet.lbv': {
    title: 'Lichtkrachtige blauwe veranderlijke',
    tooltip: 'Instabiele reuzenster met enorme uitbarstingen',
    kicker: 'Zeer zware ster',
    status: 'waargenomen',
    body: [
      'Heel zware sterren (in dit model vanaf ongeveer 40 M☉, bij een normaal metaalgehalte) zitten zo dicht bij hun maximale helderheid dat hun eigen licht de buitenlagen wegduwt. Ze worden <b>lichtkrachtige blauwe veranderlijken</b> (LBV\'s): onrustige sterren die soms enorm opzwellen en uitbarsten.',
      '<b>Fusie in de kern:</b> geen. De waterstof in de kern is op; de heliumkern trekt samen en wordt heter, van ongeveer 60 naar 110 miljoen K. <b>Fusie in een schil:</b> rond de kern brandt waterstof met de <b>CNO-cyclus</b>.',
      'Bij uitbarstingen kan zo\'n ster in korte tijd meerdere zonsmassa\'s gas verliezen. In deze fase verliest de ster in het model ongeveer 40 % van zijn massa. Zo raakt hij zijn waterstofmantel kwijt.',
    ],
    stats: [['Lichtkracht', '~10⁵–10⁶ L☉ en meer'], ['Oppervlak', 'wisselend, ~9.000–25.000 K'], ['Massaverlies', 'tot enkele M☉ per uitbarsting'], ['Fusie in de kern', 'geen (heliumkern trekt samen)'], ['Fusie in schil', 'waterstof (CNO-cyclus)'], ['Voorbeelden', 'Eta Carinae, P Cygni']],
    fact: 'Eta Carinae had in 1843 een "Grote Uitbarsting" en werd even de op één na helderste ster aan de hemel. Hij stootte ongeveer 10 M☉ uit, die nu de Homunculusnevel vormt.',
    deeper: [
      'Een ster kan niet onbeperkt helder zijn: bij de <b>Eddington-limiet</b> duwt de stralingsdruk even hard naar buiten als de zwaartekracht naar binnen trekt:',
      '<div class="formula-block">L<sub>Edd</sub> ≈ 3,2 × 10⁴ · (M/M☉) L☉</div>',
      'Voor een ster van 100 M☉ is dat ongeveer 3 miljoen L☉. LBV\'s zitten daar vlak onder.',
    ],
    related: ['wolfRayet', 'fusion.cno', 'path.zeerZwaar'],
  },

  'wolfRayet': {
    title: 'Wolf-Rayetster',
    tooltip: 'Kale, superhete kern van een zeer zware ster',
    kicker: 'Zeer zware ster',
    status: 'waargenomen',
    body: [
      'Door de sterke winden is de waterstofmantel helemaal weg. Wat overblijft is de kale, hete kern van de ster: een <b>Wolf-Rayetster</b>. Het oppervlak is 30.000 tot meer dan 100.000 K heet.',
      '<b>Fusie in de kern:</b> het <b>3-alfaproces</b>, bij ongeveer 110 tot 250 miljoen K: helium wordt koolstof en zuurstof. (Sterren van ongeveer 25 tot 40 M☉ zijn daar al kort mee begonnen als rode superreus, voordat de winden hun waterstofmantel wegbliezen.)',
      '<b>Fusie in schillen:</b> geen waterstofschil meer, want er is geen waterstof meer over.',
      'De winden blijven razend hard: ongeveer 10⁻⁵ M☉ per jaar, met 1.000 tot 3.000 km/s. Daarna volgen koolstof-, neon-, zuurstof- en siliciumfusie, en ten slotte stort de kern in.',
    ],
    stats: [['Oppervlak', '~30.000–200.000 K'], ['Wind', '~10⁻⁵ M☉/jaar, 1.000–3.000 km/s'], ['Kerntemperatuur', '~110–250 miljoen K'], ['Fusie in de kern', '3-alfaproces'], ['Fusie in schillen', 'geen (geen waterstof meer)'], ['Duur', '~0,3–0,6 miljoen jaar']],
    fact: 'WR 104 is een dubbelster met een Wolf-Rayetster die een spiraal van stof blaast: van dichtbij lijkt hij op een draaiende tuinsproeier.',
    deeper: [
      'Wolf-Rayetsterren hebben geen absorptielijnen zoals de Zon, maar brede, heldere emissielijnen van helium, stikstof (type WN) of koolstof en zuurstof (type WC). Die lijnen ontstaan in de dichte wind die van de ster wegwaait.',
      'Wolf-Rayetsterren zijn waarschijnlijk de voorlopers van supernova\'s van type Ib en Ic, waarin geen waterstof te zien is.',
    ],
    related: ['wolfRayet.lbv', 'evo.koolstof', 'coreCollapse.Ibc', 'fusion.triplealpha'],
  },

  'evo.koolstof': {
    title: 'Koolstoffusie in de kern',
    tooltip: 'Koolstof wordt neon: nog een paar honderd jaar',
    kicker: 'Zware ster · kernfusie',
    status: 'theorie',
    body: [
      'Het helium in de kern is op. De kern van koolstof en zuurstof krimpt en wordt heter, tot ongeveer <b>0,8 à 0,9 miljard K</b>. Dan begint de <b>koolstoffusie</b>.',
      '<b>Fusie in de kern:</b> koolstof wordt <b>neon</b>, natrium en magnesium.',
      '<b>Fusie in schillen:</b> een <b>heliumschil</b> (3-alfaproces) en, als de ster nog waterstof heeft, een <b>waterstofschil</b> (CNO-cyclus). Zo ontstaan de eerste lagen van de "ui".',
      'Vanaf nu gaat het snel. Bij deze temperatuur ontstaan zoveel <b>neutrino\'s</b> dat die meer energie meenemen dan het licht. De ster moet dus harder stoken: koolstoffusie duurt voor een ster van 15 M☉ ongeveer 2.000 jaar, voor 25 M☉ zo\'n 500 jaar en voor nog zwaardere sterren maar tientallen tot een paar jaar.',
    ],
    stats: [['Kerntemperatuur', '~0,8–0,9 miljard K'], ['Fusie in de kern', 'koolstof → neon, natrium, magnesium'], ['Fusie in schillen', 'helium (+ waterstof)'], ['Duur', '~2.000 jaar (15 M☉), ~500 jaar (25 M☉)']],
    fact: 'Aan de buitenkant van de ster zie je niets van deze fase: de mantel is zo groot en traag dat hij pas na het ontploffen "hoort" wat er in de kern is gebeurd.',
    deeper: [
      'Neutrino\'s ontstaan hier vooral uit paren van elektronen en positronen (<span class="formula">e⁻ + e⁺ → ν + ν̄</span>). Ze ontsnappen vrijwel ongehinderd. Zo is de levensduur van een fase ongeveer de brandstof gedeeld door het neutrinoverlies, dat steil stijgt met de temperatuur.',
      'Bij de allerzwaarste sterren met weinig metalen (≥ ~130 M☉ in dit model) is dit de laatste rustige fase: daarna wordt de kern instabiel door paarvorming.',
    ],
    related: ['fusion.carbon', 'evo.neon', 'supergiant', 'pairInstability'],
  },

  'evo.neon': {
    title: 'Neonfusie in de kern',
    tooltip: 'Licht breekt neon af: ongeveer één jaar',
    kicker: 'Zware ster · kernfusie',
    status: 'theorie',
    body: [
      'De koolstof in de kern is op. De kern bestaat nu uit zuurstof, neon en magnesium en krimpt verder tot ongeveer <b>1,5 miljard K</b>.',
      '<b>Fusie in de kern:</b> <b>neonfusie</b>. Het licht is nu zo energierijk dat het neonkernen kapot schiet. De losse heliumkernen die daarbij vrijkomen, smelten samen met andere neonkernen tot magnesium. Wat overblijft is vooral zuurstof en magnesium.',
      '<b>Fusie in schillen:</b> koolstof, helium en (als die er nog is) waterstof, elk in een eigen schil.',
      'Deze fase duurt maar ongeveer <b>een jaar</b>.',
    ],
    stats: [['Kerntemperatuur', '~1,5–1,65 miljard K'], ['Fusie in de kern', 'neon → zuurstof + magnesium'], ['Fusie in schillen', 'koolstof, helium (+ waterstof)'], ['Duur', 'ongeveer 1 jaar']],
    fact: 'Neonfusie is eigenlijk half afbraak: eerst wordt een kern kapotgeschoten door licht, pas daarna wordt er weer iets opgebouwd.',
    deeper: [
      'Netto: <span class="formula">2 ²⁰Ne → ¹⁶O + ²⁴Mg + 4,6 MeV</span>. Het afbreken kost 4,7 MeV, het invangen van de heliumkern levert 9,3 MeV op.',
    ],
    related: ['fusion.neon', 'evo.koolstof', 'evo.zuurstof'],
  },

  'evo.zuurstof': {
    title: 'Zuurstoffusie in de kern',
    tooltip: 'Zuurstof wordt silicium: maanden tot jaren',
    kicker: 'Zware ster · kernfusie',
    status: 'theorie',
    body: [
      'Het neon is op. De zuurstofkern wordt heter, tot ongeveer <b>2 miljard K</b>, en begint te fuseren.',
      '<b>Fusie in de kern:</b> <b>zuurstoffusie</b>: twee zuurstofkernen worden <b>silicium</b> en zwavel, met een beetje fosfor.',
      '<b>Fusie in schillen:</b> neon, koolstof, helium en (als die er nog is) waterstof. De ui krijgt steeds meer lagen.',
      'Zuurstoffusie duurt voor een ster van 15 M☉ ongeveer 2,5 jaar, voor 25 M☉ ongeveer een half jaar en voor de zwaarste sterren maar weken.',
    ],
    stats: [['Kerntemperatuur', '~1,9–2,3 miljard K'], ['Fusie in de kern', 'zuurstof → silicium, zwavel'], ['Fusie in schillen', 'neon, koolstof, helium (+ waterstof)'], ['Duur', '~2,5 jaar (15 M☉) tot weken']],
    fact: 'Het silicium in zand en in computerchips is voor een groot deel gemaakt door zuurstoffusie in zware sterren, en later bij hun ontploffing.',
    deeper: [
      'Vanaf zuurstoffusie beginnen elektronen ingevangen te worden door kernen (<span class="formula">p + e⁻ → n + νₑ</span>). Daardoor krijgt de kern meer neutronen dan protonen, wat later belangrijk is voor de instorting.',
    ],
    related: ['fusion.oxygen', 'evo.neon', 'supergiant.schillen'],
  },

  'supergiant.schillen': {
    title: 'Siliciumfusie: de uienschil',
    tooltip: 'Laatste dag: silicium wordt ijzer',
    kicker: 'Zware ster · kernfusie',
    status: 'theorie',
    body: [
      'Dit is de laatste fusiefase. De kern is <b>3 tot 3,5 miljard K</b> heet en <b>silicium</b> wordt omgezet in nikkel en ijzer. Voor een ster van 15 M☉ duurt dat ongeveer 2,5 week, voor 25 M☉ ongeveer <b>een dag</b>, voor de zwaarste sterren maar uren.',
      '<b>Fusie in de kern:</b> <b>siliciumfusie</b>. <b>Fusie in schillen:</b> van binnen naar buiten zuurstof, neon, koolstof, helium en (als die er nog is) waterstof. De ster is opgebouwd als een <b>ui</b>, met in elke laag de as van de laag eronder.',
      'Met ijzer houdt het op. IJzer is de "zuinigste" kern: de deeltjes zitten er het sterkst aan elkaar vast. Fusie van ijzer levert geen energie meer op, maar kost energie. De ijzerkern groeit zonder eigen energiebron tot ongeveer <b>1,4 M☉</b>.',
      'Dan kan de elektronendruk het gewicht niet meer dragen en stort de kern in minder dan een seconde in.',
    ],
    stats: [['Kerntemperatuur', '~2,8–3,6 miljard K'], ['Fusie in de kern', 'silicium → nikkel-56 → ijzer'], ['Fusie in schillen', 'O, Ne, C, He (+ H)'], ['Duur', '~uren tot weken (25 M☉: ~1 dag)'], ['IJzerkern', '~1,4 M☉ (1,3–2 M☉)']],
    fact: 'Een ster van 15 M☉ doet ongeveer 15 miljoen jaar over waterstof, 1,5 miljoen jaar over helium, 2.000 jaar over koolstof, een jaar over neon, 2,5 jaar over zuurstof en ruim twee weken over silicium.',
    deeper: [
      'Bindingsenergie per nucleon (MeV): ⁴He 7,07 · ¹²C 7,68 · ¹⁶O 7,98 · ²⁸Si 8,45 · ⁵⁶Fe 8,79 · ⁶²Ni 8,79 (het hoogst). Na de ijzergroep daalt de curve weer: daar levert juist splijting energie op.',
      '<div class="formula-block">Chandrasekhar: M<sub>Ch</sub> ≈ 5,83 · Y<sub>e</sub>² M☉ ≈ 1,2–1,4 M☉ (Y<sub>e</sub> ≈ 0,43–0,5)</div>',
      'Door elektronenvangst daalt het aantal elektronen per nucleon Y<sub>e</sub> onder 0,5, zodat de maximale massa van de ijzerkern iets lager uitkomt; warme elektronen maken hem juist weer wat hoger.',
    ],
    related: ['fusion.silicon', 'lab.doorsnede', 'coreCollapse', 'evo.zuurstof'],
  },
});

// ================================================================= stages: explosions and remnants
Object.assign(Content.info, {
  'coreCollapse': {
    title: 'Supernova (type II)',
    tooltip: 'De ijzerkern stort in, de ster ontploft',
    kicker: 'Explosie',
    status: 'waargenomen',
    body: [
      'De ijzerkern van ongeveer 1,4 M☉ stort in <b>0,1 tot 0,25 seconde</b> in, met snelheden tot 70.000 km/s. <b>Fusie:</b> geen. Integendeel: fel licht breekt de ijzerkernen af en elektronen worden in protonen geperst. Zo ontstaat een bol van <b>neutronen</b>, zo dicht als een atoomkern.',
      'Daar stuitert het invallende materiaal op terug. Er ontstaat een schokgolf, die met hulp van een enorme stroom <b>neutrino\'s</b> (ongeveer 10⁵⁸) de rest van de ster wegblaast. In het binnenste loopt de temperatuur op tot ongeveer 100 miljard K.',
      '<b>Ook actief:</b> <b>explosieve nucleosynthese</b>. De schokgolf verhit de schillen van silicium en zuurstof zo dat ze in seconden fuseren. Daarbij ontstaat radioactief <b>nikkel-56</b>, dat vervalt tot kobalt en ijzer en de supernova maandenlang laat nagloeien.',
      'Omdat de ster nog een waterstofmantel had, zie je waterstof in het spectrum: dat maakt het een supernova van <b>type II</b>. In het model blijft er een <b>neutronenster</b> van ongeveer 1,25 tot 1,7 M☉ over.',
    ],
    stats: [['Instorting', '0,1–0,25 s, tot ~70.000 km/s'], ['Neutrino\'s', '~10⁵⁸, ~99 % van ~10⁴⁶ J'], ['Bewegingsenergie', '~10⁴⁴ J'], ['Helderheid', 'tot ~10⁹ L☉'], ['Beginmassa', '~8–25 M☉'], ['Restant', 'neutronenster']],
    fact: 'Bij supernova SN 1987A werden op aarde 25 neutrino\'s gevangen, een paar uur voordat het licht zichtbaar werd. Het was het eerste bewijs dat een instortende kern echt zo werkt.',
    deeper: [
      'De energie komt uit zwaartekracht, niet uit fusie. Een kern van 1,4 M☉ die krimpt tot ~12 km levert ongeveer:',
      '<div class="formula-block">E ≈ G M² / R ≈ (6,67 × 10⁻¹¹ · (2,8 × 10³⁰)²) / 1,2 × 10⁴ ≈ 4 × 10⁴⁶ J</div>',
      'Maar een procent daarvan wordt bewegingsenergie van de ontploffing, en maar een honderdste procent licht. De Krabnevel is het restant van de supernova die Chinese astronomen in het jaar 1054 zagen.',
    ],
    related: ['fusion.collapse', 'fusion.explosive', 'neutronStar', 'supergiant.schillen'],
  },

  'coreCollapse.Ibc': {
    title: 'Supernova (type Ib/c)',
    tooltip: 'Ontploffing van een kale ster zonder waterstof',
    kicker: 'Explosie',
    status: 'waargenomen',
    body: [
      'Een Wolf-Rayetster heeft geen waterstofmantel meer. Als zijn ijzerkern instort, ontstaat een supernova <b>zonder waterstof</b> in het spectrum: <b>type Ib</b> (wel helium) of <b>type Ic</b> (ook geen helium meer).',
      '<b>Fusie:</b> geen in de kern: de ijzerkern stort in tot neutronen, zoals bij type II. <b>Ook actief:</b> <b>explosieve nucleosynthese</b> in de schokgolf, waarbij onder meer nikkel-56 ontstaat.',
      'In dit model blijft er bij deze zware sterren (ongeveer 25 tot 40 M☉) een <b>zwart gat</b> van ongeveer 5 tot 10 M☉ over, doordat een deel van de uitgeworpen materie terugvalt op de nieuwe neutronenster. In werkelijkheid kan er ook een neutronenster overblijven: wat er precies gebeurt, hangt af van de structuur van de kern.',
    ],
    stats: [['Voorloper', 'Wolf-Rayetster (of gestripte ster in een dubbelster)'], ['Spectrum', 'geen waterstof (Ic ook geen helium)'], ['Fusie in de kern', 'geen (instorting)'], ['Ook actief', 'explosieve nucleosynthese'], ['Restant (model)', 'zwart gat van ~5–10 M☉']],
    fact: 'Sommige supernova\'s van type Ic gaan samen met een lange gammaflits: bij de instorting ontstaat dan een snel draaiend zwart gat dat twee jets dwars door de ster schiet, zoals bij SN 1998bw.',
    deeper: [
      'Veel sterren verliezen hun mantel niet door hun eigen wind, maar doordat een begeleider in een dubbelster het gas wegtrekt. Daardoor komen supernova\'s van type Ib/c ook voor bij sterren die lichter zijn dan 25 M☉.',
    ],
    related: ['wolfRayet', 'fusion.collapse', 'fusion.explosive', 'blackHole'],
  },

  'coreCollapse.direct': {
    title: 'Mislukte supernova',
    tooltip: 'De ster verdwijnt in een zwart gat, zonder knal',
    kicker: 'Instorting',
    status: 'deels',
    body: [
      'Bij de zwaarste sterren (in dit model vanaf ongeveer 40 M☉, of vanaf 25 M☉ bij weinig metalen) is de kern zo zwaar dat de schokgolf het niet haalt. Alles valt terug en de kern stort meteen door tot een <b>zwart gat</b>. De ster lijkt gewoon te <b>verdwijnen</b>.',
      '<b>Fusie:</b> geen. De ijzerkern stort in (fotodesintegratie en elektronenvangst), maar er is geen explosieve nucleosynthese, omdat er geen schokgolf door de schillen gaat.',
      'Toch gaat het niet helemaal stil. Doordat de neutrino\'s een deel van de massa meenemen, verliest de kern plotseling gewicht. De buitenlagen kunnen daardoor een beetje opzwellen en zwak rood oplichten, voordat de ster uitdooft.',
    ],
    stats: [['Beginmassa (model)', '≥ ~40 M☉ (weinig metalen: ≥ ~25 M☉)'], ['Fusie in de kern', 'geen (instorting)'], ['Explosie', 'geen of heel zwak'], ['Restant', 'zwart gat (model: 10–45 M☉)']],
    fact: 'In 2009 werd een rode superreus van ongeveer 25 M☉ in het sterrenstelsel NGC 6946 even helderder en verdween daarna uit beeld (N6946-BH1). Het is een kandidaat voor een mislukte supernova, maar het is nog niet zeker.',
    deeper: [
      'Theoretisch is het niet alleen de massa die telt, maar vooral hoe compact de kern is vlak voor de instorting. Daardoor kunnen er tussen de sterren die wel ontploffen ook "eilanden" van sterren liggen die dat niet doen.',
      'In 2024 vond de Gaia-satelliet Gaia BH3: een zwart gat van 33 M☉ met een begeleider die heel weinig metalen heeft. Dat past bij het idee dat zulke zware zwarte gaten vooral bij laag metaalgehalte ontstaan.',
    ],
    related: ['blackHole', 'fusion.collapse', 'wolfRayet', 'path.zeerZwaar'],
  },

  'pairInstability': {
    title: 'Paarinstabiliteitssupernova',
    tooltip: 'Licht wordt materie en de ster ontploft volledig',
    kicker: 'Explosie',
    status: 'deels',
    body: [
      'Bij gigantische sterren met weinig metalen (in dit model vanaf ongeveer 130 M☉) wordt de zuurstofkern na de koolstoffusie ongeveer <b>1 miljard K</b> heet. Het licht in de kern is dan zo energierijk dat twee fotonen samen een <b>elektron en een positron</b> kunnen maken: <b>paarvorming</b>.',
      'Daardoor verdwijnt een deel van de stralingsdruk die de kern overeind hield. De kern stort in, wordt nog heter (tot ongeveer 3,5 miljard K) en dan ontbrandt de zuurstof <b>explosief</b>. Er komt zoveel energie vrij dat de hele ster uit elkaar wordt geblazen.',
      '<b>Kernprocessen:</b> <b>paarvorming</b> in de kern, en <b>explosieve fusie</b> van zuurstof en silicium. Daarbij kan tientallen zonsmassa\'s radioactief nikkel-56 ontstaan, dat de supernova maandenlang extreem helder laat stralen.',
      'Zulke sterren waren waarschijnlijk vooral in het vroege heelal te vinden. Er zijn een paar kandidaten gezien (zoals SN 2007bi en SN 2018ibb), maar niet één is helemaal zeker.',
    ],
    stats: [['Beginmassa', '~130–250 M☉ (weinig metalen)'], ['Temperatuur kern', '~1 → 3,5 miljard K'], ['Nikkel-56', 'tot tientallen M☉'], ['Energie', '~10⁴⁴–10⁴⁶ J'], ['Restant', 'niets']],
    fact: 'Een gewone supernova laat een neutronenster of zwart gat achter. Een paarinstabiliteitssupernova laat helemaal niets achter: de ster wordt tot het laatste atoom de ruimte in geblazen.',
    deeper: [
      'Fotonen kunnen een elektron-positronpaar maken als hun energie groter is dan <span class="formula">2 m<sub>e</sub>c² = 1,022 MeV</span>. Bij 10⁹ K is kT maar 86 keV, maar een klein deel van de fotonen is energierijk genoeg, en in een kern van tientallen zonsmassa\'s is dat al te veel.',
      'Bij heliumkernen van ongeveer 35–65 M☉ is de instabiliteit te zwak om de ster te verscheuren: de ster stoot dan in pulsen massa uit (pulserende paarinstabiliteit). Bij heliumkernen boven ~130 M☉ stort alles juist in tot een zwart gat.',
    ],
    related: ['fusion.pair', 'fusion.explosive', 'pairInstability.rest', 'path.paarInstabiliteit'],
  },

  'pairInstability.rest': {
    title: 'Er blijft niets over',
    tooltip: 'Geen neutronenster, geen zwart gat: alleen gas',
    kicker: 'Eindproduct',
    status: 'theorie',
    body: [
      'Na een paarinstabiliteitssupernova is er <b>geen restant</b>: geen neutronenster, geen zwart gat, geen witte dwerg. Alleen een uitdijende wolk van gas, vol met zuurstof, silicium, zwavel, calcium en ijzer.',
      '<b>Fusie:</b> nergens meer. Er is ook geen ster meer die iets kan doen. Het gas vermengt zich met de ruimte, en uit dat verrijkte gas kunnen later nieuwe sterren en planeten ontstaan.',
      'Omdat zulke sterren helemaal verdwijnen, verwachten astronomen een "gat" in de massa\'s van zwarte gaten: tussen ongeveer 50 en 130 M☉ zouden er (bijna) geen zwarte gaten uit gewone sterren moeten ontstaan.',
    ],
    stats: [['Restant', 'niets'], ['Uitgeworpen massa', 'de hele ster (~130–250 M☉)'], ['IJzer (uit nikkel-56)', 'tot tientallen M☉'], ['Energiebron', 'geen']],
    fact: 'De zwaartekrachtgolfbron GW190521 bevatte een zwart gat van ongeveer 85 M☉, midden in dat "massagat". Het ontstond waarschijnlijk uit een eerdere botsing van twee kleinere zwarte gaten.',
    deeper: [
      'De allereerste sterren (populatie III) bestonden bijna alleen uit waterstof en helium. Ze konden waarschijnlijk veel zwaarder worden dan sterren nu. Hun paarinstabiliteitssupernova\'s zouden een herkenbaar patroon van elementen achterlaten, met weinig elementen met een oneven aantal protonen.',
    ],
    related: ['pairInstability', 'bron.void', 'path.paarInstabiliteit'],
  },

  'neutronStar': {
    title: 'Neutronenster',
    tooltip: 'Een stad groot, zwaarder dan de Zon',
    kicker: 'Eindproduct',
    status: 'waargenomen',
    body: [
      'Na een supernova van type II blijft er een <b>neutronenster</b> over: ongeveer 1,1 tot 2,3 M☉ (in het model 1,25–1,7 M☉) in een bol van maar 20 tot 24 km doorsnede. Een theelepel neutronenstermaterie weegt miljarden tonnen.',
      '<b>Fusie:</b> geen. Wat een neutronenster overeind houdt, is de druk van <b>neutronen</b> die niet verder samengeperst kunnen worden, plus de sterke kernkracht. Hij schijnt door <b>restwarmte</b>: eerst koelt hij af door neutrino\'s uit te zenden, na ongeveer 100.000 jaar vooral door röntgenstraling van het hete oppervlak.',
      'Veel neutronensterren draaien razendsnel en hebben een sterk magnetisch veld. Ze zenden bundels straling uit die als een vuurtoren over de aarde zwiepen: dan zien we een <b>pulsar</b>.',
    ],
    stats: [['Massa', '1,1–2,3 M☉ (typisch ~1,4)'], ['Diameter', '~20–24 km'], ['Dichtheid', '~4 × 10¹⁷ kg/m³'], ['Kerntemperatuur', '~10 miljard K → 10 miljoen K'], ['Energiebron', 'restwarmte (en draaiing)']],
    fact: 'De snelste bekende pulsar, PSR J1748−2446ad, draait 716 keer per seconde om zijn as. De eerste pulsar werd in 1967 ontdekt door Jocelyn Bell Burnell.',
    deeper: [
      'Er is een maximale massa voor neutronensterren, de <b>TOV-limiet</b>, ergens rond 2,2–2,3 M☉ (onzeker, 2–3 M☉). De zwaarste gemeten neutronenster, PSR J0952−0607, is ongeveer 2,35 M☉.',
      'Aan de oppervlakte is de zwaartekracht ongeveer 10¹¹ keer zo sterk als op aarde. De ontsnappingssnelheid is ongeveer 0,5 à 0,6 keer de lichtsnelheid.',
    ],
    related: ['bron.ns', 'coreCollapse', 'blackHole', 'path.zwaar'],
  },

  'blackHole': {
    title: 'Zwart gat',
    tooltip: 'Zo compact dat zelfs licht niet ontsnapt',
    kicker: 'Eindproduct',
    status: 'waargenomen',
    body: [
      'Als de ingestorte kern te zwaar is voor een neutronenster, houdt niets hem meer tegen. Hij stort in tot een <b>zwart gat</b>: een gebied waar de zwaartekracht zo sterk is dat zelfs licht niet meer kan ontsnappen. De grens heet de <b>waarnemingshorizon</b>.',
      '<b>Fusie:</b> geen, en ook geen licht van het zwarte gat zelf. Je kunt een zwart gat alleen zien door wat het met zijn omgeving doet: gas dat erin valt wordt in een schijf miljoenen graden heet en straalt röntgenstraling uit, en sterren draaien om iets onzichtbaars heen.',
      'In dit model worden sterren boven ongeveer 25 M☉ een zwart gat van ongeveer 5 tot 45 M☉. De zwaarste ontstaan bij sterren met weinig metalen, omdat die minder massa verliezen door hun wind.',
    ],
    stats: [['Massa (stellair)', '~5–45 M☉ (model)'], ['Horizonstraal', '~2,95 km per M☉ (10 M☉ → ~30 km)'], ['Beginmassa ster', 'meer dan ~25 M☉'], ['Energiebron', 'geen'], ['Voorbeelden', 'Cygnus X-1 (~21 M☉), Gaia BH3 (33 M☉)']],
    fact: 'In 2015 werden voor het eerst zwaartekrachtgolven gemeten (GW150914): twee zwarte gaten van 36 en 29 M☉ smolten samen tot één van 62 M☉. Drie zonsmassa\'s werden in een fractie van een seconde omgezet in trillingen van de ruimte zelf.',
    deeper: [
      '<div class="formula-block">r<sub>s</sub> = 2GM / c²</div>',
      'Voor 10 M☉: r<sub>s</sub> = 2 · 6,67 × 10⁻¹¹ · 2 × 10³¹ / (3 × 10⁸)² ≈ 30 km.',
      'Volgens Stephen Hawking zou een zwart gat heel zwak straling uitzenden (Hawkingstraling), bij 1 M☉ met een temperatuur van ongeveer 6 × 10⁻⁸ K. Dat is nog nooit gemeten.',
    ],
    related: ['bron.bh', 'coreCollapse.direct', 'coreCollapse.Ibc', 'path.zeerZwaar'],
  },
});

// ================================================================= fusion processes (core panel)
Object.assign(Content.info, {
  'fusion.deuterium': {
    title: 'Deuteriumfusie',
    tooltip: '²H + ¹H → ³He: de eerste fusie in een jonge ster',
    kicker: 'Kernfusie',
    status: 'deels',
    body: [
      '<b>Deuterium</b> is zware waterstof: een kern met één proton én één neutron (²H). Het is de makkelijkste kern om te laten fuseren. Vanaf ongeveer <b>1 miljoen K</b> vangt een deuteriumkern een proton en wordt hij <b>helium-3</b>, waarbij een gammafoton vrijkomt.',
      '<div class="formula-block">²H + ¹H → ³He + γ</div>',
      'Er is maar heel weinig deuterium: ongeveer 2 op elke 100.000 waterstofatomen. Het is gemaakt in de eerste minuten na de oerknal. Daarom is deze fusie bij sterren snel voorbij. Ze werkt vooral als <b>thermostaat</b> in protosterren: zolang er deuterium is, blijft de kern rond 1 miljoen K.',
      'Bij bruine dwergen zwaarder dan ongeveer 13 Jupitermassa\'s is dit de enige fusie die ooit op gang komt.',
    ],
    stats: [['Temperatuur', 'vanaf ~1 miljoen K'], ['Energie per reactie', '5,5 MeV'], ['Brandstof', 'deuterium (D/H ≈ 2 × 10⁻⁵)'], ['Waar', 'protosterren, jonge bruine dwergen'], ['Duur', 'kort: tot enkele tientallen miljoenen jaren']],
    fact: 'Deze reactie is ook stap 2 van de pp-keten in de Zon. Daar wordt het deuterium meteen weer opgebruikt: een deuteriumkern in de zonnekern bestaat gemiddeld maar een paar seconden.',
    deeper: [
      'De hoeveelheid deuterium in het heelal (D/H ≈ 2,5 × 10⁻⁵ direct na de oerknal) is een van de beste metingen van hoeveel gewone materie er is. Sterren vernietigen deuterium alleen maar: alles wat er nu is, is dus overgebleven van de oerknal.',
      'Q-waarde: m(²H) + m(¹H) − m(³He) = 2,01410 + 1,00783 − 3,01603 = 0,00590 u → × 931,5 MeV/u ≈ 5,49 MeV.',
    ],
    related: ['protostar', 'ignition.deuterium', 'fusion.pp', 'fusion.lithium'],
  },

  'fusion.lithium': {
    title: 'Lithiumverbranding',
    tooltip: '⁷Li + ¹H → 2 ⁴He: de lithiumtest',
    kicker: 'Kernfusie',
    status: 'waargenomen',
    body: [
      'Vanaf ongeveer <b>2,5 miljoen K</b> wordt lithium vernietigd: een lithium-7-kern vangt een proton en valt uiteen in twee heliumkernen.',
      '<div class="formula-block">⁷Li + ¹H → 2 ⁴He</div>',
      'Er is maar heel weinig lithium, dus dit levert nauwelijks energie op. Het is vooral interessant als <b>test</b>. Rode dwergen en jonge sterren zijn grotendeels convectief: hun gas wordt rondgeroerd, zodat het lithium van het oppervlak ook in de hete kern komt en na ongeveer 100 miljoen jaar op is.',
      'Bruine dwergen lichter dan ongeveer 0,065 M☉ (ongeveer 65 Jupitermassa\'s) worden nooit zo heet. Zie je in een heel koel, oud object nog lithium (een lijn bij 670,8 nm in het spectrum), dan weet je: dit is een <b>bruine dwerg</b>, geen ster. Dat is de <b>lithiumtest</b>.',
    ],
    stats: [['Temperatuur', 'vanaf ~2,5 miljoen K'], ['Energie per reactie', '17,3 MeV'], ['Waar', 'jonge sterren tot ~1,2 M☉, zwaarste bruine dwergen'], ['Test', 'lithium over → bruine dwerg (< ~0,065 M☉)']],
    fact: 'Met de lithiumtest werd in 1995 Teide 1 in de Plejaden bevestigd als een van de eerste bruine dwergen. Het idee kwam van Rafael Rebolo en zijn collega\'s op de Canarische Eilanden.',
    deeper: [
      'De test werkt alleen voor objecten die oud genoeg zijn: een jonge rode dwerg heeft zijn lithium ook nog. Bij een sterrenhoop van bekende leeftijd ligt er een scherpe grens (de "lithium-depletiegrens") tussen sterren zonder en objecten met lithium. Die grens is zelfs een manier om de leeftijd van de hoop te meten.',
      'De Zon heeft aan haar oppervlak ongeveer 150 keer minder lithium dan meteorieten: ook zij heeft een deel van haar lithium verbrand.',
    ],
    related: ['ttauri', 'ttauri.bruineDwerg', 'brownDwarf', 'fusion.deuterium'],
  },

  'fusion.pp': {
    title: 'pp-keten',
    tooltip: 'Waterstof wordt helium in drie stappen',
    kicker: 'Kernfusie',
    status: 'waargenomen',
    body: [
      'De <b>proton-protonketen</b> (pp-keten) is de manier waarop de Zon en alle lichtere sterren waterstof in helium omzetten. Hij begint vanaf ongeveer 4 miljoen K en is de belangrijkste energiebron van sterren lichter dan ongeveer <b>1,3 M☉</b> (kern tot ~17 miljoen K).',
      '<b>Stap 1:</b> twee protonen smelten samen; één wordt een neutron. Er ontstaat deuterium, een positron en een neutrino: ¹H + ¹H → ²H + e⁺ + νₑ. <b>Stap 2:</b> deuterium vangt een proton: ²H + ¹H → ³He + γ. <b>Stap 3:</b> twee helium-3-kernen worden helium-4, en er komen twee protonen vrij: ³He + ³He → ⁴He + 2 ¹H.',
      'Netto: <b>4 ¹H → ⁴He + 2 e⁺ + 2 νₑ + 26,7 MeV</b>. Het heliumatoom is ongeveer <b>0,7 %</b> lichter dan de vier waterstofatomen. Die ontbrekende massa is energie geworden (E = mc²).',
      'Stap 1 is extreem traag, want er moet een proton in een neutron veranderen (de zwakke kernkracht). Een proton in de zonnekern wacht gemiddeld zo\'n 10 miljard jaar. Daarom brandt de Zon rustig en lang.',
    ],
    stats: [['Netto', '4 ¹H → ⁴He + 2 e⁺ + 2 νₑ'], ['Energie', '26,7 MeV per heliumkern'], ['Massa → energie', '~0,7 %'], ['Temperatuur', 'vanaf ~4 miljoen K (Zon: 15,7 miljoen K)'], ['Dominant', 'sterren < ~1,3 M☉'], ['Gevoeligheid', '~T⁴']],
    fact: 'Elke seconde gaan er ongeveer 65 miljard neutrino\'s uit de zonnekern door elke vierkante centimeter van je lichaam. Ze zijn gemeten: het Borexino-experiment zag in 2014 de neutrino\'s van stap 1 rechtstreeks.',
    deeper: [
      'Massadefect: 4 × 1,007825 u − 4,002603 u = 0,028697 u → × 931,5 MeV/u = 26,73 MeV. Daarvan nemen de neutrino\'s ongeveer 2 % mee de ruimte in.',
      'In de Zon loopt ongeveer 83 % via deze route (pp-I). In pp-II en pp-III wordt ³He met ⁴He omgezet in beryllium-7, dat via lithium-7 of boor-8 alsnog twee heliumkernen oplevert.',
      '<div class="formula-block">ε<sub>pp</sub> ∝ ρ · X² · T<sup>≈4</sup></div>',
    ],
    related: ['fusion.cno', 'mainSequence', 'redDwarf', 'fusion.deuterium'],
  },

  'fusion.cno': {
    title: 'CNO-cyclus',
    tooltip: 'Waterstof → helium met koolstof als hulpje',
    kicker: 'Kernfusie',
    status: 'waargenomen',
    body: [
      'In sterren zwaarder dan ongeveer <b>1,3 M☉</b> (kern boven ~17 miljoen K) wordt waterstof vooral via de <b>CNO-cyclus</b> in helium omgezet. Het netto-resultaat is hetzelfde als bij de pp-keten: <b>4 ¹H → ⁴He + 2 e⁺ + 2 νₑ</b>, maar de weg is anders.',
      'Koolstof, stikstof en zuurstof werken als <b>katalysator</b>: ze helpen, maar worden niet opgebruikt. In zes stappen: ¹²C vangt een proton → ¹³N, dat vervalt tot ¹³C → vangt een proton → ¹⁴N → vangt een proton → ¹⁵O, dat vervalt tot ¹⁵N → vangt een proton en valt uiteen in ¹²C + ⁴He. De koolstof is terug en de kringloop begint opnieuw.',
      'De CNO-cyclus is extreem gevoelig voor temperatuur: ongeveer <b>T¹⁷</b>, tegen ~T⁴ voor de pp-keten. Een beetje heter betekent veel sneller. Daardoor is de kern van zware sterren kolkend (convectief) en verbranden ze hun brandstof zo snel.',
      'Ook in de <b>waterstofschil</b> rond de heliumkern van rode reuzen, superreuzen en AGB-sterren loopt vooral de CNO-cyclus.',
    ],
    stats: [['Netto', '4 ¹H → ⁴He + 2 e⁺ + 2 νₑ'], ['Energie', '26,7 MeV per heliumkern'], ['Temperatuur', 'boven ~17 miljoen K'], ['Katalysator', 'koolstof, stikstof, zuurstof'], ['Gevoeligheid', '~T¹⁶⁻²⁰ (≈ T¹⁷)'], ['Dominant', 'sterren > ~1,3 M☉ en H-schillen']],
    fact: 'In de Zon levert de CNO-cyclus maar ongeveer 1 % van de energie. Toch zijn de neutrino\'s ervan gemeten: het Borexino-experiment vond ze in 2020.',
    deeper: [
      'De traagste stap is <span class="formula">¹⁴N + ¹H → ¹⁵O + γ</span>. Daardoor hoopt stikstof zich op: de CNO-cyclus zet koolstof en zuurstof grotendeels om in stikstof-14. Het meeste stikstof in de lucht die je inademt, is zo gemaakt.',
      'Vergelijk bij 20 miljoen K de fusiesnelheden: een stijging van 10 % in temperatuur maakt de pp-keten ~1,1<sup>4</sup> ≈ 1,5 keer sneller, maar de CNO-cyclus ~1,1<sup>17</sup> ≈ 5 keer sneller.',
    ],
    related: ['fusion.pp', 'mainSequence', 'redGiant', 'fusion.triplealpha'],
  },

  'fusion.triplealpha': {
    title: 'Heliumfusie (3-alfaproces)',
    tooltip: 'Drie heliumkernen worden koolstof',
    kicker: 'Kernfusie',
    status: 'deels',
    body: [
      'Als de waterstof in de kern op is en de kern ongeveer <b>100 miljoen K</b> wordt, begint de <b>heliumfusie</b>. Omdat heliumkernen ook alfadeeltjes heten, noemt men dit het <b>3-alfaproces</b>.',
      'Twee heliumkernen vormen samen <b>beryllium-8</b>. Dat is heel instabiel en valt in 10⁻¹⁶ seconde weer uit elkaar. Maar bij zo\'n hoge temperatuur en dichtheid botst er soms net op tijd een derde heliumkern tegenaan: dan ontstaat <b>koolstof-12</b>.',
      '<div class="formula-block">⁴He + ⁴He ⇄ ⁸Be &nbsp;&nbsp; ⁸Be + ⁴He → ¹²C + γ</div>',
      'Een deel van de koolstof vangt nog een heliumkern en wordt <b>zuurstof</b>: ¹²C + ⁴He → ¹⁶O + γ. Zo ontstaat een kern van koolstof en zuurstof. Heliumfusie levert per kilogram ongeveer tien keer minder energie dan waterstoffusie, dus deze fase is veel korter.',
    ],
    stats: [['Netto', '3 ⁴He → ¹²C + γ (+ ¹²C + ⁴He → ¹⁶O)'], ['Energie', '7,3 MeV per koolstofkern'], ['Massa → energie', '~0,07 %'], ['Temperatuur', 'vanaf ~100 miljoen K'], ['Gevoeligheid', '~T⁴⁰'], ['Waar', 'kern na hoofdreeks; heliumschil bij AGB/superreuzen']],
    fact: 'Fred Hoyle voorspelde in 1953 dat koolstof-12 een speciale aangeslagen toestand moest hebben, anders zou er bijna geen koolstof zijn. Die "Hoyle-toestand" werd kort daarna in het lab gevonden. Zonder hem was er geen leven.',
    deeper: [
      'De Hoyle-toestand ligt 7,65 MeV boven de grondtoestand van ¹²C, net boven de energie van ⁸Be + ⁴He. Daardoor is de reactie resonant en tientallen miljoenen keren sneller.',
      'Hoeveel koolstof wordt omgezet in zuurstof, hangt af van de snelheid van <span class="formula">¹²C(α,γ)¹⁶O</span>. Die is nog steeds onzeker en wordt wel de "heilige graal" van de nucleaire astrofysica genoemd: hij bepaalt onder meer hoe zwaar zwarte gaten kunnen worden.',
    ],
    related: ['heliumFlash', 'horizontalBranch', 'agb', 'fusion.carbon', 'fusion.cno'],
  },

  'fusion.carbon': {
    title: 'Koolstoffusie',
    tooltip: '¹²C + ¹²C → neon of natrium',
    kicker: 'Kernfusie',
    status: 'theorie',
    body: [
      'In sterren zwaarder dan ongeveer 7 à 8 M☉ wordt de koolstof-zuurstofkern heet genoeg om koolstof te laten fuseren: ongeveer <b>0,8 miljard K</b>. Twee koolstofkernen smelten samen:',
      '<div class="formula-block">¹²C + ¹²C → ²⁰Ne + ⁴He &nbsp;&nbsp; of &nbsp;&nbsp; ¹²C + ¹²C → ²³Na + ¹H</div>',
      'Er ontstaan <b>neon</b>, <b>natrium</b> en (met de vrijgekomen heliumkernen en protonen) <b>magnesium</b>. De zuurstof doet nog niet mee: die heeft meer lading en heeft een hogere temperatuur nodig.',
      'Koolstoffusie in de kern duurt maar <b>honderden tot duizenden jaren</b>: ongeveer 2.000 jaar bij 15 M☉ en tientallen jaren bij de allerzwaarste sterren. Bij sterren van 7–8 M☉ ontstaat zo een zuurstof-neon-witte dwerg.',
    ],
    stats: [['Temperatuur', '~0,6–0,9 miljard K'], ['Producten', 'neon, natrium, magnesium'], ['Energie', '~4,6 MeV (Ne) of ~2,2 MeV (Na) per reactie'], ['Duur (kern)', '~2.000 jaar (15 M☉) tot tientallen jaren'], ['Minimale beginmassa', '~7–8 M☉']],
    fact: 'Het natrium in keukenzout is voor een groot deel gemaakt door koolstoffusie in zware sterren.',
    deeper: [
      'Vanaf koolstoffusie verliest de ster meer energie via neutrino\'s dan via licht. De neutrinoverliezen stijgen ongeveer als T⁹, daarom wordt elke volgende fase veel korter.',
      'De reactiesnelheid van ¹²C + ¹²C bij stellaire energieën is moeilijk te meten; er zijn aanwijzingen voor resonanties die de ontsteking kunnen verschuiven.',
    ],
    related: ['evo.koolstof', 'fusion.triplealpha', 'fusion.neon', 'whiteDwarf.ONe'],
  },

  'fusion.neon': {
    title: 'Neonfusie',
    tooltip: 'Licht breekt neon af, helium maakt magnesium',
    kicker: 'Kernfusie',
    status: 'theorie',
    body: [
      'Bij ongeveer <b>1,5 miljard K</b> zijn de fotonen in de kern zo energierijk dat ze neonkernen kapot kunnen schieten: <b>fotodesintegratie</b>. Er komt een heliumkern los.',
      '<div class="formula-block">²⁰Ne + γ → ¹⁶O + ⁴He &nbsp;&nbsp; ²⁰Ne + ⁴He → ²⁴Mg + γ</div>',
      'De losgeschoten heliumkern wordt direct ingevangen door een andere neonkern, die daardoor <b>magnesium</b> wordt. Netto worden twee neonkernen één zuurstof- en één magnesiumkern.',
      'Neonfusie in de kern duurt maar ongeveer <b>een jaar</b>.',
    ],
    stats: [['Temperatuur', '~1,2–1,8 miljard K (model 1,5)'], ['Netto', '2 ²⁰Ne → ¹⁶O + ²⁴Mg'], ['Energie', '~4,6 MeV netto'], ['Duur (kern)', '~1 jaar'], ['Producten', 'zuurstof, magnesium']],
    fact: 'Neonfusie is de eerste fase waarin licht zelf kernen afbreekt. Datzelfde proces, maar dan met ijzer, laat later de kern instorten.',
    deeper: [
      'Het afbreken kost 4,73 MeV; het invangen levert 9,32 MeV op. Omdat de fotodesintegratie vanuit het hoge-energiedeel van de Planckverdeling komt, stijgt de snelheid extreem steil met de temperatuur.',
    ],
    related: ['evo.neon', 'fusion.carbon', 'fusion.oxygen'],
  },

  'fusion.oxygen': {
    title: 'Zuurstoffusie',
    tooltip: '¹⁶O + ¹⁶O → silicium en zwavel',
    kicker: 'Kernfusie',
    status: 'theorie',
    body: [
      'Bij ongeveer <b>2 miljard K</b> gaan zuurstofkernen samensmelten. Twee zuurstofkernen worden meestal <b>silicium</b> plus een heliumkern, of <b>fosfor</b> plus een proton:',
      '<div class="formula-block">¹⁶O + ¹⁶O → ²⁸Si + ⁴He &nbsp;&nbsp; of &nbsp;&nbsp; ¹⁶O + ¹⁶O → ³¹P + ¹H</div>',
      'De losse heliumkernen en protonen maken er nog <b>zwavel</b>, argon en calcium bij. Zo ontstaat een kern van vooral silicium en zwavel.',
      'Zuurstoffusie in de kern duurt <b>maanden tot een paar jaar</b>: ongeveer 2,5 jaar bij 15 M☉, een half jaar bij 25 M☉ en weken bij de zwaarste sterren.',
    ],
    stats: [['Temperatuur', '~1,9–2,3 miljard K'], ['Producten', 'silicium, zwavel (argon, calcium)'], ['Energie', '~9,6 MeV (Si) per reactie'], ['Duur (kern)', 'weken tot ~2,5 jaar']],
    fact: 'Explosieve zuurstoffusie is ook de motor van een paarinstabiliteitssupernova: daar gebeurt in seconden wat hier maanden duurt.',
    deeper: [
      'Tijdens zuurstoffusie vangen kernen steeds meer elektronen in, waardoor het aantal elektronen per nucleon (Y<sub>e</sub>) daalt van 0,50 naar ongeveer 0,49. Dat maakt de latere ijzerkern iets lichter en instabieler.',
    ],
    related: ['evo.zuurstof', 'fusion.neon', 'fusion.silicon', 'fusion.pair'],
  },

  'fusion.silicon': {
    title: 'Siliciumfusie',
    tooltip: 'Silicium "smelt" tot nikkel en ijzer',
    kicker: 'Kernfusie',
    status: 'theorie',
    body: [
      'Bij <b>3 tot 3,5 miljard K</b> smelten niet simpelweg twee siliciumkernen samen (dat is te moeilijk). In plaats daarvan schiet het felle licht sommige siliciumkernen kapot (<b>fotodesintegratie</b>), en worden de vrijgekomen heliumkernen één voor één door andere kernen ingevangen (<b>alfavangst</b>).',
      'Zo klimt silicium op, stap voor stap met telkens een heliumkern erbij: silicium → zwavel → argon → calcium → titanium → chroom → ijzer-52 → <b>nikkel-56</b>. Netto: <b>²⁸Si + 7 ⁴He → ⁵⁶Ni</b>. Nikkel-56 vervalt later tot ijzer-56.',
      'Daar stopt het. Kernen uit de <b>ijzergroep</b> hebben de hoogste bindingsenergie per kerndeeltje: ze zijn het "zuinigst" gebouwd. Wie ijzer wil laten fuseren, moet er energie in stoppen in plaats van dat het energie oplevert.',
      'Siliciumfusie duurt maar <b>uren tot weken</b>; bij een ster van 25 M☉ ongeveer <b>een dag</b>. Daarna heeft de ster een ijzerkern zonder energiebron.',
    ],
    stats: [['Temperatuur', '~2,8–3,6 miljard K'], ['Netto', '²⁸Si + 7 ⁴He → ⁵⁶Ni (→ ⁵⁶Fe)'], ['Duur (kern)', 'uren tot weken (25 M☉: ~1 dag)'], ['Eindpunt', 'ijzergroep: hoogste bindingsenergie'], ['Resultaat', 'ijzerkern van ~1,4 M☉']],
    fact: 'Het ijzer in je bloed is in sterren gemaakt, deels door siliciumfusie in zware sterren en hun supernova\'s, en deels door ontploffende witte dwergen.',
    deeper: [
      'Siliciumfusie verloopt als een <b>quasi-evenwicht</b>: heen- en terugreacties (vangst en fotodesintegratie) zijn bijna in balans, en de samenstelling schuift langzaam op naar de meest gebonden kernen.',
      'Bindingsenergie per nucleon: ²⁸Si 8,45 MeV, ⁵⁶Fe 8,79 MeV, ⁶²Ni 8,79 MeV (net iets hoger dan ijzer-56). Van ²⁸Si naar ⁵⁶Ni komt per kerndeeltje dus nog maar ongeveer 0,2–0,3 MeV vrij: veel minder dan de ~6,7 MeV bij waterstoffusie.',
    ],
    related: ['supergiant.schillen', 'fusion.oxygen', 'fusion.collapse', 'lab.samenstelling'],
  },

  'fusion.collapse': {
    title: 'Kerninstorting',
    tooltip: 'Geen fusie: ijzer wordt afgebroken tot neutronen',
    kicker: 'Kernprocessen',
    status: 'deels',
    body: [
      'Dit is <b>geen fusie</b>, maar het omgekeerde. De ijzerkern heeft geen energiebron meer. Twee processen halen de laatste steun onder hem weg:',
      '<b>1. Fotodesintegratie:</b> het licht in de kern (~10 miljard K) is zo energierijk dat het ijzerkernen kapotschiet tot helium en neutronen: ⁵⁶Fe + γ → 13 ⁴He + 4 n. Dat kost enorm veel energie, die de kern niet heeft. <b>2. Elektronenvangst:</b> elektronen worden in protonen geperst: <b>p + e⁻ → n + νₑ</b>. Daardoor verdwijnt de elektronendruk die de kern overeind hield (<b>neutronisatie</b>).',
      'De kern stort in minder dan een kwart seconde in tot een bol van neutronen van ongeveer 20–30 km, zo dicht als een atoomkern. Daarbij komen ongeveer <b>10⁵⁸ neutrino\'s</b> vrij, die ongeveer 99 % van de energie meenemen.',
      'De energie van een supernova komt dus niet uit fusie, maar uit <b>zwaartekracht</b>: het instorten van de kern.',
    ],
    stats: [['Reacties', '⁵⁶Fe + γ → 13 ⁴He + 4 n; p + e⁻ → n + νₑ'], ['Temperatuur', '~10 → 100 miljard K'], ['Duur', '~0,1–0,25 s'], ['Neutrino\'s', '~10⁵⁸'], ['Energie', '~10⁴⁶ J (vooral neutrino\'s)']],
    fact: 'In de paar seconden van de instorting komt als neutrino\'s honderden keren zoveel energie vrij als de Zon in haar hele leven van 10 miljard jaar uitstraalt.',
    deeper: [
      'Het afbreken van één ijzer-56-kern tot 13 heliumkernen en 4 neutronen kost ~124 MeV; het verder afbreken van helium tot protonen en neutronen nog eens 28,3 MeV per heliumkern. Die energie wordt aan de druk onttrokken, en daardoor versnelt de instorting.',
      'De instorting stopt bij kerndichtheid (~2–3 × 10¹⁷ kg/m³). Dan wordt de sterke kernkracht afstotend en kaatst de binnenkern terug.',
    ],
    related: ['coreCollapse', 'fusion.silicon', 'fusion.explosive', 'neutronStar'],
  },

  'fusion.explosive': {
    title: 'Explosieve nucleosynthese',
    tooltip: 'In seconden nieuwe elementen in de schokgolf',
    kicker: 'Kernprocessen',
    status: 'waargenomen',
    body: [
      'Als de schokgolf van een supernova door de schillen van silicium en zuurstof raast, worden die in een fractie van een seconde verhit tot <b>miljarden K</b>. Er gebeurt dan in seconden wat anders dagen tot jaren zou duren: silicium en zuurstof fuseren <b>explosief</b>.',
      'Een belangrijk product is radioactief <b>nikkel-56</b>. Dat vervalt met een halveringstijd van 6 dagen tot <b>kobalt-56</b>, en dat met een halveringstijd van 77 dagen tot stabiel <b>ijzer-56</b>: <b>⁵⁶Ni → ⁵⁶Co → ⁵⁶Fe</b>. De energie van dat verval laat de supernova maandenlang nagloeien.',
      'Daarnaast kunnen bij sommige explosies in korte tijd heel veel neutronen worden ingevangen: het <b>r-proces</b> (snelle neutronenvangst), dat zware elementen zoals goud en uranium maakt. Waar dat vooral gebeurt, is nog niet helemaal duidelijk: botsende neutronensterren leveren in elk geval een groot deel, gewone supernova\'s waarschijnlijk alleen de lichtere r-proceselementen.',
    ],
    stats: [['Temperatuur', '~4–10 miljard K, in seconden'], ['Nikkel-56 (type II)', '~0,01–0,1 M☉ (SN 1987A: ~0,07 M☉)'], ['Verval', '⁵⁶Ni (6 dagen) → ⁵⁶Co (77 dagen) → ⁵⁶Fe'], ['Andere producten', 'Si, S, Ar, Ca, Ti, r-proceselementen']],
    fact: 'Bij SN 1987A werd gammastraling van vervallend kobalt-56 gemeten, en de helderheid daalde precies zo snel als de halveringstijd van kobalt voorspelde. Zo zag men "live" ijzer ontstaan.',
    deeper: [
      'De lichtkromme volgt het radioactieve verval: <span class="formula">L(t) ∝ M<sub>Ni</sub> · e<sup>−t/τ</sup></span>, met τ = 111 dagen (de gemiddelde levensduur van ⁵⁶Co, = 77,2 dagen / ln 2). Na een paar honderd dagen daalt de helderheid dus met ongeveer 1 magnitude per 100 dagen.',
      'Titanium-44 (halveringstijd ~60 jaar) is ook explosief gemaakt en is nog steeds zichtbaar in jonge supernovarestanten, zoals Cassiopeia A.',
    ],
    related: ['coreCollapse', 'pairInstability', 'fusion.collapse', 'fusion.oxygen'],
  },

  'fusion.sprocess': {
    title: 's-proces',
    tooltip: 'Langzame neutronenvangst: barium, lood',
    kicker: 'Kernprocessen',
    status: 'waargenomen',
    body: [
      'Elementen zwaarder dan ijzer kunnen niet door gewone fusie ontstaan: dat kost energie. Ze ontstaan door <b>neutronenvangst</b>. Neutronen hebben geen lading, dus ze worden niet afgestoten door de positieve kern.',
      'In AGB-sterren komen tussen de helium- en waterstofschil langzaam neutronen vrij. Een ijzerkern vangt er af en toe één. Dat gaat zo <b>langzaam</b> (s van slow: jaren tot duizenden jaren tussen twee vangsten) dat een instabiele kern eerst kan vervallen: een neutron wordt dan een proton (<b>bètaverval</b>) en er ontstaat een nieuw element.',
      'Zo klimt het s-proces stap voor stap op langs de stabiele kernen: van ijzer naar onder meer <b>strontium</b>, <b>barium</b> en uiteindelijk <b>lood</b> en bismut. Ongeveer de helft van alle elementen zwaarder dan ijzer is zo gemaakt.',
    ],
    stats: [['Waar', 'AGB-sterren (en zware sterren: zwak s-proces)'], ['Neutronenbronnen', '¹³C(α,n)¹⁶O en ²²Ne(α,n)²⁵Mg'], ['Temperatuur', '~100–300 miljoen K'], ['Producten', 'Sr, Y, Zr, Ba, La, Pb …'], ['Eindpunt', 'lood en bismut']],
    fact: 'In 1952 zag Paul Merrill het element technetium in het spectrum van rode reuzen. Technetium heeft geen stabiele vorm en vervalt in hooguit miljoenen jaren: het moest dus in de ster zelf gemaakt zijn. Het eerste directe bewijs dat sterren nieuwe elementen maken.',
    deeper: [
      'Het s-proces is een ketting van <span class="formula">(n,γ)</span>-vangsten en <span class="formula">β⁻</span>-vervallen: <span class="formula">⁵⁶Fe + n → ⁵⁷Fe + γ</span>, … , <span class="formula">⁵⁹Fe → ⁵⁹Co + e⁻ + ν̄ₑ</span>. Bij het r-proces (in explosies) volgen de vangsten elkaar zo snel op dat er geen tijd is voor verval.',
      'Neutronendichtheden: ~10⁷–10⁸ per cm³ bij de ¹³C-bron, tot ~10¹⁰ per cm³ bij de ²²Ne-bron tijdens thermische pulsen.',
    ],
    related: ['agb', 'fusion.triplealpha', 'fusion.explosive'],
  },

  'fusion.pair': {
    title: 'Paarvorming',
    tooltip: 'γ + γ → e⁻ + e⁺: licht wordt materie',
    kicker: 'Kernprocessen',
    status: 'deels',
    body: [
      'Dit is geen fusie. Bij ongeveer <b>1 miljard K</b> hebben sommige fotonen zoveel energie dat twee fotonen samen een <b>elektron</b> en een <b>positron</b> (anti-elektron) kunnen maken:',
      '<div class="formula-block">γ + γ → e⁻ + e⁺</div>',
      'In gewone sterren is dat geen probleem. Maar in de zuurstofkern van een gigantische ster met weinig metalen (≥ ~130 M☉ in dit model) komt een groot deel van de druk juist van de straling. Als die fotonen in deeltjes veranderen, <b>verdwijnt druk</b>. De kern kan zijn eigen gewicht niet meer dragen en stort in.',
      'Door de instorting wordt de kern nog heter (tot ~3,5 miljard K) en ontbrandt de zuurstof <b>explosief</b>. Dat levert meer energie op dan de zwaartekracht die de ster bij elkaar houdt: de ster wordt volledig verscheurd.',
    ],
    stats: [['Reactie', 'γ + γ → e⁻ + e⁺'], ['Drempel', '2 × 511 keV = 1,022 MeV'], ['Temperatuur', '~1 miljard K'], ['Gevolg', 'drukverlies → instorting → explosieve zuurstoffusie'], ['Waar', 'heliumkernen van ~65–130 M☉']],
    fact: 'Paarvorming is gewoon E = mc² de andere kant op: energie (licht) wordt massa. In deeltjesversnellers gebeurt dit dagelijks.',
    deeper: [
      'Een ster is stabiel zolang de adiabatische index γ<sub>ad</sub> groter is dan 4/3. Bij paarvorming gaat een deel van de warmte in het maken van deeltjes zitten in plaats van in de druk, zodat γ<sub>ad</sub> in de kern onder 4/3 zakt.',
      'Bij kT = 86 keV (10⁹ K) is maar een klein deel van de fotonen energierijk genoeg, maar bij de enorme stralingsdichtheid in zo\'n kern is dat genoeg om de stabiliteit te doorbreken.',
    ],
    related: ['pairInstability', 'fusion.oxygen', 'fusion.explosive', 'path.paarInstabiliteit'],
  },
});

// ================================================================= energy sources when nothing fuses
Object.assign(Content.info, {
  'bron.cloud': {
    title: 'Nog geen ster',
    tooltip: 'Koud gas: geen kern en geen fusie',
    kicker: 'Energiebron',
    status: 'waargenomen',
    body: [
      'In een moleculaire wolk is nog geen ster, dus ook geen kern en geen kernfusie. Het gas is ijskoud: <b>10 tot 20 K</b>.',
      'De kleine beetjes warmte komen van buiten: van het licht van sterren in de buurt en van <b>kosmische straling</b> (snelle deeltjes die dwars door de wolk schieten). Moleculen zoals koolmonoxide en stofkorrels stralen die warmte weer uit als infrarood- en millimeterstraling. Daardoor blijft de wolk koud.',
      'Pas als de zwaartekracht wint en een deel van de wolk instort, begint het gas op te warmen.',
    ],
    stats: [['Temperatuur', '10–20 K'], ['Verwarming', 'sterlicht, kosmische straling'], ['Koeling', 'straling van CO-moleculen en stof'], ['Fusie', 'geen']],
    fact: 'Dat een wolk zo koud is, helpt juist bij het vormen van sterren: koud gas heeft weinig druk, zodat de zwaartekracht het makkelijker kan samentrekken.',
    deeper: [
      'Radiotelescopen zoals ALMA meten de temperatuur van wolken aan de straling van moleculen zoals CO (bij 2,6 mm) en ammoniak.',
    ],
    related: ['cloud', 'bron.gravity', 'collapse'],
  },

  'bron.gravity': {
    title: 'Samentrekking',
    tooltip: 'Zwaartekracht perst gas samen en maakt het heet',
    kicker: 'Energiebron',
    status: 'waargenomen',
    body: [
      'Zonder fusie kan een ster toch schijnen: door te <b>krimpen</b>. Als gas naar binnen valt, wordt zwaartekrachtsenergie omgezet in warmte, net zoals een fietspomp warm wordt als je lucht samenperst. Dit heet het <b>Kelvin-Helmholtz-mechanisme</b>.',
      'Protosterren, T Tauri-sterren en jonge bruine dwergen schijnen op deze manier. Ook tijdens de korte fasen tussen twee fusiefasen, als een uitgebrande kern krimpt, levert samentrekking energie.',
      'Het vreemde is: een krimpende ster wordt <b>heter</b>, terwijl hij energie verliest. De helft van de vrijgekomen energie wordt uitgestraald, de andere helft verhit het gas. Zo wordt de kern uiteindelijk heet genoeg voor fusie.',
    ],
    stats: [['Mechanisme', 'Kelvin-Helmholtz-contractie'], ['Zon (schatting)', '~30 miljoen jaar'], ['Waar', 'instorting, protoster, T Tauri, uitgebrande kernen'], ['Fusie', 'geen nodig']],
    fact: 'In de 19e eeuw dachten Kelvin en Helmholtz dat de Zon zo scheen. Dan zou ze maar tientallen miljoenen jaren oud kunnen zijn. Geologen en Darwin hadden veel meer tijd nodig: pas kernfusie loste dat conflict op.',
    deeper: [
      '<div class="formula-block">t<sub>KH</sub> ≈ G M² / (R L)</div>',
      'Voor de Zon: 6,67 × 10⁻¹¹ · (2 × 10³⁰)² / (7 × 10⁸ · 3,8 × 10²⁶) ≈ 10¹⁵ s ≈ 30 miljoen jaar.',
      'Volgens de viriaalstelling geldt voor een ster in evenwicht <span class="formula">2 E<sub>thermisch</sub> + E<sub>zwaartekracht</sub> = 0</span>: van elke joule zwaartekrachtsenergie gaat een halve naar warmte en een halve naar straling.',
    ],
    related: ['collapse', 'ttauri', 'protostar', 'bron.cooling'],
  },

  'bron.cooling': {
    title: 'Restwarmte',
    tooltip: 'Geen fusie meer: het object koelt langzaam af',
    kicker: 'Energiebron',
    status: 'waargenomen',
    body: [
      'Witte dwergen, bruine dwergen en (in de verre toekomst) zwarte dwergen hebben <b>geen fusie meer</b>. Ze krimpen ook bijna niet meer, omdat ontaarde elektronen ze tegenhouden. Wat ze nog uitstralen is <b>opgeslagen warmte</b>, als een kooltje na het vuur.',
      'Zo\'n object koelt eerst snel af en daarna steeds langzamer. Een witte dwerg gaat in ongeveer 10 miljard jaar van meer dan 100.000 K naar ongeveer 4.000 K aan het oppervlak. Een bruine dwerg zakt in miljarden jaren van type L via T naar Y.',
      'Uiteindelijk is alle warmte op. Voor een witte dwerg duurt dat meer dan 10¹⁵ jaar: dan is hij een <b>zwarte dwerg</b>.',
    ],
    stats: [['Waar', 'witte, bruine en zwarte dwergen'], ['Fusie', 'geen'], ['Witte dwerg', '~120.000 K → 4.000 K in ~10 miljard jaar'], ['Tot zwarte dwerg', 'meer dan 10¹⁵ jaar']],
    fact: 'Als een witte dwerg ver genoeg is afgekoeld, kristalliseert zijn binnenste tot een vast rooster van koolstof- en zuurstofkernen, een soort kosmisch kristal. Daarbij komt warmte vrij, zodat hij een tijd minder snel afkoelt.',
    deeper: [
      'De warmte zit vooral in de beweging van de atoomkernen (de ionen); de ontaarde elektronen geleiden die warmte heel goed naar buiten. Alleen de dunne buitenlaag isoleert. Mestels afkoelingswet: <span class="formula">t<sub>afkoeling</sub> ∝ (M/L)<sup>5/7</sup></span>.',
    ],
    related: ['whiteDwarf', 'brownDwarf', 'blackDwarf', 'bron.gravity'],
  },

  'bron.ns': {
    title: 'Afkoelende neutronenster',
    tooltip: 'Geen fusie: afkoelen, eerst via neutrino\'s',
    kicker: 'Energiebron',
    status: 'deels',
    body: [
      'Een neutronenster heeft <b>geen fusie</b>. Hij is bij zijn geboorte zo\'n 100 miljard K heet en koelt vanaf dat moment af.',
      'In de eerste 100.000 jaar gaat de meeste warmte weg als <b>neutrino\'s</b>, die uit het binnenste ontsnappen. Daarna neemt de <b>straling van het oppervlak</b> (vooral röntgenstraling) het over. In het model zakt de kern van ongeveer 10 miljard naar 10 miljoen K.',
      'Pulsars en magnetars stralen ook nog op een andere manier: ze gebruiken hun <b>draaiing</b> (pulsars remmen af) of hun <b>magneetveld</b> (magnetars). Dat is ook geen fusie.',
    ],
    stats: [['Kern bij geboorte', '~10¹¹ K'], ['Eerste ~10⁵ jaar', 'afkoelen via neutrino\'s'], ['Daarna', 'röntgen- en uv-straling van het oppervlak'], ['Oppervlak (jong)', '~1 miljoen K'], ['Fusie', 'geen']],
    fact: 'Een neutronenster in een dubbelster kan toch fusie hebben: gas van de begeleider dat op het oppervlak valt, ontbrandt af en toe in een flits van seconden. Dat zien we als röntgenflitsen (type I-röntgenbursts).',
    deeper: [
      'Het afkoelen door neutrino\'s gaat vooral via het "gemodificeerde Urca-proces": <span class="formula">n + n → n + p + e⁻ + ν̄ₑ</span> en terug. In heel zware neutronensterren kan het veel snellere directe Urca-proces optreden. Metingen van afkoelende neutronensterren vertellen zo iets over het onbekende binnenste.',
    ],
    related: ['neutronStar', 'fusion.collapse', 'bron.cooling'],
  },

  'bron.bh': {
    title: 'Geen energiebron',
    tooltip: 'Zwart gat: geen fusie en geen licht',
    kicker: 'Energiebron',
    status: 'deels',
    body: [
      'Een zwart gat heeft <b>geen fusie</b>, geen oppervlak en geeft zelf <b>geen licht</b>. Alles wat binnen de waarnemingshorizon valt, is voor altijd weg.',
      'Toch kunnen zwarte gaten de helderste objecten in het heelal aandrijven, maar dan van <b>buiten</b> de horizon: gas dat in een schijf naar binnen spiraliseert, wordt door wrijving miljoenen graden heet en straalt röntgenstraling uit.',
      'Dat is veel efficiënter dan fusie: van de massa van het invallende gas kan 6 tot 42 % in energie worden omgezet, tegen 0,7 % bij waterstoffusie.',
    ],
    stats: [['Fusie', 'geen'], ['Licht van het gat zelf', 'geen (Hawkingstraling: theorie)'], ['Rendement schijf', '~6–42 % van mc²'], ['Waterstoffusie ter vergelijking', '0,7 %']],
    fact: 'Volgens Hawking straalt een zwart gat toch een heel klein beetje. Een zwart gat van 1 zonsmassa zou pas na ongeveer 10⁶⁷ jaar helemaal zijn verdampt.',
    deeper: [
      'Het rendement hangt af van de binnenste stabiele baan (ISCO): voor een niet-draaiend zwart gat ligt die op 3 r<sub>s</sub> en komt 5,7 % vrij; voor een maximaal draaiend zwart gat tot 42 %.',
      '<div class="formula-block">T<sub>Hawking</sub> = ħ c³ / (8π G M k<sub>B</sub>) ≈ 6 × 10⁻⁸ K · (M☉/M)</div>',
    ],
    related: ['blackHole', 'coreCollapse.direct', 'bron.void'],
  },

  'bron.void': {
    title: 'Niets meer over',
    tooltip: 'De ster is volledig uit elkaar geblazen',
    kicker: 'Energiebron',
    status: 'theorie',
    body: [
      'Na een paarinstabiliteitssupernova is er <b>niets</b> meer: geen kern, geen fusie, geen restant. De hele ster is als gas de ruimte in geblazen.',
      'Het gas gloeit nog een tijd na door het verval van radioactief nikkel-56 en kobalt-56, en door de schokgolf die tegen het gas in de omgeving botst. Daarna koelt het af en vermengt het zich met de ruimte.',
      'In dat gas zitten nieuwe elementen, zoals zuurstof, silicium, calcium en tientallen zonsmassa\'s ijzer. Daaruit kunnen later nieuwe sterren en planeten ontstaan.',
    ],
    stats: [['Restant', 'geen'], ['Fusie', 'geen'], ['Nagloeien', 'verval ⁵⁶Ni → ⁵⁶Co → ⁵⁶Fe'], ['Nalatenschap', 'zuurstof, silicium, ijzer …']],
    fact: 'De eerste sterren in het heelal waren misschien zo zwaar dat ze zo eindigden. Hun "as" zou nog te vinden moeten zijn in de oudste sterren van de Melkweg.',
    deeper: [
      'Met een paar honderd zonsmassa\'s aan uitgeworpen materiaal kan één paarinstabiliteitssupernova een heel klein sterrenstelsel in één keer verrijken met metalen.',
    ],
    related: ['pairInstability.rest', 'pairInstability', 'fusion.explosive'],
  },
});

// ================================================================= lab panels + HR diagram
Object.assign(Content.info, {
  'lab.ster': {
    title: 'Jouw ster',
    tooltip: 'Kies een massa en laat je ster leven',
    kicker: 'Maak je eigen ster',
    body: [
      'Hier bouw je je eigen ster. Kies een <b>beginmassa</b> tussen 0,01 en 150 zonsmassa\'s (M☉) en druk op <b>afspelen</b>. Je ziet je ster dan ontstaan, leven en sterven, van moleculaire wolk tot eindproduct.',
      'De massa bepaalt bijna alles: hoe heet en helder de ster wordt, hoe lang hij leeft, welke fusie er in de kern gebeurt en wat er aan het eind overblijft. Een bruine dwerg, een rode dwerg, een witte dwerg, een neutronenster, een zwart gat, of helemaal niets.',
      'Je kunt ook kiezen voor een <b>laag metaalgehalte</b>: een ster met bijna alleen waterstof en helium, zoals de eerste sterren. Zulke sterren hebben zwakkere winden, verliezen minder massa en blijven langer blauw. Alleen daar kan een paarinstabiliteitssupernova ontstaan.',
      'Het <b>kernpaneel</b> laat live zien wat er binnenin gebeurt: welke fusie in de kern loopt, welke in de schillen eromheen, hoe heet de kern is en waar hij uit bestaat. Klik op een reactie voor uitleg.',
    ],
    stats: [['Massabereik', '0,01–150 M☉'], ['Lichtste ster', '~0,08 M☉'], ['Witte dwerg', 'tot ~8 M☉'], ['Neutronenster', '~8–25 M☉'], ['Zwart gat', 'meer dan ~25 M☉']],
    fact: 'De grenzen tussen de paden zijn bij benadering. Ze hangen af van het metaalgehalte, de draaiing van de ster en of hij een begeleider heeft.',
    deeper: [
      'De getallen komen uit standaard stermodellen (onder andere Woosley, Heger & Weaver 2002 voor zware sterren) en zijn afgerond. Voor een echte ster kunnen ze tientallen procenten afwijken.',
    ],
    related: ['lab.kern', 'lab.samenstelling', 'lab.doorsnede', 'hr.diagram', 'ui.tijd'],
  },

  'lab.kern': {
    title: 'Kerntemperatuur en druk',
    tooltip: 'Waarom de kern bij elke fase heter wordt',
    kicker: 'Maak je eigen ster',
    status: 'deels',
    body: [
      'Het kernpaneel toont de <b>temperatuur in het midden</b> van de ster. Die bepaalt welke fusie mogelijk is: atoomkernen zijn positief geladen en stoten elkaar af. Alleen als ze snel genoeg bewegen (heet genoeg) kunnen ze zo dicht bij elkaar komen dat ze samensmelten.',
      'Zwaardere kernen hebben meer lading en stoten elkaar harder af. Daarom heeft elke volgende brandstof een hogere temperatuur nodig: waterstof ~10 miljoen K, helium ~100 miljoen K, koolstof ~0,8 miljard K, neon ~1,5 miljard K, zuurstof ~2 miljard K, silicium ~3 miljard K.',
      'Hoe komt de kern steeds heter? Als een brandstof op is, valt de druk weg en trekt de kern samen. Door die samentrekking wordt hij heter, tot de volgende brandstof ontbrandt. Bij een lichte ster stopt dat eerder: de kern wordt ontaard en kan niet verder krimpen.',
      'Een ontaarde kern wordt tegengehouden door elektronen die niet dichter op elkaar kunnen. Die druk hangt niet af van de temperatuur. Daarom kan een witte dwerg afkoelen zonder te krimpen.',
    ],
    stats: [['Deuterium', '~1 miljoen K'], ['Waterstof', '~4–10 miljoen K en hoger'], ['Helium', '~100 miljoen K'], ['Koolstof / neon', '~0,8 / ~1,5 miljard K'], ['Zuurstof / silicium', '~2 / ~3 miljard K']],
    fact: 'De kern van de Zon is ongeveer 15,7 miljoen K heet en 150 keer zo dicht als water. De druk is er ongeveer 250 miljard keer zo groot als de luchtdruk op aarde.',
    deeper: [
      'Klassiek zouden protonen bij 15 miljoen K elkaar nooit raken: de Coulombbarrière is ~1.000 keer hoger dan hun gemiddelde energie. Dankzij het <b>tunneleffect</b> (quantummechanica) lukt het toch af en toe. De kans valt het best uit bij de "Gamow-piek":',
      '<div class="formula-block">E<sub>0</sub> ≈ 1,22 keV · (Z₁² Z₂² μ T<sub>6</sub>²)<sup>1/3</sup></div>',
      'Voor twee protonen in de Zon (μ = 0,5, T<sub>6</sub> = 15,7) is dat ongeveer 6 keV, terwijl kT maar 1,4 keV is.',
    ],
    related: ['lab.ster', 'lab.samenstelling', 'fusion.pp', 'fusion.triplealpha'],
  },

  'lab.samenstelling': {
    title: 'Samenstelling van de kern',
    tooltip: 'Welke elementen er in de kern zitten',
    kicker: 'Maak je eigen ster',
    status: 'theorie',
    body: [
      'De gekleurde balk laat zien waar de kern uit bestaat, als <b>massafractie</b>: welk deel van de massa uit welk element bestaat. Een nieuwe ster begint met ongeveer 71 % waterstof, 27 % helium en 2 % zwaardere elementen ("metalen").',
      'Tijdens het leven van de ster schuift de balk op: <b>waterstof → helium → koolstof en zuurstof → neon en magnesium → silicium → ijzer</b>. Elke fusiefase verbruikt de ene kleur en maakt de volgende. Bij een neutronenster blijven er vooral neutronen over.',
      'Hoe ver de ster komt, hangt van zijn massa af. Een rode dwerg komt niet verder dan helium, een zonachtige ster stopt bij koolstof en zuurstof, en alleen sterren vanaf ongeveer 8 M☉ komen tot ijzer.',
    ],
    stats: [['Begin', '~71 % H, ~27 % He, ~2 % overige'], ['Rode dwerg (eind)', 'helium'], ['Zonachtige ster (eind)', 'koolstof + zuurstof'], ['Zware ster (eind)', 'ijzer → neutronen']],
    fact: 'Astronomen noemen alles zwaarder dan helium een "metaal", ook zuurstof en koolstof. De Zon bestaat voor ongeveer 1,4 à 2 % uit metalen.',
    deeper: [
      'Astronomen schrijven de massafracties als X (waterstof), Y (helium) en Z (metalen), met <span class="formula">X + Y + Z = 1</span>. Voor de Zon bij haar geboorte: X ≈ 0,71, Y ≈ 0,27, Z ≈ 0,014–0,02.',
      'De samenstelling van de kern kan niet worden gemeten (behalve bij de Zon, via neutrino\'s en trillingen van het oppervlak). De balk is dus modelwerk.',
    ],
    related: ['lab.kern', 'lab.doorsnede', 'fusion.silicon', 'lab.ster'],
  },

  'lab.doorsnede': {
    title: 'Doorsnede van de ster',
    tooltip: 'Schematische lagen en fusieschillen (niet op schaal)',
    kicker: 'Maak je eigen ster',
    status: 'theorie',
    badges: ['schaal'],
    body: [
      'De doorsnede laat de <b>lagen</b> van de ster zien, van de kern tot het oppervlak. Elke kleur is een laag met een andere samenstelling. Een oplichtende rand is een <b>fusieschil</b>: een dunne laag waarin nog fusie plaatsvindt.',
      'Een zware ster krijgt aan het eind een <b>uienschilstructuur</b>: van binnen naar buiten ijzer, silicium, zuurstof/neon, koolstof/zuurstof, helium en waterstof. Op elke grens tussen twee lagen kan een schil branden.',
      'De tekening is <b>niet op schaal</b>. In werkelijkheid is de kern van een rode superreus piepklein vergeleken met de enorme mantel: de ijzerkern is ongeveer zo groot als de Aarde, terwijl de ster zelf groter is dan de baan van Mars.',
    ],
    stats: [['Lagen', 'H, He, C/O, O/Ne/Mg, Si, Fe'], ['Schillen', 'oplichtende randen = fusie'], ['Schaal', 'schematisch, niet op schaal']],
    fact: 'Als de hele rode superreus zo groot was als een voetbalstadion, dan was de ijzerkern vlak voor de supernova ongeveer zo groot als een zandkorreltje.',
    deeper: [
      'Het grootste deel van de massa zit wel in de kern en de schillen. Bij een ster van 15 M☉ is de heliumkern aan het eind ongeveer 4 M☉, de koolstof-zuurstofkern ongeveer 2–3 M☉ en de ijzerkern ongeveer 1,4 M☉.',
    ],
    related: ['supergiant.schillen', 'lab.samenstelling', 'ui.schaal'],
  },

  'hr.diagram': {
    title: 'HR-diagram',
    tooltip: 'Lichtkracht tegen temperatuur: de kaart van sterren',
    kicker: 'Hulpmiddel',
    status: 'waargenomen',
    body: [
      'Het <b>Hertzsprung-Russell-diagram</b> is de belangrijkste kaart van de sterrenkunde. Verticaal staat de <b>lichtkracht</b> (hoeveel licht een ster uitstraalt, vergeleken met de Zon), horizontaal de <b>oppervlaktetemperatuur</b>. Let op: hete sterren staan <b>links</b>, koele rechts.',
      'De meeste sterren liggen op een schuine band: de <b>hoofdreeks</b>. Rechtsboven liggen de koele maar heldere <b>reuzen</b> en <b>superreuzen</b> (ze zijn helder omdat ze zo groot zijn). Linksonder liggen de hete maar zwakke <b>witte dwergen</b> (zwak omdat ze zo klein zijn).',
      'Tijdens het leven van jouw ster zie je een punt over het diagram bewegen: het <b>evolutiespoor</b>. Een jonge ster komt van rechts aan, blijft lang op de hoofdreeks, trekt dan naar rechtsboven als reus en eindigt bijvoorbeeld linksonder als witte dwerg. Fasen die geen zinvolle plek in het diagram hebben (wolk, neutronenster, zwart gat), worden niet getekend.',
    ],
    stats: [['Verticaal', 'lichtkracht (L☉), logaritmisch'], ['Horizontaal', 'temperatuur (K), heet links'], ['Hoofdreeks', '~90 % van het sterrenleven'], ['Rechtsboven', 'reuzen en superreuzen'], ['Linksonder', 'witte dwergen']],
    fact: 'Ejnar Hertzsprung (1911) en Henry Norris Russell (1913) bedachten het diagram los van elkaar. Hertzsprung werkte later jarenlang in Leiden.',
    deeper: [
      'Lichtkracht, straal en temperatuur hangen samen via de wet van Stefan-Boltzmann:',
      '<div class="formula-block">L = 4π R² σ T⁴</div>',
      'Sterren met dezelfde straal liggen daardoor op schuine rechte lijnen in het diagram. Voorbeeld: een ster met de temperatuur van de Zon maar 100 keer zo groot is 100² = 10.000 keer zo helder.',
    ],
    related: ['mainSequence', 'redGiant', 'whiteDwarf', 'lab.ster'],
  },
});

// ================================================================= evolution paths
Object.assign(Content.info, {
  'path.bruineDwerg': {
    title: 'Pad: bruine dwerg',
    tooltip: 'Minder dan ~0,08 M☉: nooit een echte ster',
    kicker: 'Levenspad',
    status: 'waargenomen',
    body: [
      'Een object van minder dan ongeveer <b>0,08 M☉</b> (ongeveer 80 Jupitermassa\'s) wordt geen echte ster, maar een <b>bruine dwerg</b>. Het ontstaat net als een ster uit een instortende wolk, maar de kern wordt nooit heet genoeg voor waterstoffusie: hij blijft steken op een paar miljoen K.',
      '<b>Fusie:</b> boven ongeveer 13 Jupitermassa\'s (0,012 M☉) alleen <b>deuteriumfusie</b>, een paar miljoen tot tientallen miljoenen jaren lang. Boven ongeveer 0,065 M☉ wordt ook <b>lithium</b> verbrand. Daarna schijnt de bruine dwerg alleen nog door restwarmte.',
      'Hij koelt af van <b>type L</b> (rood, ~2.000 K) via <b>type T</b> (methaan, ~1.000 K) naar <b>type Y</b> (koeler dan 550 K). Onder de 13 Jupitermassa\'s is er zelfs geen deuteriumfusie: dan heet het een planeetachtig object.',
    ],
    stats: [['Massa', '~0,012–0,08 M☉ (13–80 M<sub>Jupiter</sub>)'], ['Fusie', 'deuterium (kort), soms lithium'], ['Kern', 'maximaal enkele miljoenen K'], ['Levensloop', 'L → T → Y, biljoenen jaren afkoelen'], ['Eindproduct', 'koude bruine dwerg']],
    fact: 'Er zijn in de Melkweg waarschijnlijk tientallen miljarden bruine dwergen. De dichtstbijzijnde, Luhman 16 A en B, staan op 6,5 lichtjaar.',
    deeper: [
      'De grens van ~0,075–0,08 M☉ voor waterstoffusie hangt af van de samenstelling: bij weinig metalen ligt hij iets hoger (~0,09 M☉).',
    ],
    related: ['ignition.deuterium', 'brownDwarf', 'fusion.lithium', 'path.rodeDwerg'],
  },

  'path.rodeDwerg': {
    title: 'Pad: rode dwerg',
    tooltip: '~0,08–0,5 M☉: biljoenen jaren zuinig branden',
    kicker: 'Levenspad',
    status: 'deels',
    body: [
      'Sterren van ongeveer <b>0,08 tot 0,5 M☉</b> worden <b>rode dwergen</b>. Ze fuseren waterstof met de <b>pp-keten</b> bij 5 tot 12 miljoen K, en zijn zo zuinig dat ze honderden miljarden tot biljoenen jaren leven.',
      'Onder ongeveer 0,35 M☉ zijn ze volledig convectief en gebruiken ze bijna al hun waterstof. Sterren lichter dan ~0,25 M☉ worden aan het eind heter en worden een <b>blauwe dwerg</b>. Iets zwaardere rode dwergen zwellen op tot een kleine <b>rode reus</b>, met een waterstofschil rond een heliumkern.',
      'Helium ontbrandt nooit: de kern wordt nooit ~100 miljoen K. Er blijft een <b>heliumwitte dwerg</b> over, die in meer dan 10¹⁵ jaar afkoelt tot een zwarte dwerg. Omdat het heelal nog maar 13,8 miljard jaar oud is, is het einde van dit pad nog nooit waargenomen.',
    ],
    stats: [['Massa', '~0,08–0,5 M☉'], ['Hoofdreeks', '~70 miljard (0,45 M☉) tot ~3 biljoen jaar (0,1 M☉)'], ['Fusie', 'pp-keten (kern, later schil)'], ['Eindproduct', 'heliumwitte dwerg (~0,1–0,3 M☉)'], ['Aandeel sterren', '~75 %']],
    fact: 'Als je alle sterren in de Melkweg zou tellen, zijn drie van de vier een rode dwerg. Ze zullen nog schijnen als alle zonachtige sterren allang uit zijn.',
    deeper: [
      'Levensduur van de hoofdreeks volgens het model: <span class="formula">t ≈ 10¹⁰ jaar · M<sup>−2,5</sup></span>; voor 0,2 M☉ is dat ~560 miljard jaar. Omdat rode dwergen volledig convectief zijn, gebruiken ze een veel groter deel van hun waterstof dan de Zon (die maar ~10 % gebruikt).',
    ],
    related: ['redDwarf', 'redDwarf.blauw', 'whiteDwarf.He', 'path.zonachtig'],
  },

  'path.zonachtig': {
    title: 'Pad: zonachtige ster',
    tooltip: '~0,5–8 M☉: rode reus, nevel, witte dwerg',
    kicker: 'Levenspad',
    status: 'waargenomen',
    body: [
      'Sterren van ongeveer <b>0,5 tot 8 M☉</b>, zoals de Zon, volgen dit pad. Op de <b>hoofdreeks</b> fuseren ze waterstof in de kern (pp-keten tot ~1,3 M☉, daarboven CNO-cyclus). Daarna brandt waterstof in een schil en zwelt de ster op tot <b>subreus</b> en <b>rode reus</b>.',
      'Bij ~100 miljoen K ontbrandt helium in de kern (3-alfaproces). Tot ongeveer 2 M☉ gebeurt dat met een <b>heliumflits</b>; zwaardere sterren ontsteken helium rustig. Daarna volgt de <b>horizontale tak</b> (of heliumfusie in de kern), en dan de <b>asymptotische reuzentak</b> met een helium- en een waterstofschil en het s-proces.',
      'De ster blaast zijn buitenlagen weg in een <b>planetaire nevel</b>. De kern blijft over als <b>witte dwerg</b> van koolstof en zuurstof (bij 7–8 M☉: zuurstof, neon en magnesium, na koolstoffusie). Die koelt in meer dan 10¹⁵ jaar af tot een zwarte dwerg.',
    ],
    stats: [['Massa', '~0,5–8 M☉'], ['Hoofdreeks', '~10 miljard jaar (1 M☉), ~68 miljoen jaar (7,5 M☉)'], ['Heetste kern', '~100–300 miljoen K (7–8 M☉: ~0,7 miljard K)'], ['Fusie', 'H → He → C/O (7–8 M☉: ook C → Ne)'], ['Eindproduct', 'witte dwerg van ~0,5–1,3 M☉']],
    fact: 'Een ster van 1 M☉ verliest in zijn leven bijna de helft van zijn massa: in het model blijft een witte dwerg van ongeveer 0,56 M☉ over.',
    deeper: [
      'De massa van de witte dwerg volgt in het model de begin-eindmassarelatie <span class="formula">M<sub>WD</sub> ≈ 0,10 · M<sub>begin</sub> + 0,46 M☉</span> (maximaal 1,33 M☉). Die relatie is gemeten met witte dwergen in sterrenhopen van bekende leeftijd.',
    ],
    related: ['mainSequence', 'redGiant', 'agb', 'planetaryNebula', 'whiteDwarf'],
  },

  'path.zwaar': {
    title: 'Pad: zware ster',
    tooltip: '~8–25 M☉: superreus, supernova, neutronenster',
    kicker: 'Levenspad',
    status: 'waargenomen',
    body: [
      'Sterren van ongeveer <b>8 tot 25 M☉</b> leven kort en heftig: een ster van 15 M☉ staat maar ongeveer 15 miljoen jaar op de hoofdreeks (CNO-cyclus). Daarna wordt hij een <b>blauwe</b> en dan een <b>rode superreus</b> (bij weinig metalen blijft hij blauw), met heliumfusie in de kern.',
      'Dan volgen de zware fusiefasen steeds sneller: <b>koolstof</b> (~2.000 jaar), <b>neon</b> (~1 jaar), <b>zuurstof</b> (~2,5 jaar) en <b>silicium</b> (dagen tot weken). Rond de kern branden steeds meer schillen: de uienschil.',
      'Uiteindelijk heeft de ster een ijzerkern van ~1,4 M☉ die geen energie meer kan leveren. Die stort in, en de ster ontploft als <b>supernova van type II</b>. Er blijft een <b>neutronenster</b> over, in het model 1,25 tot 1,7 M☉.',
    ],
    stats: [['Massa', '~8–25 M☉'], ['Hoofdreeks', '~58 (8 M☉) tot ~7 miljoen jaar (24 M☉)'], ['Heetste kern', '~3,6 miljard K (silicium), bij instorting ~10¹¹ K'], ['Fusie', 'H → He → C → Ne → O → Si → Fe'], ['Eindproduct', 'neutronenster']],
    fact: 'Van alle sterren wordt maar ongeveer 1 op de 300 zwaar genoeg voor dit pad. Toch maken ze samen het grootste deel van de zuurstof in het heelal.',
    deeper: [
      'Kernbrandfasen bij 15 M☉ (Woosley, Heger & Weaver 2002): H 11 miljoen jaar, He 2 miljoen jaar, C 2.000 jaar, Ne 0,7 jaar, O 2,6 jaar, Si 18 dagen. Het model gebruikt vergelijkbare getallen.',
    ],
    related: ['supergiant', 'supergiant.schillen', 'coreCollapse', 'neutronStar'],
  },

  'path.zeerZwaar': {
    title: 'Pad: zeer zware ster',
    tooltip: 'Meer dan ~25 M☉: Wolf-Rayet en zwart gat',
    kicker: 'Levenspad',
    status: 'deels',
    body: [
      'Sterren van meer dan ongeveer <b>25 M☉</b> zijn zo helder dat hun eigen licht de buitenlagen wegblaast. Bij een normaal metaalgehalte worden ze in dit model eerst een <b>lichtkrachtige blauwe veranderlijke</b> en dan, als de waterstofmantel weg is, een <b>Wolf-Rayetster</b> met heliumfusie in de kern.',
      'Daarna volgen koolstof-, neon-, zuurstof- en siliciumfusie, net als bij zware sterren maar nog sneller. Tussen ~25 en 40 M☉ eindigt de ster in dit model als <b>supernova van type Ib/c</b>, met een <b>zwart gat</b> van 5–10 M☉. Nog zwaardere sterren storten waarschijnlijk <b>direct</b> in tot een zwart gat, zonder grote explosie.',
      'Met weinig metalen zijn de winden zwakker: de ster blijft een blauwe superreus, behoudt veel massa en stort in tot een zwaarder zwart gat (tot ~45 M☉ in het model). Hoe het precies afloopt is nog onzeker: rotatie, dubbelsterren en de structuur van de kern spelen een grote rol.',
    ],
    stats: [['Massa', 'meer dan ~25 M☉ (tot 150 M☉ in de simulatie)'], ['Hoofdreeks', '~5 (30 M☉) tot ~3 miljoen jaar'], ['Fusie', 'H → He → C → Ne → O → Si → Fe'], ['Eindproduct', 'zwart gat (~5–45 M☉)'], ['Einde', 'supernova Ib/c of directe instorting']],
    fact: 'De zwaarste bekende ster, R136a1 in de Tarantulanevel, heeft nu ongeveer 200 M☉ (de schattingen lopen uiteen). Zijn wind blaast elk jaar ruwweg tien tot twintig Aardmassa\'s de ruimte in.',
    deeper: [
      'Met zijn wind verliest zo\'n ster tot ~10⁻⁵–10⁻⁴ M☉ per jaar. Over een leven van ~4 miljoen jaar is dat al tientallen zonsmassa\'s. De windsterkte schaalt ongeveer met het metaalgehalte als <span class="formula">Ṁ ∝ Z<sup>0,7–0,8</sup></span>.',
    ],
    related: ['wolfRayet.lbv', 'wolfRayet', 'coreCollapse.Ibc', 'coreCollapse.direct', 'blackHole'],
  },

  'path.paarInstabiliteit': {
    title: 'Pad: reuzenster uit het vroege heelal',
    tooltip: '≥ ~130 M☉, weinig metalen: niets blijft over',
    kicker: 'Levenspad',
    status: 'deels',
    body: [
      'Dit pad kan alleen bij sterren met een <b>laag metaalgehalte</b> en een beginmassa van ongeveer <b>130 tot 250 M☉</b>. Zulke sterren kwamen waarschijnlijk vooral voor in het vroege heelal, toen er nog bijna geen zware elementen waren.',
      'De ster leeft maar ongeveer 3 miljoen jaar op de hoofdreeks (CNO-cyclus) en verliest door zijn zwakke wind weinig massa. Na de heliumfusie (als blauwe superreus) en een paar jaar <b>koolstoffusie</b> heeft hij een reusachtige zuurstofkern.',
      'Die wordt ongeveer 1 miljard K heet. Dan maakt het licht <b>elektron-positronparen</b>, de druk valt weg, de kern stort in en de zuurstof ontploft. Het resultaat is een <b>paarinstabiliteitssupernova</b> die de hele ster verscheurt: er blijft <b>niets</b> over.',
    ],
    stats: [['Massa', '~130–250 M☉ (in de simulatie 130–150 M☉)'], ['Voorwaarde', 'laag metaalgehalte'], ['Hoofdreeks', '~3 miljoen jaar'], ['Fusie', 'H → He → C, daarna explosief O'], ['Eindproduct', 'niets']],
    fact: 'Bij nog zwaardere sterren (meer dan ~260 M☉) wordt de kern zo heet dat het licht ook de kernen afbreekt. Dan stort alles alsnog in tot een zwart gat: geen explosie, geen verscheurde ster.',
    deeper: [
      'Wat telt is de massa van de heliumkern: bij ~65–130 M☉ volgt een volledige paarinstabiliteitssupernova. Bij ~35–65 M☉ geeft de ster alleen een paar "pulsen" en stort daarna in (pulserende paarinstabiliteit). Hoe dat zich precies vertaalt naar beginmassa\'s hangt af van wind en rotatie.',
    ],
    related: ['pairInstability', 'fusion.pair', 'pairInstability.rest', 'evo.koolstof'],
  },
});

// ================================================================= path summaries (route comes from the model)
Object.assign(Content.paths, {
  bruineDwerg: { label: 'Bruine dwerg', info: 'path.bruineDwerg' },
  rodeDwerg: { label: 'Rode dwerg', info: 'path.rodeDwerg' },
  zonachtig: { label: 'Zonachtige ster', info: 'path.zonachtig' },
  zwaar: { label: 'Zware ster', info: 'path.zwaar' },
  zeerZwaar: { label: 'Zeer zware ster', info: 'path.zeerZwaar' },
  paarInstabiliteit: { label: 'Reuzenster uit het vroege heelal', info: 'path.paarInstabiliteit' },
});
