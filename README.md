# Mustafa Jawish — Immersive Data-Center Portfolio

An immersive, single-page portfolio rendered as a **3D data-center facility**. The
visitor scrolls through the building, tracing a packet from the core router out to
the WAN edge; each chapter (about, OSI stack, skills, education, projects, NOC,
experience, certifications, lab, résumé, contact) is a physical area with
rack-mounted, smart-glass displays. A full DOM layer mirrors every chapter so the
content is accessible, keyboard-navigable, and works without WebGL.

- **Live entry point:** `index.html` (repository root)
- **Purpose:** portfolio for Mustafa Jawish — IT Support Coordinator & Computer
  Systems Technician – Networking student (Algonquin College, Ottawa).
- **No backend, no build step to *run*** — it is a static site. A Python build
  script *generates* the page; the deployed output is plain HTML/CSS/JS.

## Technology

- **Three.js r0.160**, vendored locally at `assets/vendor/three.module.js` and
  imported as a blob — **no CDN**, fully offline-capable.
- **Vanilla JS** modules under `assets/facility/` (no framework, no runtime
  dependencies). They register on `window.FacilityStations` and are orchestrated
  by `facility-init.js`.
- **Progressive Web App:** `manifest.json` + `service-worker.js` (offline shell,
  runtime asset cache) + generated icons under `assets/icons/`.
- **Contact:** real [Formspree](https://formspree.io) submission
  (`https://formspree.io/f/mvgwayna`); a successful response gates the simulated
  WAN transfer animation. The world-map journey is clearly labelled a
  **simulated visualization** — only the form submission itself is real.

## Architecture

The site is **generated at build time** from a Claude Design export:

```
legacy/claude-design/claude-design-v4-source.html   (the design "bundle")
        │  tools/build_facility.py
        ▼
index.html   (self-contained: base scene + injected facility modules + PWA head)
```

`build_facility.py`:
1. Decodes the bundle's base64/gzip assets into `assets/vendor/` (Three.js, fonts,
   portrait, data-center backdrop) and mirrors the résumé into `assets/`.
2. String-patches the base scene IIFE to expose internals and per-frame updater
   hooks, replaces the floating hologram, removes the legacy hanging fibre, and
   docks each chapter's DOM panel opposite its rack.
3. Injects the facility module `<script>` tags, the accessibility CSS/skip-link,
   the PWA `<head>` (manifest, theme-color, icons, `<noscript>` fallback), and the
   service-worker registration.
4. Writes `index.html` **atomically** (temp file → validate → `os.replace`).

Key runtime modules (`assets/facility/`):

| Module | Role |
|---|---|
| `facility-route.js` | Central route map: 12 chapter nodes, world Z positions, self-check. |
| `facility-common.js` | Shared helpers (labels, LEDs, SFP cages, screens). |
| `core-cabinet.js`, `administrator-station.js` | Hero core + identity station. |
| `osi-stations.js`, `osi-state.js` | One consolidated OSI bay + its 7-layer console. |
| `structured-cabling.js` | Overhead ladder racks, trays, SFP+/LC connector assemblies. |
| `portfolio-stations.js` | Skills / education / projects / NOC / experience / certs / lab / résumé equipment. |
| `rack-interface-system.js` | Rack-origin telescoping smart-glass display. |
| `panel-tabs.js` | Restructures content-heavy panels into tab/selector interfaces. |
| `world-geo.js` | Offline Equal-Earth projection of Natural Earth 110m land. |
| `wan-gateway.js` | WAN room, wall-mounted world map, transfer state machine. |
| `contact-wan-zones.js` | Contact two-zone layout (console + gap + in-bezel map). |
| `camera-director.js` | Scroll-driven, human-height camera choreography. |
| `facility-init.js` | Orchestrates all of the above + nav scroll-spy + QA params. |

## Build & preview

```bash
# regenerate index.html from the design source (Python 3, stdlib only)
python tools/build_facility.py

# regenerate the offline world-map data from Natural Earth (optional)
python tools/gen_world_geo.py

# regenerate the PWA icons (optional)
python tools/gen_icons.py

# preview locally (any static server); then open http://localhost:8123/
python -m http.server 8123
```

There is **no `npm install`** — the site ships as static files.

## Deployment (static / GitHub Pages)

All asset paths are **relative**, and the manifest `start_url`/`scope` are `"."`,
so the site works both at a domain root and at a GitHub Pages *project* subpath
(`https://<user>.github.io/<repo>/`). To deploy:

1. Copy the repository contents into your portfolio repo (see
   `DEPLOYMENT_CHECKLIST.md`).
2. Push to the branch GitHub Pages serves (e.g. `main`), or enable Pages on that
   branch/folder.
3. Hard-refresh once after deploy so the service worker updates.

## Features & controls

- **Performance:** shared geometry/materials, `InstancedMesh` for repeated parts,
  cached per-frame allocations, an on-screen `QUALITY: AUTO` control, and a `CALM`
  mode. The contact world-map only animates while on-screen.
- **Reduced motion:** honored via `prefers-reduced-motion` (calm defaults, no
  packet pulsing, no tab transitions).
- **WebGL fallback:** if WebGL is unavailable the 3D scene is hidden and the DOM
  content renders over a static data-center backdrop — all content stays readable.
- **Accessibility:** skip link, semantic landmarks, single H1 + ordered headings,
  labelled form fields, `role=tab`/`aria-selected` tab interfaces, `aria-current`
  nav scroll-spy, `aria-live` status regions, and the decorative canvas hidden
  from assistive tech.

## Repository layout

```
index.html                 canonical immersive site (generated)
manifest.json              PWA manifest
service-worker.js          offline service worker
README.md · CLEANUP_PLAN.md · DEPLOYMENT_CHECKLIST.md
assets/
  facility/                runtime JS modules
  vendor/                  Three.js, fonts, portrait, data-center backdrop (bundle-decoded)
  data/                    Natural Earth land geojson (map source)
  icons/                   PWA icons
  Mustafa_Jawish_IT_Networking_CV.pdf   canonical résumé
tools/
  build_facility.py        generates index.html
  gen_world_geo.py         generates world-geo.js
  gen_icons.py             generates PWA icons
  shoot.sh                 headless-Chrome screenshot harness
docs/
  architecture/            architecture notes
  qa/final/                final QA screenshot evidence
legacy/
  classic-portfolio/       the previous conventional portfolio (archived)
  claude-design/           the Claude Design v4 source + readable extract
```

## Content integrity

All content is real: the projects link to actual GitHub repositories, the
subnet calculator is mathematically correct (including /31 point-to-point and /32
host routes), the résumé downloads the real CV, and no experience or credential is
fabricated. The WAN world map is a simulation and is labelled as such.
