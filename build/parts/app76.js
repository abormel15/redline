/* ---------- IMGX86 (iPad edition): images in, images and PDFs out ----------
   In: photos and images (JPEG, PNG, HEIC, WebP, GIF…) open as documents or go in as new pages; several at once become one
   multi-page PDF; a photo straight from the camera can become a page. Each image becomes a page at 150 dpi, embedded as JPEG
   (PNG when the image type can carry transparency). Orientation follows the photo's EXIF because the browser decodes it.
   Out: one Export dialog — PDF (editable or flattened), PNG or JPEG; this page, every page or a range; four sizes; with or
   without markups. Several image pages leave as one ZIP. Delivery goes through saveFile → share sheet on the iPad. Switch: IMGX86. */
const IMGX86 = true;
const IMG_RE86 = /\.(jpe?g|png|gif|webp|heic|heif|bmp|tiff?|avif)$/i;
const isImgFile86 = f => !!f && (/^image\//.test(f.type || '') || IMG_RE86.test(f.name || ''));
const PNG_RE86 = /png|gif|webp|avif|svg/i;
function blobU8_86(b) { return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(new Uint8Array(fr.result)); fr.onerror = rej; fr.readAsArrayBuffer(b); }); }
function canvasBlob86(c, mime, q) { return new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('toBlob')), mime, q)); }
async function decodeImg86(file) { // a canvas no larger than maxPx on its long side, oriented the way the photo was taken
  const maxPx = 4000; let w = 0, h = 0, src = null;
  try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); w = src.width; h = src.height; } catch (e) { src = null; }
  if (!src) { const url = URL.createObjectURL(file); try { src = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('decode')); im.src = url; }); w = src.naturalWidth; h = src.naturalHeight; } finally { setTimeout(() => URL.revokeObjectURL(url), 5000); } }
  if (!w || !h) throw new Error('empty image');
  const k = Math.min(1, maxPx / Math.max(w, h)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
  const cx = c.getContext('2d'); cx.drawImage(src, 0, 0, c.width, c.height); if (src.close) try { src.close(); } catch (e) {} return c; }
async function imagesToPdf86(files, onStep) { // → Uint8Array of a PDF with one page per image, 150 dpi
  const doc = await PL.PDFDocument.create(); let n = 0;
  for (const f of files) { n++; if (onStep) await onStep(n, files.length);
    const c = await decodeImg86(f), png = PNG_RE86.test(f.type || '') || /\.(png|gif|webp|avif)$/i.test(f.name || '');
    const bytes = await blobU8_86(await canvasBlob86(c, png ? 'image/png' : 'image/jpeg', 0.9)), img = png ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    const w = c.width * 72 / 150, h = c.height * 72 / 150, page = doc.addPage([w, h]); page.drawImage(img, { x: 0, y: 0, width: w, height: h }); c.width = c.height = 1; }
  doc.setTitle((files[0] && files[0].name || 'Images').replace(/\.[^.]+$/, '')); doc.setProducer('Redline Desk'); return await doc.save(); }
function pdfName86(files) { const base = (files[0].name || 'Image').replace(/\.[^.]+$/, ''); return (files.length > 1 ? `${base} and ${files.length - 1} more` : base) + '.pdf'; }
async function imagesAsPdfFile86(files) { try { await busy(files.length > 1 ? `Making a PDF from ${files.length} images…` : 'Making a PDF from the image…');
    const bytes = await imagesToPdf86(files, async (i, n) => { if (n > 1) await busy(`Adding image ${i} of ${n}…`); }); busy(null); return new File([bytes], pdfName86(files), { type: 'application/pdf' }); }
  catch (e) { busy(null); console.warn(e); toast(files.length > 1 ? 'One of those images could not be read.' : 'That image could not be read.', 4000); return null; } }
const openFileV85 = openFile; openFile = async function (file, append) {
  if (!IMGX86) return openFileV85.apply(this, arguments);
  const list = Array.isArray(file) ? file.filter(Boolean) : (file ? [file] : []); if (!list.length) return;
  const imgs = list.filter(isImgFile86), pdfs = list.filter(f => !isImgFile86(f)); let first = true;
  if (imgs.length) { const f = await imagesAsPdfFile86(imgs); if (!f) return; await openFileV85(f, append); first = false; }
  for (const p of pdfs) { await openFileV85(p, first ? append : true); first = false; } };
const addPdfIntoV85 = addPdfInto; addPdfInto = async function (file) {
  if (!IMGX86) return addPdfIntoV85.apply(this, arguments);
  const list = Array.isArray(file) ? file.filter(Boolean) : (file ? [file] : []); if (!list.length) return;
  const imgs = list.filter(isImgFile86), pdfs = list.filter(f => !isImgFile86(f));
  if (imgs.length) { const f = await imagesAsPdfFile86(imgs); if (f) await addPdfIntoV85(f); }
  for (const p of pdfs) await addPdfIntoV85(p); };
