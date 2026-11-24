#!/usr/bin/env python3
"""Builds guide/index.html for the iPad edition from CARDS below + the release notes in parts/app92.js.
Same shape as the "Redline Desk Training" page: picture index, one card per task with a clip and numbered steps, search,
"I tried it" progress, read-aloud, keyboard card, release notes. Run after adding a card or a clip (markup/rec.js)."""
import re, json, html, pathlib, datetime
HERE = pathlib.Path(__file__).parent
BASICS = 'https://claude.ai/artifact/2kiue7SDAAmLzdgBW4wfDz'
APP = 'https://abormel15.github.io/redline/'

# gesture pictures
G = {
 'tap': '<span class="gest" title="Tap"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="18" r="6" class="f"/><circle cx="16" cy="18" r="11" class="r"/></svg><em>Tap</em></span>',
 'hold': '<span class="gest" title="Hold"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="18" r="6" class="f"/><circle cx="16" cy="18" r="11" class="r"/><path d="M24 6a6 6 0 1 1-6 6" class="s"/></svg><em>Hold</em></span>',
 'drag': '<span class="gest" title="Drag"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="9" cy="22" r="5.5" class="f"/><path d="M13 18L26 6M19 6h7v7" class="s"/></svg><em>Drag</em></span>',
 'type': '<span class="gest" title="Type"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="9" width="26" height="14" rx="3" class="s"/><path d="M8 14h2M13 14h2M18 14h2M23 14h2M10 19h12" class="s"/></svg><em>Type</em></span>',
 'key': '<span class="gest" title="Key"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="8" width="24" height="16" rx="4" class="s"/><path d="M11 16h10" class="s"/></svg><em>Key</em></span>',
 'look': '<span class="gest" title="Look"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16z" class="s"/><circle cx="16" cy="16" r="4" class="f"/></svg><em>Look</em></span>',
}
# small icons (24 px strokes)
I = {
 'files': '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 'account': '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 'sheets': '<path d="M5 3h10l4 4v14H5zM15 3v4h4M8 12h8M8 16h6"/>',
 'symbol': '<circle cx="12" cy="12" r="5"/><path d="M2 12h5M17 12h5M9 10h6M9 14h6"/>',
 'form': '<path d="M4 5h16v14H4zM7 9h6M7 13h10M16 9h1"/>',
 'print': '<path d="M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6z"/>',
 'save': '<path d="M5 3h11l3 3v15H5zM8 3v6h7V3M8 21v-7h8v7"/>',
 'split': '<path d="M4 5h16v14H4zM12 5v14"/>',
 'link': '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
 'look': '<path d="M3 12s4-7 9-7 9 7 9 7-4 7-9 7-9-7-9-7z"/><circle cx="12" cy="12" r="3"/>',
 'fest': '<path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/>',
 'keys': '<path d="M4 7h16M4 12h16M4 17h16M9 5v4M15 10v4M7 15v4"/>',
 'new': '<path d="M12 3v18M3 12h18"/>',
 'install': '<path d="M7 3h10v18H7zM10 19h4M12 7v6M9 10l3 3 3-3"/>',
 'folder': '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 11v6M9 14h6"/>',
 'crop': '<path d="M6 2v16h16M2 6h16v16"/>',
 'help': '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.5-1.1 1-1.1 1.8M12 17h.01"/>',
 'more': '<path d="M5 12h.01M12 12h.01M19 12h.01" stroke-width="3"/>',
 'pen': '<path d="M4 20l1-5L16 4l4 4L9 19zM14 6l4 4"/>',
 'text': '<path d="M5 6h14M12 6v13M9 19h6"/>',
 'arrow': '<path d="M6 3l12 9-5.5 1L10 19z"/>',
}
def ic(name, cls='ic'): return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true">{I[name]}</svg>'
def ab(name): return f'<span class="ab">{ic(name)}</span>'

