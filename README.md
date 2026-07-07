# Mustafa Jawish â€” Immersive Data-Center Portfolio

[View the live portfolio](https://mustafa22j.github.io/)

An immersive, single-page portfolio presented as a 3D data-center facility. Visitors move through the building while following a packet journey from the core router to the WAN edge. Each chapter is represented by physical networking equipment and a rack-mounted smart-glass interface.

The experience includes About, the OSI model, technical skills, education, projects, troubleshooting scenarios, professional experience, certifications, an interactive networking lab, rÃ©sumÃ© access, and contact tools.

A complete semantic DOM layer mirrors the interactive experience, keeping the content accessible, keyboard-navigable, and available when WebGL is disabled.

## Professional focus

Mustafa Jawish is a Canadian citizen based in Ottawa, Ontario, working as an IT Support Coordinator while completing the Computer Systems Technician â€” Networking program at Algonquin College.

The portfolio highlights practical experience with:

- Enterprise networking and routing
- Windows Server and identity administration
- Linux systems and services
- IT support and structured troubleshooting
- Network security and packet analysis
- PowerShell, Bash, and Python automation
- Virtualization and infrastructure operations

## Technical highlights

- Immersive Three.js data-center environment
- Twelve-stage packet journey through the facility
- Consolidated seven-layer OSI workstation
- Structured fibre system with SFP+ and LC components
- Rack-mounted chapter interfaces
- Interactive project explorer
- Troubleshooting and NOC scenarios
- Networking calculators and protocol references
- Offline world map and simulated WAN transfer
- Progressive Web App support
- Reduced-motion and WebGL fallback modes
- Semantic and keyboard-accessible content layer

## Technology

- **Three.js r0.160**, vendored locally under `assets/vendor/`
- **Vanilla JavaScript modules** under `assets/facility/`
- **HTML and CSS** for the accessible content layer
- **Python standard-library build tooling**
- **Progressive Web App** using `manifest.json` and `service-worker.js`
- **Natural Earth geography data** for the offline WAN map
- **Formspree** for the real contact-form submission

No runtime backend or npm installation is required. The deployed site is static HTML, CSS, and JavaScript. A Python utility reproducibly regenerates the canonical `index.html`.

## Architecture

The deployed site is generated from an archived design-source bundle:

```text
legacy/design-source/design-source-v4.html
                    |
                    |  tools/build_facility.py
                    v
index.html
```

The build process:

1. Extracts the locally bundled Three.js library, fonts, portrait, and data-center imagery.
2. Generates the canonical static page.
3. Injects the facility modules and accessibility layer.
4. Applies the rack, OSI, cabling, camera, panel, contact, and WAN systems.
5. Adds manifest metadata, icons, fallback content, and service-worker registration.
6. Validates and atomically replaces `index.html`.

## Main runtime modules

| Module | Responsibility |
|---|---|
| `facility-route.js` | Twelve-node chapter route and world positions |
| `facility-common.js` | Shared screens, labels, LEDs, and equipment helpers |
| `core-cabinet.js` | Hero core-router station |
| `administrator-station.js` | About and identity station |
| `osi-stations.js` | Consolidated physical OSI workstation |
| `osi-state.js` | Seven-layer OSI interaction model |
| `structured-cabling.js` | Managed fibre routes, trays, connectors, and transceivers |
| `portfolio-stations.js` | Skills, education, projects, NOC, experience, certifications, lab, and rÃ©sumÃ© stations |
| `rack-interface-system.js` | Rack-mounted smart-glass deployment |
| `panel-tabs.js` | Compact tab and selector interfaces |
| `world-geo.js` | Offline world-map geometry |
| `wan-gateway.js` | WAN room and transfer-state visualization |
| `contact-wan-zones.js` | Contact terminal and map separation |
| `camera-director.js` | Scroll-driven camera choreography |
| `facility-init.js` | Runtime orchestration and navigation state |

## Build and preview

Requirements:

- Python 3
- A modern browser
- No Node.js or package installation required

Regenerate the site:

```powershell
python tools/build_facility.py
```

Preview locally:

```powershell
python -m http.server 8123
```

Then open:

```text
http://localhost:8123/
```

Optional asset-generation utilities:

```powershell
python tools/gen_world_geo.py
python tools/gen_icons.py
```

## Accessibility and resilience

The portfolio includes:

- Skip navigation
- Semantic landmarks
- Ordered heading structure
- Keyboard-accessible tabs and controls
- Visible focus indicators
- Form labels and accessible status messages
- `aria-current`, `aria-selected`, and `aria-live` states
- Reduced-motion support
- Static fallback content when WebGL is unavailable
- Offline support through the service worker

## Performance

Performance controls include:

- Shared geometries and materials
- Instanced repeated equipment
- Cached per-frame allocations
- Adaptive rendering quality
- A calm mode
- Visibility-aware animation
- Reduced detail on constrained devices

## Contact and WAN behavior

The contact form submits through Formspree. A successful form response activates a simulated WAN packet journey on the world map.

The map is clearly presented as a visualization. The contact submission is real; the WAN transfer animation is simulated.

## Repository structure

```text
index.html
manifest.json
service-worker.js
README.md
CLEANUP_PLAN.md
DEPLOYMENT_CHECKLIST.md

assets/
  facility/
  vendor/
  data/
  icons/
  Mustafa_Jawish_IT_Networking_CV.pdf

tools/
  build_facility.py
  gen_world_geo.py
  gen_icons.py
  shoot.sh

docs/
  architecture/
  qa/

legacy/
  classic-portfolio/
  design-source/
```

The repository also retains the NexaReel legal pages and hosted media paths used by the separate video-automation workflow.

## Content integrity

The portfolio uses real professional, academic, and project information. Project buttons link to existing GitHub repositories. The rÃ©sumÃ© downloads the current CV. Networking calculators include explicit handling for `/31` point-to-point and `/32` host routes.

No employment history, project, certification, or technical result is intentionally fabricated.

## Development note

Development included AI-assisted prototyping. Final content selection, architecture, testing, validation, repository management, and deployment were directed and approved by Mustafa Jawish.
