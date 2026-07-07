import json, os, re, base64, shutil, gzip

# repo root derived from this script's location (tools/build_facility.py) so the build is
# portable — it works from any checkout, not just one hardcoded machine path.
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "legacy", "design-source", "design-source-v4.html")
VENDOR = os.path.join(ROOT, "assets", "vendor")
FONTS = os.path.join(VENDOR, "fonts")
# clean any prior mislabeled output
if os.path.isdir(os.path.join(VENDOR, "addons")):
    shutil.rmtree(os.path.join(VENDOR, "addons"), ignore_errors=True)
for d in (VENDOR, FONTS):
    os.makedirs(d, exist_ok=True)
for fn in os.listdir(FONTS):  # clear stale font files from prior runs
    try: os.remove(os.path.join(FONTS, fn))
    except Exception: pass

# the v4 doc links the résumé at assets/<cv>; the canonical PDF now lives at assets/<cv>.
# (a copy at repo root, if present, is refreshed in — supports dropping a new CV at the root)
_CV = "Mustafa_Jawish_IT_Networking_CV.pdf"
if os.path.exists(os.path.join(ROOT, _CV)):
    try: shutil.copy2(os.path.join(ROOT, _CV), os.path.join(ROOT, "assets", _CV))
    except Exception as e: print("WARN: could not copy résumé:", e)
assert os.path.exists(os.path.join(ROOT, "assets", _CV)), "canonical résumé missing at assets/" + _CV

with open(BUNDLE, "r", encoding="utf-8") as f:
    lines = f.read().split("\n")

def payload_after(kind):
    tag = '<script type="__bundler/%s">' % kind
    for i, l in enumerate(lines):
        if l.strip() == tag:
            return lines[i+1]
    return None

manifest = json.loads(payload_after("manifest"))
ext      = json.loads(payload_after("ext_resources"))
doc      = json.loads(payload_after("template"))
three_uuid = next(e["uuid"] for e in ext if e["id"] == "three")

def sniff_font(raw):
    if raw[:4] == b'wOF2': return 'woff2'
    if raw[:4] == b'wOFF': return 'woff'
    if raw[:4] in (b'\x00\x01\x00\x00', b'true', b'ttcf'): return 'ttf'
    if raw[:4] == b'OTTO': return 'otf'
    return 'bin'
def img_ext(raw):
    if raw[:3] == b'\xff\xd8\xff': return 'jpg'
    if raw[:8] == b'\x89PNG\r\n\x1a\n': return 'png'
    return 'bin'

uuid_to_path = {}
wrote = []
ngz = 0
for uuid, meta in manifest.items():
    raw = base64.b64decode(meta["data"]); mime = meta["mime"]
    if meta.get("compressed") or raw[:2] == b'\x1f\x8b':
        try: raw = gzip.decompress(raw); ngz += 1
        except Exception: pass
    if uuid == three_uuid:
        rel, disk = "assets/vendor/three.module.js", os.path.join(VENDOR, "three.module.js")
    elif mime == "font/woff2" or mime == "application/octet-stream":
        fe = 'woff2' if mime == 'font/woff2' else sniff_font(raw)
        rel, disk = f"assets/vendor/fonts/{uuid}.{fe}", os.path.join(FONTS, f"{uuid}.{fe}")
    elif mime.startswith("image/"):
        e = img_ext(raw); name = "datacenter" if len(raw) > 1_000_000 else "portrait"
        rel, disk = f"assets/vendor/{name}.{e}", os.path.join(VENDOR, f"{name}.{e}")
    else:
        rel, disk = f"assets/vendor/misc/{uuid}", os.path.join(VENDOR, "misc", uuid)
        os.makedirs(os.path.dirname(disk), exist_ok=True)
    with open(disk, "wb") as fo: fo.write(raw)
    uuid_to_path[uuid] = rel
    wrote.append((mime, len(raw), rel))

print(f"DECODED ASSETS ({ngz} gunzipped):")
for mime, n, rel in wrote:
    print(f"  {mime:22} {n:>9,}  -> {rel}")

