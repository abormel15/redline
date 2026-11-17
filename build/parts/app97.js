/* ---------- GUIDE86 (iPad edition): the companion guide (guide/index.html next to the app) ----------
   ⋯ More › Guide to the iPad edition, a Guide button on the What's new card, Files › More when signed out, and a row
   in Help open the guide in an in-app overlay (an iframe, so the home-screen app is not left for Safari), with
   "Open in a tab" for a full window. guide/index.html is built by guide/build_guide.py; its release-notes section is
   generated from RELNOTES, so each build that adds a note also refreshes the guide. */
const GUIDE86 = true;
const guideUrl86 = (hash) => new URL('guide/' + (hash ? '#' + hash : ''), location.href.replace(/[?#].*$/, '')).href;
function guideOpen86(hash) {
  if (!GUIDE86) return;
  const old = document.getElementById('guideOv86'); if (old) old.remove();
  const ov = document.createElement('div'); ov.id = 'guideOv86'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Guide to the iPad edition');
  ov.style.cssText = 'position:fixed;inset:0;z-index:10000;background:var(--bg,#f3f6f9);display:flex;flex-direction:column;padding-top:env(safe-area-inset-top)';
  ov.innerHTML = `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--line,#dbe2ea);background:var(--panel,#fff);flex:none">
      <strong style="flex:1;font-size:15px">Guide to the iPad edition</strong>
      <button class="btn line" id="guideTab86" type="button">Open in a tab</button>
      <button class="btn solid" id="guideClose86" type="button">Close</button></div>
    <iframe id="guideFr86" title="Guide" style="flex:1;border:0;width:100%;background:#fff"></iframe>`;
  document.body.appendChild(ov);
  const fr = ov.querySelector('#guideFr86'); fr.src = guideUrl86(hash);
  const close = () => { ov.remove(); document.removeEventListener('keydown', onKey, true); };
  const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  document.addEventListener('keydown', onKey, true);
  ov.querySelector('#guideClose86').onclick = close;
  ov.querySelector('#guideTab86').onclick = () => { try { window.open(guideUrl86(hash), '_blank', 'noopener'); } catch (e) {} };
  return ov;
}
/* ⋯ More (document open) */
const extraItemsG86 = extraItems86; extraItems86 = function (where) { const r = extraItemsG86.apply(this, arguments) || []; if (!GUIDE86 || where !== 'doc') return r; return [...r, { label: 'Guide to the iPad edition', note: 'clips and steps for everything new', icon: 'help', fn: () => guideOpen86('') }]; };
/* Files › More: a Guide row next to Help and tips (patches.py GUIDE86 calls this) */
window.__rdGuideItems86 = () => GUIDE86 ? [{ label: 'Guide to the iPad edition', note: 'clips and steps for everything new', icon: 'help', fn: () => guideOpen86('') }] : [];
/* What's new card: a Guide button next to All notes */
const relNotesDialogG86 = relNotesDialog86; relNotesDialog86 = function () { const md = relNotesDialogG86.apply(this, arguments); try { const all = md.querySelector('#relAll'); if (all && GUIDE86) { const b = document.createElement('button'); b.className = 'btn line'; b.id = 'relGuide86'; b.type = 'button'; b.textContent = 'Guide'; b.onclick = () => { guideOpen86('notes'); }; all.after(b); } } catch (e) {} return md; };
HELP.push(['Guide to the iPad edition', ['⋯ More › Guide to the iPad edition opens a page of short clips and numbered steps for everything this edition adds: the account, symbols, forms, printing, side by side, sheet sets. It is also at the same web address as the app, under /guide/.']]);
Object.assign(RDX, { GUIDE86, guideOpen86, guideUrl86, relNotesDialog86 }); /* the wrapped dialog, so callers through RDX get the Guide button too */
