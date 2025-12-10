import pool from '../config/database.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read SQL migration file
const migrationSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')

async function migrate(): Promise<void> {
  try {
    console.log('🔄 Running database migrations...')

    // Execute migration
    await pool.query(migrationSQL)

    console.log('✅ Database migrations completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrate()

