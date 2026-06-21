(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const C = { body:'#c8ccd0', head:'#d4d8dc', ear:'#f9a8d4', dark:'#1a1a2e', wh:'#9ca3af' };

  const FRAMES = {
    walk: `<svg width="52" height="52" viewBox="0 0 48 52" xmlns="http://www.w3.org/2000/svg">
      <polygon points="9,17 15,3 21,17" fill="${C.body}"/>
      <polygon points="27,17 33,3 39,17" fill="${C.body}"/>
      <polygon points="11,16 15,7 19,16" fill="${C.ear}"/>
      <polygon points="29,16 33,7 37,16" fill="${C.ear}"/>
      <ellipse cx="24" cy="22" rx="15" ry="13" fill="${C.head}"/>
      <ellipse cx="18" cy="20" rx="2.5" ry="3" fill="${C.dark}"/>
      <ellipse cx="30" cy="20" rx="2.5" ry="3" fill="${C.dark}"/>
      <circle cx="19" cy="18.5" r="0.9" fill="white"/>
      <circle cx="31" cy="18.5" r="0.9" fill="white"/>
      <ellipse cx="24" cy="25" rx="1.5" ry="1" fill="${C.ear}"/>
      <path d="M21,27 Q24,30 27,27" fill="none" stroke="${C.wh}" stroke-width="0.8"/>
      <line x1="5" y1="23" x2="17" y2="24" stroke="${C.wh}" stroke-width="0.7" opacity=".7"/>
      <line x1="5" y1="26" x2="17" y2="26" stroke="${C.wh}" stroke-width="0.7" opacity=".7"/>
      <line x1="31" y1="24" x2="43" y2="23" stroke="${C.wh}" stroke-width="0.7" opacity=".7"/>
      <line x1="31" y1="26" x2="43" y2="26" stroke="${C.wh}" stroke-width="0.7" opacity=".7"/>
      <ellipse cx="24" cy="38" rx="12" ry="9" fill="${C.body}"/>
      <ellipse cx="15" cy="46" rx="5" ry="4" fill="${C.body}"/>
      <ellipse cx="33" cy="46" rx="5" ry="4" fill="${C.body}"/>
      <path d="M35,35 C47,30 50,42 42,46" fill="none" stroke="${C.body}" stroke-width="4" stroke-linecap="round"/>
    </svg>`,

    sit: `<svg width="52" height="52" viewBox="0 0 48 52" xmlns="http://www.w3.org/2000/svg">
      <polygon points="9,17 15,3 21,17" fill="${C.body}"/>
      <polygon points="27,17 33,3 39,17" fill="${C.body}"/>
      <polygon points="11,16 15,7 19,16" fill="${C.ear}"/>
      <polygon points="29,16 33,7 37,16" fill="${C.ear}"/>
      <ellipse cx="24" cy="22" rx="15" ry="13" fill="${C.head}"/>
      <path d="M15,19 Q18,16 21,19" fill="none" stroke="${C.dark}" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M27,19 Q30,16 33,19" fill="none" stroke="${C.dark}" stroke-width="1.8" stroke-linecap="round"/>
      <ellipse cx="24" cy="25" rx="1.5" ry="1" fill="${C.ear}"/>
      <path d="M20,27 Q24,31 28,27" fill="none" stroke="${C.wh}" stroke-width="0.8"/>
      <line x1="5" y1="23" x2="17" y2="24" stroke="${C.wh}" stroke-width="0.7" opacity=".7"/>
      <line x1="5" y1="26" x2="17" y2="26" stroke="${C.wh}" stroke-width="0.7" opacity=".7"/>
      <line x1="31" y1="24" x2="43" y2="23" stroke="${C.wh}" stroke-width="0.7" opacity=".7"/>
      <line x1="31" y1="26" x2="43" y2="26" stroke="${C.wh}" stroke-width="0.7" opacity=".7"/>
      <ellipse cx="24" cy="40" rx="13" ry="10" fill="${C.body}"/>
      <ellipse cx="15" cy="49" rx="6" ry="4.5" fill="${C.body}"/>
      <ellipse cx="33" cy="49" rx="6" ry="4.5" fill="${C.body}"/>
      <path d="M36,40 C50,36 52,52 38,51 C32,51 28,47 36,46" fill="none" stroke="${C.body}" stroke-width="4" stroke-linecap="round"/>
    </svg>`,

    eat: `<svg width="52" height="52" viewBox="0 0 48 52" xmlns="http://www.w3.org/2000/svg">
      <polygon points="9,17 15,3 21,17" fill="${C.body}"/>
      <polygon points="27,17 33,3 39,17" fill="${C.body}"/>
      <polygon points="11,16 15,7 19,16" fill="${C.ear}"/>
      <polygon points="29,16 33,7 37,16" fill="${C.ear}"/>
      <ellipse cx="24" cy="22" rx="15" ry="13" fill="${C.head}"/>
      <path d="M14,18 Q18,14 22,18" fill="none" stroke="${C.dark}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M26,18 Q30,14 34,18" fill="none" stroke="${C.dark}" stroke-width="2.2" stroke-linecap="round"/>
      <ellipse cx="24" cy="24" rx="1.5" ry="1" fill="${C.ear}"/>
      <path d="M18,27 Q24,35 30,27" fill="${C.ear}" stroke="${C.wh}" stroke-width="0.5"/>
      <ellipse cx="24" cy="31" rx="3.5" ry="2.5" fill="#f87171"/>
      <line x1="5" y1="23" x2="17" y2="24" stroke="${C.wh}" stroke-width="0.7" opacity=".7"/>
      <line x1="5" y1="26" x2="17" y2="26" stroke="${C.wh}" stroke-width="0.7" opacity=".7"/>
      <line x1="31" y1="24" x2="43" y2="23" stroke="${C.wh}" stroke-width="0.7" opacity=".7"/>
      <line x1="31" y1="26" x2="43" y2="26" stroke="${C.wh}" stroke-width="0.7" opacity=".7"/>
      <ellipse cx="24" cy="40" rx="13" ry="10" fill="${C.body}"/>
      <ellipse cx="15" cy="49" rx="6" ry="4.5" fill="${C.body}"/>
      <ellipse cx="33" cy="49" rx="6" ry="4.5" fill="${C.body}"/>
      <path d="M36,40 C50,36 52,52 38,51 C32,51 28,47 36,46" fill="none" stroke="${C.body}" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  };

  const ITEMS = [
    { emoji: '🐟', label: 'Fisch' },
    { emoji: '🍖', label: 'Leckerli' },
    { emoji: '🐠', label: 'Tropenfisch' },
    { emoji: '🧀', label: 'Käse' },
  ];

  let posX = 100, dir = 1;
  let state = 'walk', stateTimer = 0;
  let targetX = null, lastTs = 0;
  let catEl, svgWrap, svgEl, heartWrap;
  let activeItems = [];

  function init() {
    catEl = document.createElement('div');
    catEl.id = 'site-cat';
    catEl.style.cssText = 'position:fixed;bottom:0;left:100px;z-index:9999;cursor:pointer;user-select:none;width:52px;height:52px;';

    // svgWrap receives the walk-bob animation; svgEl (child SVG) receives the flip transform — no conflict
    svgWrap = document.createElement('div');
    svgWrap.style.cssText = 'width:52px;height:52px;';
    svgWrap.innerHTML = FRAMES.walk;
    svgEl = svgWrap.firstElementChild;
    svgWrap.style.animation = 'cat-bob 0.35s ease-in-out infinite';
    catEl.appendChild(svgWrap);

    heartWrap = document.createElement('div');
    heartWrap.style.cssText = 'position:absolute;bottom:52px;left:0;width:52px;pointer-events:none;';
    catEl.appendChild(heartWrap);

    document.body.appendChild(catEl);

    const tip = document.createElement('div');
    tip.id = 'cat-tip';
    tip.style.cssText = 'position:fixed;bottom:58px;left:100px;font-family:monospace;font-size:11px;background:#161b22;color:#e6edf3;padding:4px 10px;border-radius:4px;border:1px solid #30363d;pointer-events:none;opacity:0;transition:opacity .2s;z-index:10000;white-space:nowrap;';
    tip.textContent = '🐱 Füttere mich!';
    document.body.appendChild(tip);

    catEl.addEventListener('mouseenter', () => { tip.style.opacity = '1'; tip.style.left = posX + 'px'; });
    catEl.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
    catEl.addEventListener('click', () => { if (state !== 'eat') { setState('sit', 2500); floaters(['💙']); } });

    setTimeout(() => spawnItem(), 800);
    setTimeout(() => spawnItem(), 3000);
    setInterval(() => { if (activeItems.length < 3) spawnItem(); }, 12000);

    requestAnimationFrame(tick);
  }

  function setState(s, dur) {
    state = s;
    stateTimer = dur || 0;
    svgWrap.innerHTML = FRAMES[s] || FRAMES.walk;
    svgEl = svgWrap.firstElementChild;
    svgWrap.style.animation = s === 'walk' ? 'cat-bob 0.35s ease-in-out infinite' : '';
    applyDir();
  }

  function applyDir() {
    if (svgEl) svgEl.style.transform = dir === -1 ? 'scaleX(-1)' : '';
  }

  function spawnItem() {
    const def = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const margin = 70;
    const ix = margin + Math.random() * (window.innerWidth - margin * 2);

    const el = document.createElement('div');
    el.textContent = def.emoji;
    el.title = def.label + ' – klicken zum Füttern!';
    el.style.cssText = `position:fixed;bottom:10px;left:${ix}px;font-size:26px;cursor:pointer;z-index:9998;filter:drop-shadow(0 0 5px rgba(47,129,247,.4));transition:opacity .4s,transform .4s;animation:cat-float ${1.8 + Math.random() * 0.8}s ease-in-out infinite;animation-delay:${(Math.random() * 2).toFixed(2)}s;`;

    const item = { el, x: ix + 13, def };
    activeItems.push(item);
    document.body.appendChild(el);

    el.addEventListener('click', () => {
      targetX = item.x - 26;
      if (state !== 'walk') setState('walk');
    });

    setTimeout(() => removeItem(item), 25000);
  }

  function removeItem(item) {
    const i = activeItems.indexOf(item);
    if (i === -1) return;
    activeItems.splice(i, 1);
    item.el.style.opacity = '0';
    item.el.style.transform = 'scale(0.3) translateY(8px)';
    setTimeout(() => item.el.remove(), 400);
  }

  function floaters(arr) {
    arr.forEach((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.cssText = `position:absolute;left:${4 + i * 18}px;bottom:0;font-size:14px;animation:cat-heart 1.1s ease-out forwards;pointer-events:none;`;
      heartWrap.appendChild(s);
      setTimeout(() => s.remove(), 1100);
    });
  }

  function tick(ts) {
    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts;
    const W = window.innerWidth;

    if (state === 'walk') {
      if (targetX !== null) {
        const dx = targetX - posX;
        if (Math.abs(dx) < 3) {
          posX = targetX;
          targetX = null;
          eatNearby();
        } else {
          const nd = dx > 0 ? 1 : -1;
          if (nd !== dir) { dir = nd; applyDir(); }
          posX += dir * Math.min(Math.abs(dx), 1.6 * (dt / 16));
        }
      } else {
        posX += dir * (dt / 16) * 0.9;
        if (posX > W - 56) { dir = -1; applyDir(); }
        if (posX < 4)      { dir =  1; applyDir(); }
        if (Math.random() < 0.0002) setState('sit', 2000 + Math.random() * 3000);
      }
    } else {
      stateTimer -= dt;
      if (stateTimer <= 0) setState('walk');
    }

    catEl.style.left = posX + 'px';
    const tip = document.getElementById('cat-tip');
    if (tip && tip.style.opacity !== '0') tip.style.left = posX + 'px';

    requestAnimationFrame(tick);
  }

  function eatNearby() {
    const close = activeItems.find(i => Math.abs(i.x - (posX + 26)) < 60);
    if (!close) { setState('sit', 800); return; }
    removeItem(close);
    setState('eat', 1600);
    floaters(['❤️', '✨', '😻']);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
