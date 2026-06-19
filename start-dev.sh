#!/usr/bin/env bash
# start-dev.sh — Inso Code Desktop Launcher
# Starts Next.js, waits for it to be ready, pre-warms routes, then launches Tauri.

set -e

NEXT_DIR="../alti.code.studio.frontend"
PORT=3005

# ── Kill any stale process on port ───────────────────────────────────────────
echo "🧹 [Inso Dev] Clearing port $PORT..."
lsof -ti :$PORT | xargs kill -9 2>/dev/null || true
sleep 1

# ── Start Next.js in background ───────────────────────────────────────────────
echo "🚀 [Inso Dev] Starting Next.js on port $PORT..."
cd "$NEXT_DIR"
npm run dev -- -p $PORT &
NEXT_PID=$!
cd - > /dev/null

# ── Wait until Next.js root responds 200 ─────────────────────────────────────
echo "⏳ [Inso Dev] Waiting for Next.js to be ready..."
MAX_WAIT=90
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 http://localhost:$PORT/ 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    echo "✅ [Inso Dev] Next.js root is ready"
    break
  fi
  sleep 1
  WAITED=$((WAITED + 1))
  echo "   ... still waiting ($WAITED/${MAX_WAIT}s, status=$STATUS)"
done

if [ $WAITED -ge $MAX_WAIT ]; then
  echo "❌ [Inso Dev] Next.js failed to start after ${MAX_WAIT}s"
  kill $NEXT_PID 2>/dev/null || true
  exit 1
fi

# ── Pre-warm /login — wait until it actually returns 200 ─────────────────────
echo "🔥 [Inso Dev] Pre-warming /login (waiting for 200)..."
MAX_WARM=60
WARMED=0
while [ $WARMED -lt $MAX_WARM ]; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:$PORT/login 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    echo "✅ [Inso Dev] /login compiled and ready"
    break
  fi
  sleep 1
  WARMED=$((WARMED + 1))
  echo "   ... /login not ready yet ($WARMED/${MAX_WARM}s, status=$STATUS)"
done

if [ $WARMED -ge $MAX_WARM ]; then
  echo "⚠️  [Inso Dev] /login warm-up timed out — launching anyway"
fi

# ── Pre-warm /new-chat — fire and forget (lower priority) ────────────────────
echo "🔥 [Inso Dev] Pre-warming /new-chat in background..."
curl -s --max-time 60 http://localhost:$PORT/new-chat > /dev/null &

# ── Launch Tauri ──────────────────────────────────────────────────────────────
echo "🖥️  [Inso Dev] Launching Tauri desktop app..."
npm run tauri dev

# ── Cleanup ───────────────────────────────────────────────────────────────────
kill $NEXT_PID 2>/dev/null || true
