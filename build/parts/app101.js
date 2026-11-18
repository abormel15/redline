/* ---------- EDTXLEAN86 (iPad edition): editing the drawing's text without filling the file with boxes ----------
   "Make all the text on this page editable" turned every line into a white cover plus a text box — hundreds of markups
   on a busy sheet, all of them saved into the PDF even though most were never touched. Now it asks first, and tapping
   the lines you actually want is the default: the Edit text tool turns one line at a time into a box (V85 already does
   that on tap), so nothing is created until you edit something. The old all-at-once way is still there, with the count
   and a word about size, and "Clean up the text boxes you never changed" removes untouched pairs from a sheet that was
   already converted. */
const EDTXLEAN86 = true;
const edtxPairs86 = () => { const covers = new Map(); for (const m of S.markups) if (m.cover) covers.set(m.id, m); const out = [];
  for (const m of S.markups) { if (m.type !== 'text' || !m.coverId) continue; const c = covers.get(m.coverId); if (c) out.push({ txt: m, cover: c }); } return out; };
const edtxUnchanged86 = () => edtxPairs86().filter(p => p.txt.orig86 != null ? p.txt.text === p.txt.orig86 : false);
/* remember what the line said, so an untouched box can be told from an edited one */
const lineToMarkupsL86 = lineToMarkups; lineToMarkups = function (L, smp, layer) { const r = lineToMarkupsL86.apply(this, arguments); try { if (EDTXLEAN86 && r && r[1] && L) r[1].orig86 = L.str; } catch (e) {} return r; };
async function edtxClean86(quiet) {
  const pg = cur(); let pairs = edtxUnchanged86().filter(p => p.txt.page === pg.id);
  /* boxes made before this build carry no record of the original line, so compare them with the page's own text */
  const older = edtxPairs86().filter(p => p.txt.page === pg.id && p.txt.orig86 == null);
  if (older.length) { try { const its = await pageItems(pg); const lines = textLines(its); const seen = new Set(pairs.map(p => p.txt.id));
      for (const p of older) { const b = box(p.txt), c = { x: (b.x + b.x + b.w) / 2, y: (b.y + b.y + b.h) / 2 };
        const L = lines.find(q => q.str === p.txt.text && Math.abs((q.a.y) - c.y) < b.h * 1.4 && q.a.x > b.x - b.w && q.a.x < b.x + b.w * 2);
        if (L && !seen.has(p.txt.id)) pairs.push(p); } } catch (e) { console.warn(e); } }
  if (!pairs.length) { if (!quiet) toast('Nothing to clean up here: every editable text box on this page has been changed.', 3000); return 0; }
  const gone = new Set(); for (const p of pairs) { gone.add(p.txt.id); gone.add(p.cover.id); }
  pushUndo(); S.markups = S.markups.filter(m => !gone.has(m.id)); S.sel.clear(); changed();
  if (!quiet) toast('Removed ' + pairs.length + ' text box' + (pairs.length === 1 ? '' : 'es') + ' you never changed. The drawing’s own words show again.', 3600);
  return pairs.length;
}
const editAllTextL86 = editAllText; editAllText = async function () {
  if (!EDTXLEAN86) return editAllTextL86.apply(this, arguments);
  const pg = cur(); if (!pg) return; let n = 0; try { const its = await pageItems(pg); n = textLines(its).filter(L => !unreadable86(L.str)).length; } catch (e) {}
  const un = edtxUnchanged86().length;
  const md = modal(`<h3>Edit the drawing’s own text</h3><p>${n ? n + ' line' + (n === 1 ? '' : 's') + ' of text can be edited on this page.' : 'This page has text that can be edited.'}</p>
    <p class="muted">Tapping the lines you want is lighter: each line becomes a box only when you edit it, so the file stays small. Turning them all into boxes at once puts ${n || 'a'} cover${n === 1 ? '' : 's'} and ${n === 1 ? 'a box' : n + ' boxes'} on the page, and every one of them is written into the PDF you save.</p>
    <div class="acts">${un ? `<button class="btn line" id="etClean">Clean up ${un} unchanged</button>` : ''}<button class="btn line" id="etAll">Turn them all into boxes</button><button class="btn solid" id="etTap">Tap the lines I want</button></div>`);
  md.querySelector('#etTap').onclick = () => { md.close(); setTool('edittext'); toast('Tap a line of the drawing’s text to edit it. Only the lines you tap become boxes.', 4200); };
  md.querySelector('#etAll').onclick = () => { md.close(); editAllTextL86.call(this); };
  const c = md.querySelector('#etClean'); if (c) c.onclick = () => { md.close(); edtxClean86(); };
};
const extraItemsEt86 = extraItems86; extraItems86 = function (where) { const r = extraItemsEt86.apply(this, arguments) || []; if (!EDTXLEAN86 || where !== 'doc') return r;
  try { const un = edtxUnchanged86().filter(p => p.txt.page === cur().id).length, any = edtxPairs86().filter(p => p.txt.page === cur().id).length;
    if (any) return [...r, { label: 'Clean up the text boxes you never changed', note: un ? un + ' on this page' : 'checks this page against the drawing', icon: 'eraser', fn: () => edtxClean86() }]; } catch (e) {}
  return r; };
HELP.push(['Keeping the file small while editing text', ['"Make all the text on this page editable" now asks first. Tapping the lines you want is the light way: with the Edit text tool, a line becomes a box only when you edit it. Turning them all into boxes at once still works, but every cover and box is written into the PDF you save, which is what makes a converted sheet grow. ⋯ More › "Clean up the text boxes you never changed" removes the untouched ones again.']]);
Object.assign(RDX, { EDTXLEAN86, edtxClean86, edtxPairs86, edtxUnchanged86 });
