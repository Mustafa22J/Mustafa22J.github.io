/* contact-wan-zones.js — Part D: restructure the Contact chapter into three clean zones so the
   contact terminal and the WAN world map stop overlapping.

     Zone A  #contact-terminal-ui : a compact contact console with TWO STATES — Details (methods)
             and Message (the real Formspree form) — that you toggle between (never both at once).
     Zone B  a fixed architectural GAP (no controls).
     Zone C  #wan-map-ui          : the simulated WAN world map, with ALL of its controls in the
             map bezel — top bar = title + live STATE badge; bottom bar = destination selector,
             Replay, Pause, Reset, and the route-status line.

   The form node is MOVED (not cloned) so the Formspree submit handler wired by wan-gateway.js stays
   attached. The map is drawn on a DOM <canvas> from the offline WORLD_GEO data and mirrors the real
   transfer state machine (window.__wanState). Fully keyboard accessible; honors reduced motion. */
window.FacilityStations = window.FacilityStations || {};
(function (NS) {
  'use strict';

  var DESTS = ['LHR', 'FRA', 'DXB', 'SIN', 'NRT', 'SYD', 'GRU', 'SFO'];

  function css() {
    if (document.getElementById('mj-wanzones-css')) return;
    var s = document.createElement('style'); s.id = 'mj-wanzones-css';
    s.textContent = [
      '#contact{justify-content:center!important}',
      '#contact .panel{width:min(1180px,94vw)!important;max-width:1180px!important}',
      '.mj-zones{display:flex;align-items:stretch;gap:clamp(64px,6vw,96px);margin-top:14px}',
      '#contact-terminal-ui{flex:1 1 380px;min-width:0;max-width:560px;display:flex;flex-direction:column}',
      '#wan-map-ui{flex:1.35 1 460px;min-width:0}',
      // Zone A console
      '.mj-seg{display:inline-flex;gap:4px;background:rgba(12,22,34,.7);border:1px solid rgba(90,130,180,.28);',
      'border-radius:9px;padding:4px;margin-bottom:12px;align-self:flex-start}',
      '.mj-seg button{font:600 12px ui-monospace,monospace;color:#9fb4cc;background:transparent;border:0;',
      'border-radius:6px;padding:7px 14px;cursor:pointer}',
      '.mj-seg button[aria-pressed="true"]{color:#04121f;background:linear-gradient(180deg,#8be9ff,#3ac6ec)}',
      '.mj-seg button:focus-visible{outline:2px solid #7fe6ff;outline-offset:2px}',
      '.mj-cstate{display:none}.mj-cstate.on{display:block;animation:mjfade .24s ease}',
      // Zone C bezel
      '.mj-bezel{border:1px solid rgba(90,130,180,.34);border-radius:14px;overflow:hidden;',
      'background:linear-gradient(180deg,rgba(12,22,34,.9),rgba(7,13,20,.92));box-shadow:0 10px 40px rgba(0,0,0,.4)}',
      '.mj-bztop{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;',
      'border-bottom:1px solid rgba(90,130,180,.2)}',
      '.mj-bztitle{font:600 11px ui-monospace,monospace;letter-spacing:.08em;color:#8fb6d8}',
      '.mj-state{font:700 11px ui-monospace,monospace;letter-spacing:.06em;padding:4px 9px;border-radius:20px;',
      'border:1px solid rgba(90,130,180,.35);color:#9be8ff}',
      '.mj-map{display:block;width:100%;height:auto;background:#06121e}',
      '.mj-bzbot{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 14px;',
      'border-top:1px solid rgba(90,130,180,.2)}',
      '.mj-bzbot label{font:600 11px ui-monospace,monospace;color:#8ea6c2;display:flex;align-items:center;gap:5px}',
      '.mj-bzbot select,.mj-bzbot button{font:600 11px ui-monospace,monospace;color:#cfe4f7;',
      'background:rgba(12,22,34,.8);border:1px solid rgba(90,130,180,.32);border-radius:7px;padding:6px 10px;cursor:pointer}',
      '.mj-bzbot button:hover{border-color:rgba(130,180,230,.6)}',
      '.mj-bzbot select:focus-visible,.mj-bzbot button:focus-visible{outline:2px solid #7fe6ff;outline-offset:2px}',
      '.mj-route{flex:1 1 100%;font:600 11px ui-monospace,monospace;color:#7f9ab6;margin-top:2px}',
      '@media(max-width:900px){.mj-zones{flex-direction:column;gap:22px}#contact-terminal-ui{max-width:none}',
      '#contact-terminal-ui,#wan-map-ui{flex-basis:auto!important}}',
      '@media(max-width:640px){#contact .panel{width:calc(100vw - 24px)!important;max-width:none!important}',
      '.mj-bzbot{gap:6px}.mj-bzbot select{max-width:44vw}.mj-bztitle{font-size:10px}',
      // let contact-link flex columns shrink so long emails/URLs wrap instead of forcing width
      '#contact .contact-link,#contact .contact-link *{min-width:0}',
      '#contact .contact-link .v,#contact .contact-link span{overflow-wrap:anywhere!important}}',
      '@media(prefers-reduced-motion:reduce){.mj-cstate.on{animation:none}}'
    ].join('');
    document.head.appendChild(s);
  }

  NS.buildContactZones = function (ctx) {
    if (NS._zonesDone) return; NS._zonesDone = true;
    var GEO = window.WORLD_GEO; if (!GEO) return;
    var contact = document.getElementById('contact'); if (!contact) return;
    var bd = contact.querySelector('.p-bd'); if (!bd) return;
    var grid = bd.querySelector('.grid2');
    var methods = grid && grid.firstElementChild;               // contact-links block
    var form = contact.querySelector('form');
    var oldA11y = contact.querySelector('.wan-a11y'); if (oldA11y) oldA11y.remove();
    if (!methods || !form) return;
    css();

    var zones = document.createElement('div'); zones.className = 'mj-zones';

    // ---------- Zone A: two-state contact console ----------
    var za = document.createElement('div'); za.id = 'contact-terminal-ui';
    var seg = document.createElement('div'); seg.className = 'mj-seg'; seg.setAttribute('role', 'tablist');
    seg.setAttribute('aria-label', 'Contact console view');
    var bDetails = document.createElement('button'); bDetails.type = 'button'; bDetails.textContent = '◈ Details';
    var bMsg = document.createElement('button'); bMsg.type = 'button'; bMsg.textContent = '✉ Message';
    [bDetails, bMsg].forEach(function (b) { b.setAttribute('role', 'tab'); seg.appendChild(b); });
    var sDetails = document.createElement('div'); sDetails.className = 'mj-cstate';
    var sMsg = document.createElement('div'); sMsg.className = 'mj-cstate';
    sDetails.appendChild(methods); sMsg.appendChild(form);       // MOVE nodes (keep handlers)
    za.appendChild(seg); za.appendChild(sDetails); za.appendChild(sMsg);
    function show(msg) {
      sMsg.classList.toggle('on', msg); sDetails.classList.toggle('on', !msg);
      bMsg.setAttribute('aria-selected', msg ? 'true' : 'false'); bDetails.setAttribute('aria-selected', msg ? 'false' : 'true');
      bMsg.setAttribute('aria-pressed', msg ? 'true' : 'false'); bDetails.setAttribute('aria-pressed', msg ? 'false' : 'true');
    }
    bDetails.addEventListener('click', function () { show(false); });
    bMsg.addEventListener('click', function () { show(true); });
    show(false);

    // ---------- Zone C: WAN map bezel with in-bezel controls ----------
    var zc = document.createElement('div'); zc.id = 'wan-map-ui';
    var bezel = document.createElement('div'); bezel.className = 'mj-bezel';
    var top = document.createElement('div'); top.className = 'mj-bztop';
    top.innerHTML = '<span class="mj-bztitle">WAN TRANSFER · SIMULATED VISUALIZATION</span>';
    var stateBadge = document.createElement('span'); stateBadge.className = 'mj-state'; stateBadge.textContent = 'STANDBY';
    top.appendChild(stateBadge);
    var canvas = document.createElement('canvas'); canvas.className = 'mj-map'; canvas.width = 760; canvas.height = 372;
    canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', 'Simulated world map of the WAN route from Ottawa to the selected destination');
    var bot = document.createElement('div'); bot.className = 'mj-bzbot';
    var lab = document.createElement('label'); lab.textContent = 'DEST';
    var sel = document.createElement('select'); sel.setAttribute('aria-label', 'Destination');
    DESTS.forEach(function (d) { var o = document.createElement('option'); o.value = d; o.textContent = d + ' · ' + (GEO.nodes[d] ? GEO.nodes[d].city : d); sel.appendChild(o); });
    lab.appendChild(sel);
    var bReplay = mkBtn('Replay'), bPause = mkBtn('Pause'), bReset = mkBtn('Reset');
    var route = document.createElement('div'); route.className = 'mj-route'; route.setAttribute('role', 'status'); route.setAttribute('aria-live', 'polite');
    bot.appendChild(lab); bot.appendChild(bReplay); bot.appendChild(bPause); bot.appendChild(bReset); bot.appendChild(route);
    bezel.appendChild(top); bezel.appendChild(canvas); bezel.appendChild(bot);
    zc.appendChild(bezel);

    zones.appendChild(za); zones.appendChild(zc); bd.appendChild(zones);

    function mkBtn(t) { var b = document.createElement('button'); b.type = 'button'; b.textContent = t; return b; }

    // ---------- controls wired to the shared transfer state ----------
    var S = window.__wanState || { state: 'STANDBY', dest: 'LHR', t: 0 };
    if (window.__wanState) sel.value = S.dest;
    sel.addEventListener('change', function () { if (window.__wanState) window.__wanState.dest = sel.value; });
    bReplay.addEventListener('click', function () { if (window.__wanReplay) window.__wanReplay(); else if (window.__wanBegin) window.__wanBegin(false); });
    bReset.addEventListener('click', function () { if (window.__wanReset) window.__wanReset(); });
    bPause.addEventListener('click', function () { window.__wanPaused = !window.__wanPaused; bPause.textContent = window.__wanPaused ? 'Resume' : 'Pause'; });
    window.__wanAnnounce = function (msg) { route.textContent = msg; };
    route.textContent = 'WAN STANDBY · route YOW → ' + (S.dest || 'LHR') + ' · simulated visualization';

    // ---------- DOM map rendering (offline WORLD_GEO) ----------
    var g = canvas.getContext('2d'), W = canvas.width, H = canvas.height, _oceanBg = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    function P(p) { return [p[0] * W, p[1] * H]; }
    function progressFor(st) {
      switch (st) { case 'STANDBY': case 'OFFLINE': return -1; case 'VALIDATING': return 0.06; case 'QUEUED': return 0.14;
        case 'ROUTING': return 0.3; case 'TRANSMITTING': return Math.max(0.32, S.t || 0); case 'ACKNOWLEDGED': case 'COMPLETE': return 1;
        case 'FAILED': return S.t || 0.4; default: return S.t || 0; }
    }
    function draw(now) {
      var st = (window.__wanState && window.__wanState.state) || 'STANDBY';
      var dest = (window.__wanState && window.__wanState.dest) || S.dest || 'LHR';
      var failed = st === 'FAILED', prog = progressFor(st);
      // ocean — gradient is constant (fixed canvas size), build it once and reuse
      if (!_oceanBg) { _oceanBg = g.createRadialGradient(W * 0.5, H * 0.44, 40, W * 0.5, H * 0.5, W * 0.62);
        _oceanBg.addColorStop(0, '#13324e'); _oceanBg.addColorStop(0.62, '#0d2238'); _oceanBg.addColorStop(1, '#081827'); }
      g.fillStyle = _oceanBg; g.fillRect(0, 0, W, H);
      // coastlines (brighter so land reads clearly at small scale)
      g.lineWidth = 1.3; g.lineJoin = 'round'; g.strokeStyle = 'rgba(150,202,242,0.78)'; g.fillStyle = 'rgba(40,84,120,0.72)';
      GEO.paths.forEach(function (ring) {
        if (ring.length < 2) return; g.beginPath(); var s0 = P(ring[0]); g.moveTo(s0[0], s0[1]);
        for (var i = 1; i < ring.length; i++) { var s = P(ring[i]); g.lineTo(s[0], s[1]); }
        g.closePath(); g.fill(); g.stroke();
      });
      // nodes
      var yow = GEO.nodes.YOW, dn = GEO.nodes[dest];
      Object.keys(GEO.nodes).forEach(function (k) { var q = P(GEO.nodes[k].p);
        g.beginPath(); g.arc(q[0], q[1], 2, 0, 7); g.fillStyle = 'rgba(170,208,240,0.7)'; g.fill(); });
      if (yow && dn) {
        var a = P(yow.p), b = P(dn.p), cx = (a[0] + b[0]) / 2, cy = Math.min(a[1], b[1]) - Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.28;
        // full route (faint)
        g.lineWidth = 1.4; g.strokeStyle = 'rgba(90,140,180,0.35)'; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(cx, cy, b[0], b[1]); g.stroke();
        // travelled portion
        if (prog >= 0) {
          g.lineWidth = 2.4; g.strokeStyle = failed ? 'rgba(255,107,94,0.9)' : 'rgba(90,232,255,0.95)';
          g.beginPath(); g.moveTo(a[0], a[1]);
          for (var t = 0; t <= prog; t += 0.02) { var pt = qbez(a, [cx, cy], b, t); g.lineTo(pt[0], pt[1]); }
          g.stroke();
          // packet
          var pk = qbez(a, [cx, cy], b, prog), pulse = reduce ? 3 : 3 + 1.6 * Math.sin(now * 0.006);
          g.beginPath(); g.arc(pk[0], pk[1], pulse, 0, 7); g.fillStyle = failed ? '#ff8a7e' : '#bdf3ff'; g.fill();
        }
        // origin + dest markers
        marker(a, '#6fe0a0', 'YOW'); marker(b, failed ? '#ff6b5e' : (prog >= 1 ? '#6fe0a0' : '#9be8ff'), dest);
      }
      // state badge + route text
      stateBadge.textContent = st; stateBadge.style.color = failed ? '#ff8a7e' : (prog >= 1 ? '#6fe0a0' : '#9be8ff');
      stateBadge.style.borderColor = failed ? 'rgba(255,107,94,0.5)' : 'rgba(90,130,180,0.35)';
    }
    function marker(p, color, label) {
      g.beginPath(); g.arc(p[0], p[1], 3.4, 0, 7); g.fillStyle = color; g.fill();
      g.font = 'bold 10px ui-monospace,monospace'; g.fillStyle = 'rgba(8,16,24,0.72)';
      var w = g.measureText(label).width; g.fillRect(p[0] + 5, p[1] - 12, w + 6, 13);
      g.fillStyle = color; g.fillText(label, p[0] + 8, p[1] - 2);
    }
    function qbez(a, c, b, t) { var u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; }

    // draw once synchronously so the very first frame (and headless single-frame capture) shows the map
    try { draw(0); } catch (e) {}
    // keep it live off a single rAF, but only do the (allocating) draw when the map is on-screen and
    // not paused — offscreen the loop is a cheap flag check. Throttled; honors reduced motion.
    var last = 0, visible = true;
    if ('IntersectionObserver' in window) {
      visible = false;
      new IntersectionObserver(function (es) { es.forEach(function (e) { visible = e.isIntersecting; if (visible) { try { draw(0); } catch (_) {} } }); }, { threshold: 0.01 }).observe(contact);
    }
    function tick(now) {
      requestAnimationFrame(tick);
      if (window.__wanPaused || !visible) return;
      if (now - last > (reduce ? 400 : 60)) { last = now; try { draw(now); } catch (e) {} }
    }
    requestAnimationFrame(tick);
    return { redraw: draw };
  };
})(window.FacilityStations);
