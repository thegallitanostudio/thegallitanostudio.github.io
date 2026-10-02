/* The Gallitano Studio · tiny template runtime
   Renders the board templates (sc-for, sc-if, {{holes}}, on* handlers, ref) and
   patches the live DOM in place on state changes, so inputs keep focus and
   motion stays smooth. No dependencies. */
(function () {
  'use strict';
  var registry = {};
  var HOLE = /\{\{\s*([^}]*?)\s*\}\}/g;

  function lookup(scope, path) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^'.*'$/.test(path) || /^".*"$/.test(path)) return path.slice(1, -1);
    var parts = path.split('.');
    var cur = scope;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  function wholeHole(str) {
    var m = /^\s*\{\{\s*([^}]*?)\s*\}\}\s*$/.exec(str);
    return m ? m[1] : null;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) {
      var v = lookup(scope, p);
      return v == null || v === false ? '' : String(v);
    });
  }

  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (patch, cb) {
    var next = typeof patch === 'function' ? patch(this.state, this.props) : patch;
    this.state = Object.assign({}, this.state, next);
    if (this.__host) this.__host.schedule();
    if (cb) cb();
  };
  DCLogic.prototype.forceUpdate = function () { if (this.__host) this.__host.schedule(); };
  DCLogic.prototype.componentDidMount = function () {};
  DCLogic.prototype.componentDidUpdate = function () {};
  DCLogic.prototype.componentWillUnmount = function () {};

  /* ---------- render template -> fresh DOM nodes ---------- */
  function renderNodes(node, scope, out) {
    if (node.nodeType === 3) {
      var t = node.data;
      out.push(document.createTextNode(t.indexOf('{{') >= 0 ? interp(t, scope) : t));
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    if (tag === 'sc-for') {
      var list = lookup(scope, wholeHole(node.getAttribute('list') || '') || '');
      var as = node.getAttribute('as') || 'item';
      if (Array.isArray(list)) {
        for (var i = 0; i < list.length; i++) {
          var s2 = Object.create(scope);
          s2[as] = list[i];
          s2.$index = i;
          renderChildren(node, s2, out);
        }
      }
      return;
    }
    if (tag === 'sc-if') {
      var cond = lookup(scope, wholeHole(node.getAttribute('value') || '') || '');
      if (cond) renderChildren(node, scope, out);
      return;
    }
    if (tag === 'dc-mount') {
      var host = document.createElement('div');
      host.setAttribute('data-dc-mount', node.getAttribute('data-component'));
      host.setAttribute('data-dc-props', node.getAttribute('data-props') || '{}');
      host.style.display = 'contents';
      out.push(host);
      return;
    }
    var el = node.cloneNode(false);
    var attrs = node.attributes;
    for (var a = attrs.length - 1; a >= 0; a--) {
      var name = attrs[a].name, val = attrs[a].value;
      if (name.indexOf('hint-') === 0) { el.removeAttribute(name); continue; }
      if (val.indexOf('{{') < 0) continue;
      var whole = wholeHole(val);
      if (/^on[a-z]/.test(name)) {
        el.removeAttribute(name);
        var fn = whole ? lookup(scope, whole) : null;
        if (typeof fn === 'function') {
          if (!el.__h) el.__h = {};
          var ev = name.slice(2);
          if (ev === 'change' && (el.localName === 'input' || el.localName === 'textarea')) ev = 'input';
          el.__h[ev] = fn;
        }
        continue;
      }
      if (name === 'ref') {
        el.removeAttribute(name);
        el.__ref = whole ? lookup(scope, whole) : null;
        continue;
      }
      if (whole) {
        var v = lookup(scope, whole);
        if (v == null || v === false) {
          if (name.indexOf('aria-') === 0) el.setAttribute(name, 'false'); else el.removeAttribute(name);
        } else el.setAttribute(name, v === true ? (name.indexOf('aria-') === 0 ? 'true' : '') : String(v));
      } else {
        el.setAttribute(name, interp(val, scope));
      }
    }
    renderChildren(node, scope, [], el);
    out.push(el);
  }
  function renderChildren(node, scope, out, parent) {
    var kids = node.childNodes;
    var arr = parent ? [] : out;
    for (var i = 0; i < kids.length; i++) renderNodes(kids[i], scope, arr);
    if (parent) for (var j = 0; j < arr.length; j++) parent.appendChild(arr[j]);
  }

  /* ---------- morph old DOM to match new DOM ---------- */
  function morphAttrs(oldEl, newEl) {
    var i, n;
    var na = newEl.attributes;
    for (i = 0; i < na.length; i++) {
      n = na[i].name;
      var v = na[i].value;
      if (oldEl.getAttribute(n) !== v) {
        oldEl.setAttribute(n, v);
        if (n === 'value' && 'value' in oldEl && oldEl.value !== v) oldEl.value = v;
      }
    }
    var oa = oldEl.attributes;
    for (i = oa.length - 1; i >= 0; i--) {
      n = oa[i].name;
      if (!newEl.hasAttribute(n)) oldEl.removeAttribute(n);
    }
    oldEl.__h = newEl.__h;
    if (newEl.__ref !== undefined) applyRef(oldEl, newEl.__ref);
  }
  function applyRef(el, ref) {
    if (!ref) return;
    if (el.__refApplied === ref) return;
    el.__refApplied = ref;
    if (typeof ref === 'function') ref(el); else if (typeof ref === 'object') ref.current = el;
  }
  function sameKind(a, b) {
    if (a.nodeType !== b.nodeType) return false;
    if (a.nodeType === 1) return a.localName === b.localName && a.namespaceURI === b.namespaceURI;
    return true;
  }
  function morphChildren(oldP, newP) {
    var oc = oldP.childNodes, nc = newP.childNodes;
    var oi = 0, ni = 0; /* a new node that moves into oldP leaves nc, so the two indexes drift apart */
    while (ni < nc.length) {
      var n = nc[ni], o = oc[oi];
      if (!o) { oldP.appendChild(n); oi++; continue; }
      if (!sameKind(o, n)) { oldP.replaceChild(n, o); oi++; continue; }
      if (n.nodeType === 3) { if (o.data !== n.data) o.data = n.data; }
      else if (n.nodeType === 1 && !n.hasAttribute('data-dc-mount')) { morphAttrs(o, n); morphChildren(o, n); }
      oi++; ni++;
    }
    while (oc.length > oi) oldP.removeChild(oc[oc.length - 1]);
  }

  /* ---------- hosts ---------- */
  function Host(el, name, props) {
    this.el = el; this.name = name; this.props = props || {};
    this.tpl = document.getElementById('tpl-' + name);
    var Comp = registry[name](DCLogic);
    this.inst = new Comp(this.props);
    this.inst.__host = this;
    this.pending = false;
    this.mounted = false;
    this.render(true);
    this.mounted = true;
    try { this.inst.componentDidMount(); } catch (e) { console.error(e); }
  }
  Host.prototype.schedule = function () {
    var self = this;
    if (self.pending) return;
    self.pending = true;
    requestAnimationFrame(function () { self.pending = false; self.render(false); });
  };
  Host.prototype.render = function (first) {
    var vals;
    try { vals = this.inst.renderVals() || {}; } catch (e) { console.error(e); vals = {}; }
    var frag = document.createElement('div');
    var out = [];
    var kids = this.tpl.content.childNodes;
    for (var i = 0; i < kids.length; i++) renderNodes(kids[i], vals, out);
    for (var j = 0; j < out.length; j++) frag.appendChild(out[j]);
    if (first) {
      while (this.el.firstChild) this.el.removeChild(this.el.firstChild);
      while (frag.firstChild) this.el.appendChild(frag.firstChild);
      mountChildren(this.el);
      applyRefs(this.el);
    } else {
      morphChildren(this.el, frag);
      mountChildren(this.el);
      applyRefs(this.el);
      try { this.inst.componentDidUpdate(); } catch (e) { console.error(e); }
    }
  };
  function applyRefs(root) {
    var all = root.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) if (all[i].__ref) applyRef(all[i], all[i].__ref);
  }
  function mountChildren(root) {
    if (!root || root.nodeType !== 1) return;
    var list = root.querySelectorAll('[data-dc-mount]');
    for (var i = 0; i < list.length; i++) {
      var h = list[i];
      if (h.__inst) continue;
      var name = h.getAttribute('data-dc-mount');
      if (!registry[name]) continue;
      var props = {};
      try { props = JSON.parse(h.getAttribute('data-dc-props') || '{}'); } catch (e) {}
      h.__inst = new Host(h, name, props);
    }
  }

  /* ---------- event delegation ---------- */
  var EVENTS = ['click', 'input', 'change', 'submit', 'keydown', 'focus', 'blur', 'mouseenter', 'mouseleave'];
  function delegate(root) {
    EVENTS.forEach(function (type) {
      root.addEventListener(type, function (e) {
        var n = e.target;
        while (n && n !== root) {
          if (n.__h && n.__h[type]) {
            var r = n.__h[type].call(n, e);
            if (r === false) e.preventDefault();
            return;
          }
          n = n.parentNode;
        }
      }, type === 'focus' || type === 'blur' || type === 'mouseenter' || type === 'mouseleave');
    });
  }

  window.__dc = {
    register: function (name, factory) { registry[name] = factory; },
    mount: function () {
      var roots = document.querySelectorAll('[data-dc-root]');
      for (var i = 0; i < roots.length; i++) {
        var r = roots[i];
        if (r.__inst) continue;
        delegate(r);
        r.__inst = new Host(r, r.getAttribute('data-dc-root'), {});
      }
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.__dc.mount);
  else window.__dc.mount();
})();
