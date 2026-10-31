#!/bin/bash
# Lance tous les tests automatiques de Ticket SVP ! dans un vrai navigateur (Playwright + Chromium).
# Prérequis, une fois : npm install && npx playwright install chromium
# Usage : ./tests/run.sh            (tous les tests)
#         ./tests/run.sh cauchemar  (seulement les tests dont le nom contient « cauchemar »)
cd "$(dirname "$0")"
mkdir -p shots
python3 -m http.server 8765 --directory ../www > /dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER' EXIT
sleep 1
FAIL=0
for t in *${1:-}*.test.js; do
  OUT=$(timeout 420 node "$t" 2>&1)
  LAST=$(echo "$OUT" | grep -v '^\s*$' | tail -1)
  if echo "$OUT" | grep -qE "NO ERRORS|problems 0|problèmes 0"; then echo "OK      $t"; else echo "ÉCHEC   $t : $LAST"; FAIL=1; fi
done
exit $FAIL
