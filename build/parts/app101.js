/* ---------- EDTXLEAN86 (iPad edition): editing the drawing's text without filling the file with boxes ----------
   "Make all the text on this page editable" turned every line into a white cover plus a text box — hundreds of markups
   on a busy sheet, all of them saved into the PDF even though most were never touched. Now it asks first, and tapping
   the lines you actually want is the default: the Edit text tool turns one line at a time into a box (V85 already does
   that on tap), so nothing is created until you edit something. The old all-at-once way is still there, with the count
   and a word about size, and "Clean up the text boxes you never changed" removes untouched pairs from a sheet that was
   already converted. */
const EDTXLEAN86 = true;
/* a cover and the text box written over it. Boxes made since 86.51 name their cover (coverId); older ones are matched by
   place: the text box whose middle sits on the cover. A cover with no text box left on it is "blank". */
const edtxCovers86 = (pgId) => { const out = [], texts = S.markups.filter(m => m.type === 'text' && (pgId == null || m.page === pgId)), used = new Set();
  for (const c of S.markups) { if (!c.cover || c.type !== 'rect' || (pgId != null && c.page !== pgId)) continue;
    let t = texts.find(m => m.coverId === c.id && !used.has(m.id));
    if (!t) { const b = box(c), cx = b.x + b.w / 2, cy = b.y + b.h / 2; let best = null, bd = Infinity; for (const m of texts) { if (used.has(m.id) || m.page !== c.page || (m.coverId && m.coverId !== c.id)) continue; const tb = box(m), mx = tb.x + tb.w / 2, my = tb.y + tb.h / 2; if (Math.abs(my - cy) > b.h * 0.9 || mx < b.x - b.w * 0.25 || mx > b.x + b.w * 1.25) continue; const d = Math.hypot(mx - cx, my - cy); if (d < bd) { bd = d; best = m; } } t = best; }
    if (t) used.add(t.id); out.push({ cover: c, txt: t || null }); } return out; };
const edtxPairs86 = () => edtxCovers86(null).filter(p => p.txt);
const edtxUnchanged86 = () => edtxPairs86().filter(p => p.txt.orig86 != null && p.txt.text === p.txt.orig86);
/* remember what the line said, so an untouched box can be told from an edited one */
const lineToMarkupsL86 = lineToMarkups; lineToMarkups = function (L, smp, layer) { const r = lineToMarkupsL86.apply(this, arguments); try { if (EDTXLEAN86 && r && r[1] && L) r[1].orig86 = L.str; } catch (e) {} return r; };
/* what could go from a page: text boxes that still say what the drawing says, blank covers, empty form boxes Redline found */
async function edtxSurvey86(pg) { const res = { pg, unch: [], blank: [], form: [] };
  const cs = edtxCovers86(pg.id); let lines = null; const need = cs.some(p => p.txt && p.txt.orig86 == null);
  if (need && pg.src) { try { lines = textLines(await pageItems(pg)); } catch (e) { lines = []; } }
  const norm = t => String(t || '').replace(/\s+/g, ' ').trim();
  for (const p of cs) { if (!p.txt) { res.blank.push(p); continue; } if (!norm(p.txt.text)) continue; /* text wiped on purpose: a white-out, leave it */
    if (p.txt.orig86 != null) { if (p.txt.text === p.txt.orig86) res.unch.push(p); continue; }
    const b = box(p.cover), cy = b.y + b.h / 2; const L = (lines || []).find(q => norm(q.str) === norm(p.txt.text) && Math.abs(q.a.y - cy) < b.h * 1.5 && q.a.x > b.x - b.w * 0.5 && q.a.x < b.x + b.w); if (L) res.unch.push(p); }
  try { const key = pg.src + ':' + pg.n, det = (S.det86 && S.det86[key]) || [], vals = (S.form && S.form[pg.src]) || {}; for (const f of det) { const v = vals[f.id]; if ((v == null || v === '' || v === false) && !f.added86) res.form.push(f); } } catch (e) {}
  return res; }
