(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  /* ── Pixel art renderer ─────────────────────── */
  const S = 5; // px per grid cell → 60×50 cat
  const PAL = [null, '#C0C8D0', '#8090A0', '#1A202C', '#F9A8D4'];
  // 0=transparent  1=body-gray  2=stripe/shadow  3=outline  4=pink

  function makeSVG(grid) {
    const rows = grid.length, cols = grid[0].length;
    let r = '';
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const c = PAL[grid[y][x]];
        if (c) r += `<rect x="${x*S}" y="${y*S}" width="${S}" height="${S}" fill="${c}"/>`;
      }
    return `<svg width="${cols*S}" height="${rows*S}" viewBox="0 0 ${cols*S} ${rows*S}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">${r}</svg>`;
  }

  /* ── Sprite grids (12 × 10) ─────────────────── */
  const W1 = [                                     // walk frame A
    [0,0,3,0,0,0,0,0,3,0,0,0],                    // ear tips
    [0,3,4,3,0,0,0,3,1,3,0,0],                    // ears
    [3,1,1,1,3,3,3,1,1,1,3,0],                    // head top
    [3,1,3,1,1,3,1,1,3,1,1,3],                    // eyes (col 2, 8) + outline
    [3,1,1,4,1,1,1,1,1,1,1,3],                    // nose
    [0,3,1,1,1,1,1,1,1,1,3,3],                    // body + tail start
    [0,3,2,1,1,1,1,2,1,1,1,3],                    // body stripes
    [0,3,1,1,1,1,1,1,1,3,0,0],                    // body bottom
    [0,0,3,1,3,0,3,1,3,0,0,0],                    // legs A
    [0,0,3,3,0,0,3,3,0,0,0,0],                    // paws
  ];
  const W2 = [                                     // walk frame B (legs offset)
    [0,0,3,0,0,0,0,0,3,0,0,0],
    [0,3,4,3,0,0,0,3,1,3,0,0],
    [3,1,1,1,3,3,3,1,1,1,3,0],
    [3,1,3,1,1,3,1,1,3,1,1,3],
    [3,1,1,4,1,1,1,1,1,1,1,3],
    [0,3,1,1,1,1,1,1,1,1,3,3],
    [0,3,2,1,1,1,1,2,1,1,1,3],
    [0,3,1,1,1,1,1,1,1,3,0,0],
    [0,0,0,3,1,3,0,0,3,1,3,0],                    // legs B
    [0,0,0,3,3,0,0,0,3,3,0,0],
  ];
  const SIT = [                                    // sitting / idle
    [0,0,3,0,0,0,0,0,3,0,0,0],
    [0,3,4,3,0,0,0,3,1,3,0,0],
    [3,1,1,1,3,3,3,1,1,1,3,0],
    [3,1,3,3,1,1,1,1,3,3,1,3],                    // ^^ happy eyes (arc)
    [3,1,1,4,1,1,1,1,1,1,1,3],
    [0,3,1,1,1,1,1,1,1,3,0,0],
    [0,3,1,1,1,1,1,1,1,1,3,3],
    [0,3,1,1,1,1,1,1,1,1,1,3],
    [0,3,3,3,3,3,3,3,3,3,3,0],                    // sitting paws
    [0,0,0,0,0,0,0,0,0,0,0,0],
  ];
  const EAT = [                                    // eating / happy
    [0,0,3,0,0,0,0,0,3,0,0,0],
    [0,3,4,3,0,0,0,3,1,3,0,0],
    [3,1,1,1,3,3,3,1,1,1,3,0],
    [3,3,3,3,1,1,1,1,3,3,3,3],                    // ^_^ eyes
    [3,1,1,4,1,1,1,1,1,1,1,3],
    [3,1,3,4,4,3,3,4,4,3,1,3],                    // open mouth / tongue
    [0,3,2,1,1,1,1,2,1,1,1,3],
    [0,3,1,1,1,1,1,1,1,1,3,0],
    [0,3,3,3,3,3,3,3,3,3,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
  ];
  const JMP = [                                    // jumping / reaching up
    [0,0,3,0,0,0,0,0,3,0,0,0],
    [0,3,4,3,0,0,0,3,1,3,0,0],
    [3,1,1,1,3,3,3,1,1,1,3,0],
    [3,1,3,1,1,3,1,1,3,1,1,3],
    [3,1,1,4,1,1,1,1,1,1,1,3],
    [0,3,1,1,1,1,1,1,1,1,3,3],
    [0,3,2,1,1,1,1,2,1,1,1,3],
    [0,3,1,1,1,1,1,1,1,3,0,0],
    [3,0,3,1,3,0,0,0,3,1,0,3],                    // legs spread (mid-air)
    [3,3,0,3,3,0,0,0,3,3,0,3],
  ];

  const SVGS = { w1: makeSVG(W1), w2: makeSVG(W2), sit: makeSVG(SIT), eat: makeSVG(EAT), jump: makeSVG(JMP) };

  /* ── Config ─────────────────────────────────── */
  const CW = 12 * S; // 60
  const CH = 10 * S; // 50
  const FLOOR_TOP = () => window.innerHeight - CH; // cat top-edge y on screen

  const ITEMS_DEF = [
    { emoji: '🐟', label: 'Fisch' },
    { emoji: '🍖', label: 'Leckerli' },
    { emoji: '🐠', label: 'Tropenfisch' },
    { emoji: '🧀', label: 'Käse' },
  ];
  const ITEM_SIZE = 28;

  /* ── State ───────────────────────────────────── */
  let posX = 120, dir = 1;
  let state = 'walk', stateTimer = 0;
  let walkFrame = 0, frameTimer = 0;
  let targetX = null, lastTs = 0;
  let jumpY = 0;
  let catEl, svgWrap, heartWrap;
  let activeItems = []; // {el, x, y, def, dragging}
  let drag = null;      // {item, grabOffX, grabOffY}

  /* ── Init ───────────────────────────────────── */
  function init() {
    catEl = document.createElement('div');
    catEl.id = 'site-cat';
    catEl.style.cssText = `position:fixed;bottom:0;left:120px;z-index:9999;cursor:pointer;user-select:none;width:${CW}px;height:${CH}px;`;

    svgWrap = document.createElement('div');
    svgWrap.style.cssText = `width:${CW}px;height:${CH}px;`;
    svgWrap.innerHTML = SVGS.w1;
    catEl.appendChild(svgWrap);

    heartWrap = document.createElement('div');
    heartWrap.style.cssText = `position:absolute;bottom:${CH}px;left:0;width:${CW}px;pointer-events:none;`;
    catEl.appendChild(heartWrap);

    document.body.appendChild(catEl);

    const tip = document.createElement('div');
    tip.id = 'cat-tip';
    tip.style.cssText = `position:fixed;bottom:${CH+8}px;left:120px;font-family:monospace;font-size:11px;background:#161b22;color:#e6edf3;padding:4px 10px;border-radius:4px;border:1px solid #30363d;pointer-events:none;opacity:0;transition:opacity .2s;z-index:10000;white-space:nowrap;`;
    tip.textContent = '🐱 Items auf mich ziehen!';
    document.body.appendChild(tip);

    catEl.addEventListener('mouseenter', () => { tip.style.opacity = '1'; positionTip(); });
    catEl.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
    catEl.addEventListener('click', () => { if (state === 'walk') { setState('sit', 2200); floaters(['💙']); } });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);

    spawnItem();
    setTimeout(spawnItem, 1800);

    requestAnimationFrame(tick);
  }

  /* ── Sprite ─────────────────────────────────── */
  function setState(s, dur) {
    state = s;
    stateTimer = dur || 0;
    drawSprite();
  }

  function drawSprite() {
    const key = state === 'eat' ? 'eat' : state === 'sit' ? 'sit' : state === 'jump' ? 'jump' : walkFrame ? 'w2' : 'w1';
    svgWrap.innerHTML = SVGS[key];
    const s = svgWrap.firstElementChild;
    if (s) s.style.transform = dir === -1 ? 'scaleX(-1)' : '';
  }

  function setDir(d) {
    if (d !== dir) { dir = d; drawSprite(); }
  }

  /* ── Items ──────────────────────────────────── */
  function spawnItem() {
    const def = ITEMS_DEF[Math.floor(Math.random() * ITEMS_DEF.length)];
    const margin = 80;
    const fx = margin + Math.random() * (window.innerWidth - margin * 2);
    const fy = window.innerHeight - ITEM_SIZE - 10;

    const el = document.createElement('div');
    el.textContent = def.emoji;
    el.title = def.label + ' – ziehen zum Füttern!';
    el.style.cssText = `position:fixed;left:${fx - ITEM_SIZE/2}px;top:${fy}px;font-size:${ITEM_SIZE}px;cursor:grab;z-index:9998;user-select:none;filter:drop-shadow(0 0 5px rgba(47,129,247,.5));animation:cat-float ${1.8+Math.random()*.7}s ease-in-out infinite;animation-delay:${(Math.random()*2).toFixed(2)}s;transition:filter .15s;`;

    const item = { el, x: fx, y: fy + ITEM_SIZE/2, def, dragging: false };
    activeItems.push(item);
    document.body.appendChild(el);

    el.addEventListener('mousedown', e => { e.preventDefault(); startDrag(item, e); });
  }

  function killItem(item, withEffect) {
    const i = activeItems.indexOf(item);
    if (i === -1) return;
    activeItems.splice(i, 1);
    if (withEffect) {
      item.el.style.transition = 'opacity .25s, transform .25s';
      item.el.style.opacity = '0';
      item.el.style.transform = 'scale(0.1)';
      setTimeout(() => item.el.remove(), 280);
    } else {
      item.el.remove();
    }
  }

  function eatItem(item) {
    killItem(item, true);
    setState('eat', 1600);
    floaters(['❤️', '✨', '😻']);
    setTimeout(spawnItem, 3000); // respawn only after eating + 3s
  }

  /* ── Drag & Drop ────────────────────────────── */
  function startDrag(item, e) {
    drag = { item, offX: e.clientX - (item.x - ITEM_SIZE/2), offY: e.clientY - item.y + ITEM_SIZE/2 };
    item.dragging = true;
    item.el.style.cursor = 'grabbing';
    item.el.style.animation = 'none';
    item.el.style.zIndex = '10001';
    item.el.style.filter = 'drop-shadow(0 0 10px rgba(47,129,247,.9))';
    item.el.style.transition = '';
  }

  function onMove(e) {
    if (!drag) return;
    const { item } = drag;
    const mx = e.clientX, my = e.clientY;
    item.el.style.left = (mx - drag.offX) + 'px';
    item.el.style.top  = (my - drag.offY + ITEM_SIZE/2) + 'px';
    item.x = mx - drag.offX + ITEM_SIZE/2;
    item.y = my - drag.offY + ITEM_SIZE/2;

    const catCX = posX + CW / 2;
    const dx = Math.abs(item.x - catCX);
    const itemAboveCat = item.y < FLOOR_TOP() - 20; // item is above the cat's floor line

    if (dx < 180) {
      if (itemAboveCat && state !== 'eat') {
        // Item is above — try to jump
        if (state !== 'jump') setState('jump', 700);
        setDir(item.x < catCX ? -1 : 1);
      } else if (!itemAboveCat && (state === 'walk' || state === 'sit' || state === 'jump')) {
        // Item is at floor level — chase it
        targetX = item.x - CW / 2;
        if (state !== 'walk') setState('walk');
      }
    }
  }

  function onUp(e) {
    if (!drag) return;
    const { item } = drag;
    drag = null;
    item.dragging = false;
    item.el.style.cursor = 'grab';
    item.el.style.zIndex = '9998';
    item.el.style.filter = 'drop-shadow(0 0 5px rgba(47,129,247,.5))';

    const catCX = posX + CW / 2;
    const catCY = FLOOR_TOP() + CH / 2;
    const dist  = Math.hypot(item.x - catCX, item.y - catCY);

    if (dist < 65) {
      // Dropped directly onto cat
      eatItem(item);
    } else {
      // Settle item on the floor at drop x
      const floorTop = window.innerHeight - ITEM_SIZE - 10;
      item.el.style.transition = 'top .28s ease-in';
      item.el.style.top  = floorTop + 'px';
      item.el.style.left = (item.x - ITEM_SIZE/2) + 'px';
      item.y = floorTop + ITEM_SIZE / 2;
      setTimeout(() => {
        if (!item.dragging) {
          item.el.style.transition = '';
          item.el.style.animation = `cat-float ${1.8+Math.random()*.7}s ease-in-out infinite`;
        }
      }, 300);
      // Cat chases the dropped item
      targetX = item.x - CW / 2;
      if (state !== 'walk') setState('walk');
    }
  }

  /* ── Hearts ─────────────────────────────────── */
  function floaters(arr) {
    arr.forEach((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.cssText = `position:absolute;left:${4+i*18}px;bottom:0;font-size:14px;animation:cat-heart 1.1s ease-out forwards;pointer-events:none;`;
      heartWrap.appendChild(s);
      setTimeout(() => s.remove(), 1100);
    });
  }

  function positionTip() {
    const tip = document.getElementById('cat-tip');
    if (tip) tip.style.left = posX + 'px';
  }

  /* ── Main loop ──────────────────────────────── */
  function tick(ts) {
    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts;
    const W = window.innerWidth;

    // Walk frame toggle
    frameTimer += dt;
    if (frameTimer > 180 && (state === 'walk')) {
      frameTimer = 0;
      walkFrame = 1 - walkFrame;
      drawSprite();
    }

    if (state === 'walk') {
      if (targetX !== null) {
        const dx = targetX - posX;
        if (Math.abs(dx) < 4) {
          posX = targetX;
          targetX = null;
          checkEatProximity();
        } else {
          setDir(dx > 0 ? 1 : -1);
          posX += dir * Math.min(Math.abs(dx), 2.2 * dt / 16);
        }
      } else {
        posX += dir * 0.9 * dt / 16;
        if (posX > W - CW) setDir(-1);
        if (posX < 4)      setDir(1);
        if (Math.random() < 0.00018) setState('sit', 2200 + Math.random() * 2800);
      }
    } else if (state === 'jump') {
      // Bounce animation: use a sine wave on stateTimer
      const progress = 1 - stateTimer / 700;
      jumpY = Math.sin(progress * Math.PI) * 18;
      catEl.style.transform = `translateY(${-jumpY}px)`;
      stateTimer -= dt;
      if (stateTimer <= 0) {
        catEl.style.transform = '';
        jumpY = 0;
        setState('walk');
      }
    } else if (state === 'eat' || state === 'sit') {
      stateTimer -= dt;
      if (stateTimer <= 0) setState('walk');
    }

    catEl.style.left = posX + 'px';
    positionTip();

    requestAnimationFrame(tick);
  }

  function checkEatProximity() {
    const catCX = posX + CW / 2;
    const close = activeItems.find(i => !i.dragging && Math.abs(i.x - catCX) < 55);
    if (close) eatItem(close);
  }

  /* ── Boot ───────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
