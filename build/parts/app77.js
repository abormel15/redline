/* ---------- PERSP86 (iPad edition): perspective guides ----------
   A Perspective tool in the Shapes group. Tap the sheet to drop a vanishing point (up to three per page); drag one to move it;
   tap one to remove it. Guide lines fan out from every vanishing point (and a horizon joins the first two), drawn on screen only,
   never into the PDF. With the tool active, dragging draws a straight line that runs exactly toward the nearest vanishing
   point. With Snap on, the Line, Arrow, Polyline, Polygon and measurement tools, and hold-to-straighten, lock onto a vanishing
   direction when the stroke is within about 6° of it. Vanishing points are saved with the document (pg.persp). Switch: PERSP86. */
const PERSP86 = true, PERSP_MAX = 3, PERSP_SNAP = 0.105; /* 6° */
const perspOf = pg => (pg && pg.persp && Array.isArray(pg.persp.vps) ? pg.persp.vps : []);
const perspShown = pg => !!(pg && pg.persp && pg.persp.show !== false && perspOf(pg).length);
function perspSet(pg, vps, show) { if (!pg) return; if (!vps.length) delete pg.persp; else pg.persp = { vps: vps.map(v => ({ x: +v.x.toFixed(2), y: +v.y.toFixed(2) })), show: show !== false }; changed(); }
/* the vanishing direction nearest to a→b, or null when none is within the snap angle (a, b in page units) */
function perspDir(a, b, pg, tol) { const vps = perspOf(pg || cur()); if (!vps.length) return null; const L = dist(a, b); if (L < 1e-6) return null; let best = null;
  for (const v of vps) { const d = dist(a, v); if (d < 1e-6) continue; const ux = (v.x - a.x) / d, uy = (v.y - a.y) / d, dot = ((b.x - a.x) * ux + (b.y - a.y) * uy) / L, ang = Math.acos(Math.max(-1, Math.min(1, Math.abs(dot))));
    if (ang <= (tol == null ? PERSP_SNAP : tol) && (!best || ang < best.ang)) best = { ang, ux: dot < 0 ? -ux : ux, uy: dot < 0 ? -uy : uy, t: Math.abs((b.x - a.x) * ux + (b.y - a.y) * uy), vp: v }; }
  return best; }
function perspProject(a, b, pg, tol) { const d = perspDir(a, b, pg, tol); return d ? { x: a.x + d.ux * d.t, y: a.y + d.uy * d.t } : null; }
/* snapping for the other tools: only with Snap on, only when the page has vanishing points */
const snapAngleV85p = snapAngle; snapAngle = function (a, b) { if (PERSP86 && S.snap && perspOf(cur()).length) { const q = perspProject(a, b); if (q) return q; } return snapAngleV85p.apply(this, arguments); };
const constrainV85p = constrain; constrain = function (a, b, on) { if (PERSP86 && S.snap && perspOf(cur()).length) { const q = perspProject(a, b); if (q) return q; } return constrainV85p.apply(this, arguments); };
/* guides, in screen pixels, after the page's own overlays */
const drawOverlaysV85p = drawOverlays; drawOverlays = function (pg, M) { const r = drawOverlaysV85p.apply(this, arguments); try { if (PERSP86 && perspShown(pg)) perspDraw(pg, M); } catch (e) { console.warn(e); } return r; };
function perspDraw(pg, M) { const vps = perspOf(pg), vs = vSize(pg), on = S.tool === 'persp'; const c = [{ x: 0, y: 0 }, { x: vs.w, y: 0 }, { x: vs.w, y: vs.h }, { x: 0, y: vs.h }].map(q => ap(M, q));
  const x0 = Math.min(...c.map(q => q.x)), x1 = Math.max(...c.map(q => q.x)), y0 = Math.min(...c.map(q => q.y)), y1 = Math.max(...c.map(q => q.y)); const R = Math.hypot(x1 - x0, y1 - y0) + 50;
  ctx.save(); ctx.beginPath(); ctx.rect(Math.max(0, x0), Math.max(0, y0), Math.min(W, x1) - Math.max(0, x0), Math.min(H, y1) - Math.max(0, y0)); ctx.clip();
  const col = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#007AFF';
  ctx.lineWidth = 1; ctx.strokeStyle = col; ctx.globalAlpha = on ? 0.42 : 0.26; ctx.setLineDash([]);
  const step = on ? Math.PI / 24 : Math.PI / 12; // 7.5° with the tool in hand, 15° otherwise
  for (const v of vps) { const s = ap(M, v); ctx.beginPath(); for (let a = 0; a < Math.PI; a += step) { const dx = Math.cos(a) * R, dy = Math.sin(a) * R; ctx.moveTo(s.x - dx, s.y - dy); ctx.lineTo(s.x + dx, s.y + dy); } ctx.stroke(); }
  if (vps.length >= 2) { const a = ap(M, vps[0]), b = ap(M, vps[1]), dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1; ctx.globalAlpha = on ? 0.85 : 0.5; ctx.lineWidth = 1.5; ctx.setLineDash([10, 6]); ctx.beginPath(); ctx.moveTo(a.x - dx / L * R, a.y - dy / L * R); ctx.lineTo(b.x + dx / L * R, b.y + dy / L * R); ctx.stroke(); ctx.setLineDash([]); }
  ctx.restore();
  // the points themselves, not clipped to the page (a vanishing point often sits off the sheet)
  ctx.save(); ctx.globalAlpha = 1; vps.forEach((v, i) => { const s = ap(M, v); ctx.beginPath(); ctx.arc(s.x, s.y, on ? 9 : 6, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
    if (on) { ctx.font = '600 11px ' + getComputedStyle(document.body).fontFamily; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), s.x, s.y + 0.5); } }); ctx.restore(); }
