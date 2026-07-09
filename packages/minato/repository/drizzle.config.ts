import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './src/db/drizzle',
  schema: '../domain/src/db/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  // Minato shares one Postgres with nagare but keeps its own migration
  // history — distinct journal table so the two drizzle projects never collide.
  migrations: {
    table: 'drizzle_minato_migrations',
  },
})