# sections: (id, colour class, title, blurb, cards)
# card: id, title, icon, clip (or None), steps [(gesture, button-icon or None, text html)], note, keys, extra html
SECTIONS = [
 ('start', 'c-slate', 'Getting started on the iPad', 'The iPad edition is a home-screen app: its own icon, works offline, your documents on the device and in your account.', [
  dict(id='install', title='Put Redline on the home screen', icon='install', clip=None, keys='install home screen icon safari add', steps=[
   ('tap', None, f'In Safari on the iPad, open <b>{APP}</b>.'),
   ('tap', None, 'Tap the <b>Share</b> button (the square with the arrow), then <b>Add to Home Screen</b>, then <b>Add</b>.'),
   ('tap', None, 'Open <b>Redline</b> from the home screen from now on. It fills the screen and works without a connection.')],
   note='On a computer open the same address in Chrome or Edge. Chrome also offers “Install Redline” in the address bar.'),
  dict(id='account', title='Sign in so your work follows you', icon='account', clip='account', keys='account sign in sync password email devices supabase', steps=[
   ('tap', 'more', 'Tap <b>⋯ More</b>, then <b>Settings</b>, then <b>Redline account › Sign in…</b>.'),
   ('type', None, 'Enter your email and password. The first time, tap <b>Create an account</b>; one confirmation email arrives, tap its link, then sign in.'),
   ('look', None, 'The status under the document name says <b>In your account ✓</b>. Sign in the same way on the computer: documents, markups, folders and settings appear there too.')],
   note='PDFs are kept in the account too, so a document opens on the other device by itself. Settings › Redline account has a switch to keep markups only.'),
  dict(id='whatsnew', title='See what changed after an update', icon='new', clip='whatsnew', keys='what\'s new release notes update version build', steps=[
   ('look', None, 'After an update a <b>What’s new</b> card opens on its own, with only the newest changes.'),
   ('tap', 'more', 'Any time: <b>⋯ More › What’s new in Redline</b>. <b>All notes</b> lists earlier updates. The build number is shown at the top.')]),
 ]),
 ('files', 'c-brown', 'Files', 'Projects and folders on the Files screen.', [
  dict(id='dragdrop', title='Drag documents and folders into folders', icon='folder', clip='dragdrop', keys='drag drop move folder project files organise', steps=[
   ('hold', None, 'With a finger or the Pencil, <b>hold</b> a document card until it lifts. With a mouse, just start dragging.'),
   ('drag', None, 'Drag it onto a <b>folder card</b>, or onto <b>Projects</b> or a parent folder in the path above the cards.'),
   ('tap', None, 'Select several first (the <b>Select</b> button) and they move together.')],
   note='A quick swipe still scrolls. A folder cannot be dropped into itself. “Move to a folder” in the card’s … menu still works too.'),
  dict(id='organize', title='Organize: loose documents into folders in one press', icon='folder', clip=None, keys='organize auto sort folders project month tidy clean up files undo', steps=[
   ('tap', None, 'In <b>Files</b>, press <b>Organize</b> (next to Sort). It is also the first line under <b>More</b>.'),
   ('look', None, 'It lists the folders it would make for the documents lying loose where you are. <b>By project name</b> puts names that start the same way together (“106 S Lee St survey” and “106 S Lee St bld plan” go into “106 S Lee St”); <b>By month</b> makes one folder per month a document was last changed.'),
   ('tap', None, 'Untick a folder you do not want, or type a better name for it. Then press <b>Organize</b>. Nothing moves before that.'),
   ('tap', None, 'Changed your mind? Press <b>Undo</b> on the bar that appears, or <b>More › Undo the last Organize</b> later. Every document goes back and the folders it made are removed.')],
   note='A document whose name starts with the name of a folder that is already there goes into that folder. One that matches nothing stays where it is. Inside a folder, Organize only looks at that folder.'),
  dict(id='thumbs', title='Bigger page thumbnails', icon='sheets', clip=None, keys='pages panel thumbnails bigger wider columns resize drag edge reorder', steps=[
   ('drag', None, 'Open the <b>Pages</b> panel and drag its right edge. On the iPad the edge is the strip with the small grip mark.'),
   ('look', None, 'The thumbnails grow to fill the panel. Make it wider still and they shift into two, three or more columns.'),
   ('drag', None, 'Reordering works in every layout: drag a thumbnail (on the iPad, hold it for a moment first) and drop it where the bar shows.')],
   note='The width is remembered. Drag the edge back for a single narrow column.'),
  dict(id='crop', title='Crop pages down to what matters', icon='crop', clip=None, keys='crop trim cut page sheet detail title block zoom area', steps=[
   ('drag', None, 'With the <b>Rectangle</b> tool, draw a box around the part of the sheet you want to keep.'),
   ('hold', None, 'Hold on that rectangle and choose <b>Crop this page to the box</b>, or <b>Crop every page to the box</b> for the whole set.'),
   ('look', None, 'The page becomes that area: markups move with it, and a PDF saved while cropped opens cropped for everyone else too.'),
   ('tap', 'more', 'Changed your mind? <b>⋯ More › Undo the crop</b> brings the whole sheet back — nothing was thrown away.')],
   note='A crop is a window on the page, not a cut, so it can be undone at any time and the file still holds the full sheet.'),
  dict(id='bringfolder', title='Bring in a whole folder of drawings', icon='files', clip=None, keys='import folder zip bring in subfolders', steps=[
   ('tap', None, 'On the iPad: in the Files app, hold the folder and choose <b>Compress</b> to make a ZIP.'),
   ('tap', None, 'In Redline: <b>New › Bring in a folder</b> (or <b>⋯ More › Bring in a folder</b>) and pick the ZIP. On a computer it opens a folder picker instead.'),
   ('look', None, 'Subfolders become folders, PDFs land in them, a folder of photos becomes one document.')]),
 ]),
 ('plans', 'c-blue', 'Plan sets', 'Sheet names, a sheet index and linked callouts.', [
  dict(id='sheets', title='Sheet names, the sheet index and callouts that jump', icon='sheets', clip='sheets', keys='sheet index title block callout detail bubble jump navigate A-2.1', steps=[
   ('tap', 'more', 'Tap <b>⋯ More › Name the pages from the title blocks</b>. Pages get their sheet number and title (A-2.1 · First floor plan).'),
   ('tap', 'more', '<b>⋯ More › Sheet index</b>: type a number or a word from the title, tap to jump. <b>Back</b> returns.'),
   ('tap', 'arrow', 'With the arrow tool, tap a sheet number printed on the page (a detail bubble, “SEE S-1.0”): it is underlined with dots, and the menu offers <b>Go to</b> that sheet.')],
   note='“Hide sheet links” in that menu turns the dotted underlines off.'),
  dict(id='linkview', title='A link that lands on an exact view', icon='link', clip='linkview', keys='link sheet view box zoom jump markup', steps=[
   ('hold', None, 'Hold on a markup and choose <b>Link to a sheet…</b>, then tap the sheet.'),
   ('drag', None, 'On the sheet that appears, <b>drag a box</b> around the part to show, then <b>Use this view</b>. Or choose <b>Whole sheet</b>.'),
   ('tap', None, 'Tapping the blue ↗ on the markup lands zoomed to that box. <b>Back</b> returns to where you were.')]),
  dict(id='split', title='Two documents side by side', icon='split', clip='split', keys='side by side split second view compare switch edit', steps=[
   ('tap', None, 'Open the second view (the split button in the top bar) and pick a document for it.'),
   ('tap', None, '<b>Tap the side you want to edit.</b> It becomes editable where it is — nothing swaps places, your zoom and your tool stay as they were.'),
   ('look', None, 'A short “Editing …” note names the document in hand.')]),
 ]),
 ('markup', 'c-red', 'Marking up', 'Construction symbols, looks for the drawing, the keyboard.', [
  dict(id='symbols', title='Construction symbols', icon='symbol', clip='symbols', keys='symbol legend outlet receptacle switch light recessed plumbing hose bib washer dryer HVAC diffuser highlight size', steps=[
   ('tap', None, 'Tap the <b>Symbols</b> tool (Insert group in the left rail). Pick a category or type in the search: outlet, can light, hose bib…'),
   ('tap', None, 'Choose a <b>Size</b> (S–XL), a <b>Highlight</b> block behind the symbol if you want new work to stand out, and a <b>colour</b>. Tap the symbol.'),
   ('tap', None, 'Tap the sheet wherever it goes; keep tapping for more. Pick another tool when done.'),
   ('hold', None, 'A placed symbol: drag a corner to resize, tap a swatch to recolour, hold it for <b>Highlight</b>, <b>Bigger</b>, <b>Smaller</b>.')],
   note='Electrical, lighting, plumbing, appliances, HVAC, general marks and the drawing marks (section cuts, bubbles, north arrow). They save and flatten like any markup.'),
  dict(id='civil', title='Civil and site symbols', icon='symbol', clip=None, keys='civil site gas electric water meter sprinkler head irrigation hydrant fdc manhole catch basin cleanout bollard ada tree silt fence utility', steps=[
   ('tap', None, 'Tap the <b>Symbols</b> tool, then the <b>Civil / site</b> group (or type what you want: meter, hydrant, catch basin…).'),
   ('tap', None, 'Meters, valves and curb stops, backflow preventers, transformers and poles, hydrants, FDC and post indicator valves, fire sprinkler heads, irrigation heads, cleanouts, manholes, catch basins, area drains, downspouts, culverts, swale arrows, spot elevations, benchmarks, bollards, ADA spaces, parking counts, trees and silt fence.'),
   ('hold', None, 'A symbol’s letter or number belongs to that markup: double-tap it, or hold it and choose <b>Change the letter or number…</b> — so two water meters can read W1 and W2, and a detail bubble carries this drawing’s number.')],
   note='Size, colour and the highlight block work the same as the other symbols.'),
  dict(id='lesstext', title='Editing the drawing’s text without bloating the file', icon='text', clip=None, keys='editable text boxes file size clean up heavy slow cad lines', steps=[
   ('tap', 'more', '<b>⋯ More › Make all the text on this page editable</b> now asks first.'),
   ('tap', None, '<b>Tap the lines I want</b> is the light way: with the Edit text tool, a line becomes a box only when you edit it.'),
   ('tap', 'more', 'Already converted a sheet? <b>⋯ More › Clean up the text boxes you never changed…</b> (near the bottom of the menu, always there while a document is open) counts the unchanged text boxes, blank covers and empty form boxes — on this page and in the whole document.'),
   ('tap', None, 'Tick what should go, then <b>This page</b> or <b>Whole document</b>. The drawing’s own words show again, and <b>Undo</b> brings the boxes back.')],
   note='Every cover and box is written into the PDF you save, which is what makes a converted sheet grow — on a test page, seven lines added about 40 KB.'),
  dict(id='looks', title='Blueprint look and sharper scans', icon='look', clip='looks', keys='blueprint grayscale black lines faded sharpen scan colour swap drawing look', steps=[
   ('tap', 'more', 'Tap <b>⋯ More › How the drawing shows</b> (or hold on the page › Change colors).'),
   ('tap', None, 'Pick <b>Blueprint</b>, <b>Grayscale</b>, <b>Black lines</b>, <b>Faded</b> or <b>Swap a color</b>.'),
   ('tap', None, '<b>Sharpen scanned pages: Light or Strong</b> makes vendor sheets and scans read crisper on screen.')],
   note='These change the screen and snapshots only; the saved PDF keeps its original colours.'),
  dict(id='festive', title='Looks for the season (and the study)', icon='fest', clip='festive', keys='festive theme holiday halloween christmas autumn wizard decorations', steps=[
   ('tap', 'more', 'Tap <b>⋯ More › Settings › Festive look</b>.'),
   ('tap', None, 'Choose <b>Automatic</b> (it follows the calendar), a season, or <b>Wizard’s study</b>. <b>Decorations</b> sets animated, still or off.'),
   ('look', None, 'Colours, the top strip, the home banner and a few icons change. A background or accent you pick yourself always wins.')]),
  dict(id='threeways', title='Mouse, finger and Pencil do the same things', icon='arrow', clip=None, keys='right click hold long press double tap double click pencil finger mouse keyboard parity touch', steps=[
   ('hold', None, '<b>Right-click</b> on a computer is <b>holding still</b> on the iPad — on a markup, on one of its handles, or on empty paper, with a finger or the Pencil.'),
   ('tap', None, '<b>Double-click</b> and <b>double-tap</b> both edit a text box, a callout, or a symbol’s letter or number.'),
   ('drag', None, '<b>Shift-drag</b> (ignore the magnet and guides for one move) is <b>Move it freely once</b> in a markup’s menu. <b>Ctrl-drag</b> (drag away a copy) is <b>Duplicate</b>.'),
   ('tap', None, '<b>Tab</b> and <b>Shift+Tab</b> between form fields are the <b>◀ ▶</b> buttons above the field; <b>Ctrl+P</b> is <b>Save › Print…</b>; <b>Ctrl+wheel</b> is a pinch.')],
   note='Once the Pencil has been used, fingers move the page and the Pencil works the tools. Settings › Draw with a finger changes that.'),
  dict(id='keys', title='Keyboard shortcuts', icon='keys', clip=None, keys='keyboard alt z ctrl drag shift snap copy fit text', steps=[
   ('key', None, '<kbd>Alt</kbd> <kbd>Z</kbd> fits the selected text boxes to their text.'),
   ('key', None, '<kbd>Ctrl</kbd>-drag (<kbd>⌘</kbd>-drag on a Mac) a markup to drag away a <b>copy</b>; the original stays.'),
   ('key', None, 'Hold <kbd>Shift</kbd> while moving or resizing to ignore the magnet, smart guides and grid for that move.'),
   ('key', None, '<kbd>Ctrl</kbd> <kbd>P</kbd> prints. <kbd>Tab</kbd> moves to the next form field, <kbd>Shift</kbd> <kbd>Tab</kbd> back.'),
   ('key', None, '<kbd>Ctrl</kbd> + mouse wheel zooms in steps of about 20% per notch, toward the pointer. The wheel alone scrolls. On the iPad, pinch.')]),
 ]),
 ('forms', 'c-green', 'Forms', 'Fill out any PDF form, fillable or not.', [
  dict(id='forms', title='Fill out a form', icon='form', clip='forms', keys='form fill fields 401k benefits boxes checkbox tab acrobat my details text size font bigger smaller fit', steps=[
   ('tap', 'more', 'Open the form and tap <b>⋯ More › Fill out this form</b>. Boxes, underlines, ____ runs and little squares become light-blue fields.'),
   ('tap', None, 'Tap a field to type or tick. <kbd>Tab</kbd> or <kbd>Enter</kbd> moves to the next one, <kbd>Shift</kbd> <kbd>Tab</kbd> back.'),
   ('tap', None, 'Fields labelled Name, Address, Phone, Email fill from <b>Settings › My details for forms</b> with one tap; Date fields get today’s date.'),
   ('hold', None, 'Missed a box? Hold on the page › <b>Add a text field here</b> or <b>Add a checkbox here</b>. <b>Remove this field</b> for a false hit.'),
   ('tap', None, 'Text too big or too small for the box? While the field is open, the small bar above it has <b>A−</b> and <b>A+</b>, <b>Auto</b> to go back, and <b>All</b> to use that size for every field in the document. Holding on a field gives the same under <b>Text size for this field…</b>.')],
   note='<b>Save PDF</b> turns the fields into real form fields, so the file is fillable in Acrobat and Preview too, with your answers in it. <b>Save flattened PDF</b> prints the answers in. Scanned forms (pictures) are not read yet: add fields by hand there.'),
 ]),
 ('out', 'c-purple', 'Print and save', 'Getting the work out.', [
  dict(id='print', title='Print', icon='print', clip='print', keys='print printer airprint pages range markups', steps=[
   ('tap', 'save', 'Tap <b>Save › Print…</b> (or <kbd>Ctrl</kbd> <kbd>P</kbd>).'),
   ('tap', None, 'Choose <b>This page</b>, <b>All</b> or a <b>Range</b>, and whether the markups are printed on the sheet or left out.'),
   ('look', None, 'On the iPad the PDF opens in the share sheet: choose <b>Print</b> there (or Save to Files). On a computer the print dialog opens straight away; pick paper size and “Fit to page” there.')]),
  dict(id='saveas', title='Save over the file on a computer', icon='save', clip=None, keys='save as save over file chrome edge download folder', steps=[
   ('tap', None, 'In Chrome or Edge on a computer, <b>Open</b> uses the system file picker and remembers the file.'),
   ('tap', 'save', '<b>Save › Save PDF</b> then writes over that same file (markups stay editable in it). <b>Save as…</b> picks a new place.'),
   ('look', None, 'Flattened PDFs, images and reports always ask where to go. The browser asks permission once per session before the first write.')],
   note='On the iPad saving goes through Files or the share sheet, as before. Safari and Firefox download instead.'),
 ]),
]

