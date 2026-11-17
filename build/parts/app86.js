/* ---------- SHARP86 (iPad edition): sharpen scanned / low-resolution sheets ----------
   Vendor detail sheets pasted into a permit set are often a picture at 100–150 dpi; zoomed in they go soft no matter how the
   page is rendered, because the detail is not in the file. An unsharp mask on the rendered page (base, detail and neighbour
   canvases, after the Blueprint/Grayscale processing in pcv) makes that text noticeably more legible. Off by default;
   Change colors › "Sharpen scanned pages": Off / Light / Strong (store 'sharpen86': 0 / 1 / 2). Cached per rendered canvas. */
const SHARP86 = true;
let sharpCache = new WeakMap();
const sharpLevel = () => { const v = +store.get('sharpen86', 0); return v === 1 || v === 2 ? v : 0; };
function sharpen86(src, lvl) { const w = src.width, h = src.height; if (w < 3 || h < 3) return src; const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(src, 0, 0); let img; try { img = x.getImageData(0, 0, w, h); } catch (e) { return src; }
  const d = img.data, o = new Uint8ClampedArray(d), k = lvl === 2 ? 0.9 : 0.45, cen = 1 + 4 * k, W4 = w * 4;
  for (let y = 1; y < h - 1; y++) { let i = y * W4 + 4; for (let xx = 1; xx < w - 1; xx++, i += 4) { for (let ch = 0; ch < 3; ch++) { const p = i + ch; o[p] = cen * d[p] - k * (d[p - 4] + d[p + 4] + d[p - W4] + d[p + W4]); } } }
  img.data.set(o); x.putImageData(img, 0, 0); return c; }
const pcvV85s = pcv; pcv = function (h) { const c = pcvV85s.apply(this, arguments); if (!SHARP86 || !c) return c; const lvl = sharpLevel(); if (!lvl) return c; let e = sharpCache.get(c); if (e && e.lvl === lvl) return e.cv; const cv = sharpen86(c, lvl); sharpCache.set(c, { lvl, cv }); return cv; };
function sharpSet(v) { store.set('sharpen86', v); sharpCache = new WeakMap(); requestDraw(); toast(v ? (v === 2 ? 'Strong' : 'Light') + ' sharpening on: scanned sheets read a little crisper. It cannot add detail the file does not have.' : 'Sharpening off', 3500); }
/* the control sits in the Change colors dialog, under "How the drawing itself shows" */
const colorEditDialogS86 = colorEditDialog; colorEditDialog = function () { const r = colorEditDialogS86.apply(this, arguments); try { if (!SHARP86) return r; const md = [...document.querySelectorAll('.scrim .modal')].pop(); const pg = md && md.querySelector('#cePg'); if (!pg || md.querySelector('#shRow')) return r;
    const h = document.createElement('h4'); h.className = 'cehd'; h.textContent = 'Sharpen scanned pages'; const row = document.createElement('div'); row.className = 'prow'; row.id = 'shRow'; let cur = sharpLevel();
    const draw = () => { row.innerHTML = ''; for (const [v, t] of [[0, 'Off'], [1, 'Light'], [2, 'Strong']]) { const b = document.createElement('button'); b.className = 'btn ' + (cur === v ? 'solid' : 'line'); b.textContent = t; b.onclick = () => { cur = v; sharpSet(v); draw(); }; row.appendChild(b); } };
    draw(); const note = document.createElement('p'); note.className = 'popnote'; note.textContent = 'For sheets that are a picture (vendor details, scans): an unsharp mask on the screen rendering. The file itself is unchanged, and detail that is not in it cannot be added.';
    const anchorNote = pg.parentElement.querySelector('.popnote'); (anchorNote || pg).after(h, row, note); } catch (e) { console.warn(e); } return r; };
HELP.push(['Blurry scanned sheets', ['When a sheet is a picture inside the PDF (vendor details, scans), zooming in cannot reveal detail the picture does not have. Hold on the page, Change colors, Sharpen scanned pages: Light or Strong makes the text read crisper; Black lines in the same dialog helps faint scans too.']]);
Object.assign(RDX, { SHARP86, sharpSet, sharpen86 });