const importDocsV85 = importDocs; importDocs = async function (files) { if (!IMGX86) return importDocsV85.apply(this, arguments);
  const list = [...files], imgs = list.filter(isImgFile86), pdfs = list.filter(f => !isImgFile86(f)); if (imgs.length) { const f = await imagesAsPdfFile86(imgs); if (f) pdfs.unshift(f); } if (pdfs.length) return importDocsV85(pdfs); };
/* a photo straight from the camera as a page */
(function camPage86() { const i = document.createElement('input'); i.type = 'file'; i.id = 'fCamPg'; i.accept = 'image/*'; i.setAttribute('capture', 'environment'); i.hidden = true; document.body.appendChild(i);
  i.onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; if (S.pages && S.pages.length && !S.sample) addPdfInto(f); else openFile(f, false); }; })();
function photoPage86() { $('fCamPg').click(); }
function imagesAsPages86() { $('fAdd').click(); }
/* ---------- export dialog ---------- */
function parsePages86(txt, n) { const out = new Set(); for (const part of String(txt || '').split(/[,\s]+/)) { if (!part) continue; const m = part.match(/^(\d+)(?:-(\d+))?$/); if (!m) return null; let a = +m[1], b = m[2] ? +m[2] : a; if (a > b) [a, b] = [b, a]; for (let i = a; i <= b; i++) if (i >= 1 && i <= n) out.add(i - 1); } return [...out].sort((x, y) => x - y); }
async function pageImage86(pg, maxDim, withMarkups, mime) { // like pageCanvas, with the markups optional and a white ground for JPEG
  const vs = vSize(pg), k = Math.min(8, maxDim / Math.max(vs.w, vs.h), Math.sqrt(2.4e7 / (vs.w * vs.h))), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(vs.w * k)); c.height = Math.max(1, Math.round(vs.h * k)); const cx = c.getContext('2d');
  cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height);
  if (pg.src) { const page = await getPdfPage(pg); await page.render({ annotationMode: 3, canvasContext: cx, viewport: page.getViewport({ scale: k, rotation: (pg.baseRot + pg.rot) % 360 }) }).promise; } else paperPaint(cx, pg, k, 0, 0);
  if (withMarkups) { const M = mul([k, 0, 0, k, 0, 0], rotM(pg)); cx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]); const p = new CanvasPainter(cx); drawFormText(p, pg); for (const m of S.markups) if (m.page === pg.id && shownOnSheet(m)) drawMarkup(p, m); }
  const blob = await canvasBlob86(c, mime, mime === 'image/jpeg' ? 0.9 : undefined); c.width = c.height = 1; return blob; }
