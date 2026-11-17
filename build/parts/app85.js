/* ---------- LOOK86 (iPad edition): the drawing display (Blueprint, Grayscale, Black lines, Faded, Swap a color) in the More menu ----------
   V85 keeps these in the "Change colors" dialog, reached by holding on the page; with the patch LOOK86 the dialog also opens on
   a page without markups. This adds a plain entry in More › This document so it is easy to find. Switch: LOOK86. */
const LOOK86 = true;
const extraItemsL86 = extraItems86; extraItems86 = function (where) { const r = extraItemsL86.apply(this, arguments) || []; if (!LOOK86 || where !== 'doc' || !S.pages || !S.pages.length) return r;
  const pm = store.get('pageColor', { mode: 'orig' }), now = { gray: 'grayscale', black: 'black lines', faded: 'faded', blue: 'blueprint', swap: 'color swapped' }[pm && pm.mode] || '';
  return [{ label: 'How the drawing shows: blueprint, grayscale…', note: now ? 'now: ' + now : '', icon: 'style', fn: colorEditDialog }, ...r]; };
HELP.push(['Blueprint and other drawing looks', ['More, This document, “How the drawing shows” turns the sheet into a blueprint, grayscale, black lines or faded, or swaps one drawing color for another; it also sits in the Change colors dialog when you hold on the page. It changes how the sheet looks here and in snapshots; the saved PDF keeps its original colors.']]);
Object.assign(RDX, { LOOK86 });
