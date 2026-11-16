/* ---------- HLMODE86 (iPad edition): the highlighter is either Draw or Text ----------
   A "Highlight" switch on the highlighter's bar: Draw (as before: freehand, hold still to straighten, Straight lines option) or
   Text — drag across the words on the sheet and they are highlighted as text, in the highlighter's own color and opacity, the way
   the Select text tool's Highlight does, without the menu. A tap highlights one word. Device setting: store 'hlText'. */
const HLMODE86 = true; S.hlText = !!store.get('hlText', false);
const HT = { g: null };
(function hlModeBar() { try { const f = document.createElement('label'); f.className = 'field'; f.id = 'hlModeF'; f.hidden = true;
  f.innerHTML = '<span class="lab">Highlight</span><button class="btn line" id="pHlDraw" aria-pressed="true" title="Draw with the highlighter anywhere on the sheet">Draw</button><button class="btn line" id="pHlText" aria-pressed="false" title="Drag across words: the text itself is highlighted, straight and tidy, in this color">Text</button>';
  const anchor = $('hlStraightF') || $('penKindF'); if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(f, anchor.nextSibling); else $('props').appendChild(f);
  const set = v => { S.hlText = v; store.set('hlText', v); S.tsel = null; if (v) primeText(); syncUI(); requestDraw(); toast(v ? 'Highlighter: drag across words to highlight the text' : 'Highlighter: draw anywhere', 1800); };
  $('pHlDraw').onclick = () => set(false); $('pHlText').onclick = () => set(true); } catch (e) { console.warn(e); } })();
const syncUIHl86 = syncUI; syncUI = function () { const r = syncUIHl86.apply(this, arguments); try { const f = $('hlModeF'); if (f) { f.hidden = !HLMODE86 || S.tool !== 'highlight'; $('pHlDraw').setAttribute('aria-pressed', S.hlText ? 'false' : 'true'); $('pHlText').setAttribute('aria-pressed', S.hlText ? 'true' : 'false'); const sf = $('hlStraightF'); if (sf && S.tool === 'highlight') sf.hidden = !!S.hlText; } } catch (e) {} return r; };
const setToolHl86 = setTool; setTool = function (t) { const r = setToolHl86.apply(this, arguments); try { if (HLMODE86 && t === 'highlight' && S.hlText) primeText(); } catch (e) {} return r; };
function hlTextApply() { const sel = S.tsel; if (!sel) return false; const qs = sel.runs.map(runQuad); if (!qs.length) return false; const b = rawBox(qs.reduce((a, q) => a.concat(q), [])), o = { x: b.x0, y: b.y0 }, st = styleFor('highlight');
  const m = newMarkup('tmark', [o, { x: b.x1, y: b.y1 }], { kind: 'hl', text: selText(sel).slice(0, 2000), quads: qs.map(q => q.reduce((a, t) => a.concat(+(t.x - o.x).toFixed(3), +(t.y - o.y).toFixed(3)), [])) });
  m.style = { stroke: st.stroke || S.hl.stroke || '#ffe100', fill: null, width: 1, opacity: st.opacity != null ? st.opacity : (S.hl.opacity != null ? S.hl.opacity : 0.45), fontSize: S.baseFs || 12 }; S.tsel = null; addMarkup(m, true, false); return true; }
(function hlTextHook() { const st = $('stage'); if (!st) return;
  st.addEventListener('pointerdown', e => { if (!HLMODE86 || S.tool !== 'highlight' || !S.hlText || e.button > 0) return; if (!e.target || e.target.tagName !== 'CANVAS' || !st.contains(e.target)) return;
    if (e.pointerType === 'touch' && (S.penSeen || !S.fingerDraw)) return; if (HT.g) return; e.stopPropagation(); e.preventDefault(); try { view.setPointerCapture(e.pointerId); } catch (err) {}
    const s = pos(e); if (S.scroll) { const en = layout().find(q => q.i !== S.cur && s.x >= q.x && s.x <= q.x + q.w && s.y >= q.y && s.y <= q.y + q.h); if (en) switchCur(en, true); }
    primeText(); HT.g = { id: e.pointerId, s0: s, p0: toPage(s.x, s.y), moved: false }; S.tsel = null; }, true);
  view.addEventListener('pointermove', e => { const g = HT.g; if (!g || e.pointerId !== g.id) return; e.stopPropagation(); const s = pos(e); if (!g.moved && Math.hypot(s.x - g.s0.x, s.y - g.s0.y) > 4) g.moved = true; if (!g.moved) return;
    const T = S.textItems; if (!T || T.page !== cur().id) return; S.tsel = textInRect(g.p0, toPage(s.x, s.y)); requestDraw(); }, true);
  const end = e => { const g = HT.g; if (!g || e.pointerId !== g.id) return; e.stopPropagation(); HT.g = null; try { view.releasePointerCapture(e.pointerId); } catch (err) {}
    const T = S.textItems; if (!T || T.page !== cur().id) { primeText(); toast('Still reading the text on this page. Try again in a moment.'); return; }
    const s = pos(e), p = toPage(s.x, s.y); if (!g.moved) S.tsel = wordAt(p); else if (!S.tsel) S.tsel = textInRect(g.p0, p);
    if (!S.tsel) { requestDraw(); if (!T.its.length) toast('No text here to highlight. Switch Highlight to Draw for freehand, or read a scan first.', 4200); return; }
    hlTextApply(); requestDraw(); };
  view.addEventListener('pointerup', end, true); view.addEventListener('pointercancel', e => { if (HT.g && e.pointerId === HT.g.id) { HT.g = null; S.tsel = null; requestDraw(); } }, true); })();
