/* thegallitanostudio.com · the editorial pages (Oct 28, 2026, night): Home and For companies.
   Replaces js/motion.js on these two pages only. One idea per section: the hero rises once (CSS),
   sections rise 12px and fade in once as they are reached, expandable rows are native <details>
   and one opens at a time per group. Nothing loops. With reduced motion, or without this file,
   every section is visible as plain content. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var cls = root.className;
  if (cls.indexOf('gs-ready') < 0) root.className += ' gs-ready';
  var motion = cls.indexOf('gs-motion') >= 0 && 'IntersectionObserver' in window;

  /* one open at a time per group (a fallback for browsers without <details name>) */
  var all = doc.querySelectorAll('details[name]');
  for (var i = 0; i < all.length; i++) {
    all[i].addEventListener('toggle', function () {
      if (!this.open) return;
      var n = this.getAttribute('name');
      var same = doc.querySelectorAll('details[name="' + n + '"]');
      for (var k = 0; k < same.length; k++) if (same[k] !== this && same[k].open) same[k].open = false;
    });
  }

  if (!motion) return;
  root.className += ' ed-ready';
  var io = new IntersectionObserver(function (entries) {
    for (var k = 0; k < entries.length; k++) {
      if (entries[k].isIntersecting) { entries[k].target.className += ' rv-in'; io.unobserve(entries[k].target); }
    }
  }, { threshold: 0.05 });
  var rv = doc.querySelectorAll('.rv');
  for (var r = 0; r < rv.length; r++) io.observe(rv[r]);
  /* anchor jumps and fast scrolling never leave a section blank: anything still hidden after 1.6s shows itself */
  var sweep = function () {
    var left = doc.querySelectorAll('.rv:not(.rv-in)');
    for (var j = 0; j < left.length; j++) {
      var b = left[j].getBoundingClientRect();
      if (b.top < window.innerHeight) { left[j].className += ' rv-in rv-now'; io.unobserve(left[j]); }
    }
  };
  setTimeout(sweep, 300); setTimeout(sweep, 1600);
  window.addEventListener('scroll', sweep, { passive: true });
  window.addEventListener('hashchange', function () {
    var left = doc.querySelectorAll('.rv:not(.rv-in)');
    for (var j = 0; j < left.length; j++) { left[j].className += ' rv-in rv-now'; io.unobserve(left[j]); }
  });
})();
