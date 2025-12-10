import { Request, Response, NextFunction } from 'express'
import pool from '../config/database.js'
import Joi from 'joi'
import {
  ApiResponse,
  Discount,
  DatabaseDiscount,
  CreateDiscountRequest,
  UpdateDiscountRequest,
  ApplyDiscountRequest,
  AuthenticatedRequest,
} from '../types/index.js'

// Validation schemas
const createDiscountSchema = Joi.object({
  code: Joi.string().max(50).optional().allow(''),
  name: Joi.string().min(1).max(100).required(),
  discountType: Joi.string().valid('percentage', 'fixed').required(),
  discountValue: Joi.number().positive().required(),
  minPurchaseAmount: Joi.number().min(0).default(0),
  maxDiscountAmount: Joi.number().positive().optional().allow(null),
  startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().allow(null, ''),
  endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().allow(null, ''),
  usageLimit: Joi.number().integer().positive().optional().allow(null),
  isActive: Joi.boolean().default(true),
})

const updateDiscountSchema = Joi.object({
  code: Joi.string().max(50).optional().allow(''),
  name: Joi.string().min(1).max(100).optional(),
  discountType: Joi.string().valid('percentage', 'fixed').optional(),
  discountValue: Joi.number().positive().optional(),
  minPurchaseAmount: Joi.number().min(0).optional(),
  maxDiscountAmount: Joi.number().positive().optional().allow(null),
  startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().allow(null, ''),
  endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().allow(null, ''),
  usageLimit: Joi.number().integer().positive().optional().allow(null),
  isActive: Joi.boolean().optional(),
})

// Helper function to convert database discount to API format
const mapDiscount = (dbDiscount: DatabaseDiscount): Discount => {
  // Helper to format date as YYYY-MM-DD string without timezone conversion
  const formatDateString = (date: Date | string | null | undefined): string | undefined => {
    if (!date) return undefined
    if (typeof date === 'string') {
      // If already a string, extract date part only
      return date.split('T')[0]
    }
    if (date instanceof Date) {
      // Format as YYYY-MM-DD without timezone conversion
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    return undefined
  }

  return {
    id: dbDiscount.id,
    code: dbDiscount.code || undefined,
    name: dbDiscount.name,
    discountType: dbDiscount.discount_type,
    discountValue: parseFloat(dbDiscount.discount_value.toString()),
    minPurchaseAmount: parseFloat(dbDiscount.min_purchase_amount.toString()),
    maxDiscountAmount: dbDiscount.max_discount_amount
      ? parseFloat(dbDiscount.max_discount_amount.toString())
      : undefined,
    startDate: formatDateString(dbDiscount.start_date),
    endDate: formatDateString(dbDiscount.end_date),
    usageLimit: dbDiscount.usage_limit || undefined,
    usedCount: dbDiscount.used_count,
    isActive: dbDiscount.is_active,
    createdAt: dbDiscount.created_at,
    updatedAt: dbDiscount.updated_at,
  }
}

// Get all discounts
export const getDiscounts = async (
  req: Request,
  res: Response<ApiResponse<Discount[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query<DatabaseDiscount>(
      'SELECT * FROM discounts ORDER BY created_at DESC'
    )

    res.json({
      success: true,
      data: result.rows.map(mapDiscount),
    })
  } catch (err) {
    next(err)
  }
}

// Get discount by ID
export const getDiscountById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Discount>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const result = await pool.query<DatabaseDiscount>(
      'SELECT * FROM discounts WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Discount not found',
      })
      return
    }

    res.json({
      success: true,
      data: mapDiscount(result.rows[0]),
    })
  } catch (err) {
    next(err)
  }
}

