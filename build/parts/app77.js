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
/* follow the guides: the nearest guide direction from a, with no angle limit — rays to the vanishing points, plumb, and level when
   there are fewer than two points */
S.perspAssist = !!store.get('perspAssist', false);
const assistOn = () => PERSP86 && S.perspAssist && perspOf(cur()).length > 0;
function perspDirs(a, pg) { const vps = perspOf(pg || cur()), out = []; for (const v of vps) { const d = dist(a, v); if (d > 1e-6) out.push({ ux: (v.x - a.x) / d, uy: (v.y - a.y) / d, vp: v }); } out.push({ ux: 0, uy: 1, plumb: true }); if (vps.length < 2) out.push({ ux: 1, uy: 0, level: true }); return out; }
function perspLock(a, b, pg) { const L = dist(a, b); if (L < 1e-6) return { x: b.x, y: b.y }; let best = null; for (const d of perspDirs(a, pg)) { const dot = ((b.x - a.x) * d.ux + (b.y - a.y) * d.uy) / L, ang = Math.acos(Math.max(-1, Math.min(1, Math.abs(dot)))); if (!best || ang < best.ang) best = { ang, d, t: (b.x - a.x) * d.ux + (b.y - a.y) * d.uy }; } return { x: a.x + best.d.ux * best.t, y: a.y + best.d.uy * best.t, dir: best.d }; }
/* line-type tools: every dragged line follows the guides while the switch is on */
const snapAngleV85p = snapAngle; snapAngle = function (a, b) { if (assistOn()) return perspLock(a, b); return snapAngleV85p.apply(this, arguments); };
const constrainV85p = constrain; constrain = function (a, b, on) { if (assistOn()) return perspLock(a, b); return constrainV85p.apply(this, arguments); };
/* pen and highlighter strokes: the direction is chosen from the first few points and the whole stroke stays on that line */
const penPtV85p = penPt; penPt = function (g, p, e, v) { if (assistOn() && !g.snap) {
    if (g.pdir) { const a = g.pa, d = g.pdir, t = (p.x - a.x) * d.ux + (p.y - a.y) * d.uy; p = { x: a.x + d.ux * t, y: a.y + d.uy * t }; } /* also the last point, which strokeEnd adds after clearing the draft */
    else if (S.draft && S.draft.pts && S.draft.pts.length) { const a = S.draft.pts[0];
      if (dist(a, p) * S.view.s >= 20) { /* free for the first 20 px, then the direction is read from start to here and the first points are laid on it */
        g.pa = { x: a.x, y: a.y }; g.pdir = perspLock(a, p).dir; const d = g.pdir; for (const q of S.draft.pts) { const t = (q.x - a.x) * d.ux + (q.y - a.y) * d.uy; q.x = a.x + d.ux * t; q.y = a.y + d.uy * t; } try { inkRedraw(g); } catch (er) {}
        const t = (p.x - a.x) * d.ux + (p.y - a.y) * d.uy; p = { x: a.x + d.ux * t, y: a.y + d.uy * t }; } } }
  return penPtV85p.call(this, g, p, e, v); };
