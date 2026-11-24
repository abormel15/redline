/* ---------- RELNOTES86 (iPad edition): "What's new" after an update ----------
   The notes live here, newest first. On the first open of a new build (BUILD label differs from store 'seenRel86') a
   "What's new" card shows the entries added since the build last seen (or the latest entry on a fresh install). Also
   under ⋯ More › What's new, and in Help. Build.py bumps the label; add an entry here for anything the user would notice. */
const RELNOTES86 = true;
const RELNOTES = [
  { v: '86.104', date: 'Nov 24, 2026', items: [
    'Forms: what you type now shows in the box as soon as you leave it, and an answer you delete is gone from the page. Before, the page kept showing the box as it was until the document was opened again (the answer itself was always stored and saved correctly).',
    'The same goes for checkboxes and pick-from-a-list fields, at any zoom.' ] },
  { v: '86.103', date: 'Nov 19, 2026', items: [
    'Nothing changes in how this version works. Under the hood, a copy of the app can now be frozen for sharing: it keeps everything on the device, shows no sign-in, and stays exactly as it is until a newer build is promoted to it on purpose.' ] },
  { v: '86.102', date: 'Nov 19, 2026', items: [
    '⋯ More › “Clean up the text boxes you never changed…” is now always in the menu while a document is open (it used to appear only on some pages, so it could not be found).',
    'It counts what it finds before removing anything — on this page and in the whole document — and covers sheets converted by earlier builds, blank white covers with no text left on them, and empty form boxes Redline found. Tick what should go; Undo brings it back.',
    'Holding on a page that has such boxes offers the same cleanup.' ] },
  { v: '86.100', date: 'Nov 18, 2026', items: [
    'A full check of the app, every tool and menu driven three ways — mouse and keyboard, a finger, the Pencil — and the gaps closed:',
    'Forms on the iPad: the A− / A+ / Auto / All bar above a field now answers a finger or the Pencil (it only answered a mouse), and ◀ ▶ on that bar step to the previous and next field, the touch way to Shift+Tab and Tab.',
    'Holding still on a selection handle opens the markup’s menu, so small symbols are easy to reach; holding the Pencil still on empty paper opens the page menu, as a finger does.',
    'Double-tap or double-click a symbol to change its letter or number.',
    '“Move it freely once” in a markup’s menu is the touch way to Shift-drag: the next move ignores the magnet, guides and grid.',
    'After the Pencil has been used, a finger tap with a tool says why nothing was placed. Install help is worded for the device in hand. The keyboard-shortcut list shows this edition’s keys with the touch way beside each.',
    'The Form entries stay out of the hold menu on sheets that have no fields.' ] },
  { v: '86.94', date: 'Nov 18, 2026', items: [
    'Civil and site symbols: gas, electric and water meters, valves and curb stops, backflow preventers, transformers, poles, hydrants, FDC, post indicator valves, fire sprinkler heads, irrigation heads and valves, cleanouts, manholes, catch basins, area drains, downspouts, culverts, swales, spot elevations, benchmarks, bollards, ADA spaces, parking counts, trees, silt fence and more.',
    'Every symbol’s letter or number is yours to set on the sheet: double-tap it, or hold it and choose “Change the letter or number…”, so two meters can read W1 and W2 and a bubble carries this drawing’s own number.',
    'Editing the drawing’s own text asks first now: tapping the lines you want keeps the file small, since turning every line into a box writes all of them into the PDF. ⋯ More › “Clean up the text boxes you never changed” removes untouched ones from a sheet that was already converted.',
    'An empty box Redline found on a form is no longer written into the saved PDF — only the ones you filled in.' ] },
  { v: '86.90', date: 'Nov 18, 2026', items: [
    'Crop pages. Draw a rectangle around the part of the sheet worth keeping, hold on it, and choose Crop this page to the box or Crop every page to the box. The markups move with it, the saved PDF opens cropped in other readers, and ⋯ More › Undo the crop brings the whole sheet back.' ] },
  { v: '86.86', date: 'Nov 18, 2026', items: [
    'Callouts can be turned. Hold on one and use Rotate 90°, or drag its round handle — only the box turns, the leader keeps pointing at what you picked. And on a page you have rotated, a new callout, text box or sticky note starts at the angle that reads across the screen instead of running down the sheet.' ] },
  { v: '86.83', date: 'Nov 18, 2026', items: [
    'The fitted answer now covers the original line completely — no more ghost of the old text showing along the edges of a cell — and answers that came with the file are fitted even before you touch them.' ] },
  { v: '86.80', date: 'Nov 18, 2026', items: [
    'Form answers are never cut off at the edge of a box any more. A size you pick is a ceiling: where the answer is too long for a narrow cell it shrinks to fit, on screen and in the saved PDF, so Acrobat shows the same. Answers that came with the file are fitted too.' ] },
  { v: '86.76', date: 'Nov 18, 2026', items: [
    'Forms: text size in a field is yours to set. While a field is open, the bar above it has A− and A+, Auto to go back, and All to use that size for every field in the document (Ctrl/⌘+Shift+> and < from the keyboard). Or hold on a field › Text size for this field…. The size goes into the saved PDF.' ] },
  { v: '86.67', date: 'Nov 17, 2026', items: [
    'A guide to the iPad edition: short clips and numbered steps for the account, drag and drop, sheet sets, symbols, forms, printing, side by side, links with a view and the looks. ⋯ More › Guide to the iPad edition, the Guide button on this card, or /guide/ next to the app.' ] },
  { v: '86.66', date: 'Nov 17, 2026', items: [
    'Fill out any form: ⋯ More › Fill out this form turns the boxes, underlines, ____ runs and checkbox squares of a flat PDF (401k, benefits, permit forms) into fields — tap to type or tick, Tab to the next. Save PDF makes them real fields that Acrobat can fill too; a flattened save prints the answers in.',
    'Settings › My details for forms: name, address, phone, email… fill matching fields with one tap; Date fields get today’s date. Hold on the page to add a field by hand or remove one.' ] },
  { v: '86.61', date: 'Nov 17, 2026', items: [
    'Side by side: the side you switch away from keeps its picture while the new one draws — no blank page any more. Switching also edits the page that was showing on that side.',
    'This card now shows only the newest update; “All notes” lists the earlier ones.' ] },
  { v: '86.55', date: 'Nov 17, 2026', items: [
    'Side by side: switching which side you edit is quiet — no overlay, no rebuild, both views and the tool in hand stay as they were.' ] },
  { v: '86.51', date: 'Nov 17, 2026', items: [
    'Print: Save › Print… prints the sheet or the set, with or without markups. On a computer it opens the print dialog directly; on the iPad it hands the PDF to the share sheet, where Print is one of the options.',
    'Save on a computer: Save writes over the document’s own file once you have chosen where it lives (Save as… picks the folder). Open keeps that connection too. On the iPad saving still goes through Files or the share sheet.',
    'Links to a sheet can carry a view: after picking the sheet, drag a box on it; tapping the link lands zoomed to that box. Back returns as before.',
    'Construction symbols: a legend library (electrical, lighting, plumbing, appliances, HVAC, general) with search, size S–XL, a highlight block behind the symbol, and the swatch colour. In the Symbols tool.',
    'Keyboard: Alt+Z fits text boxes to their text; Ctrl-drag (Cmd on a Mac) drags away a copy; Shift while moving ignores the magnet, smart guides and grid.',
    '“Make the text editable” leaves CAD text with no readable letters alone instead of covering it with blank boxes, and deleting an edited text box removes its white cover too.',
    'Files: drag documents and folders onto folders or onto the path above the cards (hold to lift on touch); the … menu of a card at the bottom of the window stays on screen.',
    'Blueprint and the other drawing looks are reachable from More and on pages without markups; Sharpen scanned pages (Light/Strong) helps soft vendor sheets.' ] },
  { v: '86.33', date: 'Nov 16, 2026', items: [
    'Your Redline account: sign in with email and password (Settings › Redline account) and documents, markups, page names, folders and settings follow you between the iPad and the computer. PDFs are kept in the account by default; turn that off to sync markups only.',
    'A background or accent chosen in Settings now wins over the festive look.' ] },
  { v: '86.25', date: 'Nov 16, 2026', items: [
    'Sheet sets: name pages from the title blocks, a sheet index to jump from, and linked callouts (tap a detail bubble, land on the detail).',
    'Bring in a whole folder of PDFs (subfolders become folders); on the iPad as a ZIP.' ] }];
