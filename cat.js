(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  /* ── Sprite dimensions (must match gen_cat_sprites.js) ── */
  const CW = 80;  // 20 grid cols × 4px
  const CH = 48;  // 12 grid rows × 4px
  const ITEM_PX = 28;
  const BASE = 'cat/';

  const SRCS = {
    wa:   BASE + 'walk_a.png',
    wb:   BASE + 'walk_b.png',
    sit:  BASE + 'sit.png',
    eat:  BASE + 'eat.png',
    jump: BASE + 'jump.png',
  };

  // Preload all sprites so swaps are instant
  Object.values(SRCS).forEach(src => { const i = new Image(); i.src = src; });

  const floorTop = () => window.innerHeight - CH;

  /* ── Foods ── */
  const FOODS = ['🐟','🍖','🐠','🧀'];

  /* ── State ── */
  let posX = 120, dir = 1;
  let state = 'walk', timer = 0;
  let frame = 0, frameTick = 0;
  let targetX = null, lastTs = 0;
  let wrapEl, imgEl, heartWrap;
  let items = [], drag = null;

  /* ── Init ── */
  function init() {
    wrapEl = document.createElement('div');
    wrapEl.id = 'site-cat';
    wrapEl.style.cssText = `position:fixed;bottom:0;left:${posX}px;z-index:9999;cursor:pointer;user-select:none;width:${CW}px;height:${CH}px;`;

    imgEl = document.createElement('img');
    imgEl.src = SRCS.wa;
    imgEl.style.cssText = `width:${CW}px;height:${CH}px;image-rendering:pixelated;display:block;`;
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

    wrapEl.addEventListener('mouseenter', () => { tip.style.opacity='1'; tip.style.left=posX+'px'; });
    wrapEl.addEventListener('mouseleave', () => { tip.style.opacity='0'; });
    wrapEl.addEventListener('click', () => { if (state==='walk') { go('sit',2200); hearts(['💙']); } });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    draw();
    spawnFood();
    setTimeout(spawnFood, 1800);
    requestAnimationFrame(tick);
  }

  /* ── Drawing ── */
  function draw() {
    const k = state==='eat' ? 'eat' : state==='sit' ? 'sit' : state==='jump' ? 'jump' : frame ? 'wb' : 'wa';
    imgEl.src = SRCS[k];
    imgEl.style.transform = dir === -1 ? 'scaleX(-1)' : '';
  }

  function face(d) { if (d !== dir) { dir = d; draw(); } }
  function go(s, dur) { state = s; timer = dur || 0; draw(); }

  /* ── Food ── */
  function spawnFood() {
    const e = FOODS[Math.floor(Math.random() * FOODS.length)];
    const margin = 80;
    const fx = margin + Math.random() * (window.innerWidth - margin * 2);
    const fy = window.innerHeight - ITEM_PX - 10;
    const el = document.createElement('div');
    el.textContent = e;
    el.style.cssText = `position:fixed;left:${fx-ITEM_PX/2}px;top:${fy}px;font-size:${ITEM_PX}px;cursor:grab;z-index:9998;user-select:none;filter:drop-shadow(0 0 5px rgba(47,129,247,.5));animation:cat-float ${1.8+Math.random()*.7}s ease-in-out infinite;animation-delay:${(Math.random()*2).toFixed(2)}s;transition:filter .15s;`;
    const item = { el, x: fx, y: fy + ITEM_PX/2, dragging: false };
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
    hearts(['❤️','✨','😻']);
    setTimeout(spawnFood, 3000);
  }

  /* ── Drag ── */
  function startDrag(item, e) {
    drag = { item, ox: e.clientX-(item.x-ITEM_PX/2), oy: e.clientY-(item.y-ITEM_PX/2) };
    item.dragging = true;
    item.el.style.cursor='grabbing'; item.el.style.animation='none';
    item.el.style.zIndex='10001'; item.el.style.transition='';
    item.el.style.filter='drop-shadow(0 0 10px rgba(255,180,50,.9))';
  }

  function onMove(e) {
    if (!drag) return;
    const { item } = drag;
    item.el.style.left = (e.clientX-drag.ox)+'px';
    item.el.style.top  = (e.clientY-drag.oy)+'px';
    item.x = e.clientX-drag.ox+ITEM_PX/2;
    item.y = e.clientY-drag.oy+ITEM_PX/2;
    const cx = posX+CW/2;
    if (Math.abs(item.x-cx) < 200) {
      face(item.x < cx ? -1 : 1);
      if (item.y < floorTop()-15) {
        if (state !== 'jump') go('jump', 650);
      } else if (state !== 'eat') {
        targetX = item.x-CW/2;
        if (state !== 'walk') go('walk');
      }
    }
  }

  function onUp() {
    if (!drag) return;
    const { item } = drag;
    drag = null; item.dragging = false;
    item.el.style.cursor='grab'; item.el.style.zIndex='9998';
    item.el.style.filter='drop-shadow(0 0 5px rgba(47,129,247,.5))';
    if (Math.hypot(item.x-(posX+CW/2), item.y-(floorTop()+CH/2)) < 72) {
      eatFood(item);
    } else {
      const ny = window.innerHeight-ITEM_PX-10;
      item.el.style.transition='top .28s ease-in';
      item.el.style.top = ny+'px';
      item.y = ny+ITEM_PX/2;
      setTimeout(() => {
        if (!item.dragging) { item.el.style.transition=''; item.el.style.animation=`cat-float ${1.8+Math.random()*.7}s ease-in-out infinite`; }
      }, 300);
      targetX = item.x-CW/2;
      if (state !== 'walk') go('walk');
    }
  }

  /* ── Hearts ── */
  function hearts(arr) {
    arr.forEach((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.cssText = `position:absolute;left:${4+i*18}px;bottom:0;font-size:14px;animation:cat-heart 1.1s ease-out forwards;pointer-events:none;`;
      heartWrap.appendChild(s);
      setTimeout(() => s.remove(), 1100);
    });
  }

  /* ── Tick ── */
  function tick(ts) {
    const dt = Math.min(ts-lastTs, 50);
    lastTs = ts;
    const W = window.innerWidth;

    frameTick += dt;
    if (frameTick > 160 && state === 'walk') {
      frameTick = 0; frame = 1-frame; draw();
      wrapEl.style.marginBottom = frame ? '3px' : '0';
    }

    if (state === 'walk') {
      if (targetX !== null) {
        const dx = targetX-posX;
        if (Math.abs(dx) < 4) { posX = targetX; targetX = null; checkEat(); }
        else { face(dx>0?1:-1); posX += dir*Math.min(Math.abs(dx), 2.5*dt/16); }
      } else {
        posX += dir*0.95*dt/16;
        if (posX > W-CW) face(-1);
        if (posX < 4)    face(1);
        if (Math.random() < 0.00016) go('sit', 2500+Math.random()*2500);
      }
    } else if (state === 'jump') {
      wrapEl.style.marginBottom = (Math.sin((1-timer/650)*Math.PI)*20)+'px';
      timer -= dt;
      if (timer <= 0) { wrapEl.style.marginBottom='0'; go('walk'); }
    } else {
      timer -= dt;
      if (timer <= 0) { wrapEl.style.marginBottom='0'; go('walk'); }
    }

    wrapEl.style.left = posX+'px';
    const tip = document.getElementById('cat-tip');
    if (tip && tip.style.opacity!=='0') tip.style.left = posX+'px';
    requestAnimationFrame(tick);
  }

  function checkEat() {
    const cx = posX+CW/2;
    const near = items.find(i => !i.dragging && Math.abs(i.x-cx) < 56);
    if (near) eatFood(near);
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