/* guides, in screen pixels, after the page's own overlays */
const drawOverlaysV85p = drawOverlays; drawOverlays = function (pg, M) { const r = drawOverlaysV85p.apply(this, arguments); try { if (PERSP86 && perspShown(pg)) perspDraw(pg, M); } catch (e) { console.warn(e); } return r; };
function perspDraw(pg, M) { const vps = perspOf(pg), vs = vSize(pg), on = S.tool === 'persp'; const c = [{ x: 0, y: 0 }, { x: vs.w, y: 0 }, { x: vs.w, y: vs.h }, { x: 0, y: vs.h }].map(q => ap(M, q));
  const x0 = Math.min(...c.map(q => q.x)), x1 = Math.max(...c.map(q => q.x)), y0 = Math.min(...c.map(q => q.y)), y1 = Math.max(...c.map(q => q.y)); const R = Math.hypot(x1 - x0, y1 - y0) + 50;
  ctx.save(); ctx.beginPath(); ctx.rect(Math.max(0, x0), Math.max(0, y0), Math.min(W, x1) - Math.max(0, x0), Math.min(H, y1) - Math.max(0, y0)); ctx.clip();
  const col = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#007AFF';
  ctx.lineWidth = 1; ctx.strokeStyle = col; ctx.globalAlpha = on ? 0.4 : 0.3; ctx.setLineDash([]);
  const step = Math.PI / 18; // every 10°, the same with any tool
  for (const v of vps) { const s = ap(M, v); ctx.beginPath(); for (let a = 0; a < Math.PI; a += step) { const dx = Math.cos(a) * R, dy = Math.sin(a) * R; ctx.moveTo(s.x - dx, s.y - dy); ctx.lineTo(s.x + dx, s.y + dy); } ctx.stroke(); }
  if (vps.length >= 2) { const a = ap(M, vps[0]), b = ap(M, vps[1]), dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1; ctx.globalAlpha = on ? 0.85 : 0.5; ctx.lineWidth = 1.5; ctx.setLineDash([10, 6]); ctx.beginPath(); ctx.moveTo(a.x - dx / L * R, a.y - dy / L * R); ctx.lineTo(b.x + dx / L * R, b.y + dy / L * R); ctx.stroke(); ctx.setLineDash([]); }
  ctx.restore();
  // the points themselves, not clipped to the page (a vanishing point often sits off the sheet)
  ctx.save(); ctx.globalAlpha = 1; vps.forEach((v, i) => { const s = ap(M, v); ctx.beginPath(); ctx.arc(s.x, s.y, on ? 9 : 6, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
    if (on) { ctx.font = '600 11px ' + getComputedStyle(document.body).fontFamily; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), s.x, s.y + 0.5); } }); ctx.restore(); }
/* the tool: capture-phase handlers on the sheet, like the Artist panel's */
const PG = { g: null };
TOOLS.splice(TOOLS.findIndex(t => Array.isArray(t) && t[0] === 'polygon') + 1, 0, ['persp', 'Perspective: tap to drop vanishing points, drag to draw lines toward them; Guides in the bar makes every stroke follow them']);
IC.persp = '<path d="M3 7h18M3 17h18M12 4L4 20M12 4l8 16M12 4v16"/>';
HINTS.persp = 'Tap the sheet to drop a vanishing point (up to three). Drag to draw a line that runs straight to the nearest one. Drag a point to move it, tap it to remove it. Guides, in the bar above, makes every pen, highlighter, line and arrow stroke follow the nearest guide; turn it off to draw freely.';
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
    const q = perspOf(g.pg).length ? perspLock(g.p0, p, g.pg) : constrainV85p(g.p0, p, e.shiftKey || S.lock); S.draft = { type: 'line', pts: [{ x: g.p0.x, y: g.p0.y }, q], style: styleFor('line') }; requestDraw(); };
  const up = e => { const g = PG.g; if (!g || e.pointerId !== g.id) return; e.stopPropagation(); PG.g = null; try { view.releasePointerCapture(e.pointerId); } catch (err) {}
    const pg = g.pg;
    if (g.vp != null) { if (!g.moved) { if (g.pushed) { const sn = S.undo.pop(); void sn; } pushUndo(); const vps = perspOf(pg).filter((_, i) => i !== g.vp); perspSet(pg, vps, pg.persp && pg.persp.show); toast(vps.length ? 'Vanishing point removed' : 'Perspective guides cleared'); } else { changed(); } requestDraw(); return; }
    if (!g.moved) { const vps = perspOf(pg); if (vps.length >= PERSP_MAX) { toast(`Three vanishing points is the most. Tap one to remove it, or drag it.`); return; } pushUndo(); perspSet(pg, [...vps, { x: g.p0.x, y: g.p0.y }], true); toast(vps.length === 0 ? 'Vanishing point 1. Tap for a second. Turn on Guides in the bar above and every stroke follows them.' : `Vanishing point ${vps.length + 1}`, 4500); return; }
    const d = S.draft; S.draft = null; if (!d || dist(d.pts[0], d.pts[1]) * S.view.s < 4) { requestDraw(); return; }
    const m = newMarkup('line', [d.pts[0], d.pts[1]]); addMarkup(m, true, false); };
  view.addEventListener('pointermove', move, true); view.addEventListener('pointerup', up, true); view.addEventListener('pointercancel', e => { if (PG.g && e.pointerId === PG.g.id) { PG.g = null; S.draft = null; requestDraw(); } }, true); })();