# ---- rewrite doc -> facility ----
out = doc
repl = {"fonts": 0, "images": 0, "hologram": 0, "resources": 0, "extlinks": 0}
for uuid, meta in manifest.items():
    if uuid == three_uuid: continue
    rel = uuid_to_path[uuid]
    if meta["mime"].startswith("image/"):
        repl["images"] += out.count(uuid); out = out.replace(uuid, rel)
    else:
        b = out; out = out.replace(f'url("{uuid}")', f'url("{rel}")')
        if out != b: repl["fonts"] += 1

# vendor three locally + inject Milestone B facility module scripts (local, offline)
inject = ('<script>window.__resources=Object.assign(window.__resources||{},'
          '{three:"assets/vendor/three.module.js"});</script>\n')
FAC = ['facility-route.js', 'facility-common.js', 'fiber-routing.js', 'core-cabinet.js',
       'administrator-station.js', 'rack-interface-system.js',
       'osi-stations.js', 'portfolio-stations.js', 'structured-cabling.js', 'world-geo.js',
       'wan-gateway.js', 'contact-wan-zones.js', 'osi-state.js', 'panel-tabs.js',
       'camera-director.js', 'facility-init.js']
def _fh(fn):
    import hashlib
    p = os.path.join(ROOT, 'assets', 'facility', fn)
    try:
        return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
    except Exception:
        return '0'
fac_tags = ''.join('<script src="assets/facility/%s?h=%s"></script>\n' % (f, _fh(f)) for f in FAC)
b = out; out = out.replace('<script type="module">', inject + fac_tags + '<script type="module">', 1)
repl["resources"] = 0 if out == b else 1

# strip dead external Google Fonts links/preconnects (fonts are vendored)
out, repl["extlinks"] = re.subn(r'<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>', '', out)

# remove floating CORE NETWORK hologram AND expose scene internals for physical stations
holo_re = re.compile(r"\s*/\* ---- hero focal point:.*?scene\.add\(coreLabel\);", re.S)
EXPOSE = r'''
  /* [MJ Milestone B] hologram removed; expose scene internals for physical stations */
  window.__facility = { THREE:THREE, scene:scene, camera:camera, CFG:CFG, chapterZ:chapterZ,
    SEG:SEG, zFirst:zFirst, camAhead:camAhead, CH:CH, routeCurves:routeCurves,
    connectors:connectors, accents:accents, packet:packet, packetCore:packetCore,
    textSprite:textSprite, glowTex:glowTex, buildFace:buildFace, LED:LED,
    updaters:[], cameraDirector:null, state:{} };
  try { if (window.FacilityStations && window.FacilityStations.initAll) window.FacilityStations.initAll(window.__facility); }
  catch (e) { console.warn('facility stations init failed', e); }'''
out, repl["hologram"] = holo_re.subn(lambda m: EXPOSE, out)

