(() => {
  'use strict';

  const CV_DE = 'mailto:michael.bara2005@gmail.com?subject=Lebenslauf%20Anfrage&body=Hallo%20Michael%2C%0A%0Aich%20bin%20auf%20dein%20Portfolio%20aufmerksam%20geworden%20und%20w%C3%BCrde%20gerne%20deinen%20Lebenslauf%20erhalten.%0A%0AMit%20freundlichen%20Gr%C3%BC%C3%9Fen%2C%0A%5BDein%20Name%5D';
  const CV_EN = 'mailto:michael.bara2005@gmail.com?subject=CV%20Request&body=Hi%20Michael%2C%0A%0AI%20came%20across%20your%20portfolio%20and%20would%20like%20to%20request%20your%20CV.%0A%0ABest%20regards%2C%0A%5BYour%20Name%5D';

  const T = {
    de: {
      'badge.avail':          '● Verfügbar für Projekte',
      'cta.work':             'Projekte ansehen',
      'cta.hire':             'Kontakt aufnehmen',
      'about.text':           'Ich bin Michael – Backend Developer aus Koblenz, 20 Jahre alt, und ich baue Dinge die funktionieren.<br><br>PHP, Shopware 6, REST APIs – das ist mein Alltag. Nicht als Hobby, sondern produktiv: 30+ E-Commerce-Shops live gebracht, Bot-Angriffe abgewehrt, eigene Plugins entwickelt die heute im Einsatz sind.<br><br>Ich denke nicht in Aufgaben – ich denke in Lösungen. Wartbarer Code, skalierbare Architektur, keine halbfertigen Ergebnisse. Was ich anpacke, bringe ich zu Ende.<br><br>Nebenbei baue ich mein eigenes Plugin-Portfolio für den Shopware Store auf – weil gute Software nicht nur für Arbeitgeber entstehen sollte, sondern auch für sich selbst.<br><br>Offen für neue Herausforderungen, Freelance-Projekte und alles dazwischen.',
      'stack.primary':        'primär',
      'stack.skills':         'kenntnisse',
      'stat.years':           'Jahre Erfahrung',
      'stat.projects':        'Projekte',
      'stat.plugins':         'SW6 Plugins',
      'card.priceReq.desc':   'Shopware 6 Plugin: Versteckt Preise und ersetzt den Warenkorb-Button durch ein Kontaktformular. Perfekt für B2B-Shops.',
      'card.comingSoon.desc': 'Shopware 6 Plugin: Coming-Soon-Modus mit Countdown-Timer und E-Mail-Benachrichtigung vor dem Shop-Launch.',
      'card.finanz.desc':     'Persönliches Finanzanalyse-Tool: Einnahmen, Ausgaben und Kategorien – übersichtlich visualisiert im Browser.',
      'plugins.sub':          'Professionelle Shopware 6 Plugins – entwickelt, getestet, produktionsreif.',
      'plugin.pr.desc':       'Preise auf Anfrage für B2B-Shops. Versteckt Preise und ersetzt den Warenkorb-Button durch ein individuelles Kontaktformular.',
      'plugin.pr.f1':         '✓ Konfigurierbar per Kategorie oder Produkt',
      'plugin.pr.f2':         '✓ Custom E-Mail-Template',
      'plugin.pr.f3':         '✓ Kompatibel mit Shopware 6.4+',
      'plugin.cs.desc':       'Coming-Soon-Modus für Shopware 6. Countdown-Timer, E-Mail-Benachrichtigung beim Launch und vollständig anpassbares Design.',
      'plugin.cs.f1':         '✓ Konfigurierbarer Countdown-Timer',
      'plugin.cs.f2':         '✓ E-Mail-Benachrichtigung bei Launch',
      'plugin.cs.f3':         '✓ Kompatibel mit Shopware 6.4+',
      'contrib.sub':          'GitHub Contributions – letztes Jahr',
      'term.hint':            'Tippe <code>help</code> für alle Commands — probier\'s aus.',
      'contact.sub':          'Projektanfrage, Freelance-Job oder einfach reden?',
      'footer.copy':          '© 2026 Michael Barabanov · Koblenz, Deutschland · <a href="https://github.com/MichaelBarabanov" target="_blank" rel="noopener">github.com/MichaelBarabanov</a>',

      // CV button
      'cv.btn':               'Lebenslauf anfordern',
      'cv.href':              CV_DE,

      // Contact form
      'form.or':              'oder direkt schreiben',
      'form.subject':         'Portfolio Kontakt',
      'form.name.label':      'Name',
      'form.name.ph':         'Max Mustermann',
      'form.email.label':     'E-Mail',
      'form.email.ph':        'max@beispiel.de',
      'form.msg.label':       'Nachricht',
      'form.msg.ph':          'Ich suche einen Entwickler für...',
      'form.submit':          'Senden →',

      // terminal strings
      'term.whoami': [
        '@@h@@Michael Barabanov',
        '  Alter      → 20',
        '  Standort   → Koblenz, Deutschland',
        '  Rolle      → Backend &amp; Fullstack Developer',
        '  Ausbildung → Fachinformatiker Anwendungsentwicklung',
        '  Fokus      → PHP · Shopware 6 · MySQL · APIs',
        '@@g@@  Status     → ● Verfügbar für Projekte',
      ],
      'term.skills': [
        '@@h@@Tech Stack:',
        '  [PHP]         Backend, OOP, Composer',
        '  [MySQL]       Datenbankdesign, Queries, Optimierung',
        '  [Shopware 6]  Plugin-Entwicklung, Storefront, Admin',
        '  [JTL]         ERP-Integration, Schnittstellen',
        '  [REST APIs]   Entwicklung &amp; Konsumierung',
        '  [Git]         GitHub, Feature-Branches, PRs',
        '  [JavaScript]  Vanilla, DOM, Fetch API',
        '  [Linux]       Bash, Server-Administration',
      ],
      'term.projects': [
        '@@h@@Projekte:',
        '  → MichaPriceOnRequest  @@link:https://github.com/MichaelBarabanov/shopware-price-on-request@@github.com/.../shopware-price-on-request',
        '  → MichaComingSoon      @@link:https://github.com/MichaelBarabanov/shopware-coming-soon@@github.com/.../shopware-coming-soon',
        '  → Finanz Dashboard     @@link:https://github.com/MichaelBarabanov/finanz-dashboard@@github.com/.../finanz-dashboard',
      ],
      'term.plugins': [
        '@@h@@Shopware 6 Plugins:', '',
        '@@h@@  MichaPriceOnRequest',
        '  Preise auf Anfrage für B2B-Shops.',
        '  Kompatibel mit Shopware 6.4+', '',
        '@@h@@  MichaComingSoon',
        '  Coming-Soon-Modus mit Countdown &amp; E-Mail.',
        '  Kompatibel mit Shopware 6.4+',
      ],
      'term.contact': [
        '@@h@@Kontakt:',
        '  E-Mail    → @@mailto:michael.bara2005@gmail.com@@michael.bara2005@gmail.com',
        '  GitHub    → @@link:https://github.com/MichaelBarabanov@@github.com/MichaelBarabanov',
        '  LinkedIn  → @@link:https://linkedin.com/in/michael-barabanov-103265357@@linkedin.com/in/michael-barabanov-...',
      ],
      'term.hire.title':    '@@h@@Freelance-Anfrage',
      'term.hire.prompt':   'E-Mail an michael.bara2005@gmail.com öffnen?',
      'term.hire.yn':       'Tippe @@h@@y@@ (ja) oder @@h@@n@@ (nein)',
      'term.hire.yes':      '@@g@@Öffne E-Mail-Client...',
      'term.hire.no':       'Ok, kein Stress. Du weißt wo ich bin. 👋',
      'term.notfound':      '@@e@@command not found: {cmd}  —  tippe @@h@@help@@ für alle Commands',
      'term.gitlog': [
        '@@y@@commit a3f92c1  feat: launch portfolio v2',
        '@@y@@commit 8b2c31d  feat: interaktives terminal',
        '@@y@@commit 4e9a012  feat: contribution graph &amp; scroll reveal',
        '@@y@@commit c3a901f  feat: shopware plugin sektion',
        '@@y@@commit 1d7f88b  feat: glitch hero animation',
        '@@y@@commit 0f4d2b7  init: projekt setup',
      ],
    },

    en: {
      'badge.avail':          '● Available for Hire',
      'cta.work':             'View Work',
      'cta.hire':             'Hire Me',
      'about.text':           'I\'m Michael – Backend Developer from Koblenz, Germany, 20 years old, and I build things that work.<br><br>PHP, Shopware 6, REST APIs – that\'s my daily work. Not as a hobby, but productively: 30+ e-commerce shops launched live, bot attacks mitigated, custom plugins built that are running in production today.<br><br>I don\'t think in tasks – I think in solutions. Maintainable code, scalable architecture, no half-finished results. What I start, I finish.<br><br>On the side I\'m building my own plugin portfolio for the Shopware Store – because good software shouldn\'t only be built for employers, but for yourself too.<br><br>Open to new challenges, freelance projects, and everything in between.',
      'stack.primary':        'core',
      'stack.skills':         'also know',
      'stat.years':           'Years Experience',
      'stat.projects':        'Projects',
      'stat.plugins':         'SW6 Plugins',
      'card.priceReq.desc':   'Shopware 6 Plugin: Hides prices and replaces the cart button with a contact form. Perfect for B2B shops.',
      'card.comingSoon.desc': 'Shopware 6 Plugin: Coming-Soon mode with countdown timer and email notification before the shop launch.',
      'card.finanz.desc':     'Personal finance analysis tool: income, expenses and categories – clearly visualized in the browser.',
      'plugins.sub':          'Professional Shopware 6 Plugins – developed, tested, production-ready.',
      'plugin.pr.desc':       'Price on request for B2B shops. Hides prices and replaces the cart button with a custom contact form.',
      'plugin.pr.f1':         '✓ Configurable per category or product',
      'plugin.pr.f2':         '✓ Custom email template',
      'plugin.pr.f3':         '✓ Compatible with Shopware 6.4+',
      'plugin.cs.desc':       'Coming-Soon mode for Shopware 6. Countdown timer, email notification on launch, fully customizable design.',
      'plugin.cs.f1':         '✓ Configurable countdown timer',
      'plugin.cs.f2':         '✓ Email notification on launch',
      'plugin.cs.f3':         '✓ Compatible with Shopware 6.4+',
      'contrib.sub':          'GitHub Contributions – last year',
      'term.hint':            'Type <code>help</code> for all commands — give it a try.',
      'contact.sub':          'Project inquiry, freelance job or just a chat?',
      'footer.copy':          '© 2026 Michael Barabanov · Koblenz, Germany · <a href="https://github.com/MichaelBarabanov" target="_blank" rel="noopener">github.com/MichaelBarabanov</a>',

      // CV button
      'cv.btn':               'Request CV',
      'cv.href':              CV_EN,

      // Contact form
      'form.or':              'or write directly',
      'form.subject':         'Portfolio Contact',
      'form.name.label':      'Name',
      'form.name.ph':         'John Doe',
      'form.email.label':     'Email',
      'form.email.ph':        'john@example.com',
      'form.msg.label':       'Message',
      'form.msg.ph':          'I\'m looking for a developer for...',
      'form.submit':          'Send →',

      // terminal strings
      'term.whoami': [
        '@@h@@Michael Barabanov',
        '  Age        → 20',
        '  Location   → Koblenz, Germany',
        '  Role       → Backend &amp; Fullstack Developer',
        '  Training   → IT Specialist for Application Development',
        '  Focus      → PHP · Shopware 6 · MySQL · APIs',
        '@@g@@  Status     → ● Available for Hire',
      ],
      'term.skills': [
        '@@h@@Tech Stack:',
        '  [PHP]         Backend, OOP, Composer',
        '  [MySQL]       Database design, queries, optimization',
        '  [Shopware 6]  Plugin development, Storefront, Admin',
        '  [JTL]         ERP integration, interfaces',
        '  [REST APIs]   Development &amp; consumption',
        '  [Git]         GitHub, feature branches, PRs',
        '  [JavaScript]  Vanilla, DOM, Fetch API',
        '  [Linux]       Bash, server administration',
      ],
      'term.projects': [
        '@@h@@Projects:',
        '  → MichaPriceOnRequest  @@link:https://github.com/MichaelBarabanov/shopware-price-on-request@@github.com/.../shopware-price-on-request',
        '  → MichaComingSoon      @@link:https://github.com/MichaelBarabanov/shopware-coming-soon@@github.com/.../shopware-coming-soon',
        '  → Finanz Dashboard     @@link:https://github.com/MichaelBarabanov/finanz-dashboard@@github.com/.../finanz-dashboard',
      ],
      'term.plugins': [
        '@@h@@Shopware 6 Plugins:', '',
        '@@h@@  MichaPriceOnRequest',
        '  Price on request for B2B shops.',
        '  Compatible with Shopware 6.4+', '',
        '@@h@@  MichaComingSoon',
        '  Coming-Soon mode with countdown &amp; email.',
        '  Compatible with Shopware 6.4+',
      ],
      'term.contact': [
        '@@h@@Contact:',
        '  Email     → @@mailto:michael.bara2005@gmail.com@@michael.bara2005@gmail.com',
        '  GitHub    → @@link:https://github.com/MichaelBarabanov@@github.com/MichaelBarabanov',
        '  LinkedIn  → @@link:https://linkedin.com/in/michael-barabanov-103265357@@linkedin.com/in/michael-barabanov-...',
      ],
      'term.hire.title':    '@@h@@Freelance Inquiry',
      'term.hire.prompt':   'Open email to michael.bara2005@gmail.com?',
      'term.hire.yn':       'Type @@h@@y@@ (yes) or @@h@@n@@ (no)',
      'term.hire.yes':      '@@g@@Opening email client...',
      'term.hire.no':       'No worries. You know where to find me. 👋',
      'term.notfound':      '@@e@@command not found: {cmd}  —  type @@h@@help@@ for all commands',
      'term.gitlog': [
        '@@y@@commit a3f92c1  feat: launch portfolio v2',
        '@@y@@commit 8b2c31d  feat: interactive terminal',
        '@@y@@commit 4e9a012  feat: contribution graph &amp; scroll reveal',
        '@@y@@commit c3a901f  feat: shopware plugin section',
        '@@y@@commit 1d7f88b  feat: glitch hero animation',
        '@@y@@commit 0f4d2b7  init: project setup',
      ],
    },
  };

  // ── render helper shared with main.js ──
  function renderLine(raw) {
    return raw
      .replace(/@@h@@([^@]*)@@/g, '<span class="ih">$1</span>')
      .replace(/@@h@@/g,  '<span class="ih">')
      .replace(/@@g@@/g,  '<span class="is">')
      .replace(/@@e@@/g,  '<span class="ie">')
      .replace(/@@y@@/g,  '<span style="color:#e3b341">')
      .replace(/@@link:([^@]+)@@([^@]*)@@/g,   '<a href="$1" target="_blank" style="color:var(--accent)">$2</a>')
      .replace(/@@mailto:([^@]+)@@([^@]*)@@/g, '<a href="mailto:$1" style="color:var(--accent)">$2</a>');
  }

  let currentLang = localStorage.getItem('mb-lang') || 'de';

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('mb-lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = T[lang][el.dataset.i18n];
      if (v !== undefined) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const v = T[lang][el.dataset.i18nHtml];
      if (v !== undefined) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-href]').forEach(el => {
      const v = T[lang][el.dataset.i18nHref];
      if (v !== undefined) el.href = v;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const v = T[lang][el.dataset.i18nPlaceholder];
      if (v !== undefined) el.placeholder = v;
    });
    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      const v = T[lang][el.dataset.i18nValue];
      if (v !== undefined) el.value = v;
    });

    document.querySelectorAll('.lo').forEach(o => o.classList.remove('active'));
    document.getElementById('lang-' + lang)?.classList.add('active');

    window.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  document.getElementById('lang-btn')?.addEventListener('click', () => {
    applyLang(currentLang === 'de' ? 'en' : 'de');
  });

  window.i18n = {
    t:    (key, vars) => {
      let s = T[currentLang][key] ?? T['de'][key] ?? key;
      if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.replace('{' + k + '}', v); });
      return s;
    },
    tArr: (key) => T[currentLang][key] ?? T['de'][key] ?? [],
    rl:   renderLine,
    lang: () => currentLang,
  };

  applyLang(currentLang);
})();
