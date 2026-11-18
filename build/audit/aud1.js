// audit 1: every rail tool, driven the PC way or the iPad way; prints one outcome line per tool
const lib = require('./aud_lib.js');
(async () => { const A = await lib({}); const { I, E, W, pg } = A; const out = {};
  await A.openFx('docA.pdf'); await A.fitView(); await W(900);
  const tools = await E(() => [...new Set([...document.querySelectorAll('#rail .btn[data-tool]')].map(b => b.dataset.tool))]);
  let P, tx; const place = async () => { await A.fitView();
  P = { a: await A.pt(0.30, 0.55), b: await A.pt(0.55, 0.75), c: await A.pt(0.55, 0.55), d: await A.pt(0.40, 0.85), txt: await A.pt(0.30, 0.215) };
  // where the page's own text really is (first text item of the PDF), for the text tools
tx = await E(async () => { const S = __rd.S, p0 = S.pages[S.cur], page = await __rd.X.getPdfPage86(p0), tc = await page.getTextContent(); const it = tc.items.find(i => /Row 2/.test(i.str)) || tc.items[0]; const vp = page.getViewport({ scale: 1, rotation: p0.baseRot }); const [x, y] = vp.convertToViewportPoint(it.transform[4], it.transform[5]); const v = S.view, r = document.getElementById('stage').getBoundingClientRect(); return { x: r.left + v.tx + x * v.s, y: r.top + v.ty + (y - it.height * 0.4) * v.s, w: it.width * v.s }; });
  };
  const KIND = { tap: ['note', 'pin', 'count', 'bucket', 'edittext', 'photomk', 'sticky'], multi: ['polyline', 'polygon', 'perimeter', 'area', 'angle', 'cutout'], skip: ['image', 'camera'] };
  for (const t of tools) { let res = '', err0 = A.errs.length;
    try { await A.reset(); await place();
      if (t === 'eraser') { await A.rail('pen'); await I.drag(P.a.x, P.a.y, P.b.x, P.a.y); await W(300); await E(() => { __rd.S.sel.clear(); __rd.changed(); }); }
      if (['marquee', 'bucket'].includes(t)) { await E(() => __rd.applyActions([{ do: 'add', type: 'rect', box: [150, 150, 600, 450] }])); await W(300); await E(() => { __rd.S.sel.clear(); __rd.changed(); }); }
      if (t === 'cutout') { await E(() => __rd.applyActions([{ do: 'add', type: 'area', points: [[100, 100], [700, 100], [700, 500], [100, 500]] }])); await W(300); await E(() => { __rd.S.sel.clear(); __rd.changed(); }); }
      if (KIND.skip.includes(t)) { out[t] = 'file picker (not driven)'; continue; }
      await A.rail(t); const s0 = await A.sig(); const diff = (s1) => Object.keys(s1).filter(k => k !== 'toast' && JSON.stringify(s1[k]) !== JSON.stringify(s0[k])).map(k => k + ':' + s1[k]).join(' ');
      if (s0.modal || s0.win || s0.menu) res = 'opens ' + (s0.modal || (s0.win ? 'window' : 'menu'));
      else if (t === 'eraser') { const mx = (P.a.x + P.b.x) / 2; await I.drag(mx, P.a.y - 40, mx, P.a.y + 40); await W(500); const s1 = await A.sig(); res = s1.n === 2 ? 'ink rubbed: stroke split in 2' : (diff(s1) || 'NOTHING'); }
      else if (t === 'tsel') { await I.drag(tx.x + 4, tx.y, tx.x + Math.min(tx.w, 200), tx.y); await W(600); res = diff(await A.sig()) || 'NOTHING'; }
      else if (t === 'edittext') { await I.tap(tx.x + 30, tx.y); await W(900); res = diff(await A.sig()) || 'NOTHING'; }
      else if (KIND.tap.includes(t)) { await I.tap(P.c.x, P.c.y); await W(600); let s1 = await A.sig(); if (t === 'count') { await I.tap(P.b.x, P.b.y); await W(300); s1 = await A.sig(); } res = diff(s1) || 'NOTHING'; }
      else if (t === 'cutout') { for (const [fx, fy] of [[0.20, 0.15], [0.50, 0.15], [0.50, 0.40], [0.20, 0.40]]) { const q = await A.pt(fx, fy); await I.tap(q.x, q.y); await W(220); } await A.el('#bDraftDone'); await W(500); const h = await E(() => (__rd.S.markups[0].holes || []).length); res = h ? 'opening cut: holes ' + h : 'NOTHING'; }
      else if (KIND.multi.includes(t)) { await I.tap(P.a.x, P.a.y); await W(200); await I.tap(P.c.x, P.c.y); await W(200); await I.tap(P.b.x, P.b.y); await W(200); let s1 = await A.sig(); if (s1.draft && t !== 'cutout') { await I.dbl(P.d.x, P.d.y); await W(500); s1 = await A.sig(); } res = diff(s1) || 'NOTHING'; if (s1.draft) res += ' STILL-DRAFT'; if (t === 'cutout') { if (s1.draft) { await A.el('#bDraftDone'); await W(400); } const h = await E(() => (__rd.S.markups[0].holes || []).length); res = h ? 'opening cut: holes ' + h : 'NOTHING'; } }
      else { await I.drag(P.a.x, P.a.y, P.b.x, P.b.y); await W(500); res = diff(await A.sig()) || 'NOTHING'; }
    } catch (e) { res = 'THROW ' + e.message.slice(0, 80); }
    if (A.errs.length > err0) res += ' ERR ' + A.errs.slice(err0).join(';').slice(0, 120);
    out[t] = res.replace(/view:[^ ]+/, 'view:moved'); }
  for (const t of tools) console.log(t.padEnd(10), out[t]);
  await A.b.close(); })();
