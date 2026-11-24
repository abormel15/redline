// WHEELZOOM86: Ctrl + mouse wheel zooms in steps; a trackpad pinch (small deltas) is unchanged.
const lib = require('./aud_lib.js');
(async () => { const A = await lib({}); const { pg, W, E } = A; let fails = 0; const ok = (c, n, d) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + n + (d != null ? ' | ' + (typeof d === 'string' ? d : JSON.stringify(d)) : '')); };
  await A.openFx('set12.pdf'); await W(900); const z = () => E(() => __rd.S.view.s); const pct = () => E(() => document.getElementById('zoomPct').textContent);
  const wheel = async (dy, n = 1) => { await pg.mouse.move(700, 450); await pg.keyboard.down('Control'); for (let i = 0; i < n; i++) { await pg.mouse.wheel(0, dy); await W(60); } await pg.keyboard.up('Control'); await W(300); };
  const s0 = await z(), p0 = await pct(); await wheel(-100); const s1 = await z(); ok(s1 / s0 > 1.15 && s1 / s0 < 1.3, 'one wheel notch in: about 20% closer', `${p0} → ${await pct()} (×${(s1 / s0).toFixed(2)})`);
  await wheel(100); const s2 = await z(); ok(Math.abs(s2 / s0 - 1) < 0.02, 'one notch out: back where it was', `×${(s2 / s0).toFixed(3)}`);
  await wheel(-480); const s3 = await z(); ok(s3 / s2 < 1.3, 'a big wheel step (fast mouse, 480 at once) is still one step, not a leap', `×${(s3 / s2).toFixed(2)}`); await wheel(480);
  const sa = await z(); await wheel(-100, 5); const sb = await z(); ok(sb / sa > 2.2 && sb / sa < 3.2, 'five notches: about 2.7× closer, every step in between shown', `×${(sb / sa).toFixed(2)}`); await wheel(100, 5);
  const sc = await z(); await wheel(-3); const sd = await z(); ok(Math.abs(sd / sc - Math.exp(0.03)) < 0.005, 'a trackpad pinch (small delta) zooms as before', `×${(sd / sc).toFixed(3)}`);
  // keys and buttons still zoom
  const se = await z(); await pg.keyboard.press('Control+Equal'); await W(300); const sf = await z(); ok(sf > se, 'Ctrl + plus still zooms in', `×${(sf / se).toFixed(2)}`);
  // without Ctrl the wheel scrolls the sheet
  const v0 = await E(() => ({ s: __rd.S.view.s, ty: __rd.S.view.ty })); await pg.mouse.wheel(0, 120); await W(300); const v1 = await E(() => ({ s: __rd.S.view.s, ty: __rd.S.view.ty })); ok(v1.s === v0.s && v1.ty !== v0.ty, 'wheel without Ctrl scrolls, does not zoom', `${Math.round(v0.ty)} → ${Math.round(v1.ty)}`);
  const errs = (A.errs || []).length; console.log('ERRS', errs); console.log(fails || errs ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails || errs ? 1 : 0);
})().catch(e => { console.error('CRASH', String(e && e.stack || e).slice(0, 500)); process.exit(1); });
