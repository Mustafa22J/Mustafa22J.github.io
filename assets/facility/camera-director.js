/* camera-director.js — B4: human-scale approach choreography for the Milestone B stations.
   Pure function of scroll state (so reverse-scroll and hash jumps restore correctly).
   For station chapters it shifts the camera laterally toward the station, creeps forward,
   and aims at the station anchor — easing in/out. No roll, stable horizon, clamped so the
   camera never leaves the aisle or clips into racks. */
window.FacilityStations = window.FacilityStations || {};
(function (NS) {
  'use strict';

  NS.makeCameraDirector = function (ctx) {
    var AH = ctx.CFG.aisleHalf;
    var S = {
      0: { side: -1, lateral: 0.42, forward: -1.05, rise: 0.05, aim: 0.50,
           anchor: { x: -1.42, y: 1.42, z: ctx.chapterZ(0) } },   // core cabinet SFP+ uplink
      1: { side:  1, lateral: 0.58, forward: -1.40, rise: 0.06, aim: 0.72,
           anchor: { x:  1.45, y: 1.52, z: ctx.chapterZ(1) } }    // admin monitor / portrait (framed right-of-centre)
    };
    // OSI bay + portfolio chapters: approach the active side, aim at the display
    var R = window.FACILITY_ROUTE;
    if (R) { var lastCi = R.byId.contact.i; for (var ci = 2; ci < lastCi; ci++) { var nd = R.nodes[ci];
      S[ci] = { side: nd.side, lateral: 0.5, forward: -1.0, rise: 0.04, aim: 0.58,
                anchor: { x: nd.side * 1.35, y: 1.5, z: nd.z } }; }
      // WAN room (contact node): pull back and face the wall-mounted world map at the end wall
      var w = R.byId.contact;
      S[w.i] = { side: 1, lateral: 0.0, forward: 0.4, rise: 0.35, aim: 0.55, anchor: { x: 0, y: 1.9, z: w.z - 3.0 } };
    }
    var LIM = AH - 0.9;   // keep camera comfortably inside the aisle

    return function (st, camera, look) {
      var s = S[st.ci]; if (!s) return;
      var a = NS.smooth((st.nearAmt - 0.12) / 0.88);
      var m = (st.calm ? 0.5 : 1) * (ctx.CFG.motion != null ? ctx.CFG.motion : 1);
      camera.position.x += s.side * s.lateral * a * m;
      camera.position.z += s.forward * a * m;
      camera.position.y += s.rise * a * m;
      if (camera.position.x > LIM) camera.position.x = LIM;
      if (camera.position.x < -LIM) camera.position.x = -LIM;
      look.x += (s.anchor.x - look.x) * s.aim * a;
      look.y += (s.anchor.y - look.y) * s.aim * a;
      look.z += (s.anchor.z - look.z) * s.aim * a;
    };
  };
})(window.FacilityStations);
