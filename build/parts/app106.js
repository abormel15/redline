/* ---------- ORGANIZE86 (iPad edition): Files › Organize — loose documents into folders at the press of a button ----------
   Asked Nov 24 2026: "a way to auto organize folders with the press of a button".
   Files has an Organize button (next to Sort; also Files › More). It looks at the documents lying loose in the folder being
   shown and proposes folders for them. Nothing moves until Organize is pressed in the dialog, every proposed folder can be
   unticked or renamed first, and one Undo puts every document back and removes the folders it made.
   v2 (86.107, the same day: "it needs to look for existing folders before creating new ones and it needs more sorting
   options — more sophisticated"):
     Folders that already exist come first, in every mode, at any depth under the folder being shown:
       · by name, loosely: "106 S Lee St bld plan" belongs in a folder called "106 South Lee" (numbers must agree; S = South,
         St = Street and the like; word order and extra words do not matter; CAM finds "Cameron Oaks"; BIC finds
         "Belmont Innovation Campus"),
       · by company: a document whose name starts like documents already sitting in a folder joins them there.
     Only what no existing folder claims is grouped into new folders.
     Group by: Project name · Kind of document (Drawings, Forms, Contracts & money, Schedules, Manuals & specs,
       Photos & scans, Notes & letters, Other) · Month · Year.
     Then inside each folder: nothing more, or a second level by Kind / Month / Year (subfolders, existing ones reused).
     Every folder row opens to its documents, each with its own tick box and the reason it was put there; the folder name
     can be typed over, and typing the name of a folder that exists sends the documents there.
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
/* --- loose matching of names --- */
const ORG_ABBR86 = { st: 'street', str: 'street', rd: 'road', ave: 'avenue', av: 'avenue', blvd: 'boulevard', dr: 'drive', ln: 'lane', ct: 'court', pl: 'place', hwy: 'highway', pkwy: 'parkway', n: 'north', s: 'south', e: 'east', w: 'west', bld: 'building', bldg: 'building', proj: 'project', dwg: 'drawing', dwgs: 'drawing', spec: 'specification', specs: 'specification', sched: 'schedule', mtg: 'meeting', mgmt: 'management', apt: 'apartment', ste: 'suite', mt: 'mount', ft: 'fort', docs: 'document', pics: 'photo', pic: 'photo', picture: 'photo', img: 'photo', image: 'photo' };
const orgCanon86 = k => { k = ORG_ABBR86[k] || k; if (k.length > 3 && k.endsWith('s') && !k.endsWith('ss')) k = k.slice(0, -1); return ORG_ABBR86[k] || k; };
const orgNum86 = k => /^\d+$/.test(k);
function orgSame86(a, b) { if (a === b) return true; const x = orgCanon86(a), y = orgCanon86(b); if (x === y) return true; if (orgNum86(x) || orgNum86(y)) return false; const [p, q] = x.length <= y.length ? [x, y] : [y, x]; return p.length >= 4 && q.startsWith(p); }
/* how well a document's name fits a folder's name: 0 = it does not. Numbers in the folder name must all be in the document's name. */
function orgScore86(dt, ft) { const fw = ft.filter(t => orgNum86(t.k) || !(orgDate86(t.k) || ORG_STOP86.has(t.k) || ORG_MONTH86.test(t.k))), nums = fw.filter(t => orgNum86(t.k)), words = fw.filter(t => !orgNum86(t.k)); if (!words.length) return 0;
  for (const n of nums) if (!dt.some(d => d.k === n.k)) return 0;
  const m = words.filter(w => dt.some(d => orgSame86(d.k, w.k))).length;
  if (m && m / words.length >= 0.6 && (words.some(w => w.k.length >= 3 && dt.some(d => orgSame86(d.k, w.k))) || nums.length)) return m + nums.length * 1.5 + (m === words.length ? 0.5 : 0);
  if (!nums.length) { // a job code: CAM for "Cameron Oaks" (first letters of the first word), or initials: BIC for "Belmont Innovation Campus"
    const first = words[0].k, ini = words.map(w => w.k[0]).join('');
    for (const d of dt) { if (!/^[A-Z]{3,5}$/.test(d.raw.replace(/[^A-Za-z]/g, ''))) continue; if (first.length > d.k.length + 1 && first.startsWith(d.k)) return 1.4; if (words.length >= 3 && ini === d.k) return 1.4; }
    // the other way round: the folder is the code, the document spells it out
    if (words.length === 1 && /^[a-z]{3,5}$/.test(first) && ft.length === 1 && ft[0].raw === ft[0].raw.toUpperCase()) { for (let i = 0; i + first.length <= dt.length; i++) if (dt.slice(i, i + first.length).map(d => d.k[0]).join('') === first) return 1.4; if (dt.length && dt[0].k.length > first.length + 1 && dt[0].k.startsWith(first)) return 1.4; } }
  return 0; }
