/* ---------- THUMBFIT86 (iPad edition): Pages panel thumbnails grow with the panel and flow into columns ----------
   Asked Nov 24 2026 (video, laptop): dragging the Pages panel wider left the thumbnails at one fixed size in one column,
   with empty space beside them. Now the list is a grid: each thumbnail fills its column, a column is never narrower than
   140px, and when the panel is wide enough for two (three, four…) columns the thumbnails shift into them.
   - Pictures are redrawn sharper when a thumbnail has grown past its bitmap (from the page preview already kept, so it is cheap).
   - Compact list (names only) is unchanged. Group headings and other full-width rows span every column.
   - Drag to reorder: with more than one column the drop place is found in two directions (see patches.py, THUMBFIT86),
     and the marker is a bar standing between the two thumbnails the page will land between. With one column it works exactly as before.
   The same on the computer (drag the panel edge with the mouse) and the iPad (drag it with a finger or the Pencil). */
const THUMBFIT86 = true;
try { const st = document.createElement('style'); st.id = 'thumbfit86'; st.textContent = `
#thumbs.fit86:not(.compact){display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));align-items:start;justify-items:stretch;gap:10px}
#thumbs.fit86:not(.compact) .thumb{width:100%;min-width:0;box-sizing:border-box}
#thumbs.fit86:not(.compact) .thumb canvas{width:100%!important;height:auto!important;max-width:none}
#thumbs.fit86:not(.compact) .thumb span{max-width:100%;overflow-wrap:anywhere;text-align:center}
#thumbs.fit86:not(.compact)>:not(.thumb):not(.pgins){grid-column:1/-1}
#thumbs.fit86:not(.compact):not(.cols86) .pgins{grid-column:1/-1}
#thumbs.fit86{position:relative}
#thumbs.fit86.cols86:not(.compact) .pgins{position:absolute;margin:0;width:6px;height:60px;border-radius:3px;background:var(--accent);box-shadow:0 0 0 3px var(--accent-soft);z-index:3;pointer-events:none}
#thumbs.fit86.cols86:not(.compact) .pgins::before,#thumbs.fit86.cols86:not(.compact) .pgins::after{display:none}
@media (any-pointer: coarse){#pagesPanel .rsz{width:24px;right:0}#pagesPanel .rsz::after{left:11px;width:3px;height:44px;margin-top:-22px;background:var(--muted,#888);opacity:.6}#thumbs.fit86{padding-right:28px}}
`; document.head.appendChild(st); } catch (e) {}
/* (the last rule: on a touch screen the panel edge was a 10px strip half hidden under the sheet, too thin for a finger. There it is a
   24px strip inside the panel with a visible grip, and the thumbnails keep clear of it.) */
/* several columns: the drop marker is taken out of the grid and stood between the two thumbnails the page will land between */
window.__rdPgIns86 = function (box, line, before, list, y) { if (!line) return; if (!THUMBFIT86 || !box.classList.contains('cols86') || box.classList.contains('compact')) { if (line.style.cssText) line.style.cssText = ''; return; }
  const br = box.getBoundingClientRect(); let r, right = false; const i = before ? list.indexOf(before) : list.length;
  if (before) { r = before.getBoundingClientRect(); if (i > 0 && y < r.top - 2) { r = list[i - 1].getBoundingClientRect(); right = true; } } /* pointer still in the row above: show it at the end of that row */
  else if (list.length) { r = list[list.length - 1].getBoundingClientRect(); right = true; } else return;
  line.style.left = Math.round((right ? r.right + 5 : r.left - 5) - br.left - 3) + 'px'; line.style.top = Math.round(r.top - br.top) + 'px'; line.style.height = Math.round(r.height) + 'px'; };
let thumbFitT86 = 0;
function thumbCols86() { const box = $('thumbs'); try { if (!box || box.classList.contains('compact') || !box.classList.contains('fit86')) return 1; return getComputedStyle(box).gridTemplateColumns.split(' ').filter(Boolean).length || 1; } catch (e) { return 1; } }
function thumbFit86() { const box = $('thumbs'); if (!box) return; box.classList.toggle('fit86', THUMBFIT86); if (!THUMBFIT86 || $('pagesPanel').hidden || box.classList.contains('compact')) { box.classList.remove('cols86'); return; }
  box.classList.toggle('cols86', thumbCols86() > 1);
  const dpr = Math.min(2, window.devicePixelRatio || 1); /* a thumbnail that outgrew (or far undershot) its bitmap is drawn again at its new size */
  for (const b of box.querySelectorAll('.thumb')) { if (b.hidden || !b.dataset.done || !thumbOnScreen(b)) continue; const c = b.querySelector('canvas'); if (!c || !c.clientWidth) continue; const want = Math.round(c.clientWidth * dpr); if (want > c.width * 1.15 || want < c.width * 0.55) { try { thumbRefresh(b.dataset.id); } catch (e) {} } } }
function thumbFitSoon86(ms) { clearTimeout(thumbFitT86); thumbFitT86 = setTimeout(thumbFit86, ms == null ? 140 : ms); }
/* the bitmap follows the size on screen (capped at the 900px preview it is drawn from) */
const thumbDrawFit86 = thumbDraw; thumbDraw = function (btn, pg, img) {
  try { const box = $('thumbs'), c = btn && btn.querySelector('canvas'); if (THUMBFIT86 && c && c.isConnected && pg && box.classList.contains('fit86') && !box.classList.contains('compact') && c.clientWidth > 0) { const dpr = Math.min(2, window.devicePixelRatio || 1), want = clamp(Math.round(c.clientWidth * dpr), 120, 900), vs = vSize(pg); if (Math.abs(want - c.width) > c.width * 0.12) { c.width = want; c.height = Math.max(20, Math.round(want * vs.h / vs.w)); } } } catch (e) {}
  return thumbDrawFit86.apply(this, arguments); };
const buildThumbsFit86 = buildThumbs; buildThumbs = function () { try { $('thumbs').classList.toggle('fit86', THUMBFIT86); } catch (e) {} const r = buildThumbsFit86.apply(this, arguments); thumbFitSoon86(60); return r; };
const thumbsVisibleFit86 = thumbsVisible; thumbsVisible = function () { const r = thumbsVisibleFit86.apply(this, arguments); thumbFitSoon86(200); return r; };
try { $('thumbs').classList.toggle('fit86', THUMBFIT86); const sc = $('thumbs').parentElement; new ResizeObserver(() => { const box = $('thumbs'); if (THUMBFIT86 && !box.classList.contains('compact')) box.classList.toggle('cols86', thumbCols86() > 1); thumbFitSoon86(160); try { thumbsVisibleFit86(); } catch (e) {} }).observe(sc); } catch (e) {}
HELP.push(['Bigger thumbnails in the Pages panel', ['Drag the edge of the Pages panel to make it wider: the thumbnails grow to fill it, and when there is room they shift into two or more columns. Drag it narrower to go back to one column. Dragging a thumbnail to reorder pages works in every layout.']]);
Object.assign(RDX, { THUMBFIT86, thumbFit86, thumbCols86 });
