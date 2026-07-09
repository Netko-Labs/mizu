import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './src/db/drizzle',
  schema: '../domain/src/db/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  // Nagare shares one Postgres with minato but keeps its own migration
  // history — distinct journal table so the two drizzle projects never collide.
  migrations: {
    table: 'drizzle_nagare_migrations',
  },
})
