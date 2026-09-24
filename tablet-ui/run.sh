#!/usr/bin/env bash
# 로컬 테스트용 실행 스크립트.
# 1) 의존성 설치(최초 1회) 2) 프로덕션 빌드 3) 정적 서버 기동 4) 브라우저 자동 실행.
#
# 사용법:
#   ./run.sh            # 기본 포트 4173
#   PORT=8080 ./run.sh   # 포트 지정

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT="${PORT:-4173}"
URL="http://localhost:${PORT}/"

if [ ! -d node_modules ]; then
  echo "[run.sh] 의존성 설치 중..."
  npm install
fi

echo "[run.sh] 프로덕션 빌드 중..."
npm run build

echo "[run.sh] ${URL} 에서 서버를 시작합니다 (종료: Ctrl+C)"

open_browser() {
  # 서버가 뜰 때까지 잠깐 대기 후 OS별 기본 브라우저로 연다.
  sleep 1
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 &
  elif command -v open >/dev/null 2>&1; then
    open "$URL" >/dev/null 2>&1 &
  elif command -v start >/dev/null 2>&1; then
    start "$URL" >/dev/null 2>&1 &
  else
    echo "[run.sh] 브라우저를 자동으로 열 수 없습니다. 직접 접속하세요: ${URL}"
  fi
}

open_browser &

exec npx vite preview --host --port "$PORT"
