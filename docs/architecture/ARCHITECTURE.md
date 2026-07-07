# Architecture

How the immersive data-center portfolio is put together.

## Overview

The site is a **static, single-page** experience: one generated `index.html`, a
set of vanilla-JS modules, a vendored Three.js, and a DOM content layer. There is
no server and no client framework. A Python script generates the page from a
design source export at *build* time; the *runtime* is plain HTML/CSS/JS.

```
┌ build time ─────────────────────────────────────────────┐
│ legacy/design-source/design-source-v4.html        │
│        │  tools/build_facility.py (decode + patch + inject)
│        ▼                                                  │
│ index.html  +  assets/vendor/*  +  assets/facility/*      │
└──────────────────────────────────────────────────────────┘
          │ served statically (GitHub Pages / any static host)
          ▼
┌ run time ────────────────────────────────────────────────┐
│ base scene IIFE (Three.js)  ── exposes ctx + updater hooks │
│      ▲                                                     │
│ window.FacilityStations modules  ── build the facility     │
│ window.__facility.initAll(ctx)   ── orchestration          │
│ DOM chapters (.chapter > .panel)  ── accessible content    │
└──────────────────────────────────────────────────────────┘
```

## Build pipeline (`tools/build_facility.py`)

1. **Asset extraction.** The design bundle embeds assets as base64 (some gzip-ed).
   The build decodes them into `assets/vendor/` — `three.module.js`, web fonts,
   the portrait, and the data-center backdrop — and asserts the canonical résumé
   exists at `assets/`.
2. **Scene patches.** Targeted string replacements on the base scene IIFE:
   expose internals (`ctx`), add a per-frame `updaters` array and a camera hook,
   remove the floating hologram, delete the legacy hanging fibre geometry, and
   route chapter Z-positions through the central route map.
3. **Injection.** Facility module `<script>` tags (hash-busted), the milestone
   CSS (panel docking, unified sizing, skip link, nav-current, mobile
   safeguards), the PWA `<head>` (manifest/theme/icons/`<noscript>`), and the
   service-worker registration.
4. **Atomic output.** The result is validated (size, `<title>`, engine marker,
   closing tag) then written via temp-file + `os.replace` so a partial file can
   never be served. Output is deterministic — same input → identical `index.html`.

`ROOT` is derived from the script location, so the build is portable across
checkouts. `gen_world_geo.py` and `gen_icons.py` are separate, dependency-free
generators for the map data and PWA icons.

## Runtime composition

- **Base scene** renders the server room, aisle, lighting, and camera. It calls
  `window.__facility.initAll(ctx)` once internals are exposed, and calls every
  callback in `ctx.updaters` each frame.
- **Facility modules** register builders on `window.FacilityStations`.
  `facility-init.js` runs them in order (core → admin → OSI → portfolio → WAN →
  cabling → panel tabs → contact zones), wires the camera director and OSI console,
  and adds a nav scroll-spy. Each builder adds geometry and may push a per-frame
  updater.
- **Route map** (`facility-route.js`) is the single source of truth for the 12
  chapter positions; dependent modules resolve chapters by id, so renumbering is
  safe. It self-validates (`window.__routeCheck`).

## DOM accessibility layer

Every chapter exists as real, semantic DOM (`.chapter > .panel > .p-hd/.p-bd`)
independent of the 3D scene:

- Content-heavy panels are restructured by `panel-tabs.js` into tab/selector
  interfaces (skills categories, education levels, filterable + paginated
  projects, lab tools, résumé sections, one credential/role/incident at a time)
  so panels fit the viewport instead of scrolling internally. DOM nodes are
  **moved, not cloned**, preserving live handlers (subnet calculator, form).
- The contact chapter is a three-zone DOM layout (`contact-wan-zones.js`):
  a two-state console (Details ↔ Message), an architectural gap, and the WAN map
  with all controls in its bezel.
- If WebGL is unavailable, the scene is hidden and the DOM renders over a static
  backdrop — content remains fully available.

## Performance model

- Shared geometry/materials; `InstancedMesh` for repeated parts (ladder rungs).
- Per-frame allocations eliminated: emissive-material arrays are collected once
  then iterated (no per-frame `traverse`), vectors and canvas gradients are
  reused, and the contact map's canvas draw is gated behind an
  `IntersectionObserver` so it only runs on-screen.
- `QUALITY: AUTO` and `CALM` controls; `prefers-reduced-motion` honored.

## WAN transfer state machine

`wan-gateway.js` owns a state machine
(`STANDBY → VALIDATING → QUEUED → ROUTING → TRANSMITTING → ACKNOWLEDGED →
COMPLETE`, or `FAILED`) exposed on `window.__wanState`. The real Formspree POST
gates it: only an HTTP-OK response advances toward `COMPLETE`; a failure goes to
`FAILED` and never shows `COMPLETE`. `contact-wan-zones.js` renders a DOM world
map that mirrors this state. QA can drive it with `?wanmock=success|fail` (never
fires a real submission).

## QA parameters (headless capture)

- `?cam=<i>[&nopanel=1]` — pin the camera to a route node without scrolling.
- `?panel=<id>` — fix one panel centered on a dark backdrop, canvas hidden, for
  crisp DOM-panel captures.
- `?view=<domId>`, `?wanmock=success|fail` — deterministic positioning / WAN mock.

Note: headless SwiftShader does not composite a 2D `<canvas>` into screenshots, so
the DOM world map appears blank in headless PNGs even though it renders in a real
browser (verified via `getImageData`).
