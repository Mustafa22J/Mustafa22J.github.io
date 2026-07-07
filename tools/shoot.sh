#!/usr/bin/env bash
# Headless-Chrome screenshot harness for the facility page.
# Usage: tools/shoot.sh <name> <url-query> [width] [height]
#   e.g. tools/shoot.sh osi-network "shot=osiNetwork" 1920 1080
# Captures into tools/../shots/<name>.png at the given size using installed Chrome
# with SwiftShader WebGL. No external dependency.
set -u
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
[ -x "$CHROME" ] || CHROME="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
NAME="${1:?name}"; QUERY="${2:-}"; W="${3:-1920}"; H="${4:-1080}"
# OUT_DIR overridable via env (e.g. OUT_DIR=docs/qa/final tools/shoot.sh ...); defaults to shots/
OUT_DIR="${OUT_DIR:-$(cd "$(dirname "$0")/.." && pwd)/shots}"
mkdir -p "$OUT_DIR"
# canonical entry point is the root index.html (page override via SHOOT_PAGE for legacy captures)
URL="http://localhost:8123/${SHOOT_PAGE:-index.html}"
[ -n "$QUERY" ] && URL="$URL?$QUERY"
"$CHROME" --headless=new --window-size="$W,$H" --hide-scrollbars \
  --enable-unsafe-swiftshader --force-device-scale-factor=1 \
  --virtual-time-budget=9000 --screenshot="$OUT_DIR/$NAME.png" "$URL" >/dev/null 2>&1
if [ -f "$OUT_DIR/$NAME.png" ]; then echo "OK  $NAME  ($W x $H)  $(wc -c < "$OUT_DIR/$NAME.png") bytes"; else echo "FAIL $NAME"; fi
