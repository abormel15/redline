# Redline Desk — iPad edition (home-screen web app)

Nov 12 2026. Built from the published Claude artifact V85 (`/home/claude/src85/index.html` + `lib/`, fetched byte-for-byte
from https://claude.ai/artifact/Edp2SEQdszRCHuMbehRPWx, version 1792670639-18d3). The Claude version is untouched and still
serves Ishita and Mihai.

## What the build does (`build.py`)
- Replaces the artifact skeleton head with a real head: viewport-fit=cover, manifest, apple-touch-icon, apple-mobile-web-app-capable,
  theme-color (light/dark). Same reset rules kept.
- Sets `window.RD_STANDALONE = true` before the app script. This switches on the STANDALONE edition that already existed in the
  code: Ask Claude dock hidden, Claude menu items filtered out of every menu and the feature finder, share-sheet delivery
  (`deliver()` → navigator.share with the file, or Download), ICS reminder export, standalone help text, `sw.js` registration.
  cloud sync (CL) and collaboration (CO) go to status 'none' on their own when `window.claude` is absent.
- Relabels `BUILD` to `85 · Nov 12 2026 · iPad edition` (Settings → "Redline Desk version").
- Appends `theme.css` (colors, type, radii, shadows only; layout geometry unchanged) and `boot.js` (navigator.storage.persist).
- Copies `lib/` unchanged, writes `manifest.webmanifest`, icons, and `sw.js` with a content-hash version.
- No app logic is edited. Rebuild: `python3 /home/claude/rd-build/build.py` → `/home/claude/rd/`.

## Service worker (`sw.js`)
- Precaches index.html, the three pdf.js / pdf-lib files, the four standard fonts, manifest and icons.
- Page: network first, cached copy when offline. Everything else: cache first; Google fonts and other cross-origin fetches are
  stored in `rd-runtime` once seen online. Old `rd-shell-*` caches are dropped on activate; skipWaiting + clients.claim.

## Theme (`theme.css`)
- System font stack; iOS palette (#007AFF / #0A84FF accent, #F2F2F7 / #000 backgrounds, #FF3B30 danger, #34C759 ok).
- Frosted (backdrop-filter) menus, popovers, quick bar, toast, nav arrows; 18px modals; 10–11px button radii; filled inputs;
  segmented side-panel tabs; Files cards 14px.
- The system font is wider than Barlow Semi Condensed: `#rail .rlab` shrunk to 8px so the rail stays 58px wide (measured 58.8 vs
  58.4 in V85); Files/Save labels hide at ≤1300px instead of 1080; props bar 14px at ≤900px. Top bar overflow measured 0 at
  1376/1300/1180/1133/1032/820 (V85 itself has 17px at 1133).

## Tests (`/home/claude/markup`)
- Harness `tw.js` (PORT, VP, PAGE env). Fixture `fx/docA.pdf` regenerated (3 landscape pages with text). `fx/real/bic-interiors.pdf`
  is a stand-in (the Interior finish plans set) — never publish.
- Baseline: the same t111a–f files run against untouched V85 (`base85.log`) then against the build (`rd.log`); only differences
  count. t111c (full bar/panel/menu tour) is the current version and passes on both. The attached t111a/b/d/e/f copies are older
  than V85 and fail/crash identically on both builds (stale selectors) — not app defects.
- `t120.js`: standalone switch, no Claude UI, manifest + icons + Apple meta, light/dark palette, Settings label, More menu renders
  without Claude items, service worker active with shell cached, draw → save → reload persists, offline reload brings back app +
  libraries + document and drawing works, offline stroke survives the next online load, PDF export builds, Save PDF and
  Save to… or share deliver a file.
- Screenshots: `shots.js` (OUT, DARK env) — `shots85/`, `shotsrd/`, `shotsrd-dark/`.

## Nov 12 2026, later the same day — field reports from the iPad
- Status bar covered the top row: iPadOS reports env(safe-area-inset-top) = 0 to installed web apps → boot.js sets --sat 24px /
  --sab 20px when installed and the insets read 0 (t120 checks it).
- Whole interface zoomed to ~145% and toolbars slid away; pinch sometimes read as one finger: Safari page zoom (never possible
  inside the Claude host). Viewport maximum-scale=1,user-scalable=no (honoured by home-screen apps), touch-action: pan-x pan-y
  on html/body/bars/rail/panels (sheet keeps none), gesturestart/change/end + multi-touch touchmove preventDefault at document level.
- Download button hidden when installed (home-screen apps have no download UI); Save to Files lives in the share sheet.
- Highlighter holes where a stroke crossed itself (iPadOS only; Chromium and Linux WebKit render the stroke cleanly): HLFILL86 in
  patches.py draws plain highlights as one filled union (quads + discs along the smoothed path, nonzero). Pixel-compared to the
  stroked version in Chromium (same coverage within 2%), PDF export editable + flattened checked.
- Open: highlighter hold-to-straighten reported not working on the iPad; the same code passes t111a's pen and highlighter hold
  checks on this build. Waiting for an A/B against the Claude version on the same iPad.

## Nov 16 2026 — V86 of the iPad edition (label "86 · Nov 16 2026 · iPad edition")
New parts live in `rd-build/parts/` and are inserted before the wiring (same scope as the V85 parts):
- `app76.js` IMGX86 — images in: Open / Files home Bring in / Add take JPEG, PNG, HEIC, WebP, GIF… (inputs patched to accept
  images and several files). One image → one-page document; several → one PDF, a page each (150 dpi, JPEG q0.9 or PNG for
  transparent types, long side ≤ 4000 px, EXIF orientation via createImageBitmap). "Add images as pages" and "Photo as a new page"
  (camera input #fCamPg) under More › This document. Library import of images becomes one document.
  Images out: Save › Export… — PDF editable/flattened (reuses savePdf with a page list), PNG/JPEG of this page / all / a range at
  1200–4800 px, with or without markups (pageImage86, canvas area capped at 24 MP); several image pages → one ZIP via zipStore.
  Choices remembered in store 'export86'.
- `app77.js` PERSP86 — Perspective tool after Polygon (TOOLS/IC/HINTS). Capture-phase pointer handlers on #stage (pattern of the
  Artist panel): tap drops a vanishing point (max 3), drag draws a line aimed at the nearest point, drag a point moves it, tap a point
  removes it. Guides drawn by a drawOverlays wrapper (fan every 15°, 7.5° with the tool active, horizon through points 1–2),
  screen only. snapAngle and constrain wrappers snap any tool to a vanishing direction within 6° when Snap is on. pg.persp saved
  with the document (docState stores pages whole); not written into exported PDFs. ctxExtras wrapper adds Hide/Clear/Copy to
  every page when the page has points and nothing is selected.
- Tests: `t121.js` (images in, Export dialog PNG/JPEG/ZIP/PDF, perspective: drop/draw/move/remove, Snap on/off, reload, menu).
  t120, t111c ALL OK; t111a/b identical to the V85 baseline.
- Same day, after the first iPad try: the guide fan is one density now (every 10°, any tool). Perspective snapping is no longer tied
  to the Snap button: a **Guides** button (#bPerspA, store 'perspAssist', device setting) sits after Snap and shows whenever the
  page has vanishing points. On: snapAngle/constrain lock every dragged line to the nearest guide direction (rays to the points,
  plumb, and level when fewer than two points; no angle limit), and a penPt wrapper keeps pen/highlighter strokes on one guide —
  free for the first 20 px, then the direction is read from start to there, the first points are laid on it, and the last point
  (added by strokeEnd after it clears the draft) is projected through g.pa/g.pdir. Off: nothing snaps to the guides.
- `app78.js` HLMODE86 — "Highlight: Draw | Text" switch on the highlighter bar (#hlModeF after #hlStraightF; store 'hlText').
  Text: capture-phase handlers (pattern of app77) run the Select-text flow — primeText, textInRect / wordAt — and apply a
  tmark kind 'hl' directly in the highlighter's color/opacity (hlTextApply), no menu. Lines field hidden in Text mode.
  DIAG86 — Settings › "Stroke diagnostics" (store 'diag86'): wrappers on strokeStart/holdCheck/trySnap/strokeEnd record pointer
  type, points, hold time, other pointers that landed mid-stroke, and re-run trySnap's own tests to name the failing one; a toast
  after each stroke, last 12 in RDX.DIAG.log and shown in Settings. For the open "highlighter will not straighten on the iPad".
  Tests: `t122.js`.
