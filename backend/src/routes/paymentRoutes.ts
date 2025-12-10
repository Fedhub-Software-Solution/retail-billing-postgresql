import express from 'express'
import { createPaymentOrder, verifyPayment } from '../controllers/paymentController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Protected routes (require authentication)
router.post('/create-order', authenticate, createPaymentOrder)

// Public route for payment webhook (Razorpay will call this)
router.post('/verify', verifyPayment)

export default router