/* --- kinds of document, from the name --- */
const ORG_KINDS86 = [
  ['Forms', /\b(time\s?sheets?|forms?|applications?|w-?9|i-?9|401k|enrollment|questionnaire|sign-?in sheet)\b/i, ['form', 'paperwork']],
  ['Contracts & money', /\b(invoices?|receipts?|proposals?|quotes?|quotation|estimates?|bids?|contracts?|agreements?|change orders?|purchase orders?|budgets?|pay apps?|lien|insurance|coi|statements?|bills?)\b/i, ['contract', 'money', 'invoice', 'financial', 'finance', 'accounting', 'billing', 'estimate']],
  ['Schedules', /\b(schedules?|look[\s-]?aheads?|gantt|calendars?|timelines?)\b/i, ['schedule']],
  ['Manuals & specs', /\b(manuals?|guides?|handbooks?|specs?|specifications?|instructions?|warrant(y|ies)|submittals?|cut sheets?|data ?sheets?|standards?)\b/i, ['manual', 'specification', 'guide', 'submittal']],
  ['Photos & scans', /\b(photos?|pics?|pictures?|imgs?|images?|scans?|scanned|screenshots?)\b/i, ['photo', 'scan']],
  ['Notes & letters', /\b(notes?|minutes|meetings?|memos?|letters?|emails?|rfis?|reports?|logs?|punch|lists?|agenda)\b/i, ['note', 'letter', 'correspondence', 'meeting', 'report']],
  ['Drawings', /\b(plans?|drawings?|dwgs?|elevations?|sections?|details?|surveys?|plats?|exhibits?|sheets?|sets?|bld|bldg|arch|architectural|structural|mep|civil|grading|landscape|floor|site|layout|as-?builts?|markups?)\b/i, ['drawing', 'plan', 'sheet']],
  ['Other documents', null, ['other', 'misc', 'miscellaneous', 'general', 'document']]];
function orgKind86(d) { const n = orgNorm86(d.name); for (const [name, re] of ORG_KINDS86) if (re && re.test(n)) return name; return 'Other documents'; }
const orgStamp86 = (d, mode) => { const t = new Date(d.updated || Date.now()); return mode === 'year' ? String(t.getFullYear()) : `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')} ${ORG_MONTHS86[t.getMonth()]}`; };
const orgLabel86 = (d, mode) => mode === 'kind' ? orgKind86(d) : (mode === 'month' || mode === 'year') ? orgStamp86(d, mode) : '';
/* does an existing folder stand for this kind / month / year? */
function orgFits86(f, label, mode) { const ft = orgToks86(f.name).map(t => orgCanon86(t.k)), low = f.name.trim().toLowerCase(); if (low === label.toLowerCase()) return true;
  if (mode === 'kind') { const k = ORG_KINDS86.find(x => x[0] === label), ok = new Set([...(k ? k[2] : []), ...orgToks86(label).map(t => orgCanon86(t.k))]); const words = ft.filter(x => !ORG_STOP86.has(x) && x !== 'and'); return words.length > 0 && words.length <= 3 && words.every(x => ok.has(x)); }
  if (mode === 'year') return ft.length === 1 && ft[0] === label;
  if (mode === 'month') { const [ym, mon] = label.split(' '), [y, mm] = ym.split('-'), raw = orgNorm86(f.name).toLowerCase(); if (raw === ym || raw === `${ym} ${mon.toLowerCase()}`) return true; const toks = raw.split(/[\s,./-]+/).filter(Boolean); const hasY = toks.includes(y), hasM = toks.some(t => t.length >= 3 && mon.toLowerCase().startsWith(t)) || (toks.includes(mm) || toks.includes(String(+mm))) && toks.length === 2; return hasY && hasM && toks.length <= 3; }
  return false; }
