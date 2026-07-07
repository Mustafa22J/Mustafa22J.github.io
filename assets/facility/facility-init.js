/* facility-init.js — orchestrates the Milestone B physical stations.
   Called once by the scene (window.__facility.initAll) after the scene exposes internals. */
window.FacilityStations = window.FacilityStations || {};
(function (NS) {
  'use strict';
  NS.initAll = function (ctx) {
    if (NS._done) return; NS._done = true;
    var built = {};
    function step(name, fn) { try { if (fn) built[name] = fn(ctx, built); } catch (e) { console.warn('[facility] ' + name + ' failed', e); } }
    step('core', NS.buildCoreCabinet);
    step('admin', NS.buildAdminStation);
    // the physical layer (L1) is built inside the consolidated OSI bay
    step('osi', NS.buildOsiStations);
    step('portfolio', NS.buildPortfolioStations);
    step('wan', NS.buildWanGateway);
    step('cabling', NS.buildStructuredCabling);
    step('fibre', NS.buildStationFibre);
    try { if (NS.buildPanelTabs) NS.buildPanelTabs(); } catch (e) { console.warn('[facility] panel tabs failed', e); }
    try { if (NS.buildContactZones) NS.buildContactZones(ctx); } catch (e) { console.warn('[facility] contact zones failed', e); }

    // a11y: nav scroll-spy — mark the in-view chapter's nav links with aria-current="location"
    try {
      if ('IntersectionObserver' in window) {
        var navLinks = [].slice.call(document.querySelectorAll('nav a[href^="#"]'));
        var byHash = {}; navLinks.forEach(function (a) { var h = a.getAttribute('href').slice(1); if (h) { (byHash[h] = byHash[h] || []).push(a); } });
        var chapters = [].slice.call(document.querySelectorAll('.chapter[id]'));
        var visible = {};
        var setCurrent = function (id) { navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
          (byHash[id] || []).forEach(function (a) { a.setAttribute('aria-current', 'location'); }); };
        var spy = new IntersectionObserver(function (es) {
          es.forEach(function (e) { visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
          var best = null, bestR = 0; Object.keys(visible).forEach(function (id) { if (visible[id] > bestR) { bestR = visible[id]; best = id; } });
          if (best) setCurrent(best);
        }, { threshold: [0.25, 0.5, 0.75], rootMargin: '-20% 0px -20% 0px' });
        chapters.forEach(function (c) { spy.observe(c); });
      }
    } catch (e) { console.warn('[facility] nav spy failed', e); }
    try { if (NS.makeCameraDirector) ctx.cameraDirector = NS.makeCameraDirector(ctx, built); } catch (e) { console.warn('[facility] camera director failed', e); }
    try { if (NS.initOsiState) built.osiState = NS.initOsiState(ctx, built); } catch (e) { console.warn('[facility] osi state failed', e); }
    ctx.stations = built;
    console.log('[facility] stations initialized:', Object.keys(built).join(', ') || '(none)');

    // ?view=<domId> — deterministic positioning for headless screenshots (QA aid; inert without the param)
    try {
      // ?cam=<index>[&nopanel=1] — pin the camera to a route node WITHOUT scrolling (robust for
      // headless capture of deep stations, since scrolling a very tall page yields a blank frame).
      var cm = /[?&]cam=(\d+)/.exec(location.search);
      if (cm) {
        var idx = parseInt(cm[1], 10); var R = window.FACILITY_ROUTE;
        if (R && R.nodes[idx]) {
          var zc = R.z[idx], sd = R.nodes[idx].side; window.__calm = true; window.__pinIdx = idx;
          ctx.cameraDirector = (idx === R.byId.contact.i)
            ? function (st, camera, look) { camera.position.set(0.2, 1.74, zc + 1.5); look.set(0, 1.9, zc - 3.4); }   // frame the wall-mounted WAN world map + room
            : (idx === 1)
              ? function (st, camera, look) { camera.position.set(0.58, 1.60, zc + 2.6); look.set(1.11, 1.53, zc - 0.56); }  // About: portrait monitor right-of-centre (matches reading composition)
              : function (st, camera, look) { camera.position.set(sd * 0.55, 1.52, zc + 3.6); look.set(sd * 1.35, 1.45, zc - 0.3); };
          if (/[?&]nopanel=1/.test(location.search)) { var sc = document.createElement('style'); sc.textContent = '.chapter{opacity:0!important}'; document.head.appendChild(sc); }
        }
      }
      // ?panel=<id> — headless-friendly panel QA: fix one panel centered on a dark backdrop and
      // hide the WebGL canvas, so a headless screenshot captures the DOM panel content crisply
      // (scrolling a tall page in headless yields a blank 3D frame; this avoids scrolling entirely).
      var pm = /[?&]panel=([a-zA-Z]+)/.exec(location.search);
      if (pm) {
        var pid = pm[1], ps = document.createElement('style');
        ps.textContent = 'canvas{opacity:0!important}body{overflow:hidden!important}'
          + '.chapter{position:static!important}.reveal{opacity:1!important;transform:none!important}'
          + '#' + pid + '{position:fixed!important;inset:0!important;display:flex!important;'
          + 'align-items:center!important;justify-content:center!important;z-index:99999!important;'
          + 'padding:16px!important;background:radial-gradient(circle at 50% 38%,#0c1a29,#05090f)!important}'
          // keep the panel inside the padded QA frame so captures reflect the real fit (don't let the
          // panel's own vw-based width push it past the viewport in this fixed overlay)
          + '#' + pid + ' .panel{max-width:calc(100vw - 32px)!important;margin:0!important}';
        document.head.appendChild(ps);
        window.__calm = true;
      }
      var vm = /[?&]view=([a-zA-Z0-9]+)/.exec(location.search);
      if (vm) {
        var target = vm[1];
        // snap camera (calm => smoothCF jumps to target) and force-reveal panels for deterministic capture
        window.__calm = true; document.body.classList.add('calm');
        var st = document.createElement('style'); st.textContent = '.reveal{opacity:1!important;transform:none!important}'; document.head.appendChild(st);
        var go = function () { var el = document.getElementById(target); if (!el) return; var r = el.getBoundingClientRect(); var y = r.top + window.scrollY + r.height / 2 - innerHeight / 2; window.scrollTo(0, Math.max(0, y)); };
        setTimeout(go, 300); setTimeout(go, 1000); setTimeout(go, 2200); setTimeout(go, 4000);
      }
    } catch (e) {}
  };
})(window.FacilityStations);
