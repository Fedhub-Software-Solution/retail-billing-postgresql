import express from 'express'
import {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  cancelSale,
  getSalePayments,
  createPayment,
} from '../controllers/saleController.js'
import { authenticate, optionalAuthenticate } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getSales)
router.get('/:id', getSaleById)
router.get('/:id/payments', getSalePayments)

// Sales creation - allow optional authentication (for staff mode)
router.post('/', optionalAuthenticate, createSale)

// Payment creation
router.post('/payments', authenticate, createPayment)

// Protected routes (require authentication)
router.put('/:id', authenticate, updateSale)
router.delete('/:id', authenticate, cancelSale)

export default router

