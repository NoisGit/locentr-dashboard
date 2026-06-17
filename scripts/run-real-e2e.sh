#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="${LOCENTR_API_DIR:-/Users/nois/Documents/Portafolio/SaaS/locentr-api}"
API_HOST="${LOCENTR_REAL_E2E_API_HOST:-127.0.0.1}"
API_PORT="${LOCENTR_REAL_E2E_API_PORT:-8000}"
FRONT_URL="http://127.0.0.1:4173"
API_URL="http://${API_HOST}:${API_PORT}"
DEMO_PASSWORD="${LOCENTR_REAL_E2E_PASSWORD:-LocentrDemo2026!}"
export LOCENTR_REAL_E2E_PASSWORD="${DEMO_PASSWORD}"

load_backend_env_value() {
  local key="$1"
  local line=""
  local value=""

  if [[ ! -f "${API_DIR}/.env" || -n "${!key-}" ]]; then
    return
  fi

  line="$(grep -E "^${key}=" "${API_DIR}/.env" | tail -n 1 || true)"
  if [[ -z "${line}" ]]; then
    return
  fi

  value="${line#*=}"
  value="${value%$'\r'}"
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"
  export "${key}=${value}"
}

for key in \
  DATABASE_URL \
  POSTGRES_USER \
  POSTGRES_PASSWORD \
  POSTGRES_DB \
  POSTGRES_PORT \
  SECRET_KEY \
  LOCENTR_DEMO_EMAIL \
  LOCENTR_DEMO_USERNAME \
  LOCENTR_DEMO_FULL_NAME; do
  load_backend_env_value "${key}"
done

export ENV=dev
export DEBUG=false
export POSTGRES_USER="${POSTGRES_USER:-locentr_admin}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-locentr_local_password}"
export POSTGRES_DB="${POSTGRES_DB:-locentr_db}"
export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
export DATABASE_URL="${DATABASE_URL:-postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:${POSTGRES_PORT}/${POSTGRES_DB}}"
export SECRET_KEY="${SECRET_KEY:-locentr-real-e2e-secret-key-32-bytes}"
export FRONT_URL_BASE="${FRONT_URL}"
export BACKEND_CORS_ORIGINS="${FRONT_URL},http://127.0.0.1:5173,http://localhost:5173"
export EMAIL_DELIVERY_MODE=log
export PRIVATE_STORAGE_ROOT="${API_DIR}/private_storage"
export LOCENTR_DEMO_EMAIL="${LOCENTR_DEMO_EMAIL:-admin@nois.dev}"
export LOCENTR_DEMO_USERNAME="${LOCENTR_DEMO_USERNAME:-locentr-admin}"
export LOCENTR_DEMO_FULL_NAME="${LOCENTR_DEMO_FULL_NAME:-Boris Alvial}"
export LOCENTR_DEMO_CREDENTIAL_HASH="$("${API_DIR}/.venv/bin/python" - <<'PY'
from argon2 import PasswordHasher
import os
print(PasswordHasher().hash(os.environ["LOCENTR_REAL_E2E_PASSWORD"]))
PY
)"

cd "${API_DIR}"
if [[ "${LOCENTR_REAL_E2E_RESET_DB:-1}" == "1" ]]; then
  docker compose down --volumes --remove-orphans >/dev/null 2>&1 || true
fi
docker compose up -d locentr-db

db_ready=false
for _ in {1..30}; do
  if docker compose exec -T locentr-db pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null 2>&1; then
    db_ready=true
    break
  fi
  sleep 1
done

if [[ "${db_ready}" != "true" ]]; then
  echo "PostgreSQL did not become ready for real E2E." >&2
  exit 1
fi

"${API_DIR}/.venv/bin/alembic" upgrade head
"${API_DIR}/.venv/bin/python" scripts/seed_demo.py

"${API_DIR}/.venv/bin/python" - <<'PY'
import asyncio
import os
from sqlmodel import select
from src.database import async_session, engine
from src.models import User

async def main():
    async with async_session() as session:
        result = await session.execute(
            select(User).where(
                User.email.in_([
                    os.environ["LOCENTR_DEMO_EMAIL"],
                    "camila.rojas@cocha.com",
                ])
            )
        )
        for user in result.scalars().all():
            user.password_hash = os.environ["LOCENTR_DEMO_CREDENTIAL_HASH"]
            session.add(user)
        await session.commit()
    await engine.dispose()

asyncio.run(main())
PY

"${API_DIR}/.venv/bin/uvicorn" src.main:app --host "${API_HOST}" --port "${API_PORT}" &
API_PID=$!
trap 'kill "${API_PID}" >/dev/null 2>&1 || true' EXIT

for _ in {1..60}; do
  if curl -fsS "${API_URL}/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

cd "${ROOT_DIR}"
REAL_E2E=1 \
LOCENTR_REAL_E2E_EMAIL="camila.rojas@cocha.com" \
LOCENTR_REAL_E2E_PASSWORD="${DEMO_PASSWORD}" \
VITE_API_BASE_URL="${API_URL}" \
npx playwright test tests/e2e/real.spec.ts --project=chromium
