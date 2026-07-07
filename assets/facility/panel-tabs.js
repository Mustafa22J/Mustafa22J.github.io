/* panel-tabs.js — Part C: restructure content-heavy panels so they FIT the viewport instead of
   overflowing into an internal scrollbar. Each repeated group of items becomes a tab strip that
   shows ONE item at a time (a category, a level, a credential, a role, an incident, a tool, a
   resume section). Projects get a filter-aware selector with prev/next pagination.

   Items are MOVED in the DOM (never cloned/recreated) so existing behaviour — the subnet
   calculator, the resume download link, GitHub links — keeps its event handlers intact. The tab
   UI is hoisted OUT of any CSS-grid layout wrapper (which is then removed) so the strip lays out
   as a normal block. Runs on the static panel DOM; no Three.js dependency. Keyboard accessible. */
window.FacilityStations = window.FacilityStations || {};
(function (NS) {
  'use strict';

  function injectCss() {
    if (document.getElementById('mj-tabs-css')) return;
    var s = document.createElement('style'); s.id = 'mj-tabs-css';
    s.textContent = [
      '.mj-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 14px;padding:0;list-style:none}',
      '.mj-tab{font:600 11px/1 ui-monospace,monospace;letter-spacing:.03em;color:#9fb4cc;',
      'background:rgba(18,30,46,.55);border:1px solid rgba(90,130,180,.26);border-radius:8px;',
      'padding:7px 11px;cursor:pointer;transition:background .15s,color .15s,border-color .15s;white-space:nowrap}',
      '.mj-tab:hover{color:#e6f2ff;border-color:rgba(120,170,220,.5)}',
      '.mj-tab:focus-visible{outline:2px solid #7fe6ff;outline-offset:2px}',
      '.mj-tab[aria-selected="true"]{color:#04121f;background:linear-gradient(180deg,#8be9ff,#3ac6ec);border-color:#8be9ff}',
      '.mj-tabitem{display:none!important}',
      '.mj-tabitem.on{display:block!important;animation:mjfade .24s ease}',
      '@keyframes mjfade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}',
      '.mj-nav{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;',
      'padding-top:12px;border-top:1px solid rgba(90,130,180,.16)}',
      '.mj-nav button{font:600 12px ui-monospace,monospace;color:#cfe6ff;background:rgba(18,30,46,.6);',
      'border:1px solid rgba(90,130,180,.3);border-radius:8px;padding:8px 13px;cursor:pointer}',
      '.mj-nav button:hover:not(:disabled){border-color:rgba(130,180,230,.55)}',
      '.mj-nav button:disabled{opacity:.32;cursor:default}',
      '.mj-count{font:600 11px ui-monospace,monospace;color:#8ea6c2;letter-spacing:.05em}',
      '@media(prefers-reduced-motion:reduce){.mj-tabitem.on{animation:none}}',
      // projects: one card at a time, compacted so header+filters+card+nav fit without scrolling
      '#projects .p-bd>.lead{font-size:12px;margin:2px 0 6px}',
      '#projects .filters{gap:5px;margin:6px 0 8px}',
      '#projects .filters button{padding:5px 9px}',
      '#projects .proj-grid{display:block!important;margin:0}',
      '#projects .proj{margin:0}',
      '#projects .proj .top{padding:9px 14px}',
      '#projects .proj .bd{padding:12px 14px}'
    ].join('');
    document.head.appendChild(s);
  }

  function labelOf(el, max) {
    var h = el.querySelector('h2,h3,h4,h5,summary,.bt,.cat,.title,.k,strong,b'), t;
    if (h) t = h.textContent;
    else { var fc = el.firstElementChild; t = (fc && !fc.children.length) ? fc.textContent : el.textContent; }
    t = (t || '').replace(/\s+/g, ' ').trim();
    max = max || 20;
    return (t.length > max ? t.slice(0, max - 1).trim() + '…' : t) || 'Item';
  }

  /* Build a tablist. items: elements to page through (moved into a fresh body). anchor: node the
     strip+body are inserted before (its parent becomes the host). cleanup: wrappers to delete once
     emptied. Returns {select}. */
  function tabify(items, opts) {
    opts = opts || {};
    if (!items.length) return null;
    var anchor = opts.anchor || items[0], host = anchor.parentNode;
    var strip = document.createElement('div'); strip.className = 'mj-tabs'; strip.setAttribute('role', 'tablist');
    var body = document.createElement('div'); body.className = 'mj-tabbody';
    host.insertBefore(strip, anchor);
    host.insertBefore(body, anchor);
    items.forEach(function (it, i) {
      it.classList.add('mj-tabitem'); body.appendChild(it);
      if (opts.asDetails) { it.open = true; var sm = it.querySelector('summary'); if (sm) sm.style.display = 'none'; }
      var b = document.createElement('button'); b.type = 'button'; b.className = 'mj-tab';
      b.setAttribute('role', 'tab'); b.tabIndex = -1;
      b.textContent = opts.label ? opts.label(it, i) : labelOf(it, opts.max);
      b.addEventListener('click', function () { select(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select((i + 1) % items.length, true); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select((i - 1 + items.length) % items.length, true); }
      });
      strip.appendChild(b); it._btn = b;
    });
    (opts.cleanup || []).forEach(function (w) { if (w && !w.children.length) w.remove(); });
    function select(i, focus) {
      items.forEach(function (it, j) {
        it.classList.toggle('on', j === i);
        it._btn.setAttribute('aria-selected', j === i ? 'true' : 'false');
        it._btn.tabIndex = j === i ? 0 : -1;
      });
      if (focus) items[i]._btn.focus();
    }
    select(0);
    return { select: select };
  }

  // projects: keep the category filters, but show ONE project at a time with prev/next pagination
  function buildProjects(bd) {
    var filters = bd.querySelector('.filters'), grid = bd.querySelector('.proj-grid');
    if (!filters || !grid) return;
    var projs = [].slice.call(grid.querySelectorAll('.proj'));
    // drop the v4 filter handlers by replacing each button with a clone, then own the behaviour
    var btns = [].slice.call(filters.querySelectorAll('button')).map(function (b) { var c = b.cloneNode(true); b.replaceWith(c); return c; });
    var active = 'all', idx = 0;
    function match(cat, f) { return f === 'all' || cat === f || f.split('/').indexOf(cat) >= 0; }
    function filtered() { return projs.filter(function (p) { return match(p.getAttribute('data-cat'), active); }); }

    var nav = document.createElement('div'); nav.className = 'mj-nav';
    var prev = document.createElement('button'); prev.type = 'button'; prev.textContent = '‹ Prev';
    var count = document.createElement('span'); count.className = 'mj-count';
    var next = document.createElement('button'); next.type = 'button'; next.textContent = 'Next ›';
    nav.appendChild(prev); nav.appendChild(count); nav.appendChild(next);
    grid.after(nav);

    function render() {
      var list = filtered();
      projs.forEach(function (p) { p.style.display = 'none'; });
      if (list.length) { idx = Math.max(0, Math.min(idx, list.length - 1)); list[idx].style.display = ''; }
      count.textContent = list.length ? (idx + 1) + ' / ' + list.length : '0 / 0';
      prev.disabled = idx <= 0; next.disabled = idx >= list.length - 1;
      btns.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-f') === active); });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { active = b.getAttribute('data-f') || 'all'; idx = 0; render(); }); });
    prev.addEventListener('click', function () { idx--; render(); });
    next.addEventListener('click', function () { idx++; render(); });
    render();
  }

  // spec.wrap = CSS selector of layout wrapper(s) to hoist out of + remove; else items are direct
  // children of .p-bd and the strip is inserted before the first item in place.
  function run(id, spec) {
    var bd = document.querySelector('#' + id + ' .p-bd'); if (!bd) return;
    var items = [].slice.call(bd.querySelectorAll(spec.sel)); if (!items.length) return;
    var wrappers = spec.wrap ? [].slice.call(bd.querySelectorAll(spec.wrap)) : [];
    var anchor = wrappers.length ? wrappers[0] : items[0];
    tabify(items, { anchor: anchor, cleanup: wrappers, asDetails: spec.asDetails, max: spec.max, label: spec.label });
  }

  NS.buildPanelTabs = function () {
    if (NS._tabsDone) return; NS._tabsDone = true;
    injectCss();
    run('skills', { sel: '.proj-grid > .card', wrap: '.proj-grid', max: 16 });
    run('education', { sel: ':scope > details', asDetails: true, max: 22 });
    run('lab', { sel: '.grid2 > *', wrap: '.grid2', max: 20 });
    run('certifications', { sel: '.grid-auto > *', wrap: '.grid-auto', max: 18 });
    run('experience', { sel: '.tl > *', wrap: '.tl', max: 20 });
    run('troubleshooting', { sel: '.noc-grid > *', wrap: '.noc-grid', max: 24 });
    run('resume', { sel: ':scope > .block, :scope > .grid2', max: 18,
      label: function (el) { var bt = el.querySelector('.bt'); if (bt) return bt.textContent.trim().slice(0, 18); return el.classList.contains('grid2') ? 'Details' : labelOf(el, 18); } });
    var pb = document.querySelector('#projects .p-bd'); if (pb) buildProjects(pb);
  };
})(window.FacilityStations);
