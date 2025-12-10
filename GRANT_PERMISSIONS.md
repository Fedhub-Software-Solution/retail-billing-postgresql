# Grant Database Permissions to app_user

The `app_user` needs permissions to access all tables in the database. Follow these steps:

## Option 1: Using Node.js Script (Easiest - Recommended)

1. **Start Cloud SQL Proxy** in a separate terminal (PowerShell or Command Prompt):
   
   **PowerShell:**
   ```powershell
   cloud-sql-proxy.x64.exe retail-billing-system-fedhub:asia-south1:retail-billing-db --port=5433
   ```
   
   **Command Prompt:**
   ```cmd
   cloud-sql-proxy.x64.exe retail-billing-system-fedhub:asia-south1:retail-billing-db --port=5433
   ```

2. **In a new terminal, run the Node.js script**:
   
   **PowerShell:**
   ```powershell
   cd backend
   node grant-permissions.js
   ```
   
   **Command Prompt:**
   ```cmd
   cd backend
   node grant-permissions.js
   ```

## Option 2: Using psql (if you have PostgreSQL client installed)

1. **Start Cloud SQL Proxy** in a separate terminal:
   
   **PowerShell:**
   ```powershell
   cloud-sql-proxy.x64.exe retail-billing-system-fedhub:asia-south1:retail-billing-db --port=5433
   ```
   
   **Command Prompt:**
   ```cmd
   cloud-sql-proxy.x64.exe retail-billing-system-fedhub:asia-south1:retail-billing-db --port=5433
   ```

2. **In a new terminal, connect and run the SQL**:
   
   **PowerShell:**
   ```powershell
   # Set password environment variable
   $env:PGPASSWORD="RetailBilling2024!"
   
   # Run the grant permissions SQL
   psql -h localhost -p 5433 -U postgres -d retail_billing -f grant_permissions.sql
   ```
   
   **Command Prompt:**
   ```cmd
   REM Set password environment variable
   set PGPASSWORD=RetailBilling2024!
   
   REM Run the grant permissions SQL
   psql -h localhost -p 5433 -U postgres -d retail_billing -f grant_permissions.sql
   ```

   Or if you don't have `psql` installed, you can use any PostgreSQL client (like pgAdmin, DBeaver, etc.) to connect to `localhost:5433` and run the contents of `grant_permissions.sql`.

## Option 3: Quick One-Liner (if you have psql)

**PowerShell:**
```powershell
$env:PGPASSWORD="RetailBilling2024!"; psql -h localhost -p 5433 -U postgres -d retail_billing -c "GRANT USAGE ON SCHEMA public TO app_user; GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user; GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user; GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO app_user;"
```

**Command Prompt:**
```cmd
set PGPASSWORD=RetailBilling2024! && psql -h localhost -p 5433 -U postgres -d retail_billing -c "GRANT USAGE ON SCHEMA public TO app_user; GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user; GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user; GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO app_user;"
```

## What This Does

- Grants `app_user` permission to read/write all tables
- Grants permission to use sequences (for auto-increment IDs)
- Grants permission to execute functions
- Sets default permissions for any future tables

After running this, the login should work!