/* every folder under the one being shown, nearest first */
function orgScope86() { const out = [], walk = (id, depth) => { for (const f of childFolders(id)) { if (f.quick) continue; out.push({ f, depth, t: orgToks86(f.name) }); if (depth < 6) walk(f.id, depth + 1); } }; walk(S.curFolder, 0); return out; }
const orgPathName86 = f => { const p = folderPath(f.id), i = S.curFolder ? p.findIndex(x => x.id === S.curFolder) : -1; return p.slice(i + 1).map(x => x.name).join(' › '); };
function orgPlan86(mode, then, opts) { mode = ['project', 'kind', 'month', 'year'].includes(mode) ? mode : 'project'; then = ['kind', 'month', 'year'].includes(then) && then !== mode ? then : ''; const useOld = !(opts && opts.useExisting === false);
  const docs = orgLoose86(), scope = useOld ? orgScope86() : [], groups = [], used = new Set();
  const add = (name, list, folder, why) => { if (!list.length) return; let g = groups.find(x => folder ? x.folder === folder : (!x.folder && x.name.toLowerCase() === name.toLowerCase())); if (!g) { g = { name: folder ? folder.name : name, folder: folder || null, path: folder ? orgPathName86(folder) : '', docs: [], on: true }; groups.push(g); } for (const d of list) if (!used.has(d.id)) { used.add(d.id); g.docs.push({ d, on: true, why: typeof why === 'function' ? why(d) : (why || ''), sub: then ? orgLabel86(d, then) : '' }); } };
  if (mode !== 'project') { const m = new Map(); for (const d of docs) { const k = orgLabel86(d, mode); if (!m.has(k)) m.set(k, []); m.get(k).push(d); }
    const keys = [...m.keys()]; if (mode === 'kind') keys.sort((a, b) => ORG_KINDS86.findIndex(x => x[0] === a) - ORG_KINDS86.findIndex(x => x[0] === b)); else keys.sort().reverse();
    for (const k of keys) { const ex = scope.filter(x => orgFits86(x.f, k, mode)).sort((a, b) => a.depth - b.depth)[0]; add(k, m.get(k), ex ? ex.f : null, mode === 'kind' ? 'its name says what kind of document it is' : 'when it was last changed'); } }
  else { const cf = S.curFolder && folderById(S.curFolder) ? orgToks86(folderById(S.curFolder).name) : [];
    /* inside a folder its own name says nothing new: "106 S Lee St survey" inside "106 S Lee St" is grouped as "survey" */
    const strip = t => { if (!cf.length) return t; let n = 0; while (n < t.length - 1 && cf.some(q => orgNum86(q.k) ? q.k === t[n].k : orgSame86(q.k, t[n].k))) n++; if (!n) return t; while (n < t.length - 1 && ORG_ABBR86[t[n].k]) n++; return t.slice(n); }; /* loosely: inside "106 South Lee", "106 S Lee St survey" is "survey" */
    const tk = new Map(docs.map(d => [d.id, strip(orgToks86(d.name))]));
    if (scope.length) {
      // 1. a folder that exists and whose name the document's name fits (best fit wins; a tie goes to the nearest folder)
      for (const d of docs) { const t = tk.get(d.id); let best = null; for (const x of scope) { const sc = orgScore86(t, x.t); if (sc > 0 && (!best || sc > best.sc || (sc === best.sc && x.depth < best.x.depth))) best = { sc, x }; } if (best) add(best.x.f.name, [d], best.x.f, 'its name matches this folder'); }
      // 2. a folder that already holds documents whose names start the same way
      const inside = new Map(); for (const x of scope) for (const o of S.lib) { if (docFolder(o) !== x.f.id || isTplSafe(o)) continue; const ot = orgToks86(o.name), k = orgStart86(ot); if (!k) continue; if (!inside.has(k)) inside.set(k, []); inside.get(k).push({ x, o, ot }); }
      for (const d of docs) { if (used.has(d.id)) continue; const t = tk.get(d.id), k = orgStart86(t), cand = k && inside.get(k); if (!cand) continue; const tally = new Map(); for (const c of cand) { let n = 0; while (n < t.length && n < c.ot.length && t[n].k === c.ot[n].k) n++; if (n < 2 && k.split(' ').length < 2) continue; const e = tally.get(c.x.f.id) || { x: c.x, n: 0, o: c.o }; e.n++; tally.set(c.x.f.id, e); }
        const win = [...tally.values()].sort((a, b) => b.n - a.n || a.x.depth - b.x.depth)[0]; if (win) add(win.x.f.name, [d], win.x.f, `named like “${win.o.name}”, which is already in this folder`); } }
    // 3. what no existing folder claims: names that start the same way make a new folder
    const m = new Map(); for (const d of docs) { if (used.has(d.id)) continue; const k = orgStart86(tk.get(d.id)); if (!k) continue; if (!m.has(k)) m.set(k, []); m.get(k).push(d); }
    for (const [k, list] of m) { if (list.length < 2) continue; const common = orgCommon86(list.map(d => tk.get(d.id)));
      if (common.length <= 1) { // one shared word only ("Cameron …"): when the next word splits them into two or more real sets, those are the projects
        const sub = new Map(); for (const d of list) { const t = tk.get(d.id)[common.length]; const sk = t && !orgNoise86(t.k) ? t.k : ''; if (!sub.has(sk)) sub.set(sk, []); sub.get(sk).push(d); }
        const real = [...sub].filter(([sk, l]) => sk && l.length >= 2); if (real.length >= 2) { for (const [, l] of real) add(orgName86(orgCommon86(l.map(d => tk.get(d.id)))), l, null, 'their names start the same way'); continue; } }
      add(orgName86(common.length ? common : tk.get(list[0].id).slice(0, 1)) || list[0].name, list, null, 'their names start the same way'); } }
  const cmp = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  for (const g of groups) g.docs.sort((a, b) => cmp(a.sub, b.sub) || cmp(a.d.name, b.d.name));
  if (mode === 'project') groups.sort((a, b) => (a.folder ? 0 : 1) - (b.folder ? 0 : 1) || cmp(a.name, b.name));
  return { mode, then, groups, loose: docs.length, rest: docs.filter(d => !used.has(d.id)), empty: orgEmpty86(), scope: scope.length }; }
