// Script to grant database permissions to app_user
// Run this after starting Cloud SQL Proxy on port 5433
// Usage: node grant-permissions.js

import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5433,
  database: 'retail_billing',
  user: 'postgres',
  password: 'RetailBilling2024!',
});

const grantPermissionsSQL = `
  GRANT USAGE ON SCHEMA public TO app_user;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO app_user;
`;

async function grantPermissions() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected! Granting permissions to app_user...');
    
    await client.query(grantPermissionsSQL);
    
    console.log('✅ Permissions granted successfully!');
    console.log('app_user now has full access to all tables, sequences, and functions.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

grantPermissions();

