# Retail Billing Application - System Architecture

## 1. Overview

The Retail Billing Application is a comprehensive point-of-sale (POS) system designed for retail businesses to manage sales, inventory, customers, and reporting.

## 2. Architecture Pattern

### 2.1 Three-Tier Architecture
- **Presentation Layer**: React Frontend with Redux Toolkit
- **Application Layer**: Node.js/Express REST API
- **Data Layer**: PostgreSQL Database

### 2.2 System Components

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React Application (Redux Toolkit + RTK Query)  │   │
│  │  - UI Components                                 │   │
│  │  - State Management                              │   │
│  │  - API Integration                               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST API
                          │
┌─────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Node.js/Express Server                          │   │
│  │  - REST API Endpoints                            │   │
│  │  - Business Logic                                │   │
│  │  - Authentication & Authorization                │   │
│  │  - Validation & Error Handling                   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ SQL Queries
                          │
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                             │   │
│  │  - Tables                                        │   │
│  │  - Relationships                                 │   │
│  │  - Indexes                                       │   │
│  │  - Stored Procedures                            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 3. Technology Stack

### 3.1 Frontend
- **Framework**: React 18+
- **State Management**: Redux Toolkit
- **Data Fetching**: RTK Query
- **UI Library**: Material-UI / Ant Design / Tailwind CSS
- **Routing**: React Router v6
- **Form Handling**: React Hook Form
- **Validation**: Yup / Zod
- **Date Handling**: date-fns / moment.js
- **Build Tool**: Vite / Create React App

### 3.2 Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM/Query Builder**: Prisma / Sequelize / TypeORM / Knex.js
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Joi / express-validator
- **File Upload**: multer
- **API Documentation**: Swagger/OpenAPI

### 3.3 Database
- **RDBMS**: PostgreSQL 14+
- **Connection Pooling**: pg-pool
- **Migrations**: Database migration tool (Prisma Migrate / Sequelize CLI)

### 3.4 Development Tools
- **Version Control**: Git
- **Package Manager**: npm / yarn / pnpm
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, React Testing Library, Supertest
- **Environment Variables**: dotenv

## 4. Project Structure

### 4.1 Frontend Structure
```
frontend/
├── public/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/
│   │   ├── forms/
│   │   └── layout/
│   ├── features/            # Feature-based modules
│   │   ├── auth/
│   │   ├── products/
│   │   ├── sales/
│   │   ├── customers/
│   │   └── reports/
│   ├── store/               # Redux store configuration
│   │   ├── api/             # RTK Query API slices
│   │   └── slices/          # Redux slices
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── services/            # API service layer
│   ├── types/               # TypeScript types
│   ├── constants/           # Constants and configs
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

### 4.2 Backend Structure
```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js
│   │   └── env.js
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── saleController.js
│   │   └── customerController.js
│   ├── models/              # Database models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Sale.js
│   │   └── Customer.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── saleRoutes.js
│   │   └── customerRoutes.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── services/            # Business logic
│   │   ├── authService.js
│   │   ├── productService.js
│   │   └── saleService.js
│   ├── utils/               # Utility functions
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── migrations/          # Database migrations
│   ├── seeders/             # Database seeders
│   └── server.js            # Entry point
├── package.json
└── .env
```

## 5. Security Architecture

### 5.1 Authentication Flow
- JWT-based authentication
- Access tokens (short-lived) and refresh tokens (long-lived)
- Token stored in httpOnly cookies or localStorage
- Password hashing with bcrypt (salt rounds: 10)

### 5.2 Authorization
- Role-based access control (RBAC)
- Roles: Admin, Manager, Cashier, Staff
- Permission-based feature access

### 5.3 Security Measures
- CORS configuration
- Rate limiting
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection
- HTTPS enforcement in production

## 6. API Architecture

### 6.1 RESTful API Design
- Standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
- RESTful URL patterns
- Consistent response format
- Proper HTTP status codes

### 6.2 Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "errors": []
}
```

### 6.3 Error Handling
- Centralized error handling middleware
- Custom error classes
- Consistent error response format
- Logging and monitoring

## 7. Data Flow

### 7.1 Frontend to Backend
1. User action triggers Redux action
2. RTK Query makes API call
3. Request sent to Express server
4. Middleware processes (auth, validation)
5. Controller handles request
6. Service layer executes business logic
7. Model interacts with database
8. Response sent back through layers
9. RTK Query updates Redux store
10. React components re-render

### 7.2 State Management Flow
- RTK Query handles server state (caching, refetching)
- Redux Toolkit slices handle client state
- React components subscribe to state changes

## 8. Scalability Considerations

- Database indexing for performance
- Connection pooling
- Caching strategies (Redis - optional)
- Pagination for large datasets
- Lazy loading in frontend
- Code splitting and bundle optimization

## 9. Deployment Architecture

### 9.1 Development
- Local development servers
- Hot reloading
- Environment variables for local config

### 9.2 Production
- Frontend: Static hosting (Vercel, Netlify, AWS S3)
- Backend: Node.js hosting (AWS EC2, Heroku, DigitalOcean)
- Database: Managed PostgreSQL (AWS RDS, Heroku Postgres)
- Reverse proxy: Nginx (optional)
- SSL/TLS certificates