HELP.push(['Highlighter: Draw or Text', ['The highlighter bar has a Highlight switch. Draw is the marker: freehand anywhere, hold still at the end to straighten, or turn on Straight for ruled lines. Text highlights the words themselves: drag across them and the highlight sits on the text, straight and even, in the highlighter’s color; tap a single word to highlight just that. Both make real highlights that export to PDF.']]);
Object.assign(RDX, { HLMODE86, hlTextApply });

/* ---------- DIAG86 (iPad edition): stroke diagnostics ----------
   Settings → "Stroke diagnostics". While on, every pen or highlighter stroke ends with a short toast saying what happened:
   pointer type, points, how long the end was held still, whether it straightened, and if not, which test it failed. The last
   twelve are kept in RDX.DIAG.log. Off by default; costs nothing when off. */
const DIAG86 = true; const DIAG = { on: !!store.get('diag86', false), log: [] };
const strokeStartD86 = strokeStart; strokeStart = function (g, e, p, s) { const r = strokeStartD86.apply(this, arguments); if (DIAG.on) try { g.d86 = { t0: performance.now(), tool: S.tool, ptype: e.pointerType, extra: [], hold: 0, tries: [] }; } catch (er) {} return r; };
document.addEventListener('pointerdown', e => { if (!DIAG.on) return; const g = S.gesture; if (g && g.d86 && e.pointerId !== g.id) g.d86.extra.push(e.pointerType + '@' + Math.round(performance.now() - g.d86.t0) + 'ms'); }, true);
const holdCheckD86 = holdCheck; holdCheck = function (g, s, now) { const r = holdCheckD86.apply(this, arguments); if (DIAG.on && g.d86) { if (g.heldEnd) { if (!g.d86.heldAt) g.d86.heldAt = performance.now(); } else g.d86.heldAt = 0; } return r; };
const trySnapD86 = trySnap; trySnap = function (g) { if (DIAG.on && g && g.d86) try { const d = S.draft, why = []; if (!d) why.push('no draft'); if (S.gesture !== g) why.push('another gesture took over' + (S.gesture ? ' (' + (S.gesture.kind || '?') + ')' : ''));
    if (g.snap) why.push('already ' + g.snap); if (g.kind !== 'stroke') why.push('kind ' + g.kind);
    if (d && !why.length) { const pts = strokeCore(d.pts); if (pts.length < 4) why.push('only ' + pts.length + ' points'); else { const a = pts[0], b = pts[pts.length - 1], bb = rawBox(pts), dg = Math.hypot(bb.x1 - bb.x0, bb.y1 - bb.y0); if (dg * S.view.s < 46) why.push('too short (' + Math.round(dg * S.view.s) + ' px)'); else { const L = dist(a, b), plen = pathLen(rdp(pts, 1.5 / S.view.s)), dev = Math.max(...pts.map(q => segDist(q, a, b))); if (!(plen < L * 1.3)) why.push('path ' + (plen / L).toFixed(2) + '× its length (needs < 1.3)'); if (!(dev < L * 0.14)) why.push('bows ' + Math.round(dev / L * 100) + '% (needs < 14%)'); } } }
    g.d86.tries.push({ at: Math.round(performance.now() - g.d86.t0), why }); } catch (er) {} return trySnapD86.apply(this, arguments); };
const strokeEndD86 = strokeEnd; strokeEnd = function (g, e, p) { let line = null; if (DIAG.on && g && g.d86) try { const d = g.d86, n = S.draft ? S.draft.pts.length : 0, dur = Math.round(performance.now() - d.t0), held = d.heldAt ? Math.round(performance.now() - d.heldAt) : 0, last = d.tries[d.tries.length - 1];
    line = `${d.tool} · ${d.ptype} · ${n} pts · ${(dur / 1000).toFixed(1)}s` + (held ? ` · held ${held} ms` : ' · end not held still') + (g.snap ? ` · straightened (${g.snap})` : last ? ` · not straightened: ${last.why.join('; ') || 'no reason found'}` : ' · hold never checked') + (d.extra.length ? ` · other touches: ${d.extra.join(', ')}` : '');
    DIAG.log.unshift(line); DIAG.log.length = Math.min(DIAG.log.length, 12); } catch (er) {} const r = strokeEndD86.apply(this, arguments); if (line) toast(line, 6000); return r; };
const settingsDialogD86 = settingsDialog; settingsDialog = function () { const r = settingsDialogD86.apply(this, arguments); try { const md = [...document.querySelectorAll('.scrim .modal')].pop(), b = md && md.querySelector('.buildTag'); if (b && !md.querySelector('#diag86')) {
    const l = document.createElement('label'); l.className = 'chk'; l.style.cssText = 'display:flex;gap:8px;align-items:center;margin:8px 0 0;font-size:13px'; l.innerHTML = '<input type="checkbox" id="diag86"> Stroke diagnostics: after each stroke, say whether it straightened and why not'; l.querySelector('input').checked = DIAG.on; l.querySelector('input').onchange = ev => { DIAG.on = ev.target.checked; store.set('diag86', DIAG.on); toast(DIAG.on ? 'Stroke diagnostics on' : 'Stroke diagnostics off'); }; b.after(l);
    if (DIAG.log.length) { const pre = document.createElement('pre'); pre.style.cssText = 'font:11px/1.35 ui-monospace,Menlo,monospace;white-space:pre-wrap;margin:6px 0 0;max-height:120px;overflow:auto;color:var(--muted)'; pre.textContent = DIAG.log.join('\n'); l.after(pre); } } } catch (e) {} return r; };
Object.assign(RDX, { DIAG86, DIAG });
