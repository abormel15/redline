/* ---------- PARITY86 (iPad edition): what the two-sided audit found ----------
   Every action was driven three ways — mouse and keyboard, a finger, the Pencil — and the differences were closed here:
   1. Holding still on a selection handle (finger or Pencil) opens the markup's menu. Before, only a hold on the body
      did, and on a small symbol the eight handles cover most of it, so the menu was hard to reach. (A mouse already had
      right-click.)
   2. Holding the Pencil still on empty paper opens the page menu, as a finger hold does. Before, the Pencil could only
      start a selection box there.
   3. Double-tapping (or double-clicking) a symbol opens its letter-or-number box. V85 opened the markup list instead.
   4. After the Pencil has been used, fingers move the page and the Pencil works the tools. A finger tap with a placing
      tool used to do nothing and say nothing; now it says why, once per tool.
   5. A one-time "Move it freely" in a markup's menu is the touch way to do what Shift-drag does with a keyboard: the
      next move ignores the magnet, smart guides and grid.
   6. "Install" speaks to the device in hand: Home Screen steps on an iPad, Install-as-an-app steps on a computer.
   7. The keyboard-shortcuts list carries the shortcuts added in this edition, each with its touch way beside it. */
const PARITY86 = true;
const PAR = { dblSym: null, hinted: '', down: null, freeOnce: false };
/* 1 + 2: the hold. V85's own pointerdown has already run (this listener is added after it) and left S.gesture. */
view.addEventListener('pointerdown', e => { try { if (!PARITY86 || e.pointerType === 'mouse') return; const g = S.gesture; if (!g || g.lp) return;
    if (g.kind === 'handle' || (g.kind === 'marquee' && e.pointerType === 'pen' && S.tool === 'select')) g.lp = setTimeout(() => { if (S.gesture === g && !g.moved) { S.gesture = null; if (g.kind === 'handle' && g.m && g.orig) { try { g.m.pts = g.orig.map(q => ({ ...q })); } catch (er) {} } requestDraw(); ctxMenu(g.s0); } }, 620);
  } catch (er) {} });
/* 3: double-tap on a symbol. Seen first (capture), so the wrapped showPanel knows what the tap was on. */
window.addEventListener('pointerdown', e => { try { PAR.dblSym = null; if (!PARITY86 || !view.contains(e.target) || S.tool !== 'select') return; const s = pos(e); if (!dblDown(s)) return; const m = topHit(toPage(s.x, s.y)); if (m && m.type === 'symbol' && editable(m)) PAR.dblSym = m.id; } catch (er) {} }, true);
const showPanelP86 = showPanel; showPanel = function (id, on) { if (PARITY86 && id === 'listPanel' && on === true && PAR.dblSym && S.sel.has(PAR.dblSym)) { const m = byId(PAR.dblSym); PAR.dblSym = null; if (m) { symTextDialog86(m); return; } } return showPanelP86.apply(this, arguments); };
/* 4: a finger tap with a placing tool, once the Pencil is in use */
const PLACERS86 = new Set(['note', 'pin', 'count', 'bucket', 'edittext', 'stamp', 'symbol', 'sticky', 'text', 'callout', 'photomk', 'polyline', 'polygon', 'perimeter', 'area', 'angle', 'radius', 'length', 'calibrate', 'cutout', 'rect', 'ellipse', 'cloud', 'line', 'arrow', 'pen', 'highlight', 'eraser', 'table', 'viewport', 'sign', 'sticker', 'legend', 'revtable', 'persp']);
view.addEventListener('pointerdown', e => { PAR.down = (e.pointerType === 'touch' && e.isPrimary !== false) ? { x: e.clientX, y: e.clientY, t: performance.now(), tool: S.tool } : null; }, true);
view.addEventListener('pointerup', e => { try { const d = PAR.down; PAR.down = null; if (!PARITY86 || !d || e.pointerType !== 'touch' || !S.penSeen) return; if (!PLACERS86.has(d.tool) || PAR.hinted === d.tool) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10 || performance.now() - d.t > 450) return; PAR.hinted = d.tool;
    toast('The Pencil works the tools; a finger moves the page. To use a finger for this, turn on Draw with a finger in Settings.', 5200); } catch (er) {} }, true);