// Create discount
export const createDiscount = async (
  req: AuthenticatedRequest<{}, ApiResponse<Discount>, CreateDiscountRequest>,
  res: Response<ApiResponse<Discount>>,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate input
    const { error, value } = createDiscountSchema.validate(req.body)
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

    const {
      code,
      name,
      discountType,
      discountValue,
      minPurchaseAmount = 0,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      isActive = true,
    } = value

    // Check if code already exists (if provided)
    if (code) {
      const codeCheck = await pool.query('SELECT id FROM discounts WHERE code = $1', [code])
      if (codeCheck.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Discount code already exists',
        })
        return
      }
    }

    // Convert date strings to proper format for PostgreSQL (keep as strings to avoid timezone issues)
    const formatDateForDB = (dateStr: string | null | undefined): string | null => {
      if (!dateStr || dateStr.trim() === '') return null
      // Ensure it's in YYYY-MM-DD format
      return dateStr.trim()
    }

    // Insert discount
    const result = await pool.query<DatabaseDiscount>(
      `INSERT INTO discounts (
        code, name, discount_type, discount_value, min_purchase_amount,
        max_discount_amount, start_date, end_date, usage_limit, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        code || null,
        name,
        discountType,
        discountValue,
        minPurchaseAmount,
        maxDiscountAmount || null,
        formatDateForDB(startDate),
        formatDateForDB(endDate),
        usageLimit || null,
        isActive,
      ]
    )

    res.status(201).json({
      success: true,
      data: mapDiscount(result.rows[0]),
      message: 'Discount created successfully',
    })
  } catch (err) {
    next(err)
  }
}

// Update discount
export const updateDiscount = async (
  req: AuthenticatedRequest<{ id: string }, ApiResponse<Discount>, UpdateDiscountRequest>,
  res: Response<ApiResponse<Discount>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    // Validate input
    const { error, value } = updateDiscountSchema.validate(req.body)
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

    // Check if discount exists
    const discountCheck = await pool.query<DatabaseDiscount>(
      'SELECT * FROM discounts WHERE id = $1',
      [id]
    )

    if (discountCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Discount not found',
      })
      return
    }

    const {
      code,
      name,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      isActive,
    } = value

    // Check if code already exists (if being updated)
    if (code !== undefined) {
      const codeCheck = await pool.query(
        'SELECT id FROM discounts WHERE code = $1 AND id != $2',
        [code, id]
      )
      if (codeCheck.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Discount code already exists',
        })
        return
      }
    }

    // Helper function to format date for database
    const formatDateForDB = (dateStr: string | null | undefined): string | null => {
      if (!dateStr || dateStr.trim() === '') return null
      // Ensure it's in YYYY-MM-DD format
      return dateStr.trim()
    }

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (code !== undefined) {
      updates.push(`code = $${paramCount++}`)
      values.push(code || null)
    }
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`)
      values.push(name)
    }
    if (discountType !== undefined) {
      updates.push(`discount_type = $${paramCount++}`)
      values.push(discountType)
    }
    if (discountValue !== undefined) {
      updates.push(`discount_value = $${paramCount++}`)
      values.push(discountValue)
    }
    if (minPurchaseAmount !== undefined) {
      updates.push(`min_purchase_amount = $${paramCount++}`)
      values.push(minPurchaseAmount)
    }
    if (maxDiscountAmount !== undefined) {
      updates.push(`max_discount_amount = $${paramCount++}`)
      values.push(maxDiscountAmount || null)
    }
    if (startDate !== undefined) {
      updates.push(`start_date = $${paramCount++}`)
      values.push(formatDateForDB(startDate))
    }
    if (endDate !== undefined) {
      updates.push(`end_date = $${paramCount++}`)
      values.push(formatDateForDB(endDate))
    }
    if (usageLimit !== undefined) {
      updates.push(`usage_limit = $${paramCount++}`)
      values.push(usageLimit || null)
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`)
      values.push(isActive)
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await pool.query<DatabaseDiscount>(
      `UPDATE discounts 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    )

    res.json({
      success: true,
      data: mapDiscount(result.rows[0]),
      message: 'Discount updated successfully',
    })
  } catch (err) {
    next(err)
  }
}

// Delete discount
export const deleteDiscount = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    // Check if discount exists
    const discountCheck = await pool.query('SELECT id FROM discounts WHERE id = $1', [id])

    if (discountCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Discount not found',
      })
      return
    }

    // Delete discount
    await pool.query('DELETE FROM discounts WHERE id = $1', [id])

    res.json({
      success: true,
      message: 'Discount deleted successfully',
    })
  } catch (err) {
    next(err)
  }
}

// Apply discount
export const applyDiscount = async (
  req: Request<{}, ApiResponse<{ discountAmount: number; discount: Discount }>, ApplyDiscountRequest>,
  res: Response<ApiResponse<{ discountAmount: number; discount: Discount }>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, discountId, amount } = req.body

    if (!code && !discountId) {
      res.status(400).json({
        success: false,
        message: 'Either code or discountId is required',
      })
      return
    }

    // Find discount
    let discountResult
    if (discountId) {
      discountResult = await pool.query<DatabaseDiscount>(
        'SELECT * FROM discounts WHERE id = $1',
        [discountId]
      )
    } else {
      discountResult = await pool.query<DatabaseDiscount>(
        'SELECT * FROM discounts WHERE code = $1',
        [code]
      )
    }

    if (discountResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Discount not found',
      })
      return
    }

    const discount = mapDiscount(discountResult.rows[0])

    // Validate discount
    if (!discount.isActive) {
      res.status(400).json({
        success: false,
        message: 'Discount is not active',
      })
      return
    }

    const now = new Date()
    if (discount.startDate && new Date(discount.startDate) > now) {
      res.status(400).json({
        success: false,
        message: 'Discount has not started yet',
      })
      return
    }

    if (discount.endDate && new Date(discount.endDate) < now) {
      res.status(400).json({
        success: false,
        message: 'Discount has expired',
      })
      return
    }

    if (amount < discount.minPurchaseAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum purchase amount of ₹${discount.minPurchaseAmount} required`,
      })
      return
    }

    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      res.status(400).json({
        success: false,
        message: 'Discount usage limit reached',
      })
      return
    }

    // Calculate discount amount
    let discountAmount = 0
    if (discount.discountType === 'percentage') {
      discountAmount = (amount * discount.discountValue) / 100
      if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
        discountAmount = discount.maxDiscountAmount
      }
    } else {
      discountAmount = discount.discountValue
    }

    // Ensure discount doesn't exceed amount
    if (discountAmount > amount) {
      discountAmount = amount
    }

    res.json({
      success: true,
      data: {
        discountAmount,
        discount,
      },
    })
  } catch (err) {
    next(err)
  }
}

