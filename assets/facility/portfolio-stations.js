/* portfolio-stations.js — extend the rack-origin smart-glass system through every chapter after
   OSI: Skills, Education, Projects, NOC (troubleshooting), Experience, Certifications, Lab, Résumé.
   Each gets its own equipment + a rack-origin glass display that telescopes out on camera approach.
   Semantic/functional DOM content (project links, subnet calculator, résumé download, contact form)
   stays intact in the docked panel; the glass shows the concise initial view. Contact/WAN is built
   separately (wan-gateway.js). */
window.FacilityStations = window.FacilityStations || {};
(function (NS) {
  'use strict';

  NS.buildPortfolioStations = function (ctx) {
    var THREE = ctx.THREE, C = NS, R = window.FACILITY_ROUTE; if (!R) return null;
    var fx = 0.5, displays = {};

    var CH = {
      skills:         { node: 9,  kicker: 'EQUIPMENT BAY', title: 'Skills Bay', accent: '#43e0a8', kind: 'bay',
        rows: [['MODULES', '8 bays'], ['NET', 'R&S · OSPF · ACL'], ['SYS', 'AD · Linux · VMware'], ['AUTO', 'PowerShell · Bash']] },
      education:      { node: 10, kicker: 'INFRA BACKBONE', title: 'Education', accent: '#43e0a8', kind: 'backbone',
        rows: [['PROGRAM', 'CST — Networking'], ['SCHOOL', 'Algonquin College'], ['STATUS', 'Level 3 complete'], ['GRAD', '2027']] },
      projects:       { node: 11, kicker: 'SERVER CLUSTER', title: 'Project Cluster', accent: '#5cd98a', kind: 'cluster',
        rows: [['NODES', '11 projects'], ['NET', 'Cisco · DHCP-snoop'], ['SYS', 'AD · Exchange 2019'], ['LINUX', 'BIND · Apache · Podman']] },
      troubleshooting: { node: 12, kicker: 'OPERATIONS CENTER', title: 'NOC', accent: '#f5c26b', kind: 'noc',
        rows: [['INCIDENTS', 'case studies'], ['DIAG', 'ping · traceroute'], ['RCA', 'root-cause'], ['STATUS', 'HEALTHY']] },
      experience:     { node: 13, kicker: 'OPS CORRIDOR', title: 'Experience', accent: '#35e0f1', kind: 'corridor',
        rows: [['ROLE', 'IT Support Coordinator'], ['PRIOR', 'Shift/Team Lead'], ['SKILLS', 'leadership · comms'], ['ENV', 'Windows · Linux']] },
      certifications: { node: 14, kicker: 'CREDENTIAL SECURITY', title: 'Credentials', accent: '#a98cf0', kind: 'vault',
        rows: [['CCNA', 'SRWE · Jan 2026'], ['CISCO', 'Packet Tracer · 2024'], ['STATUS', 'VERIFIED']] },
      lab:            { node: 15, kicker: 'DIAGNOSTIC LAB', title: 'Networking Lab', accent: '#35e0f1', kind: 'lab',
        rows: [['SUBNET', 'calculator'], ['DHCP', 'DORA'], ['PORTS', 'common'], ['CMDS', 'diagnostic']] },
      resume:         { node: 16, kicker: 'SECURE VAULT', title: 'Résumé Vault', accent: '#43e0a8', kind: 'vault',
        rows: [['ROLE', 'IT Networking Tech'], ['VERSION', 'current'], ['STATUS', 'ENCRYPTED'], ['ACTION', 'download / preview']] }
    };

    Object.keys(CH).forEach(function (key) {
      var cfg = CH[key], node = R.byId[key], z = node.z, side = node.side;   // resolve by id (route-renumber safe)
      var root = new THREE.Group();
      buildEquipment(root, cfg);
      var disp = NS.createRackDisplay(ctx, { fx: fx, y: 1.55, z: -0.1, accent: hex(cfg.accent), w: 0.8, h: 0.52, cvW: 460, cvH: 300 });
      root.add(disp.group);
      disp.draw(function (g, W, H, acc) {
        NS.drawInfoScreen(g, W, H, acc, { kicker: cfg.kicker, title: cfg.title, pdu: '', rows: cfg.rows, hint: 'Inspect on the console' });
      });
      C.placeStation(ctx, root, side, z, 1.05);
      displays[key] = { disp: disp, z: z, nodeIdx: node.i };
    });

    ctx.updaters.push(function (st, now) {
      var camz = ctx.camera.position.z, calm = st.calm;
      for (var k in displays) {
        var d = displays[k]; var prox = Math.max(0, 1 - Math.abs(camz - d.z) / 7.5);
        var target = prox * prox * (3 - 2 * prox);
        if (window.__pinIdx === d.nodeIdx) target = 1;
        d.disp.setOpen(calm ? target : d.disp.open + (target - d.disp.open) * 0.12);
        d.disp.update(now, target > 0.4);
      }
    });

    return { displays: displays };

    function buildEquipment(root, cfg) {
      var acc = hex(cfg.accent), leds = [];
      var cab = C.cabinet(ctx, { w: 0.86, h: 2.55, d: 1.05 }); root.add(cab.group);
      var kind = cfg.kind;

      if (kind === 'bay') {
        var bays = ['NET', 'WIN', 'LNX', 'SEC', 'VIRT', 'AUTO'];
        for (var i = 0; i < 6; i++) { var y = 0.7 + i * 0.3; root.add(C.bezel(ctx, fx, y, 0.72, 0.2, i % 2 ? 0x131f2c : 0x121a26));
          for (var q = 0; q < 5; q++) { var l = C.led(ctx, q % 3 ? 0x6fe0a0 : 0x5a9dff); l.position.set(fx + 0.03, y + 0.05, -0.28 + q * 0.13); root.add(l); leds.push(l); }
          lab(root, bays[i], y, 0.34, '#bfe4ff', 16); }
      } else if (kind === 'backbone') {
        // vertical spine of connected course/lab nodes
        var spine = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.8, 0.04), new THREE.MeshStandardMaterial({ color: 0x243447, metalness: 0.7, roughness: 0.4 }));
        spine.position.set(fx + 0.03, 1.4, 0); root.add(spine);
        for (var n = 0; n < 6; n++) { var yy = 0.7 + n * 0.28; var nodeM = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), new THREE.MeshBasicMaterial({ color: acc })); nodeM.position.set(fx + 0.03, yy, 0); root.add(nodeM);
          root.add(C.bezel(ctx, fx, yy, 0.5, 0.12, 0x121a26)); var l2 = C.led(ctx, 0x6fe0a0); l2.position.set(fx + 0.03, yy + 0.04, -0.2); root.add(l2); leds.push(l2); }
        lab(root, 'ALGONQUIN · CST-NET', 2.0, -0.36, acc);
      } else if (kind === 'cluster') {
        for (var b = 0; b < 7; b++) { var y3 = 0.7 + b * 0.24; root.add(C.bezel(ctx, fx, y3, 0.72, 0.15, 0x101a26));
          for (var s = 0; s < 4; s++) { var l3 = C.led(ctx, s ? 0x5fe0a0 : 0x5a9dff); l3.position.set(fx + 0.04, y3 + 0.04, -0.26 + s * 0.16); root.add(l3); leds.push(l3); } }
        lab(root, 'PROJECT NODES', 2.0, -0.36, acc);
      } else if (kind === 'noc') {
        // wide monitoring wall screen + operator desk consoles
        var wall = NS.createRackDisplay(ctx, { fx: fx, y: 1.9, z: 0, accent: acc, w: 1.2, h: 0.62, cvW: 520, cvH: 270 });
        wall.setOpen(1); root.add(wall.group);
        wall.draw(function (g, W, H, a) { drawNoc(g, W, H, a); });
        var desk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.7), new THREE.MeshStandardMaterial({ color: 0x16202c, metalness: 0.5, roughness: 0.5 }));
        desk.position.set(fx + 0.32, 0.95, 0); root.add(desk);
        for (var a = 0; a < 6; a++) { var la = C.led(ctx, a === 5 ? 0xffc266 : 0x6fe0a0); la.position.set(fx + 0.04, 1.2 + a * 0.05, -0.3); root.add(la); leds.push(la); }
        lab(root, 'NOC · MONITORING', 1.5, -0.42, acc);
        ctx.updaters.push(function (st, now) { wall.update(now, true); });
      } else if (kind === 'corridor') {
        var roles = ['IT SUPPORT COORD', 'SHIFT LEAD', 'KITCHEN LEAD'];
        for (var r = 0; r < 3; r++) { var yr = 1.6 - r * 0.42; root.add(C.bezel(ctx, fx, yr, 0.72, 0.28, r === 0 ? 0x14202e : 0x111a24));
          var lr = C.led(ctx, r === 0 ? 0x35e0f1 : 0x6fe0a0); lr.position.set(fx + 0.04, yr + 0.08, -0.3); root.add(lr); leds.push(lr);
          lab(root, roles[r], yr, 0.32, r === 0 ? '#9be8ff' : '#9fb6cc', 15); }
      } else if (kind === 'vault') {
        // secure vault cabinet: door ring + auth panel
        var ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 10, 28), new THREE.MeshStandardMaterial({ color: 0x2a3a4a, metalness: 0.8, roughness: 0.3 }));
        ring.rotation.y = Math.PI / 2; ring.position.set(fx + 0.02, 1.3, 0); root.add(ring);
        var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0x35506a, metalness: 0.85, roughness: 0.25 }));
        hub.rotation.z = Math.PI / 2; hub.position.set(fx + 0.03, 1.3, 0); root.add(hub);
        for (var v = 0; v < 3; v++) { var lv = C.led(ctx, v === 0 ? 0x5fe0a0 : 0xa98cf0); lv.position.set(fx + 0.04, 1.9 - v * 0.08, -0.28); root.add(lv); leds.push(lv); }
        lab(root, 'SECURE · VERIFIED', 1.95, -0.32, acc); lab(root, 'AUTH · OK', 0.85, 0.3, '#5fe0a0', 15);
      } else if (kind === 'lab') {
        // diagnostic workstation: desk + rack test gear
        var desk2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.7), new THREE.MeshStandardMaterial({ color: 0x16202c, metalness: 0.5, roughness: 0.5 }));
        desk2.position.set(fx + 0.3, 1.0, 0); root.add(desk2);
        for (var t = 0; t < 4; t++) { var yt = 1.4 + t * 0.24; root.add(C.bezel(ctx, fx, yt, 0.72, 0.16, 0x121d2a));
          var lt = C.led(ctx, t % 2 ? 0x35e0f1 : 0x6fe0a0); lt.position.set(fx + 0.04, yt + 0.04, -0.3); root.add(lt); leds.push(lt); }
        lab(root, 'DIAG · TEST GEAR', 2.02, -0.36, acc);
      }
      root.userData.leds = leds;
      ctx.updaters.push(function (st, now) { for (var i = 0; i < leds.length; i++) { var f = st.calm ? 1 : (0.6 + 0.4 * Math.sin(now * 0.004 + i * 1.1)); leds[i].material.color.copy(leds[i].userData.base).multiplyScalar(0.4 + 0.6 * f); } });
    }
    function drawNoc(g, W, H, acc) {
      g.fillStyle = 'rgba(6,13,22,0.8)'; g.fillRect(6, 6, W - 12, H - 12);
      g.strokeStyle = 'rgba(120,170,230,0.25)'; g.strokeRect(6, 6, W - 12, H - 12);
      g.fillStyle = '#' + acc.getHexString(); g.font = 'bold 15px ui-monospace,monospace'; g.fillText('NOC · MONITORING WALL', 16, 26);
      g.fillStyle = '#5fe0a0'; g.font = '12px ui-monospace,monospace'; g.fillText('● ALL PATHS HEALTHY', W - 150, 26);
      // mini topology
      g.strokeStyle = 'rgba(90,180,255,.5)'; g.lineWidth = 1.3;
      var pts = [[60, 90], [180, 70], [300, 110], [420, 80], [140, 160], [280, 190], [400, 170]];
      for (var i = 0; i < pts.length; i++) { var b = pts[(i + 2) % pts.length]; g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(b[0], b[1]); g.stroke(); }
      pts.forEach(function (p) { g.fillStyle = '#8fd8ff'; g.beginPath(); g.arc(p[0], p[1], 4, 0, 7); g.fill(); });
      g.fillStyle = 'rgba(160,205,255,.7)'; g.font = '11px ui-monospace,monospace';
      g.fillText('INCIDENT QUEUE: 0 open · anonymized case studies in console', 16, H - 16);
    }
    function lab(root, text, y, z, color, fs) { var m = C.label(ctx, text, Math.min(0.42, 0.019 * text.length + 0.07), { color: color, fs: fs || 18 }); m.rotation.y = Math.PI / 2; m.position.set(fx + 0.09, y, z); root.add(m); }
    function hex(s) { return parseInt(s.replace('#', ''), 16); }
  };
})(window.FacilityStations);
