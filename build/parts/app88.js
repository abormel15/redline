/* ---------- SPLIT86 (iPad edition): switching the edited side is quiet and keeps its place ----------
   Two fixes to V85's p2SwapDocs. (1) The sides no longer flip: openDoc → resetDocExtras → closeSplit reset S.swapSides
   before the toggle, so every other switch landed the edited document on the wrong side; the arrangement is now set
   explicitly. (2) No reload feel: the busy overlays ("Opening…", "Opening in the second view…") are suppressed for the
   swap, the split pane stays up instead of being torn down and rebuilt, the document that leaves the editable side keeps
   its parsed PDF (it was being re-parsed from IndexedDB every time), both views stay where they were, and the tool in
   hand stays selected. Switch: SPLIT86. */
const SPLIT86 = true;
const SW = { quiet: false };
const busySw86 = busy; busy = function (msg) { if (SPLIT86 && SW.quiet) return Promise.resolve(); return busySw86.apply(this, arguments); };
const closeSplitSw86 = closeSplit; closeSplit = function () { if (SPLIT86 && SW.quiet) return; return closeSplitSw86.apply(this, arguments); };
const p2SwapDocsV85 = p2SwapDocs; p2SwapDocs = async function () { if (!SPLIT86) return p2SwapDocsV85.apply(this, arguments);
  const other = P2.doc && P2.doc.id, mine = S.docId, pv = { s: P2.s, tx: P2.tx, ty: P2.ty }, mv = { s: S.view.s, tx: S.view.tx, ty: S.view.ty }, was = !!S.swapSides, tool = S.tool, mySrc = Object.keys(S.sources); if (!other || !mine || S.sample) return;
  SW.quiet = true; try {
    SW.t = {}; let t0 = performance.now(); await openDoc(other); SW.t.open = Math.round(performance.now() - t0); if (S.docId !== other) return;
    t0 = performance.now(); for (const id of mySrc) { if (!S.sources[id] && typeof pdfWarm !== 'undefined' && pdfWarm.has(id)) { S.sources[id] = pdfWarm.get(id); pdfWarm.delete(id); } } /* the document moving to the second view keeps its parsed PDF */
    await p2OpenDoc(mine); SW.t.p2 = Math.round(performance.now() - t0); if (!S.split) openSplit();
    P2.s = mv.s; P2.tx = mv.tx; P2.ty = mv.ty; S.view.s = pv.s; S.view.tx = pv.tx; S.view.ty = pv.ty; viewChanged();
    const want = !was; if (!!S.swapSides !== want) splitSwap(); /* the document you tapped is edited where it already was */
    render2(); changed2(); syncP2(); } finally { SW.quiet = false; busy(null); }
  if (tool && tool !== S.tool && tool !== 'symbol') { try { setTool(tool); } catch (e) {} }
  toast('Editing ' + (S.fileName || 'this document'), 1400); };
Object.assign(RDX, { SPLIT86, SW });