async function edtxClean86(quiet, opts) { opts = Object.assign({ all: false, unch: true, blank: false, form: false }, opts || {});
  const pgs = opts.all ? S.pages : [cur()]; const gone = new Set(); let nU = 0, nB = 0, nF = 0; const formCuts = [];
  for (const pg of pgs) { if (!pg) continue; const sv = await edtxSurvey86(pg);
    if (opts.unch) for (const p of sv.unch) { gone.add(p.txt.id); gone.add(p.cover.id); nU++; }
    if (opts.blank) for (const p of sv.blank) { gone.add(p.cover.id); nB++; }
    if (opts.form && sv.form.length) { formCuts.push([pg, new Set(sv.form.map(f => f.id))]); nF += sv.form.length; } }
  if (!nU && !nB && !nF) { if (!quiet) toast('Nothing to clean up ' + (opts.all ? 'in this document.' : 'on this page.'), 2600); return 0; }
  pushUndo(); if (gone.size) { S.markups = S.markups.filter(m => !gone.has(m.id)); S.sel.clear(); }
  for (const [pg, ids] of formCuts) { const key = pg.src + ':' + pg.n; S.det86 = { ...S.det86, [key]: (S.det86[key] || []).filter(f => !ids.has(f.id)) }; if (!S.det86[key].length) delete S.det86[key]; formCache.delete(key); S.nb.delete(pg.id); }
  S.dirty = true; changed(); if (formCuts.length) { S.detail = null; renderBase(); } persistSoon();
  if (!quiet) { const bits = []; if (nU) bits.push(nU + ' unchanged text box' + (nU === 1 ? '' : 'es')); if (nB) bits.push(nB + ' blank cover' + (nB === 1 ? '' : 's')); if (nF) bits.push(nF + ' empty form box' + (nF === 1 ? '' : 'es')); toast('Removed ' + bits.join(', ') + '. Undo brings them back.', 3800); }
  return nU + nB + nF; }
/* the dialog: always in ⋯ More, says what it found before anything goes */
async function edtxCleanDialog86() { const pg = cur(); if (!pg) return; busy('Looking through the pages…');
  let here, all; try { here = await edtxSurvey86(pg); all = { unch: 0, blank: 0, form: 0 }; for (const q of S.pages) { const sv = q === pg ? here : await edtxSurvey86(q); all.unch += sv.unch.length; all.blank += sv.blank.length; all.form += sv.form.length; } } finally { busy(null); }
  const H = { unch: here.unch.length, blank: here.blank.length, form: here.form.length }, tot = all.unch + all.blank + all.form;
  const row = (id, label, note, h, a, on) => `<label style="display:flex;gap:10px;align-items:flex-start;padding:8px 2px;${a ? '' : 'opacity:.5'}"><input type="checkbox" id="${id}" ${a && on ? 'checked' : ''} ${a ? '' : 'disabled'} style="margin-top:4px"><span><b>${label}</b> — ${h} on this page, ${a} in the document<br><span class="muted" style="font-size:14px">${note}</span></span></label>`;
  const md = modal(`<h3>Clean up boxes you never used</h3>${tot ? '<p class="muted" style="margin-top:0">These sit on top of the drawing without changing it. Taking them off brings the drawing’s own text back and keeps the saved PDF small. Undo puts them back.</p>' : '<p>Nothing to clean up: this document has no unchanged text boxes, blank covers or empty form boxes.</p><p class="muted">They come from “Make all the text on this page editable” (a white cover and a text box for every line) and from “Fill out this form” (a box for every blank Redline finds).</p>'}
    ${tot ? row('ecU', 'Text boxes you never changed', 'Each is a white cover with a copy of the line on it, still saying exactly what the drawing says.', H.unch, all.unch, true) + row('ecB', 'Blank covers', 'A white cover with no text box left on it. Untick this if you blanked a line on purpose.', H.blank, all.blank, true) + row('ecF', 'Empty form boxes', 'Boxes Redline found on a form that you never filled in (ones you added by hand stay).', H.form, all.form, true) : ''}
    <div class="acts"><button class="btn line" id="ecCancel">${tot ? 'Cancel' : 'Close'}</button>${tot ? `<button class="btn line" id="ecPage" ${H.unch + H.blank + H.form ? '' : 'disabled'}>This page</button><button class="btn solid" id="ecAll">Whole document</button>` : ''}</div>`);
  md.querySelector('#ecCancel').onclick = md.close; if (!tot) return md;
  const go = (allPages) => { const o = { all: allPages, unch: md.querySelector('#ecU').checked, blank: md.querySelector('#ecB').checked, form: md.querySelector('#ecF').checked }; md.close(); edtxClean86(false, o); };
  md.querySelector('#ecPage').onclick = () => go(false); md.querySelector('#ecAll').onclick = () => go(true); return md; }
