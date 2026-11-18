/* ---------- CIVIL86 (iPad edition): site and civil symbols, and a label you can change on the sheet ----------
   Adds a "Civil / site" group to the symbol picker — the meters, valves, drains, sprinkler heads, poles and site items
   that live on a site plan — and makes every symbol's letter or number editable where the work happens: double-tap a
   placed symbol, or hold it and choose "Change the letter or number…". The label belongs to that markup, so two water
   meters on the same sheet can read W1 and W2, and a detail bubble can carry this drawing's own number. */
const CIVIL86 = true;
const CIV86 = [
  // utilities and meters
  ['cv_gasm', 'Gas meter', 1, 'G', 'cv', 'gas meter utility service'], ['cv_elecm', 'Electric meter', 1, 'E', 'cv', 'electric meter kwh utility'],
  ['cv_waterm', 'Water meter', 1, 'W', 'cv', 'water meter domestic'], ['cv_meterpit', 'Meter pit / vault', 0.7, 'MP', 'cv', 'water meter pit vault box'],
  ['cv_gasv', 'Gas valve', 1, 'GV', 'cv', 'gas shut off valve service'], ['cv_waterv', 'Water valve', 1, 'WV', 'cv', 'gate valve curb stop shut off'],
  ['cv_curb', 'Curb stop / corp stop', 1, 'CS', 'cv', 'curb stop service box'], ['cv_bfp', 'Backflow preventer', 0.55, 'BFP', 'cv', 'backflow rpz double check'],
  ['cv_xfmr', 'Pad transformer', 0.7, 'T', 'cv', 'transformer pad electric utility'], ['cv_pole', 'Utility pole', 1, '', 'cv', 'power pole overhead'],
  ['cv_lightpole', 'Light pole', 0.5, '', 'cv', 'site light pole parking'], ['cv_handhole', 'Hand hole / pull box', 0.6, 'HH', 'cv', 'pull box junction electrical'],
  ['cv_genset', 'Generator', 0.6, 'GEN', 'cv', 'standby generator pad'], ['cv_ev', 'EV charger', 0.6, 'EV', 'cv', 'car charger'],
  ['cv_propane', 'Propane tank', 0.5, 'LP', 'cv', 'lp gas tank'], ['cv_well', 'Well head', 1, 'WL', 'cv', 'water well'],
  ['cv_septic', 'Septic tank', 0.55, 'ST', 'cv', 'septic tank drain field'], ['cv_condenser', 'AC condenser', 1, 'AC', 'cv', 'condenser heat pump outdoor unit'],
  // fire
  ['cv_hydrant', 'Fire hydrant', 1, 'FH', 'cv', 'hydrant fire water'], ['cv_fdc', 'Fire department connection', 1, 'FDC', 'cv', 'siamese standpipe'],
  ['cv_piv', 'Post indicator valve', 1, 'PIV', 'cv', 'fire valve post indicator'], ['cv_firespr', 'Fire sprinkler head', 1, '', 'cv', 'sprinkler head pendant upright fire'],
  ['cv_riser', 'Sprinkler riser', 0.6, 'FR', 'cv', 'fire riser room'],
  // irrigation and drainage
  ['cv_sprink', 'Irrigation head', 1, '', 'cv', 'sprinkler head lawn spray rotor irrigation ground'],
  ['cv_irrvalve', 'Irrigation valve', 1, 'IV', 'cv', 'zone valve irrigation box'],
  ['cv_hosebib', 'Yard hydrant / hose bib', 1, 'HB', 'cv', 'spigot yard hydrant'],
  ['cv_co', 'Cleanout', 1, 'CO', 'cv', 'sewer cleanout'], ['cv_mh', 'Manhole', 1, 'MH', 'cv', 'manhole sanitary storm'],
  ['cv_cb', 'Catch basin', 1, 'CB', 'cv', 'storm inlet grate catch basin'], ['cv_areadrain', 'Area drain', 1, 'AD', 'cv', 'yard drain'],
  ['cv_ds', 'Downspout / leader', 1, 'DS', 'cv', 'downspout gutter leader'], ['cv_sump', 'Sump discharge', 1, 'SD', 'cv', 'sump pump discharge'],
  ['cv_culvert', 'Culvert / end section', 0.5, '', 'cv', 'pipe culvert headwall'], ['cv_swale', 'Swale / flow arrow', 0.5, '', 'cv', 'drainage flow slope swale'],
  // site
  ['cv_spot', 'Spot elevation', 0.5, '100.00', 'cv', 'spot grade elevation'], ['cv_bm', 'Benchmark', 1, 'BM', 'cv', 'benchmark control point'],
  ['cv_bollard', 'Bollard', 1, '', 'cv', 'bollard post'], ['cv_sign', 'Sign post', 0.5, '', 'cv', 'site sign post'],
  ['cv_ada', 'Accessible space', 0.8, '', 'cv', 'ada handicap parking space'], ['cv_parking', 'Parking count', 0.6, '12', 'cv', 'parking stall count'],
  ['cv_tree', 'Tree', 1, '', 'cv', 'tree landscape existing'], ['cv_shrub', 'Shrub', 1, '', 'cv', 'shrub planting landscape'],
  ['cv_silt', 'Silt fence', 0.35, 'SF', 'cv', 'silt fence erosion control'], ['cv_tree_prot', 'Tree protection', 0.35, 'TP', 'cv', 'tree protection fence'],
  ['cv_soil', 'Soil boring / test pit', 1, 'B-1', 'cv', 'boring test pit geotech'], ['cv_mailbox', 'Mailbox', 0.7, '', 'cv', 'mail box'],
];
SYM86.push(...CIV86); for (const s of CIV86) SYMMAP86.set(s[0], s);
{ const i = SYMCAT86.findIndex(c => c[0] === 'dw'); SYMCAT86.splice(i < 0 ? SYMCAT86.length : i, 0, ['cv', 'Civil / site']); }
const symDrawC86 = symDraw86; symDraw86 = function (p, id, b, st, text, col) {
  if (!CIVIL86 || id.slice(0, 3) !== 'cv_') return symDrawC86.apply(this, arguments);
  const x = b.x, y = b.y, w = b.w, h = b.h, cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) / 2, lw = st.width || 2, fs0 = Math.max(6, Math.min(w, h) * 0.42);
  const T = (t, sz, yy, xx) => { if (!t && t !== 0) return; t = String(t); sz = sz || fs0; p.text(t, (xx == null ? cx : xx) - textW(t, sz, true) / 2, (yy == null ? cy : yy) + sz * 0.35, sz, col, true); };
  const L = (ax, ay, bx, by) => { p.moveTo(ax, ay); p.lineTo(bx, by); }, S_ = o => p.paint({ stroke: col, width: lw, ...(o || {}) }), F = () => p.paint({ fill: col }), D = () => p.paint({ stroke: col, width: lw, dash: [lw * 3, lw * 2.5] });
  const C = (k, cxx, cyy) => { p.begin(); addCircle(p, cxx == null ? cx : cxx, cyy == null ? cy : cyy, r * k); };
  const RECT = (x0, y0, w0, h0) => { p.begin(); p.moveTo(x0, y0); p.lineTo(x0 + w0, y0); p.lineTo(x0 + w0, y0 + h0); p.lineTo(x0, y0 + h0); p.close(); };
  const fit = (t, k) => Math.max(5, Math.min(h * (k || 0.5), w * 0.82 / Math.max(1, String(t).length) * 1.75));
  const inBox = (lab, k) => { RECT(x + w * 0.06, y + h * 0.06, w * 0.88, h * 0.88); S_(); if (lab) T(lab, fit(lab, k || 0.46), cy); };
  const inCircle = (lab) => { C(0.92); S_(); if (lab) T(lab, fit(lab, 0.5), cy); };
  const valve = (lab) => { p.begin(); p.moveTo(cx - r * 0.85, cy - r * 0.6); p.lineTo(cx, cy); p.lineTo(cx - r * 0.85, cy + r * 0.6); p.close(); p.moveTo(cx + r * 0.85, cy - r * 0.6); p.lineTo(cx, cy); p.lineTo(cx + r * 0.85, cy + r * 0.6); p.close(); S_(); if (lab) T(lab, fit(lab, 0.34), cy + r * 1.05); };
  switch (id) {
    case 'cv_gasm': case 'cv_elecm': case 'cv_waterm': { C(0.78); S_(); const d = { cv_gasm: 'G', cv_elecm: 'E', cv_waterm: 'W' }[id]; T(text || d, fit(text || d, 0.6), cy); p.begin(); L(cx - r, cy + r * 0.78, cx + r, cy + r * 0.78); S_({ width: lw * 1.2 }); break; }
    case 'cv_meterpit': inBox(''); p.begin(); addCircle(p, cx, y + h * 0.36, Math.min(w, h) * 0.17); S_(); { const t = text || 'MP'; T(t, fit(t, 0.3), y + h * 0.74); } break;
    case 'cv_gasv': case 'cv_waterv': case 'cv_irrvalve': valve(text || (id === 'cv_gasv' ? 'GV' : id === 'cv_waterv' ? 'WV' : 'IV')); break;
    case 'cv_curb': C(0.5); S_(); p.begin(); L(cx, cy - r, cx, cy - r * 0.5); L(cx, cy + r * 0.5, cx, cy + r); S_(); T(text || 'CS', fit(text || 'CS', 0.3), cy + r * 1.1); break;
    case 'cv_bfp': { RECT(x + w * 0.05, y + h * 0.2, w * 0.9, h * 0.6); S_(); p.begin(); L(x, cy, x + w * 0.05, cy); L(x + w * 0.95, cy, x + w, cy); S_(); const t = text || 'BFP'; T(t, fit(t, 0.4), cy); break; }
    case 'cv_xfmr': inBox(text || 'T', 0.5); p.begin(); L(x + w * 0.06, y + h * 0.06, x + w * 0.94, y + h * 0.94); S_({ width: lw * 0.7 }); break;
    case 'cv_pole': C(0.3); S_(); p.begin(); L(cx - r, cy - r * 0.3, cx + r, cy - r * 0.3); L(cx - r * 0.7, cy - r * 0.62, cx + r * 0.7, cy - r * 0.62); S_(); if (text) T(text, fit(text, 0.3), cy + r * 0.95); break;
    case 'cv_lightpole': p.begin(); L(cx, y + h, cx, y + h * 0.3); S_({ width: lw * 1.2 }); p.begin(); addCircle(p, cx, y + h * 0.22, Math.min(w, h) * 0.18); S_(); p.begin(); L(cx - w * 0.22, y + h * 0.3, cx + w * 0.22, y + h * 0.3); S_(); if (text) T(text, fit(text, 0.26), y + h * 0.72); break;
    case 'cv_handhole': inBox(text || 'HH'); break;
    case 'cv_genset': inBox(text || 'GEN'); break;
    case 'cv_ev': inBox(text || 'EV'); break;
    case 'cv_propane': { const rr = h * 0.42; p.begin(); p.moveTo(x + w * 0.22, cy - rr); p.lineTo(x + w * 0.78, cy - rr); p.curveTo ? null : null; p.lineTo(x + w * 0.78, cy - rr); p.close(); RECT(x + w * 0.04, cy - rr, w * 0.92, rr * 2); S_(); p.begin(); L(x + w * 0.2, cy - rr, x + w * 0.2, cy + rr); L(x + w * 0.8, cy - rr, x + w * 0.8, cy + rr); S_({ width: lw * 0.7 }); const t = text || 'LP'; T(t, fit(t, 0.52), cy); break; }
    case 'cv_well': C(0.92); S_(); C(0.5); S_(); { const t = text || 'WL'; T(t, fit(t, 0.34), cy); } break;
    case 'cv_septic': inBox(text || 'ST', 0.42); break;
    case 'cv_condenser': inBox(''); p.begin(); addCircle(p, cx, cy, r * 0.42); S_(); p.begin(); L(cx - r * 0.42, cy, cx + r * 0.42, cy); L(cx, cy - r * 0.42, cx, cy + r * 0.42); S_({ width: lw * 0.8 }); { const t = text || 'AC'; T(t, fit(t, 0.22), y + h * 0.78); } break;
    case 'cv_hydrant': C(0.55); F(); p.begin(); L(cx - r, cy, cx - r * 0.55, cy); L(cx + r * 0.55, cy, cx + r, cy); L(cx, cy - r, cx, cy - r * 0.55); S_({ width: lw * 1.3 }); if (text && text !== 'FH') T(text, fit(text, 0.28), cy + r * 1.15); break;
    case 'cv_fdc': { C(0.48, cx - r * 0.42); S_(); C(0.48, cx + r * 0.42); S_(); p.begin(); L(cx - r * 0.42, cy - r * 0.48, cx + r * 0.42, cy - r * 0.48); S_(); const t = text || 'FDC'; T(t, fit(t, 0.3), cy + r * 1.1); break; }
    case 'cv_piv': C(0.5); S_(); p.begin(); L(cx, cy + r * 0.5, cx, cy + r); S_({ width: lw * 1.3 }); T(text || 'PIV', fit(text || 'PIV', 0.3), cy - r * 0.95); break;
    case 'cv_firespr': C(0.34); F(); p.begin(); L(cx - r * 0.9, cy, cx + r * 0.9, cy); L(cx, cy - r * 0.9, cx, cy + r * 0.9); S_(); if (text) T(text, fit(text, 0.26), cy + r * 1.2); break;
    case 'cv_riser': inBox(text || 'FR', 0.42); break;
    case 'cv_sprink': { C(0.26); F(); for (let i = 0; i < 6; i++) { const a = -Math.PI * 0.95 + i * Math.PI * 0.38; p.begin(); L(cx + Math.cos(a) * r * 0.34, cy + Math.sin(a) * r * 0.34, cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.95); S_({ width: lw * 0.8 }); } if (text) T(text, fit(text, 0.26), cy + r * 1.2); break; }
    case 'cv_hosebib': C(0.3); S_(); p.begin(); L(cx, cy + r * 0.3, cx, cy + r * 0.9); L(cx - r * 0.5, cy - r * 0.35, cx + r * 0.5, cy - r * 0.35); S_(); T(text || 'HB', fit(text || 'HB', 0.3), cy + r * 1.2); break;
    case 'cv_co': C(0.9); S_(); p.begin(); L(cx - r * 0.64, cy - r * 0.64, cx + r * 0.64, cy + r * 0.64); L(cx - r * 0.64, cy + r * 0.64, cx + r * 0.64, cy - r * 0.64); S_(); T(text || 'CO', fit(text || 'CO', 0.26), cy + r * 1.25); break;
    case 'cv_mh': inCircle(text || 'MH'); break;
    case 'cv_cb': { RECT(x + w * 0.08, y + h * 0.08, w * 0.84, h * 0.84); S_(); for (let i = 1; i < 4; i++) { p.begin(); L(x + w * 0.08, y + h * (0.08 + 0.21 * i), x + w * 0.92, y + h * (0.08 + 0.21 * i)); S_({ width: lw * 0.7 }); } const t = text || 'CB'; T(t, fit(t, 0.3), y + h * 1.06); break; }
    case 'cv_areadrain': C(0.9); S_(); C(0.45); S_({ width: lw * 0.8 }); T(text || 'AD', fit(text || 'AD', 0.3), cy); break;
    case 'cv_ds': C(0.55); S_(); p.begin(); L(cx - r * 0.55, cy - r * 0.55, cx + r * 0.55, cy + r * 0.55); S_(); T(text || 'DS', fit(text || 'DS', 0.3), cy + r * 1.15); break;
    case 'cv_sump': C(0.6); S_(); p.begin(); L(cx, cy - r * 0.6, cx, cy + r * 0.6); S_(); T(text || 'SD', fit(text || 'SD', 0.3), cy + r * 1.15); break;
    case 'cv_culvert': { p.begin(); L(x, y + h * 0.3, x + w, y + h * 0.3); L(x, y + h * 0.7, x + w, y + h * 0.7); S_(); p.begin(); L(x + w * 0.12, y, x, y + h * 0.3); L(x + w * 0.12, y + h, x, y + h * 0.7); L(x + w * 0.88, y, x + w, y + h * 0.3); L(x + w * 0.88, y + h, x + w, y + h * 0.7); S_({ width: lw * 0.8 }); if (text) T(text, fit(text, 0.3), cy); break; }
    case 'cv_swale': { p.begin(); p.moveTo(x, cy + h * 0.2); p.lineTo(x + w * 0.72, cy + h * 0.2); S_({ width: lw * 1.2 }); p.begin(); p.moveTo(x + w, cy + h * 0.2); p.lineTo(x + w * 0.72, cy - h * 0.12); p.lineTo(x + w * 0.72, cy + h * 0.52); p.close(); F(); if (text) T(text, fit(text, 0.5), cy - h * 0.25, x + w * 0.4); break; }
    case 'cv_spot': { p.begin(); L(cx - w * 0.1, cy - h * 0.1, cx + w * 0.1, cy + h * 0.1); L(cx - w * 0.1, cy + h * 0.1, cx + w * 0.1, cy - h * 0.1); S_(); const t = text || '100.00'; T(t, fit(t, 0.55), cy + h * 0.32); break; }
    case 'cv_bm': { TRIc(); function TRIc() { p.begin(); p.moveTo(cx, cy - r * 0.85); p.lineTo(cx + r * 0.8, cy + r * 0.55); p.lineTo(cx - r * 0.8, cy + r * 0.55); p.close(); } S_(); p.begin(); addCircle(p, cx, cy + r * 0.05, r * 0.16); F(); T(text || 'BM', fit(text || 'BM', 0.26), cy + r * 1.2); break; }
    case 'cv_bollard': C(0.55); S_(); C(0.22); F(); if (text) T(text, fit(text, 0.26), cy + r * 1.2); break;
    case 'cv_sign': { p.begin(); L(cx, y + h, cx, y + h * 0.42); S_({ width: lw * 1.1 }); RECT(x + w * 0.12, y + h * 0.05, w * 0.76, h * 0.36); S_(); if (text) T(text, fit(text, 0.3), y + h * 0.24); break; }
    case 'cv_ada': { RECT(x + w * 0.05, y + h * 0.05, w * 0.9, h * 0.9); S_(); p.begin(); addCircle(p, cx, y + h * 0.3, Math.min(w, h) * 0.12); F(); p.begin(); L(cx, y + h * 0.42, cx, y + h * 0.62); L(cx, y + h * 0.62, cx + w * 0.2, y + h * 0.72); L(cx - w * 0.18, y + h * 0.5, cx + w * 0.16, y + h * 0.5); S_({ width: lw * 1.1 }); if (text) T(text, fit(text, 0.22), y + h * 0.92); break; }
    case 'cv_parking': { RECT(x + w * 0.05, y + h * 0.05, w * 0.9, h * 0.9); S_(); const t = text || '12'; T(t, fit(t, 0.62), cy); break; }
    case 'cv_tree': C(0.92); D(); C(0.18); F(); if (text) T(text, fit(text, 0.26), cy + r * 1.2); break;
    case 'cv_shrub': { for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 0.4; p.begin(); addCircle(p, cx + Math.cos(a) * r * 0.45, cy + Math.sin(a) * r * 0.45, r * 0.42); S_({ width: lw * 0.8 }); } if (text) T(text, fit(text, 0.26), cy + r * 1.25); break; }
    case 'cv_silt': case 'cv_tree_prot': { p.begin(); L(x, cy + h * 0.25, x + w, cy + h * 0.25); S_({ width: lw * 1.1 }); for (let i = 0; i <= 5; i++) { const px = x + w * (0.06 + 0.176 * i); p.begin(); L(px, cy + h * 0.25, px, cy - h * 0.3); S_({ width: lw * 0.8 }); } const t = text || (id === 'cv_silt' ? 'SF' : 'TP'); T(t, fit(t, 0.45), cy - h * 0.45); break; }
    case 'cv_soil': C(0.6); S_(); p.begin(); L(cx - r * 0.6, cy, cx + r * 0.6, cy); S_(); T(text || 'B-1', fit(text || 'B-1', 0.3), cy + r * 1.2); break;
    case 'cv_mailbox': { RECT(x + w * 0.1, y + h * 0.18, w * 0.8, h * 0.44); S_(); p.begin(); L(cx, y + h * 0.62, cx, y + h); S_({ width: lw * 1.1 }); if (text) T(text, fit(text, 0.26), y + h * 0.42); break; }
    default: return symDrawC86.apply(this, arguments);
  }
};
/* the label belongs to the markup: double-tap a symbol, or hold it, to change it for this drawing */
function symTextDialog86(m) { if (!m || m.type !== 'symbol') return; const entry = SYMMAP86.get(m.sym), name = entry ? entry[1] : 'Symbol';
  const md = modal(`<h3>${name}</h3><p class="muted" style="margin-top:0">What this one says on this drawing — a number, a letter, a tag. Leave it empty for the plain symbol.</p><label style="display:grid;gap:4px"><span>Letter or number</span><input type="text" id="syTx" maxlength="12" value="${String(m.text || '').replace(/"/g, '&quot;')}"></label><div class="acts"><button class="btn line" id="syCancel">Cancel</button><button class="btn solid" id="syOk">Done</button></div>`);
  const i = md.querySelector('#syTx'); setTimeout(() => { i.focus(); i.select(); }, 30); i.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); md.querySelector('#syOk').click(); } };
  md.querySelector('#syCancel').onclick = md.close;
  md.querySelector('#syOk').onclick = () => { const v = i.value.trim(); md.close(); if (v === (m.text || '')) return; pushUndo(); m.text = v; S.dirty = true; changed(); }; }