/* folders here with nothing in them at any depth */
function orgEmpty86() { const has = id => S.lib.some(d => docFolder(d) === id) || childFolders(id).some(c => has(c.id)); return childFolders(S.curFolder).filter(f => !f.quick && !has(f.id)); }
let orgUndoT86 = 0;
function orgUndoBar86(text) { try { let b = document.getElementById('orgUndo86'); if (!b) { b = document.createElement('div'); b.id = 'orgUndo86'; b.style.cssText = 'position:fixed;left:50%;bottom:calc(22px + var(--sab,0px));transform:translateX(-50%);z-index:90;display:flex;align-items:center;gap:12px;padding:10px 12px 10px 16px;border-radius:14px;background:var(--ink,#111);color:var(--bg,#fff);font-size:14.5px;box-shadow:0 8px 28px #0005;max-width:min(92vw,560px)'; document.body.appendChild(b); }
    b.innerHTML = '<span></span><button class="btn solid" id="orgUndoBtn86" style="flex:none">Undo</button>'; b.firstChild.textContent = text; b.hidden = false; b.querySelector('#orgUndoBtn86').onclick = () => { b.hidden = true; orgUndo86(); }; clearTimeout(orgUndoT86); orgUndoT86 = setTimeout(() => { b.hidden = true; }, 12000); } catch (e) { toast(text, 4000); } }
