import pool from '../config/database.js'
import bcrypt from 'bcrypt'

async function seed(): Promise<void> {
  try {
    console.log('🌱 Seeding database...')

    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 10)

    await pool.query(
      `
      INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (username) DO NOTHING
    `,
      ['admin', 'admin@billing.com', adminPassword, 'Admin', 'User', 'admin', true]
    )

    console.log('✅ Default admin user created (username: admin, password: admin123)')
    console.log('✅ Database seeding completed')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seed()