def gesture(g): return G[g]
def step(i, g, btn, text): return f'<li><span class="sn">{i}</span>{gesture(g)}{ab(btn) if btn else ""}<span class="st">{text}</span></li>'
def plain(t): return html.unescape(re.sub(r'<[^>]+>', '', t))
def card(c, colour):
    steps = ''.join(step(i + 1, g, b, t) for i, (g, b, t) in enumerate(c['steps']))
    say = html.escape(c['title'] + '. ' + ' '.join(plain(t) for _, _, t in c['steps']) + (' ' + plain(c['note']) if c.get('note') else ''), quote=True)
    media = f'<div class="cmedia"><button class="clip" data-gif="clips/{c["clip"]}.gif" aria-label="Play the clip for {html.escape(c["title"])}"><img src="clips/{c["clip"]}.jpg" alt="" loading="lazy"><span class="play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span><span class="live">Playing</span></button></div>' if c.get('clip') else ''
    note = f'<p class="cnote">{c["note"]}</p>' if c.get('note') else ''
    return (f'<article class="card {colour}" id="{c["id"]}" data-keys="{html.escape(c["keys"] + " " + c["title"])}">'
            f'<header class="ch"><span class="bigic">{ic(c["icon"])}</span><h2>{c["title"]}</h2><button class="say" data-say="{say}" aria-label="Read this aloud"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg><span>Listen</span></button></header>'
            f'<div class="cbody{"" if c.get("clip") else " nomedia"}">{media}<div class="csteps"><ol class="steps">{steps}</ol>{note}<label class="tried"><input type="checkbox" data-done="{c["id"]}"><span>I tried it</span></label></div></div></article>')

