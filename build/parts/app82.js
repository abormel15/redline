/* ---------- TREE86 (iPad edition): bring in whole folders ----------
   Files home › More › "Bring in a folder" (a folder picker where the browser has one; on the iPad, a ZIP of the folder — in
   Files, press and hold the folder, Compress, then pick the ZIP) and dropping a folder onto the Files home. The folder tree is
   recreated under the folder you are in (or as a new project at the top), existing folders with the same name are reused,
   PDFs go in as documents and images become pages (one document per folder of photos). Switch: TREE86. */
const TREE86 = true;
const treeSkip = n => /(^|\/)(__MACOSX|\.DS_Store|Thumbs\.db|desktop\.ini|\._)/.test(n) || /(^|\/)\./.test(n);
const treeDoc = n => /\.pdf$/i.test(n) || IMG_RE86.test(n);
async function treeFromZip(file) { const z = await zipRead(file); const out = []; for (const [name, load] of z) { if (name.endsWith('/') || treeSkip(name) || !treeDoc(name)) continue; out.push({ path: name, load: async () => new File([await load()], name.split('/').pop(), { type: /\.pdf$/i.test(name) ? 'application/pdf' : 'image/*' }) }); } return out; }
async function treeFromEntries(items) { const out = []; const walk = async (entry, prefix) => { if (!entry) return; if (entry.isFile) { if (treeSkip(entry.name) || !treeDoc(entry.name)) return; const f = await new Promise((res, rej) => entry.file(res, rej)); out.push({ path: prefix + entry.name, load: async () => f }); return; }
    if (entry.isDirectory) { const rd = entry.createReader(); let batch; do { batch = await new Promise((res, rej) => rd.readEntries(res, rej)); for (const e of batch) await walk(e, prefix + entry.name + '/'); } while (batch.length); } };
  for (const it of items) { const e = it.webkitGetAsEntry ? it.webkitGetAsEntry() : null; if (e) await walk(e, ''); else if (it.getAsFile) { const f = it.getAsFile(); if (f && treeDoc(f.name)) out.push({ path: f.name, load: async () => f }); } } return out; }
function treeFromFileList(files) { const out = []; for (const f of files) { const p = f.webkitRelativePath || f.name; if (treeSkip(p) || !treeDoc(p)) continue; out.push({ path: p, load: async () => f }); } return out; }
function folderUnder(parent, name) { name = name.trim().slice(0, 120) || 'Folder'; let f = S.folders.find(x => (x.parent || '') === (parent || '') && x.name.toLowerCase() === name.toLowerCase()); if (!f) { f = { id: uid(), name, parent: parent || '' }; S.folders.push(f); } return f; }
async function importTree(entries, root) { if (!entries.length) return toast('Nothing to bring in: no PDFs or images in that folder.', 4000);
  const base = root != null ? root : (S.curFolder || ''); const groups = new Map(); let made = 0; const before = S.folders.length;
  for (const e of entries) { const segs = e.path.split('/').filter(Boolean); segs.pop(); let parent = base; for (const sgm of segs) parent = folderUnder(parent, sgm).id; if (!groups.has(parent)) groups.set(parent, []); groups.get(parent).push(e); }
  made = S.folders.length - before; if (made) await idb.put('folders', S.folders);
  const keep = S.curFolder; let docs = 0; const total = entries.length; let done = 0;
  try { for (const [fid, list] of groups) { S.curFolder = fid; const files = []; for (const e of list) { done++; await busy(`Reading ${e.path.split('/').pop()} (${done} of ${total})…`); try { files.push(await e.load()); } catch (err) { console.warn(err); } }
      const n0 = S.lib.length; await importDocs(files); docs += S.lib.length - n0; } }
  finally { S.curFolder = keep; busy(null); }
  renderFiles(); toast(`${docs} document${docs === 1 ? '' : 's'} brought in` + (made ? ` into ${made} new folder${made === 1 ? '' : 's'}` : '') + '.', 5000); return { docs, made }; }
(function treeInputs() { const a = document.createElement('input'); a.type = 'file'; a.id = 'fTree'; a.hidden = true; a.multiple = true; a.setAttribute('webkitdirectory', ''); a.setAttribute('directory', ''); document.body.appendChild(a);
  a.onchange = e => { const fs = [...e.target.files]; e.target.value = ''; if (!fs.length) return; importTree(treeFromFileList(fs)); };
  const z = document.createElement('input'); z.type = 'file'; z.id = 'fTreeZip'; z.hidden = true; z.accept = '.zip,application/zip,application/x-zip-compressed'; document.body.appendChild(z);
  z.onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try { await busy('Opening the ZIP…'); const entries = await treeFromZip(f); busy(null); const top = entries.length && entries.every(x => x.path.includes('/')) ? '' : f.name.replace(/\.zip$/i, ''); await importTree(entries.map(x => top ? { ...x, path: top + '/' + x.path } : x)); } catch (err) { busy(null); console.warn(err); toast('That ZIP could not be read.', 4000); } }; })();
const canPickFolder = () => { try { return 'webkitdirectory' in document.createElement('input') && !/iPad|iPhone/.test(navigator.userAgent) && !(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); } catch (e) { return false; } };
function bringInFolder() { if (canPickFolder()) { $('fTree').click(); return; }
  const md = modal(`<h3>Bring in a folder</h3><p>The iPad only lets apps pick files, not folders, so zip the folder first: in <b>Files</b>, press and hold the folder, choose <b>Compress</b>, then pick the ZIP here. Every subfolder comes across, PDFs become documents and photos become pages.</p><div class="acts"><button class="btn line" id="bfNo">Cancel</button><button class="btn solid" id="bfZip">Pick the ZIP</button></div>`);
  md.querySelector('#bfNo').onclick = md.close; md.querySelector('#bfZip').onclick = () => { md.close(); $('fTreeZip').click(); }; }
/* drop a folder (or a ZIP) on the Files home */
(function treeDrop() { const fl = $('files'); if (!fl) return; fl.addEventListener('dragover', e => { if (TREE86 && e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; } });
  fl.addEventListener('drop', async e => { if (!TREE86 || !e.dataTransfer) return; const items = [...(e.dataTransfer.items || [])]; const hasDir = items.some(it => it.webkitGetAsEntry && it.webkitGetAsEntry() && it.webkitGetAsEntry().isDirectory); const zips = [...e.dataTransfer.files].filter(f => /\.zip$/i.test(f.name));
    if (!hasDir && !zips.length) return; e.preventDefault(); e.stopPropagation(); try { let entries = hasDir ? await treeFromEntries(items) : []; for (const zf of zips) { await busy('Opening ' + zf.name + '…'); entries = entries.concat((await treeFromZip(zf)).map(x => ({ ...x, path: (x.path.includes('/') ? '' : zf.name.replace(/\.zip$/i, '') + '/') + x.path }))); } busy(null); await importTree(entries); } catch (err) { busy(null); console.warn(err); toast('That folder could not be read.', 4000); } }, true); })();
const flMoreV85t = typeof flMore === 'function' ? flMore : null;
HELP.push(['Bring in a whole folder', ['Files home, More, Bring in a folder. On a computer you pick the folder; on the iPad you pick a ZIP of it (in Files: press and hold the folder, Compress). The folder tree is rebuilt inside the folder you are in, or as a new project at the top: subfolders become folders, PDFs become documents, photos become pages. Dropping a folder or a ZIP onto the Files home does the same.']]);
Object.assign(RDX, { TREE86, importTree, treeFromZip, treeFromFileList, bringInFolder, folderUnder });
