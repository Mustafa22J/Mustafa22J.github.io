# Final QA evidence

Screenshots captured from the **canonical root `index.html`** (the immersive
site) via the headless-Chrome harness `tools/shoot.sh`. These are the retained,
final captures; superseded development captures are not kept here.

## Desktop (1920×1080)

| File | View |
|---|---|
| `01-hero.png` | Hero / core cabinet panel |
| `02-about.png` | About — identity node |
| `03-osi-bay.png` | OSI bay (3D, camera-pinned) |
| `04-skills.png` | Skills — 9 category tabs |
| `05-education.png` | Education — level selector |
| `06-projects.png` | Projects — filters + pagination |
| `07-noc.png` | NOC / troubleshooting incident |
| `08-experience.png` | Experience timeline |
| `09-certifications.png` | Certifications |
| `10-lab.png` | Networking lab — subnet calculator |
| `11-resume.png` | Résumé vault |
| `12-contact-standby.png` | Contact two-zone — WAN standby |
| `13-wan-success.png` | WAN transfer — success (mock) |
| `14-wan-failure.png` | WAN transfer — failure (mock) |
| `15-cabling-core.png` | Structured cabling close-up (core) |
| `16-full-aisle.png` | Full aisle down the facility |

## Accessibility / resilience

| File | View |
|---|---|
| `17-webgl-fallback.png` | WebGL disabled — DOM content over static backdrop |
| `18-reduced-motion.png` | `prefers-reduced-motion` emulated |

## Responsive

| File | View |
|---|---|
| `20-mobile-hero.png` | Mobile hero (390×844) |
| `21-mobile-projects.png` | Mobile projects (390×844) |
| `22-mobile-lab.png` | Mobile lab / subnet (390×844) |
| `23-mobile-contact.png` | Mobile contact zones (390×844) |
| `24-tablet-skills.png` | Tablet skills (768×1024) |

> The Contact world map is a DOM `<canvas>`; headless SwiftShader does not
> composite 2D canvas pixels into a screenshot, so the map area can look dark in
> `12`–`14` even though it renders in a real browser (verified via `getImageData`:
> land, coastline, and route-arc pixels present). The WAN **state badge** and
> controls capture correctly and show the state transitions.