def release_notes():
    js = (HERE.parent / 'parts' / 'app92.js').read_text(encoding='utf-8')
    body = js[js.index('const RELNOTES = ['): js.index('];', js.index('const RELNOTES = [')) + 1]
    out = []
    for m in re.finditer(r"\{ v: '([^']+)', date: '([^']+)', items: \[(.*?)\] \}", body, re.S):
        items = re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(3))
        out.append((m.group(1), m.group(2), [i.replace("\\'", "'") for i in items]))
    return out

def build():
    index = ''.join(f'<div class="pgrp {col}"><h3>{html.escape(title)}</h3><div class="ptiles">' + ''.join(f'<a class="ptile" href="#{c["id"]}">{ic(c["icon"])}<span>{c["title"]}</span></a>' for c in cards) + '</div></div>' for _, col, title, _, cards in SECTIONS)
    secs = ''.join(f'<section class="sec {col}" id="s-{sid}"><div class="sech"><span class="secbar"></span><h1 class="sect">{html.escape(title)}</h1><p>{html.escape(blurb)}</p></div>' + ''.join(card(c, col) for c in cards) + '</section>' for sid, col, title, blurb, cards in SECTIONS)
    rel = release_notes()
    relhtml = ''.join(f'<details{" open" if i == 0 else ""}><summary>{html.escape(v)} · {html.escape(d)}</summary><ul>' + ''.join(f'<li>{html.escape(t)}</li>' for t in items) + '</ul></details>' for i, (v, d, items) in enumerate(rel))
    ncards = sum(len(c) for *_, c in SECTIONS)
    page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Redline · iPad edition guide</title>