const EXP86 = { fmt: 'pdf', pages: 'this', size: 2400, marks: true };
function exportDialog86() { commitEdit(); const n = S.pages.length; if (!n) return toast('Open a document first.');
  const st = Object.assign({}, EXP86, store.get('export86', {}));
  const m = modal(`<h3>Export</h3>
    <div class="lab" style="margin-top:6px">Format</div><div class="xseg" data-k="fmt"><button class="btn line" data-v="pdf">PDF, editable</button><button class="btn line" data-v="pdfflat">PDF, flattened</button><button class="btn line" data-v="png">PNG</button><button class="btn line" data-v="jpg">JPEG</button></div>
    <div class="lab" style="margin-top:10px">Pages</div><div class="xseg" data-k="pages"><button class="btn line" data-v="this">This page</button><button class="btn line" data-v="all">All ${n}</button><button class="btn line" data-v="range">Some</button></div>
    <label id="xRangeF" hidden style="display:block;margin-top:6px">Which pages<input type="text" id="xRange" placeholder="e.g. 1-3, 5" inputmode="numeric" style="width:100%"></label>
    <div id="xImgOpts"><div class="lab" style="margin-top:10px">Size (long side)</div><div class="xseg" data-k="size"><button class="btn line" data-v="1200">1200 px</button><button class="btn line" data-v="2400">2400 px</button><button class="btn line" data-v="3600">3600 px</button><button class="btn line" data-v="4800">4800 px</button></div>
    <label class="chk" style="margin-top:10px"><input type="checkbox" id="xMarks"> Include markups</label></div>
    <p id="xNote" class="muted" style="margin:10px 0 0;font-size:13px"></p>
    <div class="acts"><button class="btn line" id="xNo">Cancel</button><button class="btn solid" id="xOk">Export</button></div>`);
  const sty = document.createElement('style'); sty.textContent = '.xseg{display:flex;flex-wrap:wrap;gap:6px}.xseg .btn{height:36px}.xseg .btn[aria-pressed=true]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}'; m.appendChild(sty);
  const segs = m.querySelectorAll('.xseg'); const sync = () => { for (const sg of segs) { const k = sg.dataset.k; for (const b of sg.querySelectorAll('.btn')) b.setAttribute('aria-pressed', String(b.dataset.v) === String(st[k]) ? 'true' : 'false'); }
    const img = st.fmt === 'png' || st.fmt === 'jpg'; m.querySelector('#xImgOpts').hidden = !img; m.querySelector('#xRangeF').hidden = st.pages !== 'range'; m.querySelector('#xMarks').checked = !!st.marks;
    const cnt = st.pages === 'this' ? 1 : st.pages === 'all' ? n : (parsePages86(m.querySelector('#xRange').value, n) || []).length;
    m.querySelector('#xNote').textContent = img ? (cnt > 1 ? `${cnt} ${st.fmt.toUpperCase()} images in one ZIP file.` : `One ${st.fmt.toUpperCase()} image${st.marks ? ' with the markups drawn on it' : ' of the plain page'}.`) : st.fmt === 'pdf' ? 'Markups stay editable when the PDF is opened in Redline again.' : 'Markups are burned into the pages.'; };
  for (const sg of segs) sg.onclick = e => { const b = e.target.closest('.btn'); if (!b) return; const k = sg.dataset.k; st[k] = k === 'size' ? +b.dataset.v : b.dataset.v; sync(); };
  m.querySelector('#xRange').oninput = sync; m.querySelector('#xMarks').onchange = e => { st.marks = e.target.checked; sync(); }; sync();
  m.querySelector('#xNo').onclick = m.close;
  m.querySelector('#xOk').onclick = async () => { const idx = st.pages === 'this' ? [S.cur] : st.pages === 'all' ? S.pages.map((_, i) => i) : parsePages86(m.querySelector('#xRange').value, n);
    if (!idx || !idx.length) { toast('Type the pages to export, like 1-3, 5.'); return; } store.set('export86', { fmt: st.fmt, pages: st.pages === 'range' ? 'this' : st.pages, size: st.size, marks: st.marks }); m.close(); await runExport86(st, idx); }; }
async function runExport86(st, idx) { const pages = idx.map(i => S.pages[i]), all = idx.length === S.pages.length;
  if (st.fmt === 'pdf' || st.fmt === 'pdfflat') return savePdf(st.fmt === 'pdfflat', all ? null : pages);
  const mime = st.fmt === 'png' ? 'image/png' : 'image/jpeg', ext = st.fmt === 'png' ? 'png' : 'jpg', base = safeName().replace(/ - (markup|flattened)$/i, '');
  try { if (pages.length === 1) { await busy('Rendering the page…'); const blob = await pageImage86(pages[0], st.size, st.marks, mime); busy(null); return saveFile(`${base} - page ${idx[0] + 1}.${ext}`, blob); }
    const files = []; for (let i = 0; i < pages.length; i++) { await busy(`Rendering page ${i + 1} of ${pages.length}…`); const blob = await pageImage86(pages[i], st.size, st.marks, mime); files.push({ name: `${base} - page ${String(idx[i] + 1).padStart(String(S.pages.length).length, '0')}.${ext}`, data: await blobU8_86(blob) }); }
    await busy('Packing the ZIP…'); const zip = zipStore(files); busy(null); return saveFile(`${base} - ${pages.length} pages ${ext.toUpperCase()}.zip`, zip); }
  catch (e) { busy(null); console.warn(e); toast('The page images could not be made.', 4000); } }
function extraItems86(where) { if (!IMGX86) return [];
  if (where === 'save') return [{ label: 'Export…', note: 'PDF, PNG or JPEG; one page, a range or all', icon: 'image', fn: exportDialog86 }];
  if (where === 'doc') return [{ label: 'Add images as pages', note: 'photos become pages; several at once', icon: 'image', fn: imagesAsPages86 }, { label: 'Photo as a new page', note: 'camera', icon: 'camera', fn: photoPage86 }];
  return []; }
HELP.push(['Images in, images out', ['Open takes photos and images as well as PDFs: a JPEG, PNG or HEIC becomes a one-page document, and several picked together become one PDF with a page each. Under More, "Add images as pages" and "Photo as a new page" do the same into the document you have open.',
  'Save, then Export…, makes a PDF (editable or flattened), or PNG or JPEG images of this page, a range or every page, at four sizes, with or without the markups. Several image pages leave together as one ZIP. On the iPad the share sheet lets you Save to Files, AirDrop or send them on.']]);
Object.assign(RDX, { IMGX86, imagesToPdf86, pageImage86, exportDialog86, runExport86, parsePages86, extraItems86 });
