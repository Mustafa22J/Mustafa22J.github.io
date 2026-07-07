/* administrator-station.js — B2: physical administrator / identity station (chapter 1, About).
   A management rack with labelled identity/service bays, a pull-out 1U KVM console, and a
   monitor on a support arm showing the portrait INSIDE a screen frame (not a giant web image).
   Nearby equipment represents Networking / Windows-identity / Linux / Endpoint / Automation. */
window.FacilityStations = window.FacilityStations || {};
(function (NS) {
  'use strict';

  NS.buildAdminStation = function (ctx) {
    var THREE = ctx.THREE, C = NS, z0 = ctx.chapterZ(1), side = 1, D = 1.05, fx = 0.5;
    var root = new THREE.Group(), leds = [];

    // ---- supporting management rack ----
    var cab = C.cabinet(ctx, { w: 0.86, h: 2.55, d: D });
    root.add(cab.group);
    root.add(C.glassDoor(ctx, fx + 0.07, cab.W, cab.H));
    var services = [['NET-MGMT', '#9be8ff'], ['AD · IDENTITY', '#5a9dff'], ['LINUX SVC', '#5fe0a0'],
                    ['ENDPOINT', '#ffc266'], ['AUTOMATION', '#a98cf0']];
    for (var i = 0; i < services.length; i++) {
      var y = 0.55 + i * 0.34;
      root.add(C.bezel(ctx, fx, y, 0.72, 0.22, 0x111c28));
      for (var q = 0; q < 6; q++) { var l = C.led(ctx, q % 2 ? 0x6fe0a0 : 0x5a9dff); l.position.set(fx + 0.03, y + 0.06, -0.28 + q * 0.11); root.add(l); leds.push(l); }
      var lab = C.label(ctx, services[i][0], 0.24, { color: services[i][1], fs: 20 });
      lab.rotation.y = Math.PI / 2; lab.position.set(fx + 0.09, y, -0.42); root.add(lab);
    }

    // ---- pull-out 1U KVM console: drawer + keyboard + small terminal ----
    var steel = new THREE.MeshStandardMaterial({ color: 0x16202c, metalness: 0.6, roughness: 0.5 });
    var drawer = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.62), steel);
    drawer.position.set(fx + 0.28, 1.0, 0); root.add(drawer);
    var kb = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.014, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x0c141d, metalness: 0.4, roughness: 0.75 }));
    kb.position.set(fx + 0.36, 1.02, 0.02); root.add(kb);
    var kvm = C.screen(ctx, 0.36, 0.22, 256, 156);
    kvm.mesh.rotation.y = Math.PI / 2; kvm.mesh.position.set(fx + 0.16, 1.16, 0); root.add(kvm.mesh);
    var kvmFrame = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.26, 0.4), steel);
    kvmFrame.position.set(fx + 0.15, 1.16, 0); root.add(kvmFrame);
    var kvmTag = C.label(ctx, '1U KVM CONSOLE', 0.26, { color: '#9be8ff', fs: 18 });
    kvmTag.rotation.y = Math.PI / 2; kvmTag.position.set(fx + 0.05, 0.9, 0); root.add(kvmTag);

    // ---- monitor on a support arm, showing the portrait inside a screen frame ----
    var armMat = new THREE.MeshStandardMaterial({ color: 0x2a3947, metalness: 0.72, roughness: 0.4 });
    var post = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.55, 0.04), armMat); post.position.set(fx + 0.05, 1.55, 0.28); root.add(post);
    var arm = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.035, 0.035), armMat); arm.position.set(fx + 0.22, 1.62, 0.28); root.add(arm);
    var mon = new THREE.Group();
    mon.add(new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.62, 0.52),
      new THREE.MeshStandardMaterial({ color: 0x0a1119, metalness: 0.5, roughness: 0.5 })));
    // screen "chrome" canvas — identity label (top) + status strip (bottom) only; the portrait is a
    // SEPARATE full-resolution textured plane so it is never squeezed through a low-res canvas.
    var scr = C.screen(ctx, 0.48, 0.58, 512, 616);
    scr.mesh.rotation.y = Math.PI / 2; scr.mesh.position.x = 0.02; mon.add(scr.mesh);
    // high-resolution portrait plane (direct JPG texture, sRGB, anisotropic, mipmapped, opaque —
    // no transparent overlay, no emissive, no bloom). Aspect matches the 2112x2096 source (~1.008)
    // so the face is not stretched. Sits just in front of the screen, in the middle region.
    var ptex = new THREE.TextureLoader().load('assets/vendor/portrait.jpg', function (t) { t.needsUpdate = true; });
    ptex.colorSpace = THREE.SRGBColorSpace;
    ptex.anisotropy = 16;                       // three.js clamps this to the hardware maximum
    ptex.minFilter = THREE.LinearMipmapLinearFilter;
    ptex.magFilter = THREE.LinearFilter;
    ptex.generateMipmaps = true;
    var portrait = new THREE.Mesh(new THREE.PlaneGeometry(0.40, 0.397),
      new THREE.MeshBasicMaterial({ map: ptex }));
    portrait.rotation.y = Math.PI / 2; portrait.position.set(0.021, 0.006, 0); mon.add(portrait);
    mon.position.set(fx + 0.42, 1.6, 0.28); root.add(mon);   // rotation driven per-frame (see updater)
    // stand base on the drawer
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.03, 16), armMat); base.position.set(fx + 0.05, 1.29, 0.28); root.add(base);
    // data cable monitor -> rack
    root.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(fx + 0.4, 1.35, 0.28), new THREE.Vector3(fx + 0.15, 1.05, 0.2), new THREE.Vector3(fx + 0.02, 0.98, 0.05)
    ]), 18, 0.007, 6, false), new THREE.MeshStandardMaterial({ color: 0x0a1420, metalness: 0.3, roughness: 0.7 })));
    // nameplate
    var plate = C.label(ctx, 'ADMIN STATION', 0.34, { color: '#bfe4ff', fs: 22 });
    plate.rotation.y = Math.PI / 2; plate.position.set(fx + 0.05, 2.22, 0); root.add(plate);

    // contact shadow under the station
    var sh = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
    sh.rotation.x = -Math.PI / 2; sh.position.set(fx + 0.2, 0.015, 0.1); root.add(sh);

    // ---- paint the monitor chrome (identity label + status strip); portrait is its own plane ----
    paintKVM(kvm);
    paintChrome();
    function paintChrome() {
      var g = scr.g, W = scr.W, H = scr.H;
      g.fillStyle = '#0a1420'; g.fillRect(0, 0, W, H);
      // identity header (NOT over the face)
      g.fillStyle = '#0e2233'; g.fillRect(0, 0, W, Math.round(H * 0.125));
      g.fillStyle = '#cfe8ff'; g.font = 'bold ' + Math.round(H * 0.05) + 'px ui-monospace, monospace';
      g.fillText('MUSTAFA JAWISH', 22, Math.round(H * 0.058));
      g.fillStyle = '#7fb8e0'; g.font = Math.round(H * 0.03) + 'px ui-monospace, monospace';
      g.fillText('IT SUPPORT COORDINATOR', 22, Math.round(H * 0.102));
      // dark portrait recess + restrained bezel frame (the hi-res portrait plane sits over this)
      var rx = Math.round(W * 0.055), ry = Math.round(H * 0.15), rw = Math.round(W * 0.89), rh = Math.round(H * 0.70);
      g.fillStyle = '#0b1622'; g.fillRect(rx, ry, rw, rh);
      g.strokeStyle = 'rgba(120,170,230,0.32)'; g.lineWidth = 3; g.strokeRect(rx, ry, rw, rh);
      // status strip (bottom)
      g.fillStyle = '#0e1c2b'; g.fillRect(0, H - Math.round(H * 0.09), W, Math.round(H * 0.09));
      g.fillStyle = '#5fe0a0'; g.font = Math.round(H * 0.03) + 'px ui-monospace, monospace';
      g.fillText('● SESSION ACTIVE  ·  Algonquin College', 22, H - Math.round(H * 0.032));
      scr.flush();
    }

    C.placeStation(ctx, root, side, z0, D);

    // ---- monitor facing + LED life ----
    // The screen turns to face the camera using ABOUT-chapter-local progress (not a late global
    // scroll threshold): stowed while inactive, swings to a readable angle early (settles by ~0.25),
    // stays stable through the reading range, and only turns away once the chapter is genuinely
    // ending (>0.82). About is route chapter 1, so local progress p = smoothCF - 0.5 over [0.5,1.5].
    var monWorld = null, faceEased = null, THOW = -0.55;
    ctx.updaters.push(function (st, now) {
      for (var k = 0; k < leds.length; k++) {
        var f = st.calm ? 1 : (0.55 + 0.45 * Math.sin(now * 0.004 + k * 1.3));
        leds[k].material.color.copy(leds[k].userData.base).multiplyScalar(0.4 + 0.6 * f);
      }
      if (monWorld === null) { monWorld = new THREE.Vector3(); mon.getWorldPosition(monWorld); }
      // About is route chapter 1; when a headless QA capture pins the camera here (?cam=1) the page
      // is not scrolled, so drive the reading state directly instead of from smoothCF.
      var p = (window.__pinIdx === 1) ? 0.5 : C.clamp01(st.smoothCF - 0.5);
      var env;                                   // 0 = stowed, 1 = facing the camera
      if (p <= 0.10) env = 0;
      else if (p < 0.25) env = C.smooth((p - 0.10) / 0.15);
      else if (p <= 0.82) env = 1;
      else env = 1 - C.smooth((p - 0.82) / 0.18);
      // local y-rotation whose world normal points at the camera (screen faces +localX; root is
      // rotated PI for a right-side station) → theta = atan2(dz, -dx); clamp to a natural range.
      var dx = ctx.camera.position.x - monWorld.x, dz = ctx.camera.position.z - monWorld.z;
      var thetaFace = Math.atan2(dz, -dx);
      if (thetaFace < 0.35) thetaFace = 0.35; else if (thetaFace > 1.12) thetaFace = 1.12;
      var target = THOW + (thetaFace - THOW) * env;
      if (faceEased === null) faceEased = target;
      faceEased += (target - faceEased) * (st.calm ? 1 : 0.09);   // damped → stable while reading
      mon.rotation.y = faceEased;
    });

    return { root: root, z: z0, side: side };

    function paintKVM(s) {
      var g = s.g, W = s.W, H = s.H;
      g.fillStyle = '#08131f'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#5fe0a0'; g.font = '13px ui-monospace, monospace';
      ['root@mgmt:~$ whoami', 'mustafa', 'root@mgmt:~$ Get-Service ADDS', '  Running  Active Directory', 'root@mgmt:~$ _']
        .forEach(function (t, i) { g.fillText(t, 8, 20 + i * 22); });
      s.flush();
    }
  };
})(window.FacilityStations);
