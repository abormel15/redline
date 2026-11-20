#!/usr/bin/env python3
"""Cut the frozen copy ("stable") from the build in /home/claude/rd.
   The stable copy is the same app with three differences:
     1. window.__rdNoAccount86 = true  -> no sign-in anywhere; everything stays on the device (parts/app84.js reads the switch)
     2. its own offline-cache names (rds-shell-*, rds-runtime), so the main version's service worker never clears them
        and a visit to one never serves the other's files
     3. the label says "shared copy", and the guide leaves out the account card
   It is written to /home/claude/rd-stable and goes to the repo's stable/ folder ONLY through deploy.sh PROMOTE=1.
   An ordinary deploy never touches stable/ (deploy.sh checks that, and refuses to push if it changed)."""
import shutil, pathlib, re, hashlib, json, datetime
SRC = pathlib.Path('/home/claude/rd'); OUT = pathlib.Path('/home/claude/rd-stable')
if OUT.exists(): shutil.rmtree(OUT)
shutil.copytree(SRC, OUT, ignore=shutil.ignore_patterns('.git', 'stable'))
p = OUT / 'index.html'; s = p.read_text()
a = '<script>window.RD_STANDALONE = true;</script>\n'
assert s.count(a) == 1; s = s.replace(a, a + '<script>window.__rdNoAccount86 = true;</script>\n')
m = re.search(r"const BUILD = '(86\.\d+) · ([^']*?) · iPad edition';", s); assert m, 'label'
ver, date = m.group(1), m.group(2)
s = s.replace(m.group(0), f"const BUILD = '{ver} · {date} · shared copy';")
p.write_text(s)
# guide: no account card, no "in your account"
g = OUT / 'guide' / 'index.html'; t = g.read_text()
t2, n = re.subn(r'<article class="card c-slate" id="account".*?</article>', '', t, count=1, flags=re.S); assert n == 1, 'guide account card'
k = 'your documents on the device and in your account'; assert t2.count(k) >= 1; t2 = t2.replace(k, 'your documents kept on this device')
g.write_text(t2)
# service worker: separate cache names, version from the content
sw = (pathlib.Path(__file__).parent / 'sw.js').read_text()
assert sw.count("'rd-shell-'") == 2 and sw.count("'rd-runtime'") == 1
sw = sw.replace("'rd-shell-'", "'rds-shell-'").replace("'rd-runtime'", "'rds-runtime'")
h = hashlib.sha256(); h.update(s.encode()); h.update(t2.encode())
for f in sorted((OUT / 'lib').rglob('*')):
    if f.is_file(): h.update(f.read_bytes())
v = 's' + h.hexdigest()[:9]
(OUT / 'sw.js').write_text(sw.replace('__VERSION__', v))
(OUT / 'STABLE.json').write_text(json.dumps({'build': ver, 'cut': datetime.date.today().isoformat(), 'sw': v, 'note': 'Frozen copy. Changes only when a build is promoted on purpose (build/deploy.sh PROMOTE=1).'}, indent=1) + '\n')
print('stable cut from', ver, 'sw', v, '->', OUT)
