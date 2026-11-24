// ORGANIZE86 v2: existing folders first (loose name match, nested, "named like what is already there"), more ways to group, a second level,
// per-document control, typed folder names, Undo.
const lib = require('./aud_lib.js'); const fs = require('fs');
(async () => { const A = await lib({}); const { pg, W, E, I } = A; let fails = 0; const ok = (c, n, d) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + n + (d != null ? ' | ' + (typeof d === 'string' ? d : JSON.stringify(d)) : '')); };
  console.log('mode', I.name);
  await E(() => __rd.X.showFiles()); await W(400);
  const files = fs.readdirSync(__dirname + '/fx/org').filter(f => /\.pdf$/.test(f)).map(f => __dirname + '/fx/org/' + f);
  for (const f of files) { await pg.setInputFiles('#fOpen', f); await W(1200); await E(() => __rd.X.showFiles()); await W(200); }
  // the folders he "already has": one whose name is written differently, one nested, one that holds a similar document, one empty
  await E(() => { const S = __rd.S; S.folders = [...S.folders, { id: 'fLee', name: '106 South Lee', parent: '' }, { id: 'fProj', name: 'Projects', parent: '' }, { id: 'fCam', name: 'Cameron Oaks', parent: 'fProj' }, { id: 'fMarvel', name: 'Marvel', parent: '' }, { id: 'fPaper', name: 'Paperwork', parent: '' }, { id: 'fOld', name: 'Old stuff', parent: '' }];
    S.lib = S.lib.map(d => d.name === 'Time Sheet Nov 9 2026' ? { ...d, folder: 'fPaper' } : d); S.curFolder = ''; __rd.X.showFiles(); }); await W(400);
  const state = () => E(() => { const S = __rd.S, path = id => { const o = []; let f = S.folders.find(x => x.id === id), g = 0; while (f && g++ < 9) { o.unshift(f.name); f = S.folders.find(x => x.id === f.parent); } return o.join(' › '); }; const o = {}; for (const d of S.lib) { if (d.tpl) continue; o[d.name] = path(d.folder); } return { docs: o, folders: S.folders.map(f => path(f.id)).sort() }; });
  const tapAt = async r => { await I.tap(r.x, r.y); await W(350); };
  const tapEl = async sel => { const r = await E(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2, w: q.width }; }, sel); if (!r || !r.w) throw new Error('not visible: ' + sel); await tapAt(r); };
  const rows = () => E(() => [...document.querySelectorAll('.scrim .orgRow86')].map(r => ({ name: r.querySelector('input[type=text]').value, ro: r.querySelector('input[type=text]').readOnly, tag: r.querySelector('.orgTag86').textContent, names: r.querySelector('.orgNames86').textContent })));
  const rowBtn = (name, sel) => E(([name, sel]) => { const r = [...document.querySelectorAll('.scrim .orgRow86')].find(r => r.querySelector('input[type=text]').value === name); if (!r) return null; const e = r.querySelector(sel); e.scrollIntoView({ block: 'nearest' }); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, [name, sel]);
  const fmt = r => r.map(x => x.name + ' [' + x.tag + ']').join(' | ');
  const hideBar = () => E(() => { const b = document.getElementById('orgUndo86'); if (b) b.hidden = true; });
  const s0 = await state(); const loose = Object.keys(s0.docs).filter(n => s0.docs[n] === '' && files.some(f => f.endsWith('/' + n + '.pdf'))); ok(loose.length === 13, 'thirteen loose documents, one already in Paperwork', loose.length);

  // --- 1. by project name: folders that exist are used first
  await tapEl('#flOrganize86'); let r = await rows(); const by = n => r.find(x => x.name === n);
  ok(!!by('106 South Lee') && by('106 South Lee').ro && /^3 docs · folder you have/.test(by('106 South Lee').tag), '“106 S Lee St …” ×3 go to the folder you have called “106 South Lee” (written differently)', fmt(r));
  ok(!!by('Projects › Cameron Oaks') && /^3 docs · folder you have/.test(by('Projects › Cameron Oaks').tag) && /CAM punch list/.test(by('Projects › Cameron Oaks').names), 'a folder inside another folder is found (Projects › Cameron Oaks), and the job code CAM lands there too', by('Projects › Cameron Oaks') && by('Projects › Cameron Oaks').names);
  ok(!!by('Paperwork') && /^2 docs · folder you have/.test(by('Paperwork').tag), 'the two time sheets join the time sheet that is already in “Paperwork”');
  ok(!!by('Marvel') && /^1 doc · folder you have/.test(by('Marvel').tag) && !r.some(x => /new folder/.test(x.tag)), 'no new folder is proposed while existing ones fit');
  const sh = await rowBtn('Paperwork', '.orgMore86'); await tapAt(sh); const why = await E(() => [...document.querySelectorAll('.scrim .orgDoc86')].map(l => l.textContent)); ok(why.length === 2 && why.every(t => /named like “Time Sheet Nov 9 2026”, which is already in this folder/.test(t)), 'Show lists each document with the reason it was put there', why[0]);
  // untick one document
  const dc = await E(() => { const l = [...document.querySelectorAll('.scrim .orgDoc86')].find(l => /Nov 23/.test(l.textContent)), c = l.querySelector('input'); c.scrollIntoView({ block: 'nearest' }); const q = c.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }); await tapAt(dc);
  r = await rows(); ok(/^1 of 2 docs/.test(r.find(x => x.name === 'Paperwork').tag), 'a single document can be unticked', r.find(x => x.name === 'Paperwork').tag);
  const goT = await E(() => document.querySelector('.scrim #orgGo').textContent); ok(goT === 'Organize 8 documents', 'the button counts what will move', goT);
  await tapEl('.scrim #orgGo'); await W(900); let s = await state();
  ok(s.docs['106 S Lee St survey'] === '106 South Lee' && s.docs['106 S Lee St bld plan 20260401'] === '106 South Lee' && s.docs['Cameron Oaks PM Manual'] === 'Projects › Cameron Oaks' && s.docs['CAM punch list'] === 'Projects › Cameron Oaks' && s.docs['Time Sheet Nov 16 2026'] === 'Paperwork' && s.docs['Time Sheet Nov 23 2026'] === '' && s.docs['Marvel Phase 1 guide'] === 'Marvel', 'they moved into the folders that were already there; the unticked one stayed');
  ok(s.folders.length === s0.folders.length, 'no folder was created', s.folders.length + ' folders before and after');
  const bar = await E(() => { const b = document.getElementById('orgUndo86'); return b && !b.hidden ? b.textContent : ''; }); ok(/8 documents into 4 folders \(all ones you had\)/.test(bar), 'the bar says so, with Undo', bar);
  await tapEl('#orgUndoBtn86'); await W(900); s = await state(); ok(loose.every(n => s.docs[n] === '') && s.docs['Time Sheet Nov 9 2026'] === 'Paperwork', 'Undo puts all of them back; the document that was already filed is untouched');

  // --- 2. the same without existing folders: new ones are proposed
  await tapEl('#flOrganize86'); await tapEl('.scrim #orgOld'); r = await rows(); ok(r.some(x => x.name === '106 S Lee St' && /new folder/.test(x.tag)) && r.some(x => x.name === 'Cameron Oaks' && /^2 docs · new folder/.test(x.tag)) && r.some(x => x.name === 'Time Sheet'), 'with “use the folders I already have” off it proposes new folders from the names', fmt(r));
  await tapEl('.scrim #orgOld');
  // a typed name that is an existing folder is that folder
  await tapEl('.scrim #orgOld'); await E(() => { const row = [...document.querySelectorAll('.scrim .orgRow86')].find(x => x.querySelector('input[type=text]').value === 'Time Sheet'), i = row.querySelector('input[type=text]'); i.value = 'paperwork'; i.dispatchEvent(new Event('input', { bubbles: true })); for (const x of document.querySelectorAll('.scrim .orgRow86')) if (x !== row) { const c = x.querySelector('input[type=checkbox]'); if (c.checked) c.click(); } }); await W(200);
  await tapEl('.scrim #orgGo'); await W(900); s = await state(); ok(s.docs['Time Sheet Nov 16 2026'] === 'Paperwork' && s.docs['Time Sheet Nov 23 2026'] === 'Paperwork' && s.folders.filter(f => /paperwork/i.test(f)).length === 1, 'typing the name of a folder that exists sends the documents there (no second “paperwork”)', s.folders.join(', '));
  await hideBar(); await tapEl('#flMore'); const ub0 = await E(() => { const b = [...document.querySelectorAll('.menu button')].find(b => /Undo the last Organize/.test(b.textContent)); const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }); await tapAt(ub0); await W(700);
  await tapEl('#flOrganize86'); await tapEl('.scrim #orgOld'); await tapEl('.scrim #orgNo'); // leave the switch on again

  // --- 3. by kind of document
  await tapEl('#flOrganize86'); await tapEl('.scrim #orgModes [data-m=kind]'); r = await rows();
  const kind = n => r.find(x => x.name === n) || { tag: '', names: '' };
  ok(/^3 docs/.test(kind('Drawings').tag) && /106 S Lee St survey/.test(kind('Drawings').names), 'Kind: the three 106 S Lee St sheets are Drawings', fmt(r));
  ok(/^2 docs · folder you have/.test(kind('Paperwork').tag) && /Time Sheet/.test(kind('Paperwork').names), 'Kind: the time sheets are Forms, and the “Paperwork” folder you have is used for forms');
  ok(/Invoice 2231/.test(kind('Contracts & money').names) && /4-week look ahead/.test(kind('Schedules').names) && /Site photos/.test(kind('Photos & scans').names) && /PM Manual/.test(kind('Manuals & specs').names) && /Grocery list/.test(kind('Notes & letters').names), 'Kind: invoice, schedule, photos, manuals and lists each get their folder');
  const total = r.reduce((a, x) => a + parseInt(x.tag, 10), 0); ok(total === 13, 'Kind: every loose document is placed', total);

  // --- 4. project, then kind inside each folder
  await tapEl('.scrim #orgModes [data-m=project]'); await tapEl('.scrim #orgThens [data-t=kind]'); r = await rows(); ok(/106 S Lee St survey → Drawings/.test(r.find(x => x.name === '106 South Lee').names) && /Cameron Oaks PM Manual → Manuals & specs/.test(r.find(x => x.name === 'Projects › Cameron Oaks').names), 'Then by kind: each document shows the subfolder it will go into', r.find(x => x.name === '106 South Lee').names);
  await tapEl('.scrim #orgGo'); await W(900); s = await state(); ok(s.docs['106 S Lee St survey'] === '106 South Lee › Drawings' && s.docs['Cameron Oaks PM Manual'] === 'Projects › Cameron Oaks › Manuals & specs' && s.docs['CAM punch list'] === 'Projects › Cameron Oaks › Notes & letters' && s.docs['Time Sheet Nov 16 2026'] === 'Paperwork › Forms', 'documents are in project › kind subfolders', s.docs['106 S Lee St survey'] + ' · ' + s.docs['CAM punch list']);
  const kept = await E(async () => { const rq = indexedDB.open('redline-desk', 1); const db = await new Promise((res, rej) => { rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); }); const get = k => new Promise(res => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(null); }); const l = await get('lib'), f = await get('folders'); const sub = (f || []).find(x => x.name === 'Drawings' && x.parent === 'fLee'); return { sub: !!sub, docs: (l || []).filter(d => sub && d.folder === sub.id).length }; });
  ok(kept.sub && kept.docs === 3, 'saved on the device (the subfolder and its three documents)', kept);
  await tapEl('#orgUndoBtn86'); await W(900); s = await state(); ok(loose.every(n => s.docs[n] === '') && !s.folders.some(f => /› Drawings$|› Forms$|Manuals/.test(f)) && s.folders.length === s0.folders.length, 'Undo: documents back, the subfolders it made are gone, your folders are all still there', s.folders.join(', '));

  // --- 5. by year and by month
  await tapEl('#flOrganize86'); await tapEl('.scrim #orgThens [data-t=""]'); await tapEl('.scrim #orgModes [data-m=year]'); r = await rows(); ok(r.length === 1 && /^\d{4}$/.test(r[0].name) && /^13 docs · new folder/.test(r[0].tag), 'Year: one folder for the year', fmt(r));
  await tapEl('.scrim #orgModes [data-m=month]'); r = await rows(); ok(r.length === 1 && /^\d{4}-\d{2} [A-Z][a-z]+$/.test(r[0].name), 'Month: one folder for the month', fmt(r));
  // --- 6. remove empty folders, and Undo from More
  await tapEl('.scrim #orgModes [data-m=project]'); const er = await E(() => document.querySelector('.scrim #orgEmptyRow').textContent.trim()); ok(/Also remove 1 empty folder here \(Old stuff\)/.test(er), 'only the folder that stays empty is offered for removal (not ones about to be filled)', er);
  await tapEl('.scrim #orgEmpty'); await tapEl('.scrim #orgGo'); await W(900); s = await state(); ok(!s.folders.includes('Old stuff') && s.docs['Marvel Phase 1 guide'] === 'Marvel', 'empty folder removed while organizing');
  await hideBar(); await tapEl('#flMore'); const items = await E(() => [...document.querySelectorAll('.menu button')].map(b => b.textContent.trim())); ok(items[0] === 'Organize into folders…' && items[1] === 'Undo the last Organize', 'Files › More has Organize and Undo the last Organize', items.slice(0, 2).join(' | '));
  const ub = await E(() => { const b = [...document.querySelectorAll('.menu button')].find(b => /Undo the last Organize/.test(b.textContent)); const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }); await tapAt(ub); await W(900); s = await state(); ok(loose.every(n => s.docs[n] === '') && s.folders.includes('Old stuff'), 'Undo from More: everything back, the removed folder too');
  // --- 7. inside a folder it only looks there
  await E(() => { const S = __rd.S; S.lib = S.lib.map(d => /^106 S Lee/.test(d.name) ? { ...d, folder: 'fLee' } : d); S.curFolder = 'fLee'; __rd.X.showFiles(); }); await W(400);
  await tapEl('#flOrganize86'); const what = await E(() => document.querySelector('.scrim #orgWhat').textContent); r = await rows(); ok(/3 documents loose in “106 South Lee”/.test(what) && r.length === 0, 'inside a folder: only its own loose documents, and its own name is not proposed again', what.slice(0, 50) + ' / ' + r.length + ' groups');
  await tapEl('.scrim #orgModes [data-m=kind]'); r = await rows(); ok(r.length === 1 && r[0].name === 'Drawings' && /^3 docs · new folder/.test(r[0].tag), 'inside a folder: by kind makes a Drawings subfolder', fmt(r)); await tapEl('.scrim #orgNo');
  const errs = (A.errs || []).length; console.log('ERRS', errs, (A.errs || []).slice(0, 3).join(' | ')); console.log(fails || errs ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails || errs ? 1 : 0);
})().catch(e => { console.error('CRASH', String(e && e.stack || e).slice(0, 600)); process.exit(1); });
