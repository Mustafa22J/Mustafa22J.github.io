/* osi-stations.js — ONE consolidated OSI infrastructure bay (single route chapter `osi`).
   A 3-rack bay whose rack units are the seven layer modules (L1 fibre/RJ45 … L7 service cluster),
   plus ONE integrated rack-origin glass display. Selecting a layer (via the shared OSI console in
   osi-state.js / window.OSI_STATE) illuminates that module, dims the rest, tints the bay to the
   layer colour, moves an internal packet marker, and updates the one display — all in place, with
   no seven-chapter scroll and no duplicate 3D consoles. */
window.FacilityStations = window.FacilityStations || {};
(function (NS) {
  'use strict';

  NS.buildOsiStations = function (ctx) {
    var THREE = ctx.THREE, C = NS, R = window.FACILITY_ROUTE; if (!R || !R.byId.osi) return null;
    var node = R.byId.osi, z0 = node.z, side = node.side, fx = 0.5;
    var root = new THREE.Group();

    // three cabinets forming the bay (local z offsets)
    [-1.0, 0, 1.0].forEach(function (dz) { var cab = C.cabinet(ctx, { w: 0.9, h: 2.55, d: 1.05 }); cab.group.position.z = dz; root.add(cab.group); });

    // seven layer modules distributed as rack units across the bay
    var LAYOUT = { 1: [-1.0, 1.55], 2: [-1.0, 1.0], 3: [0, 1.75], 4: [0, 1.2], 5: [0, 0.65], 6: [1.0, 1.55], 7: [1.0, 0.95] };
    var modules = {}, packet;
    for (var L = 1; L <= 7; L++) {
      var cfg = R.osi[L], pos = LAYOUT[L], dz = pos[0], y = pos[1], acc = hex(cfg.acc);
      var m = new THREE.Group(); m.position.z = dz; root.add(m);
      var leds = buildModuleEquipment(m, L, y, acc);
      var lbl = C.label(ctx, 'L' + L + ' · ' + cfg.name.toUpperCase(), Math.min(0.42, 0.02 * cfg.name.length + 0.12), { color: cfg.acc, fs: 18 });
      lbl.rotation.y = Math.PI / 2; lbl.position.set(fx + 0.09, y + 0.16, -0.4); m.add(lbl);
      modules[L] = { group: m, leds: leds, acc: new THREE.Color(acc), y: y, dz: dz, bezels: m.userData.bezels || [] };
    }

    // one integrated rack-origin glass display for the whole bay (front-centre)
    var disp = NS.createRackDisplay(ctx, { fx: fx, y: 1.62, z: 0, accent: 0x5ad2ff, w: 0.9, h: 0.58, cvW: 500, cvH: 322 });
    disp.setOpen(1); root.add(disp.group);

    // internal packet marker (small glow that sits at the active module)
    packet = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), new THREE.MeshBasicMaterial({ color: 0xeaffff }));
    root.add(packet);
    var pGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: C.led(ctx, 0xffffff).material.map || null, color: 0x9be8ff, transparent: true, opacity: 0.0 }));

    // bay accent light (tints to the active layer colour)
    var bayLight = new THREE.PointLight(0x5ad2ff, 0, 6, 2); bayLight.position.set(side * (R.byId.osi ? 1.4 : 1.4), 1.6, z0); ctx.scene.add(bayLight);

    C.placeStation(ctx, root, side, z0, 1.05);

    function drawDisplay(L) {
      var d = R.osi[L];
      disp.draw(function (g, W, H, acc2) {
        NS.drawInfoScreen(g, W, H, new THREE.Color(hex(d.acc)), {
          kicker: 'OSI · LAYER ' + L, title: d.name, pdu: 'PDU: ' + d.pdu,
          rows: [['IN', L > 1 ? ('L' + (L - 1)) : 'signal / bits'], ['OUT', L < 7 ? ('L' + (L + 1)) : 'application'],
                 ['ROLE', d.equip.split(' · ')[0]], ['DIR', (window.OSI_STATE && window.OSI_STATE.mode === 'decapsulate') ? '▼ down' : '▲ up']],
          hint: 'Select a layer on the console'
        });
      });
    }
    var lastL = 0, _lp = new THREE.Vector3();
    ctx.updaters.push(function (st, now) {
      var L = (window.OSI_STATE && window.OSI_STATE.activeLayer) || 1;
      if (L !== lastL) { lastL = L; drawDisplay(L); bayLight.color.copy(modules[L].acc); }
      var sb = now * 0.006;
      // highlight active module, dim others
      for (var k = 1; k <= 7; k++) {
        var on = (k === L), mod = modules[k];
        // collect each module's emissive materials once, then set — no per-frame subtree walk
        if (!mod._emis) { mod._emis = []; mod.group.traverse(function (o) { if (o.material && o.material.emissive) mod._emis.push(o.material); }); }
        var ei = on ? 0.6 : 0.12; for (var e = 0; e < mod._emis.length; e++) mod._emis[e].emissiveIntensity = ei;
        for (var i = 0; i < mod.leds.length; i++) { var f = on ? (0.7 + 0.3 * Math.sin(sb + i)) : 0.18; mod.leds[i].material.color.copy(mod.leds[i].userData.base).multiplyScalar(f); }
      }
      bayLight.intensity = 2.2 + (st.calm ? 0 : Math.sin(now * 0.004) * 0.4);
      // internal packet at active module (world coords) — reuse one Vector3
      var mm = modules[L]; _lp.set(fx + 0.1, mm.y, mm.dz); mm.group.parent && root.localToWorld(_lp);
      packet.position.copy(_lp);
      var pulse = st.calm ? 1 : (0.7 + 0.3 * Math.sin(now * 0.008));
      packet.scale.setScalar(pulse); packet.material.color.setScalar(0.7 + 0.3 * pulse);
    });
    drawDisplay(1);

    return { bay: root, modules: modules, display: disp };

    // ---- layer-specific mini equipment inside a module ----
    function buildModuleEquipment(m, L, y, acc) {
      var leds = [], bezels = [];
      var bz = C.bezel(ctx, fx, y, 0.74, 0.22, 0x111c28); m.add(bz); bezels.push(bz);
      function led(color, zz) { var l = C.led(ctx, color); l.position.set(fx + 0.04, y + 0.06, zz); m.add(l); leds.push(l); return l; }
      if (L === 1) { for (var i = 0; i < 5; i++) { var cg = C.sfpCage(ctx, i === 2 ? 0x9be8ff : 0x6fe0a0); cg.position.set(fx + 0.05, y, -0.28 + i * 0.09); m.add(cg); leds.push(cg.userData.led); }
        var strip = C.rj45Strip(ctx, 6); strip.position.set(fx + 0.04, y - 0.02, 0.18); m.add(strip); }
      else if (L === 2) { var s2 = C.rj45Strip(ctx, 10); s2.position.set(fx + 0.04, y, -0.05); m.add(s2); for (var t = 0; t < 2; t++) { var c2 = C.sfpCage(ctx, 0x9be8ff); c2.position.set(fx + 0.05, y, 0.28 + t * 0.06); m.add(c2); leds.push(c2.userData.led); } }
      else if (L === 3) { for (var r = 0; r < 6; r++) { var c3 = C.sfpCage(ctx, r % 2 ? 0x5a9dff : 0x6fe0a0); c3.position.set(fx + 0.05, y, -0.3 + r * 0.1); m.add(c3); leds.push(c3.userData.led); } }
      else if (L === 4) { for (var f = 0; f < 5; f++) led(f === 4 ? 0xff6b5e : 0x5fe0a0, -0.28 + f * 0.13); }
      else if (L === 5) { for (var s = 0; s < 5; s++) led(s ? 0x7f9cf0 : 0x5fe0a0, -0.28 + s * 0.13); }
      else if (L === 6) { for (var c = 0; c < 5; c++) led(c === 0 ? 0x5fe0a0 : 0xa98cf0, -0.28 + c * 0.13); }
      else { var svc = ['DNS', 'DHCP', 'WEB', 'SSH', 'MAIL', 'SNMP']; for (var b = 0; b < 6; b++) led(0x5fe0a0, -0.3 + b * 0.12); }
      m.userData.bezels = bezels;
      return leds;
    }
    function hex(s) { return parseInt(s.replace('#', ''), 16); }
  };
})(window.FacilityStations);
