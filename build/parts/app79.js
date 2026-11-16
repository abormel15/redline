/* ---------- TFLOW86 (iPad edition): text selection follows the text ----------
   Dragging across words used to select a box: the lines in between were only taken where the box crossed them, so a selection
   from the middle of one line to the middle of a later one skipped the start of the lines between. Selection now flows like a
   word processor: from the start point to the end of its line, every line between in full, and the last line up to the end point.
   Lines are read top to bottom; in a two-column page the lines between are kept to the column the drag is in. A short drag inside
   one line still selects along the text. Used by Select text and the highlighter's Text mode. Switch: TFLOW86. */
const TFLOW86 = true;
function tfItems86(its) { const out = []; for (const it of its) { if (!it.str || !it.str.length) continue; const q0 = it.P(0, 0.35), q1 = it.P(1, 0.35); const horiz = Math.abs(q1.y - q0.y) <= Math.abs(q1.x - q0.x) * 0.3 || it.ocr; if (!horiz) continue; out.push({ it, x0: Math.min(q0.x, q1.x), x1: Math.max(q0.x, q1.x), yc: (q0.y + q1.y) / 2, h: it.h || Math.abs(q1.y - q0.y) || 8 }); } return out; }
function tfLines86(items) { const srt = items.slice().sort((a, b) => a.yc - b.yc || a.x0 - b.x0), lines = []; for (const e of srt) { const L = lines[lines.length - 1]; if (L && Math.abs(e.yc - L.yc) <= Math.max(e.h, L.h) * 0.45) { L.items.push(e); L.yc = (L.yc * (L.items.length - 1) + e.yc) / L.items.length; } else lines.push({ yc: e.yc, h: e.h, items: [e] }); }
  const out = []; for (const L of lines) { L.items.sort((a, b) => a.x0 - b.x0); let seg = null; for (const e of L.items) { if (seg && e.x0 - seg.x1 > seg.h * 3) { out.push(seg); seg = null; } if (!seg) seg = { yc: L.yc, h: e.h, x0: e.x0, x1: e.x1, items: [e] }; else { seg.items.push(e); seg.x1 = Math.max(seg.x1, e.x1); seg.h = Math.max(seg.h, e.h); } } if (seg) out.push(seg); }
  return out.sort((a, b) => a.yc - b.yc || a.x0 - b.x0); }
function tfCharIn86(e, p) { const it = e.it; if (it.ocr) return p.x <= e.x0 ? 0 : p.x >= e.x1 ? it.str.length : Math.round((p.x - e.x0) / (e.x1 - e.x0 || 1) * it.str.length); const a = it.P(0, 0), b = it.P(1, 0), L2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2 || 1, f = Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / L2)), fr = fracs(it); let i = 0; while (i < it.str.length && fr[i + 1] <= f) i++; return Math.min(i, it.str.length); }
function tfAnchor86(lines, p) { if (!lines.length) return null; let li = -1, best = Infinity; lines.forEach((L, i) => { const d = Math.abs(p.y - L.yc); if (d < best) { best = d; li = i; } });
  // the nearest line vertically; if several segments (columns) share the band, the one whose x-range contains or is nearest to p
  const band = lines.map((L, i) => [L, i]).filter(([L]) => Math.abs(L.yc - lines[li].yc) <= Math.max(L.h, lines[li].h) * 0.45); let pick = band[0]; let bd = Infinity; for (const c of band) { const L = c[0], d = p.x < L.x0 ? L.x0 - p.x : p.x > L.x1 ? p.x - L.x1 : 0; if (d < bd) { bd = d; pick = c; } }
  const L = pick[0], i = pick[1]; if (p.x <= L.x0) return { li: i, ei: 0, ci: 0 }; if (p.x >= L.x1) { const e = L.items.length - 1; return { li: i, ei: e, ci: L.items[e].it.str.length }; }
  let ei = 0; for (let k = 0; k < L.items.length; k++) { const e = L.items[k]; if (p.x >= e.x0 - e.h * 0.3) ei = k; } const e = L.items[ei]; return { li: i, ei, ci: tfCharIn86(e, p), inside: true }; }
function textInFlow86(a, b) { const T = S.textItems, pg = cur(); if (!T || T.page !== pg.id) return null; const lines = tfLines86(tfItems86(T.its)); if (!lines.length) return null;
  let A = tfAnchor86(lines, a), B = tfAnchor86(lines, b); if (!A || !B) return null;
  // too far from any text: nothing (the drag was on empty paper) — judged before the ends are ordered
  const farA = Math.abs(a.y - lines[A.li].yc) > lines[A.li].h * 2.5, farB = Math.abs(b.y - lines[B.li].yc) > lines[B.li].h * 2.5; if (farA && farB) return null;
  const key = q => (q.li * 1e6 + q.ei) * 1e4 + q.ci; if (key(A) > key(B)) [A, B] = [B, A]; if (B.inside) { const len = lines[B.li].items[B.ei].it.str.length; B = { ...B, ci: Math.min(B.ci + 1, len) }; } /* the character under the end point is part of the selection */
  const runs = [], push = (e, i0, i1) => { if (i1 > i0) runs.push({ it: e.it, i0, i1 }); };
  if (A.li === B.li) { const L = lines[A.li]; for (let k = A.ei; k <= B.ei; k++) { const e = L.items[k]; push(e, k === A.ei ? A.ci : 0, k === B.ei ? B.ci : e.it.str.length); } return runs.length ? { page: pg.id, runs } : null; }
  const LA = lines[A.li], LB = lines[B.li], cx0 = Math.min(LA.x0, LB.x0), cx1 = Math.max(LA.x1, LB.x1);
  for (let k = A.ei; k < LA.items.length; k++) { const e = LA.items[k]; push(e, k === A.ei ? A.ci : 0, e.it.str.length); }
  for (let li = A.li + 1; li < B.li; li++) { const L = lines[li], ov = Math.min(L.x1, cx1) - Math.max(L.x0, cx0), w = Math.min(L.x1 - L.x0, cx1 - cx0) || 1; if (ov < w * 0.3) continue; /* another column */ for (const e of L.items) push(e, 0, e.it.str.length); }
  for (let k = 0; k <= B.ei; k++) { const e = LB.items[k]; push(e, 0, k === B.ei ? B.ci : e.it.str.length); }
  return runs.length ? { page: pg.id, runs } : null; }
const textInRectBox86 = textInRect; textInRect = function (a, b) { if (!TFLOW86) return textInRectBox86.apply(this, arguments); try { const r = textInFlow86(a, b); if (r) return r; } catch (e) { console.warn(e); } return textInRectBox86.apply(this, arguments); };
Object.assign(RDX, { TFLOW86, textInFlow86, textInRectBox86 });
