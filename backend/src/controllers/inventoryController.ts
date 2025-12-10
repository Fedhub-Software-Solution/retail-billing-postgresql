import { Request, Response, NextFunction } from 'express'
import pool from '../config/database.js'
import Joi from 'joi'
import {
  ApiResponse,
  InventoryTransaction,
  DatabaseInventoryTransaction,
  CreateInventoryTransactionRequest,
  AuthenticatedRequest,
} from '../types/index.js'

// Validation schema
const createInventoryTransactionSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  transactionType: Joi.string()
    .valid('adjustment', 'purchase', 'return', 'damage', 'transfer')
    .required(),
  quantity: Joi.number().integer().required(),
  referenceType: Joi.string().max(50).optional().allow(''),
  referenceId: Joi.number().integer().positive().optional().allow(null),
  notes: Joi.string().max(500).optional().allow(''),
})

// Helper function to map database transaction to API format
const mapTransaction = (
  dbTransaction: DatabaseInventoryTransaction & { product_name?: string }
): InventoryTransaction => ({
  id: dbTransaction.id,
  productId: dbTransaction.product_id,
  productName: dbTransaction.product_name,
  transactionType: dbTransaction.transaction_type,
  quantity: dbTransaction.quantity,
  referenceType: dbTransaction.reference_type || undefined,
  referenceId: dbTransaction.reference_id || undefined,
  notes: dbTransaction.notes || undefined,
  createdBy: dbTransaction.created_by || undefined,
  createdAt: dbTransaction.created_at,
})

// Get inventory transactions
export const getInventoryTransactions = async (
  req: Request<{}, ApiResponse<InventoryTransaction[]>, {}, { productId?: string; transactionType?: string }>,
  res: Response<ApiResponse<InventoryTransaction[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, transactionType } = req.query

    let query = `
      SELECT it.*, p.name as product_name
      FROM inventory_transactions it
      LEFT JOIN products p ON it.product_id = p.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramCount = 1

    if (productId) {
      query += ` AND it.product_id = $${paramCount}`
      params.push(productId)
      paramCount++
    }

    if (transactionType) {
      query += ` AND it.transaction_type = $${paramCount}`
      params.push(transactionType)
      paramCount++
    }

    query += ` ORDER BY it.created_at DESC LIMIT 100`

    const result = await pool.query<DatabaseInventoryTransaction & { product_name?: string }>(
      query,
      params
    )

    res.json({
      success: true,
      data: result.rows.map(mapTransaction),
    })
  } catch (err) {
    next(err)
  }
}

// Create inventory transaction (stock adjustment)
export const createInventoryTransaction = async (
  req: AuthenticatedRequest<{}, ApiResponse<InventoryTransaction>, CreateInventoryTransactionRequest>,
  res: Response<ApiResponse<InventoryTransaction>>,
  next: NextFunction
): Promise<void> => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Validate input
    const { error, value } = createInventoryTransactionSchema.validate(req.body)
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

    const { productId, transactionType, quantity, referenceType, referenceId, notes } = value
    const userId = req.user?.id

    // Check if product exists
    const productCheck = await client.query(
      'SELECT id, stock_quantity FROM products WHERE id = $1',
      [productId]
    )

    if (productCheck.rows.length === 0) {
      await client.query('ROLLBACK')
      res.status(404).json({
        success: false,
        message: 'Product not found',
      })
      return
    }

    const currentStock = productCheck.rows[0].stock_quantity

    // Calculate new stock based on transaction type
    let newStock = currentStock
    if (transactionType === 'adjustment') {
      newStock = quantity // Direct adjustment
    } else if (transactionType === 'purchase' || transactionType === 'return') {
      newStock = currentStock + quantity // Increase stock
    } else if (transactionType === 'damage' || transactionType === 'transfer') {
      newStock = currentStock - quantity // Decrease stock
    }

    // Ensure stock doesn't go negative
    if (newStock < 0) {
      await client.query('ROLLBACK')
      res.status(400).json({
        success: false,
        message: 'Insufficient stock. Cannot reduce stock below zero.',
      })
      return
    }

    // Insert transaction
    const result = await client.query<DatabaseInventoryTransaction>(
      `INSERT INTO inventory_transactions (
        product_id, transaction_type, quantity, reference_type, reference_id, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        productId,
        transactionType,
        quantity,
        referenceType || null,
        referenceId || null,
        notes || null,
        userId || null,
      ]
    )

    // Update product stock
    await client.query(
      'UPDATE products SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newStock, productId]
    )

    await client.query('COMMIT')

    // Get product name
    const productResult = await client.query('SELECT name FROM products WHERE id = $1', [productId])
    const transaction = { ...result.rows[0], product_name: productResult.rows[0]?.name }

    res.status(201).json({
      success: true,
      data: mapTransaction(transaction),
      message: 'Inventory transaction created successfully',
    })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
}

// Get low stock alerts
export const getLowStockAlerts = async (
  req: Request<{}, ApiResponse<any[]>, {}, { threshold?: string }>,
  res: Response<ApiResponse<any[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold) : undefined

    let query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.stock_quantity,
        p.min_stock_level,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `

    const params: any[] = []
    if (threshold !== undefined) {
      query += ` AND p.stock_quantity <= $1`
      params.push(threshold)
    } else {
      query += ` AND p.stock_quantity <= p.min_stock_level`
    }

    query += ` ORDER BY p.stock_quantity ASC`

    const result = await pool.query(query, params)

    res.json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        stockQuantity: row.stock_quantity,
        minStockLevel: row.min_stock_level,
        categoryName: row.category_name,
      })),
    })
  } catch (err) {
    next(err)
  }
}

