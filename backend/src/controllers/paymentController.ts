import { Request, Response, NextFunction } from 'express'
import pool from '../config/database.js'
import Joi from 'joi'
import {
  ApiResponse,
  AuthenticatedRequest,
} from '../types/index.js'

// Validation schema for creating payment order
const createPaymentOrderSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('INR'),
  paymentMethod: Joi.string().valid('upi', 'card').required(),
  customerId: Joi.number().integer().positive().optional().allow(null),
  customerName: Joi.string().optional(),
  customerEmail: Joi.string().email().optional(),
  customerPhone: Joi.string().optional(),
})

// Create payment order (for Razorpay integration)
export const createPaymentOrder = async (
  req: AuthenticatedRequest<{}, ApiResponse<{ orderId: string; amount: number; currency: string }>, any>,
  res: Response<ApiResponse<{ orderId: string; amount: number; currency: string }>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { error, value } = createPaymentOrderSchema.validate(req.body)
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      })
      return
    }

    const { amount, currency = 'INR', paymentMethod, customerId, customerName, customerEmail, customerPhone } = value

    // Generate a unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // In production, you would:
    // 1. Initialize Razorpay with your API keys
    // 2. Create order using Razorpay API
    // 3. Return the order details to frontend
    
    // Example Razorpay integration (commented out - requires Razorpay SDK):
    /*
    const Razorpay = require('razorpay')
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const options = {
      amount: amount * 100, // Amount in paise
      currency: currency,
      receipt: orderId,
      notes: {
        customerId: customerId?.toString(),
        customerName: customerName,
        paymentMethod: paymentMethod,
      },
    }

    const razorpayOrder = await razorpay.orders.create(options)
    */

    // For now, return mock order (replace with actual Razorpay order in production)
    res.json({
      success: true,
      data: {
        orderId: orderId,
        amount: amount,
        currency: currency,
        // In production, include: razorpayOrderId, keyId from Razorpay
      },
      message: 'Payment order created successfully',
    })
  } catch (err) {
    next(err)
  }
}

// Verify payment (webhook handler)
export const verifyPayment = async (
  req: Request,
  res: Response<ApiResponse<{ verified: boolean; transactionId: string }>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    // In production, verify Razorpay signature
    /*
    const crypto = require('crypto')
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    const isVerified = generatedSignature === razorpay_signature
    */

    // For now, return mock verification
    const isVerified = true
    const transactionId = razorpay_payment_id || `txn_${Date.now()}`

    res.json({
      success: true,
      data: {
        verified: isVerified,
        transactionId: transactionId,
      },
      message: isVerified ? 'Payment verified successfully' : 'Payment verification failed',
    })
  } catch (err) {
    next(err)
  }
}