const editAllTextL86 = editAllText; editAllText = async function () {
  if (!EDTXLEAN86) return editAllTextL86.apply(this, arguments);
  const pg = cur(); if (!pg) return; let n = 0; try { const its = await pageItems(pg); n = textLines(its).filter(L => !unreadable86(L.str)).length; } catch (e) {}
  const un = edtxUnchanged86().length;
  const md = modal(`<h3>Edit the drawing’s own text</h3><p>${n ? n + ' line' + (n === 1 ? '' : 's') + ' of text can be edited on this page.' : 'This page has text that can be edited.'}</p>
    <p class="muted">Tapping the lines you want is lighter: each line becomes a box only when you edit it, so the file stays small. Turning them all into boxes at once puts ${n || 'a'} cover${n === 1 ? '' : 's'} and ${n === 1 ? 'a box' : n + ' boxes'} on the page, and every one of them is written into the PDF you save.</p>
    <div class="acts">${un ? `<button class="btn line" id="etClean">Clean up ${un} unchanged</button>` : ''}<button class="btn line" id="etAll">Turn them all into boxes</button><button class="btn solid" id="etTap">Tap the lines I want</button></div>`);
  md.querySelector('#etTap').onclick = () => { md.close(); setTool('edittext'); toast('Tap a line of the drawing’s text to edit it. Only the lines you tap become boxes.', 4200); };
  md.querySelector('#etAll').onclick = () => { md.close(); editAllTextL86.call(this); };
  const c = md.querySelector('#etClean'); if (c) c.onclick = () => { md.close(); edtxCleanDialog86(); };
};
/* always there while a document is open, so it can be found; the dialog says what (if anything) there is to remove */
const extraItemsEt86 = extraItems86; extraItems86 = function (where) { const r = extraItemsEt86.apply(this, arguments) || []; if (!EDTXLEAN86 || where !== 'doc' || !S.pages.length) return r;
  let note = 'unchanged text boxes, blank covers, empty form boxes'; try { const pg = cur(), n = edtxCovers86(pg.id).length + (((S.det86 || {})[pg.src + ':' + pg.n]) || []).length; if (n) note = n + ' box' + (n === 1 ? '' : 'es') + ' on this page to check'; } catch (e) {}
  return [...r, { label: 'Clean up the text boxes you never changed…', note, icon: 'eraser', fn: () => edtxCleanDialog86() }]; };
/* and where the boxes are: hold on a page that has any */
const ctxExtrasEt86 = ctxExtras; ctxExtras = function (items, sm, one, s) { const r = ctxExtrasEt86.apply(this, arguments); try { if (!EDTXLEAN86 || (sm && sm.length)) return r; const pg = cur(); if (!pg) return r; const n = edtxCovers86(pg.id).length + (((S.det86 || {})[pg.src + ':' + pg.n]) || []).length; if (n) items.push('-', { label: 'Clean up boxes you never used…', note: n + ' on this page to check', icon: 'eraser', fn: () => edtxCleanDialog86() }); } catch (e) {} return r; };
HELP.push(['Keeping the file small while editing text', ['"Make all the text on this page editable" now asks first. Tapping the lines you want is the light way: with the Edit text tool, a line becomes a box only when you edit it. Turning them all into boxes at once still works, but every cover and box is written into the PDF you save, which is what makes a converted sheet grow. ⋯ More › "Clean up the text boxes you never changed…" is always there while a document is open: it counts the unchanged text boxes, blank covers and empty form boxes on the page and in the whole document, and removes the ones you tick. Holding on a page that has any offers the same.']]);
Object.assign(RDX, { EDTXLEAN86, edtxClean86, edtxPairs86, edtxUnchanged86, edtxCovers86, edtxSurvey86, edtxCleanDialog86 });
