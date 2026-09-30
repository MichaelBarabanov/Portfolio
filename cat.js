/* ──────────────────────────────────────────────────────────────────────
   Miso: eine Katze, die auf dieser Seite wohnt.

   Sie hat Hunger, Laune und Energie, merkt sich alles zwischen Besuchen,
   schläft nachts eher ein, kommt schauen wenn der Mauszeiger unten liegen
   bleibt, bekommt Zoomies und hinterlässt Pfotenabdrücke. Über
   window.miso lässt sie sich aus der Konsole steuern.

   Läuft nur bei feiner Zeigereingabe, also nicht auf Touchgeräten.
   ────────────────────────────────────────────────────────────────────── */
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

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
    back:   BASE + 'Idle_Back.png',
  };
  Object.values(SRCS).forEach(src => { new Image().src = src; });

  /* ── Sprache ─────────────────────────────────────────────────────────
     Die Seite setzt document.documentElement.lang. Miso hört mit und
     wechselt live mit, wenn oben auf EN geklickt wird.                 */
  const lang = () => ((document.documentElement.lang || 'de').slice(0, 2) === 'en' ? 'en' : 'de');

  const TXT = {
    de: {
      tip: 'Futter auf ' + CAT_NAME + ' ziehen, klicken zum Streicheln',
      btn: 'play with ' + CAT_NAME,
      sat: 'Satt', mood: 'Laune', energy: 'Energie',
      meals: 'Mahlzeiten', pets: 'Gestreichelt', newHere: 'neu hier',
      days: d => d + (d === 1 ? ' Tag' : ' Tage'),
      purr: 'schnurr', hungry: 'hungrig ...', bored: 'langweilig hier',
      fine: 'alles gut', night: 'gute Nacht', wake: 'ausgeschlafen',
      zzz: 'zzz ...', what: 'was gibts?', yum: n => n + ', lecker',
      toy: 'Spielzeug', zoom: 'ZOOMIES', stretch: 'gaehn', stalk: 'hallo du',
      levels: ['Streuner', 'Hauskatze', 'Stubentiger', 'Chefkatze', 'Legende'],
      moods: { tired: 'muede', hungry: 'hungrig', bored: 'gelangweilt', great: 'bester Laune', ok: 'zufrieden' },
    },
    en: {
      tip: 'drag food onto ' + CAT_NAME + ', click to pet',
      btn: 'play with ' + CAT_NAME,
      sat: 'Fed', mood: 'Mood', energy: 'Energy',
      meals: 'Meals', pets: 'Pets', newHere: 'new here',
      days: d => d + (d === 1 ? ' day' : ' days'),
      purr: 'purr', hungry: 'hungry ...', bored: 'so bored',
      fine: 'all good', night: 'good night', wake: 'well rested',
      zzz: 'zzz ...', what: 'what is it?', yum: n => n + ', yum',
      toy: 'a toy!', zoom: 'ZOOMIES', stretch: 'yaaawn', stalk: 'hi there',
      levels: ['Stray', 'House cat', 'Room tiger', 'Boss cat', 'Legend'],
      moods: { tired: 'sleepy', hungry: 'hungry', bored: 'bored', great: 'delighted', ok: 'content' },
    },
  };
  const t = () => TXT[lang()];

  /* ── Futter, 8x8 Pixelgrafik, Faktor 4 ergibt 32x32 px ── */
  const IW = 32, IH = 32;
  const PIXEL_FOODS = [
    { de: 'Fisch', en: 'fish', fill: 34, w: 8, h: 8, s: 4,
      c: ['#5b9bc4', '#89cff0', '#0d1b2a'],
      p: [[0,0,0,0,0,0,0,0],[0,0,0,2,2,2,0,0],[1,0,0,2,2,2,2,0],[1,1,0,2,3,2,2,2],
          [1,0,0,2,2,2,2,0],[0,0,0,2,2,2,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]] },
    { de: 'Kaese', en: 'cheese', fill: 22, w: 8, h: 8, s: 4,
      c: ['#f5c842', '#c4a030', '#b8920a'],
      p: [[0,0,0,0,1,0,0,0],[0,0,0,1,1,1,0,0],[0,0,1,1,1,1,1,0],[0,1,1,3,1,1,1,1],
          [1,1,1,1,1,3,1,1],[2,2,2,2,2,2,2,2],[2,2,2,2,2,2,2,2],[0,0,0,0,0,0,0,0]] },
    { de: 'Haehnchenkeule', en: 'drumstick', fill: 40, w: 8, h: 8, s: 4,
      c: ['#5a3010', '#d4704a', '#e8e0d8'],
      p: [[0,0,1,1,0,0,0,0],[0,1,2,2,1,0,0,0],[0,1,2,2,2,1,0,0],[0,1,2,2,2,1,0,0],
          [0,0,1,2,1,0,0,0],[0,0,0,1,3,0,0,0],[0,0,0,1,3,3,0,0],[0,0,0,0,1,3,3,0]] },
    { de: 'Tropenfisch', en: 'clownfish', fill: 34, w: 8, h: 8, s: 4,
      c: ['#c85a10', '#e8803a', '#0d1b2a', '#f0f0f0'],
      p: [[0,0,0,0,0,0,0,0],[0,0,0,2,2,2,0,0],[1,0,0,4,4,2,2,0],[1,1,0,4,3,2,2,2],
          [1,0,0,4,4,2,2,0],[0,0,0,2,2,2,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]] },
    { de: 'Milch', en: 'milk', fill: 18, w: 8, h: 8, s: 4,
      c: ['#f4f7fa', '#cfd8e0', '#3b82c4'],
      p: [[0,0,1,1,1,1,0,0],[0,0,1,3,3,1,0,0],[0,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,0],
          [0,1,3,3,3,3,1,0],[0,1,1,1,1,1,1,0],[0,2,2,2,2,2,2,0],[0,0,0,0,0,0,0,0]] },
    { de: 'Spielmaus', en: 'toy mouse', fill: 8, toy: true, w: 8, h: 8, s: 4,
      c: ['#9aa0a6', '#c8ced4', '#5f6368', '#f4a6c0'],
      p: [[0,0,0,0,0,0,0,0],[0,0,1,0,0,1,0,0],[0,1,2,1,1,2,1,0],[1,1,1,1,1,1,1,1],
          [1,1,3,1,1,3,1,1],[0,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,4],[0,0,0,0,0,0,4,4]] },
  ];

  const NS = 'http://www.w3.org/2000/svg';
  function pixelSvg(data) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', data.w * data.s);
    svg.setAttribute('height', data.h * data.s);
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.style.display = 'block';
    data.p.forEach((row, y) => row.forEach((v, x) => {
      if (!v) return;
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', x * data.s); r.setAttribute('y', y * data.s);
      r.setAttribute('width', data.s); r.setAttribute('height', data.s);
      r.setAttribute('fill', data.c[v - 1]);
      svg.appendChild(r);
    }));
    return svg;
  }

  /* ── Dauerhafter Zustand ─────────────────────────────────────────────
     Jeder Zugriff auf localStorage ist abgesichert. Im privaten Fenster
     oder bei blockierten Seitendaten startet Miso einfach neu, statt die
     Seite mitzureissen.                                                */
  const KEY = 'miso.state.v2';
  const HOUR = 3600000;

  const pet = {
    hunger: 25, mood: 80, energy: 90,
    meals: 0, pets: 0, zoomies: 0,
    born: Date.now(), seen: Date.now(),
  };

  function loadPet() {
    let raw = null;
    try { raw = localStorage.getItem(KEY) || localStorage.getItem('miso.state.v1'); } catch (e) { return; }
    if (!raw) return;
    let s;
    try { s = JSON.parse(raw); } catch (e) { return; }
    if (!s || typeof s !== 'object') return;
    Object.keys(pet).forEach(k => {
      if (typeof s[k] === 'number' && isFinite(s[k])) pet[k] = s[k];
    });
    const weg = Math.min((Date.now() - pet.seen) / HOUR, 12);
    pet.hunger += weg * 3.5;
    pet.mood   -= weg * 2.0;
    pet.energy += weg * 4.0;
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

  /* Nachts ist sie mueder. Reine Ortszeit, kein Datenabruf. */
  const istNacht = () => { const h = new Date().getHours(); return h >= 22 || h < 6; };

  /* ── Laufzeit ── */
  const floorY = () => window.innerHeight - CH;

  let posX = 120, dir = 1;
  let state = 'walk', timer = 0;
  let targetX = null, lastTs = 0;
  let paused = true;
  let wrapEl, imgEl, fxWrap, bubbleEl, panelEl, tipEl;
  const bars = {};
  let items = [], drag = null, seekItem = null;
  let lastSpeak = 0, zoomLeft = 0, pawDist = 0, lastPawX = 0, zzzTimer = 0;
  const mouse = { x: 0, y: 0, still: 0, seen: false };
  let stalkCool = 0;

  function srcFor(s, d) {
    if (s === 'run' || s === 'zoom') return d === 1 ? SRCS.run_r : SRCS.run_l;
    if (s === 'jump') return d === 1 ? SRCS.jump_r : SRCS.jump_l;
    if (s === 'sit' || s === 'eat' || s === 'sleep' || s === 'stalk') return SRCS.front;
    return d === 1 ? SRCS.walk_r : SRCS.walk_l;
  }
  function draw() {
    const want = srcFor(state, dir);
    if (imgEl.getAttribute('src') !== want) imgEl.setAttribute('src', want);
    imgEl.style.transformOrigin = 'bottom center';
    imgEl.style.animation =
      state === 'sleep' ? 'cat-breathe 2.6s ease-in-out infinite' :
      state === 'zoom'  ? 'cat-tilt .35s ease-in-out infinite' : '';
  }
  function face(d) { if (d !== dir) { dir = d; draw(); } }
  function go(s, dur) { state = s; timer = dur || 0; draw(); }

  function say(text, ms) {
    if (!bubbleEl || paused || !text) return;
    const now = Date.now();
    if (now - lastSpeak < 900) return;
    lastSpeak = now;
    bubbleEl.textContent = text;
    bubbleEl.style.opacity = '1';
    clearTimeout(say._t);
    say._t = setTimeout(() => { bubbleEl.style.opacity = '0'; }, ms || 2200);
  }

  function stimmung() {
    const m = t().moods;
    if (pet.energy < 22) return m.tired;
    if (pet.hunger > 70) return m.hungry;
    if (pet.mood   < 30) return m.bored;
    if (pet.mood   > 75 && pet.hunger < 35) return m.great;
    return m.ok;
  }

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

  /* Pfotenabdruecke bleiben kurz auf dem Boden liegen. */
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
      'bottom:' + (2 + Math.random() * 4) + 'px;z-index:9996;pointer-events:none;' +
      'opacity:.55;animation:cat-paw 2.6s ease-out forwards;';
    el.appendChild(svg);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2700);
  }

  /* ── Anzeige ── */
  function toggle(show) {
    paused = !show;
    wrapEl.style.display = show ? '' : 'none';
    items.forEach(i => { i.el.style.display = show ? '' : 'none'; });
    if (panelEl) panelEl.style.display = show ? '' : 'none';
    if (tipEl) tipEl.style.display = show ? '' : 'none';
    if (show) { updatePanel(); say(CAT_NAME + ': ' + stimmung(), 2600); }
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
    kopf.appendChild(nm);
    kopf.appendChild(alt);
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
    }
  }

  /* ── CSS ─────────────────────────────────────────────────────────────
     cat.js bringt seine Keyframes selbst mit. Vorher standen sie nur in
     style.css, und hire.html bindet die nicht ein. Dort lief die
     Futter-Animation deshalb nie und die Herzchen blieben unsichtbar.  */
  function injectCss() {
    if (document.getElementById('cat-css')) return;
    const st = document.createElement('style');
    st.id = 'cat-css';
    st.textContent =
      '@keyframes cat-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}' +
      '@keyframes cat-heart{0%{opacity:1;transform:translateY(0) scale(1)}' +
      '100%{opacity:0;transform:translateY(-45px) scale(1.4)}}' +
      '@keyframes cat-breathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.94)}}' +
      '@keyframes cat-tilt{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}' +
      '@keyframes cat-paw{0%{opacity:.55}100%{opacity:0}}';
    document.head.appendChild(st);
  }

  /* ── Aufbau ── */
  function init() {
    injectCss();
    loadPet();

    wrapEl = document.createElement('div');
    wrapEl.id = 'site-cat';
    wrapEl.style.cssText =
      'position:fixed;bottom:0;left:' + posX + 'px;z-index:9999;cursor:pointer;' +
      'user-select:none;width:' + CW + 'px;height:' + CH + 'px;display:none;';

    imgEl = document.createElement('img');
    imgEl.src = SRCS.walk_r;
    imgEl.width = CW; imgEl.height = CH; imgEl.alt = CAT_NAME;
    imgEl.style.cssText = 'display:block;image-rendering:pixelated;';
    wrapEl.appendChild(imgEl);

    fxWrap = document.createElement('div');
    fxWrap.style.cssText = 'position:absolute;bottom:' + CH + 'px;left:0;width:' + CW + 'px;pointer-events:none;';
    wrapEl.appendChild(fxWrap);

    bubbleEl = document.createElement('div');
    bubbleEl.style.cssText =
      'position:absolute;bottom:' + (CH + 16) + 'px;left:50%;transform:translateX(-50%);' +
      "font-family:'Cascadia Code','Fira Code',monospace;font-size:10px;white-space:nowrap;" +
      'background:#161b22;color:#e6edf3;border:1px solid #30363d;border-radius:4px;' +
      'padding:3px 8px;opacity:0;transition:opacity .25s;pointer-events:none;';
    wrapEl.appendChild(bubbleEl);
    document.body.appendChild(wrapEl);

    tipEl = document.createElement('div');
    tipEl.id = 'cat-tip';
    tipEl.style.cssText =
      'position:fixed;bottom:' + (CH + 8) + 'px;font-family:monospace;font-size:11px;' +
      'background:#161b22;color:#e6edf3;padding:4px 10px;border-radius:4px;' +
      'border:1px solid #30363d;pointer-events:none;opacity:0;transition:opacity .2s;' +
      'z-index:10000;white-space:nowrap;';
    tipEl.textContent = t().tip;
    document.body.appendChild(tipEl);

    wrapEl.addEventListener('mouseenter', () => {
      tipEl.textContent = t().tip;
      tipEl.style.opacity = '1';
      tipEl.style.left = posX + 'px';
    });
    wrapEl.addEventListener('mouseleave', () => { tipEl.style.opacity = '0'; });
    wrapEl.addEventListener('click', streicheln);
    wrapEl.addEventListener('dblclick', e => { e.preventDefault(); zoomies(); });

    document.addEventListener('mousemove', e => {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.still = 0; mouse.seen = true;
      onMove(e);
    });
    document.addEventListener('mouseup', onUp);

    new MutationObserver(() => { updatePanel(); tipEl.textContent = t().tip; })
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

  /* ── Konsolen-Schnittstelle ──────────────────────────────────────────
     Wer die Entwicklerwerkzeuge oeffnet, soll etwas finden.            */
  function exposeApi() {
    const HELP = [
      'miso.stats      aktuelle Werte',
      'miso.show()     Katze einblenden',
      'miso.pet()      streicheln',
      'miso.feed()     Futter werfen',
      'miso.come()     zum Mauszeiger rufen',
      'miso.zoomies()  einmal durchdrehen',
      'miso.sleep()    schlafen legen',
      'miso.reset()    von vorn anfangen',
    ].join('\n');

    const api = {
      get stats() {
        return {
          name: CAT_NAME, level: levelNr() + 1, title: levelName(),
          hunger: +pet.hunger.toFixed(1), mood: +pet.mood.toFixed(1),
          energy: +pet.energy.toFixed(1), meals: pet.meals, pets: pet.pets,
          zoomies: pet.zoomies, ageDays: ageDays(), state: state,
        };
      },
      show() { buildButton.setActive(true); return CAT_NAME + ' ist da'; },
      hide() { buildButton.setActive(false); return 'bis dann'; },
      pet()  { buildButton.setActive(true); streicheln(); return t().purr; },
      feed() {
        buildButton.setActive(true); spawnFood();
        const i = items[items.length - 1];
        if (i) { targetX = i.x - CW / 2; go('run'); }
        return 'serviert';
      },
      come() {
        buildButton.setActive(true);
        targetX = Math.max(4, Math.min(window.innerWidth - CW, mouse.x - CW / 2));
        go('run');
        return 'komme';
      },
      zoomies() { buildButton.setActive(true); zoomies(); return 'ZOOMIES'; },
      sleep()   { buildButton.setActive(true); pet.energy = 10; clampPet(); go('sleep'); return 'zzz'; },
      reset()   {
        try { localStorage.removeItem(KEY); localStorage.removeItem('miso.state.v1'); } catch (e) {}
        return 'Seite neu laden, dann faengt sie von vorn an';
      },
      help() { console.log(HELP); return 'siehe oben'; },
    };

    try { Object.defineProperty(window, 'miso', { value: api, writable: false, configurable: true }); }
    catch (e) { window.miso = api; }

    setTimeout(() => {
      try {
        console.log('%c ' + CAT_NAME + ' %c wohnt auf dieser Seite. %cmiso.help()%c zeigt alle Befehle.',
          'background:#d4704a;color:#0d1117;border-radius:3px 0 0 3px;padding:2px 6px;font-weight:700',
          'background:#161b22;color:#e6edf3;border-radius:0 3px 3px 0;padding:2px 8px',
          'color:#3fb950;font-family:monospace', 'color:#8b949e');
      } catch (e) { /* egal */ }
    }, 1200);
  }

  /* ── Aktionen ── */
  function streicheln() {
    if (state === 'eat') return;
    if (state === 'sleep') {
      if (pet.energy < 45) { say(t().zzz); return; }
      pet.energy += 4;
    }
    pet.mood = Math.min(100, pet.mood + 7);
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
    if (state === 'eat' || pet.energy < 25) { say(t().zzz); return; }
    zoomLeft = 3 + Math.floor(Math.random() * 3);
    targetX = null; seekItem = null;
    go('zoom');
    pet.zoomies += 1;
    pet.mood = Math.min(100, pet.mood + 10);
    clampPet(); updatePanel(); savePet();
    say(t().zoom, 1600);
    fx(['✨', '💨'], null, 1.3);
  }

  /* ── Stoffwechsel, einmal je Sekunde ── */
  function stoffwechsel() {
    if (paused) return;
    const nacht = istNacht();

    pet.hunger += 0.09;
    pet.mood   -= 0.05;
    if (state === 'sleep') { pet.energy += 0.55; pet.mood += 0.03; }
    else if (state === 'run' || state === 'jump') pet.energy -= 0.14;
    else if (state === 'zoom') pet.energy -= 0.45;
    else pet.energy -= nacht ? 0.09 : 0.05;

    if (pet.hunger > 75) pet.mood -= 0.08;
    if (pet.energy < 20) pet.mood -= 0.05;
    clampPet(); updatePanel();

    const schlafGrenze = nacht ? 32 : 18;
    if (pet.energy < schlafGrenze && state !== 'sleep' && state !== 'eat' && state !== 'zoom') {
      go('sleep'); targetX = null; seekItem = null;
      say(t().night, 2600);
    } else if (state === 'sleep' && pet.energy > (nacht ? 88 : 72)) {
      go('sit', 1400);
      say(t().stretch, 2000);
    }

    if (state !== 'sleep' && Math.random() < 0.02) {
      if (pet.hunger > 72) say(t().hungry);
      else if (pet.mood < 28) say(t().bored);
      else if (pet.mood > 85 && Math.random() < 0.4) say(t().fine);
    }
    if (state === 'walk' && pet.mood > 70 && pet.energy > 45 && Math.random() < 0.008) go('jump', 900);
    if (state === 'walk' && pet.mood > 88 && pet.energy > 70 && !nacht && Math.random() < 0.004) zoomies();
    if (pet.mood > 92 && Math.random() < 0.05) fx(['✨'], '#d29922', 1.4);
  }

  /* ── Futter ── */
  function spawnFood() {
    if (items.length >= 4) return;
    const data = PIXEL_FOODS[Math.floor(Math.random() * PIXEL_FOODS.length)];
    const margin = 80;
    const fx0 = margin + Math.random() * Math.max(120, window.innerWidth - margin * 2);
    const fy = window.innerHeight - IH - 10;
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
    killFood(item, true);
    go('eat', 1600);
    if (d.toy) {
      pet.mood = Math.min(100, pet.mood + 14);
      pet.energy = Math.max(0, pet.energy - 3);
      fx(['✨', '😻']);
      say(t().toy);
    } else {
      pet.hunger = Math.max(0, pet.hunger - (d.fill || 25));
      pet.mood = Math.min(100, pet.mood + 6);
      pet.meals += 1;
      fx(['❤️', '✨', '😻']);
      say(t().yum(d[lang()] || d.de));
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
    item.el.style.zIndex = '10001';
    item.el.style.transition = '';
    item.el.style.filter = 'drop-shadow(0 0 10px rgba(255,180,50,.9))';
    if (state === 'sleep' && pet.energy > 35) { go('walk'); say(t().what); }
  }

  function onMove(e) {
    if (!drag) return;
    const item = drag.item;
    item.el.style.left = (e.clientX - drag.ox) + 'px';
    item.el.style.top  = (e.clientY - drag.oy) + 'px';
    item.x = e.clientX - drag.ox + IW / 2;
    item.y = e.clientY - drag.oy + IH / 2;
    const cx = posX + CW / 2;
    if (Math.abs(item.x - cx) < 220 && state !== 'eat' && state !== 'sleep' && state !== 'zoom') {
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
      item.el.style.transition = 'top .28s ease-in';
      item.el.style.top = ny + 'px';
      item.y = ny + IH / 2;
      setTimeout(() => {
        if (!item.dragging) {
          item.el.style.transition = '';
          item.el.style.animation = 'cat-float ' + (1.8 + Math.random() * 0.7).toFixed(2) + 's ease-in-out infinite';
        }
      }, 300);
      if (state !== 'sleep' && state !== 'zoom') {
        targetX = item.x - CW / 2;
        if (state !== 'run') go('run');
      }
    }
  }

  function zzz(dt) {
    zzzTimer -= dt;
    if (zzzTimer > 0) return;
    zzzTimer = 1400;
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

      if (state === 'sleep') {
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
          const speed = state === 'run' ? 3.5 : 2.5;
          if (Math.abs(dx) < 4) { posX = targetX; targetX = null; checkEat(); checkStalkArrive(); }
          else { face(dx > 0 ? 1 : -1); posX += dir * Math.min(Math.abs(dx), speed * dt / 16); }
        } else if (state !== 'jump' && state !== 'stalk') {
          if (state === 'run') go('walk');

          if (pet.hunger > 62 && !seekItem && items.length) {
            const cx = posX + CW / 2;
            seekItem = items.reduce((a, b) => (Math.abs(b.x - cx) < Math.abs(a.x - cx) ? b : a));
          }
          if (seekItem && !seekItem.dragging && items.indexOf(seekItem) !== -1) {
            targetX = seekItem.x - CW / 2;
            if (state !== 'run') go('run');
          } else {
            seekItem = null;
            // Zeiger ruht unten am Rand? Dann kommt sie schauen.
            if (mouse.seen && mouse.still > 1400 && stalkCool <= 0 &&
                mouse.y > window.innerHeight - 220 &&
                Math.abs(mouse.x - (posX + CW / 2)) > 90) {
              targetX = Math.max(4, Math.min(W - CW, mouse.x - CW / 2));
              stalkCool = 12000;
              go('run');
            } else {
              posX += dir * 0.9 * dt / 16;
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

      // Pfotenabdruecke nach zurueckgelegter Strecke, nicht nach Zeit
      if (state === 'walk' || state === 'run') {
        pawDist += Math.abs(posX - lastPawX);
        if (pawDist > 46) { pfote(); pawDist = 0; }
      }
      lastPawX = posX;

      wrapEl.style.left = posX + 'px';
      if (tipEl && tipEl.style.opacity !== '0') tipEl.style.left = posX + 'px';
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
