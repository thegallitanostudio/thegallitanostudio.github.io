/* thegallitanostudio.com · the motion layer (Oct 11, 2026, night). No dependencies.
   Loaded last, after site.js. Everything here is an enhancement: with this file missing,
   or with reduced motion turned on, every page reads exactly as it did before.
   Styles are in css/motion.css. */
(function () {
  'use strict';
  var win = window, doc = document, root = doc.documentElement;

  function ready() { if (root.className.indexOf('gs-ready') < 0) root.className += ' gs-ready'; }
  var mq = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : null;
  if (root.className.indexOf('gs-motion') < 0 || (mq && mq.matches) || !('IntersectionObserver' in win) || !win.requestAnimationFrame) {
    root.className = root.className.replace(' gs-motion', '');
    ready();
    return;
  }

  var fine = !!(win.matchMedia && win.matchMedia('(hover:hover) and (pointer:fine)').matches);
  var each = function (list, fn) { for (var i = 0; i < list.length; i++) fn(list[i], i); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  /* ================= 1. Headlines arrive word by word ================= */
  var ATOM = /(^|\s)(kf|chip|pill|li-badge|g-badge|sf-badge)(\s|$)/;
  function splitWords(el) {
    var count = 0;
    function word(node) { var s = doc.createElement('span'); s.className = 'gw'; s.style.setProperty('--i', count++); s.appendChild(node); return s; }
    function walk(parent) {
      var kids = [].slice.call(parent.childNodes);
      var prev = null;      /* the last piece placed, when nothing but itself separates it from what comes next */
      each(kids, function (n) {
        if (n.nodeType === 3) {
          var text = n.nodeValue;
          if (!/\S/.test(text)) { prev = null; return; }
          var frag = doc.createDocumentFragment();
          var parts = text.split(/(\s+)/);
          var firstWord = null, lastWord = null;
          each(parts, function (p) {
            if (p === '') return;
            if (/^\s+$/.test(p)) { frag.appendChild(doc.createTextNode(p)); return; }
            var w = word(doc.createTextNode(p));
            if (!firstWord) firstWord = w;
            lastWord = w;
            frag.appendChild(w);
          });
          var startsTight = !/^\s/.test(text), endsTight = !/\s$/.test(text);
          parent.replaceChild(frag, n);
          /* "think" + "." must never break apart: keep a piece and the punctuation touching it on one line */
          if (startsTight && prev && firstWord) glue(prev, firstWord);
          prev = endsTight ? lastWord : null;
        } else if (n.nodeType === 1) {
          var tag = n.tagName.toLowerCase();
          if (tag === 'br') { prev = null; return; }
          var piece;
          if (tag === 'svg' || tag === 'img' || ATOM.test(n.className && n.className.baseVal === undefined ? n.className : '')) {
            piece = doc.createElement('span'); piece.className = 'gw'; piece.style.setProperty('--i', count++);
            parent.insertBefore(piece, n); piece.appendChild(n);
          } else { walk(n); piece = n; }
          if (prev) glue(prev, piece);
          prev = piece;
        }
      });
    }
    function glue(a, b) {
      if (a.parentNode && a.parentNode.className === 'gnb' && a.parentNode.parentNode === b.parentNode) { a.parentNode.appendChild(b); return; }
      if (!a.parentNode || a.parentNode !== b.parentNode) return;
      var holder = a.parentNode;
      var g = doc.createElement('span'); g.className = 'gnb';
      holder.insertBefore(g, a); g.appendChild(a); g.appendChild(b);
    }
    walk(el);
    return count;
  }
  function playWords(el, n) {
    el.className += ' gw-on';
    setTimeout(function () { el.className += ' gw-done'; }, 1500 + n * 30);
  }

  var h1 = doc.querySelector('main h1');
  var h1Words = 0;
  if (h1) { try { h1Words = splitWords(h1); } catch (e) { h1Words = 0; } }
  ready();
  if (h1 && h1Words) {
    /* two frames, so the starting state is painted before the words move */
    win.requestAnimationFrame(function () { win.requestAnimationFrame(function () { playWords(h1, h1Words); }); });
  }

  /* ================= 2. Sections rise in as you reach them ================= */
  var topSection = doc.querySelector('main > section');
  var GROUPS = 'ul,ol,.grid2,.quotes,.programs,.trust-points,.steps,.proof,.track,.pairs,.outcomes,.tiles,.offer2,.chapters';
  var EXTRA = '.steps > li,.track > .stop,.trust-points > p,.method h2,.homework,.close-box > *,.close-foot > *';
  function matches(el, sel) { var m = el.matches || el.msMatchesSelector || el.webkitMatchesSelector; return m ? m.call(el, sel) : false; }
  function sideScrolls(el) {
    for (var p = el.parentNode; p && p !== doc.body && p.nodeType === 1; p = p.parentNode) {
      var ox = win.getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll') return p;
    }
    return null;
  }
  var picked = [];
  function pick(el) {
    if (!el || el.nodeType !== 1 || picked.indexOf(el) >= 0) return;
    if (topSection && topSection.contains(el)) return;
    var tag = el.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'canvas' || el.hidden) return;
    var scroller = sideScrolls(el);
    if (scroller) { if (picked.indexOf(scroller) < 0 && !(topSection && topSection.contains(scroller))) picked.push(scroller); return; }
    picked.push(el);
  }
  each(doc.querySelectorAll('main > section .wrap > *'), function (el) {
    if (matches(el, GROUPS) && el.children.length > 1 && el.children.length <= 12) each(el.children, pick);
    else pick(el);
  });
  each(doc.querySelectorAll(EXTRA), pick);
  /* a piece that holds other pieces steps aside, so nothing is hidden twice */
  var targets = [];
  each(picked, function (el) {
    for (var i = 0; i < picked.length; i++) if (picked[i] !== el && el.contains(picked[i])) return;
    targets.push(el);
  });

  /* big statement lines and section headlines also arrive word by word */
  var wordy = [];
  each(doc.querySelectorAll('main .display, main .sec-head h2, main .method h2, main .close-box h2'), function (el) {
    if (topSection && topSection.contains(el)) return;
    if (el.querySelector('.gw')) return;
    var n = 0;
    try { n = splitWords(el); } catch (e) { n = 0; }
    if (n) { el._gw = n; wordy.push(el); }
  });

  var vh = function () { return win.innerHeight || root.clientHeight; };
  var io = new IntersectionObserver(function (entries) {
    var batch = [];
    each(entries, function (en) { if (en.isIntersecting) batch.push(en.target); });
    batch.sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
    each(batch, function (el, i) {
      io.unobserve(el);
      if (el._gw) { playWords(el, el._gw); return; }
      el.style.setProperty('--d', Math.min(i, 5) * 110 + 'ms');
      el.className += ' rv-in';
      setTimeout(function () {
        el.className = el.className.replace(' rv-in', '').replace(/(^|\s)rv(?=\s|$)/, '').replace(/^\s+/, '');
        el.style.removeProperty('--d');
      }, 2200 + Math.min(i, 5) * 110);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
  each(targets, function (el) {
    if (el._gw) return;                                   /* it arrives word by word instead */
    var r = el.getBoundingClientRect();
    if (r.top < vh() * 0.92 && r.bottom > 0) return;      /* already on screen when the page opens: leave it alone */
    if (r.bottom <= 0) return;                            /* above the fold after a refresh mid-page */
    el.className += (el.className ? ' ' : '') + 'rv';
    io.observe(el);
  });
  each(wordy, function (el) { io.observe(el); });
  /* at the very bottom of a page, whatever is left shows itself: the last strip of screen can sit outside the observer's reach */
  var atEnd = function () {
    if ((win.pageYOffset || root.scrollTop) + vh() < root.scrollHeight - 6) return;
    each(doc.querySelectorAll('.rv:not(.rv-in)'), function (el) { io.unobserve(el); el.className += ' rv-in'; });
    each(wordy, function (el) { if (el.className.indexOf('gw-on') < 0) { io.unobserve(el); playWords(el, el._gw); } });
  };
  win.addEventListener('scroll', atEnd, { passive: true });

  /* highlights draw in */
  var marks = doc.querySelectorAll('mark, .trust-points b, .trust-points strong');
  if (marks.length) {
    var mo = new IntersectionObserver(function (entries) {
      each(entries, function (en) { if (en.isIntersecting) { en.target.className += ' hl-on'; mo.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.6 });
    each(marks, function (m) { mo.observe(m); });
  }

  /* numbers count up */
  var nums = [];
  each(doc.querySelectorAll('.proof b'), function (b) {
    var m = /^(\d+)(\D*)$/.exec((b.textContent || '').replace(/\s+/g, ''));
    if (!m || +m[1] < 20) return;
    b._end = +m[1]; b._tail = m[2]; b._text = b.textContent;
    nums.push(b);
  });
  if (nums.length) {
    var no = new IntersectionObserver(function (entries) {
      each(entries, function (en) {
        if (!en.isIntersecting) return;
        var b = en.target; no.unobserve(b);
        var t0 = null, dur = 1900;
        b.style.minWidth = b.getBoundingClientRect().width + 'px'; b.style.display = 'inline-block';
        var step = function (t) {
          if (t0 === null) t0 = t;
          var k = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 4);
          if (k < 1) { b.textContent = Math.round(b._end * e) + b._tail; win.requestAnimationFrame(step); }
          else { b.textContent = b._text; b.style.minWidth = ''; b.style.display = ''; }
        };
        win.requestAnimationFrame(step);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.5 });
    each(nums, function (b) { no.observe(b); });
  }

  /* ================= 3. The cursor: a soft circle, buttons that lean, cards that tilt ================= */
  var pointer = { x: -9999, y: -9999, on: false };
  if (fine) {
    var dot = doc.createElement('div');
    dot.className = 'gs-cursor'; dot.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(dot);
    var cx = 0, cy = 0, tx = 0, ty = 0, started = false, moving = false;
    var follow = function () {
      cx = lerp(cx, tx, 0.15); cy = lerp(cy, ty, 0.15);
      dot.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      if (Math.abs(cx - tx) > 0.2 || Math.abs(cy - ty) > 0.2) win.requestAnimationFrame(follow); else moving = false;
    };
    doc.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!started) { started = true; cx = tx; cy = ty; }
      var t = e.target, hot = t && t.closest ? t.closest('a,button,[role="button"],summary,label,input,select,textarea') : null;
      var frame = t && t.tagName === 'IFRAME';
      dot.className = 'gs-cursor' + (frame ? '' : ' on') + (hot ? ' big' : '');
      if (!moving) { moving = true; win.requestAnimationFrame(follow); }
    }, { passive: true });
    root.addEventListener('mouseleave', function () { dot.className = 'gs-cursor'; });
    win.addEventListener('blur', function () { dot.className = 'gs-cursor'; });

    each(doc.querySelectorAll('.btn'), function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        b.style.transform = 'translate(' + (dx * 7).toFixed(1) + 'px,' + (dy * 5 - 2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
    each(doc.querySelectorAll('.door'), function (c) {
      c.addEventListener('mousemove', function (e) {
        if (/(^|\s)rv(\s|$)/.test(c.className)) return;
        var r = c.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(1100px) rotateX(' + (-dy * 3.2).toFixed(2) + 'deg) rotateY(' + (dx * 3.2).toFixed(2) + 'deg) translateY(-3px)';
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
  }

  /* ---- pages ease out before the next one loads, where the browser has no page-to-page transition of its own ---- */
  if (!('CSSViewTransitionRule' in win)) {
    doc.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || a.target || a.hasAttribute('download')) return;
      var href = a.getAttribute('href');
      if (!href || /^(#|mailto:|tel:|sms:|javascript:)/i.test(href)) return;
      if (a.host !== location.host || (a.pathname === location.pathname && a.hash)) return;
      e.preventDefault();
      root.className += ' gs-leaving';
      setTimeout(function () { location.href = a.href; }, 280);
    });
    win.addEventListener('pageshow', function () { root.className = root.className.replace(/ gs-leaving/g, ''); });
  }

  /* ================= 4. Home: the circles ================= */
  var C = { purple: '#7F63C9', lilac: '#CDBDF6', violet: '#5B41C0', sage2: '#D2D2B6', mahogany: '#2B0D03', raspberry: '#B3325F' };
  function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
  function mix(a, b, t) { var A = hex(a), B = hex(b); return 'rgb(' + Math.round(lerp(A[0], B[0], t)) + ',' + Math.round(lerp(A[1], B[1], t)) + ',' + Math.round(lerp(A[2], B[2], t)) + ')'; }
  function makeCanvas(cls) { var c = doc.createElement('canvas'); c.className = cls; c.setAttribute('aria-hidden', 'true'); return c; }
  function fit(canvas, w, h) {
    var dpr = Math.min(win.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
    var g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return g;
  }
  function disc(g, x, y, r, color) { if (r <= 0.2) return; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fillStyle = color; g.fill(); }
  /* run fn every frame, but only while el is on screen and the tab is showing */
  function whileVisible(el, fn) {
    var seen = false, running = false, last = 0;
    var tick = function (t) {
      if (!seen || doc.hidden) { running = false; return; }
      var dt = last ? Math.min((t - last) / 16.67, 3) : 1; last = t;
      fn(dt, t);
      win.requestAnimationFrame(tick);
    };
    var kick = function () { if (seen && !doc.hidden && !running) { running = true; last = 0; win.requestAnimationFrame(tick); } };
    new IntersectionObserver(function (en) { seen = en[en.length - 1].isIntersecting; kick(); }, { rootMargin: '80px' }).observe(el);
    doc.addEventListener('visibilitychange', kick);
  }
  var track = function (e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.on = true; };
  var untrack = function () { pointer.on = false; };
  if (win.PointerEvent) {
    doc.addEventListener('pointermove', track, { passive: true });
    doc.addEventListener('pointerdown', track, { passive: true });
    doc.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') untrack(); }, { passive: true });
    doc.addEventListener('pointercancel', untrack, { passive: true });
    root.addEventListener('pointerleave', untrack);
  }
  /* shared: spring each circle toward where it belongs, and let the pointer push it aside */
  function physics(list, px, py, dt, reach) {
    each(list, function (c) {
      var ax = (c.tx - c.x) * 0.026, ay = (c.ty - c.y) * 0.026;
      if (pointer.on) {
        var dx = c.x - px, dy = c.y - py, d = Math.sqrt(dx * dx + dy * dy) || 1, R = c.r + reach;
        if (d < R) { var f = (1 - d / R); f = f * f * 1.5 / c.mass; ax += dx / d * f; ay += dy / d * f; }
      }
      c.vx = (c.vx + ax * dt) * Math.pow(0.8, dt); c.vy = (c.vy + ay * dt) * Math.pow(0.8, dt);
      c.x += c.vx * dt; c.y += c.vy * dt;
    });
  }

  /* ---- 4a. the hero: the circles around the portrait float, and move out of your way ---- */
  (function () {
    var hero = doc.querySelector('.home-hero'), photo = hero && hero.querySelector('.hero-photo');
    if (!hero || !photo) return;
    var img = photo.querySelector('img');
    var back = makeCanvas('gs-field back'), front = makeCanvas('gs-field front');
    var gb, gf, W = 0, H = 0;
    try { gb = back.getContext('2d'); } catch (e) { gb = null; }
    if (!gb) return;
    hero.insertBefore(back, hero.firstChild); hero.appendChild(front);
    root.className += ' gs-field-on';

    /* positions are fractions of the portrait box: fx and r of its width, fy of its height (ry adds a share of the width) */
    var defs = [
      { fx: 0.18, fy: -0.02, ry: 0.26, r: 0.26, color: C.purple, layer: 0, depth: 0.35 },   /* the big one behind her shoulder */
      { fx: 0.82, fy: 0.20, ry: 0, r: 0.17, color: C.lilac, layer: 0, depth: 0.55 },
      { fx: 0.94, fy: 0.94, ry: -0.12, r: 0.12, color: C.purple, layer: 1, depth: 0.9 },    /* in front, lower right */
      { fx: 0.028, fy: 0.86, ry: 0, r: 0.026, color: C.violet, layer: 1, depth: 1.2 },
      { fx: -0.17, fy: 0.25, ry: 0, r: 0.05, color: C.lilac, layer: 0, depth: 0.8, wide: true },
      { fx: -0.10, fy: 0.60, ry: 0, r: 0.085, color: C.sage2, layer: 0, depth: 0.45, wide: true },
      { fx: 1.04, fy: 0.46, ry: 0, r: 0.022, color: C.mahogany, layer: 1, depth: 1.3, wide: true },
      { fx: 0.60, fy: -0.035, ry: 0, r: 0.034, color: C.violet, layer: 1, depth: 1.0, wide: true }
    ];
    var circles = [], born = 0;
    function layout(first) {
      var hr = hero.getBoundingClientRect(), pr = photo.getBoundingClientRect();
      W = hr.width; H = hr.height;
      gb = fit(back, W, H); gf = fit(front, W, H);
      var px = pr.left - hr.left, py = pr.top - hr.top, pw = pr.width, ph = pr.height;
      var wide = win.innerWidth > 860;
      var keep = [];
      each(defs, function (d, i) {
        if (d.wide && !wide) return;
        var c = circles[i] || { vx: 0, vy: 0, s: 0, phase: i * 1.7 };
        c.hx = px + d.fx * pw; c.hy = py + d.fy * ph + d.ry * pw; c.r = d.r * pw;
        c.color = d.color; c.layer = d.layer; c.depth = d.depth; c.mass = 0.6 + c.r / 55; c.i = i;
        if (first || c.x === undefined) { c.x = px + pw * 0.5; c.y = py + ph * 0.45; c.tx = c.hx; c.ty = c.hy; }
        circles[i] = c; keep.push(c);
      });
      live = keep;
    }
    var live = [];
    layout(true);
    setTimeout(function () { layout(false); }, 1300);   /* once the portrait has finished rising into place */
    var rz, relayout = function () { clearTimeout(rz); rz = setTimeout(function () { layout(false); }, 120); };
    win.addEventListener('resize', relayout);
    if ('ResizeObserver' in win) new ResizeObserver(relayout).observe(hero);
    if (img && !img.complete) img.addEventListener('load', function () { layout(false); });

    var mx = 0, my = 0;
    whileVisible(hero, function (dt, t) {
      if (!born) born = t;
      var hr = hero.getBoundingClientRect();
      var px = pointer.x - hr.left, py = pointer.y - hr.top;
      var inside = pointer.on && py > -60 && py < H + 60;
      /* the whole field leans a little away from the pointer, nearer circles more */
      var gx = inside ? (px / W - 0.5) : 0, gy = inside ? (py / H - 0.5) : 0;
      mx = lerp(mx, gx, 0.06 * dt); my = lerp(my, gy, 0.06 * dt);
      var scrolled = clamp(-hr.top, 0, H);
      each(live, function (c) {
        var age = (t - born - c.i * 110) / 1400;
        c.s = age <= 0 ? 0 : age >= 1 ? 1 : 1 - Math.pow(1 - age, 4);
        c.tx = c.hx + Math.sin(t / 2300 + c.phase) * 7 * c.depth - mx * 46 * c.depth;
        c.ty = c.hy + Math.cos(t / 2900 + c.phase * 1.3) * 9 * c.depth - my * 34 * c.depth - scrolled * 0.16 * c.depth;
      });
      physics(live, px, py, dt, 150);
      gb.clearRect(0, 0, W, H); gf.clearRect(0, 0, W, H);
      each(live, function (c) { disc(c.layer ? gf : gb, c.x, c.y, c.r * c.s, c.color); });
      if (img && fine) img.style.transform = 'translate3d(' + (mx * -10).toFixed(2) + 'px,' + (my * -8).toFixed(2) + 'px,0)';
    });
    /* a click or tap sends them scattering; they come back */
    hero.addEventListener('pointerdown', function (e) {
      var hr = hero.getBoundingClientRect(), x = e.clientX - hr.left, y = e.clientY - hr.top;
      each(live, function (c) {
        var dx = c.x - x, dy = c.y - y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = clamp(1 - d / 520, 0, 1) * 11 / c.mass;
        c.vx += dx / d * f; c.vy += dy / d * f;
      });
    }, { passive: true });
  })();

  /* ---- 4b. the method: scattered circles gather into the ring as you scroll; one steps outside it ---- */
  (function () {
    var sec = doc.querySelector('.method'), box = sec && sec.querySelector('.method-photo.cluster-art');
    if (!sec || !box || !box.querySelector('svg')) return;
    var cv = makeCanvas('gs-ring'), g;
    try { g = cv.getContext('2d'); } catch (e) { g = null; }
    if (!g) return;
    box.appendChild(cv);
    root.className += ' gs-ring-on';
    /* drawn in the artwork's own 400 x 500 space. from: where each circle starts. to: its seat in the ring (the logo). */
    var seat = function (x, y) { return [200 + (x - 100) * 2, 258 + (y - 108) * 2]; };
    var parts = [
      { from: [160, 300, 160, C.purple], to: seat(34, 108).concat([48, C.purple]), at: 0.00 },     /* the large seat */
      { from: [262, 170, 130, C.lilac], to: seat(100, 42).concat([28, C.purple]), at: 0.04 },
      { from: [322, 410, 62, C.mahogany], to: seat(56, 62).concat([36, C.mahogany]), at: 0.08 },    /* the medium seat */
      { from: [64, 84, 26, C.violet], to: seat(147, 61).concat([28, C.purple]), at: 0.12 },
      { from: [352, 64, 18, C.lilac], to: seat(166, 108).concat([28, C.purple]), at: 0.16 },
      { from: [374, 262, 14, C.purple], to: seat(147, 155).concat([28, C.purple]), at: 0.20 },
      { from: [236, 474, 20, C.violet], to: seat(100, 174).concat([28, C.purple]), at: 0.24 },
      { from: [52, 452, 34, C.lilac], to: seat(53, 155).concat([28, C.purple]), at: 0.28 },
      { from: [160, 300, 0, C.purple], to: seat(174, 30).concat([34, C.raspberry]), at: 0.62, late: true }  /* known beyond the table */
    ];
    var list = [];
    each(parts, function (p, i) { list.push({ p: p, x: p.from[0], y: p.from[1], tx: p.from[0], ty: p.from[1], vx: 0, vy: 0, r: p.from[2], mass: 1, phase: i * 2.1 }); });
    var W = 0, H = 0, k = 1, prog = 0;
    function size() { var r = box.getBoundingClientRect(); W = r.width; H = r.height; g = fit(cv, W, H); k = W / 400; }
    size();
    var rz; win.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(size, 120); });
    whileVisible(sec, function (dt, t) {
      var sr = sec.getBoundingClientRect(), view = vh();
      var want = clamp((view * 0.78 - sr.top) / (view * 0.62), 0, 1);
      prog = lerp(prog, want, 1 - Math.pow(0.94, dt));
      var br = box.getBoundingClientRect();
      if (Math.abs(br.width - W) > 1) size();
      var px = (pointer.x - br.left) / k, py = (pointer.y - br.top) / k;
      each(list, function (c) {
        var p = c.p, span = p.late ? 0.38 : 0.6;
        var e = ease(clamp((prog - p.at) / span, 0, 1));
        var settle = 1 - e * 0.6;
        c.tx = lerp(p.from[0], p.to[0], e) + Math.sin(t / 2500 + c.phase) * 5 * settle;
        c.ty = lerp(p.from[1], p.to[1], e) + Math.cos(t / 3100 + c.phase) * 6 * settle;
        c.r = lerp(p.from[2], p.to[2], e); c.mass = 0.6 + c.r / 40;
        c.color = e <= 0 ? p.from[3] : e >= 1 ? p.to[3] : mix(p.from[3], p.to[3], e);
      });
      physics(list, px, py, dt, 70);
      g.clearRect(0, 0, W, H);
      each(list, function (c) { disc(g, c.x * k, c.y * k, c.r * k, c.color); });
    });
  })();
})();
