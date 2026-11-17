/* ---------- KEYS86 (iPad edition): Alt+Z fits text boxes, Ctrl-drag copies, Shift-drag ignores the guides ----------
   Alt+Z (or Option+Z): fit the selected text boxes / sticky notes to their text (the "Fit the box to the text" action).
   Ctrl-drag (or Cmd-drag) with the arrow tool on a markup: the drag moves a copy and leaves the original where it was.
   Holding Shift while moving, resizing or rotating: magnet, smart guides, grid snapping and page guides are ignored for
   that gesture only. Keyboard-only features; nothing changes for touch. Switch: KEYS86. */
const KEYS86 = true;
const KS = { shift: false, ctrlDrag: 0 };
const typingNow = () => { const t = document.activeElement; return !!(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)); };
document.addEventListener('keydown', e => { if (!KEYS86) return; if (e.key === 'Shift') KS.shift = true; if (e.altKey && !e.ctrlKey && !e.metaKey && (e.code === 'KeyZ' || e.key.toLowerCase() === 'z' || e.key === 'Ω') && !typingNow() && $('files').hidden) { e.preventDefault(); e.stopPropagation(); fitBoxSel(); } }, true);
document.addEventListener('keyup', e => { if (e.key === 'Shift') KS.shift = false; }, true);
window.addEventListener('blur', () => { KS.shift = false; });
document.addEventListener('pointermove', e => { KS.shift = !!e.shiftKey; }, { capture: true, passive: true });
/* Shift: no snapping while moving */
const gridCfgK86 = gridCfg; gridCfg = function () { const c = gridCfgK86.apply(this, arguments); if (!KEYS86 || !KS.shift) return c; const g = S.gesture; if (!g || !MOVERS.has(g.kind)) return c; return { ...c, snap: false, magnet: false, smart: false }; };
const moveSnapK86 = moveSnap; moveSnap = function (g, ox, oy) { if (KEYS86 && KS.shift) { S.snapGuides = null; S.gapGuides = null; return { x: ox, y: oy }; } return moveSnapK86.apply(this, arguments); };
/* Ctrl-drag: duplicate in place, then let the ordinary move take the copies */
document.addEventListener('pointerdown', e => { if (!KEYS86 || e.pointerType !== 'mouse' || e.button !== 0 || !(e.ctrlKey || e.metaKey) || e.shiftKey) return; if (S.tool !== 'select' || !$('files').hidden) return; const st = $('stage'); if (!st || !st.contains(e.target)) return;
  let p; try { const q = pos(e); p = toPage(q.x, q.y); } catch (err) { return; } const hit = topHit(p); if (!hit || !editable(hit)) return;
  if (!S.sel.has(hit.id)) S.sel = new Set([hit.id]); pushUndo(); const made = [], ids = new Set(); for (const m of S.markups.filter(m => S.sel.has(m.id))) { const c = cloneM(m); c.id = uid(); c.date = Date.now(); c.locked = false; delete c.link; made.push(c); S.markups.push(c); ids.add(c.id); }
  regroup(made); S.sel = ids; KS.ctrlDrag = Date.now(); changed(); toast('Dragging a copy', 1200); /* the original handler now hits the copy on top and moves the selection */ }, true);
HELP.push(['Keyboard shortcuts for markups', ['Alt+Z fits the selected text boxes to their text. Ctrl-drag (Cmd on a Mac) a markup to drag away a copy. Hold Shift while moving or resizing to ignore the magnet, smart guides and grid for that move.']]);
Object.assign(RDX, { KEYS86, KS, moveSnap86: (g, x, y) => moveSnap(g, x, y) });
