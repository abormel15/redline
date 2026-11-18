/* ---------- CALLROT86 (iPad edition): callouts can be rotated, and new ones read upright on a rotated page ----------
   V85 lists 'callout' in noRotType, so a callout drawn on a page the user has rotated 90° shows its text running down
   the sheet with no way to turn it. Here a callout carries an angle like a text box does, but only its BOX turns: the
   leaders stay anchored where they were, now attached to the nearest edge of the turned box. New callouts (and text
   boxes and sticky notes) made while the page is shown rotated start at the angle that reads upright on screen. */
const CALLROT86 = true;
const isRotTypeC86 = isRotType; isRotType = function (t) { return (CALLROT86 && t === 'callout') || isRotTypeC86.apply(this, arguments); };
const noRotTypeC86 = noRotType; noRotType = function (t) { return (CALLROT86 && t === 'callout') ? false : noRotTypeC86.apply(this, arguments); };
const rotOf86 = (m) => ((m && m.rot) || 0) * Math.PI / 180;
/* the leader meets the turned box: the edge midpoints are rotated with it (this also fixes tapping the leader) */
const calloutLeaderC86 = calloutLeader; calloutLeader = function (m, tip) { const q = calloutLeaderC86.apply(this, arguments); try { if (!CALLROT86 || !isRot(m) || m.type !== 'callout') return q; const b = box(m), c = boxC(m), a = rotOf86(m); let t = tip || m.pts[2]; if (t && t.k && t.k.length) t = t.k[0];
    const mids = [{ x: b.x, y: b.y + b.h / 2 }, { x: b.x + b.w, y: b.y + b.h / 2 }, { x: b.x + b.w / 2, y: b.y }, { x: b.x + b.w / 2, y: b.y + b.h }].map(u => rotP(u, c, a));
    let best = mids[0]; for (const u of mids) if (dist(u, t) < dist(best, t)) best = u; return best; } catch (e) { return q; } };
/* drawing: the leaders in page space, then the box and its text turned */
const drawMarkupC86 = drawMarkup; drawMarkup = function (p, m, opt) {
  if (!(CALLROT86 && m && m.type === 'callout' && isRot(m))) return drawMarkupC86.apply(this, arguments);
  try { const st = m.style, col = st.color || '#e5241d';
    for (const tip of calloutTips(m)) { const path = calloutPath(m, tip), q = path[path.length - 2], hs = headSize(m), L = dist(q, tip) || 1, cut = Math.min(hs * 0.7, L * 0.5);
      pathPoly(p, [...path.slice(0, -1), { x: tip.x - (tip.x - q.x) / L * cut, y: tip.y - (tip.y - q.y) / L * cut }]); p.paint({ stroke: col, width: Math.max(st.width, 1) }); arrowHead(p, q, tip, hs, col); }
  } catch (e) { console.warn(e); }
  return drawMarkupC86.call(this, p, { ...m, pts: [m.pts[0], m.pts[1]] }, opt); /* box + text only, turned by the usual path */
};
/* tapping: the turned box, or any leader (which calloutPath now follows) */
const hitC86 = hit; hit = function (m, p, tol) { if (!(CALLROT86 && m && m.type === 'callout' && isRot(m))) return hitC86.apply(this, arguments);
  try { if (calloutTips(m).some(tip => polyDist(p, calloutPath(m, tip)) <= tol)) return true; const b = box(m), q = rotP(p, boxC(m), -rotOf86(m)); return q.x >= b.x - tol && q.x <= b.x + b.w + tol && q.y >= b.y - tol && q.y <= b.y + b.h + tol; } catch (e) { return hitC86.apply(this, arguments); } };
/* handles: the box's turn with it, the tips and their bends stay where they are */
const handlesC86 = handles; handles = function (m) { if (!(CALLROT86 && m && m.type === 'callout' && isRot(m))) return handlesC86.apply(this, arguments);
  try { const c = boxC(m), a = rotOf86(m); return handles0(m).map(h => h.kind === 'box' ? { ...h, ...rotP(h, c, a) } : h); } catch (e) { return handlesC86.apply(this, arguments); } };
/* the area it covers: the turned box plus the leaders */
function callBox86(m) { const pts = rotCorners(m).slice(); for (const tip of calloutTips(m)) { pts.push(tip); (tip.k || []).forEach(k => pts.push(k)); pts.push(calloutLeader(m, tip)); } const r = rawBox(pts), pad = (m.style.width || 1) / 2 + 1 + headSize(m); return { x0: r.x0 - pad, y0: r.y0 - pad, x1: r.x1 + pad, y1: r.y1 + pad }; }
const bboxC86 = bbox; bbox = function (m) { if (!(CALLROT86 && m && m.type === 'callout' && isRot(m))) return bboxC86.apply(this, arguments); try { return callBox86(m); } catch (e) { return bboxC86.apply(this, arguments); } };
const gboxC86 = gbox; gbox = function (m) { if (!(CALLROT86 && m && m.type === 'callout' && isRot(m))) return gboxC86.apply(this, arguments); try { const b = callBox86(m); return { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 }; } catch (e) { return gboxC86.apply(this, arguments); } };
/* new text-bearing markups on a page the user has turned start upright on screen */
const TEXTUP86 = new Set(['callout', 'text', 'sticky']);
const newMarkupC86 = newMarkup; newMarkup = function (type, pts, extra) { const m = newMarkupC86.apply(this, arguments); try { if (CALLROT86 && m && TEXTUP86.has(type) && !(extra && extra.rot != null)) { const pg = cur(), r = pg ? (pg.rot || 0) % 360 : 0; if (r) m.rot = (360 - r) % 360; } } catch (e) {} return m; };
HELP.push(['Turning a callout', ['A callout can be turned like a text box: hold on it and use Rotate 90°, or drag the round handle above it. Only the box turns — the leader stays pointing at what you picked, and reattaches to the nearest edge. On a page you have rotated, a new callout, text box or sticky note starts at the angle that reads upright on screen.']]);
Object.assign(RDX, { CALLROT86, callBox86 });
