import { Request, Response, NextFunction } from 'express'
import pool from '../config/database.js'
import Joi from 'joi'
import {
  ApiResponse,
  Sale,
  DatabaseSale,
  DatabaseSaleItem,
  CreateSaleRequest,
  UpdateSaleRequest,
  SaleQueryParams,
  PaginatedResponse,
  SaleItem,
  AuthenticatedRequest,
} from '../types/index.js'

// Validation schemas
const createSaleSchema = Joi.object({
  customerId: Joi.number().integer().positive().optional().allow(null),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        unitPrice: Joi.number().positive().required(),
        discountAmount: Joi.number().min(0).default(0),
      })
    )
    .min(1)
    .required(),
  discountAmount: Joi.number().min(0).default(0),
  paymentMethod: Joi.string().valid('cash', 'card', 'upi', 'credit', 'other').optional(),
  notes: Joi.string().max(500).optional().allow(''),
})

const createPaymentSchema = Joi.object({
  saleId: Joi.number().integer().positive().required(),
  paymentMethod: Joi.string().valid('cash', 'card', 'upi', 'credit', 'other').required(),
  amount: Joi.number().positive().required(),
  transactionId: Joi.string().max(100).optional().allow(''),
  notes: Joi.string().max(500).optional().allow(''),
})

const updateSaleSchema = Joi.object({
  customerId: Joi.number().integer().positive().optional().allow(null),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        unitPrice: Joi.number().positive().required(),
        discountAmount: Joi.number().min(0).default(0),
      })
    )
    .min(1)
    .optional(),
  discountAmount: Joi.number().min(0).optional(),
  paymentMethod: Joi.string().valid('cash', 'card', 'upi', 'credit', 'other').optional(),
  notes: Joi.string().max(500).optional().allow(''),
})

// Helper function to map database sale to API format
const mapSale = async (
  dbSale: DatabaseSale,
  includeItems: boolean = true
): Promise<Sale> => {
  const sale: Sale = {
    id: dbSale.id,
    invoiceNumber: dbSale.invoice_number,
    customerId: dbSale.customer_id || undefined,
    saleDate: dbSale.sale_date,
    subtotal: parseFloat(dbSale.subtotal.toString()),
    taxAmount: parseFloat(dbSale.tax_amount.toString()),
    discountAmount: parseFloat(dbSale.discount_amount.toString()),
    totalAmount: parseFloat(dbSale.total_amount.toString()),
    paymentStatus: dbSale.payment_status,
    paymentMethod: dbSale.payment_method || undefined,
    notes: dbSale.notes || undefined,
    createdBy: dbSale.created_by || undefined,
    items: [],
    createdAt: dbSale.created_at,
    updatedAt: dbSale.updated_at,
  }

  // Get customer name if exists
  if (dbSale.customer_id) {
    const customerResult = await pool.query(
      'SELECT first_name, last_name FROM customers WHERE id = $1',
      [dbSale.customer_id]
    )
    if (customerResult.rows.length > 0) {
      const customer = customerResult.rows[0]
      sale.customerName = `${customer.first_name} ${customer.last_name || ''}`.trim()
    }
  }

  // Get created by name if exists
  if (dbSale.created_by) {
    const userResult = await pool.query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [dbSale.created_by]
    )
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0]
      sale.createdByName = `${user.first_name} ${user.last_name || ''}`.trim()
    }
  }

  // Get sale items if requested
  if (includeItems) {
    const itemsResult = await pool.query<DatabaseSaleItem & { product_name?: string }>(
      `SELECT si.*, p.name as product_name
       FROM sale_items si
       LEFT JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = $1
       ORDER BY si.id`,
      [dbSale.id]
    )

    sale.items = itemsResult.rows.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unit_price.toString()),
      discountAmount: parseFloat(item.discount_amount.toString()),
      taxAmount: parseFloat(item.tax_amount.toString()),
      lineTotal: parseFloat(item.line_total.toString()),
    }))
  }

  return sale
}

