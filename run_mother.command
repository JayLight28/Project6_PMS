#!/bin/zsh

# ======================================================
# MOTHER HQ MULTI-WINDOW LAUNCHER (macOS)
# ======================================================

# 스크립트 위치 파악
# 스크립트 파일이 위치한 실제 경로로 이동
cd "$(dirname "$0")"
DIR="$(pwd)"

echo "🚀 [SYSTEM] Launching Mother HQ (Single-Window Mode)..."

# 디버그 및 환경 변수 설정
export DEBUG="express:*,better-sqlite3:*"
export NODE_ENV="development"

# 1. 프론트엔드 서버 실행 (백그라운드)
echo "📡 [FRONTEND] Starting Vite in background..."
cd "$DIR/mother"
npm run dev -- --debug &
FRONTEND_PID=$!

# 2. 백엔드 서버 실행 (포그라운드 + 실시간 반영)
echo "💻 [BACKEND] Starting API Server (Live Watch Mode)..."
echo "------------------------------------------------------"
node --watch server.js

# 터미널 종료 시 프론트엔드 프로세스도 함께 종료
trap "kill $FRONTEND_PID" EXIT
