(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const CW = 68, CH = 68;
  const BASE = 'cat_animation/';
  const SRCS = {
    walk_r: BASE + 'Walking_Right.gif',
    walk_l: BASE + 'Walking_Left.gif',
    run_r:  BASE + 'Running_Right.gif',
    run_l:  BASE + 'Running_Left.gif',
  };
  Object.values(SRCS).forEach(src => { new Image().src = src; });

  /* ── Pixel-art food definitions (8×8 grid, scale 4 → 32×32 px) ── */
  const IW = 32, IH = 32;
  const PIXEL_FOODS = [
    { // fish (blue-silver, tail on left, eye on right)
      w:8, h:8, s:4,
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
    { // cheese wedge (yellow, triangle with holes)
      w:8, h:8, s:4,
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
    { // drumstick / meat on bone
      w:8, h:8, s:4,
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
    { // tropical fish (orange, white stripe, clownfish-ish)
      w:8, h:8, s:4,
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

  const floorY = () => window.innerHeight - CH;

  let posX = 120, dir = 1;
  let state = 'walk', timer = 0;
  let targetX = null, lastTs = 0;
  let wrapEl, imgEl, heartWrap;
  let items = [], drag = null;

  function srcFor(s, d) {
    if (s === 'run') return d === 1 ? SRCS.run_r : SRCS.run_l;
    return d === 1 ? SRCS.walk_r : SRCS.walk_l;
  }

  function draw() {
    const want = srcFor(state, dir);
    if (!imgEl.src.endsWith(want)) imgEl.src = want;
  }

  function face(d) { if (d !== dir) { dir = d; draw(); } }
  function go(s, dur) { state = s; timer = dur || 0; draw(); }

  /* ── Init ── */
  function init() {
    wrapEl = document.createElement('div');
    wrapEl.id = 'site-cat';
    wrapEl.style.cssText = `position:fixed;bottom:0;left:${posX}px;z-index:9999;cursor:pointer;user-select:none;width:${CW}px;height:${CH}px;`;

    imgEl = document.createElement('img');
    imgEl.src = SRCS.walk_r;
    imgEl.width = CW;
    imgEl.height = CH;
    imgEl.style.cssText = 'display:block;image-rendering:pixelated;';
    wrapEl.appendChild(imgEl);

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
    wrapEl.addEventListener('click', () => { if (state === 'walk' || state === 'run') { go('sit', 2200); hearts(['💙']); } });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    draw();
    spawnFood();
    setTimeout(spawnFood, 1800);
    requestAnimationFrame(tick);
  }

  /* ── Food ── */
  function spawnFood() {
    const data = PIXEL_FOODS[Math.floor(Math.random() * PIXEL_FOODS.length)];
    const margin = 80;
    const fx = margin + Math.random() * (window.innerWidth - margin * 2);
    const fy = window.innerHeight - IH - 10;

    const el = document.createElement('div');
    el.style.cssText =
      `position:fixed;left:${fx - IW/2}px;top:${fy}px;` +
      `width:${IW}px;height:${IH}px;cursor:grab;z-index:9998;user-select:none;` +
      `filter:drop-shadow(0 0 4px rgba(47,129,247,.6));` +
      `animation:cat-float ${(1.8 + Math.random() * .7).toFixed(2)}s ease-in-out infinite;` +
      `animation-delay:${(Math.random() * 2).toFixed(2)}s;transition:filter .15s;`;

    el.appendChild(makeFoodEl(data));

    const item = { el, x: fx, y: fy + IH / 2, dragging: false };
    items.push(item);
    document.body.appendChild(el);
    el.addEventListener('mousedown', ev => { ev.preventDefault(); startDrag(item, ev); });
  }

  function killFood(item, animate) {
    const i = items.indexOf(item);
    if (i === -1) return;
    items.splice(i, 1);
    if (animate) {
      item.el.style.transition = 'opacity .25s,transform .25s';
      item.el.style.opacity = '0';
      item.el.style.transform = 'scale(0.1)';
      setTimeout(() => item.el.remove(), 280);
    } else item.el.remove();
  }

  function eatFood(item) {
    killFood(item, true);
    go('eat', 1600);
    hearts(['❤️', '✨', '😻']);
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
  }

  function onMove(e) {
    if (!drag) return;
    const { item } = drag;
    item.el.style.left = (e.clientX - drag.ox) + 'px';
    item.el.style.top  = (e.clientY - drag.oy) + 'px';
    item.x = e.clientX - drag.ox + IW / 2;
    item.y = e.clientY - drag.oy + IH / 2;
    const cx = posX + CW / 2;
    if (Math.abs(item.x - cx) < 220 && state !== 'eat') {
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
      targetX = item.x - CW / 2;
      if (state !== 'run') go('run');
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

  /* ── Main loop ── */
  function tick(ts) {
    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts;
    const W = window.innerWidth;

    if (state === 'walk' || state === 'run') {
      if (targetX !== null) {
        const dx = targetX - posX;
        const speed = state === 'run' ? 3.5 : 2.5;
        if (Math.abs(dx) < 4) { posX = targetX; targetX = null; checkEat(); }
        else { face(dx > 0 ? 1 : -1); posX += dir * Math.min(Math.abs(dx), speed * dt / 16); }
      } else {
        if (state === 'run') go('walk');
        posX += dir * 0.9 * dt / 16;
        if (posX > W - CW) face(-1);
        if (posX < 4)      face(1);
        if (Math.random() < 0.00016) go('sit', 2500 + Math.random() * 2500);
      }
    } else {
      timer -= dt;
      if (timer <= 0) go('walk');
    }

    wrapEl.style.left = posX + 'px';
    const tip = document.getElementById('cat-tip');
    if (tip && tip.style.opacity !== '0') tip.style.left = posX + 'px';
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