# Milestone B scene patches: camera-director + per-frame updater hooks (updateScene + __renderAt)
scene_patches = [
 # C0: route-map positioning (replaces scattered chapterZ = -6 - i*15 and linear camera-z)
 ("const chapterZ=i=>zFirst - i*SEG;",
  "const chapterZ=i=>(window.FACILITY_ROUTE&&window.FACILITY_ROUTE.z[i]!=null)?window.FACILITY_ROUTE.z[i]:(zFirst - i*SEG);"),
 ("const cz = zFirst - smoothCF*SEG + camAhead;",
  "const cz = (window.FACILITY_ROUTE?window.FACILITY_ROUTE.zAt(smoothCF):(zFirst - smoothCF*SEG)) + camAhead;"),
 ("const cz=zFirst-cf*SEG+camAhead;",
  "const cz=(window.FACILITY_ROUTE?window.FACILITY_ROUTE.zAt(cf):(zFirst-cf*SEG))+camAhead;"),
 ("let zHead=12, zTail=zFirst - (CH-1)*SEG - 16;",
  "let zHead=12, zTail=(window.FACILITY_ROUTE?window.FACILITY_ROUTE.z[CH-1]:(zFirst - (CH-1)*SEG)) - 16;"),
 ("zTail=zFirst-(CH-1)*SEG-16;",
  "zTail=(window.FACILITY_ROUTE?window.FACILITY_ROUTE.z[CH-1]:(zFirst-(CH-1)*SEG))-16;"),
 ("_look.set(side*0.22*nearAmt*CFG.motion + mx*0.12*par, CFG.camH-0.06, cz-6); camera.lookAt(_look);",
  "_look.set(side*0.22*nearAmt*CFG.motion + mx*0.12*par, CFG.camH-0.06, cz-6);\n"
  "    if(window.__facility){var _F=window.__facility;_F.state={now:now,cf:cf,smoothCF:smoothCF,ci:ci,side:side,nearAmt:nearAmt,cz:cz,calm:calm};"
  "if(_F.cameraDirector)_F.cameraDirector(_F.state,camera,_look);}\n    camera.lookAt(_look);"),
 ("coreGlow.intensity=4+(calm?0:Math.sin(now*0.004)*1.5);",
  "coreGlow.intensity=4+(calm?0:Math.sin(now*0.004)*1.5);\n"
  "    if(window.__facility){var _U=window.__facility.updaters;for(var _i=0;_i<_U.length;_i++){try{_U[_i](window.__facility.state,now);}catch(e){}}}"),
 ("_look.set(side*0.22*nearAmt*CFG.motion,CFG.camH-0.06,cz-6); camera.lookAt(_look);",
  "_look.set(side*0.22*nearAmt*CFG.motion,CFG.camH-0.06,cz-6);\n"
  "    if(window.__facility){var _F=window.__facility;_F.state={now:now,cf:cf,smoothCF:cf,ci:ci,side:side,nearAmt:nearAmt,cz:cz,calm:false,deterministic:true};"
  "if(_F.cameraDirector)_F.cameraDirector(_F.state,camera,_look);for(var _i=0;_i<_F.updaters.length;_i++){try{_F.updaters[_i](_F.state,now);}catch(e){}}}\n    camera.lookAt(_look);"),
]
repl["scenepatch"] = 0
for _a, _b in scene_patches:
    if _a in out: out = out.replace(_a, _b, 1); repl["scenepatch"] += 1
    else: print("WARN: scene-patch anchor NOT FOUND:", _a[:64])

# PART 1: professional fibre — thin dark jacket, dim inner glow, remove floating aisle labels.
fibre_reps = [
    ('TubeGeometry(curve,steps*2,0.028,6,false), new THREE.MeshStandardMaterial({color:0x0a2230',
     'TubeGeometry(curve,steps*2,0.015,6,false), new THREE.MeshStandardMaterial({color:0x0a2230', 1),  # thin dark jacket
    ('TubeGeometry(curve,steps*2,0.021,6,false), new THREE.MeshBasicMaterial({color:0x35e0f1',
     'TubeGeometry(curve,steps*2,0.008,6,false), new THREE.MeshBasicMaterial({color:0x35e0f1', 1),      # thin cyan
    ('TubeGeometry(curve,steps*2,0.008,6,false), new THREE.MeshBasicMaterial({color:0xbdf4ff',
     'TubeGeometry(curve,steps*2,0.0035,6,false), new THREE.MeshBasicMaterial({color:0xbdf4ff', 1),     # thin core
    ('CatmullRomCurve3(rp),24,0.02,6', 'CatmullRomCurve3(rp),24,0.01,6', 1),           # thinner riser
    ('opacity:0.55*CFG.fibreBright', 'opacity:0.13*CFG.fibreBright', 0),               # dim cyan + riser (all)
    ('opacity:0.7*CFG.fibreBright', 'opacity:0.24*CFG.fibreBright', 1),                # dim bright core
    ("const lbl=textSprite(PORTLABELS[i%PORTLABELS.length], '#bfe4ff'); lbl.position.set(portX, portY+0.42, z); scene.add(lbl);",
     'var lbl=null;', 1),                                                              # remove floating aisle labels
    ('fibreGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rp),24,0.01,6,false), new THREE.MeshBasicMaterial({color:0x35e0f1,transparent:true,opacity:0.13*CFG.fibreBright})));',
     '/* legacy hanging riser removed; structured-cabling.js provides managed patch leads */', 1),
]
repl["fibre"] = 0
for _a, _b, _n in fibre_reps:
    c = out.count(_a)
    out = out.replace(_a, _b) if _n == 0 else out.replace(_a, _b, _n)
    if c: repl["fibre"] += 1
    else: print("WARN: fibre anchor NOT FOUND:", _a[:50])

