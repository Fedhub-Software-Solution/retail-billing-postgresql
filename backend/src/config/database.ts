import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// Cloud SQL connection configuration
// When --add-cloudsql-instances is used in Cloud Run, the Unix socket is mounted at:
// /cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
// We detect Cloud SQL by checking for CLOUD_SQL_CONNECTION_NAME or DB_SOCKET_PATH
const cloudSqlConnectionName = process.env.CLOUD_SQL_CONNECTION_NAME
const isCloudSQL = !!process.env.DB_SOCKET_PATH || !!cloudSqlConnectionName

const poolConfig: pg.PoolConfig = {
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased to 10 seconds for Cloud SQL Proxy
}

if (isCloudSQL) {
  // Cloud SQL connection using Unix socket (recommended for Cloud Run)
  if (process.env.DB_SOCKET_PATH) {
    poolConfig.host = process.env.DB_SOCKET_PATH
  } else if (cloudSqlConnectionName) {
    // Use connection name format: /cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
    poolConfig.host = `/cloudsql/${cloudSqlConnectionName}`
  }
  poolConfig.port = parseInt(process.env.DB_PORT || '5432')
  poolConfig.database = process.env.DB_NAME || 'retail_billing'
  poolConfig.user = process.env.DB_USER || 'postgres'
  poolConfig.password = process.env.DB_PASSWORD || ''
  
  // Debug logging (password length only, not the actual password)
  const passwordLength = poolConfig.password ? poolConfig.password.length : 0
  console.log(`☁️  Cloud SQL mode: host=${poolConfig.host}, db=${poolConfig.database}, user=${poolConfig.user}, passwordLength=${passwordLength}`)
} else {
  // Standard TCP connection (for local development)
  poolConfig.host = process.env.DB_HOST || 'localhost'
  poolConfig.port = parseInt(process.env.DB_PORT || '5432')
  poolConfig.database = process.env.DB_NAME || 'retail_billing_db'
  poolConfig.user = process.env.DB_USER || 'postgres'
  poolConfig.password = process.env.DB_PASSWORD || 'password'
  
  console.log(`💻 Local mode: host=${poolConfig.host}, db=${poolConfig.database}`)
}

const pool = new Pool(poolConfig)

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database')
})

pool.on('error', (err: Error) => {
  console.error('❌ Unexpected error on idle client', err)
  process.exit(-1)
})

export default pool

