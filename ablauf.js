/* Ablauf als Fluss: Beim Scrollen füllt sich die Linie, jeder Schritt wird
   hell, sobald er die Bildmitte erreicht. Ohne Skript oder bei reduzierter
   Bewegung bleiben alle Schritte vollständig sichtbar. */
(function () {
  var fluss = document.querySelector('.fluss');
  if (!fluss) return;
  var ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (ruhig) return;

  var schritte = Array.prototype.slice.call(fluss.querySelectorAll('.fluss-schritt'));
  fluss.classList.add('bereit');

  var geplant = false;
  function aktualisieren() {
    geplant = false;
    var mitte = window.innerHeight * 0.6;
    var r = fluss.getBoundingClientRect();
    var anteil = Math.max(0, Math.min(1, (mitte - r.top) / r.height));
    fluss.style.setProperty('--fortschritt', anteil.toFixed(3));
    schritte.forEach(function (s) {
      if (s.getBoundingClientRect().top < mitte) s.classList.add('aktiv');
    });
  }
  function planen() {
    if (!geplant) { geplant = true; window.requestAnimationFrame(aktualisieren); }
  }
  window.addEventListener('scroll', planen, { passive: true });
  window.addEventListener('resize', planen);
  aktualisieren();
})();