const ctxExtrasSy86 = ctxExtras; ctxExtras = function (items, sm, one, s) { const r = ctxExtrasSy86.apply(this, arguments); try { if (!CIVIL86) return r; const m = one || (sm && sm.length === 1 ? sm[0] : null);
    if (m && m.type === 'symbol' && editable(m)) items.unshift({ label: 'Change the letter or number…', note: m.text ? 'now “' + m.text + '”' : 'blank', icon: 'text', fn: () => symTextDialog86(m) }, '-'); } catch (e) {} return r; };
/* double-tap: V85 sends text, callout and sticky to the editor; a symbol opens its label instead */
const TEXTLIKE_add86 = (() => { try { TEXTLIKE.add('symbol'); } catch (e) {} return true; })();
const startEditSy86 = startEdit; startEdit = function (m, isNew) { if (CIVIL86 && m && m.type === 'symbol') return symTextDialog86(m); return startEditSy86.apply(this, arguments); };
HELP.push(['Civil and site symbols', ['The symbol picker has a Civil / site group: gas, electric and water meters, valves and curb stops, backflow preventers, transformers and poles, hydrants, FDC, post indicator valves, fire sprinkler heads, irrigation heads and valves, cleanouts, manholes, catch basins, area drains, downspouts, culverts, swale arrows, spot elevations, benchmarks, bollards, ADA spaces, parking counts, trees, shrubs, silt fence and more. Every symbol’s letter or number belongs to that markup: double-tap it, or hold it and choose "Change the letter or number…", so two meters on one sheet can read W1 and W2 and a bubble can carry this drawing’s own number.']]);
Object.assign(RDX, { CIVIL86, CIV86, symTextDialog86 });
