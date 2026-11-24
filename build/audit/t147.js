// ORGANIZE86: Files › Organize proposes folders for the loose documents, moves them on Organize, and Undo puts everything back.
const lib = require('./aud_lib.js'); const fs = require('fs');
(async () => { const A = await lib({}); const { pg, W, E, I } = A; let fails = 0; const ok = (c, n, d) => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + n + (d != null ? ' | ' + (typeof d === 'string' ? d : JSON.stringify(d)) : '')); };
  console.log('mode', I.name);
  await E(() => __rd.X.showFiles()); await W(400);
  const files = fs.readdirSync(__dirname + '/fx/org').filter(f => /\.pdf$/.test(f)).map(f => __dirname + '/fx/org/' + f);
  for (const f of files) { await pg.setInputFiles('#fOpen', f); await W(1300); await E(() => __rd.X.showFiles()); await W(250); }
  // two folders that are already there: one whose name a document starts with, one empty
  await E(() => { const S = __rd.S; S.folders = [...S.folders, { id: 'fMarvel', name: 'Marvel', parent: '' }, { id: 'fOld', name: 'Old stuff', parent: '' }]; S.curFolder = ''; __rd.X.showFiles(); }); await W(400);
  const state = () => E(() => { const S = __rd.S, nm = id => (S.folders.find(f => f.id === id) || {}).name || ''; const o = {}; for (const d of S.lib) { if (d.tpl) continue; o[d.name] = nm(d.folder); } return { docs: o, folders: S.folders.map(f => f.name).sort() }; });
  const s0 = await state(); const mine = Object.keys(s0.docs).filter(n => files.some(f => f.endsWith('/' + n + '.pdf'))); ok(mine.length === files.length && mine.every(n => s0.docs[n] === ''), 'nine documents imported, all loose', mine.length);
  const tapEl = async sel => { const r = await E(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2, w: q.width }; }, sel); if (!r || !r.w) throw new Error('not visible: ' + sel); await I.tap(r.x, r.y); await W(450); };
  await tapEl('#flOrganize86');
  const rows = () => E(() => [...document.querySelectorAll('.scrim .orgRow86')].map(r => ({ name: r.querySelector('input[type=text]').value, ro: r.querySelector('input[type=text]').readOnly, tag: r.querySelector('small').textContent, on: r.querySelector('input[type=checkbox]').checked })));
  const r1 = await rows(); const by = n => r1.find(r => r.name === n);
  ok(!!by('106 S Lee St') && /3 docs · new folder/.test(by('106 S Lee St').tag), 'proposes “106 S Lee St” for the three documents that start that way', r1.map(r => r.name + ' [' + r.tag + ']').join(' | '));
  ok(!!by('Cameron Oaks') && /2 docs/.test(by('Cameron Oaks').tag), 'proposes “Cameron Oaks” for its two manuals');
  ok(!!by('Time Sheet') && /2 docs/.test(by('Time Sheet').tag), 'proposes “Time Sheet” for the two time sheets (the dates are left out of the name)');
  ok(!!by('Marvel') && by('Marvel').ro && /1 doc · folder is here/.test(by('Marvel').tag), 'a document that starts with the name of a folder already there goes into that folder');
  const rest = await E(() => document.querySelector('.scrim #orgRest').textContent); ok(/Grocery list/.test(rest) && /1 document stays/.test(rest), 'a document that matches nothing is named and left alone', rest.slice(0, 90));
  const er = await E(() => { const r = document.querySelector('.scrim #orgEmptyRow'); return { shown: r.style.display !== 'none', t: r.textContent }; }); ok(er.shown && /1 empty folder/.test(er.t) && /Old stuff/.test(er.t), 'offers to remove the empty folder', er.t.trim());
  // rename one, untick one, tick the empty-folder box, go
  await E(() => { const r = [...document.querySelectorAll('.scrim .orgRow86')].find(r => r.querySelector('input[type=text]').value === 'Time Sheet'); const i = r.querySelector('input[type=text]'); i.value = 'Timesheets'; i.dispatchEvent(new Event('input', { bubbles: true })); });
  const cb = await E(() => { const r = [...document.querySelectorAll('.scrim .orgRow86')].find(r => r.querySelector('input[type=text]').value === 'Cameron Oaks'); const c = r.querySelector('input[type=checkbox]'); c.scrollIntoView({ block: 'nearest' }); const q = c.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }); await I.tap(cb.x, cb.y); await W(250);
  await tapEl('.scrim #orgEmpty'); const goTxt = await E(() => document.querySelector('.scrim #orgGo').textContent); ok(/Organize 6 documents/.test(goTxt), 'the button counts what will move after unticking one folder', goTxt);
  await tapEl('.scrim #orgGo'); await W(900);
  const s1 = await state(); ok(s1.docs['106 S Lee St survey'] === '106 S Lee St' && s1.docs['106 S Lee St bld plan 20260401'] === '106 S Lee St' && s1.docs['106 S Lee St exhibit rev2'] === '106 S Lee St', 'the three 106 S Lee St documents are in their folder');
  ok(s1.docs['Time Sheet Nov 16 2026'] === 'Timesheets' && s1.docs['Time Sheet Nov 23 2026'] === 'Timesheets', 'the renamed folder was used', s1.folders.join(', '));
  ok(s1.docs['Cameron Oaks PM Manual'] === '' && s1.docs['Cameron Oaks Sales Manual'] === '' && !s1.folders.includes('Cameron Oaks'), 'the unticked folder was not made and its documents did not move');
  ok(s1.docs['Marvel Phase 1 guide'] === 'Marvel' && s1.docs['Grocery list'] === '', 'existing folder used; the unmatched document stayed');
  ok(!s1.folders.includes('Old stuff'), 'the empty folder was removed');
  const cards = await E(() => [...document.querySelectorAll('#filesGrid .fcard .fnm')].map(e => e.textContent.trim())); ok(cards.includes('106 S Lee St') && cards.includes('Timesheets') && !cards.includes('106 S Lee St survey'), 'Files shows the new folders, and the moved documents are no longer loose', cards.join(' | ').slice(0, 160));
  const kept = await E(async () => { const r = indexedDB.open('redline-desk', 1); const db = await new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); const get = k => new Promise(res => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(null); }); const l = await get('lib'), f = await get('folders'); const fid = (f || []).find(x => x.name === '106 S Lee St'); return { folderSaved: !!fid, docsSaved: (l || []).filter(d => fid && d.folder === fid.id).length }; });
  ok(kept.folderSaved && kept.docsSaved === 3, 'the move is saved on the device (still there after closing the app)', kept);
  // Undo from the bar
  const bar = await E(() => { const b = document.getElementById('orgUndo86'); return b && !b.hidden ? b.textContent : ''; }); ok(/Organized: 6 documents into 3 folders, 1 empty folder removed/.test(bar), 'a bar says what happened and offers Undo', bar);
  await tapEl('#orgUndoBtn86'); await W(900); const s2 = await state();
  ok(mine.every(n => s2.docs[n] === '') && !s2.folders.includes('106 S Lee St') && !s2.folders.includes('Timesheets') && s2.folders.includes('Old stuff') && s2.folders.includes('Marvel'), 'Undo: every document is loose again, the folders it made are gone, the removed one is back', s2.folders.join(', '));
  // By month, and Undo from More
  await tapEl('#flOrganize86'); await tapEl('.scrim #orgByM'); const r3 = await rows(); ok(r3.length >= 1 && /^\d{4}-\d{2} [A-Z][a-z]+$/.test(r3[0].name) && r3.reduce((a, r) => a + parseInt(r.tag, 10), 0) >= 9, 'By month: one folder per month, every loose document placed', r3.map(r => r.name + ' [' + r.tag + ']').join(' | '));
  await tapEl('.scrim #orgGo'); await W(800); const s3 = await state(); ok(mine.every(n => /^\d{4}-\d{2} /.test(s3.docs[n])), 'By month: documents moved into the month folder', s3.docs['Grocery list']);
  await E(() => { const b = document.getElementById('orgUndo86'); if (b) b.hidden = true; }); await tapEl('#flMore'); const items = await E(() => [...document.querySelectorAll('.menu button')].map(b => b.textContent.trim())); ok(items[0] === 'Organize into folders…' && items[1] === 'Undo the last Organize', 'Files › More has Organize and Undo the last Organize', items.slice(0, 3).join(' | '));
  const ub = await E(() => { const b = [...document.querySelectorAll('.menu button')].find(b => /Undo the last Organize/.test(b.textContent)); const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }); await I.tap(ub.x, ub.y); await W(900); const s4 = await state(); ok(mine.every(n => s4.docs[n] === '') && !s4.folders.some(f => /^\d{4}-\d{2} /.test(f)), 'Undo from More puts them back', s4.folders.join(', '));
  // inside a folder: only that folder's loose documents
  await tapEl('#flOrganize86'); await tapEl('.scrim #orgByP'); await tapEl('.scrim #orgGo'); await W(800); await E(() => { const S = __rd.S; S.curFolder = S.folders.find(f => f.name === '106 S Lee St').id; __rd.X.showFiles(); }); await W(400); await E(() => { const b = document.getElementById('orgUndo86'); if (b) b.hidden = true; });
  await tapEl('#flOrganize86'); const what = await E(() => document.querySelector('.scrim #orgWhat').textContent); const r5 = await rows(); ok(/3 documents loose in “106 S Lee St”/.test(what) && r5.length === 0, 'inside a folder it only looks at that folder', what.slice(0, 60) + ' / ' + r5.length + ' groups');
  await tapEl('.scrim #orgNo');
  const errs = (A.errs || []).length; console.log('ERRS', errs, (A.errs || []).slice(0, 3).join(' | ')); console.log(fails || errs ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails || errs ? 1 : 0);
})().catch(e => { console.error('CRASH', String(e && e.stack || e).slice(0, 600)); process.exit(1); });