const setToolP86 = setTool; setTool = function (t) { if (t !== S.tool) PAR.hinted = ''; return setToolP86.apply(this, arguments); };
/* 5: move freely once — the touch way to do Shift-drag */
const gridCfgP86 = gridCfg; gridCfg = function () { const c = gridCfgP86.apply(this, arguments); if (!PARITY86 || !PAR.freeOnce) return c; const g = S.gesture; if (!g || !MOVERS.has(g.kind)) return c; return { ...c, snap: false, magnet: false, smart: false }; };
const moveSnapP86 = moveSnap; moveSnap = function (g, ox, oy) { if (PARITY86 && PAR.freeOnce) { S.snapGuides = null; S.gapGuides = null; return { x: ox, y: oy }; } return moveSnapP86.apply(this, arguments); };
window.addEventListener('pointerup', () => { if (PAR.freeOnce && PAR.freeArmed) { setTimeout(() => { PAR.freeOnce = false; PAR.freeArmed = false; }, 0); } }, true);
window.addEventListener('pointerdown', e => { if (PAR.freeOnce && view.contains(e.target)) PAR.freeArmed = true; }, true);
const ctxExtrasP86 = ctxExtras; ctxExtras = function (items, sm, one, s) { const r = ctxExtrasP86.apply(this, arguments); try { if (!PARITY86 || !sm || !sm.length || !sm.some(editable)) return r; const c = gridCfg();
    let sa = false; try { sa = !!snapActive() || !!smartOn(); } catch (e) {} if ((c && (c.snap || c.magnet)) || sa) { const i = items.findIndex(it => it && /^Arrange/.test(it.label || '')); const it = { label: 'Move it freely once', note: 'the next move ignores the magnet, guides and grid', icon: 'pan', fn: () => { PAR.freeOnce = true; PAR.freeArmed = false; toast('Drag it where you want: nothing will pull it into line this time.', 3200); } }; if (i >= 0) items.splice(i, 0, it); else items.push(it); } } catch (e) {} return r; };
/* 6: installing, in the words of the device */
const installHelpP86 = installHelp; installHelp = function () { if (!PARITY86 || isApplePad()) return installHelpP86.apply(this, arguments);
  const standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  const md = modal(`<h3>Install Redline on this computer</h3><p>${standalone ? 'It is installed: this window is the app.' : 'Installed, it opens in its own window from the Start menu, taskbar or Dock, and works with no connection.'}</p><dl><dt>1</dt><dd>In Chrome or Edge, look at the right end of the address bar for the <b>Install</b> icon (a screen with an arrow), or open the ⋮ menu.</dd><dt>2</dt><dd>Chrome: <b>Cast, save and share › Install page as app</b>. Edge: <b>Apps › Install this site as an app</b>.</dd><dt>3</dt><dd>Open Redline from its own icon from then on. Sign in to your Redline account there and your documents follow.</dd></dl><p class="muted">On the iPad it is Safari’s Share button › Add to Home Screen.</p><div class="acts">${PAR.install ? '<button class="btn line" id="ihGo">Install now</button>' : ''}<button class="btn solid" id="ihOk">Close</button></div>`);
  md.querySelector('#ihOk').onclick = md.close; const go = md.querySelector('#ihGo'); if (go) go.onclick = async () => { try { PAR.install.prompt(); await PAR.install.userChoice; PAR.install = null; } catch (e) {} md.close(); }; };
window.__rdInstallLabel86 = () => (PARITY86 && !isApplePad()) ? 'Install Redline on this computer' : 'Put this app on your Home Screen';
window.addEventListener('beforeinstallprompt', e => { try { e.preventDefault(); PAR.install = e; } catch (er) {} });
/* 7: the shortcut list, with the touch way next to each addition */
const keysDialogP86 = keysDialog; keysDialog = function () { const r = keysDialogP86.apply(this, arguments); try { if (!PARITY86) return r; const md = [...document.querySelectorAll('.scrim')].pop(), dl = md && md.querySelector('dl'); if (!dl) return r;
    const rows = [['Alt + Z', 'Fit the box to its text · touch: hold the box › Fit the box to the text'], ['Ctrl + drag', 'Drag away a copy · touch: hold › Duplicate'], ['Shift + drag', 'Ignore magnet, guides and grid for this move · touch: hold › Move it freely once'], ['Ctrl + P', 'Print · touch: Save › Print…'], ['Tab / Shift + Tab', 'Next and previous form field · touch: ◀ ▶ above the field'], ['Ctrl + Shift + &gt; / &lt;', 'Form text bigger or smaller · touch: A+ and A− above the field'], ['Right-click', 'The menu for what is under the pointer · touch: hold still'], ['Double-click', 'Edit a text box or a symbol’s label · touch: double-tap'], ['Ctrl + wheel', 'Zoom · touch: pinch']];
    for (const [k, v] of rows) { const dt = document.createElement('dt'); dt.innerHTML = k.split(' + ').map(x => x.split(' / ').map(y => '<kbd>' + y.trim() + '</kbd>').join(' / ')).join(' + '); const dd = document.createElement('dd'); dd.textContent = v.replace(/&gt;/g, '>').replace(/&lt;/g, '<'); dl.append(dt, dd); } } catch (e) {} return r; };
HELP.push(['Mouse, finger and Pencil do the same things', ['Whatever a right-click does on a computer, holding still does on the iPad — on a markup, on one of its handles, or on empty paper, with a finger or the Pencil. Double-click and double-tap both edit a text box or a symbol’s letter. Shift-drag (ignore the magnet and guides for one move) is "Move it freely once" in a markup’s menu. Tab and Shift+Tab between form fields are the ◀ ▶ buttons above the field. Once the Pencil has been used, fingers move the page and the Pencil works the tools; Settings › Draw with a finger changes that.']]);
Object.assign(RDX, { PARITY86, PAR, rotHandle86: () => rotHandle() }); /* the handle position, for the audit */
