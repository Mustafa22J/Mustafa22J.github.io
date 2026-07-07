/* osi-state.js — C8 + C11: OSI packet state machine + compact, accessible OSI console that
   replaces the large seven-row accordion. One shared state drives all seven console mounts,
   the active layer, the PDU, the direction, and (via scroll) the camera destination. Verified
   layer descriptions/work notes are preserved in FACILITY_ROUTE.osi and shown on Inspect. */
window.FacilityStations = window.FacilityStations || {};
(function (NS) {
  'use strict';

  NS.initOsiState = function (ctx) {
    var R = window.FACILITY_ROUTE; if (!R) return null;
    var L = R.osi;
    var order = [1, 2, 3, 4, 5, 6, 7];

    var STATE = { direction: 'up', mode: 'encapsulate', activeLayer: 1, paused: false,
      transportProtocol: 'TCP', pdu: L[1].pdu, application: 'HTTPS' };
    window.OSI_STATE = STATE;

    injectStyles();
    // remove the legacy accordion + its heading text as the primary interface (content preserved in data)
    var legacy = document.getElementById('osi-list'); if (legacy) legacy.parentNode.removeChild(legacy);

    var mounts = [].slice.call(document.querySelectorAll('.osi-console'));
    mounts.forEach(function (m) { buildConsole(m); });
    render();
    // OSI is one physical bay/chapter: layer selection updates the bay + display in place (no scroll).

    return { STATE: STATE, setLayer: setLayer, sendUp: sendUp, sendDown: sendDown, reset: reset, api: true };

    // ---------- console DOM ----------
    function buildConsole(mount) {
      var self = parseInt(mount.getAttribute('data-osi-layer'), 10) || 1;
      mount.setAttribute('role', 'group');
      mount.setAttribute('aria-label', 'OSI stack console');
      var layersHTML = order.map(function (n) {
        return '<button class="osi-l" role="tab" data-layer="' + n + '" aria-selected="false" ' +
          'style="--la:' + L[n].acc + '" title="Layer ' + n + ' · ' + L[n].name + '" ' +
          'aria-label="Layer ' + n + ' ' + L[n].name + '"><b>' + n + '</b><span>' + L[n].name + '</span></button>';
      }).join('');
      mount.innerHTML =
        '<div class="osi-c">' +
          '<div class="osi-c-top"><span class="osi-c-kicker">OSI STACK · CONSOLE</span>' +
            '<span class="osi-c-dir" data-dir></span></div>' +
          '<div class="osi-c-layers" role="tablist" aria-label="Select OSI layer">' + layersHTML + '</div>' +
          '<div class="osi-c-cur"><span class="osi-c-ln" data-ln></span><span class="osi-c-pdu" data-pdu></span></div>' +
          '<p class="osi-c-sum" data-sum></p>' +
          '<div class="osi-c-ctl">' +
            '<button class="oc-btn" data-act="up" title="Encapsulate up the stack">▲ Send Up</button>' +
            '<button class="oc-btn" data-act="down" title="Decapsulate down the stack">▼ Send Down</button>' +
            '<button class="oc-btn" data-act="pause">⏸ Pause</button>' +
            '<button class="oc-btn" data-act="reset">⟲ Reset</button>' +
            '<button class="oc-btn" data-act="inspect" aria-expanded="false" aria-controls="osidet-' + self + '">🔍 Inspect</button>' +
          '</div>' +
          '<div class="osi-c-det" id="osidet-' + self + '" data-det hidden></div>' +
          '<div class="osi-c-live sr-only" aria-live="polite" data-live></div>' +
        '</div>';
      mount.querySelectorAll('.osi-l').forEach(function (b) {
        b.addEventListener('click', function () { setLayer(parseInt(b.getAttribute('data-layer'), 10)); });
      });
      mount.querySelectorAll('.oc-btn').forEach(function (b) {
        b.addEventListener('click', function () { act(b.getAttribute('data-act'), mount); });
      });
    }

    function act(a, mount) {
      if (a === 'up') sendUp();
      else if (a === 'down') sendDown();
      else if (a === 'pause') togglePause();
      else if (a === 'reset') reset();
      else if (a === 'inspect') toggleInspect(mount);
    }

    // ---------- state transitions ----------
    function setLayer(n) {
      n = Math.max(1, Math.min(7, n));
      STATE.activeLayer = n; STATE.pdu = L[n].pdu;
      render();
      announce('Layer ' + n + ' · ' + L[n].name + ', PDU ' + L[n].pdu);
    }
    function sendUp() { STATE.direction = 'up'; STATE.mode = 'encapsulate'; setLayer(STATE.activeLayer + 1); }
    function sendDown() { STATE.direction = 'down'; STATE.mode = 'decapsulate'; setLayer(STATE.activeLayer - 1); }
    function reset() { STATE.direction = 'up'; STATE.mode = 'encapsulate'; STATE.paused = false; window.__osiPaused = false; setLayer(1); }
    function togglePause() { STATE.paused = !STATE.paused; window.__osiPaused = STATE.paused; render(); announce(STATE.paused ? 'Paused' : 'Resumed'); }


    // ---------- render ----------
    function render() {
      var n = STATE.activeLayer, d = L[n];
      document.querySelectorAll('.osi-console').forEach(function (mount) {
        mount.querySelectorAll('.osi-l').forEach(function (b) {
          var bn = parseInt(b.getAttribute('data-layer'), 10);
          var on = bn === n; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.classList.toggle('on', on);
        });
        set(mount, '[data-dir]', (STATE.mode === 'encapsulate' ? '▲ ENCAPSULATE' : '▼ DECAPSULATE') + (STATE.paused ? ' · PAUSED' : ''));
        set(mount, '[data-ln]', 'L' + n + ' · ' + d.name);
        set(mount, '[data-pdu]', 'PDU: ' + d.pdu);
        set(mount, '[data-sum]', d.summary);
        var pb = mount.querySelector('[data-act=pause]'); if (pb) pb.textContent = STATE.paused ? '▶ Resume' : '⏸ Pause';
        var det = mount.querySelector('[data-det]');
        if (det && !det.hidden) det.innerHTML = detailHTML(n);
      });
    }
    function detailHTML(n) {
      var d = L[n];
      return '<div class="oc-bt">' + d.aTitle + '</div><div class="oc-chips">' +
        d.a.map(function (c) { return '<span class="oc-chip">' + c + '</span>'; }).join('') + '</div>' +
        '<div class="oc-bt">How I\'ve worked here</div><p class="oc-work">' + d.work + '</p>';
    }
    function toggleInspect(mount) {
      var det = mount.querySelector('[data-det]'); var btn = mount.querySelector('[data-act=inspect]');
      var open = det.hidden; det.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) det.innerHTML = detailHTML(STATE.activeLayer);
    }
    function announce(msg) { document.querySelectorAll('.osi-c-live').forEach(function (l) { l.textContent = msg; }); }

    function set(root, sel, txt) { var e = root.querySelector(sel); if (e) e.textContent = txt; }
    function throttle(fn, ms) { var t = 0, last = 0; return function () { var now = performance.now(); if (now - last > ms) { last = now; fn(); } else { clearTimeout(t); t = setTimeout(function () { last = performance.now(); fn(); }, ms); } }; }

    function injectStyles() {
      if (document.getElementById('osi-console-css')) return;
      var s = document.createElement('style'); s.id = 'osi-console-css';
      s.textContent =
        '.sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}' +
        '.osi-c{font:13px/1.4 ui-monospace,monospace;color:#cfe4f7}' +
        '.osi-c-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}' +
        '.osi-c-kicker{letter-spacing:.12em;font-size:11px;color:#7fb8e0}' +
        '.osi-c-dir{font-size:11px;color:#9be8ff;font-weight:700}' +
        '.osi-c-layers{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}' +
        '.osi-l{flex:1 1 auto;min-width:56px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:7px 4px;' +
          'background:rgba(10,20,32,.7);border:1px solid rgba(120,160,210,.22);border-radius:8px;color:#9fc0dd;cursor:pointer;transition:.15s}' +
        '.osi-l b{font-size:15px;color:#eaf4ff}.osi-l span{font-size:9px;letter-spacing:.03em;opacity:.8}' +
        '.osi-l:hover{border-color:var(--la);color:#eaf4ff}' +
        '.osi-l.on{background:color-mix(in srgb,var(--la) 22%,rgba(10,20,32,.7));border-color:var(--la);box-shadow:0 0 0 1px var(--la),0 0 16px -6px var(--la);color:#fff}' +
        '.osi-c-cur{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}' +
        '.osi-c-ln{font-size:17px;font-weight:700;color:#eaf4ff}.osi-c-pdu{font-size:12px;color:#9be8ff}' +
        '.osi-c-sum{margin:0 0 12px;color:#a9c2d8;font-size:12.5px}' +
        '.osi-c-ctl{display:flex;gap:6px;flex-wrap:wrap}' +
        '.oc-btn{flex:1 1 auto;padding:8px 6px;background:rgba(12,22,34,.85);border:1px solid rgba(120,160,210,.28);border-radius:8px;' +
          'color:#cfe4f7;cursor:pointer;font:600 12px ui-monospace,monospace;transition:.15s}' +
        '.oc-btn:hover{border-color:#5ad2ff;color:#fff}.oc-btn:focus-visible{outline:2px solid #5ad2ff;outline-offset:2px}' +
        '.osi-l:focus-visible{outline:2px solid #5ad2ff;outline-offset:2px}' +
        '.osi-c-det{margin-top:12px;padding-top:12px;border-top:1px solid rgba(120,160,210,.18)}' +
        '.oc-bt{font-size:10px;letter-spacing:.1em;color:#7fb8e0;margin:8px 0 6px}' +
        '.oc-chips{display:flex;flex-wrap:wrap;gap:5px}.oc-chip{font-size:11px;padding:3px 8px;background:rgba(90,210,255,.1);' +
          'border:1px solid rgba(90,210,255,.25);border-radius:20px;color:#bfe4ff}' +
        '.oc-work{margin:6px 0 0;color:#a9c2d8;font-size:12px}';
      document.head.appendChild(s);
    }
  };
})(window.FacilityStations);
