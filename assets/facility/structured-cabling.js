/* structured-cabling.js — professional structured data-center cabling infrastructure.
   Replaces the look of loose hanging fibre with real cable management: overhead ladder racks with a
   dark bundled trunk, raised-floor side cable trays (the packet's base route rides inside these),
   vertical managers tying the tray up into the overhead ladder, and detailed connector assemblies
   (SFP+ cage, transceiver, duplex LC + boot, short dark patch leads, horizontal/vertical managers,
   physically-attached labels) at the hero core cabinet and the OSI bay. Dark jackets; only faint
   inner glow. The legacy per-chapter risers are removed in the build. */
window.FacilityStations = window.FacilityStations || {};
(function (NS) {
  'use strict';

  NS.buildStructuredCabling = function (ctx) {
    var THREE = ctx.THREE, C = NS, R = window.FACILITY_ROUTE, scene = ctx.scene;
    var AH = ctx.CFG.aisleHalf;
    var zHead = 12, zTail = R.z[R.count - 1] - 16, midZ = (zHead + zTail) / 2, len = zHead - zTail;
    var steel = new THREE.MeshStandardMaterial({ color: 0x1b2836, metalness: 0.72, roughness: 0.4 });
    var darkSteel = new THREE.MeshStandardMaterial({ color: 0x0f1824, metalness: 0.5, roughness: 0.55 });
    var jacketMat = new THREE.MeshStandardMaterial({ color: 0x0a1119, metalness: 0.25, roughness: 0.72 });   // dark cable jacket
    var coreMat = new THREE.MeshBasicMaterial({ color: 0x35e0f1, transparent: true, opacity: 0.28 });        // faint optical core

    function box(w, h, d, mat, x, y, z, ry) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); if (ry) m.rotation.y = ry; scene.add(m); return m; }

    [-1, 1].forEach(function (side) {
      var x = side * (AH - 0.04);
      // ---- overhead ladder rack (two rails + rungs) ----
      var lx = side * 1.34, ly = 2.9, lw = 0.26;
      box(0.05, 0.06, len, steel, lx - lw / 2, ly, midZ);
      box(0.05, 0.06, len, steel, lx + lw / 2, ly, midZ);
      var rungGeo = new THREE.BoxGeometry(lw + 0.05, 0.025, 0.04), rungN = Math.floor(len / 0.55);
      var rungs = new THREE.InstancedMesh(rungGeo, steel, rungN), dd = new THREE.Object3D();
      for (var r = 0; r < rungN; r++) { dd.position.set(lx, ly + 0.03, zHead - 1 - r * 0.55); dd.updateMatrix(); rungs.setMatrixAt(r, dd.matrix); }
      rungs.instanceMatrix.needsUpdate = true; rungs.frustumCulled = false; scene.add(rungs);
      // dark bundled trunk sitting in the ladder rack
      var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 8), jacketMat);
      trunk.rotation.x = Math.PI / 2; trunk.position.set(lx, ly + 0.06, midZ); scene.add(trunk);
      var trunkCore = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 6), coreMat.clone());
      trunkCore.rotation.x = Math.PI / 2; trunkCore.position.set(lx, ly + 0.06, midZ); scene.add(trunkCore);

      // ---- raised-floor side cable tray (U-channel) — the base fibre run rides inside it ----
      var tx = side * (AH - 0.14), ty = 0.11;
      box(0.14, 0.015, len, darkSteel, tx, ty - 0.03, midZ);                 // tray floor
      box(0.015, 0.06, len, darkSteel, tx - 0.06, ty, midZ);                 // tray inner wall
      box(0.015, 0.06, len, darkSteel, tx + 0.06, ty, midZ);                 // tray outer wall
      // dark bundle running in the tray
      var trayBundle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 8), jacketMat);
      trayBundle.rotation.x = Math.PI / 2; trayBundle.position.set(tx, ty, midZ); scene.add(trayBundle);

      // ---- vertical managers tying the tray up into the overhead ladder (every ~15u) ----
      for (var vz = zHead - 8; vz > zTail + 4; vz -= 15) {
        box(0.05, 2.8, 0.05, steel, x, 1.5, vz);                            // vertical manager post
        for (var f = 0; f < 6; f++) { var ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 6, 10, Math.PI), steel); ring.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2; ring.position.set(x + side * 0.03, 0.6 + f * 0.4, vz); scene.add(ring); }
        // dark drop cable inside the vertical manager
        var drop = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
          new THREE.Vector3(tx, ty, vz), new THREE.Vector3(x, 1.4, vz), new THREE.Vector3(lx, ly, vz)]), 16, 0.016, 6, false), jacketMat);
        scene.add(drop);
      }
    });

    // ---- detailed connector assemblies at the hero core cabinet + OSI bay ----
    connectorAssembly(R.byId.osi.z, R.byId.osi.side);
    if (R.byId.hero) connectorAssembly(R.byId.hero.z + 0.5, -1);   // near the core cabinet

    return { ok: true };

    // detailed managed patch: SFP+ cage -> transceiver -> LC duplex + boot -> patch lead -> H manager -> vertical manager
    function connectorAssembly(z, side) {
      var fx = side * (AH - 0.02), inward = -side;   // "inward" points toward the aisle
      var y = 1.15, g = new THREE.Group(); scene.add(g);
      // horizontal cable manager on the rack front
      var hm = box(0.05, 0.09, 0.7, steel, fx, y + 0.18, z); hm.userData = {};
      for (var i = 0; i < 6; i++) { var ring = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 6, 10, Math.PI), steel); ring.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2; ring.position.set(fx + inward * 0.03, y + 0.18, z - 0.28 + i * 0.11); scene.add(ring); }
      // SFP+ cages + transceivers + LC connectors + boots
      for (var s = 0; s < 4; s++) {
        var zz = z - 0.18 + s * 0.12;
        var cage = box(0.06, 0.035, 0.07, new THREE.MeshStandardMaterial({ color: 0x16212e, metalness: 0.72, roughness: 0.42 }), fx + inward * 0.03, y, zz);
        // transceiver body sticking out
        box(0.05, 0.028, 0.03, new THREE.MeshStandardMaterial({ color: 0x223144, metalness: 0.7, roughness: 0.4 }), fx + inward * 0.07, y, zz);
        // duplex LC ferrules
        for (var d = -1; d <= 1; d += 2) { var fer = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.03, 8), new THREE.MeshStandardMaterial({ color: 0x2fa8c8, metalness: 0.3, roughness: 0.5 })); fer.rotation.z = Math.PI / 2; fer.position.set(fx + inward * 0.1, y, zz + d * 0.012); scene.add(fer); }
        // strain-relief boot
        box(0.03, 0.02, 0.02, new THREE.MeshStandardMaterial({ color: 0x0c1017, metalness: 0.2, roughness: 0.8 }), fx + inward * 0.12, y, zz);
        // active-status LED on one
        if (s === 1) { var led = C.led(ctx, 0x6fe0a0); led.position.set(fx + inward * 0.03, y + 0.02, zz - 0.03); scene.add(led); }
        // short dark patch lead: LC -> up into horizontal manager -> into vertical manager (supported, never to floor)
        var lead = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
          new THREE.Vector3(fx + inward * 0.13, y, zz),
          new THREE.Vector3(fx + inward * 0.05, y + 0.12, zz),
          new THREE.Vector3(fx + inward * 0.03, y + 0.18, z - 0.28),
          new THREE.Vector3(fx, y + 0.6, z)]), 24, 0.01, 6, false), jacketMat);
        scene.add(lead);
      }
      // physically-attached labels on the manager
      lab(g, 'LC DUPLEX', fx + inward * 0.08, y + 0.34, z - 0.26, side, '#8fd8ff', 15);
      lab(g, 'SFP+ · 10G', fx + inward * 0.08, y + 0.34, z + 0.0, side, '#9be8ff', 15);
      lab(g, 'UPLINK A · TX/RX', fx + inward * 0.08, y + 0.34, z + 0.26, side, '#bfe4ff', 14);
    }
    function lab(parent, text, x, y, z, side, color, fs) {
      var m = C.label(ctx, text, Math.min(0.34, 0.017 * text.length + 0.06), { color: color, fs: fs || 16 });
      m.position.set(x, y, z); m.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(m);
    }
  };
})(window.FacilityStations);