async function orgApply86(plan, opts) { const undo = { t: Date.now(), at: S.curFolder, moves: [], made: [], removed: [] }; let folders = S.folders.slice(); const to = new Map(), low = x => String(x || '').trim().toLowerCase();
  const child = (parent, name, mode) => { let f = folders.find(x => (x.parent || '') === parent && !x.quick && (low(x.name) === low(name) || (mode && orgFits86(x, name, mode)))); if (!f) { f = { id: uid(), name: name.trim().slice(0, 120), parent: parent || '' }; folders.push(f); undo.made.push(f.id); } return f; };
  for (const g of plan.groups) { if (!g.on) continue; const list = g.docs.filter(x => x.on); if (!list.length) continue; let f = g.folder;
    if (!f) { const nm = g.name.trim(); if (!nm) continue; f = folders.find(x => !x.quick && low(x.name) === low(nm) && (x.parent || '') === S.curFolder) || (orgScope86().find(x => low(x.f.name) === low(nm)) || {}).f || child(S.curFolder, nm, null); } /* a typed name that is a folder which exists (here first, then deeper) is that folder */
    for (const x of list) { const dest = x.sub ? child(f.id, x.sub, plan.then) : f; if ((x.d.folder || '') === dest.id) continue; to.set(x.d.id, dest.id); undo.moves.push([x.d.id, x.d.folder || '', dest.id]); } }
  if (opts && opts.empty) { const targets = new Set(to.values()), keepUp = new Set(); for (const id of targets) for (const p of (() => { const o = []; let f = folders.find(x => x.id === id), g = 0; while (f && g++ < 30) { o.push(f.id); f = folders.find(x => x.id === (f.parent || '')); } return o; })()) keepUp.add(p);
    const gone = new Set(plan.empty.filter(f => !keepUp.has(f.id)).map(f => f.id)); const all = id => { for (const c of folders.filter(x => (x.parent || '') === id)) { gone.add(c.id); all(c.id); } }; for (const id of [...gone]) all(id); undo.removed = folders.filter(f => gone.has(f.id)); folders = folders.filter(f => !gone.has(f.id)); }
  if (!to.size && !undo.removed.length) return null;
  S.folders = folders; S.lib = S.lib.map(d => to.has(d.id) ? { ...d, folder: to.get(d.id) } : d);
  await idb.put('lib', S.lib); await saveFolders(); for (const id of to.keys()) cloudSoon(id);
  store.set('lastOrg86', undo); S.filesSel = null; renderFiles(); return { docs: to.size, folders: new Set(to.values()).size, made: undo.made.length, removed: undo.removed.length }; }
async function orgUndo86() { const u = store.get('lastOrg86', null); if (!u || !Array.isArray(u.moves)) { toast('Nothing to undo.'); return false; }
  let folders = S.folders.slice(); for (const f of u.removed || []) if (!folders.some(x => x.id === f.id)) folders.push(f);
  const ok = id => !id || folders.some(f => f.id === id), back = new Map(); for (const [id, from, into] of u.moves) { const d = S.lib.find(x => x.id === id); if (d && (d.folder || '') === into) back.set(id, ok(from) ? from : ''); } /* a document moved again since then is left where it was put */
  S.lib = S.lib.map(d => back.has(d.id) ? { ...d, folder: back.get(d.id) || undefined } : d);
  const made = new Set(u.made || []); for (let pass = 0; pass < 8; pass++) { const n0 = folders.length; folders = folders.filter(f => !(made.has(f.id) && !S.lib.some(d => d.folder === f.id) && !folders.some(c => (c.parent || '') === f.id))); if (folders.length === n0) break; } /* a folder it made goes only if it is empty again (subfolders first) */
  S.folders = folders; if (S.curFolder && !folderById(S.curFolder)) S.curFolder = u.at && folderById(u.at) ? u.at : '';
  await idb.put('lib', S.lib); await saveFolders(); for (const id of back.keys()) cloudSoon(id); store.set('lastOrg86', null); renderFiles(); toast(back.size ? `Put ${back.size} document${back.size === 1 ? '' : 's'} back where ${back.size === 1 ? 'it was' : 'they were'}.` : 'Undone.', 3200); return true; }
