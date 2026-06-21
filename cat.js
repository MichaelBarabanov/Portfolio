(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  /* ── Sprite sheet: cat/spritesheet.png ──────────────────────────────────
     256×256px per cell, displayed at 96px → background-size: 576×480px
     Row 0 = idle(4f)  Row 1 = walk(6f)  Row 2 = jump(4f)
     Row 3 = food(4f)  Row 4 = sleep(3f)                                   */
  const CELL  = 96;
  const CW    = CELL;
  const CH    = CELL;
  const BGSZ  = `${CELL * 6}px ${CELL * 5}px`;
  const SHEET = 'cat/spritesheet.png';

  // State → CSS animation config (keyframes defined in style.css)
  const A = {
    walk: { kf: 'cat-spr-walk', f: 6, dur: '0.6s',  row: 1 },
    sit:  { kf: 'cat-spr-idle', f: 4, dur: '1.4s',  row: 0 },
    eat:  { kf: 'cat-spr-food', f: 4, dur: '0.55s', row: 3 },
    jump: { kf: 'cat-spr-jump', f: 4, dur: '0.7s',  row: 2 },
  };

  // Preload sheet
  new Image().src = SHEET;

  const FOODS   = ['🐟', '🍖', '🐠', '🧀'];
  const ITEM_PX = 28;
  const floorY  = () => window.innerHeight - CH;

  /* ── State ── */
  let posX = 120, dir = 1; // sprite faces LEFT → dir 1=right needs scaleX(-1)
  let state = 'walk', timer = 0;
  let targetX = null, lastTs = 0;
  let wrapEl, sprEl, heartWrap;
  let items = [], drag = null;

  /* ── Init ── */
  function init() {
    wrapEl = document.createElement('div');
    wrapEl.id = 'site-cat';
    wrapEl.style.cssText = `position:fixed;bottom:0;left:${posX}px;z-index:9999;cursor:pointer;user-select:none;width:${CW}px;height:${CH}px;`;

    sprEl = document.createElement('div');
    sprEl.style.cssText =
      `width:${CW}px;height:${CH}px;` +
      `background-image:url('${SHEET}');background-size:${BGSZ};` +
      `background-repeat:no-repeat;image-rendering:pixelated;` +
      `animation-iteration-count:infinite;`;
    wrapEl.appendChild(sprEl);

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

  /* ── Sprite control ── */
  function draw() {
    const cfg = A[state] || A.walk;
    sprEl.style.backgroundPositionY = (cfg.row * -CELL) + 'px';
    // Set all animation props atomically to avoid partial-update flicker
    sprEl.style.animation = `${cfg.kf} ${cfg.dur} steps(${cfg.f}) infinite`;
    sprEl.style.transform = dir === 1 ? 'scaleX(-1)' : '';
  }

  // Change direction without restarting the current animation
  function face(d) {
    if (d !== dir) { dir = d; sprEl.style.transform = d === 1 ? 'scaleX(-1)' : ''; }
  }

  function go(s, dur) { state = s; timer = dur || 0; draw(); }

  /* ── Food spawn ── */
  function spawnFood() {
    const e = FOODS[Math.floor(Math.random() * FOODS.length)];
    const margin = 80;
    const fx = margin + Math.random() * (window.innerWidth - margin * 2);
    const fy = window.innerHeight - ITEM_PX - 10;
    const el = document.createElement('div');
    el.textContent = e;
    el.style.cssText = `position:fixed;left:${fx - ITEM_PX/2}px;top:${fy}px;font-size:${ITEM_PX}px;cursor:grab;z-index:9998;user-select:none;` +
      `filter:drop-shadow(0 0 5px rgba(47,129,247,.5));` +
      `animation:cat-float ${(1.8 + Math.random() * .7).toFixed(2)}s ease-in-out infinite;` +
      `animation-delay:${(Math.random() * 2).toFixed(2)}s;transition:filter .15s;`;
    const item = { el, x: fx, y: fy + ITEM_PX / 2, dragging: false };
    items.push(item);
    document.body.appendChild(el);
    el.addEventListener('mousedown', e => { e.preventDefault(); startDrag(item, e); });
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
    drag = { item, ox: e.clientX - (item.x - ITEM_PX/2), oy: e.clientY - (item.y - ITEM_PX/2) };
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
    item.x = e.clientX - drag.ox + ITEM_PX / 2;
    item.y = e.clientY - drag.oy + ITEM_PX / 2;
    const cx = posX + CW / 2;
    if (Math.abs(item.x - cx) < 200) {
      face(item.x < cx ? -1 : 1);
      if (item.y < floorY() - 20) {
        if (state !== 'jump') go('jump', 650);
      } else if (state !== 'eat') {
        targetX = item.x - CW / 2;
        if (state !== 'walk') go('walk');
      }
    }
  }

  function onUp() {
    if (!drag) return;
    const { item } = drag;
    drag = null;
    item.dragging = false;
    item.el.style.cursor = 'grab';
    item.el.style.zIndex = '9998';
    item.el.style.filter = 'drop-shadow(0 0 5px rgba(47,129,247,.5))';
    if (Math.hypot(item.x - (posX + CW/2), item.y - (floorY() + CH/2)) < 75) {
      eatFood(item);
    } else {
      const ny = window.innerHeight - ITEM_PX - 10;
      item.el.style.transition = 'top .28s ease-in';
      item.el.style.top = ny + 'px';
      item.y = ny + ITEM_PX / 2;
      setTimeout(() => {
        if (!item.dragging) {
          item.el.style.transition = '';
          item.el.style.animation = `cat-float ${(1.8 + Math.random() * .7).toFixed(2)}s ease-in-out infinite`;
        }
      }, 300);
      targetX = item.x - CW / 2;
      if (state !== 'walk') go('walk');
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

    if (state === 'walk') {
      if (targetX !== null) {
        const dx = targetX - posX;
        if (Math.abs(dx) < 4) { posX = targetX; targetX = null; checkEat(); }
        else { face(dx > 0 ? 1 : -1); posX += dir * Math.min(Math.abs(dx), 2.5 * dt / 16); }
      } else {
        posX += dir * 0.9 * dt / 16;
        if (posX > W - CW) face(-1);
        if (posX < 4)      face(1);
        if (Math.random() < 0.00016) go('sit', 2500 + Math.random() * 2500);
      }
    } else if (state === 'jump') {
      wrapEl.style.marginBottom = (Math.sin((1 - timer / 650) * Math.PI) * 22) + 'px';
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
    const cx = posX + CW / 2;
    const near = items.find(i => !i.dragging && Math.abs(i.x - cx) < 60);
    if (near) eatFood(near);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
