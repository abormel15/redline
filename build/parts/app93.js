/* ---------- PRINT86 (iPad edition): Print… from the Save menu ----------
   Builds a PDF (this page / all / a range; markups burned in or left out) with buildPdf. On a computer the PDF goes into a
   hidden iframe and the browser's print dialog opens on it (Chrome, Edge, Firefox); Safari on a Mac prints an iframe
   PDF blank, so there it opens in a new tab with a hint to press ⌘P. On iPadOS and iOS there is no scripted print of a
   PDF: the PDF is handed to the share sheet, where Print is one of the options (AirPrint, or Save to Files).
   Switch: PRINT86. */
const PRINT86 = true;
const isApplePad = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isSafariDesk = () => !isApplePad() && /Safari\//.test(navigator.userAgent) && !/Chrome\/|Chromium\/|Edg\/|OPR\//.test(navigator.userAgent);
/* PRINTPAGES86 (Nov 24 2026): "I need to be able to type specific page numbers to print". The box existed but only showed
   after pressing Range. Now it is always there: type in it and that is what prints. It takes 3, 5, 12-18 · 12–18 · 12 to 18 ·
   40- (to the end) · -5 (from the start) · sheet names (A-101), says what it understood before anything prints, and starts
   with the pages picked in the Pages panel when there are any. Enter prints. Same dialog on the computer and the iPad. */
function printDialog86() { if (!S.pages.length) return toast('Open a document first'); const st = Object.assign({ pages: 'this', markups: true }, store.get('print86', {}) || {}); if (st.pages === 'range') st.pages = 'typed';
  const n = S.pages.length, picked = S.pageSel && S.pageSel.size ? S.pages.map((p, i) => S.pageSel.has(p.id) ? i : -1).filter(i => i >= 0) : [];
  const md = modal(`<h3>Print</h3><div style="display:grid;gap:10px"><div><div class="muted" style="font-size:12.5px;margin-bottom:4px">Pages</div><div class="xseg" data-k="pages"><button class="btn" data-v="this">This page (${S.cur + 1})</button><button class="btn" data-v="all">All ${n}</button><button class="btn" data-v="typed">These pages</button></div>
    <input id="prRange" type="text" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="Page numbers to print" placeholder="Type page numbers: 3, 5, 12-18" style="margin-top:8px;width:100%;box-sizing:border-box;height:42px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink);padding:0 12px;font-size:16px;-webkit-user-select:text;user-select:text">
    <div id="prSay" class="muted" style="font-size:13px;margin-top:5px;min-height:18px"></div></div>
    <div><div class="muted" style="font-size:12.5px;margin-bottom:4px">Markups</div><div class="xseg" data-k="markups"><button class="btn" data-v="1">Printed on the sheet</button><button class="btn" data-v="0">Left out</button></div></div>
    <p class="muted" style="font-size:12.5px;margin:0">${isApplePad() ? 'The PDF opens in the share sheet: choose Print there (or Save to Files).' : 'The print dialog opens with the sheet. Pick the printer’s paper size and “Fit to page” there.'}</p></div><div class="acts"><button class="btn line" id="prNo">Cancel</button><button class="btn solid" id="prOk">${isApplePad() ? 'Continue' : 'Print…'}</button></div>`);
  const inp = md.querySelector('#prRange'), say = md.querySelector('#prSay'), okB = md.querySelector('#prOk');
  if (picked.length) { inp.value = fmtRange86(picked); st.pages = 'typed'; }
  const seg = k => md.querySelector(`.xseg[data-k="${k}"]`);
  const paint = () => { md.querySelectorAll('.xseg').forEach(sg => sg.querySelectorAll('.btn').forEach(b => b.classList.toggle('on', b.dataset.v === String(sg.dataset.k === 'markups' ? (st.markups ? 1 : 0) : st.pages))));
    inp.style.opacity = st.pages === 'typed' ? '' : '.6'; let msg = '', bad = false;
    if (st.pages === 'typed') { const r = parseRangeInfo86(inp.value, n, S.pages); if (!inp.value.trim()) msg = `Type the pages to print, 1 to ${n}. For example 3, 5, 12-18.`; else if (!r.idx.length) { msg = r.bad.length ? `Nothing to print: ${r.bad.slice(0, 3).map(b => '“' + b + '”').join(', ')} ${r.bad.length === 1 ? 'is' : 'are'} not ${r.bad.length === 1 ? 'a page' : 'pages'} of this document (it has ${n}).` : 'Type page numbers like 3, 5, 12-18.'; bad = true; }
      else msg = `Prints ${r.idx.length} page${r.idx.length === 1 ? '' : 's'}: ${fmtRange86(r.idx)}` + (r.bad.length ? `. Left out: ${r.bad.slice(0, 3).map(b => '“' + b + '”').join(', ')} (this document has ${n} page${n === 1 ? '' : 's'}).` : (picked.length && inp.value === fmtRange86(picked) ? ' — the pages picked in the Pages panel.' : '')); }
    else if (st.pages === 'all') msg = `Prints all ${n} page${n === 1 ? '' : 's'}.`; else msg = `Prints page ${S.cur + 1}${cur().label ? ' · ' + cur().label : ''}.`;
    say.textContent = msg; say.style.color = bad ? 'var(--danger,#c0392b)' : ''; };
  seg('pages').onclick = e => { const b = e.target.closest('.btn'); if (!b) return; st.pages = b.dataset.v; paint(); if (st.pages === 'typed') inp.focus(); }; seg('markups').onclick = e => { const b = e.target.closest('.btn'); if (!b) return; st.markups = b.dataset.v === '1'; paint(); };
  inp.oninput = () => { st.pages = 'typed'; paint(); }; inp.onfocus = () => { if (st.pages !== 'typed') { st.pages = 'typed'; paint(); } };
  inp.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); okB.click(); } else if (e.key === 'Escape') md.close(); }; md.querySelector('#prNo').onclick = md.close; paint();
  /* with a keyboard: start typing a number anywhere in the dialog and it lands in the box */
  const typeAhead = e => { if (!inp.isConnected) { document.removeEventListener('keydown', typeAhead, true); return; } if (e.target === inp || e.ctrlKey || e.metaKey || e.altKey || !/^[0-9]$/.test(e.key) || (e.target && e.target.closest && e.target.closest('input, textarea, [contenteditable]'))) return; e.preventDefault(); e.stopPropagation(); if (st.pages !== 'typed') inp.value = ''; inp.focus(); inp.value += e.key; st.pages = 'typed'; paint(); };
  document.addEventListener('keydown', typeAhead, true);
  if (st.pages === 'typed' && !isApplePad()) setTimeout(() => { try { inp.focus(); inp.select(); } catch (e) {} }, 60); /* on the iPad the keyboard would cover the dialog before it is read: tap the box to type */
  okB.onclick = async () => { let pages = null; if (st.pages === 'this') pages = [cur()]; else if (st.pages === 'typed') { pages = parseRange86(inp.value, n, S.pages).map(i => S.pages[i]); if (!pages.length) { paint(); inp.focus(); return toast(`Type the page numbers to print, like 3, 5, 12-18 (this document has ${n}).`, 3600); } } store.set('print86', { pages: st.pages, markups: st.markups }); md.close(); await printPages86(pages, st.markups); }; }
