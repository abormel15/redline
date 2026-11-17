/* ---------- SAVE86 (iPad edition): Save writes over the document's own file on a computer ----------
   On desktop Chrome / Edge (the File System Access API): Open uses the system file picker and remembers the file; Save
   (markups editable) writes over that file; "Save as…" picks a new place and re-links; flattened PDFs, images, CSVs and
   reports always ask where to go instead of landing in Downloads. The link (a FileSystemFileHandle) is kept in IndexedDB
   per document and survives reloads; the browser asks once per session before the first write. Safari, Firefox and the
   iPad have no such API, so they keep the download / Files / share-sheet behaviour. Switch: SAVE86. */
const SAVE86 = true;
const fsOK86 = () => SAVE86 && !window.__rdNoFS86 && typeof window.showSaveFilePicker === 'function' && typeof window.showOpenFilePicker === 'function' && !isApplePad();
const FSH = { map: new Map(), mode: null };
async function fshGet(id) { if (!id) return null; if (FSH.map.has(id)) return FSH.map.get(id); let h = null; try { h = await idb.get('fsh:' + id); } catch (e) {} FSH.map.set(id, h || null); return h || null; }
async function fshSet(id, h) { if (!id) return; FSH.map.set(id, h || null); try { if (h) await idb.put('fsh:' + id, h); else await idb.del('fsh:' + id); } catch (e) {} }
async function fshAllowed(h, ask) { try { let p = await h.queryPermission({ mode: 'readwrite' }); if (p === 'prompt' && ask) p = await h.requestPermission({ mode: 'readwrite' }); return p === 'granted'; } catch (e) { return false; } }
async function fshWrite(h, blob) { const w = await h.createWritable(); await w.write(blob); await w.close(); }
const PICK_TYPES86 = { pdf: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }], png: [{ description: 'PNG image', accept: { 'image/png': ['.png'] } }], jpg: [{ description: 'JPEG image', accept: { 'image/jpeg': ['.jpg', '.jpeg'] } }], csv: [{ description: 'CSV', accept: { 'text/csv': ['.csv'] } }], zip: [{ description: 'ZIP', accept: { 'application/zip': ['.zip'] } }], json: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }] };
/* saveFile: over the linked file, or through the picker */
const saveFileS86 = saveFile; saveFile = async function (filename, data) { if (!fsOK86()) return saveFileS86.apply(this, arguments); const blob = data instanceof Blob ? data : new Blob([data]); const ext = (String(filename).match(/\.([a-z0-9]+)$/i) || [, ''])[1].toLowerCase(), isPdf = ext === 'pdf', mode = FSH.mode; FSH.mode = null;
  if (isPdf && mode === 'over' && S.docId) { const h = await fshGet(S.docId); if (h) { if (await fshAllowed(h, true)) { try { await fshWrite(h, blob); toast('Saved over ' + h.name, 2600); return true; } catch (e) { console.warn(e); toast('Could not write ' + h.name + ' — choose where to save it.', 3500); } } else toast('No permission to write ' + h.name + ' — choose where to save it.', 3500); } }
  let h; try { h = await window.showSaveFilePicker({ suggestedName: filename, types: PICK_TYPES86[ext] || undefined, excludeAcceptAllOption: false }); } catch (e) { if (e && e.name === 'AbortError') { toast('Save cancelled.', 1800); return false; } console.warn(e); return saveFileS86.apply(this, arguments); }
  try { await fshWrite(h, blob); } catch (e) { console.warn(e); toast('That file could not be written. Downloading instead.', 3500); return saveFileS86.apply(this, arguments); }
  if (isPdf && (mode === 'over' || mode === 'as') && S.docId) { await fshSet(S.docId, h); S.dirty = false; toast('Saved as ' + h.name + '. Save now writes over it.', 3200); } else toast('Saved ' + h.name, 2200); return true; };
const savePdfS86 = savePdf; savePdf = async function (flatten, only) { FSH.mode = !flatten && !only ? 'over' : null; try { return await savePdfS86.apply(this, arguments); } finally { FSH.mode = null; } };
async function saveAs86() { FSH.mode = 'as'; try { await savePdfS86(false); } finally { FSH.mode = null; } }
/* Open through the system picker, keeping the file link */
async function openPicked86(which) { let hs; try { hs = await window.showOpenFilePicker({ multiple: true, types: [{ description: 'PDFs and pictures', accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg', '.heic', '.heif', '.webp'] } }] }); } catch (e) { return; }
  if (!hs || !hs.length) return; const files = []; for (const h of hs) { try { files.push(await h.getFile()); } catch (e) {} } if (!files.length) return;
  if (which === 'import' || files.length > 1) { await importDocs(files); return; } await openFile(files[0], false); if (S.docId && /\.pdf$/i.test(files[0].name)) await fshSet(S.docId, hs[0]); }
for (const [id, which] of [['fOpen', 'open'], ['fImport', 'import']]) document.addEventListener('click', e => { if (!fsOK86()) return; const el = $(id); if (!el || e.target !== el) return; e.preventDefault(); e.stopImmediatePropagation(); openPicked86(which); }, true);
/* the Save menu: Save as…, and a note on what Save does */
SAVE_ADJ86.push(items => { if (!fsOK86()) return; const h = FSH.map.get(S.docId); const i = items.findIndex(x => x && x.label === 'Save PDF'); if (i >= 0 && h) items[i] = { ...items[i], note: 'writes over ' + h.name }; items.splice(i >= 0 ? i + 1 : 0, 0, { label: 'Save as…', note: h ? 'a new place for the file' : 'choose where the file lives', icon: 'save', fn: saveAs86 }); });
/* ask for permission while the click is fresh, so a long PDF build does not lose it */
document.addEventListener('pointerdown', e => { if (!fsOK86() || !S.docId) return; const b = e.target.closest && e.target.closest('#bSave'); if (!b) return; fshGet(S.docId).then(h => { if (h) fshAllowed(h, true); }); }, true);
const openDocSv86 = openDoc; openDoc = async function (id) { const r = await openDocSv86.apply(this, arguments); if (fsOK86() && S.docId) fshGet(S.docId); return r; };
HELP.push(['Saving on a computer', ['In Chrome or Edge, Open uses the file picker and remembers the file. Save then writes over that same file (markups stay editable in it); Save as… picks a new place. Flattened PDFs, images and reports always ask where to go. The browser asks once per session before the first write.']]);
Object.assign(RDX, { SAVE86, fsOK86, FSH, saveAs86 });
