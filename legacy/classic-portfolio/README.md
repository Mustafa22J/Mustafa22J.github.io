# Archived classic portfolio

This is the **original conventional portfolio** for Mustafa Jawish, preserved
before the repository's root was migrated to the immersive data-center portfolio.

It is kept for historical reference only. It is **not** the deployed site.

## Original locations (repo root)

These files lived at the repository root before the migration:

| Archived here | Original path |
|---|---|
| `index.html` | `/index.html` |
| `styles.css` | `/styles.css` |
| `script.js` | `/script.js` |
| `manifest.json` | `/manifest.json` (classic PWA config) |
| `service-worker.js` | `/service-worker.js` (classic cache: `/index.html`, `/styles.css`, `/script.js`, …) |
| `Mustafa.png` | `/Mustafa.png` (portrait) |
| `Datacenter.png` | `/Datacenter.png` (hero background) |
| `Mustafa_Jawish_IT_Networking_CV.pdf` | `/Mustafa_Jawish_IT_Networking_CV.pdf` (résumé) |

The classic pages use **relative** asset paths, so opening
`legacy/classic-portfolio/index.html` directly still resolves its styles, script,
images and résumé from this folder.

## Notes

- The classic site loaded several assets from CDNs (Font Awesome, Google Fonts,
  Three.js r128, GSAP, Chart.js). Those remain external in this archive.
- The classic `manifest.json` references `icons/icon-192x192.png` /
  `icon-512x512.png`, which never existed at the classic root.
- The current résumé is maintained canonically at `assets/Mustafa_Jawish_IT_Networking_CV.pdf`
  in the live immersive site; the copy here is the classic-era snapshot.

The live site is the immersive data-center portfolio at the repository root
(`index.html`). See the root `README.md`.