function organizeDialog86() { if (!ORGANIZE86) return; const MODES = [['project', 'Project name'], ['kind', 'Kind of document'], ['month', 'Month'], ['year', 'Year']];
  let mode = store.get('orgMode86', 'project'); if (!MODES.some(m => m[0] === mode)) mode = 'project'; let then = store.get('orgThen86', ''); let useOld = store.get('orgOld86', true) !== false, plan = null; const open = new Set();
  const where = S.curFolder && folderById(S.curFolder) ? `“${folderById(S.curFolder).name}”` : 'All files';
  const md = modal(`<h3>Organize into folders</h3><p class="muted" id="orgWhat" style="margin:0 0 10px"></p>
    <div style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px 10px;align-items:center;margin-bottom:10px">
      <span class="muted" style="font-size:13px">Group by</span><div id="orgModes" style="display:flex;gap:6px;flex-wrap:wrap">${MODES.map(m => `<button class="btn line" data-m="${m[0]}">${m[1]}</button>`).join('')}</div>
      <span class="muted" style="font-size:13px">Then by</span><div id="orgThens" style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn line" data-t="">Nothing more</button>${MODES.slice(1).map(m => `<button class="btn line" data-t="${m[0]}">${m[1]}</button>`).join('')}</div></div>
    <label style="display:flex;gap:8px;align-items:center;margin-bottom:10px;font-size:14.5px"><input type="checkbox" id="orgOld"><span id="orgOldT"></span></label>
    <datalist id="orgNames86"></datalist>
    <div id="orgList" style="display:grid;gap:8px;max-height:40vh;overflow:auto;padding:2px"></div>
    <p class="muted" id="orgRest" style="font-size:13.5px;margin:10px 0 0"></p>
    <label id="orgEmptyRow" style="display:flex;gap:8px;align-items:center;margin-top:10px;font-size:14.5px"><input type="checkbox" id="orgEmpty"><span></span></label>
    <div class="acts"><button class="btn line" id="orgNo">Cancel</button><button class="btn solid" id="orgGo">Organize</button></div>`), q = id => md.querySelector(id);
  try { md.querySelector('.modal').classList.add('wide'); } catch (e) {}
  const onDocs = g => g.on ? g.docs.filter(x => x.on) : [];
  const empties = () => plan.empty.filter(f => !plan.groups.some(g => onDocs(g).length && g.folder && folderPath(g.folder.id).some(p => p.id === f.id))); /* an empty folder that is about to receive documents is not empty */
  const sync = () => { const n = plan.groups.reduce((a, g) => a + onDocs(g).length, 0), go = q('#orgGo'), em = empties(), er = q('#orgEmptyRow'); er.hidden = !em.length; er.style.display = em.length ? 'flex' : 'none'; er.querySelector('span').textContent = `Also remove ${em.length} empty folder${em.length === 1 ? '' : 's'} here (${em.slice(0, 3).map(f => f.name).join(', ')}${em.length > 3 ? ' …' : ''})`;
    const rm = q('#orgEmpty').checked && em.length; go.disabled = !n && !rm; go.textContent = n ? `Organize ${n} document${n === 1 ? '' : 's'}` : (rm ? 'Remove empty folders' : 'Organize');
    md.querySelectorAll('.orgRow86').forEach((row, i) => { const g = plan.groups[i]; if (!g) return; const k = onDocs(g).length; row.querySelector('.orgTag86').textContent = `${k}${k !== g.docs.length ? ' of ' + g.docs.length : ''} doc${g.docs.length === 1 ? '' : 's'} · ${g.folder ? 'folder you have' : 'new folder'}`; row.style.opacity = g.on && k ? '' : '.5'; }); };
  const draw = () => { plan = orgPlan86(mode, then, { useExisting: useOld }); then = plan.then;
    q('#orgModes').querySelectorAll('button').forEach(b => { b.className = 'btn ' + (b.dataset.m === mode ? 'solid' : 'line'); }); q('#orgThens').querySelectorAll('button').forEach(b => { b.className = 'btn ' + (b.dataset.t === then ? 'solid' : 'line'); b.disabled = b.dataset.t === mode; b.style.opacity = b.disabled ? '.4' : ''; });
    const nAll = orgScope86().length; q('#orgOld').checked = useOld; q('#orgOld').disabled = !nAll; q('#orgOldT').textContent = nAll ? `Use the ${nAll} folder${nAll === 1 ? '' : 's'} I already have before making new ones` : 'There are no folders here yet, so new ones will be made';
    q('#orgNames86').innerHTML = ''; for (const x of orgScope86()) { const o = document.createElement('option'); o.value = x.f.name; q('#orgNames86').appendChild(o); }
    q('#orgWhat').textContent = plan.loose ? `${plan.loose} document${plan.loose === 1 ? '' : 's'} loose in ${where}. Nothing moves until you press Organize, and Undo puts it all back.` : `No documents are loose in ${where}: everything here is already in a folder.`;
    const list = q('#orgList'); list.innerHTML = '';
    plan.groups.forEach((g, i) => { const row = document.createElement('div'); row.className = 'orgRow86'; row.style.cssText = 'display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 10px;align-items:center;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:var(--panel)';
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = g.on; cb.setAttribute('aria-label', 'Use this folder'); cb.onchange = () => { g.on = cb.checked; sync(); };
      const top = document.createElement('div'); top.style.cssText = 'display:flex;gap:8px;align-items:center;min-width:0';
      const nm = document.createElement('input'); nm.type = 'text'; nm.maxLength = 120; nm.value = g.folder && g.path && g.path !== g.name ? g.path : g.name; nm.setAttribute('aria-label', 'Folder name'); nm.setAttribute('list', 'orgNames86'); nm.autocomplete = 'off'; nm.style.cssText = 'flex:1;min-width:0;height:36px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink);padding:0 10px;font-size:15px;font-weight:600;-webkit-user-select:text;user-select:text'; if (g.folder) { nm.readOnly = true; nm.style.borderColor = 'transparent'; nm.style.background = 'none'; nm.removeAttribute('list'); } nm.oninput = () => { g.name = nm.value; }; nm.onkeydown = e => e.stopPropagation();
      const tag = document.createElement('small'); tag.className = 'muted orgTag86'; tag.style.cssText = 'flex:none;white-space:nowrap';
      const more = document.createElement('button'); more.className = 'btn line orgMore86'; more.style.cssText = 'flex:none;height:32px;padding:0 10px;font-size:13px'; more.textContent = open.has(i) ? 'Hide' : 'Show'; more.setAttribute('aria-label', 'Show the documents');
      top.append(nm, tag, more);
      const names = document.createElement('div'); names.className = 'muted orgNames86'; names.style.cssText = 'grid-column:2;font-size:13px;line-height:1.35;overflow-wrap:anywhere';
      const paintDocs = () => { names.innerHTML = ''; if (!open.has(i)) { names.textContent = g.docs.slice(0, 6).map(x => x.d.name + (x.sub ? ' → ' + x.sub : '')).join(' · ') + (g.docs.length > 6 ? ` · and ${g.docs.length - 6} more` : ''); return; }
        for (const x of g.docs) { const l = document.createElement('label'); l.className = 'orgDoc86'; l.style.cssText = 'display:flex;gap:8px;align-items:flex-start;padding:5px 0;font-size:14px;color:var(--ink)'; const c = document.createElement('input'); c.type = 'checkbox'; c.checked = x.on; c.style.marginTop = '2px'; c.onchange = () => { x.on = c.checked; sync(); }; const t = document.createElement('span'); t.style.minWidth = '0'; const a = document.createElement('span'); a.textContent = x.d.name + (x.sub ? '  →  ' + x.sub : ''); const w = document.createElement('small'); w.className = 'muted'; w.style.display = 'block'; w.textContent = x.why; t.append(a, w); l.append(c, t); names.appendChild(l); } };
      more.onclick = () => { if (open.has(i)) open.delete(i); else open.add(i); more.textContent = open.has(i) ? 'Hide' : 'Show'; paintDocs(); }; paintDocs();
      row.append(cb, top, names); list.appendChild(row); });
    if (!plan.groups.length && plan.loose) { const p = document.createElement('p'); p.className = 'muted'; p.style.margin = '6px 2px'; p.textContent = 'No two names here start the same way and none fits a folder you have, so there is nothing to group by project name. Kind of document, Month and Year always work.'; list.appendChild(p); }
    q('#orgRest').textContent = plan.rest.length && plan.groups.length ? `${plan.rest.length} document${plan.rest.length === 1 ? ' stays' : 's stay'} where ${plan.rest.length === 1 ? 'it is' : 'they are'} (${plan.rest.length === 1 ? 'it fits' : 'they fit'} no folder and no other name starts the same way): ${plan.rest.slice(0, 4).map(d => d.name).join(' · ')}${plan.rest.length > 4 ? ' …' : ''}` : '';
    sync(); };
  q('#orgModes').onclick = e => { const b = e.target.closest('button'); if (!b) return; mode = b.dataset.m; if (then === mode) then = ''; store.set('orgMode86', mode); open.clear(); draw(); };
  q('#orgThens').onclick = e => { const b = e.target.closest('button'); if (!b || b.disabled) return; then = b.dataset.t; store.set('orgThen86', then); draw(); };
  q('#orgOld').onchange = () => { useOld = q('#orgOld').checked; store.set('orgOld86', useOld); open.clear(); draw(); }; q('#orgEmpty').onchange = () => sync(); q('#orgNo').onclick = md.close;
  q('#orgGo').onclick = async () => { const go = q('#orgGo'); go.disabled = true; let r = null; try { r = await orgApply86(plan, { empty: q('#orgEmpty').checked }); } catch (e) { console.error(e); toast('That did not work. Nothing was moved.', 4000); } md.close(); if (!r) return;
    const bits = []; if (r.docs) bits.push(`${r.docs} document${r.docs === 1 ? '' : 's'} into ${r.folders} folder${r.folders === 1 ? '' : 's'}${r.made ? ` (${r.made} new)` : ' (all ones you had)'}`); if (r.removed) bits.push(`${r.removed} empty folder${r.removed === 1 ? '' : 's'} removed`); orgUndoBar86('Organized: ' + bits.join(', ') + '.'); };
  draw(); return md; }
