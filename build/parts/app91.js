/* ---------- EDTX86 (iPad edition): "make the text editable" behaves on CAD PDFs ----------
   Many CAD PDFs carry a text layer whose font has no readable letters (SHX / subset fonts): the extracted strings are
   private-use codes that draw as nothing. V85 then covered every line with a white box and put an invisible text box on
   top — "blank boxes that do nothing". Now: lines whose text is unreadable are skipped and counted; if nothing is readable
   the user is told instead; each text box remembers its cover, so deleting the text box also removes the cover (and the
   original words show again); a text box with no text left behaves the same way. Switch: EDTX86. */
const EDTX86 = true;
const unreadable86 = s => { const t = (s || '').replace(/\s+/g, ''); if (!t) return true; let bad = 0; for (const ch of t) { const c = ch.codePointAt(0); if (c < 32 || (c >= 0xE000 && c <= 0xF8FF) || c === 0xFFFD || (c >= 0xF0000)) bad++; } return bad / t.length > 0.34; };
const lineToMarkupsE86 = lineToMarkups; lineToMarkups = function (L, smp, layer) { const r = lineToMarkupsE86.apply(this, arguments); try { if (EDTX86 && r && r[0] && r[1]) r[1].coverId = r[0].id; } catch (e) {} return r; };
const editAllTextE86 = editAllText; editAllText = async function () { if (!EDTX86) return editAllTextE86.apply(this, arguments); const pg = cur(); if (!pg) return; const its = await pageItems(pg).catch(() => []); if (!its.length) return noTextHelp();
  const all = textLines(its).slice(0, 3000); if (!all.length) return noTextHelp(); const lines = all.filter(L => !unreadable86(L.str)), skipped = all.length - lines.length;
  if (!lines.length) return noReadable86();
  pushUndo(); const cv = [], tx = [], smp = baseSample(pg); for (const L of lines) { const [c, t] = lineToMarkups(L, smp); cv.push(c); tx.push(t); } S.markups = [...cv, ...S.markups, ...tx]; changed();
  toast(`${lines.length} line${lines.length === 1 ? '' : 's'} of text can now be edited. Double-tap one to type.` + (skipped ? ` ${skipped} line${skipped === 1 ? '' : 's'} had no readable letters and ${skipped === 1 ? 'was' : 'were'} left alone.` : ''), 5200); };
function noReadable86() { const md = modal(`<h3>This text cannot be edited here</h3><p>The page has a text layer, but its font carries no readable letters (common with CAD exports), so there is nothing to put in a text box. You can still draw over it, cover it with a filled box, or add your own text on top.</p><div class="acts"><button class="btn solid" id="etOk">OK</button></div>`); md.querySelector('#etOk').onclick = md.close; }
const editTextAtE86 = editTextAt; editTextAt = async function (p) { if (!EDTX86) return editTextAtE86.apply(this, arguments); const pg = cur(); if (!pg) return; const hm = topHit(p); if (hm && hm.type === 'text' && editable(hm)) return startEdit(hm);
  const its = await pageItems(pg).catch(() => []); if (!its.length) return noTextHelp(); const L = lineAt(textLines(its), p); if (!L) return toast('Tap right on the words you want to change.', 2200); if (unreadable86(L.str)) return noReadable86();
  const [cover, txt] = lineToMarkups(L, baseSample(pg)); pushUndo(); S.markups.unshift(cover); S.markups.push(txt); S.sel = new Set([txt.id]); changed(); startEdit(txt); };
/* deleting a text box takes its cover with it */
const deleteSelE86 = deleteSel; deleteSel = function () { if (!EDTX86 || !S.sel.size) return deleteSelE86.apply(this, arguments); const covers = new Set(selMarkups().filter(m => m.coverId).map(m => m.coverId)); if (!covers.size) return deleteSelE86.apply(this, arguments);
  const gone = new Set(selMarkups().filter(editable).map(m => m.id)); if (!gone.size) return toast('That markup is locked. Unlock it from its menu first.'); pushUndo(); S.markups = S.markups.filter(m => !gone.has(m.id) && !(covers.has(m.id) && m.cover)); S.sel.clear(); changed(); };
HELP.push(['Editing the drawing’s own text', ['Hold on the page, "Make all the text on this page editable", or double-tap a line with the Edit text tool. Lines whose font has no readable letters (some CAD exports) are left alone and counted in the message. Deleting an editable text box also removes the white cover under it, so the original words show again.']]);
Object.assign(RDX, { EDTX86, unreadable86, editAllText86: () => editAllText(), deleteSel86: () => deleteSel() });
