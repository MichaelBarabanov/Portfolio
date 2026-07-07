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
  const TW_TEXT = 'E-Commerce Engineer & Shopware 6 Spezialist';
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

  // ── Scroll reveal — observe sections, stagger children ──
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      let delay = 0;
      entry.target.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        if (el.classList.contains('visible')) return;
        delay += 130;
        setTimeout(() => el.classList.add('visible'), delay);
      });
      revObs.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('section').forEach(s => {
    // Sections already fully above viewport (scroll restoration) — show immediately
    if (s.getBoundingClientRect().bottom < 0) {
      s.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => el.classList.add('visible'));
    } else {
      revObs.observe(s);
    }
  });

  // ── Card spotlight (cursor-tracking glow) — pointer devices only ──
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.card, .plugin-card, .vk-card-expanded').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        card.style.setProperty('--spot-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
    });
  }

  // ── Tracing beam along the experience timeline ──
  const timelineEl = document.querySelector('.timeline');
  const beamEl      = document.getElementById('timeline-beam');
  if (timelineEl && beamEl) {
    let ticking = false;
    const updateBeam = () => {
      const rect      = timelineEl.getBoundingClientRect();
      const trackH    = Math.max(0, rect.height - 20); // matches top:10 / bottom:10 inset
      const startLine = window.innerHeight * 0.8;
      const progress  = Math.min(1, Math.max(0, (startLine - rect.top) / rect.height));
      beamEl.style.height = (progress * trackH) + 'px';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(updateBeam); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', updateBeam);
    updateBeam();
  }

  // ── Visitenkarte overlay (blob trigger) ──
  const vkTrigger  = document.getElementById('vk-trigger');
  const vkOverlay  = document.getElementById('vk-overlay');
  const vkBackdrop = document.getElementById('vk-backdrop');
  if (vkTrigger && vkOverlay) {
    const openVk = () => {
      vkOverlay.classList.add('open');
      vkOverlay.setAttribute('aria-hidden', 'false');
    };
    const closeVk = () => {
      vkOverlay.classList.remove('open');
      vkOverlay.setAttribute('aria-hidden', 'true');
    };
    vkTrigger.addEventListener('click', openVk);
    vkBackdrop?.addEventListener('click', closeVk);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && vkOverlay.classList.contains('open')) closeVk();
    });
  }

  // ── Demo page: filter tabs ──
  const filterTabs  = document.querySelectorAll('.filter-tab');
  const filterCards = document.querySelectorAll('#demo-cards .card');
  if (filterTabs.length && filterCards.length) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        filterCards.forEach(card => {
          card.hidden = !(filter === 'all' || card.dataset.cat === filter);
        });
      });
    });
  }

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
    'git log':  async () => {
      try {
        const res = await fetch('https://api.github.com/repos/MichaelBarabanov/Portfolio/commits?per_page=6');
        if (!res.ok) throw new Error('bad response');
        const commits = await res.json();
        return commits.map(c => `@@y@@commit ${c.sha.slice(0, 7)}@@  ${esc(c.commit.message.split('\n')[0])}`);
      } catch (e) {
        return [t('term.gitlog.error')];
      }
    },
    ls:         () => ['hero/  about/  stack/  erfahrung/  plugins/  terminal/  kontakt/'],
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
          window.location.href = 'mailto:m.barabanov@mbara.net?subject=Freelance%20Anfrage';
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
        const result = fn();
        if (result && typeof result.then === 'function') {
          if (val.toLowerCase() === 'git log') appendLines([t('term.gitlog.loading')]);
          result.then(lines => appendLines(lines));
        } else {
          appendLines(result);
        }
      } else {
        appendLines([t('term.notfound', { cmd: esc(val) })]);
      }
    }
  });

  document.getElementById('terminal')?.addEventListener('click', () => input.focus());


})();
