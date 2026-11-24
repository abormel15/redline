#!/bin/bash
# Deploy the iPad edition to GitHub Pages (repo abormel15/redline, branch main, served at https://abormel15.github.io/redline/).
#
#   deploy.sh "commit message"             main version only. stable/ is left byte-for-byte as it is in the repo.
#   PROMOTE=1 deploy.sh "commit message"   also replaces stable/ with /home/claude/rd-stable (run make_stable.py first).
#
# RULE: stable/ is the frozen copy shared with other people (https://abormel15.github.io/redline/stable/).
# It changes only when Alexander asks for a build to be promoted. An ordinary deploy that would change it is refused.
set -euo pipefail
MSG="${1:?commit message}"
R=/home/claude/redline; B=/home/claude/rd-build; OUT=/home/claude/rd; ST=/home/claude/rd-stable
[ -d "$OUT/.git" ] && { echo "REFUSED: $OUT has a .git inside"; exit 1; }
cd "$R"
git fetch -q --depth=1 origin main && git reset -q --hard origin/main
# wipe everything except the repository itself and the frozen copy
find . -mindepth 1 -maxdepth 1 ! -name .git ! -name stable -exec rm -rf {} +
(cd "$OUT" && tar cf - --exclude=./stable .) | tar xf -
if [ "${PROMOTE:-}" = 1 ]; then
  [ -f "$ST/STABLE.json" ] || { echo "REFUSED: no stable cut in $ST (run make_stable.py)"; exit 1; }
  rm -rf stable; mkdir stable; (cd "$ST" && tar cf - .) | tar xf - -C stable
fi
cp "$B/NOTES.md" BUILD-NOTES.md
mkdir -p build/guide build/audit
cp -r "$B/parts" build/
cp "$B"/{patches.py,build.py,make_stable.py,deploy.sh,theme.css,boot.js,sw.js,manifest.webmanifest,icon.svg,serial.txt,supabase.sql} build/
cp "$B/guide/build_guide.py" build/guide/
cp /home/claude/markup/rec.js build/
cp /home/claude/markup/{tw.js,aud_lib.js,aud1.js,aud2.js,aud3.js,aud4.js,tstable.js,t145.js} build/audit/
git add -A
if [ "${PROMOTE:-}" != 1 ] && ! git diff --cached --quiet -- stable; then
  echo "REFUSED: this deploy would change stable/. Nothing was pushed."; git reset -q --hard origin/main; exit 1
fi
git -c user.name="Alexander Bormel" -c user.email="abormel15@users.noreply.github.com" commit -q -m "$MSG

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01NfzR3pRyvu7YmR4MLjyWJS"
git -c push.negotiate=true push -q origin main
echo "pushed $(git rev-parse --short HEAD); main sw $(grep -o "VERSION = '[^']*'" sw.js); stable: $(cat stable/STABLE.json 2>/dev/null | tr -d '\n' | cut -c1-90)"