/* the tool: capture-phase handlers on the sheet, like the Artist panel's */
const PG = { g: null };
TOOLS.splice(TOOLS.findIndex(t => Array.isArray(t) && t[0] === 'polygon') + 1, 0, ['persp', 'Perspective: tap to drop vanishing points, drag to draw lines toward them; with Snap on, other lines lock to them too']);
IC.persp = '<path d="M3 7h18M3 17h18M12 4L4 20M12 4l8 16M12 4v16"/>';
HINTS.persp = 'Tap the sheet to drop a vanishing point (up to three). Drag to draw a line that runs straight to the nearest one. Drag a point to move it, tap it to remove it. Turn Snap on and the Line, Arrow and Polyline tools lock to the vanishing directions as well.';
function perspHitVp(s, pg) { const M = viewM(); let hit = null, hd = 24; perspOf(pg).forEach((v, i) => { const q = ap(M, v), d = Math.hypot(q.x - s.x, q.y - s.y); if (d < hd) { hd = d; hit = i; } }); return hit; }
(function perspHook() { const st = $('stage'); if (!st) return;
  st.addEventListener('pointerdown', e => { if (!PERSP86 || S.tool !== 'persp' || e.button > 0) return; if (!e.target || e.target.tagName !== 'CANVAS' || !st.contains(e.target)) return;
    if (e.pointerType === 'touch' && (S.penSeen || !S.fingerDraw)) return; /* fingers pan, as with the drawing tools */
    if (PG.g) return; e.stopPropagation(); e.preventDefault(); try { view.setPointerCapture(e.pointerId); } catch (err) {}
    const s = pos(e); if (S.scroll) { const en = layout().find(q => q.i !== S.cur && s.x >= q.x && s.x <= q.x + q.w && s.y >= q.y && s.y <= q.y + q.h); if (en) switchCur(en, true); }
    const pg = cur(), p = toPage(s.x, s.y), hit = perspHitVp(s, pg);
    PG.g = { id: e.pointerId, s0: s, p0: p, pg, moved: false, vp: hit, t0: performance.now() }; if (hit != null) { PG.g.orig = perspOf(pg).map(v => ({ ...v })); pushUndo(); PG.g.pushed = true; }
    requestDraw(); }, true);
  const move = e => { const g = PG.g; if (!g || e.pointerId !== g.id) return; e.stopPropagation(); const s = pos(e); if (!g.moved && Math.hypot(s.x - g.s0.x, s.y - g.s0.y) > 6) g.moved = true; if (!g.moved) return;
    const p = toPage(s.x, s.y);
    if (g.vp != null) { const vps = perspOf(g.pg).map(v => ({ ...v })); vps[g.vp] = { x: p.x, y: p.y }; g.pg.persp = { vps, show: g.pg.persp ? g.pg.persp.show !== false : true }; requestDraw(); return; }
    const q = perspOf(g.pg).length ? (perspProject(g.p0, p, g.pg, Math.PI) || p) : constrainV85p(g.p0, p, e.shiftKey || S.lock); S.draft = { type: 'line', pts: [{ x: g.p0.x, y: g.p0.y }, q], style: styleFor('line') }; requestDraw(); };
  const up = e => { const g = PG.g; if (!g || e.pointerId !== g.id) return; e.stopPropagation(); PG.g = null; try { view.releasePointerCapture(e.pointerId); } catch (err) {}
    const pg = g.pg;
    if (g.vp != null) { if (!g.moved) { if (g.pushed) { const sn = S.undo.pop(); void sn; } pushUndo(); const vps = perspOf(pg).filter((_, i) => i !== g.vp); perspSet(pg, vps, pg.persp && pg.persp.show); toast(vps.length ? 'Vanishing point removed' : 'Perspective guides cleared'); } else { changed(); } requestDraw(); return; }
    if (!g.moved) { const vps = perspOf(pg); if (vps.length >= PERSP_MAX) { toast(`Three vanishing points is the most. Tap one to remove it, or drag it.`); return; } pushUndo(); perspSet(pg, [...vps, { x: g.p0.x, y: g.p0.y }], true); toast(vps.length === 0 ? 'Vanishing point 1. Tap for a second, drag to draw lines toward it.' : `Vanishing point ${vps.length + 1}`); return; }
    const d = S.draft; S.draft = null; if (!d || dist(d.pts[0], d.pts[1]) * S.view.s < 4) { requestDraw(); return; }
    const m = newMarkup('line', [d.pts[0], d.pts[1]]); addMarkup(m, true, false); };
  view.addEventListener('pointermove', move, true); view.addEventListener('pointerup', up, true); view.addEventListener('pointercancel', e => { if (PG.g && e.pointerId === PG.g.id) { PG.g = null; S.draft = null; requestDraw(); } }, true); })();
