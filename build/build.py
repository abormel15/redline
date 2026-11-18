#!/usr/bin/env python3
"""Build the iPad (home-screen) edition of Redline Desk from the published V85 page.
   Source of truth for app logic: src85/index.html (byte-for-byte what the Claude artifact serves).
   This script only: rewrites the document head (PWA tags), switches on the existing STANDALONE edition,
   relabels the build, appends the theme stylesheet and a small PWA bootstrap. No app code is edited."""
import subprocess, sys, re, shutil, pathlib, hashlib, sys, datetime
SRC = pathlib.Path('/home/claude/src85'); OUT = pathlib.Path('/home/claude/rd'); HERE = pathlib.Path(__file__).parent
SERIAL = HERE.joinpath('serial.txt'); n = int(SERIAL.read_text() or '0') + 1 if SERIAL.exists() else 1; SERIAL.write_text(str(n))
LABEL = sys.argv[1] if len(sys.argv) > 1 else f'86.{n} · {datetime.date.today().strftime("%b %d %Y").replace(" 0", " ")} · iPad edition'
html = SRC.joinpath('index.html').read_text()

# 1. the artifact skeleton head -> a real head with PWA tags (keep the same reset rules)
m = re.match(r'<!doctype html><html><head>(.*?)</head><body>\n', html, re.S)
assert m, 'unexpected skeleton'
skel = m.group(1)
reset = re.search(r'<style>(.*?)</style>', skel, re.S).group(1)
body = html[m.end():]
assert body.startswith('<title>Redline Desk</title>\n'), body[:60]
body = body[len('<title>Redline Desk</title>\n'):]
head = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<title>Redline Desk</title>
<meta name="application-name" content="Redline Desk">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Redline">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#F9F9FB">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1C1C1E">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<style>{reset}</style>
</head>
<body>
'''

# 2. switch on the standalone edition before the app script runs
needle = '<script src="lib/pdf.min.js"></script>'
assert body.count(needle) == 1
body = body.replace(needle, '<script>window.RD_STANDALONE = true;</script>\n' + needle)

# 3. build label shown in Settings
old = "const BUILD = '85 · Oct 22 2026';"
assert body.count(old) == 1, 'BUILD label moved'
body = body.replace(old, f"const BUILD = '{LABEL}';")

# 3a. new feature parts for this edition (same scope as the V85 parts, right before the wiring)
anchor = '\n/* ---------- wiring ---------- */\nfunction nameDialog()'
assert body.count(anchor) == 1, 'wiring anchor'
# number order, not text order: app100 comes after app99, so a later part always wraps the earlier ones
partNames = sorted((p.name for p in (HERE / 'parts').glob('app*.js')), key=lambda n: int(''.join(c for c in n if c.isdigit()) or 0))
parts = ''.join('\n' + (HERE / 'parts' / f).read_text() for f in partNames)
body = body.replace(anchor, '\n' + parts + anchor)
print('parts:', partNames)

# 3b. documented code patches (see patches.py)
import importlib.util
spec = importlib.util.spec_from_file_location('patches', HERE / 'patches.py'); mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
for name, o, n, why in mod.PATCHES:
    assert body.count(o) == 1, f'patch anchor not unique/found: {name} ({body.count(o)})'
    body = body.replace(o, n)
    print('patched:', name)

# 3c. SYNC86: on the iPad edition the account is the user's own Supabase project, not Claude's storage; every user-facing
#     "Claude account" becomes "Redline account" (the code paths are the same V85 account layer, see parts/app84.js)
RENAMES = [('your Claude account', 'your Redline account'), ('my Claude account', 'my Redline account'), ('the Claude account', 'the Redline account'), ('Claude account', 'Redline account')]
for a, b in RENAMES:
    k = body.count(a); body = body.replace(a, b); print(f'renamed {k:3d}× {a!r} -> {b!r}')
assert 'Claude account' not in body

# 4. theme + PWA bootstrap at the very end of the body (after every static style, so it wins ties)
theme = HERE.joinpath('theme.css').read_text()
boot = HERE.joinpath('boot.js').read_text()
tail = f'<style id="rdTheme">\n{theme}</style>\n<script>\n{boot}</script>\n</body></html>'
assert body.endswith('</body></html>')
body = body[:-len('</body></html>')] + tail
out = head + body

OUT.mkdir(exist_ok=True)
OUT.joinpath('index.html').write_text(out)
# libraries, unchanged
if OUT.joinpath('lib').exists(): shutil.rmtree(OUT / 'lib')
shutil.copytree(SRC / 'lib', OUT / 'lib')
shutil.copy(HERE / 'manifest.webmanifest', OUT / 'manifest.webmanifest')
# the companion guide (guide/index.html is generated from guide/build_guide.py, release notes from parts/app92.js)
subprocess.run([sys.executable, str(HERE / 'guide' / 'build_guide.py')], check=True)
if OUT.joinpath('guide').exists(): shutil.rmtree(OUT / 'guide')
shutil.copytree(HERE / 'guide', OUT / 'guide', ignore=shutil.ignore_patterns('build_guide.py', '__pycache__'))
# service worker, versioned by the content it caches
h = hashlib.sha256(); h.update(out.encode()); h.update(theme.encode())
for f in sorted((OUT / 'lib').rglob('*')):
    if f.is_file(): h.update(f.read_bytes())
ver = h.hexdigest()[:10]
OUT.joinpath('sw.js').write_text(HERE.joinpath('sw.js').read_text().replace('__VERSION__', ver))
print('built', OUT, 'version', ver, 'label', LABEL, 'bytes', len(out))
