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
- `app79.js` TFLOW86 — text selection flows like a word processor (textInRect wrapped by textInFlow86: lines from item
  baselines, segments split at column gaps, anchors by nearest line/char, start→end of line, full lines between within the
  drag's column, last line to the end point; box selection kept as RDX.textInRectBox86 fallback). Used by Select text and the
  highlighter's Text mode. Test `t123.js`.
- TFLOW86 columns: a gap inside a row is a column gutter when it is > 3h wide, or > 0.8h and the same x stays free of text in
  ≥ 50% of the straddling rows nearby (3 sample points across the gap); then the row is split and each side is its own line.
  Narrow gutters (≈1.6h) split; a single justified row with wide spaces does not. Fixture fx/cols.pdf, test t124.js.
- `app80.js` FEST86 — Settings › Appearance › Festive look (store 'fest': off | auto | id). Full palettes (light + dark) for
  autumn (Nov), Halloween (Oct 15–31), Christmas (Dec 1–25), New Year (Dec 26–Jan 2), Valentine's (Feb 7–14), St. Patrick's
  (Mar 14–17), Fourth of July (Jul 1–4) and "Wizard's study" (manual only; parchment/scarlet, midnight/old gold — colors only,
  no franchise names, crests or characters). applyLook wrapper sets the vars inline on :root, a 3px stripe under #top, theme-color
  metas follow the panel color; off removes everything and restores the accent. Hourly re-check for auto. Test t125.js.
- `app81.js` FESTDECO86 — decorations for the looks: a 76px banner scene at the top of the Files home (gradient sky/parchment
  per look, light/dark; ornaments: falling leaves/acorns, snow + a string of blinking lights, bats + moon + cobweb + pumpkins,
  fireworks, rising hearts, shamrocks, bunting, candles with flames and sparks), a greeting; a thin ornament strip along the
  bottom of #top (z-index −1 inside an isolated #top); browser-tab icon per look; tool icon swaps re-rendered on the rail
  (Wizard's study: pen → quill, stamp → wax seal; Christmas: stamp → gift); parchment noise texture + candle-glow pulse for the
  wizard look. Settings › "Decorations with the festive look": Animated / Still / Colors only; prefers-reduced-motion → Still.
  Animations are transform/opacity only, ≤ ~20 small nodes, nothing over the sheet. Version label now carries a build serial
  (86.N) so a device's build can be told apart. Test t126.js. The home-screen app icon cannot change after install.
- `app82.js` TREE86 — bring in a whole folder structure: New › "Bring in a folder" and Files › More › "Bring in a folder"
  (desktop: folder picker via webkitdirectory; iPad: a ZIP of the folder, because Safari has no folder picker), and dragging a
  folder or a ZIP onto Files. Subfolders become folders (nested, under the current folder), PDFs land in theirs, images in one
  folder become one document, hidden files / __MACOSX / non-documents are skipped; a toast sums up what came in. Test t127.js
  (fixture fx/tree.zip).
- `app83.js` SHEETS86 — sheet-set basics. More › "Name the pages from the title blocks": reads each page's text, ignores
  strings common to ≥ 60% of pages (project, firm), picks the sheet number (A-2.1, S-1.0, M101 …) and the title from the
  title-block area, sets pg.label / pg.sheetTitle (saved with the document; shown in the Pages panel and page box). "Sheet
  index" dialog: filter by number or title, tap to jump (Back step recorded). Linked callouts: tokens on a page that match
  another sheet's number get a dotted underline (More › Hide/Show sheet links); tapping one with Select/Pan/Marquee opens a menu
  "Go to A-5.1 · WALL SECTIONS / Sheet index / Hide sheet links". Links are computed per page on demand and cached (SL),
  reset on page change. Fixture fx/sheets.pdf, test t127.js.
- `app84.js` SYNC86 — the Redline account on the user's own Supabase project (qionjysqxjgddoepknaq). V85's whole account layer
  (CL: connect/enable/push/pull, settings, prefs2, kit, thumbnails, Files cards, newer-copy checks) is reused unchanged; this part
  hands it four objects backed by Supabase — db → table public.kv (user_id, path, data jsonb; doc get/set/update/delete,
  collection get limited to d_* rows), assets → storage bucket rd-assets (<uid>/<id>), user/permissions → the signed-in user,
  always granted. Sign-in: email + password (/auth/v1/token?grant_type=password). Supabase only lets email templates be edited
  with custom SMTP, so the 6-digit-code route is parked (sbSendCode/sbVerify kept). Create account = /signup (one confirmation
  link, default template); Forgot/never set a password = /recover → the emailed link lands on the site with #access_token…
  &type=recovery, which boot picks up (sbPickHash), connects, and opens "Choose your password" (PUT /auth/v1/user);
  session in store 'sb86' (PREF_SKIP), refreshed 2 min before expiry and on a 401; a dead refresh token signs out with a toast.
  PDFs stay on each device by default: upSource returns { enc:'none', fp: sha256 } and cloudPush records fp (patch); another
  device matches an opened PDF by fingerprint (openFile wrapper → "This PDF has markups in your account") or asks for the PDF
  when a document is opened from Files ("Choose its PDF", fPick86; a different file is flagged). Background pulls of such
  documents fail quietly (pullFail → card "markups in your account · tap to choose its PDF"). Settings › Redline account:
  Sign in / signed in as / Sign out / "Also keep the PDFs in the account" (sbPdfsSet: re-sends sources). Files › More offers
  Sign in when there is no session; cloudEnable with no session opens the sign-in dialog. Build renames every "Claude
  account" string to "Redline account". sw.js now leaves cross-origin requests alone (it was caching API answers, which
  made a reload read a stale "sync off"). SQL for the project: build/supabase.sql. Tests t128.js (create account by link, password sign-in on a second device, wrong
  password, cross-device recognition, newer copy, token refresh, PDFs-on upload, third device, sign-out) and t129.js (forgot-
  password link → password dialog, Choose-its-PDF picker incl. wrong-file warning) against fakesb.js, a stand-in for the
  auth/REST/storage endpoints. Not tested here: the real Supabase project end to end (needs the user's emails).
- FEST86 fix: a "Background around the pages" or accent the user picked in Settings now wins over the festive palette (the
  look used to paint its own mat/accent over them, so the setting looked dead while Autumn was on); turning the look off
  re-applies the user's own theme/mat/accent.
- SYNC86: "Also keep the PDFs in the account" is now ON by default (the user's call: documents must open on every device
  without choosing the PDF). sbResendPdfs() runs after each connect/sign-in and re-sends sources that were pushed as
  fingerprint-only while the setting was off. Test t130.js (default upload, second device downloads by itself, re-send).
- LOOK86 — the drawing display (As drawn / Grayscale / Black lines / Faded / Blueprint / Swap a color) was only reachable through
  "Change colors on this page…" (hold on the page), and that dialog refused to open on a page with no markups, so Blueprint
  looked gone. Patch: the dialog opens regardless (note "No markups on this page yet"); app85.js adds More › This document ›
  "How the drawing shows: blueprint, grayscale…" (shows the current look) and a Help entry.
- `app86.js` SHARP86 — Change colors › "Sharpen scanned pages" Off / Light / Strong (store 'sharpen86'): an unsharp mask
  applied after pcv to the base, detail and neighbour canvases, cached per canvas; ~140 ms for 6 MP here. For sheets that are
  low-resolution pictures inside the PDF (vendor details, scans). The rendering pipeline itself was checked: the detail layer
  already renders at screen resolution (10 MP budget on touch devices), so softness on such pages is the file's own.
- MENU86 patch — an anchored menu (the … on a Files card, and every other menu()) that would run past the bottom of the window
  now opens upward, or is clamped to the window and scrolls. `app87.js` DND86 — drag and drop in Files: mouse drags on 8 px;
  touch/Pencil hold ~400 ms to lift (a hold with no move still opens the card menu; a quick swipe scrolls); drop on folder cards
  or on the breadcrumb (Projects / parent folder); a multi-selection drags together (badge); same bookkeeping as Move to a
  folder; cycle guard. Thumbnail images are made non-draggable (a native image drag cancelled the pointer). Test t131.js.
- `app88.js` SPLIT86 — two documents side by side: tapping a side to edit it no longer flips the sides every other time.
  Cause: p2SwapDocs toggled the swap class, but openDoc → resetDocExtras → closeSplit had already reset S.swapSides, so the
  toggle started from the wrong baseline. Now the arrangement is remembered before the swap and set explicitly. Test t132.js
  (three switches; fails with SPLIT86 off, passes on).
- `app89.js` SYMLIB86 — construction symbol library on top of V85's 'symbol' markup: ~65 new legend symbols (electrical
  receptacles/switches/devices, lighting, plumbing fixtures and rough-in, appliances, HVAC, general marks) drawn as vector
  paths in symDraw86 (symPath wrapper; V85's 22 drawing marks stay under "Drawing marks"). New picker (symbolDialog86):
  categories, word search, recents, Size S/M/L/XL (store symSize86), Highlight None/Soft/Strong (store symHalo86: a soft
  block of the symbol's color behind it, drawn in a drawSymbol wrapper so it flattens into the PDF too), colour swatches
  (setProp stroke). placeSymbol wrapper applies size/halo and records recents; keeps placing until another tool. Selected
  symbols: context menu Highlight on/off, Bigger, Smaller, Another symbol…; properties panel checkbox. Test t133.js (picker,
  filter, search, placement with size/halo/colour, menu actions, swatch recolour, flattened PDF shows the symbol).
- `app90.js` KEYS86 — Alt+Z fits selected text boxes (fitBoxSel); Ctrl/Cmd-drag with the arrow tool duplicates in place and
  the ordinary move takes the copies; Shift while moving/resizing turns off magnet, smart guides, grid and page guides for
  that gesture (gridCfg + moveSnap wrappers). `app91.js` EDTX86 — "make the text editable" skips lines whose text is
  unreadable private-use glyphs (CAD fonts) and says so, or explains when nothing is readable; text boxes remember their
  cover (coverId) and deleteSel removes both. `app92.js` RELNOTES86 — What's new card after an update (RELNOTES list; store
  seenRel86; skipped under ?nohome; More › What's new). `app93.js` PRINT86 — Save › Print… / Ctrl+P: pages, markups on or
  off; desktop → hidden iframe print of the PDF (Safari desktop → new tab); iPad → share sheet. `app94.js` SAVE86 — on
  desktop Chrome/Edge: Open through showOpenFilePicker keeps the handle (idb fsh:<doc>), Save (markups editable) writes
  over it, Save as… re-links, everything else asks where; permission requested on the Save button press; tests set
  window.__rdNoFS86 unless they stub the pickers. `app95.js` LINKBOX86 — Link to a sheet… then drag a box on the sheet
  (m.link.box fractions); followLink zooms to it (same doc and other doc). Test t134.js; SAVE_ADJ86 adjusts the Save menu.
- SPLIT86 v2 — the side switch no longer reloads: busy() and closeSplit() are no-ops during the swap (SW.quiet), the
  document leaving the editable side gets its parsed PDF back from pdfWarm before p2OpenDoc (it was re-parsed from
  IndexedDB on every switch: ~1.3 s), both views and the current tool are kept, one short toast. Measured in the rig on the
  72-page stand-in: ~0.8 s → mostly the big sheet's first render; small documents ~0.2 s.
- SPLIT86 v3 — no blank side while switching: afterLoadExtras is skipped for the split part during the swap (it blanked the
  second view and rendered a stray page), each side is seeded with the other side's rendered base canvas (the old main base
  goes to P2.base; a clone of the old P2 base becomes S.base) until the real renders land; the switch edits the page that
  was showing in the second view (goPage if the saved page differs). Test t135.js counts blank frames per side (≤2).
  RELNOTES86: the card shows only the newest entry; All notes lists the rest.
- `app96.js` FORM86 — fill out flat forms. detectFields86(pg) reads the page's operator list (rectangles, horizontal segments,
  thin filled rules; fill/stroke colours tracked so dark bars are skipped, frames around ≥2 boxes skipped, boxes with printed
  text skipped) and the text items (runs of ____, labels to the left/above for names) → text fields (tall → multi-line),
  checkboxes (6–20 pt squares), underline fields (box 15 pt above the line; table rules excluded). Detected fields live in
  S.det86[src:n] (saved in docState, restored in readDoc, cleared by resetDocExtras) and are appended to formCache by a
  pageFields wrapper, so V85's tint/tap/edit path treats them like real fields (det: true, own: false; setField marks them in
  formOwn so applyForm ignores them). drawFormText wrapper draws their answers (fit-to-box text, ✓ for checks; underline
  fields sit on the line). applyFormLib wrapper creates real AcroForm fields with pdf-lib at save (text/multiline/checkbox,
  named rd_<label>_<page>_<n>) so Save PDF is fillable in Acrobat and flattenForm prints them. Editor: Tab / Shift+Tab /
  Enter step through fields in reading order (scrolls into view); My details (store formMe86, Settings) fills Name/Address/
  Phone/Email… fields, Date fields get today. Commands: More › Fill out this form; hold on page → Fill out this form / Add a
  text field here / Add a checkbox here / Remove this field. Fixture fx/form.pdf (reportlab), test t136.js (detection,
  typing, Tab, checkbox, My details, add/remove, reopen, saved PDF has ≥16 real fields with values via pypdf, flattened
  text via pdftotext). Scans (pictures of forms) are not detected yet — the dialog says so and points to Add a field.

