(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  /* ── Canvas pixel renderer ─────────────────────
     Uses a <canvas> directly → no img-src CSP needed  */
  const SC = 4; // px per grid cell  →  64 × 52 cat
  // Palette: 0=transp 1=orange 2=dark-brown 3=outline 4=belly/cream 5=pink 6=eye-white
  const PAL = [null,'#D07028','#7A3C10','#1A0800','#F0D090','#FF88AA','#FFF8F0'];

  /* ── Sprite grids (16 w × 13 h) ────────────────
     Cat faces RIGHT. Tail on LEFT, head on RIGHT.     */

  //                   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
  const WA = [
    /* r0  ear tips */ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
    /* r1  ears     */ [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 1, 3, 0, 0],
    /* r2  head top */ [0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 5, 1, 5, 1, 3, 0],
    /* r3  eyes     */ [0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 1, 3, 1, 1, 3],
    /* r4  muzzle   */ [3, 3, 0, 0, 0, 0, 0, 3, 1, 1, 1, 5, 1, 1, 1, 3],
    /* r5  nose/chin*/ [3, 1, 3, 3, 3, 3, 3, 2, 1, 1, 3, 1, 1, 1, 1, 3],
    /* r6  body+tail*/ [0, 3, 1, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 3, 0],
    /* r7  body     */ [0, 0, 3, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0],
    /* r8  belly    */ [0, 0, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0],
    /* r9  legs A   */ [0, 0, 0, 3, 3, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0],
    /* r10 shins    */ [0, 0, 0, 3, 1, 3, 3, 1, 3, 0, 0, 0, 0, 0, 0, 0],
    /* r11 paws     */ [0, 0, 0, 3, 3, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0],
    /* r12 empty    */ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const WB = [                                           // legs alternate
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 1, 3, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 5, 1, 5, 1, 3, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 1, 3, 1, 1, 3],
    [3, 3, 0, 0, 0, 0, 0, 3, 1, 1, 1, 5, 1, 1, 1, 3],
    [3, 1, 3, 3, 3, 3, 3, 2, 1, 1, 3, 1, 1, 1, 1, 3],
    [0, 3, 1, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 3, 0],
    [0, 0, 3, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0],
    [0, 0, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0],
    [0, 0, 0, 0, 3, 3, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0], // shifted
    [0, 0, 0, 0, 3, 1, 3, 3, 1, 3, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 3, 3, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const ST = [                                           // sitting, ^^ eyes, paws flat
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 1, 3, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 5, 1, 5, 1, 3, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 1, 3], // ^^ closed eyes
    [0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 5, 1, 1, 1, 3],
    [0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 3, 1, 1, 1, 3, 0],
    [0, 0, 0, 0, 0, 3, 1, 1, 4, 4, 4, 4, 1, 1, 3, 0],
    [0, 0, 0, 0, 3, 1, 1, 1, 4, 4, 4, 4, 1, 1, 3, 0],
    [0, 0, 0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0],
    [0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0], // flat paws
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0], // tail curl
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const ET = [                                           // eating: ^_^ eyes, open mouth
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 1, 3, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 5, 1, 5, 1, 3, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3], // wide ^_^ eyes
    [0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 1, 5, 1, 1, 1, 3],
    [0, 0, 0, 0, 0, 0, 3, 1, 1, 3, 5, 5, 3, 1, 1, 3], // open mouth + tongue
    [0, 0, 0, 0, 0, 3, 1, 1, 4, 4, 4, 4, 1, 1, 3, 0],
    [0, 0, 0, 0, 3, 1, 1, 1, 4, 4, 4, 4, 1, 1, 3, 0],
    [0, 0, 0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0],
    [0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const JP = [                                           // jump: legs spread wide
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 1, 3, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 5, 1, 5, 1, 3, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 3, 1, 3, 1, 1, 3],
    [3, 3, 0, 0, 0, 0, 0, 3, 1, 1, 1, 5, 1, 1, 1, 3],
    [3, 1, 3, 3, 3, 3, 3, 2, 1, 1, 3, 1, 1, 1, 1, 3],
    [0, 3, 1, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 3, 0],
    [0, 0, 3, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0],
    [3, 0, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0, 3], // legs wide
    [3, 3, 0, 3, 3, 0, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  const GRIDS = { wa: WA, wb: WB, sit: ST, eat: ET, jump: JP };

  /* ── Dimensions ──────────────────────────────── */
  const GW = 16, GH = 13;
  const CW = GW * SC;   // 64 px
  const CH = GH * SC;   // 52 px
  const ITEM_PX = 28;
  const floorTop = () => window.innerHeight - CH;

  /* ── Foods ───────────────────────────────────── */
  const FOODS = [
    { e: '🐟', n: 'Fisch' },
    { e: '🍖', n: 'Leckerli' },
    { e: '🐠', n: 'Tropenfisch' },
    { e: '🧀', n: 'Käse' },
  ];

  /* ── State ───────────────────────────────────── */
  let posX = 120, dir = 1;
  let state = 'walk', timer = 0;
  let frame = 0, frameTick = 0;
  let targetX = null, lastTs = 0;
  let wrapEl, cv, ctx, heartWrap;
  let items = [], drag = null;

  /* ── Init ────────────────────────────────────── */
  function init() {
    wrapEl = document.createElement('div');
    wrapEl.id = 'site-cat';
    wrapEl.style.cssText = `position:fixed;bottom:0;left:120px;z-index:9999;cursor:pointer;user-select:none;width:${CW}px;height:${CH}px;`;

    // Canvas — no img-src CSP issue, pixel art drawn directly
    cv = document.createElement('canvas');
    cv.width = CW; cv.height = CH;
    cv.style.cssText = `display:block;image-rendering:pixelated;`;
    ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    wrapEl.appendChild(cv);

    heartWrap = document.createElement('div');
    heartWrap.style.cssText = `position:absolute;bottom:${CH}px;left:0;width:${CW}px;pointer-events:none;`;
    wrapEl.appendChild(heartWrap);

    document.body.appendChild(wrapEl);

    const tip = document.createElement('div');
    tip.id = 'cat-tip';
    tip.style.cssText = `position:fixed;bottom:${CH+8}px;font-family:monospace;font-size:11px;background:#161b22;color:#e6edf3;padding:4px 10px;border-radius:4px;border:1px solid #30363d;pointer-events:none;opacity:0;transition:opacity .2s;z-index:10000;white-space:nowrap;`;
    tip.textContent = '🐱 Items auf mich ziehen!';
    document.body.appendChild(tip);

    wrapEl.addEventListener('mouseenter', () => { tip.style.opacity = '1'; tip.style.left = posX + 'px'; });
    wrapEl.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
    wrapEl.addEventListener('click', () => { if (state === 'walk') { go('sit', 2200); hearts(['💙']); } });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    draw();
    spawnFood();
    setTimeout(spawnFood, 1800);
    requestAnimationFrame(tick);
  }

  /* ── Draw sprite to canvas ───────────────────── */
  function draw() {
    const key = state === 'eat' ? 'eat' : state === 'sit' ? 'sit' : state === 'jump' ? 'jump' : frame ? 'wb' : 'wa';
    const g = GRIDS[key];
    ctx.clearRect(0, 0, CW, CH);
    ctx.save();
    if (dir === -1) { ctx.translate(CW, 0); ctx.scale(-1, 1); }
    for (let y = 0; y < GH; y++)
      for (let x = 0; x < GW; x++) {
        const c = PAL[g[y][x]];
        if (c) { ctx.fillStyle = c; ctx.fillRect(x*SC, y*SC, SC, SC); }
      }
    ctx.restore();
  }

  function face(d) { if (d !== dir) { dir = d; draw(); } }
  function go(s, dur) { state = s; timer = dur || 0; draw(); }

  /* ── Food ────────────────────────────────────── */
  function spawnFood() {
    const f = FOODS[Math.floor(Math.random() * FOODS.length)];
    const margin = 80;
    const fx = margin + Math.random() * (window.innerWidth - margin * 2);
    const fy = window.innerHeight - ITEM_PX - 10;
    const el = document.createElement('div');
    el.textContent = f.e;
    el.title = f.n + ' – ziehen zum Füttern!';
    el.style.cssText = `position:fixed;left:${fx-ITEM_PX/2}px;top:${fy}px;font-size:${ITEM_PX}px;cursor:grab;z-index:9998;user-select:none;filter:drop-shadow(0 0 5px rgba(47,129,247,.5));animation:cat-float ${1.8+Math.random()*.7}s ease-in-out infinite;animation-delay:${(Math.random()*2).toFixed(2)}s;transition:filter .15s;`;
    const item = { el, x: fx, y: fy + ITEM_PX/2, dragging: false };
    items.push(item);
    document.body.appendChild(el);
    el.addEventListener('mousedown', e => { e.preventDefault(); startDrag(item, e); });
  }

  function killFood(item, fx) {
    const i = items.indexOf(item);
    if (i === -1) return;
    items.splice(i, 1);
    if (fx) {
      item.el.style.transition = 'opacity .25s,transform .25s';
      item.el.style.opacity = '0'; item.el.style.transform = 'scale(0.1)';
      setTimeout(() => item.el.remove(), 280);
    } else item.el.remove();
  }

  function eatFood(item) {
    killFood(item, true);
    go('eat', 1600);
    hearts(['❤️', '✨', '😻']);
    setTimeout(spawnFood, 3000);
  }

  /* ── Drag & Drop ─────────────────────────────── */
  function startDrag(item, e) {
    drag = { item, ox: e.clientX - (item.x - ITEM_PX/2), oy: e.clientY - (item.y - ITEM_PX/2) };
    item.dragging = true;
    item.el.style.cursor = 'grabbing'; item.el.style.animation = 'none';
    item.el.style.zIndex = '10001'; item.el.style.transition = '';
    item.el.style.filter = 'drop-shadow(0 0 10px rgba(255,180,50,.9))';
  }

  function onMove(e) {
    if (!drag) return;
    const { item } = drag;
    item.el.style.left = (e.clientX - drag.ox) + 'px';
    item.el.style.top  = (e.clientY - drag.oy) + 'px';
    item.x = e.clientX - drag.ox + ITEM_PX/2;
    item.y = e.clientY - drag.oy + ITEM_PX/2;
    const catCX = posX + CW/2;
    if (Math.abs(item.x - catCX) < 190) {
      face(item.x < catCX ? -1 : 1);
      if (item.y < floorTop() - 15) {
        if (state !== 'jump') go('jump', 650);
      } else if (state !== 'eat') {
        targetX = item.x - CW/2;
        if (state !== 'walk') go('walk');
      }
    }
  }

  function onUp(e) {
    if (!drag) return;
    const { item } = drag;
    drag = null; item.dragging = false;
    item.el.style.cursor = 'grab'; item.el.style.zIndex = '9998';
    item.el.style.filter = 'drop-shadow(0 0 5px rgba(47,129,247,.5))';
    if (Math.hypot(item.x - (posX+CW/2), item.y - (floorTop()+CH/2)) < 70) {
      eatFood(item);
    } else {
      const newTop = window.innerHeight - ITEM_PX - 10;
      item.el.style.transition = 'top .28s ease-in';
      item.el.style.top = newTop + 'px';
      item.y = newTop + ITEM_PX/2;
      setTimeout(() => {
        if (!item.dragging) { item.el.style.transition = ''; item.el.style.animation = `cat-float ${1.8+Math.random()*.7}s ease-in-out infinite`; }
      }, 300);
      targetX = item.x - CW/2;
      if (state !== 'walk') go('walk');
    }
  }

  /* ── Hearts ──────────────────────────────────── */
  function hearts(arr) {
    arr.forEach((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.cssText = `position:absolute;left:${4+i*18}px;bottom:0;font-size:14px;animation:cat-heart 1.1s ease-out forwards;pointer-events:none;`;
      heartWrap.appendChild(s);
      setTimeout(() => s.remove(), 1100);
    });
  }

  /* ── Main loop ───────────────────────────────── */
  function tick(ts) {
    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts;
    const W = window.innerWidth;

    frameTick += dt;
    if (frameTick > 160 && state === 'walk') {
      frameTick = 0; frame = 1 - frame; draw();
      wrapEl.style.marginBottom = frame ? '3px' : '0';
    }

    if (state === 'walk') {
      if (targetX !== null) {
        const dx = targetX - posX;
        if (Math.abs(dx) < 4) { posX = targetX; targetX = null; checkEat(); }
        else { face(dx > 0 ? 1 : -1); posX += dir * Math.min(Math.abs(dx), 2.5 * dt/16); }
      } else {
        posX += dir * 0.95 * dt/16;
        if (posX > W - CW) face(-1);
        if (posX < 4)      face(1);
        if (Math.random() < 0.00016) go('sit', 2500 + Math.random()*2500);
      }
    } else if (state === 'jump') {
      wrapEl.style.marginBottom = (Math.sin((1 - timer/650) * Math.PI) * 20) + 'px';
      timer -= dt;
      if (timer <= 0) { wrapEl.style.marginBottom = '0'; go('walk'); }
    } else {
      timer -= dt;
      if (timer <= 0) { wrapEl.style.marginBottom = '0'; go('walk'); }
    }

    wrapEl.style.left = posX + 'px';
    const tip = document.getElementById('cat-tip');
    if (tip && tip.style.opacity !== '0') tip.style.left = posX + 'px';
    requestAnimationFrame(tick);
  }

  function checkEat() {
    const cx = posX + CW/2;
    const near = items.find(i => !i.dragging && Math.abs(i.x - cx) < 56);
    if (near) eatFood(near);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
