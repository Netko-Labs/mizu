#!/bin/bash
# ✧･ﾟ: *✧･ﾟ:* MIZU DEV BOX SETUP *:･ﾟ✧*:･ﾟ✧
#
# Provisions an Apple Silicon Mac as a mizu dev box using Apple's native
# `container` runtime (github.com/apple/container) — no Docker Desktop needed.
#
#   curl/scp this repo onto the box, then:   ./scripts/setup-devbox.sh
#   or clone-mode from a bare machine:       MIZU_REPO_URL=<git-url> ./setup-devbox.sh
#
# What it does (idempotent, safe to re-run):
#   1. Preflight: Apple Silicon, macOS >= 15 (26+ recommended), Xcode CLT
#   2. Installs bun (official installer) if missing
#   3. Installs Apple `container` (signed pkg from GitHub releases) if missing
#   4. Starts the container system + the shared Postgres (port 19432)
#   5. bun install, generates .env files with fresh secrets, runs DB migrations
#

set -euo pipefail

CONTAINER_VERSION="${CONTAINER_VERSION:-1.1.0}"
REPO_DIR_DEFAULT="$HOME/Developer/mizu"
DB_PORT="${MINATO_DB_PORT:-19432}"

log() { printf '\033[1;36m[mizu-setup]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[mizu-setup]\033[0m %s\n' "$*" >&2; exit 1; }

# ── 1. Preflight ─────────────────────────────────────────────────────────────

[ "$(uname -m)" = "arm64" ] || fail "Apple Silicon required (found $(uname -m))"

macos_major="$(sw_vers -productVersion | cut -d. -f1)"
[ "$macos_major" -ge 15 ] || fail "macOS 15+ required (found $(sw_vers -productVersion))"
if [ "$macos_major" -lt 26 ]; then
  log "⚠ macOS $macos_major detected — Apple container networking is limited before macOS 26"
fi

xcode-select -p >/dev/null 2>&1 || fail "Xcode Command Line Tools missing — run: xcode-select --install"

# ── 2. bun ───────────────────────────────────────────────────────────────────

export BUN_INSTALL="$HOME/.bun"
# /usr/local/bin: where the Apple container pkg installs (missing from
# non-interactive ssh PATHs)
export PATH="$BUN_INSTALL/bin:/usr/local/bin:$PATH"

if ! command -v bun >/dev/null 2>&1; then
  log "Installing bun..."
  curl -fsSL https://bun.sh/install | bash
else
  log "bun $(bun --version) already installed"
fi

# ── 3. Apple container runtime ───────────────────────────────────────────────

if ! command -v container >/dev/null 2>&1; then
  log "Installing Apple container ${CONTAINER_VERSION} (needs sudo)..."
  pkg="/tmp/container-${CONTAINER_VERSION}.pkg"
  curl -fL4 --retry 5 --retry-delay 2 --retry-all-errors -o "$pkg" \
    "https://github.com/apple/container/releases/download/${CONTAINER_VERSION}/container-${CONTAINER_VERSION}-installer-signed.pkg"
  sudo installer -pkg "$pkg" -target /
  rm -f "$pkg"
else
  log "Apple container already installed ($(container --version 2>/dev/null | head -1))"
fi

log "Starting container system..."
container system start

# ── 4. Repo ──────────────────────────────────────────────────────────────────

script_dir="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$script_dir/../package.json" ] && grep -q '"name": "mizu"' "$script_dir/../package.json"; then
  repo_dir="$(cd "$script_dir/.." && pwd)"
  log "Using existing checkout at $repo_dir"
else
  repo_dir="${MIZU_REPO_DIR:-$REPO_DIR_DEFAULT}"
  if [ ! -d "$repo_dir/.git" ]; then
    [ -n "${MIZU_REPO_URL:-}" ] || fail "Not inside the repo and MIZU_REPO_URL is unset"
    log "Cloning $MIZU_REPO_URL → $repo_dir"
    mkdir -p "$(dirname "$repo_dir")"
    git clone "$MIZU_REPO_URL" "$repo_dir"
  fi
fi
cd "$repo_dir"

log "Installing workspace dependencies..."
# Optional native deps can fail to build on some CLT setups; bun drops them
# but exits 1. Everything else installs fine.
if ! bun install; then
  log "⚠ bun install reported a failure — retrying and tolerating optional native deps"
  bun install || log "⚠ continuing; an optional native package (e.g. cpu-features) was skipped"
fi

# ── 5. Env files ─────────────────────────────────────────────────────────────

ensure_env() {
  local app="$1"
  local env_file="apps/$app/.env"
  if [ -f "$env_file" ]; then
    log "apps/$app/.env already exists — leaving it alone"
    return
  fi
  cp "apps/$app/sample.env" "$env_file"
  local secret
  secret="$(openssl rand -hex 32)"
  # Replace placeholder secrets with real ones
  sed -i '' "s|^AUTH_SECRET=.*|AUTH_SECRET=$secret|" "$env_file" 2>/dev/null || true
  local enc_key
  enc_key="$(openssl rand -hex 32)"
  sed -i '' "s|^ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$enc_key|" "$env_file" 2>/dev/null || true
  log "Created apps/$app/.env with fresh secrets"
}

ensure_env minato
ensure_env nagare

# ── 6. Shared Postgres via the repo CLI (Apple runtime autodetected) ─────────

log "Starting the shared Postgres..."
bun run repo infra:up --app minato

log "Waiting for Postgres to accept connections..."
for i in $(seq 1 60); do
  if container exec mizu-db-minato pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  [ "$i" = 60 ] && fail "Postgres did not become ready"
  sleep 1
done

# ── 7. Migrations ────────────────────────────────────────────────────────────

log "Running database migrations..."
bun run repo db:migrate --app minato
bun run repo db:migrate --app nagare

# ── Done ─────────────────────────────────────────────────────────────────────

cat <<EOF

$(printf '\033[1;32m')✅ mizu dev box ready!$(printf '\033[0m')

  Start the apps:
    cd $repo_dir
    bun run repo serve --app nagare    # daemon    → http://localhost:3001
    bun run repo serve --app minato    # web + auth → http://localhost:3000

  From another machine, tunnel the ports:
    ssh -L 3000:localhost:3000 -L 3001:localhost:3001 $(whoami)@$(hostname -s).local

  Postgres:  localhost:$DB_PORT (postgres/postgres, db: mizu)
  Data:      named container volume 'mizu-postgres-data'

  Deploys, ingress (caddy on :80), and log streaming all run natively on
  Apple containers — no Docker anywhere.
EOF
