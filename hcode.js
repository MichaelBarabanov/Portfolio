(function () {
  var el = document.getElementById('hcode-output');
  if (!el) return;

  var HASH_COLOR = '#e3b341';
  var TYPE_COLORS = { feat: '#00ff88', fix: '#ff6b6b', perf: '#ffd93d', chore: '#666666' };

  var entries = [
    { hash: 'a3f8c2d', type: 'feat',  msg: '30+ Shopware shops live gebracht' },
    { hash: 'b2e1f9a', type: 'fix',   msg: 'bot-traffic -90% via Cloudflare rules' },
    { hash: 'c4d7e3b', type: 'feat',  msg: 'AI description plugin v1.0 released' },
    { hash: 'e7f2a1b', type: 'perf',  msg: 'SEO-Audit → +22% organic traffic' },
    { hash: 'f9d3c8a', type: 'feat',  msg: 'JTL 5 ↔ Shopware 6 REST API bridge' },
    { hash: '91c2e7d', type: 'fix',   msg: 'SW 6.7 migration – zero downtime' },
    { hash: '3b8d2f1', type: 'feat',  msg: 'Coming Soon plugin + IP-whitelist' },
    { hash: '7a1c9e4', type: 'perf',  msg: 'Lighthouse 95+ nach Performance-Audit' },
  ];

  var command = 'git log --oneline';
  var phase = 0; // 0=typing command, 1=showing entries, 2=idle
  var cmdPos = 0;
  var entryIdx = 0;
  var html = '';

  function prompt() {
    return '<span style="color:#00ff88">$</span> ';
  }

  function renderEntry(e) {
    var tc = TYPE_COLORS[e.type] || '#e8e8e8';
    return '<span style="color:' + HASH_COLOR + '">' + e.hash + '</span>  ' +
           '<span style="color:' + tc + '">' + e.type + ':</span> ' +
           '<span style="color:#e8e8e8">' + e.msg + '</span>';
  }

  function tick() {
    if (phase === 0) {
      var display = prompt() +
        '<span style="color:#e8e8e8">' + command.slice(0, cmdPos) + '</span>' +
        '<span class="hc-cursor"> </span>';
      el.innerHTML = display;
      if (cmdPos < command.length) {
        cmdPos++;
        setTimeout(tick, Math.random() * 55 + 28);
      } else {
        phase = 1;
        html = prompt() + '<span style="color:#e8e8e8">' + command + '</span>\n\n';
        el.innerHTML = html;
        setTimeout(tick, 380);
      }
    } else if (phase === 1) {
      if (entryIdx < entries.length) {
        html += renderEntry(entries[entryIdx]) + '\n';
        el.innerHTML = html;
        entryIdx++;
        setTimeout(tick, 95 + Math.random() * 70);
      } else {
        phase = 2;
        html += '\n' + prompt() + '<span class="hc-cursor"> </span>';
        el.innerHTML = html;
        setTimeout(reset, 5000);
      }
    }
  }

  function reset() {
    phase = 0; cmdPos = 0; entryIdx = 0; html = '';
    el.innerHTML = '';
    setTimeout(tick, 500);
  }

  setTimeout(tick, 900);
})();
