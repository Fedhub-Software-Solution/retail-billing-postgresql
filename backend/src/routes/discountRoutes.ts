import express from 'express'
import {
  getDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  applyDiscount,
} from '../controllers/discountController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getDiscounts)
router.get('/:id', getDiscountById)
router.post('/apply', applyDiscount)

// Protected routes (require authentication)
router.post('/', authenticate, createDiscount)
router.put('/:id', authenticate, updateDiscount)
router.delete('/:id', authenticate, deleteDiscount)

export default router