const buildLabel86 = () => { try { return (typeof BUILD === 'string' ? BUILD : String(BUILD || '')).split('·')[0].trim(); } catch (e) { return ''; } };
const relCmp = (a, b) => { const pa = String(a).split('.').map(x => parseInt(x, 10)), pb = String(b).split('.').map(x => parseInt(x, 10)); /* parseInt: the stored label is '86.94 · Nov 18…', and Number() of that tail is NaN */ for (let i = 0; i < Math.max(pa.length, pb.length); i++) { const d = (pa[i] || 0) - (pb[i] || 0); if (d) return d; } return 0; };
function relNotesDialog86(sinceV) { const show = RELNOTES.slice(0, 1); /* the newest update only; All notes lists the rest */
  const md = modal(`<h3>What’s new in Redline</h3><p class="muted" style="margin:0 0 8px">Build ${buildLabel86() || ''} · ${show.length === 1 ? show[0].date : show[show.length - 1].date + ' – ' + show[0].date}</p><div id="relBody" style="max-height:56vh;overflow:auto;display:grid;gap:12px"></div><div class="acts"><button class="btn line" id="relAll">All notes</button><span class="grow"></span><button class="btn solid" id="relOk">Got it</button></div>`), body = md.querySelector('#relBody');
  const draw = (arr) => { body.innerHTML = ''; for (const n of arr) { const sec = document.createElement('div'); const h = document.createElement('div'); h.style.cssText = 'font-weight:700;font-size:14px;margin-bottom:4px'; h.textContent = n.v + ' · ' + n.date; const ul = document.createElement('ul'); ul.style.cssText = 'margin:0;padding-left:18px;display:grid;gap:5px;font-size:14px;line-height:1.4'; for (const t of n.items) { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); } sec.append(h, ul); body.appendChild(sec); } };
  draw(show); md.querySelector('#relAll').onclick = () => { draw(RELNOTES); md.querySelector('#relAll').hidden = true; }; md.querySelector('#relOk').onclick = () => { store.set('seenRel86', buildLabel86()); md.close(); }; return md; }
