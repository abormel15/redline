/* ---------- SPLIT86 (iPad edition): sides stay put when switching which document is edited ----------
   V85 p2SwapDocs swaps the two documents between the editable stage and the second view and then *toggles* the swap class so
   each document stays on its own side. But openDoc → resetDocExtras → closeSplit resets S.swapSides to false first, so the
   toggle starts from a wrong baseline every other time and the editable document jumps to the other side. Fix: remember the
   side arrangement before the swap and set it explicitly afterwards. Switch: SPLIT86. */
const SPLIT86 = true;
const p2SwapDocsV85 = p2SwapDocs; p2SwapDocs = async function () { if (!SPLIT86) return p2SwapDocsV85.apply(this, arguments);
  const other = P2.doc && P2.doc.id, mine = S.docId, pv = { s: P2.s, tx: P2.tx, ty: P2.ty }, mv = { s: S.view.s, tx: S.view.tx, ty: S.view.ty }, was = !!S.swapSides; if (!other || !mine || S.sample) return;
  await openDoc(other); if (S.docId !== other) return; await p2OpenDoc(mine); if (!S.split) openSplit(); P2.s = mv.s; P2.tx = mv.tx; P2.ty = mv.ty; S.view.s = pv.s; S.view.tx = pv.tx; S.view.ty = pv.ty; viewChanged();
  const want = !was; if (!!S.swapSides !== want) splitSwap(); /* the document you tapped is edited where it already was */
  render2(); changed2(); syncP2(); toast('Now editing ' + (S.fileName || 'this document') + ' on this side. Tap the other side to edit that one.', 3000); };
Object.assign(RDX, { SPLIT86 });
