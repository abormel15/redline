// THUMBFIT86: Pages panel thumbnails grow with the panel, flow into columns, stay sharp, and drag-to-reorder still works (1 column and several).
const lib = require('./aud_lib.js');
(async () => { const A = await lib({}); const { pg, W, E, I } = A; let fails = 0; const ok = (c, n, d) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + n + (d != null ? ' | ' + (typeof d === 'string' ? d : JSON.stringify(d)) : '')); };
  const FINGER = I.name !== 'PC';
  await A.openFx('set12.pdf'); await W(800); await A.el('#bPages'); await W(1200); console.log('mode', I.name);
  const meas = () => E(() => { const box = document.getElementById('thumbs'), t = [...box.querySelectorAll('.thumb')].filter(e => !e.hidden), sc = box.parentElement.getBoundingClientRect(); const r = t.map(b => { const q = b.getBoundingClientRect(), c = b.querySelector('canvas'); return { x: Math.round(q.left), y: Math.round(q.top), cx: q.left + q.width / 2, cy: q.top + q.height / 2, w: Math.round(q.width), h: Math.round(q.height), cw: Math.round(c.clientWidth), bm: c.width, id: b.dataset.id }; }); return { panel: Math.round(document.getElementById('pagesPanel').getBoundingClientRect().width), inner: Math.round(sc.width), cols: __rd.X.thumbCols86(), r, order: __rd.S.pages.map(p => p.n).join(','), dpr: devicePixelRatio }; });
  const grip = () => E(() => { const r = document.querySelector('#pagesPanel .rsz').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.75 }; });
  const widen = async dx => { const h = await grip(); if (FINGER) await A.finger.drag(h.x, h.y, h.x + dx, h.y, 10); else await I.mdrag(h.x, h.y, h.x + dx, h.y); await W(900); };
  const m0 = await meas(); ok(m0.cols === 1 && m0.r[0].cw >= 120, 'default width: one column, thumbnail fills it', `panel ${m0.panel}, thumb ${m0.r[0].cw}`);
  await widen(90); const m1 = await meas(); ok(m1.cols === 1 && m1.r[0].cw > m0.r[0].cw + 60 && m1.r[0].cw > m1.inner * 0.8, 'wider: the thumbnail grows to fill the panel', `panel ${m0.panel}→${m1.panel}, thumb ${m0.r[0].cw}→${m1.r[0].cw}`);
  ok(m1.r[0].bm >= Math.round(m1.r[0].cw * Math.min(2, m1.dpr) * 0.88), 'wider: the picture is redrawn at the new size (not a stretched small one)', `bitmap ${m1.r[0].bm}px for ${m1.r[0].cw}px on screen ×${m1.dpr}`);
  // reorder in one column: page 1 below page 2
  const drag = async (a, b, fx) => { const x1 = b.x + b.w * fx, y1 = b.cy; if (FINGER) await A.finger.drag(a.cx, a.cy, x1, y1, 14, 480); else await I.mdrag(a.cx, a.cy, x1, y1, 16); await W(700); };
  { const a = m1.r[0], b = m1.r[1]; if (FINGER) await A.finger.drag(a.cx, a.cy, b.cx, b.y + b.h * 0.8, 14, 480); else await I.mdrag(a.cx, a.cy, b.cx, b.y + b.h * 0.8, 16); await W(700); const m = await meas(); ok(m.order.startsWith('2,1,3'), 'one column: drag page 1 below page 2', m.order); }
  await widen(280); const m2 = await meas(); ok(m2.cols >= 2 && m2.r[1].y === m2.r[0].y && m2.r[1].x > m2.r[0].x, 'much wider: thumbnails shift into columns', `panel ${m2.panel}, ${m2.cols} columns, thumb ${m2.r[0].cw}`);
  ok(m2.r[m2.cols].y > m2.r[0].y && m2.r[m2.cols].x === m2.r[0].x, 'the next row starts under the first thumbnail', [m2.r[0].x, m2.r[m2.cols].x]);
  const used = m2.cols * m2.r[0].w + (m2.cols - 1) * 10; ok(used > m2.inner * 0.9, 'the columns fill the width of the panel', `${used} of ${m2.inner}px`);
  // reorder across columns: first thumbnail to the right half of the second (lands between 2nd and 3rd)
  { const a = m2.r[0], b = m2.r[1]; await drag(a, b, 0.8); const m = await meas(); ok(m.order.startsWith('1,2,3'), 'columns: drag the first page past the second (same row)', m.order); }
  // and from the second row up to the very first place
  { const m = await meas(), a = m.r[m.cols], b = m.r[0]; await drag(a, b, 0.2); const mm = await meas(); const want = ['1', '2', '3', '4', '5', '6'][m.cols]; ok(mm.order.split(',')[0] === m.order.split(',')[m.cols], 'columns: drag a page from the second row to the first place', mm.order); }
  await E(() => document.getElementById('bUndo').click()); await W(500);
  // back to narrow: one column again
  await widen(-600); const m3 = await meas(); ok(m3.cols === 1 && m3.panel <= 200, 'narrow again: back to one column', `panel ${m3.panel}, thumb ${m3.r[0].cw}`);
  // the width is remembered
  const wL = await E(() => getComputedStyle(document.documentElement).getPropertyValue('--wL').trim()); ok(/px$/.test(wL), 'panel width is kept for next time', wL);
  const errs = (A.errs || []).length; console.log('ERRS', errs, (A.errs || []).slice(0, 3).join(' | ')); console.log(fails || errs ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails || errs ? 1 : 0);
})().catch(e => { console.error('CRASH', String(e && e.stack || e).slice(0, 500)); process.exit(1); });