/* the Guides switch in the property bar, shown whenever the page has vanishing points */
(function perspBtn() { const sn = $('bSnap'); if (!sn || $('bPerspA')) return; const b = document.createElement('button'); b.className = 'btn line'; b.id = 'bPerspA'; b.hidden = true; b.setAttribute('aria-pressed', S.perspAssist ? 'true' : 'false'); b.title = 'Follow the perspective guides: pen, highlighter, line and arrow strokes lock to the nearest guide. Off: draw freely.'; b.innerHTML = '<span>Guides</span>';
  b.onclick = () => { S.perspAssist = !S.perspAssist; store.set('perspAssist', S.perspAssist); syncUI(); toast(S.perspAssist ? 'Guides on: strokes follow the nearest perspective line' : 'Guides off: strokes are free again'); }; sn.after(b); })();
const syncUIV85p = syncUI; syncUI = function () { const r = syncUIV85p.apply(this, arguments); try { const b = $('bPerspA'); if (b) { const has = PERSP86 && perspOf(cur()).length > 0; b.hidden = !has; b.setAttribute('aria-pressed', S.perspAssist ? 'true' : 'false'); } } catch (e) {} return r; };
/* the tool's property bar: show/hide guides and clear */
function perspItems() { const pg = cur(), vps = perspOf(pg); return [{ label: perspShown(pg) ? 'Hide the guides' : 'Show the guides', icon: 'layers', fn: () => { if (pg.persp) { pg.persp.show = !perspShown(pg); changed(); } } }, { label: 'Clear the vanishing points on this page', icon: 'trash', fn: () => { pushUndo(); perspSet(pg, [], true); toast('Perspective guides cleared'); } }, { label: 'Copy these vanishing points to every page', icon: 'copy', fn: () => { if (!vps.length) return toast('Drop a vanishing point first.'); pushUndo(); for (const q of S.pages) if (q !== pg) perspSet(q, vps.map(v => ({ ...v })), true); toast(`Copied to ${S.pages.length - 1} other page${S.pages.length === 2 ? '' : 's'}`); } }]; }
const ctxExtrasV85p = typeof ctxExtras === 'function' ? ctxExtras : null;
if (ctxExtrasV85p) ctxExtras = function (items, sm, one, s) { const r = ctxExtrasV85p.apply(this, arguments) || items; try { if (PERSP86 && !sm.length && perspOf(cur()).length) { r.push('-', { head: 'Perspective' }, ...perspItems()); } } catch (e) {} return r; };
HELP.push(['Perspective guides', ['The Perspective tool sits with the shapes. Tap the sheet to drop a vanishing point, up to three on a page; the guide lines fan out from each one and a horizon joins the first two. Drag a point to move it, tap it to remove it. The guides are on screen only; they never print or export.',
  'With the Perspective tool, dragging draws a line that runs exactly to the nearest vanishing point. A Guides button appears in the bar whenever the page has vanishing points: turn it on and every pen, highlighter, line and arrow stroke follows the nearest guide from where it starts (a line to a vanishing point, plumb, or level when there is one point), so sketched edges land in perspective; turn it off to draw freely. Press and hold on the sheet for Hide the guides, Clear, or Copy these vanishing points to every page.']]);
Object.assign(RDX, { PERSP86, perspOf, perspSet, perspDir, perspProject, perspLock, perspItems });
