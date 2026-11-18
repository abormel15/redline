/* ---------- CROP86 (iPad edition): crop whole pages ----------
   Draw a rectangle around the part of the sheet worth keeping, then hold on it: "Crop this page to the box" or "Crop
   every page to the box" (⋯ More › Crop pages… says the same and puts the entries where they are). A crop is a window
   on the page, not a cut: the file keeps everything, the view and every export show the window, and "Undo the crop"
   puts the whole sheet back. It works by giving pdf.js's page a new view box (its CropBox), so every render — screen,
   thumbnails, the second pane, snapshots — follows without touching the render paths; markups shift with the new
   origin, and the saved PDF gets the same CropBox so other readers open it cropped too. */
const CROP86 = true;
const cropOn86 = () => S.pages.some(p => p.crop86);
function cropBase86(page) { if (!page.__view086 && page._pageInfo) page.__view086 = page._pageInfo.view.slice(); return page.__view086; }
function cropMeasure86(pg, page) { const vp = page.getViewport({ scale: 1, rotation: pg.baseRot }); pg.w = vp.width; pg.h = vp.height; pg.toPdf = inv(vp.transform); }
/* a page loaded again (new session, second pane) gets its window back before anything is drawn */
function cropEnsure86(pg, page) { if (!CROP86 || !pg || !page || !page._pageInfo) return; const want = pg.crop86 || null, has = page.__crop86 || null;
  if ((want ? want.join() : '') === (has ? has.join() : '')) return; const base = cropBase86(page); if (!base) return;
  page._pageInfo.view = (want || base).slice(); page.__crop86 = want; }
const getPdfPageC86 = getPdfPage; getPdfPage = async function (pg) { const page = await getPdfPageC86.apply(this, arguments); try { cropEnsure86(pg, page); } catch (e) { console.warn(e); } return page; };
/* applying a crop: the window, then the page's own measurements, then everything on it shifts with the new origin */
async function cropPages86(pgs, frac) {
  if (!pgs.length) return 0; pushUndo(); let done = 0;
  for (const pg of pgs) { if (!pg.src) continue; let page; try { page = await getPdfPage(pg); } catch (e) { continue; } if (!page || !page._pageInfo) continue;
    const base = cropBase86(page); if (!base) continue; const W = base[2] - base[0], H = base[3] - base[1];
    const rect = frac ? [base[0] + frac.x0 * W, base[1] + frac.y0 * H, base[0] + frac.x1 * W, base[1] + frac.y1 * H].map(v => +v.toFixed(2)) : null;
    if (rect && (rect[2] - rect[0] < 20 || rect[3] - rect[1] < 20)) continue; /* nothing useful left */
    const oldToPdf = pg.toPdf; pg.crop86 = rect; page.__crop86 = rect; page._pageInfo.view = (rect || base).slice(); cropMeasure86(pg, page);
    const o = ap(inv(pg.toPdf), ap(oldToPdf, { x: 0, y: 0 })), dx = o.x, dy = o.y; /* a crop only moves the origin, so everything shifts by the same amount */
    if (Math.abs(dx) > 1e-9 || Math.abs(dy) > 1e-9) { for (const m of S.markups) if (m.page === pg.id) m.pts = m.pts.map(q => shiftPt(q, dx, dy)); }
    try { if (S.det86) { delete S.det86[pg.src + ':' + pg.n]; formCache.delete(pg.src + ':' + pg.n); } } catch (e) {}
    S.nb.delete(pg.id); done++; }
  S.detail = null; S.base = null; if (S.split) { P2.base = null; P2.det = null; }
  S.dirty = true; pagesChanged(); persistSoon(); if (S.split) render2();
  return done;
}
function cropFrac86(pg, b) { /* a box in page coordinates → where it sits in the page's own full sheet */
  const page = S.sources[pg.src] && S.sources[pg.src].__page86; const a1 = ap(pg.toPdf, { x: b.x, y: b.y }), a2 = ap(pg.toPdf, { x: b.x + b.w, y: b.y + b.h });
  const base = pg.__base86; if (!base) return null; const W = base[2] - base[0], H = base[3] - base[1];
  const x0 = Math.min(a1.x, a2.x), x1 = Math.max(a1.x, a2.x), y0 = Math.min(a1.y, a2.y), y1 = Math.max(a1.y, a2.y);
  return { x0: clamp((x0 - base[0]) / W, 0, 1), x1: clamp((x1 - base[0]) / W, 0, 1), y0: clamp((y0 - base[1]) / H, 0, 1), y1: clamp((y1 - base[1]) / H, 0, 1) };
}
async function cropFromBox86(m, everyPage) {
  const pg = S.pages.find(p => p.id === m.page) || cur(); if (!pg || !pg.src) return toast('This page has no PDF under it, so there is nothing to crop.');
  let page; try { page = await getPdfPage(pg); } catch (e) { page = null; } if (!page) return toast('That page could not be read.');
  pg.__base86 = cropBase86(page); const frac = cropFrac86(pg, box(m)); if (!frac) return;
  if (frac.x1 - frac.x0 < 0.03 || frac.y1 - frac.y0 < 0.03) return toast('That box is too small to crop to.');
  const hidden = S.markups.filter(q => q.page === pg.id && q.id !== m.id && !cropInside86(q, m)).length;
  const go = async () => { const ids = new Set([m.id]); S.markups = S.markups.filter(q => !ids.has(q.id)); S.sel.clear();
    const pgs = everyPage ? S.pages.filter(p => p.src) : [pg]; const n = await cropPages86(pgs, frac);
    toast(n > 1 ? 'Cropped ' + n + ' pages. ⋯ More › Undo the crop puts them back.' : 'Cropped this page. ⋯ More › Undo the crop puts it back.', 3000); };
  if (hidden) confirmBox('Crop' + (everyPage ? ' every page' : ''), hidden + ' markup' + (hidden > 1 ? 's are' : ' is') + ' outside the box and will sit off the cropped sheet. The crop can be undone at any time.', 'Crop').then(ok => { if (ok) go(); });
  else go();
}
const cropInside86 = (q, m) => { try { const b = box(m), g = gbox(q); return g.x0 >= b.x - 1 && g.x1 <= b.x + b.w + 1 && g.y0 >= b.y - 1 && g.y1 <= b.y + b.h + 1; } catch (e) { return true; } };
async function cropUndo86(all) { const pgs = (all ? S.pages : [cur()]).filter(p => p && p.crop86); if (!pgs.length) return toast('Nothing is cropped.'); const n = await cropPages86(pgs, null); toast(n > 1 ? 'The whole sheet is back on ' + n + ' pages.' : 'The whole sheet is back.', 2200); }
/* the saved PDF carries the same window, so it opens cropped elsewhere too */
const buildPdfC86 = buildPdf; buildPdf = async function (opts) { const bytes = await buildPdfC86.apply(this, arguments); try { if (!CROP86) return bytes; const pages = (opts && opts.pages) || S.pages; if (!pages.some(p => p.crop86)) return bytes;
    const doc = await PL.PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
    pages.forEach((pg, i) => { if (!pg.crop86) return; const p = doc.getPage(i); if (!p) return; const c = pg.crop86; try { p.setCropBox(c[0], c[1], c[2] - c[0], c[3] - c[1]); } catch (e) { console.warn(e); } });
    return await doc.save(); } catch (e) { console.warn(e); return bytes; } };
