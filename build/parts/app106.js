/* ---------- ORGANIZE86 (iPad edition): Files › Organize — loose documents into folders at the press of a button ----------
   Asked Nov 24 2026: "a way to auto organize folders with the press of a button".
   Files has an Organize button (next to Sort; also Files › More). It looks at the documents lying loose in the folder being
   shown and proposes folders for them. Nothing moves until Organize is pressed in the dialog, every proposed folder can be
   unticked or renamed first, and one Undo puts every document back and removes the folders it made.
   Two ways to group:
     By project name — documents whose names start the same way go together ("106 S Lee St bld plan 20260401" and
       "106 S Lee St survey" → folder "106 S Lee St"). A document whose name starts with the name of a folder that is
       already here goes into that folder. A document that matches nothing stays where it is.
     By month — one folder per month a document was last changed ("2026-11 November").
   Works on what the device already knows (names, dates): no AI, nothing leaves the device. Templates and documents shared
   by someone else are left alone. Moves sync the same way a manual move does (cloudSoon / saveFolders). */
const ORGANIZE86 = true;
const ORG_STOP86 = new Set(['copy', 'final', 'draft', 'markup', 'markups', 'flattened', 'new', 'untitled', 'scan', 'scanned', 'document', 'doc', 'file', 'img', 'image', 'page', 'pages', 'the', 'a', 'an', 'of', 'and', 'for', 'to', 'rev', 'revised', 'revision', 'version', 'signed', 'updated', 'pdf']);
const ORG_MONTH86 = /^(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|june?|july?|aug(ust)?|sep(t(ember)?)?|oct(ober)?|nov(ember)?|dec(ember)?)$/; /* whole month names only: "Marvel" is not March */
const ORG_MONTHS86 = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const orgNorm86 = name => String(name || '').replace(/\.pdf$/i, '').replace(/\s+-\s+(markup|flattened)$/i, '').replace(/\s*\(\d+\)\s*$/, '').replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();
const orgKey86 = t => String(t).toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
const orgDate86 = k => /^\d{6,8}$/.test(k) || /^\d{1,4}[./-]\d{1,2}([./-]\d{1,4})?$/.test(k);
const orgNoise86 = k => !k || /^\d+$/.test(k) || orgDate86(k) || /^v\d+$/.test(k) || /^rev\d*$/.test(k) || ORG_MONTH86.test(k) || ORG_STOP86.has(k);
const orgWord86 = k => /\p{L}/u.test(k) && k.length >= 3 && !orgNoise86(k);
/* a name as tokens, without a date in front ("20260401 site photos" groups with other "site photos") */
function orgToks86(name) { let t = orgNorm86(name).split(' ').filter(Boolean).map(x => ({ raw: x, k: orgKey86(x) })).filter(x => x.k); while (t.length > 1 && orgDate86(t[0].k)) t = t.slice(1); return t; }
/* the start of a name that says what it belongs to: the first real word, with any number or initial before it ("106 S Lee") */
function orgStart86(toks) { const out = []; for (const t of toks.slice(0, 4)) { out.push(t.k); if (orgWord86(t.k)) return out.join(' '); } return ''; }
function orgCommon86(list) { let n = Math.min(...list.map(t => t.length)); const a = list[0]; for (let i = 0; i < n; i++) if (list.some(t => t[i].k !== a[i].k)) { n = i; break; } let out = a.slice(0, n); while (out.length > 1 && (orgNoise86(out[out.length - 1].k) || out[out.length - 1].k.length < 2)) out = out.slice(0, -1); return out; }
const orgName86 = toks => toks.map(t => t.raw.replace(/^[^\p{L}\p{N}(]+|[^\p{L}\p{N})]+$/gu, '')).join(' ').slice(0, 80);
function orgLoose86() { return S.lib.filter(d => docFolder(d) === S.curFolder && !isTplSafe(d) && !d.shared); }
function orgPlan86(mode) { const docs = orgLoose86(), here = childFolders(S.curFolder).filter(f => !f.quick), groups = [], used = new Set(), byLow = new Map(here.map(f => [f.name.trim().toLowerCase(), f]));
  const add = (name, list, folder) => { if (!list.length) return; const ex = folder || byLow.get(name.trim().toLowerCase()) || null; let g = groups.find(x => ex ? x.folder === ex : (!x.folder && x.name.toLowerCase() === name.toLowerCase())); if (!g) { g = { name: ex ? ex.name : name, folder: ex, docs: [], on: true }; groups.push(g); } for (const d of list) if (!used.has(d.id)) { used.add(d.id); g.docs.push(d); } };
  if (mode === 'month') { const m = new Map(); for (const d of docs) { const t = new Date(d.updated || Date.now()), k = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')} ${ORG_MONTHS86[t.getMonth()]}`; if (!m.has(k)) m.set(k, []); m.get(k).push(d); } for (const k of [...m.keys()].sort().reverse()) add(k, m.get(k)); }
  else { const cf = S.curFolder && folderById(S.curFolder) ? orgToks86(folderById(S.curFolder).name) : [];
    /* inside a folder its own name says nothing new: "106 S Lee St survey" inside "106 S Lee St" is grouped as "survey" */
    const strip = t => cf.length && t.length > cf.length && cf.every((q, i) => q.k === t[i].k) ? t.slice(cf.length) : t;
    const tk = new Map(docs.map(d => [d.id, strip(orgToks86(d.name))]));
    // 1. a folder that is already here takes the documents whose names start with its name (the longest such folder wins)
    const fk = here.map(f => ({ f, t: orgToks86(f.name) })).filter(x => x.t.length && x.t.some(t => orgWord86(t.k))).sort((a, b) => b.t.length - a.t.length);
    for (const d of docs) { const t = tk.get(d.id), hit = fk.find(x => x.t.length <= t.length && x.t.every((q, i) => q.k === t[i].k)); if (hit) add(hit.f.name, [d], hit.f); }
    // 2. the rest: names that start the same way
    const m = new Map(); for (const d of docs) { if (used.has(d.id)) continue; const k = orgStart86(tk.get(d.id)); if (!k) continue; if (!m.has(k)) m.set(k, []); m.get(k).push(d); }
    for (const [k, list] of m) { if (list.length < 2) continue; const common = orgCommon86(list.map(d => tk.get(d.id)));
      if (common.length <= 1) { // one shared word only ("Cameron …"): when the next word splits them into two or more real sets, those are the projects
        const sub = new Map(); for (const d of list) { const t = tk.get(d.id)[common.length]; const sk = t && !orgNoise86(t.k) ? t.k : ''; if (!sub.has(sk)) sub.set(sk, []); sub.get(sk).push(d); }
        const real = [...sub].filter(([sk, l]) => sk && l.length >= 2); if (real.length >= 2) { for (const [, l] of real) add(orgName86(orgCommon86(l.map(d => tk.get(d.id)))), l); continue; } }
      add(orgName86(common.length ? common : tk.get(list[0].id).slice(0, 1)) || list[0].name, list); } }
  for (const g of groups) g.docs.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  groups.sort((a, b) => mode === 'month' ? 0 : a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  return { groups, loose: docs.length, rest: docs.filter(d => !used.has(d.id)), empty: orgEmpty86() }; }
/* folders here with nothing in them at any depth */
function orgEmpty86() { const has = id => S.lib.some(d => docFolder(d) === id) || childFolders(id).some(c => has(c.id)); return childFolders(S.curFolder).filter(f => !f.quick && !has(f.id)); }
let orgUndoT86 = 0;
function orgUndoBar86(text) { try { let b = document.getElementById('orgUndo86'); if (!b) { b = document.createElement('div'); b.id = 'orgUndo86'; b.style.cssText = 'position:fixed;left:50%;bottom:calc(22px + var(--sab,0px));transform:translateX(-50%);z-index:90;display:flex;align-items:center;gap:12px;padding:10px 12px 10px 16px;border-radius:14px;background:var(--ink,#111);color:var(--bg,#fff);font-size:14.5px;box-shadow:0 8px 28px #0005;max-width:min(92vw,560px)'; document.body.appendChild(b); }
    b.innerHTML = '<span></span><button class="btn solid" id="orgUndoBtn86" style="flex:none">Undo</button>'; b.firstChild.textContent = text; b.hidden = false; b.querySelector('#orgUndoBtn86').onclick = () => { b.hidden = true; orgUndo86(); }; clearTimeout(orgUndoT86); orgUndoT86 = setTimeout(() => { b.hidden = true; }, 12000); } catch (e) { toast(text, 4000); } }
async function orgApply86(plan, opts) { const groups = plan.groups.filter(g => g.on && g.docs.length && (g.folder || g.name.trim())), undo = { t: Date.now(), at: S.curFolder, moves: [], made: [], removed: [] }; if (!groups.length && !(opts && opts.empty && plan.empty.length)) return null;
  let folders = S.folders.slice(); const to = new Map();
  for (const g of groups) { let f = g.folder; if (!f) { const nm = g.name.trim().slice(0, 120); f = folders.find(x => (x.parent || '') === S.curFolder && !x.quick && x.name.trim().toLowerCase() === nm.toLowerCase()); if (!f) { f = { id: uid(), name: nm, parent: S.curFolder || '' }; folders.push(f); undo.made.push(f.id); } } for (const d of g.docs) { to.set(d.id, f.id); undo.moves.push([d.id, d.folder || '', f.id]); } }
  if (opts && opts.empty) { const gone = new Set(plan.empty.filter(f => ![...to.values()].includes(f.id)).map(f => f.id)); const all = id => { for (const c of folders.filter(x => (x.parent || '') === id)) { gone.add(c.id); all(c.id); } }; for (const id of [...gone]) all(id); undo.removed = folders.filter(f => gone.has(f.id)); folders = folders.filter(f => !gone.has(f.id)); }
  S.folders = folders; S.lib = S.lib.map(d => to.has(d.id) ? { ...d, folder: to.get(d.id) } : d);
  await idb.put('lib', S.lib); await saveFolders(); for (const id of to.keys()) cloudSoon(id);
  store.set('lastOrg86', undo); S.filesSel = null; renderFiles(); return { docs: to.size, folders: new Set(to.values()).size, made: undo.made.length, removed: undo.removed.length }; }
async function orgUndo86() { const u = store.get('lastOrg86', null); if (!u || !Array.isArray(u.moves)) { toast('Nothing to undo.'); return false; }
  let folders = S.folders.slice(); for (const f of u.removed || []) if (!folders.some(x => x.id === f.id)) folders.push(f);
  const ok = id => !id || folders.some(f => f.id === id), back = new Map(); for (const [id, from, into] of u.moves) { const d = S.lib.find(x => x.id === id); if (d && (d.folder || '') === into) back.set(id, ok(from) ? from : ''); } /* a document moved again since then is left where it was put */
  S.lib = S.lib.map(d => back.has(d.id) ? { ...d, folder: back.get(d.id) || undefined } : d);
  const made = new Set(u.made || []); folders = folders.filter(f => !(made.has(f.id) && !S.lib.some(d => d.folder === f.id) && !folders.some(c => (c.parent || '') === f.id))); /* a folder it made goes only if it is empty again */
  S.folders = folders; if (S.curFolder && !folderById(S.curFolder)) S.curFolder = u.at && folderById(u.at) ? u.at : '';
  await idb.put('lib', S.lib); await saveFolders(); for (const id of back.keys()) cloudSoon(id); store.set('lastOrg86', null); renderFiles(); toast(back.size ? `Put ${back.size} document${back.size === 1 ? '' : 's'} back where ${back.size === 1 ? 'it was' : 'they were'}.` : 'Undone.', 3200); return true; }
function organizeDialog86() { if (!ORGANIZE86) return; let mode = store.get('orgMode86', 'project') === 'month' ? 'month' : 'project', plan = null;
  const where = S.curFolder && folderById(S.curFolder) ? `“${folderById(S.curFolder).name}”` : 'All files';
  const md = modal(`<h3>Organize into folders</h3><p class="muted" id="orgWhat" style="margin:0 0 10px"></p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><button class="btn line" id="orgByP">By project name</button><button class="btn line" id="orgByM">By month</button></div>
    <div id="orgList" style="display:grid;gap:8px;max-height:46vh;overflow:auto;padding:2px"></div>
    <p class="muted" id="orgRest" style="font-size:13.5px;margin:10px 0 0"></p>
    <label id="orgEmptyRow" style="display:flex;gap:8px;align-items:center;margin-top:10px;font-size:14.5px"><input type="checkbox" id="orgEmpty"><span></span></label>
    <div class="acts"><button class="btn line" id="orgNo">Cancel</button><button class="btn solid" id="orgGo">Organize</button></div>`), q = id => md.querySelector(id);
  try { md.querySelector('.modal').classList.add('wide'); } catch (e) {}
  const empties = () => plan.empty.filter(f => !plan.groups.some(g => g.on && g.docs.length && g.folder === f)); /* an empty folder that is about to receive documents is not empty */
  const sync = () => { const n = plan.groups.filter(g => g.on).reduce((a, g) => a + g.docs.length, 0), go = q('#orgGo'), em = empties(), er = q('#orgEmptyRow'); er.hidden = !em.length; er.style.display = em.length ? 'flex' : 'none'; er.querySelector('span').textContent = `Also remove ${em.length} empty folder${em.length === 1 ? '' : 's'} here (${em.slice(0, 3).map(f => f.name).join(', ')}${em.length > 3 ? ' …' : ''})`;
    const rm = q('#orgEmpty').checked && em.length; go.disabled = !n && !rm; go.textContent = n ? `Organize ${n} document${n === 1 ? '' : 's'}` : (rm ? 'Remove empty folders' : 'Organize'); };
  const draw = () => { plan = orgPlan86(mode); q('#orgByP').className = 'btn ' + (mode === 'project' ? 'solid' : 'line'); q('#orgByM').className = 'btn ' + (mode === 'month' ? 'solid' : 'line');
    q('#orgWhat').textContent = plan.loose ? `${plan.loose} document${plan.loose === 1 ? '' : 's'} loose in ${where}. Untick or rename anything below; nothing moves until you press Organize, and Undo puts it all back.` : `No documents are loose in ${where}: everything here is already in a folder.`;
    const list = q('#orgList'); list.innerHTML = '';
    plan.groups.forEach((g, i) => { const row = document.createElement('div'); row.className = 'orgRow86'; row.style.cssText = 'display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 10px;align-items:center;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:var(--panel)';
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = g.on; cb.setAttribute('aria-label', 'Use this folder'); cb.onchange = () => { g.on = cb.checked; row.style.opacity = g.on ? '' : '.5'; sync(); };
      const top = document.createElement('div'); top.style.cssText = 'display:flex;gap:8px;align-items:center;min-width:0';
      const nm = document.createElement('input'); nm.type = 'text'; nm.maxLength = 120; nm.value = g.name; nm.setAttribute('aria-label', 'Folder name'); nm.style.cssText = 'flex:1;min-width:0;height:36px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink);padding:0 10px;font-size:15px;font-weight:600;-webkit-user-select:text;user-select:text'; if (g.folder) { nm.readOnly = true; nm.style.borderColor = 'transparent'; nm.style.background = 'none'; } nm.oninput = () => { g.name = nm.value; };
      const tag = document.createElement('small'); tag.className = 'muted'; tag.style.cssText = 'flex:none;white-space:nowrap'; tag.textContent = `${g.docs.length} doc${g.docs.length === 1 ? '' : 's'} · ${g.folder ? 'folder is here' : 'new folder'}`;
      top.append(nm, tag); const names = document.createElement('div'); names.className = 'muted'; names.style.cssText = 'grid-column:2;font-size:13px;line-height:1.35;overflow-wrap:anywhere'; names.textContent = g.docs.slice(0, 6).map(d => d.name).join(' · ') + (g.docs.length > 6 ? ` · and ${g.docs.length - 6} more` : '');
      row.append(cb, top, names); list.appendChild(row); });
    if (!plan.groups.length && plan.loose) { const p = document.createElement('p'); p.className = 'muted'; p.style.margin = '6px 2px'; p.textContent = mode === 'project' ? 'No two names here start the same way, and none starts with the name of a folder that is here, so there is nothing to group by name. By month always works.' : 'Nothing to group.'; list.appendChild(p); }
    q('#orgRest').textContent = plan.rest.length && plan.groups.length ? `${plan.rest.length} document${plan.rest.length === 1 ? ' stays' : 's stay'} where ${plan.rest.length === 1 ? 'it is' : 'they are'} (no other name starts the same way): ${plan.rest.slice(0, 4).map(d => d.name).join(' · ')}${plan.rest.length > 4 ? ' …' : ''}` : '';
    sync(); };
  q('#orgByP').onclick = () => { mode = 'project'; store.set('orgMode86', mode); draw(); }; q('#orgByM').onclick = () => { mode = 'month'; store.set('orgMode86', mode); draw(); }; q('#orgEmpty').onchange = () => sync(); q('#orgNo').onclick = md.close;
  q('#orgGo').onclick = async () => { const go = q('#orgGo'); go.disabled = true; let r = null; try { r = await orgApply86(plan, { empty: q('#orgEmpty').checked }); } catch (e) { console.error(e); toast('That did not work. Nothing was moved.', 4000); } md.close(); if (!r) return;
    const bits = []; if (r.docs) bits.push(`${r.docs} document${r.docs === 1 ? '' : 's'} into ${r.folders} folder${r.folders === 1 ? '' : 's'}`); if (r.removed) bits.push(`${r.removed} empty folder${r.removed === 1 ? '' : 's'} removed`); orgUndoBar86('Organized: ' + bits.join(', ') + '.'); };
  draw(); return md; }
/* the button in the Files header, next to Sort (the same button on the computer and the iPad), and the entries in Files › More */
try { const sortB = $('flSort'); if (ORGANIZE86 && sortB && !document.getElementById('flOrganize86')) { const b = document.createElement('button'); b.className = 'btn line'; b.id = 'flOrganize86'; b.textContent = 'Organize'; b.title = 'Sort the loose documents here into folders'; b.onclick = () => organizeDialog86(); sortB.after(b); } } catch (e) {}
window.__rdOrganizeItems86 = () => ORGANIZE86 ? [{ label: 'Organize into folders…', icon: 'folder', fn: () => organizeDialog86() }, ...(store.get('lastOrg86', null) ? [{ label: 'Undo the last Organize', icon: 'undo', fn: () => orgUndo86() }] : []), '-'] : [];
HELP.push(['Organize: loose documents into folders', ['In Files, press Organize (next to Sort). It proposes folders for the documents lying loose in the folder you are looking at: by project name (names that start the same way go together, and a document whose name starts with a folder that is already there goes into it) or by the month it was last changed. Untick or rename any folder, then press Organize. Undo, on the bar that appears or under More, puts everything back.']]);
Object.assign(RDX, { ORGANIZE86, orgPlan86, orgApply86, orgUndo86, organizeDialog86, orgToks86, orgStart86 });
