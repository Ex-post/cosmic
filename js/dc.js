/* Cosmic Ice Cream · tiny template runtime (no dependencies).
   Reads <template id="dc-view"> + <script type="text/x-dc">, renders with keyed DOM diffing. */
(function () {
  var SVG = 'http://www.w3.org/2000/svg';

  function lookup(path, ctx) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return +path;
    var parts = path.split('.'), v = ctx;
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  function interp(str, ctx) {
    var whole = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/.exec(str);
    if (whole) return lookup(whole[1], ctx);
    return str.replace(HOLE, function (_, p) { var v = lookup(p, ctx); return v == null ? '' : String(v); });
  }

  /* template DOM -> vnodes */
  function build(node, ctx, out) {
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      if (t.indexOf('{{') >= 0) t = interp(t, ctx);
      if (t !== '' && t != null) out.push({ t: '#', v: String(t) });
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    if (tag === 'sc-if') {
      if (interp(node.getAttribute('value') || '', ctx)) kids(node, ctx, out);
      return;
    }
    if (tag === 'sc-for') {
      var list = interp(node.getAttribute('list') || '', ctx) || [];
      var as = node.getAttribute('as') || 'item';
      for (var i = 0; i < list.length; i++) {
        var c = Object.create(ctx); c[as] = list[i]; c.$index = i;
        kids(node, c, out);
      }
      return;
    }
    var props = {}, key = null;
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a], n = at.name, val = at.value;
      if (n.indexOf('hint-') === 0) continue;
      if (val.indexOf('{{') >= 0) val = interp(val, ctx);
      if (n === 'key') { key = val; continue; }
      props[n] = val;
    }
    var vn = { t: tag, p: props, k: key, c: [], svg: node.namespaceURI === SVG };
    kids(node, ctx, vn.c);
    out.push(vn);
  }
  function kids(node, ctx, out) { for (var c = node.firstChild; c; c = c.nextSibling) build(c, ctx, out); }

  /* vnodes -> DOM */
  function create(vn, svg) {
    if (vn.t === '#') { var tn = document.createTextNode(vn.v); vn.d = tn; return tn; }
    svg = svg || vn.svg || vn.t === 'svg';
    var el = svg ? document.createElementNS(SVG, vn.t) : document.createElement(vn.t);
    vn.d = el;
    setProps(el, {}, vn.p, svg);
    for (var i = 0; i < vn.c.length; i++) el.appendChild(create(vn.c[i], svg && vn.t !== 'foreignObject'));
    return el;
  }
  function setProps(el, oldP, newP, svg) {
    var n;
    for (n in oldP) if (!(n in newP)) {
      if (n.slice(0, 2) === 'on') setEvent(el, n, null); else el.removeAttribute(n);
    }
    for (n in newP) {
      var v = newP[n];
      if (n.slice(0, 2) === 'on') { setEvent(el, n, typeof v === 'function' ? v : null); continue; }
      if (oldP[n] === v && !(n === 'value' || n === 'checked')) continue;
      if (!svg && (n === 'value' || n === 'checked')) {
        if (n === 'value' && el.localName === 'select') { var sv = v; setTimeout(function () { el.value = sv; }); }
        else if (el[n] !== v) el[n] = v;
        continue;
      }
      if (v === false || v == null) el.removeAttribute(n);
      else el.setAttribute(n, v === true ? '' : v);
    }
  }
  function setEvent(el, name, fn) {
    var ev = name.slice(2).toLowerCase();
    el._h = el._h || {};
    if (!el._h[ev] && fn) el.addEventListener(ev, function (e) { var f = el._h[ev]; if (f) f(e); });
    el._h[ev] = fn;
  }
  function same(a, b) { return a.t === b.t && a.k === b.k; }
  function patch(parent, oldV, newV, svg) {
    if (newV.t === '#') {
      if (oldV.t === '#') { if (oldV.v !== newV.v) oldV.d.nodeValue = newV.v; newV.d = oldV.d; return; }
    } else if (same(oldV, newV)) {
      var el = newV.d = oldV.d, s = svg || newV.svg || newV.t === 'svg';
      setProps(el, oldV.p, newV.p, s);
      patchKids(el, oldV.c, newV.c, s && newV.t !== 'foreignObject');
      return;
    }
    parent.replaceChild(create(newV, svg), oldV.d);
  }
  function keyOf(v, i) { return v.k != null ? 'k:' + v.t + ':' + v.k : 'i:' + i + ':' + v.t; }
  function patchKids(el, oldC, newC, svg) {
    var map = {}, i;
    for (i = 0; i < oldC.length; i++) map[keyOf(oldC[i], i)] = oldC[i];
    var used = {}, nodes = [];
    for (i = 0; i < newC.length; i++) {
      var k = keyOf(newC[i], i), o = map[k];
      if (o && !used[k]) { used[k] = 1; patch(el, o, newC[i], svg); nodes.push(newC[i].d); }
      else nodes.push(create(newC[i], svg));
    }
    for (i = 0; i < oldC.length; i++) if (!used[keyOf(oldC[i], i)] && oldC[i].d.parentNode === el) el.removeChild(oldC[i].d);
    for (i = 0; i < nodes.length; i++) if (el.childNodes[i] !== nodes[i]) el.insertBefore(nodes[i], el.childNodes[i] || null);
  }

  /* component base */
  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (u) {
    var s = typeof u === 'function' ? u(this.state, this.props) : u;
    this.state = Object.assign({}, this.state, s);
    this.forceUpdate();
  };
  DCLogic.prototype.forceUpdate = function () {
    var self = this;
    if (self._q) return; self._q = true;
    Promise.resolve().then(function () { self._q = false; self._render(); });
  };
  DCLogic.prototype.renderVals = function () { return {}; };
  DCLogic.prototype._render = function () {
    var out = []; kids(this._tpl, this.renderVals() || {}, out);
    if (!this._v) {
      for (var i = 0; i < out.length; i++) this._root.appendChild(create(out[i], false));
    } else patchKids(this._root, this._v, out, false);
    this._v = out;
  };

  function boot() {
    var tpl = document.getElementById('dc-view'), src = document.querySelector('script[type="text/x-dc"]');
    if (!tpl || !src) return;
    var Comp = new Function('DCLogic', src.textContent + '\n;return Component;')(DCLogic);
    var inst = new Comp({});
    inst._tpl = tpl.content; inst._root = document.getElementById('dc-root');
    inst._render();
    if (inst.componentDidMount) inst.componentDidMount();
    window.addEventListener('pagehide', function () { if (inst.componentWillUnmount) inst.componentWillUnmount(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
