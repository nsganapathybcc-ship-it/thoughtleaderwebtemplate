/* Brand kit for the mockup (preview only, not part of the Wix build).
   Saves brands in this browser (localStorage) and re-colours / re-fonts every page. */
(function () {
  var KEY = 'bk.brands', ACTIVE = 'bk.active';
  var DEFAULT = { name: 'Template default', brand: '#354A40', action: '#B5D334', accent: '#8A6A2C', light: '#F3F5F3', text: '#1F2A25', head: 'Space Grotesk', body: 'DM Sans' };
  var FONTS = ['Space Grotesk', 'DM Sans', 'Inter', 'Manrope', 'Plus Jakarta Sans', 'Sora', 'Outfit', 'Poppins', 'Montserrat', 'Work Sans', 'IBM Plex Sans', 'Source Sans 3', 'Lora', 'Merriweather', 'Playfair Display', 'Fraunces', 'Libre Baskerville'];

  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function brands() { return store(KEY) || {}; }
  function active() { var n = store(ACTIVE); var b = brands(); return (n && b[n]) ? b[n] : DEFAULT; }

  function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join(''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function rgb2hex(c) { return '#' + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join('').toUpperCase(); }
  function mix(a, b, t) { var x = hex2rgb(a), y = hex2rgb(b); return rgb2hex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }

  // Every theme colour used in the mockups, mapped to one of the 5 brand roles.
  function colourMap(p) {
    var B = p.brand, A = p.action, C = p.accent, L = p.light, T = p.text, K = '#000000', W = '#FFFFFF';
    return {
      '#354A40': B, '#374A42': B, '#2F4238': mix(B, K, .12), '#2E4238': mix(B, K, .12), '#2B3A33': mix(B, K, .2), '#26352E': mix(B, K, .28),
      '#1E2B25': mix(B, K, .42), '#1A2620': mix(B, K, .5), '#41594D': mix(B, W, .1), '#4A6357': mix(B, W, .14), '#4E7A63': mix(B, W, .2), '#8FAF7E': mix(B, W, .45),
      '#E4EAE6': mix(B, W, .88), '#C8D2CC': mix(B, W, .75), '#CFD8D3': mix(B, W, .78), '#D7DED9': mix(B, W, .83),
      '#B5D334': A, '#A3BF2B': mix(A, K, .1), '#9DB82A': mix(A, K, .13), '#C6DE5E': mix(A, W, .25), '#D9E3B6': mix(A, W, .6), '#E3EDB9': mix(A, W, .65),
      '#E7EFC6': mix(A, W, .72), '#E9EFD3': mix(A, W, .75), '#EEF5CF': mix(A, W, .78), '#EEF6CC': mix(A, W, .8),
      '#8A6A2C': C, '#745824': mix(C, K, .16), '#6A5120': mix(C, K, .24), '#EFE6D3': mix(C, W, .8),
      '#F3F5F3': L, '#F4F5F1': L, '#F1F3F2': L, '#F2F4F3': L, '#F5F6F5': L, '#EEF0EE': mix(L, K, .02), '#E8EBE9': mix(L, K, .04),
      '#1F2A25': T, '#3B4842': mix(T, W, .18), '#46504B': mix(T, W, .25), '#4A5751': mix(T, W, .27)
    };
  }

  function apply(p) {
    var isDefault = ['brand', 'action', 'accent', 'light', 'text', 'head', 'body'].every(function (k) { return String(p[k]).toUpperCase() === String(DEFAULT[k]).toUpperCase(); });
    if (isDefault) return;
    var map = colourMap(p), rgbMap = {};
    Object.keys(map).forEach(function (h) { var c = hex2rgb(h); rgbMap[c.join(',')] = hex2rgb(map[h]); });
    var hexRe = new RegExp('#(' + Object.keys(map).map(function (h) { return h.slice(1); }).join('|') + ')\\b', 'gi');
    function fixText(v) {
      if (!v) return v;
      v = v.replace(hexRe, function (m) { return map[m.toUpperCase()] || m; });
      v = v.replace(/rgba?\((\d+),\s*(\d+),\s*(\d+)(\s*,\s*[\d.]+)?\)/g, function (m, r, g, b, a) {
        var n = rgbMap[[r, g, b].join(',')]; if (!n) return m;
        return a ? 'rgba(' + n.join(', ') + a + ')' : 'rgb(' + n.join(', ') + ')';
      });
      v = v.replace(/['"]?Space Grotesk['"]?/g, "'" + p.head + "'").replace(/['"]?DM Sans['"]?/g, "'" + p.body + "'");
      return v;
    }
    function walk(rules) {
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        if (r.cssRules) walk(r.cssRules);
        if (!r.style) continue;
        for (var j = 0; j < r.style.length; j++) {
          var prop = r.style[j], val = r.style.getPropertyValue(prop), nv = fixText(val);
          if (nv !== val) r.style.setProperty(prop, nv, r.style.getPropertyPriority(prop));
        }
      }
    }
    for (var s = 0; s < document.styleSheets.length; s++) { try { walk(document.styleSheets[s].cssRules); } catch (e) { } }
    function fixEl(el) { var st = el.getAttribute && el.getAttribute('style'); if (st) { var n = fixText(st); if (n !== st) el.setAttribute('style', n); } }
    document.querySelectorAll('[style]').forEach(fixEl);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === 'attributes') fixEl(m.target);
        m.addedNodes && m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { fixEl(n); n.querySelectorAll && n.querySelectorAll('[style]').forEach(fixEl); } });
      });
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'] });
    var fams = [p.head, p.body].filter(function (f, i, a) { return a.indexOf(f) === i; });
    var link = document.createElement('link'); link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?' + fams.map(function (f) { return 'family=' + f.replace(/ /g, '+') + ':wght@400;500;600;700'; }).join('&') + '&display=swap';
    document.head.appendChild(link);
  }

  // Small switcher on every page (mockup only)
  function switcher() {
    if (document.getElementById('bk-switch') || document.body.dataset.bkPanel) return;
    var b = brands(), names = Object.keys(b), cur = store(ACTIVE) || '';
    var root = location.pathname.indexOf('/01-public-pages/') > -1 || location.pathname.indexOf('/02-free-plan/') > -1 ? '../' : '';
    var d = document.createElement('div'); d.id = 'bk-switch';
    d.setAttribute('style', 'position:fixed;left:12px;bottom:12px;z-index:9999;background:#fff;border:1px solid #C9CECB;border-radius:8px;padding:6px 8px;font:13px/1.2 Arial,sans-serif;color:#222;box-shadow:0 4px 14px rgba(0,0,0,.15);display:flex;gap:6px;align-items:center');
    d.innerHTML = '<span title="Mockup preview only">Brand</span><select style="font:13px Arial;padding:2px"></select><a href="' + root + 'index.html#brandkit" style="color:#222">Edit</a>';
    var sel = d.querySelector('select');
    sel.add(new Option('Template default', ''));
    names.forEach(function (n) { sel.add(new Option(n, n)); });
    sel.value = b[cur] ? cur : '';
    sel.onchange = function () { store(ACTIVE, sel.value); location.reload(); };
    document.body.appendChild(d);
  }

  window.BrandKit = { DEFAULT: DEFAULT, FONTS: FONTS, brands: brands, active: active,
    save: function (p) { var b = brands(); b[p.name] = p; store(KEY, b); },
    remove: function (n) { var b = brands(); delete b[n]; store(KEY, b); if (store(ACTIVE) === n) store(ACTIVE, ''); },
    setActive: function (n) { store(ACTIVE, n || ''); },
    activeName: function () { return store(ACTIVE) || ''; } };

  function init() { apply(active()); switcher(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
