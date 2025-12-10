import express from 'express'
import {
  getCustomers,
  getCustomerById,
  getCustomerStatistics,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerSales,
} from '../controllers/customerController.js'
import { authenticate, optionalAuthenticate } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/statistics', getCustomerStatistics)
router.get('/', getCustomers)
router.get('/:id', getCustomerById)
router.get('/:id/sales', getCustomerSales)

// Customer creation - allow optional authentication (for staff mode)
router.post('/', optionalAuthenticate, createCustomer)

// Protected routes (require authentication)
router.put('/:id', authenticate, updateCustomer)
router.delete('/:id', authenticate, deleteCustomer)

export default router

