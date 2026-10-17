/* Oct 17, 2026: For companies only. The five stat tiles in the violet band: one detail panel open at a time, rings that fill in on scroll-in. Everything below is readable with this file off. Loads at the end of the body, after js/motion.js. */
(function () {
  'use strict';
  var ring = document.querySelector('.stat-ring');
  var panels = document.querySelector('.stat-panels');
  if (!ring || !panels) return;

  var tiles = Array.prototype.slice.call(ring.querySelectorAll('.stat-tile'));
  tiles.forEach(function (t, i) { t.style.setProperty('--i', i); });

  function open(tile) {
    tiles.forEach(function (t) {
      var on = t === tile;
      t.setAttribute('aria-expanded', on ? 'true' : 'false');
      var p = document.getElementById(t.getAttribute('aria-controls'));
      if (p) p.classList.toggle('open', on);
    });
  }

  /* Collapse to one panel only once the script is running, so scripts-off shows all five. */
  panels.classList.add('one');
  var first = tiles.filter(function (t) { return t.getAttribute('aria-expanded') === 'true'; })[0] || tiles[0];
  open(first);

  tiles.forEach(function (t) {
    t.addEventListener('click', function () { open(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); open(t); }
    });
  });

  /* Rings fill when the row scrolls in. Reduced motion: the CSS shows the final state regardless. */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { ring.classList.add('in'); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { ring.classList.add('in'); io.disconnect(); }
    });
  }, { threshold: 0.25 });
  io.observe(ring);
})();
