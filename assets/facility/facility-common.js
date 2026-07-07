/* facility-common.js — shared geometry helpers for the Milestone B physical stations.
   Classic script; registers builders on window.FacilityStations. All helpers take
   `ctx` = window.__facility (exposes THREE, scene, camera, CFG, chapterZ, ...).
   Convention: each station is built in local space with its FRONT facing +localX,
   then placed with placeStation() which rotates right-side stations 180deg so their
   front faces the aisle centre. Nothing floats: every screen/label is mounted on a mesh. */
window.FacilityStations = window.FacilityStations || {};
(function (NS) {
  'use strict';

  function labelTex(THREE, text, o) {
    o = o || {};
    var fs = o.fs || 30, pad = o.pad != null ? o.pad : 10;
    var meas = document.createElement('canvas').getContext('2d');
    meas.font = 'bold ' + fs + 'px ui-monospace, monospace';
    var tw = Math.ceil(meas.measureText(text).width);
    var cv = document.createElement('canvas');
    cv.width = tw + pad * 2; cv.height = fs + pad * 2;
    var g = cv.getContext('2d');
    if (o.bg !== false) {
      g.fillStyle = o.bg || 'rgba(6,12,20,0.92)';
      g.fillRect(0, 0, cv.width, cv.height);
      g.strokeStyle = o.border || 'rgba(120,160,210,0.4)';
      g.lineWidth = 2; g.strokeRect(1, 1, cv.width - 2, cv.height - 2);
    }
    g.font = 'bold ' + fs + 'px ui-monospace, monospace';
    g.textBaseline = 'middle';
    g.fillStyle = o.color || '#bfe4ff';
    g.shadowColor = o.color || '#8fd8ff';
    g.shadowBlur = o.glow != null ? o.glow : 6;
    g.fillText(text, pad, cv.height / 2 + 1);
    var tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    return { tex: tex, aspect: cv.width / cv.height };
  }

  /* small equipment label plane, mounted flat (renderOrder keeps it readable over gear) */
  NS.label = function (ctx, text, worldW, o) {
    var THREE = ctx.THREE, L = labelTex(THREE, text, o);
    var m = new THREE.Mesh(
      new THREE.PlaneGeometry(worldW, worldW / L.aspect),
      new THREE.MeshBasicMaterial({ map: L.tex, transparent: true, depthWrite: false }));
    m.renderOrder = 4;
    return m;
  };

  /* a live canvas "screen" (topology / KVM / portrait). Returns a handle. */
  NS.screen = function (ctx, worldW, worldH, cvW, cvH) {
    var THREE = ctx.THREE;
    var cv = document.createElement('canvas'); cv.width = cvW; cv.height = cvH;
    var tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(worldW, worldH),
      new THREE.MeshBasicMaterial({ map: tex }));
    return { mesh: mesh, cv: cv, g: cv.getContext('2d'), tex: tex, W: cvW, H: cvH,
      flush: function () { tex.needsUpdate = true; } };
  };

  /* tiny status LED (emissive sphere). setOn(v) scales brightness via colour lerp. */
  NS.led = function (ctx, color) {
    var THREE = ctx.THREE;
    var m = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8),
      new THREE.MeshBasicMaterial({ color: color || 0x6fe0a0 }));
    m.userData.base = new THREE.Color(color || 0x6fe0a0);
    return m;
  };

  /* SFP+ cage that protrudes from the front (+localX): dark metal cage, slot, link LED. */
  NS.sfpCage = function (ctx, ledColor) {
    var THREE = ctx.THREE, g = new THREE.Group();
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x16212e, metalness: 0.72, roughness: 0.42 }));
    g.add(body);
    var slot = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.02, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x04070c }));
    slot.position.x = 0.036; g.add(slot);
    var led = NS.led(ctx, ledColor || 0x6fe0a0);
    led.position.set(0.03, 0.017, 0.02); g.add(led);
    g.userData.led = led;
    return g;
  };

  /* RJ45 copper port strip: N ports with bicolor link LEDs, faces +localX. */
  NS.rj45Strip = function (ctx, n) {
    var THREE = ctx.THREE, g = new THREE.Group();
    var w = 0.05 * n + 0.02;
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.07, w),
      new THREE.MeshStandardMaterial({ color: 0x0f1a26, metalness: 0.5, roughness: 0.6 })));
    for (var i = 0; i < n; i++) {
      var z = -w / 2 + 0.05 * (i + 0.6);
      var hole = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.03, 0.032),
        new THREE.MeshBasicMaterial({ color: 0x05080d }));
      hole.position.set(0.023, 0.004, z); g.add(hole);
      var led = NS.led(ctx, (i % 3 === 0) ? 0xffc266 : 0x6fe0a0);
      led.position.set(0.023, 0.03, z); g.add(led);
    }
    return g;
  };

  /* LC duplex fibre connector nub (two ferrules) protruding +localX. */
  NS.lcConnector = function (ctx, color) {
    var THREE = ctx.THREE, g = new THREE.Group();
    var mat = new THREE.MeshStandardMaterial({ color: color || 0x2fa8c8, metalness: 0.3,
      roughness: 0.5, emissive: color || 0x0a3a48, emissiveIntensity: 0.35 });
    for (var s = -1; s <= 1; s += 2) {
      var c = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.045, 8), mat);
      c.rotation.z = Math.PI / 2; c.position.set(0.022, 0, s * 0.013); g.add(c);
    }
    return g;
  };

  /* horizontal cable-management bar with half-loop D-rings. */
  NS.cableManager = function (ctx, worldW) {
    var THREE = ctx.THREE, g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.05, worldW),
      new THREE.MeshStandardMaterial({ color: 0x0b1119, metalness: 0.4, roughness: 0.7 })));
    var n = Math.max(3, Math.floor(worldW / 0.13));
    for (var i = 0; i < n; i++) {
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.004, 6, 10, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x1b2836, metalness: 0.5, roughness: 0.6 }));
      ring.rotation.y = Math.PI / 2;
      ring.position.set(0.024, 0, -worldW / 2 + worldW * (i + 0.5) / n); g.add(ring);
    }
    return g;
  };

  /* an equipment bezel (a rack unit face) at local (fx, y, 0). */
  NS.bezel = function (ctx, fx, y, worldW, h, color) {
    var THREE = ctx.THREE;
    var m = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, worldW),
      new THREE.MeshStandardMaterial({ color: color || 0x121c28, metalness: 0.55,
        roughness: 0.55, emissive: 0x0a1420, emissiveIntensity: 0.3 }));
    m.position.set(fx, y, 0); return m;
  };

  /* ventilation strip (perforated dark panel). */
  NS.vent = function (ctx, fx, y, worldW, h) {
    var THREE = ctx.THREE;
    var cv = document.createElement('canvas'); cv.width = 128; cv.height = 32;
    var g = cv.getContext('2d'); g.fillStyle = '#0a121c'; g.fillRect(0, 0, 128, 32);
    g.fillStyle = '#05080d';
    for (var yy = 4; yy < 32; yy += 6) for (var xx = 4; xx < 128; xx += 6) g.fillRect(xx, yy, 3, 3);
    var tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    var m = new THREE.Mesh(new THREE.BoxGeometry(0.04, h, worldW),
      new THREE.MeshStandardMaterial({ map: tex, metalness: 0.4, roughness: 0.7 }));
    m.position.set(fx, y, 0); return m;
  };

  /* cabinet frame: side panels, top, plinth, back, two front mounting rails. */
  NS.cabinet = function (ctx, o) {
    o = o || {};
    var THREE = ctx.THREE, W = o.w || 0.86, H = o.h || 2.5, D = o.d || 1.05, g = new THREE.Group();
    var steel = new THREE.MeshStandardMaterial({ color: 0x0c131d, metalness: 0.55, roughness: 0.5 });
    var steelLt = new THREE.MeshStandardMaterial({ color: 0x18232f, metalness: 0.6, roughness: 0.45 });
    var railMat = new THREE.MeshStandardMaterial({ color: 0x2a3947, metalness: 0.72, roughness: 0.38 });
    var s1 = new THREE.Mesh(new THREE.BoxGeometry(D, H, 0.03), steel); s1.position.set(0, H / 2, -W / 2); g.add(s1);
    var s2 = s1.clone(); s2.position.z = W / 2; g.add(s2);
    var top = new THREE.Mesh(new THREE.BoxGeometry(D, 0.04, W), steelLt); top.position.set(0, H, 0); g.add(top);
    var pl = new THREE.Mesh(new THREE.BoxGeometry(D, 0.09, W), steel); pl.position.set(0, 0.045, 0); g.add(pl);
    var bk = new THREE.Mesh(new THREE.BoxGeometry(0.03, H, W), steel); bk.position.set(-D / 2, H / 2, 0); g.add(bk);
    for (var side = -1; side <= 1; side += 2) {
      var rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, H - 0.16, 0.05), railMat);
      rail.position.set(D / 2 - 0.055, H / 2, side * (W / 2 - 0.055)); g.add(rail);
    }
    return { group: g, W: W, H: H, D: D };
  };

  /* dark-glass door with frame, handle, and four corner screws (front at +localX). */
  NS.glassDoor = function (ctx, fx, W, H) {
    var THREE = ctx.THREE, g = new THREE.Group();
    var glass = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.06, H - 0.08),
      new THREE.MeshPhysicalMaterial({ color: 0x0a1a26, metalness: 0.1, roughness: 0.12,
        transmission: 0.0, transparent: true, opacity: 0.22, side: THREE.DoubleSide }));
    glass.rotation.y = Math.PI / 2; glass.position.set(fx + 0.002, H / 2, 0); g.add(glass);
    var frameMat = new THREE.MeshStandardMaterial({ color: 0x1c2836, metalness: 0.7, roughness: 0.4 });
    var fT = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, W), frameMat); fT.position.set(fx, H - 0.04, 0); g.add(fT);
    var fB = fT.clone(); fB.position.y = 0.06; g.add(fB);
    for (var s = -1; s <= 1; s += 2) {
      var fS = new THREE.Mesh(new THREE.BoxGeometry(0.03, H, 0.04), frameMat);
      fS.position.set(fx, H / 2, s * (W / 2 - 0.02)); g.add(fS);
    }
    var handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.34, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x35506a, metalness: 0.8, roughness: 0.3 }));
    handle.position.set(fx + 0.03, H * 0.5, W / 2 - 0.12); g.add(handle);
    var scMat = new THREE.MeshStandardMaterial({ color: 0x2b3746, metalness: 0.6, roughness: 0.5 });
    [[H - 0.06, W / 2 - 0.05], [H - 0.06, -W / 2 + 0.05], [0.1, W / 2 - 0.05], [0.1, -W / 2 + 0.05]]
      .forEach(function (p) { var sc = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 8), scMat);
        sc.rotation.z = Math.PI / 2; sc.position.set(fx + 0.005, p[0], p[1]); g.add(sc); });
    return g;
  };

  /* place a station group so its +localX front faces the aisle centre. */
  NS.placeStation = function (ctx, group, side, z, D) {
    group.position.set(side * (ctx.CFG.aisleHalf - 0.02 + D / 2), 0, z);
    group.rotation.y = side < 0 ? 0 : Math.PI;
    ctx.scene.add(group);
  };

  /* smoothstep + clamp helpers */
  NS.clamp01 = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  NS.smooth = function (x) { x = NS.clamp01(x); return x * x * (3 - 2 * x); };

})(window.FacilityStations);
