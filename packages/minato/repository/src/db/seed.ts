import { db } from './client'

async function main() {
  void db
  console.log('No seed data for minato. Database is clean.')
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
