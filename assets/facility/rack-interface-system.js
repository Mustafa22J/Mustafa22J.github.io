/* rack-interface-system.js — reusable rack-origin smart-glass display.
   A screen that physically EXTENDS from a rack on a telescoping support arm (it does not rise
   from the bottom of the viewport). Layered glass: mounting bracket + arm + dark-tint transparent
   glass (background stays visible) + local readability backing + content canvas + restrained cyan
   active edge + cable + contact shadow. setOpen(0..1) drives the mechanical extend/retract. */
window.FacilityStations = window.FacilityStations || {};
(function (NS) {
  'use strict';

  // opts: { fx, y, z, w, h, cvW, cvH, accent }  — built in local space, screen faces +localX (aisle)
  NS.createRackDisplay = function (ctx, opts) {
    var THREE = ctx.THREE; opts = opts || {};
    var fx = opts.fx != null ? opts.fx : 0.5;
    var y = opts.y != null ? opts.y : 1.5, z = opts.z || 0;
    var w = opts.w || 0.62, h = opts.h || 0.42;
    var acc = new THREE.Color(opts.accent || 0x5ad2ff);
    var root = new THREE.Group();

    // ---- mounting bracket on the rack face ----
    var steel = new THREE.MeshStandardMaterial({ color: 0x223140, metalness: 0.75, roughness: 0.38 });
    var bracket = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.16), steel);
    bracket.position.set(fx, y, z); root.add(bracket);
    // pivot cylinders (visible mounting points)
    for (var s = -1; s <= 1; s += 2) {
      var pv = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 10), steel);
      pv.rotation.x = Math.PI / 2; pv.position.set(fx + 0.03, y, z + s * 0.06); root.add(pv);
    }

    // ---- telescoping arm (two segments) ----
    var arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.028, 0.028), steel); arm1.position.set(fx + 0.09, y, z); root.add(arm1);
    var arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.02), steel); root.add(arm2);

    // ---- screen group at the arm end ----
    var screen = new THREE.Group(); root.add(screen);
    // frame
    var frame = new THREE.Mesh(new THREE.BoxGeometry(0.02, h + 0.05, w + 0.05),
      new THREE.MeshStandardMaterial({ color: 0x0c151f, metalness: 0.6, roughness: 0.45 }));
    screen.add(frame);
    // outer transparent glass (background stays visible through it)
    var glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0a1a2e, metalness: 0, roughness: 0.14,
      transparent: true, opacity: 0.16, side: THREE.DoubleSide, reflectivity: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.2 });
    var glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glassMat);
    glass.rotation.y = Math.PI / 2; glass.position.x = 0.02; screen.add(glass);
    // content canvas (behind the glass; draws its own local readability backing)
    var cv = document.createElement('canvas'); cv.width = opts.cvW || 420; cv.height = opts.cvH || 284;
    var g2 = cv.getContext('2d');
    var tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    var contentMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0 });
    var content = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.02, h - 0.02), contentMat);
    content.rotation.y = Math.PI / 2; content.position.x = 0.015; screen.add(content);
    // restrained cyan active edge (aisle-facing)
    var edgeMat = new THREE.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0 });
    var edge = new THREE.Mesh(new THREE.PlaneGeometry(0.012, h), edgeMat);
    edge.rotation.y = Math.PI / 2; edge.position.set(0.022, 0, w / 2); screen.add(edge);
    // moving activation highlight
    var hlMat = new THREE.MeshBasicMaterial({ color: 0xbfe4ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    var hl = new THREE.Mesh(new THREE.PlaneGeometry(0.05, h), hlMat);
    hl.rotation.y = Math.PI / 2; hl.position.x = 0.024; screen.add(hl);
    // data cable screen -> rack
    var cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -h / 2, 0), new THREE.Vector3(-0.12, -h / 2 - 0.08, 0), new THREE.Vector3(fx - (fx), -0.2, 0)
    ]), 12, 0.006, 5, false), new THREE.MeshStandardMaterial({ color: 0x0a1420, metalness: 0.3, roughness: 0.7 }));
    screen.add(cable);
    // contact shadow on the floor under the extended screen
    var shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 }));
    shadow.rotation.x = -Math.PI / 2; root.add(shadow);

    var open = 0, drawFn = null, lastDraw = 0;
    function setOpen(t) {
      open = t < 0 ? 0 : t > 1 ? 1 : t;
      var e = open * open * (3 - 2 * open);                 // mechanical ease
      var armLen = 0.16 + 0.34 * e;                         // telescope out
      arm2.position.set(fx + 0.06 + armLen * 0.5, y, z); arm2.scale.x = Math.max(0.05, armLen / 0.2);
      screen.position.set(fx + 0.06 + armLen, y, z);
      screen.rotation.y = (1 - e) * 0.6;                    // unfold to face the aisle
      glassMat.opacity = 0.05 + 0.12 * e;
      contentMat.opacity = e;
      edgeMat.opacity = 0.85 * e;
      shadow.position.set(fx + 0.06 + armLen, 0.02, z); shadow.material.opacity = 0.28 * e;
    }
    function activationPulse(now) {
      if (open > 0.6 && open < 0.999) { hlMat.opacity = 0.5; hl.position.z = (((now * 0.001) % 1) - 0.5) * w; }
      else hlMat.opacity = Math.max(0, hlMat.opacity - 0.05);
    }
    function draw(fn) { drawFn = fn; repaint(0); }
    function repaint(now) {
      if (!drawFn) return;
      var W = cv.width, H = cv.height;
      g2.clearRect(0, 0, W, H);
      drawFn(g2, W, H, acc);                                // caller draws local readability backing + text
      tex.needsUpdate = true;
    }
    function update(now, active) {
      activationPulse(now);
      if (active && now - lastDraw > 140) { lastDraw = now; repaint(now); }
    }
    setOpen(0);
    return { group: root, screen: screen, setOpen: setOpen, draw: draw, repaint: repaint, update: update,
      get open() { return open; } };
  };

  // shared canvas helper: draw a titled info screen with local dark readability backing.
  NS.drawInfoScreen = function (g, W, H, acc, cfg) {
    var pad = 16;
    // local readability backing (only behind content — glass stays transparent elsewhere)
    g.fillStyle = 'rgba(6,13,22,0.72)'; roundRect(g, pad - 6, pad - 6, W - (pad - 6) * 2, H - (pad - 6) * 2, 10); g.fill();
    g.strokeStyle = 'rgba(120,170,230,0.22)'; g.lineWidth = 1; g.stroke();
    // header
    g.fillStyle = cssColor(acc); g.font = 'bold 15px ui-monospace,monospace';
    g.fillText(cfg.kicker || '', pad, pad + 14);
    g.fillStyle = '#eaf4ff'; g.font = 'bold 26px ui-monospace,monospace';
    g.fillText(cfg.title || '', pad, pad + 46);
    g.fillStyle = '#9be8ff'; g.font = '14px ui-monospace,monospace';
    g.fillText(cfg.pdu || '', pad, pad + 70);
    // rows
    g.font = '13px ui-monospace,monospace';
    (cfg.rows || []).forEach(function (r, i) {
      g.fillStyle = '#7fb0d6'; g.fillText(r[0], pad, pad + 100 + i * 22);
      g.fillStyle = '#dfeeff'; g.fillText(r[1], pad + 118, pad + 100 + i * 22);
    });
    // footer hint
    g.fillStyle = 'rgba(160,205,255,.65)'; g.font = '11px ui-monospace,monospace';
    g.fillText(cfg.hint || 'Inspect for detail', pad, H - pad + 2);
  };
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function cssColor(c) { return '#' + c.getHexString(); }

})(window.FacilityStations);