out = out.replace("<title>Mustafa Jawish — Networking Portfolio · Data Center</title>",
                  "<title>Mustafa Jawish — Data Center Facility (immersive build)</title>", 1)

# Milestone B layout: dock each content panel OPPOSITE its physical station so the aisle
# stays clear and both are visible; the portrait now lives on the admin-station monitor.
mjcss = ('<style id="mj-milestone-b">'
         '#hero{justify-content:flex-end!important}'
         '#about{justify-content:flex-start!important}'
         '#osi{justify-content:flex-end!important}'
         # dock EVERY panel opposite its physical station so it opens toward the aisle and never
         # covers the active rack (right-side rack -> panel left; left-side rack -> panel right).
         '#skills,#projects,#experience,#lab,#contact{justify-content:flex-start!important}'
         '#education,#troubleshooting,#certifications,#resume{justify-content:flex-end!important}'
         '#about .photo{display:none!important}'
         '#osi-list[hidden]{display:none!important}'
         # information no longer rises from the bottom: panels fade in place, docked to the side,
         # while the 3D rack-origin glass provides the "emerges from equipment" motion.
         '.reveal{transform:none!important}'
         # unified panel dimensions: wider + shorter, fit the viewport, never overflow (internal
         # scroll only as a fallback). Desktop / laptop / tablet / mobile breakpoints.
         '.chapter .panel{width:clamp(520px,40vw,760px)!important;max-width:760px!important;'
         'max-height:calc(100vh - 132px)!important;overflow:hidden auto!important;'
         'scrollbar-width:thin}'
         '@media(max-width:1180px){.chapter .panel{width:clamp(460px,44vw,660px)!important;'
         'max-height:calc(100vh - 116px)!important}}'
         '@media(max-width:900px){.chapter .panel{width:min(86vw,680px)!important;max-height:78vh!important}}'
         '@media(max-width:640px){.chapter .panel{width:calc(100vw - 24px)!important;'
         'max-height:calc(100dvh - 120px)!important}'
         # narrow-width content safeguards: wrap long strings, collapse 2-col grids, let wide gear scroll
         '.chapter .p-bd{overflow-wrap:anywhere}'
         # the rack-unit header row (RU label · station · status) must wrap, not overflow, on mobile
         '.chapter .p-hd{flex-wrap:wrap!important;white-space:normal!important;overflow-wrap:anywhere;row-gap:4px}'
         '.chapter .grid2,.chapter .grid-auto{grid-template-columns:1fr!important}'
         '.chapter .p-bd pre,.chapter .p-bd table{max-width:100%!important;overflow-x:auto;display:block}'
         '#contact .mj-zones{gap:20px!important}}'
         # skip link: visually hidden until keyboard-focused, then pinned top-left over everything
         '.mj-skip{position:fixed;top:8px;left:8px;z-index:100000;transform:translateY(-140%);'
         'background:#8be9ff;color:#04121f;font:600 13px ui-monospace,monospace;padding:10px 16px;'
         'border-radius:8px;text-decoration:none;transition:transform .18s}'
         '.mj-skip:focus{transform:none;outline:2px solid #04121f;outline-offset:2px}'
         # active-nav indicator (not colour-only: colour + underline)
         'nav.links a[aria-current="location"]{color:#8be9ff!important;text-decoration:underline;text-underline-offset:5px}'
         'nav#map a[aria-current="location"]{opacity:1!important}'
         '</style>')
b = out; out = out.replace('</head>', mjcss + '</head>', 1)
repl["mjcss"] = 0 if out == b else 1

# OSI consolidated into ONE chapter/bay: single integrated console mount, no sub-chapters
b = out; out = out.replace(
    '<button class="btn gho" id="osi-send" style="margin-bottom:18px"><i class="fas fa-paper-plane"></i> Send a packet up the stack</button>',
    '<div class="osi-console" data-osi-layer="1"></div>', 1)
repl["osiMount"] = 0 if out == b else 1
b = out; out = out.replace('<div id="osi-list">', '<div id="osi-list" hidden data-legacy-osi>', 1)
repl["osiHide"] = 0 if out == b else 1

