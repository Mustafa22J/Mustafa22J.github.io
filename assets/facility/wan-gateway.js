/* wan-gateway.js — Chapter 11: WAN Edge & Contact Gateway (route node 17), the facility climax.
   A distinct, deeper WAN operations chamber: doorway portal, floor-to-ceiling WAN edge racks,
   optical/fibre-termination equipment, overhead cable trays, and a large WALL-MOUNTED, framed,
   layered-glass world map (Equal Earth projection of public-domain Natural Earth data — offline,
   see world-geo.js) with an accurate Ottawa origin, destination nodes, geodesic-style routes, and
   a travelling packet driven by a real transfer STATE MACHINE. The visual journey is clearly
   labelled "SIMULATED WAN TRANSFER"; the real Formspree submission result is what actually gates it.
   Accessible status + controls live in semantic DOM. */
window.FacilityStations = window.FacilityStations || {};
(function (NS) {
  'use strict';

  var STATES = ['OFFLINE', 'STANDBY', 'VALIDATING', 'QUEUED', 'ROUTING', 'TRANSMITTING', 'ACKNOWLEDGED', 'COMPLETE', 'FAILED', 'RETRY'];
  var DEST_ORDER = ['LHR', 'FRA', 'DXB', 'SIN', 'NRT', 'SYD', 'GRU', 'SFO'];

  NS.buildWanGateway = function (ctx) {
    var THREE = ctx.THREE, C = NS, R = window.FACILITY_ROUTE, GEO = window.WORLD_GEO;
    if (!R || !GEO) { console.warn('[wan] missing route/geo'); return null; }
    var node = R.byId.contact, z = node.z, side = node.side, fx = 0.5;
    var endZ = z - 3.8;                 // far wall (deeper chamber)
    var scene = ctx.scene;

    var steel = new THREE.MeshStandardMaterial({ color: 0x0c131d, metalness: 0.55, roughness: 0.5 });
    var graphite = new THREE.MeshStandardMaterial({ color: 0x14202c, metalness: 0.65, roughness: 0.42 });
    var darkPanel = new THREE.MeshStandardMaterial({ color: 0x0a1119, metalness: 0.4, roughness: 0.6 });

    // ---------- room architecture ----------
    // far wall + flanking architectural panels
    scene.add(mesh(new THREE.PlaneGeometry(11, 3.8), darkPanel, 0, 1.9, endZ));
    for (var sp = -1; sp <= 1; sp += 2) scene.add(box(0.5, 3.8, 0.14, graphite, sp * 3.6, 1.9, endZ + 0.08));
    scene.add(box(11, 0.16, 0.2, graphite, 0, 3.75, endZ + 0.12));           // header beam
    scene.add(box(11, 0.16, 0.2, graphite, 0, 0.08, endZ + 0.12));           // base plinth
    // recessed ceiling panel over the room with a cool light strip
    var ceilPanel = mesh(new THREE.PlaneGeometry(7, 6.5), new THREE.MeshStandardMaterial({ color: 0x0b131d, metalness: 0.3, roughness: 0.7 }), 0, 3.34, endZ + 3.2);
    ceilPanel.rotation.x = Math.PI / 2; scene.add(ceilPanel);
    var strip = box(3.4, 0.05, 0.5, new THREE.MeshBasicMaterial({ color: 0xdfeeff }), 0, 3.3, endZ + 3.2); scene.add(strip);
    // doorway portal you pass through to enter the room
    var portalZ = z + 1.4;
    [[-2.0, 1.6, 0.14, 3.2], [2.0, 1.6, 0.14, 3.2], [0, 3.15, 4.14, 0.2]].forEach(function (p) {
      scene.add(box(p[2], p[3], 0.3, graphite, p[0], p[1], portalZ));
    });
    for (var gp = -1; gp <= 1; gp += 2) {                                      // glass partition beside the doorway
      var part = mesh(new THREE.PlaneGeometry(1.0, 2.9), new THREE.MeshPhysicalMaterial({ color: 0x0a1a2e, transparent: true, opacity: 0.14, roughness: 0.1, clearcoat: 0.6 }), gp * 2.6, 1.6, portalZ);
      scene.add(part);
    }
    // overhead cable trays running to the wall
    for (var tx = -1; tx <= 1; tx += 2) { var tray = box(0.16, 0.08, 5.5, graphite, tx * 1.1, 3.02, (portalZ + endZ) / 2); scene.add(tray);
      for (var b = 0; b < 6; b++) scene.add(box(0.12, 0.02, 0.02, steel, tx * 1.1, 2.98, portalZ - b * 1.0)); }

    // ---------- floor-to-ceiling WAN edge racks + edge routers flanking the map ----------
    var leds = [], routerGlow = [];
    [-2.55, 2.55].forEach(function (x, idx) {
      scene.add(box(1.0, 3.5, 1.0, steel, x, 1.75, endZ + 0.6));              // tall cabinet body
      for (var r = 0; r < 9; r++) { var yb = 0.5 + r * 0.35;
        var bez = box(0.05, 0.24, 0.8, graphite, x + (x < 0 ? 0.5 : -0.5), yb, endZ + 0.6); scene.add(bez);
        for (var q = 0; q < 6; q++) { var l = C.led(ctx, q % 3 === 0 ? 0x5a9dff : 0x6fe0a0); l.position.set(x + (x < 0 ? 0.53 : -0.53), yb + 0.06, endZ + 0.6 - 0.3 + q * 0.12); scene.add(l); leds.push(l); if (r < 3) routerGlow.push(l); } }
      scene.add(labelPlane('WAN-EDGE-0' + (idx + 1) + ' · OPTICAL', x + (x < 0 ? 0.54 : -0.54), 3.35, endZ + 0.6, x < 0 ? -Math.PI / 2 : Math.PI / 2, '#9be8ff', 20));
    });
    // fibre termination panel + uplink risers from routers up to the map
    var fibreMat = new THREE.MeshBasicMaterial({ color: 0x35e0f1, transparent: true, opacity: 0.5 });
    var uplinks = [];
    [-1.6, 1.6].forEach(function (x) {
      var up = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
        new THREE.Vector3(x * 1.6, 0.9, endZ + 1.05), new THREE.Vector3(x * 0.9, 1.5, endZ + 0.6), new THREE.Vector3(x * 0.55, 2.0, endZ + 0.2)
      ]), 20, 0.012, 6, false), fibreMat.clone());
      scene.add(up); uplinks.push(up.material);
    });

    // ---------- layered-glass world map on the wall ----------
    var cvW = 1400, cvH = 684, cv = document.createElement('canvas'); cv.width = cvW; cv.height = cvH;
    var g = cv.getContext('2d'); var tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    var mapW = 5.6, mapH = mapW * cvH / cvW, mapY = 1.78, mapZ = endZ + 0.06;
    // L1 frame (graphite, bevel, bolts, label) — kept BEHIND the map plane (mapZ+0.02)
    scene.add(box(mapW + 0.18, mapH + 0.18, 0.06, new THREE.MeshStandardMaterial({ color: 0x1a2634, metalness: 0.75, roughness: 0.35 }), 0, mapY, mapZ - 0.05));
    scene.add(box(mapW + 0.05, mapH + 0.05, 0.05, new THREE.MeshStandardMaterial({ color: 0x0c141d, metalness: 0.6, roughness: 0.5 }), 0, mapY, mapZ - 0.04));
    var boltMat = new THREE.MeshStandardMaterial({ color: 0x38506a, metalness: 0.85, roughness: 0.25 });
    for (var bx = -1; bx <= 1; bx += 2) for (var byy = -1; byy <= 1; byy += 2) { var bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 10), boltMat); bolt.rotation.x = Math.PI / 2; bolt.position.set(bx * (mapW / 2 + 0.05), mapY + byy * (mapH / 2 + 0.05), mapZ + 0.02); scene.add(bolt); }
    scene.add(labelPlane('WAN-MAP-01 · 10G OPTICAL', 0, mapY - mapH / 2 - 0.12, mapZ + 0.02, 0, '#7fb0d6', 16));
    // L3 map surface (opaque canvas -> opaque pass, correct depth under the glass overlay)
    var mapMesh = mesh(new THREE.PlaneGeometry(mapW, mapH), new THREE.MeshBasicMaterial({ map: tex }), 0, mapY, mapZ + 0.02); scene.add(mapMesh);
    // L2 outer glass (transparent overlay; depthWrite:false so it never occludes the map)
    scene.add(mesh(new THREE.PlaneGeometry(mapW, mapH), new THREE.MeshPhysicalMaterial({ color: 0x0a1626, transparent: true, opacity: 0.1, depthWrite: false, roughness: 0.09, metalness: 0, clearcoat: 0.85, clearcoatRoughness: 0.14, reflectivity: 0.6 }), 0, mapY, mapZ + 0.06));
    // thin cool-white edge
    scene.add(box(mapW, 0.012, 0.02, new THREE.MeshBasicMaterial({ color: 0xbcd7f2 }), 0, mapY - mapH / 2, mapZ + 0.05));
    // L7 floor reflection (soft, dim) + map light on the room
    var refl = mesh(new THREE.PlaneGeometry(mapW * 0.9, mapH * 0.7), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.09, depthWrite: false }), 0, 0.02, endZ + 1.4);
    refl.rotation.x = -Math.PI / 2; refl.scale.y = -1; scene.add(refl);
    var mapLight = new THREE.PointLight(0x6fb6e6, 1.4, 9, 2); mapLight.position.set(0, 1.9, endZ + 1.2); scene.add(mapLight);

    // ---------- contact terminal (rack-origin glass on the side) ----------
    var term = NS.createRackDisplay(ctx, { fx: fx, y: 1.5, z: 0, accent: 0x35e0f1, w: 0.82, h: 0.52, cvW: 460, cvH: 300 });
    var termRoot = new THREE.Group(); termRoot.add(term.group); C.placeStation(ctx, termRoot, side, z, 1.05);
    term.setOpen(1);

    // ---------- transfer state machine ----------
    var S = { state: 'STANDBY', dest: 'LHR', t: 0, hb: 0, real: false };
    window.__wanState = S;
    function setState(s) { S.state = s; announce(wanLine()); drawTerm(); }
    function pickDest() { S.dest = DEST_ORDER[(DEST_ORDER.indexOf(S.dest) + 1) % DEST_ORDER.length]; }
    function begin(real) { S.real = !!real; S.t = 0; setState('VALIDATING'); step('QUEUED', 300); step('ROUTING', 700); step('TRANSMITTING', 1100); }
    function fail() { S.state = 'FAILED'; S.t = Math.min(S.t, 0.45); announce(wanLine()); drawTerm(); }
    function reset() { S.state = 'STANDBY'; S.t = 0; announce(wanLine()); drawTerm(); }
    function replay() { pickDest(); begin(false); }
    var timers = [];
    function step(s, ms) { timers.push(setTimeout(function () { if (S.state !== 'FAILED') setState(s); }, ms)); }
    // public: real form flow / QA mock both funnel through here
    window.__wanTransmit = function (ok) { if (ok) { begin(false); } else { fail(); } };
    window.__wanBegin = begin; window.__wanFail = fail; window.__wanReset = reset;

    function wanLine() {
      return 'WAN ' + S.state + ' · route YOW → ' + S.dest + ' · ' + (S.real ? 'real submission' : 'simulated visualization');
    }

    // ---------- premium map rendering ----------
    var paths = GEO.paths, nodes = GEO.nodes;
    function px(p) { return [p[0] * cvW, p[1] * cvH]; }
    var _oceanBg = null;
    function drawMap(now) {
      // background: deep-navy ocean with a soft central glow; darker so land + coastlines pop.
      // gradient is constant (fixed canvas size) — build it once and reuse.
      if (!_oceanBg) { _oceanBg = g.createRadialGradient(cvW * 0.5, cvH * 0.44, 60, cvW * 0.5, cvH * 0.52, cvW * 0.62);
        _oceanBg.addColorStop(0, '#0e2338'); _oceanBg.addColorStop(0.62, '#091a2b'); _oceanBg.addColorStop(1, '#06121e'); }
      g.fillStyle = _oceanBg; g.fillRect(0, 0, cvW, cvH);
      // faint graticule
      g.strokeStyle = 'rgba(95,135,178,0.13)'; g.lineWidth = 1;
      for (var i = 1; i < 12; i++) { var x = i / 12 * cvW; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, cvH); g.stroke(); }
      for (var j = 1; j < 6; j++) { var y = j / 6 * cvH; g.beginPath(); g.moveTo(0, y); g.lineTo(cvW, y); g.stroke(); }
      // land: clear fill + bold bright coastline (reads at wall-display scale)
      g.lineWidth = 2.4; g.lineJoin = 'round';
      for (var k = 0; k < paths.length; k++) { var ring = paths[k]; g.beginPath();
        for (var m = 0; m < ring.length; m++) { var q = px(ring[m]); m ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }
        g.closePath(); g.fillStyle = 'rgba(30,58,92,0.92)'; g.fill(); g.strokeStyle = 'rgba(160,205,244,0.96)'; g.stroke(); }
      // routes
      var o = px(nodes.YOW.p);
      DEST_ORDER.forEach(function (dk) {
        var p = px(nodes[dk].p); var active = (dk === S.dest) && /ROUTING|TRANSMITTING|ACKNOWLEDGED|COMPLETE|FAILED/.test(S.state);
        var cx = (o[0] + p[0]) / 2, cy = (o[1] + p[1]) / 2 - Math.hypot(p[0] - o[0], p[1] - o[1]) * 0.32;
        g.beginPath(); g.moveTo(o[0], o[1]); g.quadraticCurveTo(cx, cy, p[0], p[1]);
        if (active) { g.strokeStyle = S.state === 'FAILED' ? 'rgba(255,120,100,0.92)' : 'rgba(132,228,255,0.96)'; g.lineWidth = 3.2; g.shadowColor = S.state === 'FAILED' ? '#ff6b5e' : '#5fd0ff'; g.shadowBlur = 9; }
        else { g.strokeStyle = 'rgba(120,162,206,0.3)'; g.lineWidth = 1.4; g.shadowBlur = 0; }
        g.stroke(); g.shadowBlur = 0;
        // dest node
        g.fillStyle = active ? (S.state === 'COMPLETE' ? '#5fe0a0' : '#c9f7ff') : '#6f97be';
        g.beginPath(); g.arc(p[0], p[1], active ? 6.5 : 4, 0, 7); g.fill();
        g.fillStyle = active ? 'rgba(232,244,255,.98)' : 'rgba(172,200,226,.72)'; g.font = (active ? 'bold ' : '') + '17px system-ui,sans-serif';
        g.fillText(dk, p[0] + 10, p[1] - 7);
        // packet on active route
        if (active && /TRANSMITTING|ROUTING/.test(S.state)) { var tt = Math.min(1, S.t); var bxp = bez(o[0], cx, p[0], tt), byp = bez(o[1], cy, p[1], tt);
          g.fillStyle = '#eaffff'; g.shadowColor = '#8fd8ff'; g.shadowBlur = 16; g.beginPath(); g.arc(bxp, byp, 6, 0, 7); g.fill(); g.shadowBlur = 0; }
        if (active && /ACKNOWLEDGED|COMPLETE/.test(S.state)) { g.strokeStyle = 'rgba(95,224,160,0.8)'; g.lineWidth = 1.5; g.beginPath(); g.arc(p[0], p[1], 10 + (S.hb % 20) * 0.4, 0, 7); g.stroke(); }
      });
      // origin node with concentric status rings
      var pulse = 0.5 + 0.5 * Math.sin(S.hb * 0.06);
      g.strokeStyle = 'rgba(95,224,160,' + (0.25 + 0.2 * pulse) + ')'; g.lineWidth = 1.4; g.beginPath(); g.arc(o[0], o[1], 9 + pulse * 4, 0, 7); g.stroke();
      g.fillStyle = '#7fe6b0'; g.shadowColor = '#5fe0a0'; g.shadowBlur = 14; g.beginPath(); g.arc(o[0], o[1], 7, 0, 7); g.fill(); g.shadowBlur = 0;
      g.fillStyle = '#eaf4ff'; g.font = 'bold 18px system-ui,sans-serif'; g.fillText('YOW', o[0] + 12, o[1] - 5);
      g.fillStyle = 'rgba(198,220,244,.82)'; g.font = '13px system-ui,sans-serif'; g.fillText('Ottawa · Portfolio Origin', o[0] + 12, o[1] + 13);
      // operational header (hierarchy: title / disclosure / state)
      g.fillStyle = '#eef6ff'; g.font = '600 30px system-ui,sans-serif'; g.fillText('WAN Operations', 30, 44);
      g.fillStyle = '#8fbadd'; g.font = '16px system-ui,sans-serif'; g.fillText('Simulated WAN Transfer · portfolio data path', 30, 72);
      var sc = S.state === 'COMPLETE' ? '#5fe0a0' : S.state === 'FAILED' ? '#ff6b5e' : /TRANSMITTING|ROUTING|VALIDATING|QUEUED/.test(S.state) ? '#ffc266' : '#9be8ff';
      g.fillStyle = sc; g.font = 'bold 19px ui-monospace,monospace'; g.fillText('● ' + S.state, 30, 104);
      // technical readout (mono) bottom-left with local backing
      g.fillStyle = 'rgba(6,13,22,0.6)'; g.fillRect(20, cvH - 96, 300, 82);
      g.font = '12px ui-monospace,monospace'; g.fillStyle = '#9fc4e6';
      [['PROTO', 'HTTPS'], ['SRC', 'YOW'], ['DST', S.dest + ' · form endpoint'], ['PAYLOAD', 'Contact Request'], ['LATENCY', '~' + (40 + DEST_ORDER.indexOf(S.dest) * 12) + 'ms (demo)']].forEach(function (r, i) {
        g.fillStyle = '#6f90b2'; g.fillText(r[0], 30, cvH - 74 + i * 15); g.fillStyle = '#cfe4f7'; g.fillText(r[1], 110, cvH - 74 + i * 15);
      });
      tex.needsUpdate = true;
    }
    function bez(a, b, c, t) { var u = 1 - t; return u * u * a + 2 * u * t * b + t * t * c; }

    function drawTerm() {
      term.draw(function (G, W, H, acc) {
        NS.drawInfoScreen(G, W, H, acc, {
          kicker: 'WAN · CONTACT TERMINAL', title: 'Contact',
          pdu: 'STATE: ' + S.state,
          rows: [['UPLINK', S.state === 'STANDBY' ? 'STANDBY' : 'ACTIVE'], ['EDGE', 'WAN-EDGE-01/02'], ['SUBMISSION', S.real ? 'real Formspree' : 'idle'], ['ROUTE', 'YOW → ' + S.dest]],
          hint: 'Send a message on the console →'
        });
      });
    }
    drawTerm();

    // ---------- accessibility DOM: status + controls (outside WebGL) ----------
    var contact = document.getElementById('contact');
    if (contact && !contact.querySelector('.wan-a11y')) {
      var box2 = document.createElement('div'); box2.className = 'wan-a11y';
      box2.style.cssText = 'margin-top:16px;font:13px ui-monospace,monospace;color:#9fc4e6';
      box2.innerHTML =
        '<h3 style="font:600 13px system-ui;color:#bfe4ff;margin:0 0 6px">WAN world map (simulated visualization)</h3>' +
        '<p class="wan-status" role="status" aria-live="polite" style="margin:0 0 8px;color:#9be8ff"></p>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
        '<label style="display:flex;align-items:center;gap:4px">Dest <select class="wan-dest" style="background:#0c1622;color:#cfe4f7;border:1px solid #345;border-radius:6px;padding:3px"></select></label>' +
        '<button class="wan-replay" style="cursor:pointer;background:#0c1622;color:#cfe4f7;border:1px solid #345;border-radius:6px;padding:4px 8px">Replay</button>' +
        '<button class="wan-pause" style="cursor:pointer;background:#0c1622;color:#cfe4f7;border:1px solid #345;border-radius:6px;padding:4px 8px">Pause</button>' +
        '<button class="wan-reset" style="cursor:pointer;background:#0c1622;color:#cfe4f7;border:1px solid #345;border-radius:6px;padding:4px 8px">Reset</button>' +
        '</div>' +
        '<p style="margin:8px 0 0;color:#7f93a8;font-size:11px">The network journey is a simulated visualization. The contact form submission itself is real (Formspree).</p>';
      contact.querySelector('.p-bd, .panel, div') && (contact.querySelector('.contact-container') || contact).appendChild(box2);
      var sel = box2.querySelector('.wan-dest');
      DEST_ORDER.forEach(function (d) { var op = document.createElement('option'); op.value = d; op.textContent = d + ' · ' + nodes[d].city; sel.appendChild(op); });
      sel.value = S.dest; sel.addEventListener('change', function () { S.dest = sel.value; drawMap(0); });
      box2.querySelector('.wan-replay').addEventListener('click', replay);
      box2.querySelector('.wan-reset').addEventListener('click', reset);
      var paused = false; box2.querySelector('.wan-pause').addEventListener('click', function () { paused = !paused; window.__wanPaused = paused; this.textContent = paused ? 'Resume' : 'Pause'; });
    }
    function announce(msg) { var el = document.querySelector('.wan-a11y .wan-status'); if (el) el.textContent = msg; if (window.__wanAnnounce) { try { window.__wanAnnounce(msg); } catch (e) {} } }
    window.__wanReplay = replay; window.__wanPickDest = pickDest;
    announce(wanLine());

    // ---------- real contact form → state machine (real success only) ----------
    var form = document.querySelector('form[action*="formspree"]');
    if (form && !form.__wanWired) {
      form.__wanWired = true;
      form.addEventListener('submit', function (e) {
        e.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; }
        setState('VALIDATING');
        fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
          .then(function (r) { if (r.ok) { begin(true); formMsg('Message transmitted to the WAN edge — thank you.', true); form.reset(); }
            else { fail(); formMsg('Submission failed. Your message is preserved — please retry.', false); } })
          .catch(function () { fail(); formMsg('Network error. Your message is preserved — please retry.', false); });
      });
    }
    function formMsg(msg, ok) { var el = form && form.querySelector('.wan-formmsg'); if (form && !el) { el = document.createElement('div'); el.className = 'wan-formmsg'; el.setAttribute('role', 'status'); el.style.cssText = 'margin-top:12px;font:600 13px ui-monospace,monospace'; form.appendChild(el); } if (el) { el.style.color = ok ? '#5fe0a0' : '#ff6b5e'; el.textContent = msg; } }

    // QA-only mock (gated; cannot fire in production)
    var wm = /[?&]wanmock=(success|fail)/.exec(location.search);
    if (wm) timers.push(setTimeout(function () { wm[1] === 'success' ? begin(false) : fail(); }, 500));

    // ---------- per-frame update ----------
    var last = 0;
    ctx.updaters.push(function (st, now) {
     try {
      var calm = st.calm; if (!window.__wanPaused) S.hb++;
      // advance packet / states
      if (S.state === 'TRANSMITTING' && !window.__wanPaused) { S.t += calm ? 1 : 0.018; if (S.t >= 1) { S.t = 1; setState('ACKNOWLEDGED'); step('COMPLETE', calm ? 0 : 500); } }
      if (calm && (S.state === 'ROUTING' || S.state === 'VALIDATING' || S.state === 'QUEUED')) { S.state = 'TRANSMITTING'; S.t = 1; setState('COMPLETE'); }
      // edge-router + uplink illumination follows state
      var hot = /ROUTING|TRANSMITTING|ACKNOWLEDGED|COMPLETE/.test(S.state) ? 1 : 0.25;
      uplinks.forEach(function (m) { m.opacity = 0.25 + 0.55 * hot * (0.7 + 0.3 * Math.sin(now * 0.006)); });
      mapLight.intensity = 1.0 + hot * 0.8;
      for (var i = 0; i < leds.length; i++) { var f = calm ? 1 : (0.55 + 0.45 * Math.sin(now * 0.004 + i)); leds[i].material.color.copy(leds[i].userData.base).multiplyScalar(0.4 + 0.6 * f); }
      if (now - last > (calm ? 400 : 80)) { last = now; drawMap(now); }
     } catch (e) { if (!window.__wanErr) { window.__wanErr = String(e) + ' @ ' + (e.stack || '').split('\n')[1]; console.error('[wan updater]', e); } }
    });

    return { state: S, endZ: endZ };

    // ---------- helpers ----------
    function mesh(geo, mat, x, y, zz) { var m = new THREE.Mesh(geo, mat); m.position.set(x, y, zz); return m; }
    function box(w, h, d, mat, x, y, zz) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, zz); return m; }
    function labelPlane(text, x, y, zz, ry, color, fs) { var m = C.label(ctx, text, Math.min(0.5, 0.02 * text.length + 0.08), { color: color, fs: fs || 18 }); m.position.set(x, y, zz); m.rotation.y = ry || 0; return m; }
  };
})(window.FacilityStations);
