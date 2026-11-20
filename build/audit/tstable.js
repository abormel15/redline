// the frozen "stable" copy next to the main version, same origin, as on GitHub Pages: /redline/ and /redline/stable/
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8767/redline/';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true, userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
  const out = []; const ok = (n, c, x) => { out.push((c ? 'PASS ' : 'FAIL ') + n + (x != null ? ' — ' + (typeof x === 'string' ? x : JSON.stringify(x)) : '')); };
  const errs = [];
  const open = async (url) => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(url + ' ' + e.message)); await pg.addInitScript(() => { try { localStorage.setItem('rd:tour_home', 'true'); localStorage.setItem('rd:tour_doc', 'true'); } catch (e) {} }); await pg.goto(url); await pg.waitForTimeout(3500); return pg; };
  const info = pg => pg.evaluate(async () => { const regs = await navigator.serviceWorker.getRegistrations(); const scrimText0 = (document.querySelector('.scrim') || {}).textContent || ''; return { build: await (async () => { try { document.querySelectorAll('.scrim').forEach(x => x.remove()); const it = window.moreItems().find(i => i && /Settings/.test(i.label)); it && it.fn(); await new Promise(r => setTimeout(r, 400)); const t = document.querySelector('.scrim') ? document.querySelector('.scrim').textContent : ''; document.querySelectorAll('.scrim').forEach(x => x.remove()); const m = t.match(/86\.\d+ · [^·]{6,14} · (iPad edition|shared copy)/); return m ? m[0] : 'no label in Settings'; } catch (e) { return 'ERR ' + e.message; } })(), flag: !!window.__rdNoAccount86, scopes: regs.map(r => new URL(r.scope).pathname), ctl: navigator.serviceWorker.controller ? new URL(navigator.serviceWorker.controller.scriptURL).pathname : null, caches: await caches.keys(), scrim: !!document.querySelector('.scrim'), scrimText: scrimText0 }; });
  const menuLabels = async pg => { await pg.evaluate(() => { document.getElementById('flMore').click(); }); await pg.waitForTimeout(300); const r = await pg.evaluate(() => [...document.querySelectorAll('.menu button, .menu .mi, .menu [role=menuitem]')].map(x => x.textContent.trim().slice(0, 60))); await pg.keyboard.press('Escape'); await pg.evaluate(() => document.querySelectorAll('.menu').forEach(m => m.remove())); return r; };
  const settings = async pg => { const r = await pg.evaluate(async () => { document.querySelectorAll('.scrim').forEach(x => x.remove()); { const it = window.moreItems().find(i => i && /Settings/.test(i.label)); it && it.fn(); } await new Promise(r => setTimeout(r, 400)); const t = document.querySelector('.scrim') ? document.querySelector('.scrim').textContent : ''; const has = !!document.querySelector('#sbAcct'); document.querySelectorAll('.scrim').forEach(x => x.remove()); return { has, acct: /Redline account/.test(t), backup: /Back up everything to a file/.test(t) }; }); return r; };

  // 1. the stable copy, first visit on a clean device
  const s = await open(BASE + 'stable/'); let i = await info(s);
  ok('stable: boots with the shared-copy label', /shared copy/.test(i.build || ''), i.build);
  ok('stable: no-account switch is on', i.flag);
  ok('stable: no What’s new card on a first visit', !/What’s new/.test(i.scrimText), i.scrimText.slice(0, 60));
  ok('stable: its own service worker, scoped to stable/', i.scopes.some(p => /\/stable\/$/.test(p)), i.scopes);
  ok('stable: its own cache names', i.caches.some(k => k.startsWith('rds-shell-')) && !i.caches.some(k => k.startsWith('rd-shell-')), i.caches);
  let ml = await menuLabels(s); ok('stable: Files › More has no sign-in', ml.length > 3 && !ml.some(x => /sign in/i.test(x)), ml.length + ' items');
  let st = await settings(s); ok('stable: Settings has no account block, still has Back up', !st.has && !st.acct && st.backup, st);
  const toast = await s.evaluate(async () => { __rd.X.cloudEnable86(); await new Promise(r => setTimeout(r, 300)); const t = [...document.querySelectorAll('.toast, #toast, [class*=toast]')].map(x => x.textContent).join('|'); return { t, dialog: !!document.querySelector('.scrim') }; });
  ok('stable: turning on the account does nothing but explain', !toast.dialog && /keeps everything on this device/.test(toast.t), toast.t.slice(0, 80));
  const sd = await s.evaluate(async () => { __rd.X.signInDialog86(); await new Promise(r => setTimeout(r, 300)); return !!document.querySelector('.scrim'); }).catch(e => 'ERR ' + e.message);
  ok('stable: the sign-in dialog cannot open', sd === false, sd);
  const help = await s.evaluate(() => __rd.X.helpTopics86().filter(t => /account/i.test(t))); ok('stable: Help has no account topic', Array.isArray(help) && help.length === 0, help);
  const net = []; s.on('request', r => { if (/supabase/.test(r.url())) net.push(r.url()); }); await s.reload(); await s.waitForTimeout(3500); ok('stable: no request to the account server on load', net.length === 0, net.slice(0, 2));
  // a document made in stable stays after a reload
  const kept = await s.evaluate(async () => { const n = (typeof S !== 'undefined' && S.lib) ? S.lib.length : -1; return n; });
  // guide
  const g = await open(BASE + 'stable/guide/'); const gi = await g.evaluate(() => ({ account: !!document.getElementById('account'), cards: document.querySelectorAll('article.card').length, txt: document.body.textContent.includes('in your account') })); ok('stable guide: opens, no account card', gi.cards > 10 && !gi.account, gi); await g.close();

  // 2. the main version on the same device afterwards
  const m = await open(BASE); i = await info(m);
  ok('main: boots with its own label', /iPad edition/.test(i.build || '') && !i.flag, i.build);
  ml = await menuLabels(m); ok('main: Files › More still offers sign-in', ml.some(x => /sign in/i.test(x)));
  st = await settings(m); ok('main: Settings still has the account block', st.has, st);
  await m.reload(); await m.waitForTimeout(3000); i = await info(m);
  ok('main: has its cache; stable’s cache was not cleared by it', i.caches.some(k => k.startsWith('rd-shell-')) && i.caches.some(k => k.startsWith('rds-shell-')), i.caches);
  ok('main: controlled by the main service worker', /\/redline\/sw\.js$/.test(i.ctl || ''), i.ctl);

  // 3. stable again: still stable, controlled by its own worker, and it opens with no connection
  await s.reload(); await s.waitForTimeout(3000); i = await info(s);
  ok('stable after main: controlled by its own worker', /\/stable\/sw\.js$/.test(i.ctl || ''), i.ctl);
  await ctx.setOffline(true); await s.reload().catch(() => {}); await s.waitForTimeout(3500); i = await info(s).catch(e => ({ build: 'ERR ' + e.message }));
  ok('stable offline: opens, and is the shared copy (not the main one)', /shared copy/.test(i.build || '') && i.flag, i.build);
  await m.reload().catch(() => {}); await m.waitForTimeout(3000); i = await info(m).catch(e => ({ build: 'ERR ' + e.message }));
  ok('main offline: opens, and is the main version', /iPad edition/.test(i.build || '') && !i.flag, i.build);
  await ctx.setOffline(false);
  ok('no page errors', errs.length === 0, errs.slice(0, 3));
  console.log(out.join('\n')); console.log(out.filter(x => x.startsWith('FAIL')).length ? 'FAILED' : 'ALL PASS ' + out.length);
  await b.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
