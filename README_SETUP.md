# Setup Instructions - Phase 1 Complete

## ✅ Phase 1 Day 1: Project Initialization - COMPLETE

The basic project structure has been created for both frontend and backend.

### ✨ TypeScript Implementation
- **Frontend**: React with TypeScript ✅
- **Backend**: Express.js with TypeScript ✅
- Full type safety across the entire application

## 📋 Next Steps to Run the Application

### 1. Install Dependencies

#### Frontend:
```bash
cd frontend
npm install
```

#### Backend:
```bash
cd backend
npm install
```

### 2. Setup PostgreSQL Database

1. **Install PostgreSQL** (if not already installed)
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create Database**:
   ```sql
   CREATE DATABASE retail_billing_db;
   ```

3. **Update Backend .env file**:
   - Edit `backend/.env`
   - Update database credentials if different from defaults:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=retail_billing_db
     DB_USER=postgres
     DB_PASSWORD=your_password
     ```

### 3. Run Database Migrations

```bash
cd backend
npm run migrate
```

This will create all tables in the database.

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

This creates a default admin user:
- **Username**: admin
- **Email**: admin@billing.com
- **Password**: admin123

⚠️ **IMPORTANT**: Change the default password in production!

This creates a default admin user:
- **Username**: admin
- **Email**: admin@billing.com
- **Password**: admin123

⚠️ **IMPORTANT**: Change the default password in production!

### 5. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

**Note**: The backend uses `tsx` for TypeScript execution in development mode. For production, use `npm run build` then `npm start`.

### 6. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🧪 Test the Setup

1. Open browser to `http://localhost:3000`
2. You should see the login page
3. Try logging in with:
   - Email: `admin@billing.com`
   - Password: `admin123`

## 📁 Project Structure Created

### Frontend (`frontend/`)
- ✅ React + TypeScript + Vite setup
- ✅ Redux Toolkit + RTK Query configured
- ✅ Material-UI integrated
- ✅ React Router setup
- ✅ Basic layout components (Header, Sidebar, Layout)
- ✅ Login page and form
- ✅ Auth slice and store configuration

### Backend (`backend/`)
- ✅ Express.js server setup with **TypeScript**
- ✅ PostgreSQL connection configured
- ✅ Authentication routes and controllers (fully typed)
- ✅ JWT authentication middleware
- ✅ Error handling middleware
- ✅ Database schema (SQL file)
- ✅ Migration and seed scripts
- ✅ TypeScript configuration
- ✅ Type definitions for all entities

## 🔧 Configuration Files

- `frontend/.env` - Frontend environment variables
- `backend/.env` - Backend environment variables (update with your database credentials)
- `frontend/vite.config.ts` - Vite configuration
- `backend/src/config/database.js` - Database connection
- `backend/src/config/env.js` - Environment configuration

## ⚠️ Important Notes

1. **Database Password**: Update the password in `backend/.env` to match your PostgreSQL setup
2. **JWT Secrets**: Change the JWT secrets in `backend/.env` for production
3. **Admin Password**: The default admin password is `admin123` - change it after first login
4. **CORS**: Update CORS_ORIGIN in backend/.env if frontend runs on different port

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `backend/.env`
- Ensure database `retail_billing_db` exists

### Port Already in Use
- Change PORT in `backend/.env` or `frontend/vite.config.ts`
- Kill process using the port

### Module Not Found Errors
- Run `npm install` in both frontend and backend directories
- Delete `node_modules` and `package-lock.json`, then reinstall

## 📝 Next Phase

After verifying Day 1 setup works:
- **Day 2-3**: Complete database schema implementation
- **Day 4-5**: Complete authentication system (already partially done)

## ✅ Checklist

- [ ] Frontend dependencies installed
- [ ] Backend dependencies installed
- [ ] PostgreSQL database created
- [ ] Database migrations run successfully
- [ ] Backend server starts without errors
- [ ] Frontend dev server starts without errors
- [ ] Can access login page in browser
- [ ] Database connection works

---

**Status**: Phase 1 Day 1 - Project Structure Complete ✅
**Next**: Install dependencies and test the setup

