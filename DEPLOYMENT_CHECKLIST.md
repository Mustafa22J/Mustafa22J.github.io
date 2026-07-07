# DEPLOYMENT_CHECKLIST.md

Steps to move this immersive portfolio into your real portfolio repository and
publish it on GitHub Pages (or any static host). Nothing here has been pushed or
deployed — you do that yourself.

## What ships

The site is **static**. The files that make up the live site are:

- `index.html`, `manifest.json`, `service-worker.js`
- `assets/` (facility modules, vendor libs/fonts/images, data, icons, résumé)
- (optional but recommended) `README.md`, `docs/`, `tools/`, `legacy/`,
  `CLEANUP_PLAN.md`, this checklist

`shots/` is scratch and git-ignored — do not copy it.

## 1. Copy into your real repo

- [ ] Copy the repository contents into your portfolio repo. Easiest is to copy
      everything **except** `.git/`, `shots/`, and `.claude/`.
- [ ] If your Pages site must live at the domain root, this repo already uses
      relative paths and works as-is.
- [ ] If it will live at a **project subpath** (`https://<user>.github.io/<repo>/`),
      no change is needed — `manifest.json` uses `start_url: "."`/`scope: "."` and
      every asset path is relative.

## 2. Verify locally before pushing

- [ ] `python tools/build_facility.py` → prints `index.html bytes: …`, no traceback.
- [ ] Run it **twice**; `git status` shows no diff on the second run (deterministic).
- [ ] `python -m http.server 8123` and open `http://localhost:8123/`.
- [ ] Root `index.html` loads the immersive site; no console errors.
- [ ] Service worker registers (DevTools → Application → Service Workers).
- [ ] `manifest.json` valid; icons load (Application → Manifest).
- [ ] Résumé downloads: `assets/Mustafa_Jawish_IT_Networking_CV.pdf` → HTTP 200.
- [ ] Project links open the correct GitHub repositories.
- [ ] Contact form: `Message` tab → fields validate. (Only submit a real test if
      you want a real Formspree email — `mvgwayna`.)
- [ ] Mobile view (DevTools device toolbar): no horizontal page scroll.
- [ ] Reduced motion (DevTools → Rendering → emulate `prefers-reduced-motion`).
- [ ] WebGL disabled (DevTools → Rendering → disable WebGL): content still readable.

## 3. Secrets / privacy

- [ ] No secrets or tokens are committed. The Formspree form ID (`mvgwayna`) is a
      **public** endpoint by design — it is safe to publish.
- [ ] `.claude/` (local tool settings) is not part of the site — omit it.

## 4. Publish

- [ ] Commit on your repo's default branch.
- [ ] `git push` to `main` (or your Pages branch).
- [ ] Enable GitHub Pages: Settings → Pages → source = your branch, folder = `/`
      (root). Wait for the build to go green.
- [ ] Open the Pages URL; **hard-refresh** (Ctrl/Cmd+Shift+R) once so the service
      worker updates from any previous cache.
- [ ] Re-check on a phone: layout, nav, résumé, contact.

## 5. Updating later

- Edit content in the design source or the `assets/facility/` modules, then
  `python tools/build_facility.py` to regenerate `index.html`, and re-push.
- To swap the résumé, drop the new PDF at the repo root as
  `Mustafa_Jawish_IT_Networking_CV.pdf` and rebuild (it is copied into `assets/`),
  or replace `assets/Mustafa_Jawish_IT_Networking_CV.pdf` directly.
- When you change any cached asset, the service worker's runtime cache updates on
  next load; a hard refresh guarantees it immediately.

## Rollback

The previous conventional portfolio is preserved at
`legacy/classic-portfolio/`. To restore it as the root site, copy its files back
to the repository root (it uses relative paths).