/* "3, 5, 12-18" → page indexes (0-based, in page order, no repeats) + what could not be used. Also 12–18, 12 to 18, 12 thru 18, 40- (to the end),
   -5 (from the start), and a sheet name when pages are named (A-101). */
function parseRangeInfo86(txt, n, pages) { const out = new Set(), bad = []; let t = String(txt || '').replace(/[‒–—−]/g, '-').replace(/\s+(to|thru|through)\s+/gi, '-').replace(/\s*-\s*/g, '-').replace(/\band\b|&/gi, ',');
  const labels = new Map(); if (Array.isArray(pages)) pages.forEach((p, i) => { if (p && p.label) { const k = String(p.label).trim().toLowerCase(); if (k && !labels.has(k)) labels.set(k, i); } });
  for (const part of t.split(/[,;\s]+/)) { if (!part) continue; const lab = labels.get(part.toLowerCase()); if (lab != null && !/^\d+$/.test(part)) { out.add(lab); continue; }
    const m = /^(\d*)(-?)(\d*)$/.exec(part); if (!m || (!m[1] && !m[3])) { bad.push(part); continue; } let a = m[1] ? +m[1] : 1, b = m[2] ? (m[3] ? +m[3] : n) : a; if (a > b) { const x = a; a = b; b = x; }
    if (b < 1 || a > n) { bad.push(part); continue; } if (a < 1 || b > n) bad.push(a < 1 ? String(a) : `${n + 1}-${b}`.replace(new RegExp('^' + (n + 1) + '-' + (n + 1) + '$'), String(n + 1))); for (let i = Math.max(1, a); i <= Math.min(n, b); i++) out.add(i - 1); }
  return { idx: [...out].sort((a, b) => a - b), bad }; }
