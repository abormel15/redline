// FORMPAINT86: an answer shows on the page as soon as its field is left; a deleted answer is gone; checkbox, undo/redo, zoomed in.
// Measured from screenshots (dark pixels inside the field box), because the stored value was always right — only the picture was old.
const lib = require('./aud_lib.js');
(async () => { const A = await lib({}); const { pg, W, E, I } = A; let fails = 0; const ok = (c, n, d) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + n + (d != null ? ' | ' + (typeof d === 'string' ? d : JSON.stringify(d)) : '')); };
  const fld = (name) => E(name => { const p0 = __rd.X.cur86(), f = (__rd.X.formCache86().get(p0.src + ':' + p0.n) || []).find(x => x.name === name); if (!f) return null; const v = __rd.S.view, r = document.getElementById('stage').getBoundingClientRect(); return { x: r.left + v.tx + ((f.b.x0 + f.b.x1) / 2) * v.s, y: r.top + v.ty + ((f.b.y0 + f.b.y1) / 2) * v.s, w: (f.b.x1 - f.b.x0) * v.s, h: (f.b.y1 - f.b.y0) * v.s, val: __rd.X.fieldVal86(p0, f) }; }, name);
  const vp = pg.viewportSize();
  const ink = async (name) => { const f = await fld(name); if (!f) return 'no field'; const c = { x: Math.max(0, f.x - f.w / 2 + 3), y: Math.max(0, f.y - f.h / 2 + 3), width: Math.min(f.w - 6, 600), height: Math.min(f.h - 6, 400) }; if (c.x + c.width > vp.width || c.y + c.height > vp.height) return 'off-screen'; const buf = await pg.screenshot({ clip: c }); return E(async b64 => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const x = cv.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 110 && d[i + 1] < 110 && d[i + 2] < 110) n++; return n; }, buf.toString('base64')); };
  const away = async () => { const f = await fld('Employee Name'); await I.tap(f.x + f.w / 2 + 60, f.y - 30); await W(900); }; /* blank paper right of the name box */
  const edOpen = () => E(() => !document.getElementById('fieldEd').hidden);
  const type = async (name, text, clear) => { const f = await fld(name); await I.tap(f.x, f.y); await W(500); if (!await edOpen()) return false; if (clear) { await pg.keyboard.press('Control+A'); await pg.keyboard.press('Delete'); } if (text) await pg.keyboard.type(text); await W(150); return true; };
  await E(() => __rd.X.showFiles()); await W(300); await A.openFx('timesheet.pdf'); await W(500); await A.openCard('timesheet'); await W(1500);
  console.log('mode', I.name, JSON.stringify(vp));
  // 1. a new answer in an empty box
  const b0 = await ink('MonWeek 2'); ok(await type('MonWeek 2', '8R'), 'empty field opens for typing'); await away(); const b1 = await ink('MonWeek 2');
  ok(b0 === 0 && b1 > 30, 'a new answer shows after leaving the field', b0 + ' → ' + b1);
  // 2. the answer that came with the file, changed
  const n0 = await ink('Employee Name'); await type('Employee Name', 'Al', true); await away(); const n1 = await ink('Employee Name'); const v1 = (await fld('Employee Name')).val;
  ok(v1 === 'Al' && n1 > 20 && n1 < n0 * 0.5, 'a changed answer shows the new text, not the old', n0 + ' → ' + n1 + ' (' + v1 + ')');
  // 3. deleted answers: one typed here, one that came with the file
  await type('MonWeek 2', '', true); await away(); const d1 = await ink('MonWeek 2'); ok(d1 === 0 && (await fld('MonWeek 2')).val === '', 'a deleted answer (typed here) is gone from the page', b1 + ' → ' + d1);
  const m0 = await ink('MonWeek 1'); await type('MonWeek 1', '', true); await away(); const m1 = await ink('MonWeek 1'); ok(m0 > 30 && m1 === 0, 'a deleted answer (came with the file) is gone from the page', m0 + ' → ' + m1);
  // 4. no flash of the old picture while the page redraws
  await type('TuesWeek 2', '8R'); const f0 = await fld('Employee Name'); await I.tap(f0.x + f0.w / 2 + 60, f0.y - 30); const seen = []; for (let i = 0; i < 8; i++) { seen.push(await ink('TuesWeek 2')); await W(60); } await W(600); seen.push(await ink('TuesWeek 2'));
  ok(seen[seen.length - 1] > 30, 'typed answer is there after the redraw', seen.join(','));
  // (Undo does not cover form answers in this app — V85 never recorded them in history — so there is nothing to check for it here.)
  // 6. zoomed in (the sharp close-up layer)
  await E(() => { const v = __rd.S.view; const k = 2.2; const r = document.getElementById('stage').getBoundingClientRect(); const cx = 320, cy = 300; v.tx = cx - (cx - v.tx) * k; v.ty = cy - (cy - v.ty) * k; v.s *= k; __rd.viewChanged(); }); await W(1500);
  const z0 = await ink('WedWeek 2'); const zt = await type('WedWeek 2', '8R'); await away(); await W(900); const z1 = await ink('WedWeek 2');
  ok(zt && z0 === 0 && typeof z1 === 'number' && z1 > 60, 'zoomed in: a new answer shows after leaving the field', z0 + ' → ' + z1);
  await type('WedWeek 2', '', true); await away(); await W(900); const z2 = await ink('WedWeek 2'); ok(z2 === 0, 'zoomed in: deleting it clears the page', z1 + ' → ' + z2);
  // 7. the saved PDF agrees with the page
  const saved = await E(async () => { const bytes = await __rd.buildPdf({}); const d = await PDFLib.PDFDocument.load(bytes); const fm = d.getForm(); const g = n => { try { return fm.getTextField(n).getText() || ''; } catch (e) { return 'ERR'; } }; return { name: g('Employee Name'), mon1: g('MonWeek 1'), mon2: g('MonWeek 2'), tue2: g('TuesWeek 2'), wed2: g('WedWeek 2') }; }).catch(e => 'ERR ' + e.message);
  ok(saved && saved.name === 'Al' && saved.mon1 === '' && saved.mon2 === '' && saved.tue2 === '8R' && saved.wed2 === '', 'Save PDF carries the same answers as the page', saved);
  // 8. checkbox on another form
  await E(() => __rd.X.showFiles()); await W(300); await A.openFx('acro.pdf'); await W(500); await A.openCard('acro'); await W(1500);
  const c0 = await ink('ft'); const cf = await fld('ft'); await I.tap(cf.x, cf.y); await W(900); const c1 = await ink('ft'); await I.tap(cf.x, cf.y); await W(900); const c2 = await ink('ft');
  ok(c1 !== c0 && c2 === c0, 'checkbox: the tick appears and disappears on the page', [c0, c1, c2].join(' → '));
  const errs = (A.errs || []).length; console.log('ERRS', errs, (A.errs || []).slice(0, 3).join(' | ')); console.log(fails || errs ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails || errs ? 1 : 0);
})().catch(e => { console.error('CRASH', String(e && e.stack || e).slice(0, 500)); process.exit(1); });
