/* thegallitanostudio.com · small page helpers (no dependencies).
   Everything here is an enhancement: all content reads without it. */
(function () {
  'use strict';
  var cfg = window.GS_CONFIG || {};
  var doc = document;

  /* Opened straight from a folder (file://)? Point folder links at their index.html so the pages still connect. */
  if (location.protocol === 'file:') {
    var as = doc.querySelectorAll('a[href]');
    for (var i = 0; i < as.length; i++) {
      var h = as[i].getAttribute('href');
      if (/^(https?:|mailto:|#)/.test(h)) continue;
      var m = /^([^#?]*\/)(#.*)?$/.exec(h);
      if (m) as[i].setAttribute('href', m[1] + 'index.html' + (m[2] || ''));
    }
  }

  /* Contact email comes from config.js */
  if (cfg.contactEmail) {
    var mails = doc.querySelectorAll('a.gs-mail');
    for (var j = 0; j < mails.length; j++) {
      var subj = mails[j].getAttribute('data-subject');
      mails[j].setAttribute('href', 'mailto:' + cfg.contactEmail + (subj ? '?subject=' + encodeURIComponent(subj) : ''));
    }
  }

  /* Phone menu: a bottom sheet */
  var btn = doc.getElementById('menu-btn');
  var sheet = doc.getElementById('menu-sheet');
  var scrim = doc.getElementById('menu-scrim');
  var opener = null;
  function openMenu(e) {
    opener = (e && e.currentTarget) || btn;
    sheet.hidden = false; scrim.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    doc.documentElement.style.overflow = 'hidden';
    var c = sheet.querySelector('.sheet-close'); if (c) c.focus();
  }
  function closeMenu(refocus) {
    sheet.hidden = true; scrim.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    doc.documentElement.style.overflow = '';
    if (refocus !== false) { try { (opener || btn).focus({ preventScroll: true }); } catch (err) { (opener || btn).focus(); } }
  }
  if (btn && sheet && scrim) {
    btn.addEventListener('click', openMenu);
    scrim.addEventListener('click', function () { closeMenu(); });
    sheet.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('a,.sheet-close') : null;
      if (t) closeMenu(t.tagName !== 'A');
    });
    doc.addEventListener('keydown', function (e) {
      if (sheet.hidden) return;
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key === 'Tab') {
        var f = sheet.querySelectorAll('a,button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', function () { if (!sheet.hidden && window.innerWidth > 860) closeMenu(false); });
  }

  /* ---- Phone edition (Oct 8, 2026). Each piece is an enhancement: without it the page reads as before. ---- */

  /* The dock: Book and Menu within reach once the top of the page has scrolled away.
     It steps aside whenever the page's own buttons, or the footer, are on screen. Not on the Book page.
     On Home it also waits until the hero and the two doors have scrolled past, so the first Book button is the one under the doors. */
  var head = doc.querySelector('.site-head');
  var navBook = doc.querySelector('.nav .btn');
  if (btn && sheet && head && navBook && !doc.getElementById('gs-booking') && 'IntersectionObserver' in window) {
    var dock = doc.createElement('div');
    dock.className = 'dock';
    var dBook = doc.createElement('a');
    dBook.className = 'btn'; dBook.href = navBook.getAttribute('href'); dBook.textContent = 'Book a 20-minute conversation';
    var dMenu = doc.createElement('button');
    dMenu.className = 'dock-menu'; dMenu.type = 'button';
    dMenu.setAttribute('aria-label', 'Menu'); dMenu.setAttribute('aria-haspopup', 'dialog'); dMenu.setAttribute('aria-controls', 'menu-sheet');
    var ico = btn.querySelector('svg'); if (ico) dMenu.appendChild(ico.cloneNode(true));
    dMenu.addEventListener('click', openMenu);
    dock.appendChild(dBook); dock.appendChild(dMenu);
    doc.body.insertBefore(dock, scrim);
    doc.documentElement.className += ' has-dock';
    var seen = [];
    var setDock = function () {
      var on = seen.length === 0;
      dock.className = on ? 'dock on' : 'dock';
      dBook.tabIndex = on ? 0 : -1; dMenu.tabIndex = on ? 0 : -1;
    };
    var io = new IntersectionObserver(function (entries) {
      for (var k = 0; k < entries.length; k++) {
        var at = seen.indexOf(entries[k].target);
        if (entries[k].isIntersecting && at < 0) seen.push(entries[k].target);
        if (!entries[k].isIntersecting && at >= 0) seen.splice(at, 1);
      }
      setDock();
    });
    var watch = [head].concat([].slice.call(doc.querySelectorAll('main .ctas, .home-hero, .doors, .site-foot')));
    seen = watch.slice(0, 1);
    for (var w = 0; w < watch.length; w++) io.observe(watch[w]);
    setDock();
  }

  /* Programs: on phones each card shows the outcome, the name and the length. The detail opens on tap. */
  var progs = doc.querySelectorAll('.program');
  for (var p = 0; p < progs.length; p++) {
    (function (card, n) {
      var first = card.querySelector('.group');
      if (!first) return;
      var b = doc.createElement('button');
      b.type = 'button'; b.className = 'more-btn';
      b.setAttribute('aria-expanded', 'false');
      var name = card.querySelector('h3');
      b.innerHTML = '<span>What\u2019s included<span class="vh"> in ' + (name ? name.textContent : 'this program') + '</span></span><span class="pm" aria-hidden="true"></span>';
      card.insertBefore(b, first);
      b.addEventListener('click', function () {
        var open = card.className.indexOf(' open') < 0;
        card.className = open ? card.className + ' open' : card.className.replace(' open', '');
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    })(progs[p], p);
  }

  /* What success looks like: on phones the five pairs sit side by side and swipe. */
  var pairs = doc.querySelectorAll('.pair');
  if (pairs.length > 1) {
    var rail = doc.createElement('div');
    rail.className = 'rail';
    pairs[0].parentNode.insertBefore(rail, pairs[0]);
    for (var q = 0; q < pairs.length; q++) rail.appendChild(pairs[q]);
  }

  /* Referred form: opens a prefilled email (no backend) */
  var form = doc.getElementById('ref-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (id) { var el = doc.getElementById(id); return el ? el.value.trim() : ''; };
      var body = 'Who sent me: ' + g('ref-who') + '\nMy name: ' + g('ref-name') + '\nMy role: ' + g('ref-role') + '\nBest email: ' + g('ref-email') + '\n';
      var href = 'mailto:' + (cfg.contactEmail || '') + '?subject=' + encodeURIComponent('Referred: first open slot, please') + '&body=' + encodeURIComponent(body);
      var sent = doc.getElementById('ref-sent'); if (sent) sent.hidden = false;
      setTimeout(function () { try { window.location.href = href; } catch (err) {} }, 150);
    });
  }

  /* Book page: embed the calendar when a link is configured */
  var box = doc.getElementById('gs-booking');
  if (box && cfg.bookUrl) {
    var u = cfg.bookUrl;
    var mm = /cal\.com\/([^?#]+)/.exec(u);
    var fb = doc.createElement('p');
    fb.className = 'cal-fallback';
    var a1 = doc.createElement('a'); a1.className = 'tlink'; a1.href = u; a1.target = '_blank'; a1.rel = 'noopener'; a1.textContent = 'Open it in a new tab';
    fb.appendChild(doc.createTextNode('Calendar not loading? '));
    fb.appendChild(a1);
    if (cfg.contactEmail) {
      var a2 = doc.createElement('a'); a2.className = 'tlink'; a2.href = 'mailto:' + cfg.contactEmail + '?subject=' + encodeURIComponent('A 20-minute conversation'); a2.textContent = 'email me';
      fb.appendChild(doc.createTextNode(' or ')); fb.appendChild(a2);
    }
    fb.appendChild(doc.createTextNode('.'));
    box.innerHTML = '';
    box.className = 'live';
    if (mm) {
      var host = doc.createElement('div'); host.id = 'gs-cal';
      box.appendChild(host); box.appendChild(fb);
      (function (C, A, L) { var p = function (a, ar) { a.q.push(ar); }; var d = C.document; C.Cal = C.Cal || function () { var cal = C.Cal; var ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; } if (ar[0] === L) { var api = function () { p(api, arguments); }; var namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, 'https://app.cal.com/embed/embed.js', 'init');
      window.Cal('init', { origin: 'https://cal.com' });
      window.Cal('inline', { elementOrSelector: '#gs-cal', calLink: mm[1].replace(/\/$/, ''), layout: 'month_view', config: { theme: 'light' } });
      window.Cal('ui', { theme: 'light', styles: { branding: { brandColor: '#2B0D03' } }, hideEventTypeDetails: false });
    } else {
      var f = doc.createElement('iframe');
      f.src = u; f.title = 'Booking calendar'; f.style.width = '100%'; f.style.height = '720px'; f.style.border = '0';
      box.appendChild(f); box.appendChild(fb);
    }
  }
})();
