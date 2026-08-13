#!/usr/bin/env bash
# start-dev.sh — Inso Code Desktop Launcher
# Starts Backend, Next.js, waits for them to be ready, pre-warms routes, then launches Tauri.

set -e

export PATH="$HOME/.cargo/bin:$PATH"

NEXT_DIR="../Inso.Code.Frontend"
BACKEND_DIR="../Inso.Code.Backend"
PORT=3055
BACKEND_PORT=5001

# ── Kill any stale process on ports ───────────────────────────────────────────
echo "🧹 [Inso Dev] Clearing ports $PORT, 5001 (Chat), 5002 (Code), 5003 (Create), 5004 (Cowork)..."
lsof -ti :$PORT | xargs kill -9 2>/dev/null || true
lsof -ti :5001 | xargs kill -9 2>/dev/null || true
lsof -ti :5002 | xargs kill -9 2>/dev/null || true
lsof -ti :5003 | xargs kill -9 2>/dev/null || true
lsof -ti :5004 | xargs kill -9 2>/dev/null || true
sleep 1

# ── Build Universal Agent Docker Image (If Docker is installed) ───────────────
echo "🐳 [Inso Dev] Building Universal Agent Docker Image..."
if command -v docker &> /dev/null; then
  cd "$BACKEND_DIR/docker/agent"
  docker build -t inso-agent-runner:latest . || echo "⚠️  Failed to build docker image. Make sure Docker Desktop is running."
  cd - > /dev/null
else
  echo "⚠️  Docker is not installed. Skipping Universal Agent build."
fi

# ── Start 4 Isolated Mode Backends in background ─────────────────────────────
echo "🚀 [Inso Dev] Starting 4 Isolated Mode Backends (Chat:5001, Code:5002, Create:5003, Cowork:5004)..."
cd "$BACKEND_DIR"
MODE_DOMAIN=Chat PORT=5001 npm start &
BACKEND_CHAT_PID=$!

MODE_DOMAIN=Code PORT=5002 npm start &
BACKEND_CODE_PID=$!

MODE_DOMAIN=Create PORT=5003 npm start &
BACKEND_CREATE_PID=$!

MODE_DOMAIN=Cowork PORT=5004 npm start &
BACKEND_COWORK_PID=$!
cd - > /dev/null

# ── Wait until Chat Backend responds 200 ─────────────────────────────────────
echo "⏳ [Inso Dev] Waiting for Chat Backend (port 5001) to be ready..."
MAX_WAIT_BACKEND=5
WAITED_BACKEND=0
while [ $WAITED_BACKEND -lt $MAX_WAIT_BACKEND ]; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 http://localhost:5001/healthz 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ] || [ "$STATUS" = "503" ]; then
    echo "✅ [Inso Dev] Mode Backends ready (status: $STATUS)"
    break
  fi
  sleep 1
  WAITED_BACKEND=$((WAITED_BACKEND + 1))
  echo "   ... still waiting ($WAITED_BACKEND/${MAX_WAIT_BACKEND}s, status=$STATUS)"
done

if [ $WAITED_BACKEND -ge $MAX_WAIT_BACKEND ]; then
  echo "❌ [Inso Dev] Chat Backend failed to start after ${MAX_WAIT_BACKEND}s. Continuing startup..."
fi

# ── Start Next.js in background ───────────────────────────────────────────────
echo "🚀 [Inso Dev] Starting Next.js on port $PORT..."
cd "$NEXT_DIR"
NEXT_PUBLIC_API_URL="http://localhost:5001/api/v1" NEXTAUTH_URL="http://127.0.0.1:$PORT" npx next dev -H 127.0.0.1 -p $PORT &
NEXT_PID=$!
cd - > /dev/null

# ── Wait until Next.js root responds ──────────────────────────────────────────
echo "⏳ [Inso Dev] Waiting for Next.js to be ready..."
MAX_WAIT=90
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  if nc -z 127.0.0.1 $PORT 2>/dev/null; then
    echo "✅ [Inso Dev] Next.js server is ready on port $PORT"
    break
  fi
  sleep 1
  WAITED=$((WAITED + 1))
  echo "   ... still waiting ($WAITED/${MAX_WAIT}s)"
done

if [ $WAITED -ge $MAX_WAIT ]; then
  echo "❌ [Inso Dev] Next.js failed to start after ${MAX_WAIT}s"
  kill $NEXT_PID 2>/dev/null || true
  kill $BACKEND_CHAT_PID $BACKEND_CODE_PID $BACKEND_CREATE_PID $BACKEND_COWORK_PID 2>/dev/null || true
  exit 1
fi

# ── Pre-warm Next.js routes ───────────────────────────────────────────────────
echo "🔥 [Inso Dev] Pre-warming Next.js /code, /chat, /create, /cowork routes..."
curl -s -L --max-time 60 http://127.0.0.1:$PORT/code > /dev/null || true
curl -s -L --max-time 60 http://127.0.0.1:$PORT/chat > /dev/null || true
curl -s -L --max-time 60 http://127.0.0.1:$PORT/create > /dev/null || true
curl -s -L --max-time 60 http://127.0.0.1:$PORT/cowork > /dev/null || true
echo "✅ [Inso Dev] All 4 routes pre-warmed"

trap "kill $NEXT_PID $BACKEND_CHAT_PID $BACKEND_CODE_PID $BACKEND_CREATE_PID $BACKEND_COWORK_PID 2>/dev/null || true" EXIT INT TERM

# ── Launch Tauri ──────────────────────────────────────────────────────────────
echo "🖥️  [Inso Dev] Launching Tauri desktop app..."
npm run tauri dev