// Calculate totals for sale items
const calculateSaleTotals = async (
  items: Array<{ productId: number; quantity: number; unitPrice: number; discountAmount?: number }>,
  discountAmount: number = 0
): Promise<{ subtotal: number; taxAmount: number; totalAmount: number; itemDetails: SaleItem[] }> => {
  let subtotal = 0
  let totalTax = 0
  const itemDetails: SaleItem[] = []

  for (const item of items) {
    // Get product tax rate
    const productResult = await pool.query(
      'SELECT tax_rate, stock_quantity FROM products WHERE id = $1',
      [item.productId]
    )

    if (productResult.rows.length === 0) {
      throw new Error(`Product with id ${item.productId} not found`)
    }

    const product = productResult.rows[0]

    // Check stock availability
    if (product.stock_quantity < item.quantity) {
      throw new Error(`Insufficient stock for product ${item.productId}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`)
    }

    const taxRate = parseFloat(product.tax_rate.toString())
    const itemSubtotal = item.unitPrice * item.quantity
    const itemDiscount = item.discountAmount || 0
    const itemSubtotalAfterDiscount = itemSubtotal - itemDiscount
    const itemTax = (itemSubtotalAfterDiscount * taxRate) / 100
    const itemTotal = itemSubtotalAfterDiscount + itemTax

    subtotal += itemSubtotal
    totalTax += itemTax

    itemDetails.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountAmount: itemDiscount,
      taxAmount: itemTax,
      lineTotal: itemTotal,
    })
  }

  const subtotalAfterDiscount = subtotal - discountAmount
  const totalAmount = subtotalAfterDiscount + totalTax

  return {
    subtotal,
    taxAmount: totalTax,
    totalAmount,
    itemDetails,
  }
}

