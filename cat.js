/* ──────────────────────────────────────────────────────────────────────
   Miso: eine Katze, die auf dieser Seite wohnt.

   Sie startet schlafend in ihrem Körbchen. Ein Klick weckt sie. Danach
   hat sie Hunger, Laune und Energie, merkt sich alles zwischen Besuchen,
   jagt Futter, bekommt Zoomies, hinterlässt Pfotenabdrücke und legt sich
   von allein wieder ins Körbchen, wenn eine Weile nichts passiert.

   Über window.miso lässt sie sich aus der Konsole steuern. miso.why()
   legt offen, was sie gerade vorhat und warum, mit denselben Schwellen,
   mit denen sie wirklich rechnet. Denselben Bericht gibt der Befehl miso
   im Terminal auf der Startseite aus.
   Läuft nur bei feiner Zeigereingabe, also nicht auf Touchgeräten.
   ────────────────────────────────────────────────────────────────────── */
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  /* Wer am System weniger Bewegung eingestellt hat, bekommt eine ruhige
     Miso: kein Rennen, kein Springen, keine Zoomies. Ganz abschalten muss
     man sie nicht, denn sichtbar wird sie ohnehin erst auf Knopfdruck. */
  const RUHIG = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CAT_NAME = 'Miso';
  const CW = 68, CH = 68;
  const scriptSrc = document.currentScript && document.currentScript.src;
  const BASE = scriptSrc ? scriptSrc.replace(/cat\.js.*$/, '') + 'cat_animation/' : 'cat_animation/';

  const SRCS = {
    walk_r: BASE + 'Walking_Right.gif',
    walk_l: BASE + 'Walking_Left.gif',
    run_r:  BASE + 'Running_Right.gif',
    run_l:  BASE + 'Running_Left.gif',
    jump_r: BASE + 'Jump_Right.gif',
    jump_l: BASE + 'Jump_Left.gif',
    front:  BASE + 'Idle_Front.png',
    sleep:  BASE + 'Sleep.png',
    back:   BASE + 'Idle_Back.png',
  };
  Object.values(SRCS).forEach(src => { new Image().src = src; });

  /* ── Sprache ── */
  const lang = () => ((document.documentElement.lang || 'de').slice(0, 2) === 'en' ? 'en' : 'de');
  const TXT = {
    de: {
      hint: 'klick mich zum Aufwecken', tip: 'Futter herziehen, Klick streichelt, Doppelklick gibt Zoomies',
      btn: 'play with ' + CAT_NAME,
      sat: 'Satt', mood: 'Laune', energy: 'Energie',
      meals: 'Mahlzeiten', pets: 'Gestreichelt', newHere: 'neu hier',
      days: d => d + (d === 1 ? ' Tag' : ' Tage'),
      purr: 'schnurr', hungry: 'hungrig ...', bored: 'langweilig hier',
      fine: 'alles gut', night: 'gute Nacht', zzz: 'zzz ...', what: 'was gibts?',
      yum: n => n + ', lecker', toy: 'Spielzeug', zoom: 'ZOOMIES',
      stretch: 'gaehn', stalk: 'hallo du', bed: 'ich leg mich hin',
      levels: ['Streuner', 'Hauskatze', 'Stubentiger', 'Chefkatze', 'Legende'],
      moods: { tired: 'muede', hungry: 'hungrig', bored: 'gelangweilt', great: 'bester Laune', ok: 'zufrieden' },
      wieder: 'ah, du wieder', lieblich: n => n + '! mein Lieblingsfutter',
      fav: 'Liebling', merkt: 'nur dieser Browser', leeren: 'zuruecksetzen',
      geleert: 'wer bist du?', streicheln: CAT_NAME + ' streicheln',
      feld: { state: 'zustand', goal: 'ziel', why: 'grund', drive: 'antrieb',
              mem: 'gedaechtnis', store: 'speicher' },
      zust: { sleep: 'SCHLAEFT', zoom: 'ZOOMIES', eat: 'FRISST', hunt: 'JAGT',
              walk: 'LAEUFT', run: 'RENNT', sit: 'SITZT', jump: 'SPRINGT',
              stalk: 'SCHLEICHT' },
      ziele: { bett: 'im Koerbchen bleiben', zurueck: 'zurueck ins Koerbchen',
               zoom: 'einmal durchdrehen', essen: 'fressen',
               holen: f => 'Futter holen: ' + f, zeiger: 'zum Mauszeiger',
               pos: x => 'Position ' + x, streife: 'Streife laufen',
               pause: 'kurz sitzen und schauen' },
      gruende: {
        leer: (e, s) => 'Energie ' + e + ' unter Schwelle ' + s,
        allein: (sek, s) => 'seit ' + sek + ' s niemand da, Schwelle ' + s + ' s',
        satt: 'ausgeruht, wartet auf dich',
        frisch: 'heute noch nicht geweckt',
        jagd: (h, s) => 'Hunger ' + h + ' ueber Jagdschwelle ' + s,
        nah: 'Futter in Reichweite',
        ueber: (m, e) => 'Laune ' + m + ', Energie ' + e + ', Ueberschuss',
        zeiger: 'Zeiger stand still und war weit weg',
        gesetzt: 'Ziel wurde gesetzt',
        nichts: 'nichts zu tun',
        pause: 'Streife unterbrochen',
      },
      einheiten: { mahl: 'Mahlzeiten', gestr: 'mal gestreichelt', nichts: 'noch nichts erlebt' },
    },
    en: {
      hint: 'click me to wake up', tip: 'drag food over, click to pet, double click for zoomies',
      btn: 'play with ' + CAT_NAME,
      sat: 'Fed', mood: 'Mood', energy: 'Energy',
      meals: 'Meals', pets: 'Pets', newHere: 'new here',
      days: d => d + (d === 1 ? ' day' : ' days'),
      purr: 'purr', hungry: 'hungry ...', bored: 'so bored',
      fine: 'all good', night: 'good night', zzz: 'zzz ...', what: 'what is it?',
      yum: n => n + ', yum', toy: 'a toy!', zoom: 'ZOOMIES',
      stretch: 'yaaawn', stalk: 'hi there', bed: 'off to bed',
      levels: ['Stray', 'House cat', 'Room tiger', 'Boss cat', 'Legend'],
      moods: { tired: 'sleepy', hungry: 'hungry', bored: 'bored', great: 'delighted', ok: 'content' },
      wieder: 'oh, you again', lieblich: n => n + '! my favourite',
      fav: 'favourite', merkt: 'this browser only', leeren: 'reset',
      geleert: 'who are you?', streicheln: 'pet ' + CAT_NAME,
      feld: { state: 'state', goal: 'goal', why: 'reason', drive: 'drives',
              mem: 'memory', store: 'storage' },
      zust: { sleep: 'SLEEPING', zoom: 'ZOOMIES', eat: 'EATING', hunt: 'HUNTING',
              walk: 'WALKING', run: 'RUNNING', sit: 'SITTING', jump: 'JUMPING',
              stalk: 'STALKING' },
      ziele: { bett: 'stay in the basket', zurueck: 'back to the basket',
               zoom: 'lose it for a moment', essen: 'eat',
               holen: f => 'go get: ' + f, zeiger: 'reach the cursor',
               pos: x => 'position ' + x, streife: 'patrol',
               pause: 'sit down and watch' },
      gruende: {
        leer: (e, s) => 'energy ' + e + ' below threshold ' + s,
        allein: (sek, s) => 'nobody here for ' + sek + ' s, threshold ' + s + ' s',
        satt: 'rested, waiting for you',
        frisch: 'not woken up yet today',
        jagd: (h, s) => 'hunger ' + h + ' above hunt threshold ' + s,
        nah: 'food within reach',
        ueber: (m, e) => 'mood ' + m + ', energy ' + e + ', surplus',
        zeiger: 'cursor sat still and far away',
        gesetzt: 'a target was set',
        nichts: 'nothing to do',
        pause: 'patrol interrupted',
      },
      einheiten: { mahl: 'meals', gestr: 'pets', nichts: 'nothing happened yet' },
    },
  };
  const t = () => TXT[lang()];

  /* ── Pixelgrafiken ───────────────────────────────────────────────────
     Zeichenraster mit Farbtabelle. Ein Punkt ist durchsichtig. Das liest
     sich beim Nachbessern deutlich besser als verschachtelte Zahlen.   */
  const NS = 'http://www.w3.org/2000/svg';
  function pixelSvg(sp) {
    const w = sp.px[0].length, h = sp.px.length, s = sp.s;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', w * s);
    svg.setAttribute('height', h * s);
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.style.display = 'block';
    sp.px.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const c = sp.pal[row[x]];
        if (!c) continue;
        const r = document.createElementNS(NS, 'rect');
        r.setAttribute('x', x * s); r.setAttribute('y', y * s);
        r.setAttribute('width', s); r.setAttribute('height', s);
        r.setAttribute('fill', c);
        svg.appendChild(r);
      }
    });
    return svg;
  }

  const IW = 32, IH = 32;
  const PIXEL_FOODS = [
    { de: 'Fisch', en: 'fish', fill: 34, s: 2,
      pal: { o: '#123047', b: '#3f8fc4', l: '#8fd4f0', w: '#ffffff' },
      px: ['................',
           '................',
           '.......oooo.....',
           '.....oobbbbo....',
           '...oobbbbbbbo...',
           'o.obbbbbbbbbbo..',
           'oo.obbllbbbbbbo.',
           'ooo.bbllbbbwoobo',
           'ooo.bbllbbbwoobo',
           'oo.obbllbbbbbbo.',
           'o.obbbbbbbbbbo..',
           '...oobbbbbbbo...',
           '.....oobbbbo....',
           '.......oooo.....',
           '................',
           '................'] },

    { de: 'Milchnapf', en: 'bowl of milk', fill: 24, s: 2,
      pal: { o: '#1b2430', m: '#f6f9fc', s: '#d3dde6', n: '#4a90c4', d: '#2f6d99' },
      px: ['................',
           '................',
           '................',
           '................',
           '...oooooooooo...',
           '..ommmmmmmmmmo..',
           '..omssmmmmssmo..',
           '..ommmmmmmmmmo..',
           '..onnnnnnnnnno..',
           '..onnnnnnnnnno..',
           '...odddddddddo..',
           '....oddddddo....',
           '.....oooooo.....',
           '................',
           '................',
           '................'] },

    { de: 'Keks', en: 'biscuit', fill: 20, s: 2,
      pal: { o: '#5a3a18', k: '#d9a35f', d: '#7a4a1c', h: '#f0c68a' },
      px: ['................',
           '................',
           '....oooooo......',
           '...okkhkkko.....',
           '..okkkkkkkko....',
           '.okdkkkkkdkko...',
           '.okkkkdkkkkko...',
           '.okkdkkkkkkko...',
           '.okkkkkkdkkko...',
           '..okkdkkkkko....',
           '...okkkkkko.....',
           '....oooooo......',
           '................',
           '................',
           '................',
           '................'] },

    { de: 'Wollknaeuel', en: 'ball of yarn', fill: 10, toy: true, s: 2,
      pal: { o: '#5d2340', w: '#e0679a', l: '#f2a3c0', d: '#b8467a' },
      px: ['................',
           '................',
           '.....oooooo.....',
           '...oowwllwwoo...',
           '..owwlwwwwlwwo..',
           '.owlwwddwwlwwwo.',
           '.owwddwwwwddwwo.',
           'owwwwwwddwwwwwwo',
           'owwddwwwwddwwwwo',
           '.owwwwddwwwwwwo.',
           '.owwddwwwwddwwo.',
           '..owwlwwwwlwwo..',
           '...oowwllwwoo...',
           '.....oooooo.....',
           '................',
           '................'] },

    { de: 'Spielmaus', en: 'toy mouse', fill: 8, toy: true, s: 2,
      pal: { o: '#3c4046', g: '#9aa0a6', l: '#c8ced4', p: '#f4a6c0', e: '#1b1f23' },
      px: ['................',
           '................',
           '...op....po.....',
           '..opgo..ogpo....',
           '..oglo..olgo....',
           '...oggggggo.....',
           '..oggggggggo....',
           '.ogglgggggggo...',
           '.oggeggggeggo.oo',
           '.ogggggggggo.og.',
           '..oggpppggo.og..',
           '...ooggggo.og...',
           '.....oooo.og....',
           '..........o.....',
           '................',
           '................'] },
  ];

  const BED = { s: 3,
    pal: { o: '#241810', r: '#6f4a30', h: '#96663f', g: '#b3814f',
           k: '#39434f', d: '#2a323c', l: '#4d5a6b', w: '#5f6e80' },
    px: ['..........oooooooooo..........',
         '.......ooogghhhhggooo.........',
         '.....oorhggggggggggghroo......',
         '....orhgggggggggggggggghro....',
         '...orhgoooooooooooooooogghro..',
         '..orhgokkkkkkkkkkkkkkkkogghro.',
         '..orggokllllllllllllllkoggrro.',
         '..orggokllwwwwwwwwwwllkoggrro.',
         '..orggokllllllllllllllkoggrro.',
         '..orhgokkkkkkkkkkkkkkkoghhro..',
         '...orhgoddddddddddddogghro....',
         '....orhggoooooooooogghro......',
         '.....oorhgggggggggghroo.......',
         '.......ooorhhhhhhhroo.........',
         '..........oooooooo............'] };
  const BED_W = 30 * BED.s, BED_H = 15 * BED.s;
  const BED_LEFT = 40;
  const bedSpot = () => BED_LEFT + BED_W / 2 - CW / 2;

  /* ── Dauerhafter Zustand ─────────────────────────────────────────────
     Jeder Zugriff auf localStorage ist abgesichert. Im privaten Fenster
     oder bei blockierten Seitendaten startet Miso einfach neu.         */
  const KEY = 'miso.state.v2';
  const HOUR = 3600000;
  const IDLE_MS = 28000;      // so lange ohne Zuwendung, dann geht sie ins Koerbchen
  const JAGD_AB = 55;         // ab diesem Hunger sucht sie selbst nach Futter
  const MUEDE_TAG = 20;       // darunter legt sie sich tagsueber hin
  const MUEDE_NACHT = 34;     // nachts ist sie schneller muede
  const LIEBLING_AB = 3;      // so oft muss sie etwas gefressen haben

  /* Diese vier Zahlen steuern ihr Verhalten und stehen genau so im
     Bericht von miso.why(). Wer nachliest, findet dort keine erfundenen
     Werte, sondern die, mit denen sie wirklich rechnet. */

  const pet = {
    hunger: 25, mood: 80, energy: 90,
    meals: 0, pets: 0, zoomies: 0,
    likes: PIXEL_FOODS.map(() => 0),   // was sie wie oft gefressen hat
    born: Date.now(), seen: Date.now(),
  };
  let warSchonDa = false, wegStunden = 0;

  function loadPet() {
    let raw = null;
    try { raw = localStorage.getItem(KEY) || localStorage.getItem('miso.state.v1'); } catch (e) { return; }
    if (!raw) return;
    let s;
    try { s = JSON.parse(raw); } catch (e) { return; }
    if (!s || typeof s !== 'object') return;
    Object.keys(pet).forEach(k => {
      const v = s[k];
      if (Array.isArray(pet[k])) {
        if (Array.isArray(v)) pet[k] = pet[k].map((d, i) => (typeof v[i] === 'number' && isFinite(v[i]) ? v[i] : d));
      } else if (typeof v === 'number' && isFinite(v)) pet[k] = v;
    });
    warSchonDa = true;
    wegStunden = (Date.now() - pet.seen) / HOUR;
    const weg = Math.min(wegStunden, 12);
    pet.hunger += weg * 7;
    pet.mood   -= weg * 4;
    pet.energy += weg * 9;
    clampPet();
  }
  function clampPet() {
    pet.hunger = Math.max(0, Math.min(100, pet.hunger));
    pet.mood   = Math.max(0, Math.min(100, pet.mood));
    pet.energy = Math.max(0, Math.min(100, pet.energy));
  }
  function savePet() {
    pet.seen = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(pet)); } catch (e) { /* egal */ }
  }

  const ageDays   = () => Math.max(0, Math.floor((Date.now() - pet.born) / 86400000));
  const xp        = () => pet.meals * 3 + pet.pets + pet.zoomies * 2;
  const levelNr   = () => Math.min(4, Math.floor(Math.sqrt(xp() / 6)));
  const levelName = () => t().levels[levelNr()];
  const istNacht  = () => { const h = new Date().getHours(); return h >= 22 || h < 6; };

  /* Kleine Lernspur: Was sie oft bekommt, mag sie lieber. Ab drei
     Mahlzeiten desselben Futters hat sie einen Liebling, freut sich
     darueber mehr und findet ihn oefter vor. Ueber den Panel-Link
     zuruecksetzen laesst sich das jederzeit loeschen. */
  function lieblingIdx() {
    let best = -1, max = 0;
    pet.likes.forEach((z, i) => { if (z > max) { max = z; best = i; } });
    return max >= LIEBLING_AB ? best : -1;
  }
  const futterName = d => (d ? (d[lang()] || d.de) : '?');

  /* ── Laufzeit ── */
  const floorY = () => window.innerHeight - CH;

  let posX = bedSpot(), dir = 1;
  let state = 'sleep', timer = 0;
  let targetX = null, lastTs = 0;
  let paused = true;
  let wrapEl, imgEl, fxWrap, bubbleEl, panelEl, bedEl;
  const bars = {};
  let items = [], drag = null, seekItem = null;
  let lastSpeak = 0, zoomLeft = 0, pawDist = 0, lastPawX = 0, zzzTimer = 0;
  const mouse = { x: 0, y: 0, still: 0, seen: false };
  let stalkCool = 0, imBett = true, willBett = false, letzteZuwendung = Date.now();
  let jeGeweckt = false;
  let sitzRueck = false;

  function beruehrt() { letzteZuwendung = Date.now(); }

  function srcFor(s, d) {
    if (s === 'run' || s === 'zoom') return d === 1 ? SRCS.run_r : SRCS.run_l;
    if (s === 'jump') return d === 1 ? SRCS.jump_r : SRCS.jump_l;
    if (s === 'sleep') return SRCS.sleep;
    if (s === 'sit') return sitzRueck ? SRCS.back : SRCS.front;
    if (s === 'eat' || s === 'stalk') return SRCS.front;
    return d === 1 ? SRCS.walk_r : SRCS.walk_l;
  }
  /* Faellt ein Sprite aus, etwa weil der Browser einen alten 404
     zwischengespeichert hat, wird auf das Laufbild ausgewichen. Ein
     zerbrochenes Bildsymbol darf nie zu sehen sein. */
  const kaputt = new Set();

  function draw() {
    let want = srcFor(state, dir);
    if (kaputt.has(want)) want = dir === 1 ? SRCS.walk_r : SRCS.walk_l;
    if (kaputt.has(want)) { imgEl.style.visibility = 'hidden'; return; }
    imgEl.style.visibility = '';
    if (imgEl.getAttribute('src') !== want) imgEl.setAttribute('src', want);
    imgEl.style.transformOrigin = 'bottom center';
    imgEl.style.animation =
      state === 'sleep' ? 'cat-breathe 2.6s ease-in-out infinite' :
      state === 'zoom'  ? 'cat-tilt .35s ease-in-out infinite' : '';
  }
  function face(d) { if (d !== dir) { dir = d; draw(); } }
  function go(s, dur) {
    if (s === 'sit') sitzRueck = Math.random() < 0.35;   // manchmal schaut sie weg
    state = s; timer = dur || 0; draw();
  }

  /* Sprechblase klebt an der Katze, bleibt aber im Bild und kollidiert
     nicht mehr mit einem zweiten Hinweisfeld. Das gibt es nicht mehr. */
  function say(text, ms) {
    if (!bubbleEl || paused || !text) return;
    const now = Date.now();
    if (now - lastSpeak < 900) return;
    lastSpeak = now;
    bubbleEl.textContent = text;
    bubbleEl.style.opacity = '1';
    platziereBlase();
    clearTimeout(say._t);
    say._t = setTimeout(() => { bubbleEl.style.opacity = '0'; }, ms || 2200);
  }
  function platziereBlase() {
    if (!bubbleEl) return;
    const b = bubbleEl.offsetWidth || 120;
    const mitte = posX + CW / 2;
    const links = Math.max(8, Math.min(window.innerWidth - b - 8, mitte - b / 2));
    bubbleEl.style.left = (links - posX) + 'px';
  }

  function stimmung() {
    const m = t().moods;
    if (pet.energy < 22) return m.tired;
    if (pet.hunger > 70) return m.hungry;
    if (pet.mood   < 30) return m.bored;
    if (pet.mood   > 75 && pet.hunger < 35) return m.great;
    return m.ok;
  }

  /* ── Lagebericht ──────────────────────────────────────────────────────
     Warum macht sie das gerade? Der Bericht wird bei jedem Aufruf frisch
     aus den echten Variablen abgeleitet, nicht mitgeschrieben. Er kann
     also nicht auseinanderlaufen mit dem, was sie wirklich tut.        */
  const r0 = z => Math.round(z);

  function lage() {
    const L = t(), nacht = istNacht();
    const ruheSek = Math.round((Date.now() - letzteZuwendung) / 1000);
    const schwelle = nacht ? MUEDE_NACHT : MUEDE_TAG;
    let zustand, ziel, grund;

    if (imBett || state === 'sleep') {
      zustand = L.zust.sleep;
      ziel = L.ziele.bett;
      grund = !jeGeweckt ? L.gruende.frisch
            : pet.energy < schwelle ? L.gruende.leer(r0(pet.energy), schwelle)
            : ruheSek * 1000 > IDLE_MS ? L.gruende.allein(ruheSek, IDLE_MS / 1000)
            : L.gruende.satt;
    } else if (state === 'zoom') {
      zustand = L.zust.zoom; ziel = L.ziele.zoom;
      grund = L.gruende.ueber(r0(pet.mood), r0(pet.energy));
    } else if (state === 'eat') {
      zustand = L.zust.eat; ziel = L.ziele.essen; grund = L.gruende.nah;
    } else if (seekItem) {
      zustand = L.zust.hunt; ziel = L.ziele.holen(futterName(seekItem.data));
      grund = L.gruende.jagd(r0(pet.hunger), JAGD_AB);
    } else if (willBett) {
      zustand = L.zust.walk; ziel = L.ziele.zurueck;
      grund = pet.energy < schwelle ? L.gruende.leer(r0(pet.energy), schwelle)
                                    : L.gruende.allein(ruheSek, IDLE_MS / 1000);
    } else if (state === 'stalk') {
      zustand = L.zust.stalk; ziel = L.ziele.zeiger; grund = L.gruende.zeiger;
    } else if (targetX !== null) {
      zustand = state === 'run' ? L.zust.run : L.zust.walk;
      ziel = L.ziele.pos(r0(targetX)); grund = L.gruende.gesetzt;
    } else {
      zustand = state === 'sit' ? L.zust.sit : state === 'jump' ? L.zust.jump : L.zust.walk;
      ziel  = state === 'sit' ? L.ziele.pause   : L.ziele.streife;
      grund = state === 'sit' ? L.gruende.pause : L.gruende.nichts;
    }
    return { zustand: zustand, ziel: ziel, grund: grund };
  }

  function berichtPaare() {
    const L = t(), la = lage(), lieb = lieblingIdx();
    const merk = [];
    if (pet.meals)   merk.push(pet.meals + ' ' + L.einheiten.mahl);
    if (pet.pets)    merk.push(pet.pets + ' ' + L.einheiten.gestr);
    if (pet.zoomies) merk.push(pet.zoomies + '× Zoomies');
    if (lieb >= 0)   merk.push(L.fav + ': ' + futterName(PIXEL_FOODS[lieb]));
    if (!merk.length) merk.push(L.einheiten.nichts);
    return [
      [L.feld.state, la.zustand],
      [L.feld.goal,  la.ziel],
      [L.feld.why,   la.grund],
      [L.feld.drive, L.sat.toLowerCase() + ' ' + r0(100 - pet.hunger) +
                     ' \u00b7 ' + L.mood.toLowerCase() + ' ' + r0(pet.mood) +
                     ' \u00b7 ' + L.energy.toLowerCase() + ' ' + r0(pet.energy)],
      [L.feld.mem,   merk.join(' \u00b7 ')],
      [L.feld.store, L.merkt + ' \u00b7 miso.reset()'],
    ];
  }
  const nbsp = z => new Array(Math.max(1, z + 1)).join('\u00a0');
  /* Zwei Ausgaben derselben Daten: eine fuers Terminal auf der Seite mit
     seiner Farbmarkierung, eine fuer die Browserkonsole. */
  const berichtTerminal = () => berichtPaare().map(([k, v]) =>
    '@@h@@' + k + ':@@' + nbsp(Math.max(1, 13 - k.length)) + v);
  const berichtText = () => berichtPaare().map(([k, v]) => (k + ':').padEnd(13) + v);

  /* ── Effekte ── */
  function fx(chars, color, dauer) {
    chars.forEach((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.cssText =
        'position:absolute;left:' + (4 + i * 18) + 'px;bottom:0;font-size:14px;' +
        (color ? 'color:' + color + ';' : '') +
        'animation:cat-heart ' + (dauer || 1.1) + 's ease-out forwards;pointer-events:none;';
      fxWrap.appendChild(s);
      setTimeout(() => s.remove(), (dauer || 1.1) * 1000 + 60);
    });
  }

  function pfote() {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', 10);
    svg.setAttribute('height', 10);
    svg.setAttribute('shape-rendering', 'crispEdges');
    [[3,4,4,4],[1,1,2,2],[4,0,2,2],[7,1,2,2]].forEach(([x, y, w, h]) => {
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', x); r.setAttribute('y', y);
      r.setAttribute('width', w); r.setAttribute('height', h);
      r.setAttribute('fill', '#30363d');
      svg.appendChild(r);
    });
    const el = document.createElement('div');
    el.style.cssText =
      'position:fixed;left:' + (posX + 28 + (Math.random() * 8 - 4)) + 'px;' +
      'bottom:' + (2 + Math.random() * 4) + 'px;z-index:9995;pointer-events:none;' +
      'opacity:.55;animation:cat-paw 2.6s ease-out forwards;';
    el.appendChild(svg);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2700);
  }

  /* ── Anzeige ── */
  function toggle(show) {
    paused = !show;
    wrapEl.style.display = show ? '' : 'none';
    if (bedEl) bedEl.style.display = show ? '' : 'none';
    items.forEach(i => { i.el.style.display = show ? '' : 'none'; });
    if (panelEl) panelEl.style.display = show ? '' : 'none';
    if (show) {
      updatePanel();
      beruehrt();
      /* Wer schon einmal hier war und eine Weile weg war, wird begruesst.
         Beim ersten Besuch bleibt sie neutral. */
      if (warSchonDa && wegStunden > 0.5 && !toggle._gegruesst) {
        toggle._gegruesst = true;
        say(t().wieder, 2600);
        setTimeout(() => say(t().hint, 3000), 3000);
      } else {
        say(imBett ? t().hint : CAT_NAME + ': ' + stimmung(), 3200);
      }
    }
  }

  function makeBar(farbe) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:7px;margin-bottom:5px;';
    const label = document.createElement('span');
    label.style.cssText = 'width:58px;color:#8b949e;font-size:10px;letter-spacing:.04em;';
    const track = document.createElement('div');
    track.style.cssText = 'flex:1;height:6px;background:#21262d;border-radius:3px;overflow:hidden;';
    const fill = document.createElement('div');
    fill.style.cssText = 'height:100%;width:50%;background:' + farbe + ';border-radius:3px;transition:width .4s ease;';
    track.appendChild(fill);
    row.appendChild(label);
    row.appendChild(track);
    return { row, fill, label };
  }

  function buildPanel() {
    panelEl = document.createElement('div');
    panelEl.id = 'cat-panel';
    panelEl.style.cssText =
      'position:fixed;bottom:' + (CH + 62) + 'px;right:24px;z-index:9997;display:none;' +
      "font-family:'Cascadia Code','Fira Code',monospace;font-size:11px;" +
      'background:#0d1117;border:1px solid #21262d;border-radius:7px;' +
      'padding:10px 12px;width:206px;color:#e6edf3;box-shadow:0 6px 20px rgba(0,0,0,.45);';

    const kopf = document.createElement('div');
    kopf.style.cssText = 'display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;';
    const nm = document.createElement('span');
    nm.textContent = CAT_NAME;
    nm.style.cssText = 'font-weight:600;';
    const alt = document.createElement('span');
    alt.id = 'cat-age';
    alt.style.cssText = 'color:#6e7681;font-size:10px;';
    kopf.appendChild(nm); kopf.appendChild(alt);
    panelEl.appendChild(kopf);

    const lvl = document.createElement('div');
    lvl.id = 'cat-level';
    lvl.style.cssText = 'color:#3fb950;font-size:10px;margin-bottom:9px;';
    panelEl.appendChild(lvl);

    [['sat', '#3fb950'], ['mood', '#d29922'], ['energy', '#58a6ff']].forEach(([k, f]) => {
      bars[k] = makeBar(f);
      panelEl.appendChild(bars[k].row);
    });

    const fuss = document.createElement('div');
    fuss.id = 'cat-stats';
    fuss.style.cssText = 'margin-top:8px;padding-top:7px;border-top:1px solid #21262d;color:#8b949e;font-size:10px;';
    panelEl.appendChild(fuss);

    /* Offen sagen, dass etwas gespeichert wird, und einen Weg anbieten,
       es zu loeschen. Persistenz ohne Hinweis wirkt unangenehm. */
    const hinweis = document.createElement('div');
    hinweis.id = 'cat-storage';
    hinweis.style.cssText = 'margin-top:7px;color:#484f58;font-size:9px;display:flex;justify-content:space-between;gap:8px;';
    const htxt = document.createElement('span');
    htxt.id = 'cat-storage-txt';
    const hlink = document.createElement('span');
    hlink.id = 'cat-reset';
    hlink.setAttribute('role', 'button');
    hlink.setAttribute('tabindex', '0');
    hlink.addEventListener('click', zuruecksetzen);
    hlink.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zuruecksetzen(); }
    });
    hinweis.appendChild(htxt); hinweis.appendChild(hlink);
    panelEl.appendChild(hinweis);
    document.body.appendChild(panelEl);
  }

  function zeile(l, v) {
    const r = document.createElement('div');
    r.style.cssText = 'display:flex;justify-content:space-between;';
    const a = document.createElement('span'); a.textContent = l; a.style.color = '#6e7681';
    const b = document.createElement('span'); b.textContent = v;
    r.appendChild(a); r.appendChild(b);
    return r;
  }

  function updatePanel() {
    if (!panelEl || paused) return;
    const L = t();
    bars.sat.fill.style.width    = (100 - pet.hunger).toFixed(0) + '%';
    bars.mood.fill.style.width   = pet.mood.toFixed(0) + '%';
    bars.energy.fill.style.width = pet.energy.toFixed(0) + '%';
    bars.sat.label.textContent    = L.sat;
    bars.mood.label.textContent   = L.mood;
    bars.energy.label.textContent = L.energy;

    const a = document.getElementById('cat-age');
    if (a) a.textContent = ageDays() === 0 ? L.newHere : L.days(ageDays());
    const lv = document.getElementById('cat-level');
    if (lv) lv.textContent = 'Lv ' + (levelNr() + 1) + ' · ' + levelName();
    const s = document.getElementById('cat-stats');
    if (s) {
      s.innerHTML = '';
      s.appendChild(zeile(L.meals, pet.meals));
      s.appendChild(zeile(L.pets, pet.pets));
      if (pet.zoomies) s.appendChild(zeile('Zoomies', pet.zoomies));
      const lieb = lieblingIdx();
      if (lieb >= 0) s.appendChild(zeile(L.fav, futterName(PIXEL_FOODS[lieb])));
    }
    const ht = document.getElementById('cat-storage-txt');
    if (ht) ht.textContent = L.merkt;
    const hl = document.getElementById('cat-reset');
    if (hl) { hl.textContent = L.leeren; hl.setAttribute('aria-label', L.leeren); }
    if (wrapEl && wrapEl._treffer) wrapEl._treffer.setAttribute('aria-label', L.streicheln);
  }

  /* Setzt ihr Gedaechtnis zurueck, ohne die Seite neu zu laden. */
  function zuruecksetzen() {
    try { localStorage.removeItem(KEY); localStorage.removeItem('miso.state.v1'); } catch (e) { /* egal */ }
    pet.hunger = 25; pet.mood = 80; pet.energy = 90;
    pet.meals = 0; pet.pets = 0; pet.zoomies = 0;
    pet.likes = PIXEL_FOODS.map(() => 0);
    pet.born = Date.now();
    warSchonDa = false; wegStunden = 0;
    savePet(); updatePanel();
    say(t().geleert, 2400);
    return t().geleert;
  }

  /* ── CSS ─────────────────────────────────────────────────────────────
     cat.js bringt seine Keyframes selbst mit. Vorher standen sie nur in
     style.css, und hire.html bindet die nicht ein.                     */
  function injectCss() {
    if (document.getElementById('cat-css')) return;
    const st = document.createElement('style');
    st.id = 'cat-css';
    st.textContent =
      '@keyframes cat-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}' +
      '@keyframes cat-heart{0%{opacity:1;transform:translateY(0) scale(1)}' +
      '100%{opacity:0;transform:translateY(-45px) scale(1.4)}}' +
      '@keyframes cat-breathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.965)}}' +
      '@keyframes cat-tilt{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}' +
      '@keyframes cat-paw{0%{opacity:.55}100%{opacity:0}}' +
      '#site-cat [role=button]:focus-visible{outline:2px solid #2f81f7;outline-offset:3px}' +
      '#cat-reset{color:#6e7681;cursor:pointer;text-decoration:underline dotted}' +
      '#cat-reset:hover,#cat-reset:focus-visible{color:#e6edf3}';
    document.head.appendChild(st);
  }

  /* ── Aufbau ── */
  function init() {
    injectCss();
    loadPet();
    posX = bedSpot();

    bedEl = document.createElement('div');
    bedEl.id = 'cat-bed';
    bedEl.style.cssText =
      'position:fixed;left:' + BED_LEFT + 'px;bottom:0;z-index:9994;' +
      'pointer-events:none;display:none;opacity:.95;';
    bedEl.appendChild(pixelSvg(BED));
    document.body.appendChild(bedEl);

    wrapEl = document.createElement('div');
    wrapEl.id = 'site-cat';
    wrapEl.style.cssText =
      'position:fixed;bottom:0;left:' + posX + 'px;z-index:9999;' +
      'user-select:none;width:' + CW + 'px;height:' + CH + 'px;display:none;' +
      'pointer-events:none;';

    imgEl = document.createElement('img');
    imgEl.src = SRCS.front;
    imgEl.width = CW; imgEl.height = CH;
    imgEl.alt = '';
    imgEl.style.cssText = 'display:block;image-rendering:pixelated;';
    imgEl.addEventListener('error', () => {
      const s = imgEl.getAttribute('src');
      if (!s || kaputt.has(s)) return;
      kaputt.add(s);
      try { console.warn('[' + CAT_NAME + '] Bild nicht ladbar:', s); } catch (e) {}
      draw();
    });
    wrapEl.appendChild(imgEl);

    /* Nur der Koerper faengt Klicks ab, nicht das ganze Quadrat. Sonst
       verschluckt die Katze am unteren Bildrand Klicks auf Knoepfe. */
    const treffer = document.createElement('div');
    treffer.style.cssText =
      'position:absolute;left:11px;bottom:16px;width:46px;height:32px;' +
      'cursor:pointer;pointer-events:auto;border-radius:6px;';
    /* Mit der Tastatur erreichbar: Tab hin, Enter oder Leertaste
       streichelt. Ohne das waere sie nur mit der Maus bedienbar. */
    treffer.setAttribute('tabindex', '0');
    treffer.setAttribute('role', 'button');
    treffer.setAttribute('aria-label', t().streicheln);
    treffer.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); klick(); }
    });
    treffer.addEventListener('focus', () => { beruehrt(); say(imBett ? t().hint : t().tip, 2600); });
    wrapEl.appendChild(treffer);
    wrapEl._treffer = treffer;

    fxWrap = document.createElement('div');
    fxWrap.style.cssText = 'position:absolute;bottom:' + CH + 'px;left:0;width:' + CW + 'px;pointer-events:none;';
    wrapEl.appendChild(fxWrap);

    bubbleEl = document.createElement('div');
    bubbleEl.style.cssText =
      'position:absolute;bottom:' + (CH + 18) + 'px;left:0;' +
      "font-family:'Cascadia Code','Fira Code',monospace;font-size:10px;white-space:nowrap;" +
      'background:#161b22;color:#e6edf3;border:1px solid #30363d;border-radius:4px;' +
      'padding:3px 8px;opacity:0;transition:opacity .25s;pointer-events:none;z-index:10001;';
    wrapEl.appendChild(bubbleEl);
    document.body.appendChild(wrapEl);

    const treff = wrapEl._treffer;
    treff.addEventListener('mouseenter', () => { beruehrt(); say(imBett ? t().hint : t().tip, 2600); });
    treff.addEventListener('click', klick);
    treff.addEventListener('dblclick', e => { e.preventDefault(); zoomies(); });

    document.addEventListener('mousemove', e => {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.still = 0; mouse.seen = true;
      onMove(e);
    });
    document.addEventListener('mouseup', onUp);

    new MutationObserver(updatePanel)
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    buildPanel();
    buildButton();
    exposeApi();

    draw();
    spawnFood();
    setTimeout(spawnFood, 1800);
    setInterval(stoffwechsel, 1000);
    setInterval(savePet, 10000);
    window.addEventListener('beforeunload', savePet);
    document.addEventListener('visibilitychange', () => { if (document.hidden) savePet(); });

    requestAnimationFrame(tick);
  }

  function buildButton() {
    let active = false;
    const btnWrap = document.createElement('div');
    btnWrap.className = 'cat-toggle-wrap';
    btnWrap.style.cssText =
      'position:fixed;bottom:' + (CH + 20) + 'px;right:24px;z-index:9997;' +
      'display:flex;flex-direction:column;align-items:flex-end;gap:5px;';
    const btn = document.createElement('button');
    btn.style.cssText =
      "font-family:'Cascadia Code','Fira Code',monospace;font-size:12px;" +
      'background:transparent;color:#484f58;border:1px solid #21262d;border-radius:6px;' +
      'padding:7px 14px;cursor:pointer;transition:border-color .2s,color .2s,opacity .2s;' +
      'white-space:nowrap;opacity:.45;';
    btn.textContent = '🐱 ' + t().btn;
    btn.addEventListener('mouseenter', () => { btn.style.borderColor = active ? '#2f81f7' : '#484f58'; });
    btn.addEventListener('mouseleave', () => { btn.style.borderColor = active ? '#30363d' : '#21262d'; });
    btn.addEventListener('click', () => {
      active = !active;
      toggle(active);
      btn.style.opacity     = active ? '1' : '.45';
      btn.style.color       = active ? '#e6edf3' : '#484f58';
      btn.style.borderColor = active ? '#30363d' : '#21262d';
    });
    btnWrap.appendChild(btn);
    document.body.appendChild(btnWrap);
    buildButton.setActive = v => { if (v !== active) btn.click(); };
  }

  /* ── Konsole ── */
  function exposeApi() {
    const HELP = [
      'miso.stats      aktuelle Werte',
      'miso.show()     Katze einblenden',
      'miso.wake()     aufwecken',
      'miso.pet()      streicheln',
      'miso.feed()     Futter werfen',
      'miso.come()     zum Mauszeiger rufen',
      'miso.zoomies()  einmal durchdrehen',
      'miso.bed()      ins Koerbchen schicken',
      'miso.why()      was sie gerade vorhat und warum',
      'miso.reset()    Gedaechtnis loeschen',
    ].join('\n');

    const api = {
      get stats() {
        return {
          name: CAT_NAME, level: levelNr() + 1, title: levelName(),
          hunger: +pet.hunger.toFixed(1), mood: +pet.mood.toFixed(1),
          energy: +pet.energy.toFixed(1), meals: pet.meals, pets: pet.pets,
          zoomies: pet.zoomies, ageDays: ageDays(), state: state, inBed: imBett,
        };
      },
      show()  { buildButton.setActive(true); return CAT_NAME + ' ist da'; },
      hide()  { buildButton.setActive(false); return 'bis dann'; },
      wake()  { buildButton.setActive(true); wecken(); return 'guten Morgen'; },
      pet()   { buildButton.setActive(true); klick(); return t().purr; },
      feed()  {
        buildButton.setActive(true); wecken(); spawnFood();
        const i = items[items.length - 1];
        if (i) { targetX = i.x - CW / 2; go('run'); }
        return 'serviert';
      },
      come()  {
        buildButton.setActive(true); wecken();
        targetX = Math.max(4, Math.min(window.innerWidth - CW, mouse.x - CW / 2));
        go('run');
        return 'komme';
      },
      zoomies() { buildButton.setActive(true); wecken(); zoomies(); return 'ZOOMIES'; },
      bed()   { buildButton.setActive(true); insBett(); return 'gute Nacht'; },
      why()   {
        try { berichtText().forEach(z => console.log('%c' + z, 'font-family:monospace')); } catch (e) {}
        const la = lage();
        return { state: la.zustand, goal: la.ziel, reason: la.grund,
                 hunger: +pet.hunger.toFixed(1), mood: +pet.mood.toFixed(1),
                 energy: +pet.energy.toFixed(1),
                 thresholds: { hunt: JAGD_AB, tiredDay: MUEDE_TAG, tiredNight: MUEDE_NACHT,
                               idleMs: IDLE_MS },
                 favourite: lieblingIdx() >= 0 ? futterName(PIXEL_FOODS[lieblingIdx()]) : null };
      },
      trace() { return berichtTerminal(); },
      reset() { return zuruecksetzen(); },
      help()  { console.log(HELP); return 'siehe oben'; },
    };

    try { Object.defineProperty(window, 'miso', { value: api, writable: false, configurable: true }); }
    catch (e) { window.miso = api; }

    setTimeout(() => {
      try {
        console.log('%c ' + CAT_NAME + ' %c schlaeft unten links. %cmiso.why()%c sagt, was sie vorhat.',
          'background:#d4704a;color:#0d1117;border-radius:3px 0 0 3px;padding:2px 6px;font-weight:700',
          'background:#161b22;color:#e6edf3;border-radius:0 3px 3px 0;padding:2px 8px',
          'color:#3fb950;font-family:monospace', 'color:#8b949e');
      } catch (e) { /* egal */ }
    }, 1200);
  }

  /* ── Koerbchen ── */
  function wecken() {
    if (!imBett && state !== 'sleep') return false;
    imBett = false; willBett = false; jeGeweckt = true;
    beruehrt();
    go('jump', 800);
    pet.energy = Math.max(pet.energy, 45);
    say(t().stretch, 2000);
    fx(['✨']);
    updatePanel();
    return true;
  }

  function insBett() {
    if (imBett) return;
    willBett = true;
    seekItem = null;
    targetX = bedSpot();
    go('walk');
    say(t().bed, 2200);
  }

  function klick() {
    if (state === 'eat') return;
    if (imBett || state === 'sleep') { wecken(); return; }
    beruehrt();
    pet.mood = Math.min(100, pet.mood + 9);
    pet.pets += 1;
    clampPet(); updatePanel(); savePet();
    if (pet.mood > 80 && pet.energy > 40) {
      go('jump', 900);
      fx(['❤️', '✨']);
      say(t().purr);
    } else {
      go('sit', 1800);
      fx(['💙']);
      say(pet.hunger > 65 ? t().hungry : t().purr);
    }
  }

  function zoomies() {
    if (RUHIG) { klick(); return; }
    if (state === 'eat' || pet.energy < 25) { say(t().zzz); return; }
    if (imBett) wecken();
    beruehrt();
    zoomLeft = 3 + Math.floor(Math.random() * 3);
    targetX = null; seekItem = null; willBett = false;
    go('zoom');
    pet.zoomies += 1;
    pet.mood = Math.min(100, pet.mood + 10);
    clampPet(); updatePanel(); savePet();
    say(t().zoom, 1600);
    fx(['✨', '💨'], null, 1.3);
  }

  /* ── Stoffwechsel, einmal je Sekunde ──────────────────────────────────
     Deutlich schneller als vorher. Wer eine Minute zuschaut, soll die
     Balken wandern sehen, sonst wirkt es tot.                          */
  function stoffwechsel() {
    if (paused) return;
    const nacht = istNacht();

    if (imBett) {
      pet.energy += 1.1;
      pet.hunger += 0.12;
      pet.mood   += 0.05;
    } else {
      pet.hunger += 0.28;
      pet.mood   -= 0.16;
      if (state === 'zoom') pet.energy -= 0.9;
      else if (state === 'run' || state === 'jump') pet.energy -= 0.35;
      else pet.energy -= nacht ? 0.22 : 0.15;
    }

    if (pet.hunger > 75) pet.mood -= 0.18;
    if (pet.energy < 20) pet.mood -= 0.12;
    clampPet(); updatePanel();

    // Erschoepft oder lange nichts passiert, dann ab ins Koerbchen
    const muede = pet.energy < (nacht ? MUEDE_NACHT : MUEDE_TAG);
    const gelangweilt = Date.now() - letzteZuwendung > IDLE_MS;
    if (!imBett && !willBett && state !== 'eat' && state !== 'zoom' && (muede || gelangweilt)) {
      insBett();
    }
    if (imBett && pet.energy > 96 && !nacht && Date.now() - letzteZuwendung < IDLE_MS) {
      wecken();
    }

    if (!imBett && Math.random() < 0.04) {
      if (pet.hunger > 72) say(t().hungry);
      else if (pet.mood < 28) say(t().bored);
      else if (pet.mood > 85 && Math.random() < 0.4) say(t().fine);
    }
    if (!RUHIG && state === 'walk' && !willBett && pet.mood > 70 && pet.energy > 45 && Math.random() < 0.01) go('jump', 900);
    if (!RUHIG && state === 'walk' && !willBett && pet.mood > 88 && pet.energy > 70 && !nacht && Math.random() < 0.005) zoomies();
    if (pet.mood > 92 && !imBett && Math.random() < 0.05) fx(['✨'], '#d29922', 1.4);
  }

  /* ── Futter ── */
  /* Futter darf nicht auf einem Knopf oder Link landen. Es nimmt Klicks
     an, weil man es ziehen koennen soll, und wuerde die Seite sonst an
     dieser Stelle unbedienbar machen. Deshalb vorher nachsehen, was da
     liegt, und notfalls eine andere Stelle nehmen. */
  const KLICKBAR = 'a,button,input,textarea,select,summary,label,[role=button],[onclick]';

  function freierPlatz(y) {
    const margin = 140;
    const spanne = Math.max(120, window.innerWidth - margin * 2);
    let x = margin + Math.random() * spanne;
    for (let i = 0; i < 10; i++) {
      const unten = document.elementFromPoint(x, y);
      const stoerung = unten && (unten.closest('#cat-panel') ||
        (unten.closest(KLICKBAR) && !unten.closest('#site-cat')));
      if (!stoerung) return x;
      x = margin + Math.random() * spanne;
    }
    return null;
  }

  function spawnFood() {
    if (items.length >= 4) return;
    const lieb = lieblingIdx();
    const data = (lieb >= 0 && Math.random() < 0.4)
      ? PIXEL_FOODS[lieb]
      : PIXEL_FOODS[Math.floor(Math.random() * PIXEL_FOODS.length)];
    const fy = window.innerHeight - IH - 10;
    const fx0 = freierPlatz(fy + IH / 2);
    if (fx0 === null) { setTimeout(spawnFood, 4000); return; }
    const el = document.createElement('div');
    el.title = data[lang()] || data.de;
    el.style.cssText =
      'position:fixed;left:' + (fx0 - IW / 2) + 'px;top:' + fy + 'px;' +
      'width:' + IW + 'px;height:' + IH + 'px;cursor:grab;z-index:9998;user-select:none;' +
      'filter:drop-shadow(0 0 4px rgba(47,129,247,.6));' +
      'animation:cat-float ' + (1.8 + Math.random() * 0.7).toFixed(2) + 's ease-in-out infinite;' +
      'animation-delay:' + (Math.random() * 2).toFixed(2) + 's;transition:filter .15s;';
    el.appendChild(pixelSvg(data));
    const item = { el: el, data: data, x: fx0, y: fy + IH / 2, dragging: false };
    items.push(item);
    document.body.appendChild(el);
    if (paused) el.style.display = 'none';
    el.addEventListener('mousedown', ev => { ev.preventDefault(); startDrag(item, ev); });
  }

  function killFood(item, animate) {
    const i = items.indexOf(item);
    if (i === -1) return;
    items.splice(i, 1);
    if (seekItem === item) seekItem = null;
    if (animate) {
      item.el.style.transition = 'opacity .25s,transform .25s';
      item.el.style.opacity = '0';
      item.el.style.transform = 'scale(.1)';
      setTimeout(() => item.el.remove(), 280);
    } else item.el.remove();
  }

  function eatFood(item) {
    const d = item.data || {};
    const idx = PIXEL_FOODS.indexOf(item.data);
    const warLiebling = idx >= 0 && idx === lieblingIdx();
    if (idx >= 0) pet.likes[idx] += 1;
    killFood(item, true);
    beruehrt();
    go('eat', 1600);
    if (d.toy) {
      pet.mood = Math.min(100, pet.mood + 16);
      pet.energy = Math.max(0, pet.energy - 4);
      fx(['✨', '😻']);
      say(t().toy);
    } else {
      pet.hunger = Math.max(0, pet.hunger - (d.fill || 25));
      pet.mood = Math.min(100, pet.mood + (warLiebling ? 14 : 8));
      pet.meals += 1;
      fx(warLiebling ? ['❤️', '❤️', '✨', '😻'] : ['❤️', '✨', '😻']);
      say(warLiebling ? t().lieblich(futterName(d)) : t().yum(futterName(d)));
    }
    clampPet(); updatePanel(); savePet();
    setTimeout(spawnFood, 3000);
  }

  /* ── Ziehen und Fallenlassen ── */
  function startDrag(item, e) {
    drag = { item: item, ox: e.clientX - (item.x - IW / 2), oy: e.clientY - (item.y - IH / 2) };
    item.dragging = true;
    item.el.style.cursor = 'grabbing';
    item.el.style.animation = 'none';
    item.el.style.zIndex = '10002';
    item.el.style.transition = '';
    item.el.style.filter = 'drop-shadow(0 0 10px rgba(255,180,50,.9))';
    beruehrt();
    if (imBett) { wecken(); say(t().what); }
  }

  function onMove(e) {
    if (!drag) return;
    const item = drag.item;
    item.el.style.left = (e.clientX - drag.ox) + 'px';
    item.el.style.top  = (e.clientY - drag.oy) + 'px';
    item.x = e.clientX - drag.ox + IW / 2;
    item.y = e.clientY - drag.oy + IH / 2;
    const cx = posX + CW / 2;
    if (Math.abs(item.x - cx) < 240 && state !== 'eat' && !imBett && state !== 'zoom') {
      willBett = false;
      face(item.x < cx ? -1 : 1);
      targetX = item.x - CW / 2;
      if (state !== 'run') go('run');
    }
  }

  function onUp() {
    if (!drag) return;
    const item = drag.item;
    drag = null;
    item.dragging = false;
    item.el.style.cursor = 'grab';
    item.el.style.zIndex = '9998';
    item.el.style.filter = 'drop-shadow(0 0 4px rgba(47,129,247,.6))';
    if (Math.hypot(item.x - (posX + CW / 2), item.y - (floorY() + CH / 2)) < 75) {
      eatFood(item);
    } else {
      const ny = window.innerHeight - IH - 10;
      item.el.style.transition = 'top .28s ease-in,left .28s ease-in';
      item.el.style.top = ny + 'px';
      item.y = ny + IH / 2;
      /* Auf einem Knopf abgelegt? Dann rutscht es daneben. */
      item.el.style.visibility = 'hidden';
      const unten = document.elementFromPoint(item.x, item.y);
      item.el.style.visibility = '';
      if (unten && unten.closest(KLICKBAR)) {
        const frei = freierPlatz(item.y);
        if (frei !== null) { item.x = frei; item.el.style.left = (frei - IW / 2) + 'px'; }
      }
      setTimeout(() => {
        if (!item.dragging) {
          item.el.style.transition = '';
          item.el.style.animation = 'cat-float ' + (1.8 + Math.random() * 0.7).toFixed(2) + 's ease-in-out infinite';
        }
      }, 300);
      if (!imBett && state !== 'zoom') {
        targetX = item.x - CW / 2;
        if (state !== 'run') go('run');
      }
    }
  }

  function zzz(dt) {
    zzzTimer -= dt;
    if (zzzTimer > 0) return;
    zzzTimer = 1500;
    fx(['z'], '#8b949e', 1.6);
  }

  /* ── Hauptschleife ── */
  function tick(ts) {
    const dt = lastTs ? Math.min(ts - lastTs, 50) : 16;
    lastTs = ts;

    if (!paused) {
      const W = window.innerWidth;
      mouse.still += dt;
      if (stalkCool > 0) stalkCool -= dt;

      if (imBett) {
        zzz(dt);
      } else if (state === 'zoom') {
        posX += dir * 7 * dt / 16;
        if (posX > W - CW) { face(-1); posX = W - CW; zoomLeft--; }
        if (posX < 4) { face(1); posX = 4; zoomLeft--; }
        if (Math.random() < 0.25) pfote();
        if (zoomLeft <= 0 || pet.energy < 12) { go('sit', 1400); say(t().purr); }
      } else if (state === 'walk' || state === 'run' || state === 'jump' || state === 'stalk') {
        if (state === 'jump' || state === 'stalk') {
          timer -= dt;
          if (timer <= 0) go('walk');
        }

        if (targetX !== null) {
          const dx = targetX - posX;
          const speed = (state === 'run' ? 3.5 : 2.5) * (RUHIG ? 0.5 : 1);
          if (Math.abs(dx) < 4) {
            posX = targetX; targetX = null;
            if (willBett) { willBett = false; imBett = true; go('sleep'); say(t().zzz, 2000); }
            else { checkEat(); checkStalkArrive(); }
          } else {
            face(dx > 0 ? 1 : -1);
            posX += dir * Math.min(Math.abs(dx), speed * dt / 16);
          }
        } else if (state !== 'jump' && state !== 'stalk') {
          if (state === 'run') go('walk');

          if (pet.hunger > JAGD_AB && !seekItem && items.length) {
            const cx = posX + CW / 2;
            seekItem = items.reduce((a, b) => (Math.abs(b.x - cx) < Math.abs(a.x - cx) ? b : a));
          }
          if (seekItem && !seekItem.dragging && items.indexOf(seekItem) !== -1) {
            willBett = false;
            targetX = seekItem.x - CW / 2;
            if (state !== 'run') go('run');
          } else {
            seekItem = null;
            if (mouse.seen && mouse.still > 1400 && stalkCool <= 0 &&
                mouse.y > window.innerHeight - 220 &&
                Math.abs(mouse.x - (posX + CW / 2)) > 90) {
              targetX = Math.max(4, Math.min(W - CW, mouse.x - CW / 2));
              stalkCool = 12000;
              go('run');
            } else {
              posX += dir * (RUHIG ? 0.45 : 0.9) * dt / 16;
              if (posX > W - CW) face(-1);
              if (posX < 4) face(1);
              if (Math.random() < 0.00016) go('sit', 2500 + Math.random() * 2500);
            }
          }
        }
      } else {
        timer -= dt;
        if (timer <= 0) go('walk');
      }

      if ((state === 'walk' || state === 'run') && !imBett) {
        pawDist += Math.abs(posX - lastPawX);
        if (pawDist > 46) { pfote(); pawDist = 0; }
      }
      lastPawX = posX;

      wrapEl.style.left = posX + 'px';
      if (bubbleEl.style.opacity === '1') platziereBlase();
    }
    requestAnimationFrame(tick);
  }

  function checkStalkArrive() {
    if (mouse.seen && Math.abs(mouse.x - (posX + CW / 2)) < 70 &&
        mouse.y > window.innerHeight - 220) {
      go('stalk', 2200);
      say(t().stalk);
      fx(['💙'], null, 1.2);
    }
  }

  function checkEat() {
    const cx = posX + CW / 2;
    const near = items.find(i => !i.dragging && Math.abs(i.x - cx) < 60);
    if (near) eatFood(near);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
