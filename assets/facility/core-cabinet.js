/* core-cabinet.js — B1: physically grounded core-network cabinet at the hero (chapter 0).
   Replaces the removed floating CORE NETWORK hologram. Floor-mounted, recognizable
   infrastructure (core switches, L3 router, fibre distribution, SFP+ cages, cable managers,
   ventilation, LEDs, labels) with a topology screen mounted ON the cabinet door.
   The hero fibre originates from a visible core SFP+ uplink port. */
window.FacilityStations = window.FacilityStations || {};
(function (NS) {
  'use strict';

  NS.buildCoreCabinet = function (ctx) {
    var THREE = ctx.THREE, C = NS, z0 = ctx.chapterZ(0), side = -1; // chapter 0 = left
    var root = new THREE.Group();
    var fx = 0.5;                       // local front plane (rails at D/2 = 0.525)
    var leds = [], screens = [], glows = [];

    // ---- primary core cabinet (CORE-01) ----
    var cab = C.cabinet(ctx, { w: 0.86, h: 2.55, d: 1.05 });
    root.add(cab.group);
    root.add(C.glassDoor(ctx, fx + 0.07, cab.W, cab.H));

    function mount(node, y, z) { node.position.set(fx, y, z || 0); root.add(node); return node; }
    function proud(node, y, z) { node.position.set(fx + 0.05, y, z || 0); root.add(node); return node; }

    // fibre distribution panel (LC connectors) — low
    mount(C.bezel(ctx, fx, 0.42, 0.72, 0.14, 0x0f1a26), 0.42);
    for (var i = 0; i < 6; i++) { var lc = C.lcConnector(ctx, 0x35e0f1); proud(lc, 0.42, -0.28 + i * 0.11); }
    root.add(placeLabel(ctx, 'FIBRE DIST', 0.24, 0.42, -0.42, '#8fd8ff'));

    // cable manager
    mount(C.cableManager(ctx, 0.72), 0.60);

    // L3 router
    var l3 = mount(C.bezel(ctx, fx, 0.86, 0.72, 0.2, 0x14202e), 0.86);
    for (var a = 0; a < 8; a++) { var l = C.led(ctx, a % 4 === 0 ? 0x5a9dff : 0x6fe0a0); l.position.set(fx + 0.03, 0.86 + 0.05, -0.3 + a * 0.075); root.add(l); leds.push(l); }
    root.add(placeLabel(ctx, 'L3 CORE', 0.22, 0.86, -0.42, '#bfe4ff'));
    root.add(placeLabel(ctx, 'ROUTED', 0.18, 0.86, 0.34, '#5fe0a0'));

    // core switch #1 (with the hero uplink SFP+ port)
    mount(C.bezel(ctx, fx, 1.18, 0.72, 0.16, 0x121d2a), 1.18);
    var upA = null;
    for (var s = 0; s < 8; s++) {
      var cage = C.sfpCage(ctx, s === 3 ? 0x9be8ff : 0x6fe0a0);
      proud(cage, 1.18, -0.3 + s * 0.085);
      leds.push(cage.userData.led);
      if (s === 3) { upA = cage; glows.push(cage); }
    }
    root.add(placeLabel(ctx, 'CORE-SW-01', 0.26, 1.18, -0.44, '#bfe4ff'));
    root.add(placeLabel(ctx, 'SFP+ 10G', 0.2, 1.18, 0.36, '#9be8ff'));

    // core switch #2 (redundant uplinks A/B)
    mount(C.bezel(ctx, fx, 1.48, 0.72, 0.16, 0x121d2a), 1.48);
    for (var s2 = 0; s2 < 8; s2++) { var cg = C.sfpCage(ctx, s2 % 2 ? 0x5a9dff : 0x6fe0a0); proud(cg, 1.48, -0.3 + s2 * 0.085); leds.push(cg.userData.led); }
    root.add(placeLabel(ctx, 'UPLINK A', 0.18, 1.48, -0.16, '#9be8ff'));
    root.add(placeLabel(ctx, 'UPLINK B', 0.18, 1.48, 0.2, '#9be8ff'));

    // ventilation band
    mount(C.vent(ctx, fx, 1.74, 0.72, 0.14), 1.74);

    // ---- door-mounted topology / status screen (flush on the door, NOT floating) ----
    var scr = C.screen(ctx, 0.46, 0.3, 300, 196);
    scr.mesh.rotation.y = Math.PI / 2;
    scr.mesh.position.set(fx + 0.11, 2.02, 0.0);
    root.add(scr.mesh);
    // thin screen bezel
    var scb = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.34, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x1b2836, metalness: 0.7, roughness: 0.4 }));
    scb.position.set(fx + 0.1, 2.02, 0); root.add(scb);
    var topo = makeTopology();

    // nameplate + status
    root.add(placeLabel(ctx, 'CORE-01', 0.3, 2.34, -0.0, '#dcecff', 34));
    var onLed = C.led(ctx, 0x6fe0a0); onLed.position.set(fx + 0.05, 2.34, 0.3); root.add(onLed); leds.push(onLed);
    root.add(placeLabel(ctx, 'ONLINE', 0.16, 2.34, 0.4, '#5fe0a0'));

    // ---- redundant second cabinet (CORE-02), simpler, beside CORE-01 ----
    var cab2 = C.cabinet(ctx, { w: 0.86, h: 2.55, d: 1.05 });
    cab2.group.position.z = -0.9; root.add(cab2.group);
    root.add((function () { var d = C.glassDoor(ctx, fx + 0.07, cab2.W, cab2.H); d.position.z = -0.9; return d; })());
    for (var r = 0; r < 5; r++) {
      var bz = C.bezel(ctx, fx, 0.5 + r * 0.34, 0.72, 0.2, 0x111b28); bz.position.z = -0.9; root.add(bz);
      for (var q = 0; q < 6; q++) { var l2 = C.led(ctx, q % 3 ? 0x6fe0a0 : 0x5a9dff); l2.position.set(fx + 0.03, 0.5 + r * 0.34 + 0.05, -0.9 - 0.28 + q * 0.11); root.add(l2); leds.push(l2); }
    }
    root.add(placeLabel(ctx, 'CORE-02', 0.26, 2.34, -0.9, '#9fb6cc'));

    // ---- place whole assembly on the left, at chapter 0 ----
    C.placeStation(ctx, root, side, z0, cab.D);

    // dedicated accent light so the core cabinet reads as the hero focal point
    var accent = new THREE.PointLight(0x9fd0ff, 0, 5, 2.2);
    accent.position.set(side * (ctx.CFG.aisleHalf - 0.55), 1.7, z0 + 0.2);
    ctx.scene.add(accent);

    // the hero uplink port in WORLD coords (for the fibre origin)
    var upWorld = new THREE.Vector3();
    upA.getWorldPosition(upWorld);

    // short fibre stub from the uplink SFP+ down to the base fibre run
    var stub = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
        upWorld.clone(),
        upWorld.clone().add(new THREE.Vector3(side * 0.08, -0.4, 0.05)),
        new THREE.Vector3(side * (ctx.CFG.aisleHalf - 0.14), 0.06, z0)
      ]), 20, 0.01, 6, false),
      new THREE.MeshBasicMaterial({ color: 0x35e0f1, transparent: true, opacity: 0.6 }));
    ctx.scene.add(stub);

    // ---- animation: power-on ramp + LED life + topology pulse ----
    var t0 = null, lastPaint = 0, emis = null;
    ctx.updaters.push(function (st, now) {
      if (t0 === null) t0 = now;
      var pwr = C.smooth((now - t0) / 2200);            // gradual power-on
      // collect emissive materials once, then set them — avoids walking the whole subtree every frame
      if (!emis) { emis = []; root.traverse(function (o) { if (o.material && o.material.emissive) emis.push(o.material); }); }
      var ei = 0.15 + pwr * 0.5; for (var e = 0; e < emis.length; e++) emis[e].emissiveIntensity = ei;
      accent.intensity = pwr * (st.calm ? 1.3 : 1.6 + Math.sin(now * 0.004) * 0.3);
      var sb = now * 0.004;
      for (var k = 0; k < leds.length; k++) {
        var f = st.calm ? 1 : (0.6 + 0.4 * Math.sin(sb + k));
        leds[k].material.color.copy(leds[k].userData.base).multiplyScalar(0.35 + 0.65 * pwr * f);
      }
      if (now - lastPaint > 90) { lastPaint = now; topo.draw(scr, pwr, now); }
    });

    return { root: root, uplink: upWorld, z: z0, side: side };

    // ---------- helpers ----------
    function placeLabel(ctx, text, w, y, z, color, fs) {
      var m = C.label(ctx, text, w, { color: color, fs: fs || 22 });
      m.rotation.y = Math.PI / 2; m.position.set(fx + 0.09, y, z);
      return m;
    }
    function makeTopology() {
      var nodes = [];
      for (var k = 0; k < 8; k++) nodes.push([26 + (k * 53 % 248), 30 + ((k * 37) % 130)]);
      return {
        draw: function (scr, pwr, now) {
          var g = scr.g, W = scr.W, H = scr.H;
          g.fillStyle = '#081320'; g.fillRect(0, 0, W, H);
          g.strokeStyle = 'rgba(120,170,230,0.28)'; g.lineWidth = 1; g.strokeRect(3, 3, W - 6, H - 6);
          g.fillStyle = 'rgba(160,205,255,' + (0.5 * pwr) + ')'; g.font = '13px ui-monospace, monospace';
          g.fillText('CORE · L3 BACKBONE', 10, 20);
          g.fillText('ONLINE', W - 62, 20);
          g.strokeStyle = 'rgba(90,180,255,' + (0.55 * pwr) + ')'; g.lineWidth = 1.4;
          for (var k = 0; k < nodes.length; k++) {
            var b = nodes[(k + 2) % nodes.length];
            g.beginPath(); g.moveTo(nodes[k][0], nodes[k][1] + 6); g.lineTo(b[0], b[1] + 6); g.stroke();
          }
          var pulse = (now * 0.00025) % 1;
          for (var m = 0; m < nodes.length; m++) {
            var lit = Math.abs(((m / nodes.length) - pulse + 1) % 1) < 0.14;
            g.fillStyle = lit ? '#c9f7ff' : '#6fb2e6';
            g.shadowColor = '#8fd8ff'; g.shadowBlur = (lit ? 12 : 5) * pwr;
            g.beginPath(); g.arc(nodes[m][0], nodes[m][1] + 6, lit ? 4.5 : 3, 0, 7); g.fill(); g.shadowBlur = 0;
          }
          scr.flush();
        }
      };
    }
  };
})(window.FacilityStations);