/* where it lives: hold on the rectangle you drew, and ⋯ More */
const ctxExtrasC86 = ctxExtras; ctxExtras = function (items, sm, one, s) { const r = ctxExtrasC86.apply(this, arguments); try { if (!CROP86) return r; const m = one || (sm && sm.length === 1 ? sm[0] : null);
    if (m && (m.type === 'rect' || m.type === 'viewport') && cur() && cur().src) items.push('-', { head: 'Crop' }, { label: 'Crop this page to the box', note: 'keep only what is inside', icon: 'crop', fn: () => cropFromBox86(m, false) }, { label: 'Crop every page to the box', icon: 'crop', fn: () => cropFromBox86(m, true) });
    else if ((!sm || !sm.length) && cropOn86()) items.push('-', { label: 'Undo the crop on this page', icon: 'crop', fn: () => cropUndo86(false) }, { label: 'Undo the crop on every page', icon: 'crop', fn: () => cropUndo86(true) });
  } catch (e) {} return r; };
function cropDialog86() { const sel = selMarkups().filter(m => m.type === 'rect' || m.type === 'viewport');
  if (sel.length === 1) return cropFromBox86(sel[0], false);
  const md = modal(`<h3>Crop pages</h3><p>Draw a rectangle around the part of the sheet you want to keep, then hold on it and choose <b>Crop this page to the box</b> or <b>Crop every page to the box</b>.</p><p class="muted">A crop is a window, not a cut: nothing is thrown away, the saved PDF opens cropped, and the whole sheet comes back at any time.</p><div class="acts">${cropOn86() ? '<button class="btn line" id="crUndo">Undo the crop</button>' : ''}<button class="btn line" id="crRect">Draw the rectangle</button><button class="btn solid" id="crOk">OK</button></div>`);
  md.querySelector('#crOk').onclick = md.close; const u = md.querySelector('#crUndo'); if (u) u.onclick = () => { md.close(); cropUndo86(true); };
  md.querySelector('#crRect').onclick = () => { md.close(); setTool('rect'); toast('Drag a rectangle around what you want to keep, then hold on it and choose Crop.', 4000); }; }
const extraItemsCr86 = extraItems86; extraItems86 = function (where) { const r = extraItemsCr86.apply(this, arguments) || []; if (!CROP86 || where !== 'doc' || !S.pages.length) return r;
  const items = [{ label: 'Crop pages…', note: cropOn86() ? 'cropped — the whole sheet can come back' : 'keep only part of the sheet', icon: 'crop', fn: cropDialog86 }];
  if (cropOn86()) items.push({ label: 'Undo the crop on every page', icon: 'crop', fn: () => cropUndo86(true) });
  return [...r, ...items]; };
IC.crop = IC.crop || '<path d="M6 2v16h16M2 6h16v16"/>';
HELP.push(['Cropping pages', ['Draw a rectangle around the part of the sheet you want to keep, then hold on it: Crop this page to the box, or Crop every page to the box (⋯ More › Crop pages… explains the same). The sheet keeps everything — a crop is a window — so ⋯ More › Undo the crop brings the full page back whenever you want. Markups move with the page, and a PDF saved while cropped opens cropped in other readers too.']]);
Object.assign(RDX, { CROP86, getPdfPage86: (pg) => getPdfPage(pg), cropPages86, cropFromBox86, cropUndo86, cropDialog86, cropOn86 });
