(() => {
  'use strict';

  // ── Nav scroll border ──
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // ── Hamburger ──
  const toggle   = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  toggle?.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );

  // ── Typewriter (one-time, no loop) ──
  const twEl = document.getElementById('typewriter');
  const TW_TEXT = 'Backend & Fullstack Developer';
  function startTypewriter() {
    if (!twEl) return;
    twEl.textContent = '';
    let i = 0;
    const tick = () => {
      twEl.textContent = TW_TEXT.slice(0, ++i);
      if (i < TW_TEXT.length) setTimeout(tick, 60);
    };
    setTimeout(tick, 900);
  }
  startTypewriter();

  // ── Scroll reveal ──
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      let delay = 0;
      entry.target.parentElement.querySelectorAll('.reveal:not(.visible)').forEach(sib => {
        delay += 90;
        setTimeout(() => sib.classList.add('visible'), delay);
      });
      revObs.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

  // ── Stat counters ──
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 25));
      const tick = () => {
        cur = Math.min(cur + step, target);
        el.textContent = cur + '+';
        if (cur < target) setTimeout(tick, 55);
      };
      tick();
      statObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num').forEach(el => statObs.observe(el));

  // ── Contribution graph ──
  const grid     = document.getElementById('contrib-grid');
  const monthsEl = document.getElementById('contrib-months');
  if (grid && monthsEl) {
    const WEEKS  = 52;
    const CELL   = 15;
    const MONTHS = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

    let seed = 0xdeadbeef;
    const rand = () => {
      seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5;
      return Math.abs(seed) / 0x7fffffff;
    };

    const today     = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - WEEKS * 7);

    for (let w = 0; w < WEEKS; w++) {
      const weekEl = document.createElement('div');
      weekEl.className = 'contrib-week';
      for (let d = 0; d < 7; d++) {
        const r  = rand();
        const base = (d >= 1 && d <= 5) ? 0.55 : 0.22;
        let level = 0;
        if      (r > 1 - base * 0.14) level = 4;
        else if (r > 1 - base * 0.28) level = 3;
        else if (r > 1 - base * 0.50) level = 2;
        else if (r > 1 - base * 0.78) level = 1;

        const cell     = document.createElement('div');
        cell.className = 'contrib-cell';
        cell.setAttribute('data-level', level);
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + w * 7 + d);
        cell.title = `${cellDate.toLocaleDateString('de-DE')} – ${level} Contributions`;
        weekEl.appendChild(cell);
      }
      grid.appendChild(weekEl);
    }

    let lastMonth = -1;
    for (let w = 0; w < WEEKS; w++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + w * 7);
      const m = d.getMonth();
      if (m !== lastMonth) {
        const span   = document.createElement('span');
        span.textContent = MONTHS[m];
        span.style.left  = (w * CELL) + 'px';
        monthsEl.appendChild(span);
        lastMonth = m;
      }
    }
  }

  // ── Interactive Terminal ──
  const output = document.getElementById('iterm-output');
  const input  = document.getElementById('iterm-input');
  if (!output || !input) return;

  const history = [];
  let histIdx   = -1;
  let pendingYN = null;

  // i18n helpers (fall back gracefully if i18n.js not loaded yet)
  const t    = (key, vars) => window.i18n?.t(key, vars)  || key;
  const tArr = (key)       => window.i18n?.tArr(key)     || [];
  const rl   = (raw)       => window.i18n?.rl(raw)       || raw;

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function renderLines(lines) {
    const wrap = document.createElement('div');
    wrap.className = 'ir';
    lines.forEach(raw => {
      const d = document.createElement('div');
      d.innerHTML = rl(raw);
      wrap.appendChild(d);
    });
    return wrap;
  }

  function appendCommand(cmd) {
    const row = document.createElement('div');
    row.className = 'iterm-row';
    row.innerHTML = `<span class="ip">michael@portfolio:~$ </span><span>${esc(cmd)}</span>`;
    output.appendChild(row);
  }

  function appendLines(lines) {
    output.appendChild(renderLines(lines));
    output.scrollTop = output.scrollHeight;
  }

  const CMDS = {
    help: () => {
      const isEN = window.i18n?.lang() === 'en';
      return [
        isEN ? '@@h@@Available commands:' : '@@h@@Verfügbare Commands:',
        `  @@h@@whoami@@    → ${isEN ? 'Who is Michael?' : 'Wer ist Michael?'}`,
        `  @@h@@skills@@    → Tech Stack`,
        `  @@h@@projects@@  → ${isEN ? 'All projects' : 'Alle Projekte'}`,
        `  @@h@@plugins@@   → Shopware Plugins`,
        `  @@h@@contact@@   → ${isEN ? 'Contact info' : 'Kontakt'}`,
        `  @@h@@hire@@      → ${isEN ? 'Freelance inquiry' : 'Freelance anfragen'}`,
        `  @@h@@git log@@   → ${isEN ? 'Commit history' : 'Commit-Verlauf'}`,
        `  @@h@@clear@@     → ${isEN ? 'Clear terminal' : 'Terminal leeren'}`,
      ];
    },
    whoami:     () => tArr('term.whoami'),
    skills:     () => tArr('term.skills'),
    projects:   () => tArr('term.projects'),
    plugins:    () => tArr('term.plugins'),
    contact:    () => tArr('term.contact'),
    'git log':  () => tArr('term.gitlog'),
    ls:         () => ['hero/  about/  stack/  projekte/  plugins/  contrib/  terminal/  kontakt/'],
    date:       () => [new Date().toLocaleString(window.i18n?.lang() === 'en' ? 'en-GB' : 'de-DE')],
    'sudo rm -rf /': () => ['@@e@@Permission denied. Nice try.', '( bitte nicht nochmal )'],
    sudo:            () => ['@@e@@sudo: This isn\'t your server.'],

    hire: () => {
      pendingYN = 'hire';
      return [t('term.hire.title'), t('term.hire.prompt'), t('term.hire.yn')];
    },
  };

  function handleYN(val) {
    const flow = pendingYN;
    pendingYN = null;
    appendCommand(val);
    if (flow === 'hire') {
      if (['y','yes','ja','j'].includes(val.toLowerCase())) {
        appendLines([t('term.hire.yes')]);
        setTimeout(() => {
          window.location.href = 'mailto:michael.bara2005@gmail.com?subject=Freelance%20Anfrage';
        }, 450);
      } else {
        appendLines([t('term.hire.no')]);
      }
    }
  }

  // Update initial help block when lang changes
  window.addEventListener('langchange', () => {
    const helpEl = document.getElementById('help-init');
    if (!helpEl) return;
    const fresh = renderLines(CMDS.help());
    fresh.id = 'help-init';
    helpEl.replaceWith(fresh);
  });

  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (histIdx < history.length - 1) input.value = history[++histIdx];
    } else if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      histIdx > 0 ? (input.value = history[--histIdx]) : ((histIdx = -1), (input.value = ''));
    } else if (ev.key === 'Enter') {
      const val = input.value.trim();
      input.value = '';
      histIdx = -1;
      if (!val) return;

      if (pendingYN) { history.unshift(val); handleYN(val); return; }
      history.unshift(val);

      if (val.toLowerCase() === 'clear') { output.innerHTML = ''; return; }

      const fn = CMDS[val.toLowerCase()];
      appendCommand(val);
      if (fn) {
        appendLines(fn());
      } else {
        appendLines([t('term.notfound', { cmd: esc(val) })]);
      }
    }
  });

  document.getElementById('terminal')?.addEventListener('click', () => input.focus());

  // ── Custom cursor (mouse devices only) ──
  if (window.matchMedia('(pointer: fine)').matches) {
    const dot  = document.createElement('div');
    dot.className = 'cur';
    const ring = document.createElement('div');
    ring.className = 'cur-ring';
    document.body.append(dot, ring);

    let mx = -100, my = -100, rx = -100, ry = -100;
    const DOT_OFF  = 4;   // half of 8px dot
    const RING_OFF = 15;  // half of 30px ring

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx - DOT_OFF}px,${my - DOT_OFF}px)`;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      dot.classList.add('hidden'); ring.classList.add('hidden');
    });
    document.addEventListener('mouseenter', () => {
      dot.classList.remove('hidden'); ring.classList.remove('hidden');
    });

    // Hover grow effect on interactive elements
    const sel = 'a,button,.tech-item,.card,.plugin-card';
    document.querySelectorAll(sel).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });

    // Ring follows with smooth lag via RAF
    (function animRing() {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      const off = ring.classList.contains('hover') ? 23 : RING_OFF;
      ring.style.transform = `translate(${rx - off}px,${ry - off}px)`;
      requestAnimationFrame(animRing);
    })();
  }

})();