// Get all sales with pagination and filters
export const getSales = async (
  req: Request<{}, ApiResponse<PaginatedResponse<Sale>>, {}, SaleQueryParams>,
  res: Response<ApiResponse<PaginatedResponse<Sale>>>,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      customerId,
      paymentStatus,
      createdBy,
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    // Build WHERE clause
    const conditions: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (startDate) {
      conditions.push(`s.sale_date >= $${paramCount}`)
      params.push(startDate)
      paramCount++
    }

    if (endDate) {
      conditions.push(`s.sale_date <= $${paramCount}`)
      params.push(endDate)
      paramCount++
    }

    if (customerId) {
      conditions.push(`s.customer_id = $${paramCount}`)
      params.push(customerId)
      paramCount++
    }

    if (paymentStatus) {
      conditions.push(`s.payment_status = $${paramCount}`)
      params.push(paymentStatus)
      paramCount++
    }

    if (createdBy) {
      conditions.push(`s.created_by = $${paramCount}`)
      params.push(createdBy)
      paramCount++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM sales s ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].total)

    // Get sales
    const result = await pool.query<DatabaseSale>(
      `SELECT s.* FROM sales s
       ${whereClause}
       ORDER BY s.sale_date DESC, s.id DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, Number(limit), offset]
    )

    const sales = await Promise.all(
      result.rows.map((sale) => mapSale(sale, false))
    )

    res.json({
      success: true,
      data: {
        data: sales,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

// Get sale by ID
export const getSaleById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Sale>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const result = await pool.query<DatabaseSale>(
      'SELECT * FROM sales WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Sale not found',
      })
      return
    }

    const sale = await mapSale(result.rows[0], true)

    res.json({
      success: true,
      data: sale,
    })
  } catch (err) {
    next(err)
  }
}

// Create sale
export const createSale = async (
  req: AuthenticatedRequest<{}, ApiResponse<Sale>, CreateSaleRequest>,
  res: Response<ApiResponse<Sale>>,
  next: NextFunction
): Promise<void> => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Validate input
    const { error, value } = createSaleSchema.validate(req.body)
    if (error) {
      await client.query('ROLLBACK')
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

    const { customerId, items, discountAmount = 0, paymentMethod, notes } = value
    const userId = req.user?.id

    // Check if customer exists (if provided)
    if (customerId) {
      const customerCheck = await client.query('SELECT id FROM customers WHERE id = $1', [customerId])
      if (customerCheck.rows.length === 0) {
        await client.query('ROLLBACK')
        res.status(404).json({
          success: false,
          message: 'Customer not found',
        })
        return
      }
    }

    // Calculate totals
    const { subtotal, taxAmount, totalAmount, itemDetails } = await calculateSaleTotals(
      items,
      discountAmount
    )

    // Generate invoice number using database function
    const invoiceResult = await client.query('SELECT generate_invoice_number() as invoice_number')
    const invoiceNumber = invoiceResult.rows[0].invoice_number

    // Insert sale
    const saleResult = await client.query<DatabaseSale>(
      `INSERT INTO sales (
        invoice_number, customer_id, subtotal, tax_amount, discount_amount,
        total_amount, payment_status, payment_method, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        invoiceNumber,
        customerId || null,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        paymentMethod ? 'paid' : 'pending',
        paymentMethod || null,
        notes || null,
        userId || null,
      ]
    )

    const sale = saleResult.rows[0]

    // Insert sale items
    for (const item of itemDetails) {
      await client.query(
        `INSERT INTO sale_items (
          sale_id, product_id, quantity, unit_price, discount_amount, tax_amount, line_total
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          sale.id,
          item.productId,
          item.quantity,
          item.unitPrice,
          item.discountAmount,
          item.taxAmount,
          item.lineTotal,
        ]
      )

      // Update product stock (trigger handles this, but we can verify)
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.productId]
      )
    }

    await client.query('COMMIT')

    const mappedSale = await mapSale(sale, true)

    res.status(201).json({
      success: true,
      data: mappedSale,
      message: 'Sale created successfully',
    })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}

// Update sale (only if not paid)
export const updateSale = async (
  req: AuthenticatedRequest<{ id: string }, ApiResponse<Sale>, UpdateSaleRequest>,
  res: Response<ApiResponse<Sale>>,
  next: NextFunction
): Promise<void> => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { id } = req.params

    // Check if sale exists and is not paid
    const saleCheck = await client.query<DatabaseSale>(
      'SELECT * FROM sales WHERE id = $1',
      [id]
    )

    if (saleCheck.rows.length === 0) {
      await client.query('ROLLBACK')
      res.status(404).json({
        success: false,
        message: 'Sale not found',
      })
      return
    }

    const existingSale = saleCheck.rows[0]

    if (existingSale.payment_status === 'paid') {
      await client.query('ROLLBACK')
      res.status(400).json({
        success: false,
        message: 'Cannot update a paid sale',
      })
      return
    }

    // Validate input
    const { error, value } = updateSaleSchema.validate(req.body)
    if (error) {
      await client.query('ROLLBACK')
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

    const { customerId, items, discountAmount, paymentMethod, notes } = value
    const userId = req.user?.id

    // If items are being updated, recalculate totals
    let subtotal = existingSale.subtotal
    let taxAmount = existingSale.tax_amount
    let totalAmount = existingSale.total_amount

    if (items) {
      // Restore stock from old items
      const oldItemsResult = await client.query<DatabaseSaleItem>(
        'SELECT product_id, quantity FROM sale_items WHERE sale_id = $1',
        [id]
      )

      for (const oldItem of oldItemsResult.rows) {
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
          [oldItem.quantity, oldItem.product_id]
        )
      }

      // Delete old items
      await client.query('DELETE FROM sale_items WHERE sale_id = $1', [id])

      // Calculate new totals
      const totals = await calculateSaleTotals(items, discountAmount ?? existingSale.discount_amount)
      subtotal = totals.subtotal
      taxAmount = totals.taxAmount
      totalAmount = totals.totalAmount

      // Insert new items
      for (const item of totals.itemDetails) {
        await client.query(
          `INSERT INTO sale_items (
            sale_id, product_id, quantity, unit_price, discount_amount, tax_amount, line_total
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            id,
            item.productId,
            item.quantity,
            item.unitPrice,
            item.discountAmount,
            item.taxAmount,
            item.lineTotal,
          ]
        )

        // Update product stock
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [item.quantity, item.productId]
        )
      }
    }

    // Update sale
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (customerId !== undefined) {
      updates.push(`customer_id = $${paramCount++}`)
      values.push(customerId || null)
    }
    if (discountAmount !== undefined) {
      updates.push(`discount_amount = $${paramCount++}`)
      values.push(discountAmount)
      if (!items) {
        // Recalculate if only discount changed
        const newSubtotal = parseFloat(existingSale.subtotal.toString()) - discountAmount
        const newTotal = newSubtotal + parseFloat(existingSale.tax_amount.toString())
        updates.push(`subtotal = $${paramCount++}`)
        values.push(newSubtotal)
        updates.push(`total_amount = $${paramCount++}`)
        values.push(newTotal)
      }
    }
    if (items) {
      updates.push(`subtotal = $${paramCount++}`)
      values.push(subtotal)
      updates.push(`tax_amount = $${paramCount++}`)
      values.push(taxAmount)
      updates.push(`total_amount = $${paramCount++}`)
      values.push(totalAmount)
    }
    if (paymentMethod !== undefined) {
      updates.push(`payment_method = $${paramCount++}`)
      values.push(paymentMethod || null)
      updates.push(`payment_status = $${paramCount++}`)
      values.push(paymentMethod ? 'paid' : 'pending')
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`)
      values.push(notes || null)
    }

    updates.push(`updated_by = $${paramCount++}`)
    values.push(userId || null)
    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await client.query<DatabaseSale>(
      `UPDATE sales 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    )

    await client.query('COMMIT')

    const mappedSale = await mapSale(result.rows[0], true)

    res.json({
      success: true,
      data: mappedSale,
      message: 'Sale updated successfully',
    })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}

