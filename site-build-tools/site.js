/* thegallitanostudio.com · small page helpers (no dependencies) */
(function () {
  'use strict';
  var cfg = window.GS_CONFIG || {};

  /* Letter-size sheets scale down to fit narrow screens */
  function fitSheets() {
    var roots = document.querySelectorAll('.gs-sheetpage [data-dc-root]');
    if (!roots.length) return;
    var avail = Math.min(window.innerWidth - 24, 816);
    var scale = Math.min(1, avail / 816);
    for (var i = 0; i < roots.length; i++) {
      var r = roots[i];
      var sheet = r.querySelector('.gs-sheet');
      var h = sheet ? sheet.getBoundingClientRect().height / (parseFloat(r.getAttribute('data-scale')) || 1) : 1056;
      r.setAttribute('data-scale', String(scale));
      r.style.transform = scale < 1 ? 'scale(' + scale + ')' : '';
      r.style.height = scale < 1 ? (h * scale) + 'px' : '';
      r.style.width = '816px';
      r.style.maxWidth = 'none';
    }
  }
  fitSheets();
  window.addEventListener('resize', fitSheets);
  setTimeout(fitSheets, 300);

  /* The seven-circle chooser was drawn 1280px wide; zoom it to fit on tablets */
  function fitCluster() {
    var c = document.querySelector('.gs-cluster');
    if (!c || window.innerWidth <= 860) return;
    var w = c.parentElement.getBoundingClientRect().width;
    c.style.zoom = w < 1280 ? String(w / 1280) : '';
  }
  fitCluster();
  window.addEventListener('resize', fitCluster);
  setTimeout(fitCluster, 300);

  /* Known For Search audit: its own calendar link when configured (delegated, so re-renders can't undo it) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('.gs-audit') : null;
    if (a && cfg.auditUrl) { e.preventDefault(); window.open(cfg.auditUrl, '_blank', 'noopener'); }
  });

  /* Booking page: embed the calendar when a link is configured */
  function booking() {
    var box = document.getElementById('gs-booking');
    if (!box) return;
    var mail = box.querySelector('.gs-mail');
    if (mail && cfg.contactEmail) mail.setAttribute('href', 'mailto:' + cfg.contactEmail + '?subject=' + encodeURIComponent('A 20-minute conversation'));
    if (!cfg.bookUrl) {
      var note = box.querySelector('span[style*="max-width"]');
      if (note) note.textContent = 'Email me and I’ll send you a few times.';
      return;
    }
    var u = cfg.bookUrl;
    box.innerHTML = '';
    box.style.padding = '0';
    box.style.overflow = 'hidden';
    box.style.background = '#F4F0E0';
    var m = /cal\.com\/([^?#]+)/.exec(u);
    if (m) {
      var link = m[1].replace(/\/$/, '');
      var host = document.createElement('div');
      host.id = 'gs-cal';
      host.style.width = '100%';
      host.style.minHeight = '600px';
      box.appendChild(host);
      var fallback = document.createElement('p');
      fallback.style.cssText = 'margin: 8px 0 20px; font-size: 15px; text-align: center;';
      fallback.innerHTML = 'Calendar not loading? <a href="' + u + '" target="_blank" rel="noopener" style="color:#6B4FD1;font-weight:600">Open it in a new tab</a>' + (cfg.contactEmail ? ' or <a href="mailto:' + cfg.contactEmail + '" style="color:#6B4FD1;font-weight:600">email me</a>.' : '.');
      box.appendChild(fallback);
      (function (C, A, L) { var p = function (a, ar) { a.q.push(ar); }; var d = C.document; C.Cal = C.Cal || function () { var cal = C.Cal; var ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; } if (ar[0] === L) { var api = function () { p(api, arguments); }; var namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, 'https://app.cal.com/embed/embed.js', 'init');
      window.Cal('init', { origin: 'https://cal.com' });
      window.Cal('inline', { elementOrSelector: '#gs-cal', calLink: link, layout: 'month_view', config: { theme: 'light' } });
      window.Cal('ui', { theme: 'light', styles: { branding: { brandColor: '#3D524C' } }, hideEventTypeDetails: false });
    } else {
      var f = document.createElement('iframe');
      f.src = u; f.title = 'Booking calendar'; f.style.width = '100%'; f.style.height = '720px'; f.style.border = '0';
      box.appendChild(f);
    }
  }
  booking();

  /* "Book" buttons open the calendar directly when one is configured and the visitor is already on the Book page */
  if (cfg.bookUrl) {
    var links = document.querySelectorAll('a[href="/book/"]');
    for (var i = 0; i < links.length; i++) links[i].setAttribute('data-book', '1');
  }
})();