/* the button in the Files header, next to Sort (the same button on the computer and the iPad), and the entries in Files › More */
try { const sortB = $('flSort'); if (ORGANIZE86 && sortB && !document.getElementById('flOrganize86')) { const b = document.createElement('button'); b.className = 'btn line'; b.id = 'flOrganize86'; b.textContent = 'Organize'; b.title = 'Sort the loose documents here into folders'; b.onclick = () => organizeDialog86(); sortB.after(b); } } catch (e) {}
window.__rdOrganizeItems86 = () => ORGANIZE86 ? [{ label: 'Organize into folders…', icon: 'folder', fn: () => organizeDialog86() }, ...(store.get('lastOrg86', null) ? [{ label: 'Undo the last Organize', icon: 'undo', fn: () => orgUndo86() }] : []), '-'] : [];
HELP.push(['Organize: loose documents into folders', ['In Files, press Organize (next to Sort). It sorts the documents lying loose in the folder you are looking at. Folders you already have are used first, in any subfolder: a document goes where its name fits the folder’s name (106 S Lee St fits “106 South Lee”; CAM fits “Cameron Oaks”) or where documents named like it already are. Only the rest gets new folders.', 'Group by project name, kind of document (drawings, forms, contracts and money, schedules, manuals and specs, photos and scans, notes and letters), month or year, and add a second level inside each folder if you like. Show opens a folder’s documents so single ones can be unticked; a folder name can be typed over. Undo, on the bar that appears or under More, puts everything back.']]);
Object.assign(RDX, { ORGANIZE86, orgPlan86, orgApply86, orgUndo86, organizeDialog86, orgToks86, orgStart86, orgScore86, orgKind86, orgFits86 });