86.67 — GUIDE86 (parts/app97.js, guide/): companion guide for the iPad edition at <app>/guide/ (abormel15.github.io/
  redline/guide/), same shape as the "Redline Desk Training" artifact (picture index, one card per task with a clip and
  numbered gesture steps, search, "I tried it" progress in localStorage rdGuide86Tried, Listen, keyboard card, release
  notes). guide/build_guide.py generates guide/index.html from its CARDS table + RELNOTES in parts/app92.js (build.py runs
  it and copies guide/ into the output, build_guide.py excluded), so a new note shows up in the guide on the next build; a
  new feature gets a card in CARDS and, when a clip helps, a scenario in markup/rec.js (`VP=air PORT=8766 node rec.js
  <name>` → guide/clips/<name>.gif + .jpg, serve.sh + fakesb.js running). The app opens it in an in-app overlay (iframe,
  Close / Open in a tab, Escape) from ⋯ More › Guide to the iPad edition, Files › More (patch next to Help and tips), a
  Guide button on the What's new card (goes to #notes) and a Help row. sw.js: pages other than the app (guide/) are cached
  under their own key — before, a visit to guide/ overwrote the cached app page ('index.html'), which would have shown the
  guide instead of the app offline. Tests: t137.js (page served with cards/clips/current note, the three entry points,
  overlay at #symbols, Escape/Close, Guide button → #notes); t134 pinned to the 86.67 note. Not tested: the overlay on a
  real iPad home-screen app (iframe on the same origin, no reason it differs), Listen voices on iPadOS.

86.76 — FORMSZ86 (parts/app98.js): the text size in a form field is the person's to set. fieldSize86(pg, f, auto) is what
  the drawing and saving code asks; sizes live in S.formSz86[src] = { [fieldId]: pt, __all: pt }, saved in docState,
  restored in readDoc, cleared by resetDocExtras (same pattern as S.det86). The bar (#fszBar86, built next to #fieldEd)
  shows above the open editor: A− / A+ step through FSZ_STEPS86 (5–24 pt), the middle button reads "Auto · <n>" or
  "<n> pt" and returns to automatic, All writes __all for the whole document. It swallows pointerdown/touchstart so the
  editor keeps focus, and hides itself when #fieldEd hides (MutationObserver). Ctrl/⌘+Shift+> and < do the same from the
  keyboard. Hold on a text field → "Text size for this field…" (chips + "every field in this document"). Auto for a real
  AcroForm field is the PDF's own size, read from the annotation's defaultAppearanceData in a pageFields wrapper (f.fs0);
  for a detected field it is the fit-to-box size app96 already used. Drawing: detected fields take the size through
  fieldSize86 in app96's drawFormText wrapper (a chosen size switches off the shrink-to-fit loop); real fields are drawn
  by pdf.js at the PDF's own size, so app98's drawFormText wrapper paints over them (white box + text) when a size is
  chosen. Saving: app96 sets it on fields it creates, app98 on real ones (setFontSize + fszDA86 writing /DA), so the saved
  PDF and the flattened one both carry it. Tests: t138.js in two browser runs (fx/acro.pdf, a reportlab PDF with real
  AcroForm fields, then fx/form.pdf): bar position and Auto label, A− twice keeps the editor open and moves its font,
  leaving the field closes both, the dialog's "every field", a second field opening at the document size, the saved PDF's
  DA at 14 pt, sizes after reopening, per-field size on a detected field, the saved and flattened output, the keyboard
  step. Known: pdf-lib writes the DA font as /Helvetica while the form's resources name it /Helv, so Acrobat re-editing a
  field there falls back to its automatic size (display, printing and flattening are unaffected) — not worth the surgery.

86.80 — FORMSZ86 fit (parts/app98.js, app96.js): a chosen size is a CEILING, never a promise of clipping. fszFit86(f, v,
  want) shrinks in 0.5 pt steps until the answer fits the box (textW against the width for one line, wrapped line count
  against the height for a multi-line field) and every drawing and saving path goes through it. fszOwn86(f) is the size
  the PDF itself gives a real field (f.fs0 from the annotation's defaultAppearanceData, 0 = automatic). Real fields are
  repainted by app98's drawFormText wrapper when a chosen size exists OR when the field's own fixed size overflows — an
  automatic field is left to the viewer, which already fits it. applyFormLib writes the fitted size (setFontSize +
  fszDA86) for the same cases, so Acrobat matches what Redline draws. Values that came with the file (f.v0, through
  fieldVal) count, not only ones typed here: the Madison Homes timesheet arrives with its cells at a fixed 14 pt, which
  clips '11/16/26' in a 50 pt cell and '7R,1AA' in a 34 pt one — both in Acrobat and in Redline. The bar's label shows
  the shrink ('14→8 pt'). Test t139.js on his own sheet (fx/timesheet.pdf): the fields arrive at 14 pt, Redline fits them
  (14→11.5 and 14→8), the saved PDF carries sizes ≤ the chosen 14 with the narrow cells smaller, and the flattened PDF's
  text has the dates and hours in full. The blue boxes he saw in Acrobat on a flattened copy are Acrobat's own field
  highlight on the fillable copy in the next tab — a render of the flattened file here has no shading at all.

86.83 — FORMSZ86 fit, two corrections found on his own timesheet: (1) the repaint bailed out when S.form[src] was empty,
  so a form opened with answers already in it (his timesheet) kept the viewer's clipped drawing until he typed in a
  field — the drawFormText wrapper no longer requires S.form and reads every value through fieldVal; (2) the white cover
  was inset 1 pt inside the field, which left slivers of the viewer's larger glyphs along the left and right edges ("text
  behind the text") — it now covers the field plus 0.9 pt all round, under the clip. Checked by rendering the week-1 row
  through renderRegion (the screen's own path) before and after: dates and 7R,1AA fitted, no leftovers.

86.86 — CALLROT86 (parts/app99.js): callouts carry an angle. V85 had 'callout' in noRotType, so one drawn on a page the
  user had rotated ran its text down the sheet with no way to turn it. isRotType/noRotType are wrapped to let a callout
  rotate, and only its BOX turns: calloutLeader is wrapped to pick the nearest midpoint of the TURNED box (which also
  fixes tapping the leader), drawMarkup draws the leaders and arrow heads itself in page space and then hands the box
  (pts[0], pts[1] only) to V85's rotated path, hit/handles/bbox/gbox are wrapped so the box turns while the tips and
  their bends stay put (callBox86 is the area of the turned box plus the leaders). newMarkup gives a callout, text box
  or sticky note made on a rotated page rot = 360 − pg.rot, so it reads across the screen; the box keeps its own
  proportions (an extra width/height swap double-counts and was removed). Test t140.js: a callout is rotatable, a normal
  page is unchanged, turning one leaves the tip where it was, a new one on a 90° page comes out at 270° and reads
  across, and both the flattened and the annotated save carry it (FreeText with an appearance stream). Checked against a
  render of the saved PDF: page content and callout match what the screen showed.

86.90 — CROP86 (parts/app100.js): pages can be cropped. A crop is a window, never a cut: pg.crop86 = [x0,y0,x1,y1] in
  that page's PDF units is pushed into pdf.js's own page view (page._pageInfo.view, with the original kept in
  page.__view086), so every render path — base, detail, thumbnails, the second pane, snapshots, print — follows without
  being touched. patches.py turns V85's `const getPdfPage` into `let` so the part can wrap it and give a page its window
  before it is drawn (a reopened document restores pg.w/h/toPdf from its saved state, so only the view needs applying).
  Applying a crop re-measures the page (getViewport → w/h/toPdf) and shifts every markup on it by the new origin (a crop
  is a pure translation, so shiftPt is enough); detected form fields for that page are dropped and re-found on demand.
  buildPdf is wrapped to setCropBox on cropped pages, so a saved PDF opens cropped elsewhere while the whole sheet stays
  in the file. UI: hold on a rectangle markup → Crop this page / every page to the box (the rectangle is consumed as the
  guide; markups left outside are counted in a confirm), ⋯ More › Crop pages… explains it and offers "Draw the
  rectangle", and Undo the crop on this page / every page restores pg.crop86 = null. Test t141.js: page size follows the
  box, the guide rectangle goes, a markup inside keeps its place, the pdf.js page measures the window, the saved PDF has
  the CropBox with the full MediaBox underneath, the crop survives reopening, undo restores size and markups, and every
  page crops to the same window. Not covered: OCR text positions and saved link view boxes are not re-mapped by a crop.

86.94 — three things that came out of his own sheets:
  EDTXLEAN86 (parts/app101.js): "Make all the text on this page editable" asks first. Tapping the lines you want is the
  default (setTool('edittext'); V85 already converts one line per tap through editTextAt), so nothing is created until a
  line is edited; "Turn them all into boxes" keeps the old path, with the line count and a word about size. lineToMarkups
  records t.orig86 = the line's text, so edtxUnchanged86 can tell an untouched pair from an edited one, and
  edtxClean86() removes untouched cover+text pairs — for sheets converted before this build it falls back to comparing
  each box with the page's own text lines. ⋯ More carries it when such pairs exist. Measured on docA (7 lines): plain
  save 3.5 KB, all-at-once 45 KB, after the cleanup 9 KB.
  Forms (parts/app96.js): a detected field with no value is no longer written into the saved PDF (f.added86 marks a field
  the user added by hand, which is always written). The timesheet case: 18 boxes found, 0 written when empty, 1 written
  after filling one in.
  CIVIL86 (parts/app102.js): 46 civil/site symbols in their own picker group (meters, valves, curb stops, BFP,
  transformer, poles, hand hole, generator, EV, propane, well, septic, condenser, hydrant, FDC, PIV, fire sprinkler head,
  riser, irrigation head and valve, yard hydrant, cleanout, manhole, catch basin, area drain, downspout, sump discharge,
  culvert, swale arrow, spot elevation, benchmark, bollard, sign, ADA space, parking count, tree, shrub, silt fence, tree
  protection, soil boring, mailbox), drawn by a symDraw86 wrapper. Labels: symTextDialog86 opens from a hold ("Change the
  letter or number…") and from a double-tap (startEdit is wrapped for symbol markups, which also covers V85's own
  drawing marks — section cuts, detail bubbles, keynotes — so each one carries this drawing's number).
  build.py: parts are now read in number order (app100 after app99); before, text order put app100/app101 first and a
  later part could not wrap an earlier one. Tests: t142.js (ask-first, light way, all-at-once, measured file sizes,
  cleanup, empty fields left out of the save), t143.js (the group, placing a meter, the hold menu, the label dialog, two
  meters with their own labels). t134 and t136 updated for the new behaviour.

86.100 — the two-sided audit (markup/aud_lib.js, aud1–aud4.js) and PARITY86 (parts/app103.js).
  Harness: tw.js gained a PC mode (VP=pc: 1440×900, no touch, Windows Chrome UA); aud_lib.js gives one input interface
  with three back ends — mouse+keyboard, finger (CDP touch), Pencil (CDP pen pointer) — so the same script runs each
  action all three ways (MODE=finger|pencil with VP=air, or VP=pc). aud1: every rail tool creates its markup or opens
  its dialog; aud2: select / move / resize / rotate / undo / menus / duplicate / delete / text editing / colours / zoom
  / pan / pages / marquee / copy-paste / eraser modes / symbols / callout rotation / crop, plus the keyboard-only paths
  on PC; aud3: every More entry, Save and export, Settings, account dialog, What's new and Guide, forms on the real
  timesheet, Files (folder, drag into it, card menu, search), side by side; aud4: device identity — an iPad (iPad UA,
  no file pickers, navigator.share stub) saves and prints through the share sheet and gets Home Screen steps; a computer
  (File System Access stubs) saves over the picked file, has Save as…, prints through the system dialog and gets
  Install-as-an-app steps.
  What it found, and the fixes:
  · app98: the form size bar swallowed touchstart to keep the keyboard up, which also swallowed the click iOS sends —
    so on a real iPad the bar did nothing for a finger or the Pencil. It now acts on touchend (click kept for a mouse).
    ◀ ▶ added (fieldStep86 ∓1): the touch Shift+Tab / Tab.
  · app103 PARITY86: hold-still on a selection handle opens the menu (a second pointerdown listener arms g.lp for
    kind 'handle'; V85 only did for 'move'); Pencil hold-still on empty paper opens the page menu (kind 'marquee' + pen);
    double-tap on a symbol opens symTextDialog86 (capture pointerdown notes the symbol, showPanel wrapper diverts V85's
    "open the list panel"); a finger tap with a placing tool after penSeen toasts why, once per tool; "Move it freely
    once" (PAR.freeOnce read by gridCfg/moveSnap wrappers, cleared after the next gesture) is the touch Shift-drag;
    installHelp is device-worded (patches.py routes the menu label through __rdInstallLabel86; beforeinstallprompt is
    kept for an Install now button); keysDialog lists this edition's keys with their touch ways.
  · app96: the Form entries are left out of the page hold menu when the page has no fields.
  · app92: relCmp used Number() on '94 · Nov 18 2026 …' (NaN → 0), so every stored build compared as x.0; parseInt now.
  Not app bugs (recorded so the next audit does not chase them): once the Pencil is seen a finger selects and pans (V85
  design, line 1634); the eraser defaults to Precise (ink only; Whole stroke is the select in the bar); setting #fOpen's
  files from a script while Files is showing imports without opening (the New › Bring in PDFs flow opens it).
  Also from the regression run on 86.100: app87's Files drag handler assumed every pointerdown has an element target
  (e.target.closest threw when the target was the document — seen in t129/t130); guarded. t121 (perspective guides) is
  written for the 13-inch viewport: run it without VP=air (at 1180×820 its wobbly stroke starts nearer the horizontal
  family than the vanishing line, 11.6° vs 12.5°, so the assist rightly picks horizontal and the test's expectation fails).
  The size bar drops only a click that trails a touchend (same-kind repeats all count, so quick A− A− works).

86.102 — the cleanup could not be found: its ⋯ More entry was only added when the current page had cover+text pairs
  that carried coverId (86.51+), so on sheets converted earlier, on other pages, or for form boxes it never showed.
  app101 now: the entry is always in More while a document is open (its note counts the boxes on the page), and it opens
  edtxCleanDialog86 — a survey first (edtxSurvey86 per page: unchanged pairs, blank covers, empty detected form fields),
  counts for this page and the whole document, three tick boxes, then This page / Whole document. edtxCovers86 pairs a
  cover with its text box by coverId or, for older sheets, by place (the text box whose middle sits on the cover);
  "unchanged" is orig86 === text or, without that record, the page's own text line at that spot reading the same. A text
  box emptied on purpose and (when unticked) a blank cover are left alone. Empty form boxes are cut from S.det86 (hand-
  added and filled ones stay). One pushUndo for the lot. Holding on a page that has any offers "Clean up boxes you never
  used…". Test t144.js (PC, finger, Pencil): entry always present, the nothing-to-do wording, an older-style sheet
  (coverId and orig86 stripped), counts in the dialog, Whole document, Undo, a white-out kept, empty form boxes removed
  with the filled one kept, the hold-menu route.

## 86.103 (Nov 19 2026) — the frozen "stable" copy for sharing

**Link: https://abormel15.github.io/redline/stable/** — a copy of the app that does not change when the main version is deployed.

- `parts/app84.js`: runtime switch `window.__rdNoAccount86`. When a page sets it before the app script, there is no sign-in
  anywhere (Files › More, Settings › Redline account, the sign-in dialog, the account Help topic), `cloudInit` leaves the
  account off without contacting Supabase, and `cloudEnable` only explains that the copy keeps everything on the device.
  Storage says where documents live instead of pointing at an account switch. Off (the main version): no change.
- `parts/app92.js`: a copy with that switch does not show "What's new" on a first visit.
- `make_stable.py`: cuts the frozen copy from `/home/claude/rd` into `/home/claude/rd-stable`: sets the switch, label
  "… · shared copy", guide without the account card, service worker with its own cache names (`rds-shell-*`, `rds-runtime`)
  so the main worker's clean-up (`rd-shell-*`) never clears it, `STABLE.json` saying which build it was cut from.
- `deploy.sh`: the deploy procedure as a script. **An ordinary deploy never touches `stable/`** (the wipe step skips it, and the
  script refuses to push if `stable/` would change). `PROMOTE=1 deploy.sh "…"` replaces it. Promote only when Alexander asks.
- Why accounts are off in the shared copy: the Supabase project's built-in mailer only reaches team addresses (2 emails/hour),
  so other people could not confirm an account; and their documents would land in Alexander's personal backend.
- Same origin as the main version (abormel15.github.io), so on a device that opens BOTH links the two share one document store
  and one set of settings. A friend who only uses the stable link is unaffected.
- Test: `audit/tstable.js` (main and stable side by side on one device: labels, no sign-in in stable, sign-in still in main,
  separate service workers and caches, each opens offline as itself).