<link rel="icon" href="../icons/icon-192.png">
<style>
:root{{--bg:#f3f6f9;--card:#fff;--ink:#15202b;--ink2:#4c5967;--line:#dbe2ea;--soft:#eaf0f6;--focus:#1f62b8;--hit:#ff5c26;--slate:#4b5d73;--brown:#8a5a2b;--red:#c8372d;--purple:#7044b8;--orange:#c96512;--blue:#1f62b8;--green:#2d8a4e;--teal:#11807f;--onsc:#fff;--font:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}}
@media (prefers-color-scheme:dark){{:root{{--bg:#10161d;--card:#18212b;--ink:#eef3f8;--ink2:#b3c0cd;--line:#2c3947;--soft:#1f2a36;--focus:#8fbaf0;--slate:#9fb2c8;--brown:#d7a26a;--red:#ff7b6e;--purple:#b896f3;--orange:#f2a25c;--blue:#7fb2f2;--green:#6fcf92;--teal:#5fd0cf;--onsc:#10161d;color-scheme:dark}}}}
*{{box-sizing:border-box}} html{{scroll-behavior:smooth;scroll-padding-top:12px}} @media (prefers-reduced-motion:reduce){{html{{scroll-behavior:auto}}}}
body{{margin:0;background:var(--bg);color:var(--ink);font:19px/1.6 var(--font);letter-spacing:.01em;-webkit-text-size-adjust:100%}}
:focus-visible{{outline:3px solid var(--focus);outline-offset:3px;border-radius:6px}} b{{font-weight:700}} kbd{{font:700 15px var(--font);background:var(--soft);border:1px solid var(--line);border-bottom-width:2px;border-radius:6px;padding:1px 7px}}
.c-slate{{--sc:var(--slate)}}.c-brown{{--sc:var(--brown)}}.c-red{{--sc:var(--red)}}.c-purple{{--sc:var(--purple)}}.c-orange{{--sc:var(--orange)}}.c-blue{{--sc:var(--blue)}}.c-green{{--sc:var(--green)}}.c-teal{{--sc:var(--teal)}}
svg.ic{{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}}
.wrap{{max-width:1120px;margin:0 auto;padding:24px 16px 120px}}
.hero{{display:flex;flex-direction:column;gap:14px;padding:8px 0 18px}} .brand{{display:flex;align-items:center;gap:10px;font-weight:700;color:var(--ink2);font-size:17px}} .brand .mk{{width:38px;height:38px;border-radius:10px;background:var(--red);color:#fff;display:grid;place-items:center}} .brand .mk svg{{width:22px;height:22px}}
h1{{font-size:clamp(32px,5vw,48px);line-height:1.12;margin:0;letter-spacing:0}} .lede{{font-size:21px;color:var(--ink2);margin:0;max-width:62ch}} .lede a{{color:var(--focus)}}
.tools{{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center}} .search{{position:relative;flex:1 1 320px;max-width:520px}} .search svg{{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--ink2);width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}}
.search input{{width:100%;font:19px var(--font);padding:13px 14px 13px 44px;border:2px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink)}} .search input:focus{{border-color:var(--focus);outline:none}}
.prog{{display:flex;align-items:center;gap:10px;font-size:16px;color:var(--ink2);flex:0 1 300px}} .bar{{flex:1;height:10px;border-radius:5px;background:var(--line);overflow:hidden;min-width:80px}} .bar i{{display:block;height:100%;width:0;background:var(--green);transition:width .3s}}
.gest{{display:inline-flex;flex-direction:column;align-items:center;gap:2px;width:64px;flex:none;color:var(--ink)}} .gest svg{{width:40px;height:40px}} .gest .f{{fill:var(--hit);stroke:#fff;stroke-width:1.5}} .gest .r{{fill:none;stroke:var(--hit);stroke-width:2;opacity:.55}} .gest .s{{fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}} .gest em{{font-style:normal;font-size:12.5px;line-height:1.15;text-align:center;color:var(--ink2)}}
.pick{{font-size:24px;margin:22px 0 10px}} .pindex{{display:flex;flex-direction:column;gap:14px}} .pgrp h3{{margin:0 0 6px;font-size:16px;color:var(--sc);display:flex;align-items:center;gap:8px}} .pgrp h3::before{{content:"";width:12px;height:12px;border-radius:50%;background:var(--sc)}}
.ptiles{{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}} .ptile{{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;text-decoration:none;color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 6px 10px;font-size:14.5px;line-height:1.25;min-width:0}} .ptile svg.ic{{width:30px;height:30px;color:var(--sc)}} .ptile:hover{{border-color:var(--sc)}}
.ptile.hide,.pgrp.hide,.card.hide,.sec.hide{{display:none}}
.sec{{margin-top:44px}} .sech{{display:grid;grid-template-columns:14px minmax(0,1fr);column-gap:12px;align-items:start;margin-bottom:6px}} .secbar{{grid-row:span 2;width:14px;height:100%;min-height:52px;border-radius:7px;background:var(--sc)}} .sect{{font-size:30px;margin:0;line-height:1.15}} .sech p{{margin:2px 0 0;color:var(--ink2)}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;margin-top:16px}} .ch{{display:flex;align-items:center;gap:14px;margin-bottom:14px}} .bigic{{width:56px;height:56px;border-radius:14px;background:var(--sc);color:var(--onsc);display:grid;place-items:center;flex:none}} .bigic svg.ic{{width:32px;height:32px}} .ch h2{{flex:1;margin:0;font-size:25px;line-height:1.2;min-width:0}}
.say{{display:inline-flex;align-items:center;gap:6px;font:700 16px var(--font);padding:9px 14px;border-radius:12px;border:2px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer;flex:none}} .say svg{{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}} .say.on{{border-color:var(--sc);color:var(--sc)}}
.cbody{{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:20px;align-items:start}} .cbody.nomedia{{grid-template-columns:minmax(0,1fr)}} @media (max-width:820px){{.cbody{{grid-template-columns:minmax(0,1fr)}}}}
.clip{{position:relative;display:block;width:100%;padding:0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--soft);cursor:pointer;aspect-ratio:1180/820}} .clip img{{display:block;width:100%;height:100%;object-fit:cover}}
.play{{position:absolute;inset:auto auto 12px 12px;width:52px;height:52px;border-radius:50%;background:rgba(0,0,0,.62);color:#fff;display:grid;place-items:center}} .play svg{{width:26px;height:26px;fill:#fff}} .live{{position:absolute;top:10px;right:10px;font:700 13px var(--font);background:var(--hit);color:#fff;border-radius:999px;padding:2px 10px;display:none}} .clip.playing .play{{display:none}} .clip.playing .live{{display:block}}
.steps{{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}} .steps li{{display:flex;align-items:center;gap:10px;background:var(--soft);border-radius:14px;padding:8px 12px 8px 8px}} .sn{{width:34px;height:34px;border-radius:50%;background:var(--sc);color:var(--onsc);font-weight:700;display:grid;place-items:center;flex:none}}
.ab{{display:inline-flex;align-items:center;gap:4px;height:40px;min-width:40px;padding:0 8px;justify-content:center;border:1.5px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink);flex:none}} .st{{min-width:0;line-height:1.4}}
.cnote{{margin:14px 0 0;padding:10px 14px;border-radius:12px;border:2px dashed var(--line);color:var(--ink2);font-size:17.5px}} .tried{{display:inline-flex;align-items:center;gap:10px;margin-top:14px;font-weight:700;cursor:pointer;user-select:none}} .tried input{{width:26px;height:26px;accent-color:var(--green)}}
details{{border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin-top:10px;background:var(--soft)}} summary{{font-weight:700;cursor:pointer}} details ul{{margin:8px 0 0;padding-left:20px;font-size:17px;line-height:1.5}}
.nohits{{display:none;color:var(--ink2);margin-top:30px}} .nohits.on{{display:block}}
.lightbox{{position:fixed;inset:0;background:rgba(0,0,0,.85);display:grid;place-items:center;z-index:50}} .lightbox[hidden]{{display:none}} .lightbox img{{max-width:96vw;max-height:92vh;border-radius:8px}} .lbclose{{position:absolute;top:14px;right:18px;font:28px var(--font);background:none;border:0;color:#fff;cursor:pointer}}
.toTop{{position:fixed;right:18px;bottom:18px;width:48px;height:48px;border-radius:50%;background:var(--card);border:1px solid var(--line);display:grid;place-items:center;color:var(--ink)}} .toTop svg{{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}}
</style></head><body><div class="wrap" id="top">
<header class="hero"><div class="brand"><span class="mk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-5L16 4l4 4L9 19zM14 6l4 4"/></svg></span>Redline · iPad edition</div>
<h1>What is new in the iPad edition</h1>
<p class="lede">Short clips and numbered steps for everything the iPad edition adds. For the basics — pen, shapes, clouds, measuring, text, stamps, tasks — the full <a href="{BASICS}">Redline Desk Training</a> still applies; the tools are the same.</p>
<div class="tools"><label class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="q" type="search" placeholder="Find: print, symbols, form, sign in…" aria-label="Search the guide"></label><div class="prog"><span class="bar"><i id="progBar"></i></span><span id="progTxt">0 of {ncards} tried</span></div></div></header>
<h2 class="pick">Tap a picture to jump to it</h2><nav class="pindex">{index}</nav>
<main>{secs}
<section class="sec c-slate" id="s-notes"><div class="sech"><span class="secbar"></span><h1 class="sect">Release notes</h1><p>Every build, newest first. The same list is under ⋯ More › What’s new in Redline.</p></div><article class="card c-slate" id="notes" data-keys="release notes changes versions builds"><header class="ch"><span class="bigic">{ic('new')}</span><h2>Changes by build</h2></header>{relhtml}</article></section>
</main><p class="nohits" id="nohits">Nothing matches. Try another word, or clear the search.</p></div>
<div class="lightbox" id="lb" hidden><button class="lbclose" id="lbClose" aria-label="Close">×</button><img id="lbImg" alt=""></div>
<a href="#top" class="toTop" aria-label="Back to the top"><svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg></a>
<script>(function () {{
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card[id]')), KEY = 'rdGuide86Tried', done = {{}};
  try {{ done = JSON.parse(localStorage.getItem(KEY) || '{{}}') || {{}}; }} catch (e) {{ done = {{}}; }}
  var boxes = document.querySelectorAll('[data-done]');
  function sync() {{ var n = 0; boxes.forEach(function (b) {{ b.checked = !!done[b.dataset.done]; if (b.checked) n++; }}); var pb = document.getElementById('progBar'), pt = document.getElementById('progTxt'); if (pb) pb.style.width = (100 * n / boxes.length) + '%'; if (pt) pt.textContent = n + ' of ' + boxes.length + ' tried'; }}
  boxes.forEach(function (b) {{ b.addEventListener('change', function () {{ done[b.dataset.done] = b.checked; try {{ localStorage.setItem(KEY, JSON.stringify(done)); }} catch (e) {{}} sync(); }}); }}); sync();
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function play(c, on) {{ var img = c.querySelector('img'); if (on) {{ if (!c.classList.contains('playing')) {{ img.src = c.dataset.gif; c.classList.add('playing'); }} }} else if (c.classList.contains('playing')) {{ img.src = c.dataset.gif.replace(/\\.gif$/, '.jpg'); c.classList.remove('playing'); }} }}
  var clips = document.querySelectorAll('.clip'); clips.forEach(function (c) {{ c.addEventListener('click', function () {{ if (c.classList.contains('playing')) openLb(c.dataset.gif); else play(c, true); }}); }});
  if ('IntersectionObserver' in window && !reduce) {{ var io = new IntersectionObserver(function (es) {{ es.forEach(function (e) {{ play(e.target, e.isIntersecting && e.intersectionRatio > 0.55); }}); }}, {{ threshold: [0, 0.55, 0.9] }}); clips.forEach(function (c) {{ io.observe(c); }}); }}
  var lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg');
  function openLb(src) {{ lbImg.src = src; lb.hidden = false; document.getElementById('lbClose').focus(); }} function closeLb() {{ lb.hidden = true; lbImg.removeAttribute('src'); }}
  document.getElementById('lbClose').addEventListener('click', closeLb); lb.addEventListener('click', function (e) {{ if (e.target === lb) closeLb(); }}); document.addEventListener('keydown', function (e) {{ if (e.key === 'Escape' && !lb.hidden) closeLb(); }});
  var says = document.querySelectorAll('.say'), synth = window.speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') says.forEach(function (b) {{ b.hidden = true; }});
  else says.forEach(function (b) {{ b.addEventListener('click', function () {{ var on = b.classList.contains('on'); try {{ synth.cancel(); }} catch (e) {{}} says.forEach(function (x) {{ x.classList.remove('on'); x.querySelector('span').textContent = 'Listen'; }}); if (on) return; var u = new SpeechSynthesisUtterance(b.dataset.say); u.rate = 0.9; u.onend = u.onerror = function () {{ b.classList.remove('on'); b.querySelector('span').textContent = 'Listen'; }}; b.classList.add('on'); b.querySelector('span').textContent = 'Stop'; try {{ synth.speak(u); }} catch (e) {{ b.classList.remove('on'); }} }}); }});
  var q = document.getElementById('q'), nohits = document.getElementById('nohits'), t; q.addEventListener('input', function () {{ clearTimeout(t); t = setTimeout(run, 120); }});
  function run() {{ var ws = q.value.toLowerCase().split(/\\s+/).filter(Boolean), shown = 0; cards.forEach(function (c) {{ var txt = (c.dataset.keys + ' ' + c.textContent).toLowerCase(), ok = ws.every(function (w) {{ return txt.indexOf(w) >= 0; }}); c.classList.toggle('hide', !ok); if (ok) shown++; var tile = document.querySelector('.ptile[href="#' + c.id + '"]'); if (tile) tile.classList.toggle('hide', !ok); }});
    document.querySelectorAll('.sec').forEach(function (s) {{ s.classList.toggle('hide', !s.querySelector('.card:not(.hide)')); }}); document.querySelectorAll('.pgrp').forEach(function (g) {{ g.classList.toggle('hide', !g.querySelector('.ptile:not(.hide)')); }}); nohits.classList.toggle('on', shown === 0); }}
  if (location.hash) {{ var el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(function () {{ el.scrollIntoView(); }}, 60); }}
}})();</script></body></html>'''
    (HERE / 'index.html').write_text(page, encoding='utf-8')
    print('guide built:', ncards, 'cards,', len(rel), 'release-note entries,', len(page), 'bytes')

if __name__ == '__main__': build()
