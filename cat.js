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

  /* ── Pixel-art food definitions (8×8 grid, scale 4 → 32×32 px) ── */
  const IW = 32, IH = 32;
  const PIXEL_FOODS = [
    { name: 'Fisch', fill: 34, w:8, h:8, s:4,
      c:['#5b9bc4','#89cff0','#0d1b2a'],
      p:[
        [0,0,0,0,0,0,0,0],
        [0,0,0,2,2,2,0,0],
        [1,0,0,2,2,2,2,0],
        [1,1,0,2,3,2,2,2],
        [1,0,0,2,2,2,2,0],
        [0,0,0,2,2,2,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
      ]
    },
    { name: 'Käse', fill: 22, w:8, h:8, s:4,
      c:['#f5c842','#c4a030','#b8920a'],
      p:[
        [0,0,0,0,1,0,0,0],
        [0,0,0,1,1,1,0,0],
        [0,0,1,1,1,1,1,0],
        [0,1,1,3,1,1,1,1],
        [1,1,1,1,1,3,1,1],
        [2,2,2,2,2,2,2,2],
        [2,2,2,2,2,2,2,2],
        [0,0,0,0,0,0,0,0],
      ]
    },
    { name: 'Hähnchenkeule', fill: 40, w:8, h:8, s:4,
      c:['#5a3010','#d4704a','#e8e0d8'],
      p:[
        [0,0,1,1,0,0,0,0],
        [0,1,2,2,1,0,0,0],
        [0,1,2,2,2,1,0,0],
        [0,1,2,2,2,1,0,0],
        [0,0,1,2,1,0,0,0],
        [0,0,0,1,3,0,0,0],
        [0,0,0,1,3,3,0,0],
        [0,0,0,0,1,3,3,0],
      ]
    },
    { name: 'Tropenfisch', fill: 34, w:8, h:8, s:4,
      c:['#c85a10','#e8803a','#0d1b2a','#f0f0f0'],
      p:[
        [0,0,0,0,0,0,0,0],
        [0,0,0,2,2,2,0,0],
        [1,0,0,4,4,2,2,0],
        [1,1,0,4,3,2,2,2],
        [1,0,0,4,4,2,2,0],
        [0,0,0,2,2,2,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
      ]
    },
    { name: 'Milch', fill: 18, w:8, h:8, s:4,
      c:['#f4f7fa','#cfd8e0','#3b82c4'],
      p:[
        [0,0,1,1,1,1,0,0],
        [0,0,1,3,3,1,0,0],
        [0,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,0],
        [0,1,3,3,3,3,1,0],
        [0,1,1,1,1,1,1,0],
        [0,2,2,2,2,2,2,0],
        [0,0,0,0,0,0,0,0],
      ]
    },
    { name: 'Spielmaus', fill: 8, toy: true, w:8, h:8, s:4,
      c:['#9aa0a6','#c8ced4','#5f6368','#f4a6c0'],
      p:[
        [0,0,0,0,0,0,0,0],
        [0,0,1,0,0,1,0,0],
        [0,1,2,1,1,2,1,0],
        [1,1,1,1,1,1,1,1],
        [1,1,3,1,1,3,1,1],
        [0,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,0,4],
        [0,0,0,0,0,0,4,4],
      ]
    },
  ];

  function makeFoodEl(data) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width',  data.w * data.s);
    svg.setAttribute('height', data.h * data.s);
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.style.display = 'block';
    data.p.forEach((row, y) => {
      row.forEach((v, x) => {
        if (!v) return;
        const r = document.createElementNS(ns, 'rect');
        r.setAttribute('x', x * data.s);
        r.setAttribute('y', y * data.s);
        r.setAttribute('width',  data.s);
        r.setAttribute('height', data.s);
        r.setAttribute('fill', data.c[v - 1]);
        svg.appendChild(r);
      });
    });
    return svg;
  }

  /* ── Persistent pet state ──────────────────────────────────────────
     Kept in localStorage so Miso remembers between visits. Every read
     and write is wrapped: private windows and blocked site data must
     not break the page, they just give a fresh cat.                  */
  const KEY = 'miso.state.v1';
  const HOUR = 3600000;

  const pet = {
    hunger: 25,   // 0 satt, 100 am Verhungern
    mood:   80,   // 0 mies, 100 bester Laune
    energy: 90,   // 0 erschoepft, 100 ausgeruht
    meals:  0,
    pets:   0,
    born:   Date.now(),
    seen:   Date.now(),
  };

  function loadPet() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { return; }
    if (!raw) return;
    let saved;
    try { saved = JSON.parse(raw); } catch (e) { return; }
    if (!saved || typeof saved !== 'object') return;

    ['hunger', 'mood', 'energy', 'meals', 'pets', 'born', 'seen'].forEach(k => {
      if (typeof saved[k] === 'number' && isFinite(saved[k])) pet[k] = saved[k];
    });

    // Abwesenheit nachrechnen, aber gedeckelt. Wer nach drei Wochen
    // wiederkommt, soll eine leicht hungrige Katze vorfinden, kein Drama.
    const weg = Math.min((Date.now() - pet.seen) / HOUR, 12);
    pet.hunger += weg * 3.5;
    pet.mood   -= weg * 2.0;
    pet.energy += weg * 4.0;   // ausserhalb des Tabs wird geschlafen
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

  const ageDays = () => Math.max(0, Math.floor((Date.now() - pet.born) / 86400000));

  /* ── Runtime ── */
  const floorY = () => window.innerHeight - CH;

  let posX = 120, dir = 1;
  let state = 'walk', timer = 0;
  let targetX = null, lastTs = 0;
  let paused = true;
  let wrapEl, imgEl, heartWrap, bubbleEl, panelEl, bars = {};
  let items = [], drag = null;
  let seekItem = null;
  let lastSpeak = 0;

  function srcFor(s, d) {
    if (s === 'run')   return d === 1 ? SRCS.run_r  : SRCS.run_l;
    if (s === 'jump')  return d === 1 ? SRCS.jump_r : SRCS.jump_l;
    if (s === 'sit' || s === 'eat') return SRCS.front;
    if (s === 'sleep') return SRCS.front;
    return d === 1 ? SRCS.walk_r : SRCS.walk_l;
  }

  function draw() {
    const want = srcFor(state, dir);
    if (imgEl.getAttribute('src') !== want) imgEl.setAttribute('src', want);
    imgEl.style.animation = state === 'sleep' ? 'cat-breathe 2.6s ease-in-out infinite' : '';
    imgEl.style.transformOrigin = 'bottom center';
  }

  function face(d) { if (d !== dir) { dir = d; draw(); } }
  function go(s, dur) { state = s; timer = dur || 0; draw(); }

  /* ── Speech bubble ── */
  function say(text, ms) {
    if (!bubbleEl || paused) return;
    const now = Date.now();
    if (now - lastSpeak < 900) return;
    lastSpeak = now;
    bubbleEl.textContent = text;
    bubbleEl.style.opacity = '1';
    clearTimeout(say._t);
    say._t = setTimeout(() => { bubbleEl.style.opacity = '0'; }, ms || 2200);
  }

  function stimmung() {
    if (pet.energy < 22) return 'müde';
    if (pet.hunger > 70) return 'hungrig';
    if (pet.mood   < 30) return 'gelangweilt';
    if (pet.mood   > 75 && pet.hunger < 35) return 'bester Laune';
    return 'zufrieden';
  }

  /* ── Toggle ── */
  function toggle(show) {
    paused = !show;
    wrapEl.style.display = show ? '' : 'none';
    items.forEach(i => { i.el.style.display = show ? '' : 'none'; });
    if (panelEl) panelEl.style.display = show ? '' : 'none';
    const tip = document.getElementById('cat-tip');
    if (tip) tip.style.display = show ? '' : 'none';
    if (show) { updatePanel(); say(CAT_NAME + ' ist ' + stimmung(), 2600); }
  }

  /* ── Status panel ── */
  function makeBar(label, farbe) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:7px;';
    const t = document.createElement('span');
    t.textContent = label;
    t.style.cssText = 'width:52px;color:#8b949e;font-size:10px;letter-spacing:.04em;';
    const track = document.createElement('div');
    track.style.cssText = 'flex:1;height:6px;background:#21262d;border-radius:3px;overflow:hidden;';
    const fill = document.createElement('div');
    fill.style.cssText = `height:100%;width:50%;background:${farbe};border-radius:3px;transition:width .4s ease;`;
    track.appendChild(fill);
    row.appendChild(t); row.appendChild(track);
    return { row, fill };
  }

  function buildPanel() {
    panelEl = document.createElement('div');
    panelEl.id = 'cat-panel';
    panelEl.style.cssText =
      `position:fixed;bottom:${CH + 62}px;right:24px;z-index:9997;display:none;` +
      `font-family:'Cascadia Code','Fira Code',monospace;font-size:11px;` +
      `background:#0d1117;border:1px solid #21262d;border-radius:7px;` +
      `padding:10px 12px;width:200px;color:#e6edf3;box-shadow:0 6px 20px rgba(0,0,0,.45);`;

    const kopf = document.createElement('div');
    kopf.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:8px;';
    const nm = document.createElement('span');
    nm.textContent = CAT_NAME;
    nm.style.cssText = 'color:#e6edf3;font-weight:600;';
    const alt = document.createElement('span');
    alt.id = 'cat-age';
    alt.style.cssText = 'color:#6e7681;';
    kopf.appendChild(nm); kopf.appendChild(alt);
    panelEl.appendChild(kopf);

    const felder = [['Satt', '#3fb950'], ['Laune', '#d29922'], ['Energie', '#58a6ff']];
    felder.forEach(([l, f]) => {
      const b = makeBar(l, f);
      bars[l] = b.fill;
      b.row.style.marginBottom = '5px';
      panelEl.appendChild(b.row);
    });

    const fuss = document.createElement('div');
    fuss.id = 'cat-stats';
    fuss.style.cssText = 'margin-top:8px;padding-top:7px;border-top:1px solid #21262d;color:#6e7681;font-size:10px;';
    panelEl.appendChild(fuss);

    document.body.appendChild(panelEl);
  }

  function updatePanel() {
    if (!panelEl || paused) return;
    bars['Satt'].style.width    = (100 - pet.hunger).toFixed(0) + '%';
    bars['Laune'].style.width   = pet.mood.toFixed(0) + '%';
    bars['Energie'].style.width = pet.energy.toFixed(0) + '%';
    const alt = document.getElementById('cat-age');
    if (alt) alt.textContent = ageDays() === 0 ? 'neu hier' : ageDays() + ' Tage';
    const s = document.getElementById('cat-stats');
    if (s) {
      s.innerHTML = '';
      [['Mahlzeiten', pet.meals], ['Gestreichelt', pet.pets]].forEach(([l, v]) => {
        const r = document.createElement('div');
        r.style.cssText = 'display:flex;justify-content:space-between;';
        const a = document.createElement('span'); a.textContent = l;
        const b = document.createElement('span'); b.textContent = v;
        b.style.color = '#8b949e';
        r.appendChild(a); r.appendChild(b);
        s.appendChild(r);
      });
    }
  }

  /* ── Styles ──────────────────────────────────────────────────────
     cat.js bringt seine Keyframes selbst mit. Vorher standen sie nur
     in style.css, und hire.html bindet die nicht ein. Dort lief die
     Futter-Animation deshalb nie und die Herzchen blieben unsichtbar. */
  function injectCss() {
    if (document.getElementById('cat-css')) return;
    const st = document.createElement('style');
    st.id = 'cat-css';
    st.textContent =
      '@keyframes cat-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}' +
      '@keyframes cat-heart{0%{opacity:1;transform:translateY(0) scale(1)}' +
      '100%{opacity:0;transform:translateY(-45px) scale(1.4)}}' +
      '@keyframes cat-breathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.94)}}';
    document.head.appendChild(st);
  }

  /* ── Init ── */
  function init() {
    injectCss();
    loadPet();

    wrapEl = document.createElement('div');
    wrapEl.id = 'site-cat';
    wrapEl.style.cssText = `position:fixed;bottom:0;left:${posX}px;z-index:9999;cursor:pointer;user-select:none;width:${CW}px;height:${CH}px;display:none;`;

    imgEl = document.createElement('img');
    imgEl.src = SRCS.walk_r;
    imgEl.width = CW;
    imgEl.height = CH;
    imgEl.alt = CAT_NAME;
    imgEl.style.cssText = 'display:block;image-rendering:pixelated;';
    wrapEl.appendChild(imgEl);

    heartWrap = document.createElement('div');
    heartWrap.style.cssText = `position:absolute;bottom:${CH}px;left:0;width:${CW}px;pointer-events:none;`;
    wrapEl.appendChild(heartWrap);

    bubbleEl = document.createElement('div');
    bubbleEl.style.cssText =
      `position:absolute;bottom:${CH + 16}px;left:50%;transform:translateX(-50%);` +
      `font-family:'Cascadia Code','Fira Code',monospace;font-size:10px;white-space:nowrap;` +
      `background:#161b22;color:#e6edf3;border:1px solid #30363d;border-radius:4px;` +
      `padding:3px 8px;opacity:0;transition:opacity .25s;pointer-events:none;`;
    wrapEl.appendChild(bubbleEl);

    document.body.appendChild(wrapEl);

    const tip = document.createElement('div');
    tip.id = 'cat-tip';
    tip.style.cssText = `position:fixed;bottom:${CH+8}px;font-family:monospace;font-size:11px;background:#161b22;color:#e6edf3;padding:4px 10px;border-radius:4px;border:1px solid #30363d;pointer-events:none;opacity:0;transition:opacity .2s;z-index:10000;white-space:nowrap;`;
    tip.textContent = 'Futter auf ' + CAT_NAME + ' ziehen, klicken zum Streicheln';
    document.body.appendChild(tip);

    wrapEl.addEventListener('mouseenter', () => { tip.style.opacity = '1'; tip.style.left = posX + 'px'; });
    wrapEl.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
    wrapEl.addEventListener('click', streicheln);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    buildPanel();
    buildButton();

    draw();
    spawnFood();
    setTimeout(spawnFood, 1800);
    setInterval(stoffwechsel, 1000);
    setInterval(savePet, 10000);
    window.addEventListener('beforeunload', savePet);

    requestAnimationFrame(tick);
  }

  function buildButton() {
    let active = false;
    const btnWrap = document.createElement('div');
    btnWrap.className = 'cat-toggle-wrap';
    btnWrap.style.cssText = `position:fixed;bottom:${CH+20}px;right:24px;z-index:9997;display:flex;flex-direction:column;align-items:flex-end;gap:5px;`;

    const btn = document.createElement('button');
    btn.style.cssText =
      `font-family:'Cascadia Code','Fira Code',monospace;font-size:12px;` +
      `background:transparent;color:#484f58;` +
      `border:1px solid #21262d;border-radius:6px;` +
      `padding:7px 14px;cursor:pointer;` +
      `transition:border-color .2s,color .2s,opacity .2s;` +
      `white-space:nowrap;opacity:0.45;`;
    btn.textContent = '🐱 play with ' + CAT_NAME;

    btn.addEventListener('mouseenter', () => { btn.style.borderColor = active ? '#2f81f7' : '#484f58'; });
    btn.addEventListener('mouseleave', () => { btn.style.borderColor = active ? '#30363d' : '#21262d'; });
    btn.addEventListener('click', () => {
      active = !active;
      toggle(active);
      btn.style.opacity     = active ? '1'       : '0.45';
      btn.style.color       = active ? '#e6edf3' : '#484f58';
      btn.style.borderColor = active ? '#30363d' : '#21262d';
    });

    btnWrap.appendChild(btn);
    document.body.appendChild(btnWrap);
  }

  /* ── Petting ── */
  function streicheln() {
    if (state === 'eat') return;
    if (state === 'sleep') {
      if (pet.energy < 45) { say('zzz ...'); return; }
      pet.energy += 4;
    }
    pet.mood = Math.min(100, pet.mood + 7);
    pet.pets += 1;
    clampPet();
    updatePanel();
    savePet();

    if (pet.mood > 80 && pet.energy > 40) {
      go('jump', 900);
      hearts(['❤️', '✨']);
      say('schnurr');
    } else {
      go('sit', 1800);
      hearts(['💙']);
      say(pet.hunger > 65 ? 'hab Hunger' : 'schnurr');
    }
  }

  /* ── Metabolism, once per second ── */
  function stoffwechsel() {
    if (paused) return;

    pet.hunger += 0.09;
    pet.mood   -= 0.05;

    if (state === 'sleep') {
      pet.energy += 0.55;
      pet.mood   += 0.03;
    } else if (state === 'run' || state === 'jump') {
      pet.energy -= 0.14;
    } else {
      pet.energy -= 0.05;
    }

    // Hunger und Muedigkeit druecken auf die Laune
    if (pet.hunger > 75) pet.mood -= 0.08;
    if (pet.energy < 20)  pet.mood -= 0.05;

    clampPet();
    updatePanel();

    // Zustandswechsel
    if (pet.energy < 18 && state !== 'sleep' && state !== 'eat') {
      go('sleep', 0);
      targetX = null; seekItem = null;
      say('gute Nacht', 2600);
    } else if (state === 'sleep' && pet.energy > 72) {
      go('walk');
      say('ausgeschlafen', 2200);
    }

    // Gelegentliche Meldungen
    if (state !== 'sleep' && Math.random() < 0.02) {
      if (pet.hunger > 72)      say('hungrig ...');
      else if (pet.mood < 28)   say('langweilig hier');
      else if (pet.mood > 85 && Math.random() < 0.4) say('alles gut');
    }

    // Aus Langeweile mal springen
    if (state === 'walk' && pet.mood > 70 && pet.energy > 45 && Math.random() < 0.008) {
      go('jump', 900);
    }
  }

  /* ── Food ── */
  function spawnFood() {
    if (items.length >= 4) return;
    const data = PIXEL_FOODS[Math.floor(Math.random() * PIXEL_FOODS.length)];
    const margin = 80;
    const fx = margin + Math.random() * Math.max(120, window.innerWidth - margin * 2);
    const fy = window.innerHeight - IH - 10;

    const el = document.createElement('div');
    el.title = data.name;
    el.style.cssText =
      `position:fixed;left:${fx - IW/2}px;top:${fy}px;` +
      `width:${IW}px;height:${IH}px;cursor:grab;z-index:9998;user-select:none;` +
      `filter:drop-shadow(0 0 4px rgba(47,129,247,.6));` +
      `animation:cat-float ${(1.8 + Math.random() * .7).toFixed(2)}s ease-in-out infinite;` +
      `animation-delay:${(Math.random() * 2).toFixed(2)}s;transition:filter .15s;`;

    el.appendChild(makeFoodEl(data));

    const item = { el, data, x: fx, y: fy + IH / 2, dragging: false };
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
      item.el.style.transform = 'scale(0.1)';
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
      hearts(['✨', '😻']);
      say('Spielzeug');
    } else {
      pet.hunger = Math.max(0, pet.hunger - (d.fill || 25));
      pet.mood   = Math.min(100, pet.mood + 6);
      pet.meals += 1;
      hearts(['❤️', '✨', '😻']);
      say(d.name ? d.name + ', lecker' : 'lecker');
    }

    clampPet();
    updatePanel();
    savePet();
    setTimeout(spawnFood, 3000);
  }

  /* ── Drag & Drop ── */
  function startDrag(item, e) {
    drag = { item, ox: e.clientX - (item.x - IW/2), oy: e.clientY - (item.y - IH/2) };
    item.dragging = true;
    item.el.style.cursor = 'grabbing';
    item.el.style.animation = 'none';
    item.el.style.zIndex = '10001';
    item.el.style.transition = '';
    item.el.style.filter = 'drop-shadow(0 0 10px rgba(255,180,50,.9))';
    if (state === 'sleep' && pet.energy > 35) { go('walk'); say('was gibts?'); }
  }

  function onMove(e) {
    if (!drag) return;
    const { item } = drag;
    item.el.style.left = (e.clientX - drag.ox) + 'px';
    item.el.style.top  = (e.clientY - drag.oy) + 'px';
    item.x = e.clientX - drag.ox + IW / 2;
    item.y = e.clientY - drag.oy + IH / 2;
    const cx = posX + CW / 2;
    if (Math.abs(item.x - cx) < 220 && state !== 'eat' && state !== 'sleep') {
      face(item.x < cx ? -1 : 1);
      targetX = item.x - CW / 2;
      if (state !== 'run') go('run');
    }
  }

  function onUp() {
    if (!drag) return;
    const { item } = drag;
    drag = null;
    item.dragging = false;
    item.el.style.cursor = 'grab';
    item.el.style.zIndex = '9998';
    item.el.style.filter = 'drop-shadow(0 0 4px rgba(47,129,247,.6))';
    if (Math.hypot(item.x - (posX + CW/2), item.y - (floorY() + CH/2)) < 75) {
      eatFood(item);
    } else {
      const ny = window.innerHeight - IH - 10;
      item.el.style.transition = 'top .28s ease-in';
      item.el.style.top = ny + 'px';
      item.y = ny + IH / 2;
      setTimeout(() => {
        if (!item.dragging) {
          item.el.style.transition = '';
          item.el.style.animation = `cat-float ${(1.8 + Math.random() * .7).toFixed(2)}s ease-in-out infinite`;
        }
      }, 300);
      if (state !== 'sleep') {
        targetX = item.x - CW / 2;
        if (state !== 'run') go('run');
      }
    }
  }

  /* ── Hearts ── */
  function hearts(arr) {
    arr.forEach((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.cssText = `position:absolute;left:${4 + i * 18}px;bottom:0;font-size:14px;animation:cat-heart 1.1s ease-out forwards;pointer-events:none;`;
      heartWrap.appendChild(s);
      setTimeout(() => s.remove(), 1100);
    });
  }

  /* ── Zzz while sleeping ── */
  let zzzTimer = 0;
  function zzz(dt) {
    zzzTimer -= dt;
    if (zzzTimer > 0) return;
    zzzTimer = 1400;
    const s = document.createElement('span');
    s.textContent = 'z';
    s.style.cssText = `position:absolute;left:${34 + Math.random() * 10}px;bottom:0;font-size:12px;color:#8b949e;animation:cat-heart 1.6s ease-out forwards;pointer-events:none;`;
    heartWrap.appendChild(s);
    setTimeout(() => s.remove(), 1600);
  }

  /* ── Main loop ── */
  function tick(ts) {
    const dt = lastTs ? Math.min(ts - lastTs, 50) : 16;
    lastTs = ts;

    if (!paused) {
      const W = window.innerWidth;

      if (state === 'sleep') {
        zzz(dt);
      } else if (state === 'walk' || state === 'run' || state === 'jump') {
        if (state === 'jump') {
          timer -= dt;
          if (timer <= 0) go('walk');
        }

        if (targetX !== null) {
          const dx = targetX - posX;
          const speed = state === 'run' ? 3.5 : 2.5;
          if (Math.abs(dx) < 4) { posX = targetX; targetX = null; checkEat(); }
          else { face(dx > 0 ? 1 : -1); posX += dir * Math.min(Math.abs(dx), speed * dt / 16); }
        } else if (state !== 'jump') {
          if (state === 'run') go('walk');

          // Hungrig? Dann selbst zum naechsten Futter laufen.
          if (pet.hunger > 62 && !seekItem && items.length) {
            const cx = posX + CW / 2;
            seekItem = items.reduce((a, b) =>
              Math.abs(b.x - cx) < Math.abs(a.x - cx) ? b : a);
          }
          if (seekItem && !seekItem.dragging && items.indexOf(seekItem) !== -1) {
            targetX = seekItem.x - CW / 2;
            if (state !== 'run') go('run');
          } else {
            seekItem = null;
            posX += dir * 0.9 * dt / 16;
            if (posX > W - CW) face(-1);
            if (posX < 4)      face(1);
            if (Math.random() < 0.00016) go('sit', 2500 + Math.random() * 2500);
          }
        }
      } else {
        timer -= dt;
        if (timer <= 0) go('walk');
      }

      wrapEl.style.left = posX + 'px';
      const tip = document.getElementById('cat-tip');
      if (tip && tip.style.opacity !== '0') tip.style.left = posX + 'px';
    }

    requestAnimationFrame(tick);
  }

  function checkEat() {
    const cx = posX + CW / 2;
    const near = items.find(i => !i.dragging && Math.abs(i.x - cx) < 60);
    if (near) eatFood(near);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