function relNotesMaybe86() { if (!RELNOTES86 || /[?&]nohome\b/.test(location.search)) return; /* the test harness opens with ?nohome */ const now = buildLabel86(); if (!now) return; const seen = store.get('seenRel86', ''); if (seen === now) return; if (!seen && window.__rdNoAccount86) { store.set('seenRel86', now); return; } /* a shared copy opened for the first time: nothing is 'new' to that person */ if (!seen) { /* first run with notes: show only the latest entry */ if (document.querySelector('.scrim')) { setTimeout(relNotesMaybe86, 4000); return; } relNotesDialog86(''); return; } if (document.querySelector('.scrim')) { setTimeout(relNotesMaybe86, 4000); return; } if (!RELNOTES.some(n => relCmp(n.v, seen) > 0)) { store.set('seenRel86', now); return; } /* a build with no new note: nothing to show */ relNotesDialog86(seen); }
setTimeout(relNotesMaybe86, 2600);
const extraItemsR86 = extraItems86; extraItems86 = function (where) { const r = extraItemsR86.apply(this, arguments) || []; if (!RELNOTES86 || where !== 'doc') return r; return [...r, { label: 'What’s new in Redline', note: 'build ' + buildLabel86(), icon: 'help', fn: () => relNotesDialog86('') }]; };
HELP.push(['What’s new', ['After an update, a card lists what changed since the build you last used. See it again any time: ⋯ More › What’s new in Redline.']]);
Object.assign(RDX, { RELNOTES86, RELNOTES, relNotesDialog86, relNotesMaybe86 });
