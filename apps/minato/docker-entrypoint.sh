#!/bin/bash
set -e

echo "🌊 Starting Mizu..."

# Wait for database to be ready
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Waiting for database..."

  # Extract host and port from DATABASE_URL
  # postgresql://user:pass@host:port/db
  DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:]+):.*/\1/')
  DB_PORT=$(echo $DATABASE_URL | sed -E 's/.*:([0-9]+)\/.*/\1/')

  # Wait for database with timeout
  TIMEOUT=60
  COUNTER=0
  until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
    COUNTER=$((COUNTER + 1))
    if [ $COUNTER -gt $TIMEOUT ]; then
      echo "❌ Database connection timeout after ${TIMEOUT}s"
      exit 1
    fi
    echo "⏳ Waiting for database at $DB_HOST:$DB_PORT... ($COUNTER/$TIMEOUT)"
    sleep 1
  done

  echo "✅ Database is ready!"

  # Run migrations if MIGRATE_ON_START is set
  if [ "$MIGRATE_ON_START" = "true" ]; then
    echo "🔄 Running database migrations..."
    bun drizzle-kit migrate
    echo "✅ Migrations complete!"
  fi
fi

echo "🚀 Starting server..."
exec "$@"
