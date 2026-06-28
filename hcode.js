(function () {
  var el = document.getElementById('hcode-output');
  if (!el) return;

  var HASH_COLOR = '#e3b341';
  var TYPE_COLORS = { feat: '#00ff88', fix: '#ff6b6b', perf: '#ffd93d', chore: '#666666' };

  var ENTRIES = {
    de: [
      { hash: 'a3f8c2d', type: 'feat',  msg: '30+ Shopware Shops live gebracht' },
      { hash: 'b2e1f9a', type: 'fix',   msg: 'Bot-Traffic -90% via Cloudflare' },
      { hash: 'c4d7e3b', type: 'feat',  msg: 'AI Description Plugin v1.0 released' },
      { hash: 'e7f2a1b', type: 'perf',  msg: 'SEO-Audit – +22% organischer Traffic' },
      { hash: 'f9d3c8a', type: 'feat',  msg: 'JTL 5 ↔ Shopware 6 REST API Bridge' },
      { hash: '91c2e7d', type: 'fix',   msg: 'SW 6.7 Migration – zero downtime' },
      { hash: '3b8d2f1', type: 'feat',  msg: 'Coming Soon Plugin + IP-Whitelist' },
      { hash: '7a1c9e4', type: 'perf',  msg: 'Lighthouse 95+ nach Performance-Audit' },
    ],
    en: [
      { hash: 'a3f8c2d', type: 'feat',  msg: '30+ Shopware shops launched live' },
      { hash: 'b2e1f9a', type: 'fix',   msg: 'bot traffic -90% via Cloudflare rules' },
      { hash: 'c4d7e3b', type: 'feat',  msg: 'AI description plugin v1.0 released' },
      { hash: 'e7f2a1b', type: 'perf',  msg: 'SEO audit – +22% organic traffic' },
      { hash: 'f9d3c8a', type: 'feat',  msg: 'JTL 5 ↔ Shopware 6 REST API bridge' },
      { hash: '91c2e7d', type: 'fix',   msg: 'SW 6.7 migration – zero downtime' },
      { hash: '3b8d2f1', type: 'feat',  msg: 'coming soon plugin + IP whitelist' },
      { hash: '7a1c9e4', type: 'perf',  msg: 'Lighthouse 95+ after performance audit' },
    ],
  };

  var command = 'git log --oneline';
  var phase = 0;
  var cmdPos = 0;
  var entryIdx = 0;
  var html = '';
  var timer = null;
  var lang = 'de';

  function getLang() {
    return (window.i18n && window.i18n.lang && window.i18n.lang() === 'en') ? 'en' : 'de';
  }

  function prompt() {
    return '<span style="color:#00ff88">$</span> ';
  }

  function renderEntry(e) {
    var tc = TYPE_COLORS[e.type] || '#e8e8e8';
    return '<span style="color:' + HASH_COLOR + '">' + e.hash + '</span>  ' +
           '<span style="color:' + tc + '">' + e.type + ':</span> ' +
           '<span style="color:#e8e8e8">' + e.msg + '</span>';
  }

  function clearTimer() {
    if (timer !== null) { clearTimeout(timer); timer = null; }
  }

  function reset(startDelay) {
    clearTimer();
    phase = 0; cmdPos = 0; entryIdx = 0; html = '';
    el.innerHTML = '';
    timer = setTimeout(tick, startDelay !== undefined ? startDelay : 500);
  }

  function tick() {
    lang = getLang();
    var entries = ENTRIES[lang];

    if (phase === 0) {
      el.innerHTML = prompt() +
        '<span style="color:#e8e8e8">' + command.slice(0, cmdPos) + '</span>' +
        '<span class="hc-cursor"> </span>';
      if (cmdPos < command.length) {
        cmdPos++;
        timer = setTimeout(tick, Math.random() * 55 + 28);
      } else {
        phase = 1;
        html = prompt() + '<span style="color:#e8e8e8">' + command + '</span>\n\n';
        el.innerHTML = html;
        timer = setTimeout(tick, 380);
      }
    } else if (phase === 1) {
      if (entryIdx < entries.length) {
        html += renderEntry(entries[entryIdx]) + '\n';
        el.innerHTML = html;
        entryIdx++;
        timer = setTimeout(tick, 95 + Math.random() * 70);
      } else {
        phase = 2;
        html += '\n' + prompt() + '<span class="hc-cursor"> </span>';
        el.innerHTML = html;
        timer = setTimeout(function () { reset(); }, 5000);
      }
    }
  }

  window.addEventListener('langchange', function () {
    reset(300);
  });

  timer = setTimeout(tick, 900);
})();