# About: state Canadian citizenship + Ottawa naturally inside the lead sentence (not a badge)
b = out; out = out.replace(
    'I\'m a <span style="color:var(--cyan);font-weight:600">Computer Systems Technician — Networking</span> student at Algonquin College, now applying that training as an',
    'I\'m a Canadian citizen based in Ottawa, Ontario, and a <span style="color:var(--cyan);font-weight:600">Computer Systems Technician — Networking</span> student at Algonquin College, currently applying that training as an', 1)
repl["aboutCitizen"] = 0 if out == b else 1

# remove the unreachable unpkg CDN fallbacks for three.js (the local vendored copy is always
# configured). A dead else-branch is turned into a throw; the catch now fails to the graceful
# no-webgl fallback instead of silently pulling three from a CDN and masking a broken local file.
b = out; out = out.replace(
    "else { THREE = await import('https://unpkg.com/three@0.160.0/build/three.module.js'); }",
    "else { throw new Error('three.js source not configured'); }", 1)
repl["cdnElse"] = 0 if out == b else 1
b = out; out = out.replace(
    "}catch(e){ try{ THREE = await import('https://unpkg.com/three@0.160.0/build/three.module.js'); }catch(e2){ console.warn('three.js failed to load', e2); } }",
    "}catch(e){ console.warn('three.js failed to load locally', e); document.body.classList.add('no-webgl'); }", 1)
repl["cdnCatch"] = 0 if out == b else 1

# a11y: skip link as first focusable element + a focus target on <main>
b = out; out = out.replace('<body>', '<body>\n<a class="mj-skip" href="#main-content">Skip to content</a>', 1)
repl["skipLink"] = 0 if out == b else 1
b = out; out = out.replace('<main>', '<main id="main-content" tabindex="-1">', 1)
repl["mainId"] = 0 if out == b else 1

# canonical title (drop the internal "immersive build" label)
b = out; out = out.replace('<title>Mustafa Jawish — Data Center Facility (immersive build)</title>',
                           '<title>Mustafa Jawish — Networking &amp; Systems Portfolio</title>', 1)
repl["title"] = 0 if out == b else 1

# PWA + icons + theme-color + OG image + no-JS fallback (relative paths → work from any base path)
head_extra = (
    '<link rel="manifest" href="manifest.json">'
    '<meta name="theme-color" content="#0a1622">'
    '<link rel="icon" type="image/png" href="assets/icons/favicon-32.png">'
    '<link rel="apple-touch-icon" href="assets/icons/icon-192.png">'
    '<meta name="apple-mobile-web-app-capable" content="yes">'
    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
    '<meta property="og:image" content="assets/icons/icon-512.png">'
    '<noscript><style>#loader{display:none!important}.reveal{opacity:1!important;transform:none!important}'
    '.chapter{opacity:1!important}</style></noscript>'
)
b = out; out = out.replace('</head>', head_extra + '</head>', 1)
repl["pwaHead"] = 0 if out == b else 1

# register the service worker (guarded; failure is non-fatal)
sw_reg = ('<script>if("serviceWorker" in navigator){window.addEventListener("load",function(){'
          'navigator.serviceWorker.register("service-worker.js").catch(function(){});});}</script>')
b = out; out = out.replace('</body>', sw_reg + '</body>', 1)
repl["swReg"] = 0 if out == b else 1

# atomic write to the canonical root index.html: temp file -> validate -> os.replace
assert len(out) > 150000 and '<title' in out and 'FacilityStations' in out and '</html>' in out.lower(), "output failed validation"
_out_path = os.path.join(ROOT, "index.html")
_tmp = _out_path + ".tmp"
with open(_tmp, "w", encoding="utf-8") as f:
    f.write(out)
os.replace(_tmp, _out_path)
print("\nREPLACEMENTS:", repl)

externals = sorted(set(re.findall(r'https?://[^\s"\'()]+', out)))
print("\nREMAINING EXTERNAL URLs (should be only formspree/github/linkedin + unused three CDN fallback):")
for u in externals: print("  ", u)
print("\nindex.html bytes:", os.path.getsize(os.path.join(ROOT, "index.html")))
