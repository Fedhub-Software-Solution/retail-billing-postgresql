import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

// Import routes
import authRoutes from './routes/authRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import saleRoutes from './routes/saleRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import discountRoutes from './routes/discountRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import inventoryRoutes from './routes/inventoryRoutes.js'

// Import middleware
import { errorHandler } from './middleware/errorHandler.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Trust proxy (required for Cloud Run behind load balancer)
app.set('trust proxy', true)

// Security middleware
app.use(helmet())

// CORS configuration - allow multiple origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : process.env.NODE_ENV === 'production'
  ? [] // In production, CORS_ORIGIN must be explicitly set
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174']

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)
      
      // In development, allow common localhost ports
      if (process.env.NODE_ENV === 'development') {
        if (
          allowedOrigins.includes(origin) ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')
        ) {
          return callback(null, true)
        }
      }
      
      // In production, only allow specified origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// API routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/customers', customerRoutes)
app.use('/api/v1/sales', saleRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/reports', reportRoutes)
app.use('/api/v1/discounts', discountRoutes)
app.use('/api/v1/settings', settingsRoutes)
app.use('/api/v1/inventory', inventoryRoutes)

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 API available at http://localhost:${PORT}/api/v1`)
})

export default app