// Cancel sale
export const cancelSale = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { id } = req.params
    const userId = req.user?.id

    // Check if sale exists
    const saleCheck = await client.query<DatabaseSale>(
      'SELECT * FROM sales WHERE id = $1',
      [id]
    )

    if (saleCheck.rows.length === 0) {
      await client.query('ROLLBACK')
      res.status(404).json({
        success: false,
        message: 'Sale not found',
      })
      return
    }

    const sale = saleCheck.rows[0]

    // Restore stock
    const itemsResult = await client.query<DatabaseSaleItem>(
      'SELECT product_id, quantity FROM sale_items WHERE sale_id = $1',
      [id]
    )

    for (const item of itemsResult.rows) {
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      )
    }

    // Update sale status
    await client.query(
      `UPDATE sales 
       SET payment_status = 'cancelled', updated_by = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [userId || null, id]
    )

    await client.query('COMMIT')

    res.json({
      success: true,
      message: 'Sale cancelled successfully',
    })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}

// Get payments for a sale
export const getSalePayments = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Array<{ id: number; saleId: number; paymentMethod: string; amount: number; transactionId?: string; paymentDate: string; notes?: string }>>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const result = await pool.query<{
      id: number
      sale_id: number
      payment_method: string
      amount: number
      transaction_id: string | null
      payment_date: string
      notes: string | null
    }>(
      `SELECT id, sale_id, payment_method, amount, transaction_id, payment_date, notes
       FROM payments
       WHERE sale_id = $1
       ORDER BY payment_date DESC`,
      [id]
    )

    const payments = result.rows.map((row) => ({
      id: row.id,
      saleId: row.sale_id,
      paymentMethod: row.payment_method,
      amount: parseFloat(row.amount.toString()),
      transactionId: row.transaction_id || undefined,
      paymentDate: row.payment_date,
      notes: row.notes || undefined,
    }))

    res.json({
      success: true,
      data: payments,
      message: 'Payments retrieved successfully',
    })
  } catch (err) {
    next(err)
  }
}

// Create payment for a sale
export const createPayment = async (
  req: AuthenticatedRequest<{}, ApiResponse<{ id: number; saleId: number; amount: number }>, any>,
  res: Response<ApiResponse<{ id: number; saleId: number; amount: number }>>,
  next: NextFunction
): Promise<void> => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { error, value } = createPaymentSchema.validate(req.body)
    if (error) {
      await client.query('ROLLBACK')
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

    const { saleId, paymentMethod, amount, transactionId, notes } = value
    const userId = (req as AuthenticatedRequest).user?.id

    // Check if sale exists
    const saleResult = await client.query<DatabaseSale>(
      'SELECT * FROM sales WHERE id = $1',
      [saleId]
    )

    if (saleResult.rows.length === 0) {
      await client.query('ROLLBACK')
      res.status(404).json({
        success: false,
        message: 'Sale not found',
      })
      return
    }

    const sale = saleResult.rows[0]

    // Get total payments for this sale
    const paymentsResult = await client.query<{ total: number }>(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE sale_id = $1',
      [saleId]
    )
    const totalPaid = parseFloat(paymentsResult.rows[0].total.toString())

    // Check if payment amount exceeds remaining balance
    const remainingAmount = sale.total_amount - totalPaid
    if (amount > remainingAmount) {
      await client.query('ROLLBACK')
      res.status(400).json({
        success: false,
        message: `Payment amount cannot exceed remaining balance of ₹${remainingAmount.toFixed(2)}`,
      })
      return
    }

    // Insert payment
    const paymentResult = await client.query<{ id: number }>(
      `INSERT INTO payments (sale_id, payment_method, amount, transaction_id, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [saleId, paymentMethod, amount, transactionId || null, notes || null, userId || null]
    )

    const newTotalPaid = totalPaid + amount
    const newPaymentStatus = newTotalPaid >= sale.total_amount ? 'paid' : 'partial'

    // Update sale payment status
    await client.query(
      `UPDATE sales 
       SET payment_status = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [newPaymentStatus, userId || null, saleId]
    )

    await client.query('COMMIT')

    res.status(201).json({
      success: true,
      data: {
        id: paymentResult.rows[0].id,
        saleId,
        amount,
      },
      message: 'Payment recorded successfully',
    })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}

