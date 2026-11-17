"""Small, documented changes to the V85 app code applied by build.py for the iPad edition. Each entry: (name, old, new, why).
Every `old` must occur exactly once in the source; the build fails loudly otherwise."""
PATCHES = [
 ('HLFILL86: highlighter drawn as a filled union, not a stroked path',
  "function bandPts(pts, W) {",
  """/* HLFILL86 (iPad edition): on iPadOS, a see-through highlighter stroke that crossed itself was drawn with holes at the overlaps
   (CoreGraphics stroking a self-intersecting path under multiply + alpha). The stroke is now one filled outline: a quad per
   segment of the smoothed path plus a disc at every joint and both ends, filled with the nonzero rule, so overlaps are a plain
   union. Same width, same round caps and joins; dashed highlights keep the old stroke. Switch: HLFILL86. */
const HLFILL86 = true;
function hlSmoothPts(pts) { if (pts.length < 3) return pts.slice(); const out = [pts[0]]; let prev = pts[0];
  for (let i = 1; i < pts.length - 1; i++) { const c = pts[i], e = { x: (c.x + pts[i + 1].x) / 2, y: (c.y + pts[i + 1].y) / 2 };
    for (const t of [0.5, 1]) { const u = 1 - t; out.push({ x: u * u * prev.x + 2 * u * t * c.x + t * t * e.x, y: u * u * prev.y + 2 * u * t * c.y + t * t * e.y }); } prev = e; }
  out.push(pts[pts.length - 1]); return out; }
function hlUnion(p, pts, W) { const h = W / 2, P = []; for (const q of hlSmoothPts(pts)) if (!P.length || dist(P[P.length - 1], q) > 0.05) P.push(q); p.begin();
  if (P.length < 2) { const a = P[0] || pts[0]; addCircle(p, a.x, a.y, h); return; }
  for (let i = 0; i + 1 < P.length; i++) { const a = P[i], b = P[i + 1], L = dist(a, b), nx = -(b.y - a.y) / L * h, ny = (b.x - a.x) / L * h; addQuad(p, [{ x: a.x + nx, y: a.y + ny }, { x: b.x + nx, y: b.y + ny }, { x: b.x - nx, y: b.y - ny }, { x: a.x - nx, y: a.y - ny }]); addCircle(p, a.x, a.y, h); }
  const z = P[P.length - 1]; addCircle(p, z.x, z.y, h); }
function bandPts(pts, W) {""",
  'define the union builder next to the band helpers it reuses (addQuad, addCircle, dist)'),
 ('HLFILL86: use it in drawMarkup0 for plain highlights',
  "else if (isVar(m)) { pathVar(p, m); p.paint({ fill: col }); } else { pathSmooth(p, pts); p.paint({ stroke: col, width: st.width, dash: dsh }); } break;",
  "else if (isVar(m)) { pathVar(p, m); p.paint({ fill: col }); } else if (HLFILL86 && m.type === 'highlight' && !(dsh && dsh.length) && pts.length > 0) { hlUnion(p, pts, st.width); p.paint({ fill: col }); } else { pathSmooth(p, pts); p.paint({ stroke: col, width: st.width, dash: dsh }); } break;",
  'only solid (undashed) highlighter strokes take the new path; pens and dashed highlights are untouched'),

 ('IMGX86: Open and Add inputs take images and several files',
  '<input type="file" id="fOpen" accept="application/pdf,.pdf" hidden>',
  '<input type="file" id="fOpen" accept="application/pdf,.pdf,image/*,.heic,.heif" multiple hidden>',
  'images open as documents; several files at once'),
 ('IMGX86: Add input takes images and several files',
  '<input type="file" id="fAdd" accept="application/pdf,.pdf" hidden>',
  '<input type="file" id="fAdd" accept="application/pdf,.pdf,image/*,.heic,.heif" multiple hidden>',
  'images become pages'),
 ('IMGX86: Files home Bring in takes images',
  '<input type="file" id="fImport" accept="application/pdf,.pdf" multiple hidden>',
  '<input type="file" id="fImport" accept="application/pdf,.pdf,image/*,.heic,.heif" multiple hidden>',
  'photos can be brought into the library'),
 ('IMGX86: pass every chosen file through',
  "$('fOpen').onchange = e => { openFile(e.target.files[0], false); e.target.value = ''; }; $('fAdd').onchange = e => { addPdfInto(e.target.files[0]); e.target.value = ''; };",
  "$('fOpen').onchange = e => { const fs = [...e.target.files]; e.target.value = ''; openFile(fs.length > 1 ? fs : fs[0], false); }; $('fAdd').onchange = e => { const fs = [...e.target.files]; e.target.value = ''; addPdfInto(fs.length > 1 ? fs : fs[0]); };",
  'the wrappers in app76 turn images into a PDF first'),
 ('IMGX86: Export… in the Save menu',
  "{ label: 'Save this page as an image (PNG)', icon: 'image', fn: savePng }];",
  "...extraItems86('save'), { label: 'Save this page as an image (PNG)', icon: 'image', fn: savePng }];",
  'one dialog for PDF / PNG / JPEG, pages and sizes'),
 ('IMGX86: images as pages in the More menu',
  "{ label: 'Add a PDF into this document', note: 'start, end, or at this page', icon: 'addpdf', fn: () => $('fAdd').click() },",
  "{ label: 'Add a PDF into this document', note: 'start, end, or at this page', icon: 'addpdf', fn: () => $('fAdd').click() }, ...extraItems86('doc'),",
  'Add images as pages, Photo as a new page'),

 ('TREE86: Bring in a folder in the New menu',
  "add('Bring in PDFs', 'Drawings and documents from the Files app. Pick one or several.', () => $('fImport').click());",
  "add('Bring in PDFs or photos', 'Drawings, documents and photos from the Files app. Pick one or several.', () => $('fImport').click()); add('Bring in a folder', 'A whole folder of drawings, subfolders and all. On the iPad, a ZIP of it.', bringInFolder);",
  'whole folder trees'),
 ('TREE86: Bring in a folder in the Files More menu',
  "{ label: 'Restore from a backup', icon: 'open', fn: () => $('fRestore').click() }, '-',",
  "{ label: 'Restore from a backup', icon: 'open', fn: () => $('fRestore').click() }, { label: 'Bring in a folder', note: 'subfolders become folders', icon: 'folder', fn: bringInFolder }, '-',",
  'same action from More'),

 ('SYNC86: cloudPull reads assets through the account adapter when one is present',
  "const get = async a => { const r = await fetch('/_blob/' + a);",
  "const get = async a => { const r = await (window.__rdBlob86 ? window.__rdBlob86(a) : fetch('/_blob/' + a));",
  'the Claude page serves assets at /_blob/<id>; the Supabase-backed account (app84.js) fetches them from its storage bucket instead'),
 ('SYNC86: a pushed source carries the PDF fingerprint, so another device can recognize the same PDF',
  "const up = await upSource(bytes); row.srcs.push({ id: s.id, name: s.name, size: bytes.length, parts: up.parts, enc: up.enc });",
  "const up = await upSource(bytes); if (up.fp && window.__rdFpNote86) window.__rdFpNote86(up.fp, s.id); row.srcs.push({ id: s.id, name: s.name, size: bytes.length, parts: up.parts, enc: up.enc, fp: up.fp });",
  'with PDFs kept on the devices (enc none) the fingerprint is how a document finds its PDF elsewhere'),
 ('SYNC86: Files › More offers Sign in when there is no account yet',
  "menu($('flMore'), [...(CL.status === 'none' ? [] : [",
  "menu($('flMore'), [...(CL.status === 'none' ? (window.__rdSignInItems86 ? window.__rdSignInItems86() : []) : [",
  'on the Claude page status none meant no account possible; on the iPad edition it means not signed in yet'),
 ('GUIDE86: Files › More has the guide next to Help and tips',
  "{ label: 'Help and tips', icon: 'help', fn: helpDialog }, { label: 'Show the quick tour', icon: 'help', fn: () => startTour('home', true) }]);",
  "{ label: 'Help and tips', icon: 'help', fn: helpDialog }, ...(window.__rdGuideItems86 ? window.__rdGuideItems86() : []), { label: 'Show the quick tour', icon: 'help', fn: () => startTour('home', true) }]);",
  'the guide page lives next to the app; see parts/app97.js'),
 ('LOOK86: the drawing-display options (Blueprint, Grayscale, paper look) open even on a page with no markups',
  "if (!scope.length) return toast('There are no markups to recolor on this page.');",
  "const noMk86 = !scope.length;",
  'the "How the drawing itself shows" choices live in this dialog, and a page with no markups used to bounce with a toast, so Blueprint could not be reached'),
 ('LOOK86: wording for a page with no markups',
  "'Every markup on this page'}. Tap a new color for any of them.",
  "noMk86 ? 'No markups on this page yet' : 'Every markup on this page'}. ${noMk86 ? 'The drawing display below still applies.' : 'Tap a new color for any of them.'}",
  'see above'),
 ('MENU86: an anchored menu near the bottom of the screen opens upward (or is clamped) instead of running off the screen',
  "el.style.left = clamp(r.right - w, 8, window.innerWidth - w - 8) + 'px'; el.style.top = (r.bottom + 4) + 'px'; openMenu = el;",
  "el.style.left = clamp(r.right - w, 8, window.innerWidth - w - 8) + 'px'; const mh = el.offsetHeight; let mt = r.bottom + 4; if (mt + mh > window.innerHeight - 8) mt = r.top - 4 - mh >= 8 ? r.top - 4 - mh : Math.max(8, window.innerHeight - mh - 8); el.style.top = mt + 'px'; openMenu = el;",
  'the … menu of the last row of Files cards was cut off and the page could not scroll to it'),
]