/* the tool's property bar: show/hide guides and clear */
function perspItems() { const pg = cur(), vps = perspOf(pg); return [{ label: perspShown(pg) ? 'Hide the guides' : 'Show the guides', icon: 'layers', fn: () => { if (pg.persp) { pg.persp.show = !perspShown(pg); changed(); } } }, { label: 'Clear the vanishing points on this page', icon: 'trash', fn: () => { pushUndo(); perspSet(pg, [], true); toast('Perspective guides cleared'); } }, { label: 'Copy these vanishing points to every page', icon: 'copy', fn: () => { if (!vps.length) return toast('Drop a vanishing point first.'); pushUndo(); for (const q of S.pages) if (q !== pg) perspSet(q, vps.map(v => ({ ...v })), true); toast(`Copied to ${S.pages.length - 1} other page${S.pages.length === 2 ? '' : 's'}`); } }]; }
const ctxExtrasV85p = typeof ctxExtras === 'function' ? ctxExtras : null;
if (ctxExtrasV85p) ctxExtras = function (items, sm, one, s) { const r = ctxExtrasV85p.apply(this, arguments) || items; try { if (PERSP86 && !sm.length && perspOf(cur()).length) { r.push('-', { head: 'Perspective' }, ...perspItems()); } } catch (e) {} return r; };
HELP.push(['Perspective guides', ['The Perspective tool sits with the shapes. Tap the sheet to drop a vanishing point, up to three on a page; the guide lines fan out from each one and a horizon joins the first two. Drag a point to move it, tap it to remove it. The guides are on screen only; they never print or export.',
  'With the Perspective tool, dragging draws a line that runs exactly to the nearest vanishing point. With Snap on, the Line, Arrow, Polyline and Polygon tools and hold-to-straighten lock onto a vanishing direction whenever you are within about six degrees of it, so sketched edges land in perspective. Press and hold on the sheet for Hide the guides, Clear, or Copy these vanishing points to every page.']]);
Object.assign(RDX, { PERSP86, perspOf, perspSet, perspDir, perspProject, perspItems });