function parseRange86(txt, n, pages) { return parseRangeInfo86(txt, n, pages).idx; }
/* page indexes → "3, 5, 12–18" */
function fmtRange86(idx) { const a = [...idx].sort((x, y) => x - y), out = []; for (let i = 0; i < a.length; i++) { let j = i; while (j + 1 < a.length && a[j + 1] === a[j] + 1) j++; out.push(j > i + 1 ? `${a[i] + 1}-${a[j] + 1}` : j === i + 1 ? `${a[i] + 1}, ${a[j] + 1}` : String(a[i] + 1)); i = j; } return out.join(', '); }
async function printPages86(pages, withMarkups) { commitEdit(); await busy('Preparing to print…'); let bytes; try { bytes = withMarkups ? await buildPdf({ flatten: true, pages, summary: false }) : await pdfWithoutMarkups86(pages); } catch (e) { busy(null); console.error(e); return toast('The pages could not be prepared for printing.', 4000); } busy(null);
  const blob = new Blob([bytes], { type: 'application/pdf' }), name = safeName() + '.pdf';
  if (isApplePad()) { if (navigator.canShare && navigator.share) { toast('Choose Print in the share sheet', 3500); return deliver(name, blob); } return saveFile(name, blob); }
  const url = URL.createObjectURL(blob); if (isSafariDesk()) { const w = window.open(url, '_blank'); if (!w) return saveFile(name, blob); toast('Press ⌘P in the new tab to print.', 4000); return; }
  let fr = $('printFrame86'); if (fr) fr.remove(); fr = document.createElement('iframe'); fr.id = 'printFrame86'; fr.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;opacity:0;border:0;pointer-events:none'; fr.src = url; document.body.appendChild(fr);
  let done = false; const go = () => { if (done) return; done = true; try { fr.contentWindow.focus(); fr.contentWindow.print(); try { window.focus(); if (document.activeElement === fr) fr.blur(); } catch (e2) {} /* give the keyboard back to the app: Ctrl+P a second time used to go to the hidden print frame */ } catch (e) { console.warn(e); window.open(url, '_blank'); toast('The print dialog could not open here; the PDF opened in a new tab — print it from there.', 5000); } setTimeout(() => { URL.revokeObjectURL(url); }, 120000); };
  fr.onload = () => setTimeout(go, 400); setTimeout(go, 3500); }
/* a flattened PDF with the markups left out = the original pages only */
async function pdfWithoutMarkups86(pages) { const keep = S.markups; try { S.markups = []; return await buildPdf({ flatten: true, pages, summary: false }); } finally { S.markups = keep; } }
/* the Save menu is built at boot (after this part runs): adjust it once it exists; other parts add to SAVE_ADJ86 */
const SAVE_ADJ86 = [];
SAVE_ADJ86.push(items => { if (!PRINT86) return; const i = items.findIndex(x => x && /Save to/.test(x.label || '')); const it = { label: 'Print…', note: isApplePad() ? 'through the share sheet' : 'the print dialog', icon: 'save', fn: printDialog86 }; if (i >= 0) items.splice(i + 1, 0, it); else items.push(it); });
setTimeout(() => { const base = window.saveItems; if (typeof base !== 'function') return; window.saveItems = () => { const items = base(); for (const f of SAVE_ADJ86) { try { f(items); } catch (e) { console.warn(e); } } return items; }; const b = $('bSave'); if (b) b.onclick = () => menu(b, window.saveItems()); }, 0);
document.addEventListener('keydown', e => { if (!PRINT86 || !(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'p' || e.shiftKey || e.altKey) return; if (!$('files').hidden || !S.pages.length) return; e.preventDefault(); printDialog86(); }, true);
HELP.push(['Printing', ['Save › Print… (or Ctrl+P / ⌘P): this page, all pages, or the pages you type in the box (3, 5, 12-18; also 40- for 40 to the end, or a sheet name such as A-101), with the markups printed on the sheet or left out. Pages picked in the Pages panel are filled in for you. On a computer the print dialog opens; on the iPad the PDF goes to the share sheet, where Print is one of the choices.']]);
Object.assign(RDX, { PRINT86, printDialog86, printPages86, parseRange86, parseRangeInfo86, fmtRange86 });
