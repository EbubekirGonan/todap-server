#!/bin/bash
# TODAP dev — PostgreSQL + Express (geliştirme modu, file watching)
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PG_BIN="/usr/lib/postgresql/16/bin"
PGDATA="$PROJECT_DIR/.pgdata"
PGPORT=55432

# ── PostgreSQL Başlat ────────────────────────────────────
echo "🐘 PostgreSQL başlatılıyor..."
if ! "$PG_BIN/pg_isready" -h localhost -p $PGPORT &>/dev/null; then
  "$PG_BIN/pg_ctl" -D "$PGDATA" -o "-p $PGPORT -k $PGDATA" -l "$PGDATA/postgres.log" start
  sleep 1
  "$PG_BIN/pg_isready" -h localhost -p $PGPORT >/dev/null && echo "✓ PostgreSQL çalışıyor" || (echo "✗ PostgreSQL başlatılamadı"; exit 1)
else
  echo "✓ PostgreSQL zaten çalışıyor"
fi

# ── Express Dev (watch modu) ────────────────────────────
echo "🔄 Dev modu başlatılıyor (file watching etkin)..."
cd "$PROJECT_DIR"
npm run dev:watch
