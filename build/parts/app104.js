/* ---------- FORMPAINT86 (iPad edition): an answer shows on the page the moment its field is left ----------
   Found Nov 24 2026 (Alexander, timesheet on the laptop): typing in a form field, then leaving it, showed the box as it was
   before — a new answer looked empty, a deleted answer still showed. The value was stored and saved correctly; only the
   picture of the page was old. Cause (in V85 since V60): after every page render the picture is kept in recentBase, and the
   next renderBase() for the same page takes that kept picture instead of drawing again. setField() asks for a redraw with
   renderBase(), so it got the old picture back. Reopening the document drew it fresh, which is why it went unnoticed.
   Fix: each page picture remembers which set of answers it was drawn with (the S.form[src] object is replaced on every
   change, so its identity is the stamp). A kept picture drawn with other answers is dropped before the render, and the
   quick preview of that page with it. Documents without filled fields have stamp 0 everywhere, so nothing changes for them. */
const FORMPAINT86 = true;
const fstMap86 = new WeakMap(); let fstSeq86 = 0;
function formStamp86(pg) { try { const o = pg && pg.src && S.form && S.form[pg.src]; if (!o || typeof o !== 'object') return 0; let n = fstMap86.get(o); if (!n) fstMap86.set(o, n = ++fstSeq86); return n; } catch (e) { return 0; } }
const renderBaseFp86 = renderBase; renderBase = async function () {
  if (!FORMPAINT86) return renderBaseFp86.apply(this, arguments);
  const pg = cur(); let st = 0;
  try { if (pg) { st = formStamp86(pg);
      for (let i = recentBase.length - 1; i >= 0; i--) { const r = recentBase[i], p = pageById(r.page); if (p && p.src && (r.fst86 || 0) !== formStamp86(p)) { recentBase.splice(i, 1); if (!(S.base && S.base.cv === r.cv)) { try { cvFree(r.cv); } catch (e) {} } } }
      if (S.base && S.base.page === pg.id && !S.base.preview && (S.base.fst86 || 0) !== st) { try { pvMem.delete(pvKey(pg)); } catch (e) {} } } } catch (e) { console.warn('formpaint', e); }
  const r = await renderBaseFp86.apply(this, arguments);
  try { if (pg && S.base && S.base.page === pg.id && !S.base.preview && S.base.fst86 == null) S.base.fst86 = st; } catch (e) {}
  return r; };
Object.assign(RDX, { FORMPAINT86, formStamp86, recentBase86: () => recentBase.map(r => ({ page: r.page, fst: r.fst86 })) });
