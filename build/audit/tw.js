// shared helper for the day-to-day workout tests: iPad-sized page, Pencil (pen pointer with pressure) and fingers (touch)
const { chromium } = require('playwright');
module.exports = async function boot(opts = {}) {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const VP = process.env.VP === 'air' ? { width: 1180, height: 820 } : process.env.VP === 'mini' ? { width: 1133, height: 744 } : process.env.VP === 'airp' ? { width: 820, height: 1180 } : process.env.VP === 'prop' ? { width: 1032, height: 1376 } : { width: 1376, height: 1032 }; const PC = process.env.VP === 'pc' || !!opts.pc; const mkCtx = () => PC ? b.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: false, deviceScaleFactor: 1, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' }) : b.newContext({ viewport: VP, hasTouch: true, deviceScaleFactor: 2 });
  const setup = async (ctx) => {
  const pg = await ctx.newPage(), errs = [], warns = [];
  pg.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_TUNNEL|net::/.test(m.text())) warns.push(m.text().slice(0, 160)); });
  await pg.addInitScript(() => { try { localStorage.setItem('rd:tour_home', 'true'); localStorage.setItem('rd:tour_doc', 'true'); } catch (e) {} });
  if (!opts.fs) await pg.addInitScript(() => { window.__rdNoFS86 = true; }); /* tests expect downloads unless they stub the file pickers */
  if (opts.init) await pg.addInitScript(opts.init);
  await pg.goto(process.env.URL ? process.env.URL + '?nohome' : `http://localhost:${process.env.PORT || 8765}/${opts.page || process.env.PAGE || 'index.html'}?nohome`); await pg.waitForTimeout(2500);
  const cdp = await ctx.newCDPSession(pg);
  const E = (f, a) => pg.evaluate(f, a);
  const W = ms => pg.waitForTimeout(ms);
  // Pencil
  const penEv = (type, x, y, force) => cdp.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, pointerType: 'pen', force });
  const pen = {
    down: (x, y, f = 0.5) => penEv('mousePressed', x, y, f), move: (x, y, f = 0.5) => penEv('mouseMoved', x, y, f), up: (x, y) => penEv('mouseReleased', x, y, 0),
    tap: async (x, y) => { await penEv('mousePressed', x, y, 0.4); await W(40); await penEv('mouseReleased', x, y, 0); },
    stroke: async (pts, step = 8) => { await penEv('mousePressed', pts[0][0], pts[0][1], 0.4); for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 3)); for (let k = 1; k <= n; k++) { await penEv('mouseMoved', x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, 0.5 + 0.2 * Math.sin(k)); if (k % 6 === 0) await W(step); } } const e = pts[pts.length - 1]; await penEv('mouseReleased', e[0], e[1], 0); await W(120); },
    hold: async (x, y, ms = 800) => { const t0 = Date.now(); let s = 1; while (Date.now() - t0 < ms) { s = (s * 9301 + 49297) % 233280; await penEv('mouseMoved', x + (s / 233280 - 0.5) * 2, y + ((s * 7) % 233280 / 233280 - 0.5) * 2, 0.5); await W(8); } },
    strokeHold: async (pts, ms = 800) => { await penEv('mousePressed', pts[0][0], pts[0][1], 0.4); for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 3)); for (let k = 1; k <= n; k++) { await penEv('mouseMoved', x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, 0.5); if (k % 6 === 0) await W(8); } } const e = pts[pts.length - 1]; await pen.hold(e[0], e[1], ms); await penEv('mouseReleased', e[0], e[1], 0); await W(150); } };
  // fingers
  const tev = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: i + 1 })) });
  const finger = {
    tap: async (x, y) => { await tev('touchStart', [[x, y]]); await W(50); await tev('touchEnd', []); await W(80); },
    longPress: async (x, y, ms = 700) => { await tev('touchStart', [[x, y]]); await W(ms); await tev('touchEnd', []); await W(120); },
    drag: async (x0, y0, x1, y1, steps = 12, hold = 0) => { await tev('touchStart', [[x0, y0]]); if (hold) await W(hold); for (let i = 1; i <= steps; i++) { await tev('touchMove', [[x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps]]); await W(16); } await tev('touchEnd', []); await W(150); },
    pinch: async (cx, cy, r0, r1, steps = 12) => { const P = r => [[cx - r, cy], [cx + r, cy]]; await tev('touchStart', [P(r0)[0]]); await tev('touchStart', P(r0)); for (let i = 1; i <= steps; i++) { await tev('touchMove', P(r0 + (r1 - r0) * i / steps)); await W(16); } await tev('touchEnd', [P(r1)[0]]); await tev('touchEnd', []); await W(200); },
    twoDrag: async (x0, y0, dx, dy, steps = 10) => { const P = (x, y) => [[x - 40, y], [x + 40, y]]; await tev('touchStart', [P(x0, y0)[0]]); await tev('touchStart', P(x0, y0)); for (let i = 1; i <= steps; i++) { await tev('touchMove', P(x0 + dx * i / steps, y0 + dy * i / steps)); await W(16); } await tev('touchEnd', [P(x0 + dx, y0 + dy)[0]]); await tev('touchEnd', []); await W(200); } };
  const tapEl = async sel => { const bb = await E(sel => { for (const el of document.querySelectorAll(sel)) { const r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0 && !el.closest('[hidden]')) return { x: r.left, y: r.top, width: r.width, height: r.height }; } return null; }, sel); if (!bb) throw new Error('no visible element ' + sel); await finger.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); return bb; };
  const tapRail = async tool => { await E(t => { const r = document.getElementById('rail'), b = r.querySelector(`.btn[data-tool="${t}"]`); if (b) b.scrollIntoView({ block: 'center' }); }, tool); await W(60); await tapEl(`#rail .btn[data-tool="${tool}"]`); await W(200); };
  const viewBox = () => E(() => { const r = document.getElementById('view').getBoundingClientRect(); let right = r.right; for (const id of ['listPanel', 'notesPanel', 'toolPanel', 'artPanel']) { const p = document.getElementById(id); if (!p || p.hidden) continue; const q = p.getBoundingClientRect(); if (q.width > 0 && q.left < right && q.left > r.left) right = q.left; } return { x: r.left, y: r.top, width: right - r.left, height: r.height }; }); // the part of the sheet not under a side panel
  const state = () => E(() => { const S = __rd.S, m = S.markups[S.markups.length - 1]; return { n: S.markups.length, tool: S.tool, last: m ? { type: m.type, id: m.id, pts: m.pts && m.pts.length, text: m.text, page: m.page } : null, cur: S.cur, view: { ...S.view }, sel: [...S.sel], editing: !!S.editing, draft: !!S.draft, undo: S.undo.length, redo: S.redo.length }; });
  const screenOf = id => E(id => { const m = __rd.S.markups.find(x => x.id === id); if (!m) return null; const b = __rd.X.bboxPub(m), v = __rd.S.view, r = document.getElementById('view').getBoundingClientRect(); return { x: r.left + v.tx + ((b.x0 + b.x1) / 2) * v.s, y: r.top + v.ty + ((b.y0 + b.y1) / 2) * v.s, x0: r.left + v.tx + b.x0 * v.s, y0: r.top + v.ty + b.y0 * v.s, x1: r.left + v.tx + b.x1 * v.s, y1: r.top + v.ty + b.y1 * v.s }; }, id);
  const ui = () => E(() => ({ modal: [...document.querySelectorAll('.scrim .modal h3, .scrim .modal h2')].map(h => h.textContent.trim()).join('|').slice(0, 80), menu: !!document.querySelector('.menu'), editing: !!__rd.S.editing, win: [...document.querySelectorAll('.calcwin:not([hidden]), #tkwin:not([hidden])')].length, toast: (document.getElementById('toast') || {}).textContent }));
  const clean = async () => { await pg.keyboard.press('Escape').catch(() => {}); await E(() => { document.querySelectorAll('.scrim').forEach(s => s.remove()); try { __rd.X.commitEdit && __rd.X.commitEdit(); } catch (e) {} document.querySelectorAll('.menu').forEach(m => m.remove()); const w = document.querySelector('#tkwin'); if (w) w.hidden = true; document.querySelectorAll('.calcwin').forEach(c => c.hidden = true); }); await W(100); };
  const F = [], L = [];
  const ok = (cond, name, info) => { L.push((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' ' + JSON.stringify(info).slice(0, 220) : '')); if (!cond) F.push(name); };
  const finish = async () => { for (const l of L) console.log(l); console.log('ERRS', errs.length, errs.slice(0, 6).join(' | ')); if (warns.length) console.log('CONSOLE', warns.slice(0, 6).join(' | ')); console.log(F.length ? 'FAILED ' + F.join(', ') : 'ALL OK'); await b.close(); };
  const openFx = async (name) => { await pg.setInputFiles('#fOpen', __dirname + '/fx/' + name); await W(3000); };
  const fitView = async () => { await E(() => { __rd.X.fitPub(); }); await W(400); };
  return { PC, b, ctx, pg, cdp, E, W, pen, finger, tapEl, tapRail, viewBox, state, screenOf, ui, clean, ok, finish, errs, warns, openFx, fitView, F };
  };
  const T = await setup(await mkCtx()); T.newDevice = async () => setup(await mkCtx()); return T;
};
