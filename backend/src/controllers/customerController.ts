import { Request, Response, NextFunction } from 'express'
import pool from '../config/database.js'
import Joi from 'joi'
import {
  ApiResponse,
  Customer,
  DatabaseCustomer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerQueryParams,
  PaginatedResponse,
  CustomerStatistics,
  AuthenticatedRequest,
} from '../types/index.js'

// Validation schemas
const createCustomerSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().max(50).optional().allow(''),
  email: Joi.string().email().max(100).optional().allow(''),
  phone: Joi.string().max(20).optional().allow(''),
  address: Joi.string().max(500).optional().allow(''),
  city: Joi.string().max(50).optional().allow(''),
  state: Joi.string().max(50).optional().allow(''),
  zipCode: Joi.string().max(20).optional().allow(''),
  country: Joi.string().max(50).default('India'),
  customerType: Joi.string().valid('retail', 'wholesale', 'corporate').default('retail'),
  creditLimit: Joi.number().min(0).default(0),
})

const updateCustomerSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().max(50).optional().allow(''),
  email: Joi.string().email().max(100).optional().allow(''),
  phone: Joi.string().max(20).optional().allow(''),
  address: Joi.string().max(500).optional().allow(''),
  city: Joi.string().max(50).optional().allow(''),
  state: Joi.string().max(50).optional().allow(''),
  zipCode: Joi.string().max(20).optional().allow(''),
  country: Joi.string().max(50).optional(),
  customerType: Joi.string().valid('retail', 'wholesale', 'corporate').optional(),
  creditLimit: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
})

// Helper function to generate customer code
const generateCustomerCode = async (): Promise<string> => {
  const result = await pool.query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(customer_code FROM '[0-9]+$') AS INTEGER)), 0) + 1 as next_num FROM customers WHERE customer_code LIKE 'CUST%'"
  )
  const nextNum = result.rows[0].next_num
  return `CUST${String(nextNum).padStart(6, '0')}`
}

// Helper function to convert database customer to API format
const mapCustomer = (
  dbCustomer: DatabaseCustomer & { total_purchases?: number }
): Customer => ({
  id: dbCustomer.id,
  customerCode: dbCustomer.customer_code,
  firstName: dbCustomer.first_name,
  lastName: dbCustomer.last_name || undefined,
  email: dbCustomer.email || undefined,
  phone: dbCustomer.phone || undefined,
  address: dbCustomer.address || undefined,
  city: dbCustomer.city || undefined,
  state: dbCustomer.state || undefined,
  zipCode: dbCustomer.zip_code || undefined,
  country: dbCustomer.country,
  customerType: dbCustomer.customer_type,
  creditLimit: parseFloat(dbCustomer.credit_limit.toString()),
  isActive: dbCustomer.is_active,
  createdAt: dbCustomer.created_at,
  updatedAt: dbCustomer.updated_at,
  totalPurchases: dbCustomer.total_purchases
    ? parseFloat(dbCustomer.total_purchases.toString())
    : undefined,
})

// Get all customers with pagination and filters
export const getCustomers = async (
  req: Request<{}, ApiResponse<PaginatedResponse<Customer>>, {}, CustomerQueryParams>,
  res: Response<ApiResponse<PaginatedResponse<Customer>>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 20, search, customerType } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    // Build WHERE clause
    const conditions: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (search) {
      conditions.push(
        `(c.first_name ILIKE $${paramCount} OR c.last_name ILIKE $${paramCount} OR c.email ILIKE $${paramCount} OR c.phone ILIKE $${paramCount} OR c.customer_code ILIKE $${paramCount})`
      )
      params.push(`%${search}%`)
      paramCount++
    }

    if (customerType) {
      conditions.push(`c.customer_type = $${paramCount}`)
      params.push(customerType)
      paramCount++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM customers c ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].total)

    // Get customers with total purchases
    const result = await pool.query<DatabaseCustomer & { total_purchases?: number }>(
      `SELECT 
        c.*,
        COALESCE(SUM(s.total_amount), 0) as total_purchases
       FROM customers c
       LEFT JOIN sales s ON c.id = s.customer_id AND s.payment_status = 'paid'
       ${whereClause}
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, Number(limit), offset]
    )

    const customers = result.rows.map(mapCustomer)

    res.json({
      success: true,
      data: {
        data: customers,
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

// Get customer by ID
export const getCustomerById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Customer>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const result = await pool.query<DatabaseCustomer & { total_purchases?: number }>(
      `SELECT 
        c.*,
        COALESCE(SUM(s.total_amount), 0) as total_purchases
       FROM customers c
       LEFT JOIN sales s ON c.id = s.customer_id AND s.payment_status = 'paid'
       WHERE c.id = $1
       GROUP BY c.id`,
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Customer not found',
      })
      return
    }

    res.json({
      success: true,
      data: mapCustomer(result.rows[0]),
    })
  } catch (err) {
    next(err)
  }
}

// Get customer statistics
export const getCustomerStatistics = async (
  req: Request,
  res: Response<ApiResponse<CustomerStatistics>>,
  next: NextFunction
): Promise<void> => {
  try {
    // Get total customers
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM customers')
    const totalCustomers = parseInt(totalResult.rows[0].total)

    // Get active customers
    const activeResult = await pool.query(
      'SELECT COUNT(*) as total FROM customers WHERE is_active = true'
    )
    const activeCustomers = parseInt(activeResult.rows[0].total)

    // Get total purchases
    const purchasesResult = await pool.query(
      `SELECT 
        COUNT(DISTINCT s.customer_id) as customers_with_purchases,
        COALESCE(SUM(s.total_amount), 0) as total_purchases,
        COALESCE(AVG(s.total_amount), 0) as avg_purchase
       FROM sales s
       WHERE s.payment_status = 'paid'`
    )

    const stats: CustomerStatistics = {
      totalCustomers,
      activeCustomers,
      totalPurchases: parseFloat(purchasesResult.rows[0].total_purchases.toString()),
      averagePurchaseValue: parseFloat(purchasesResult.rows[0].avg_purchase.toString()) || 0,
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (err) {
    next(err)
  }
}

// Create customer
export const createCustomer = async (
  req: AuthenticatedRequest<{}, ApiResponse<Customer>, CreateCustomerRequest>,
  res: Response<ApiResponse<Customer>>,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate input
    const { error, value } = createCustomerSchema.validate(req.body)
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
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country = 'India',
      customerType = 'retail',
      creditLimit = 0,
    } = value

    // Check if email already exists (if provided)
    if (email) {
      const emailCheck = await pool.query('SELECT id FROM customers WHERE email = $1', [email])
      if (emailCheck.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Customer with this email already exists',
        })
        return
      }
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const phoneCheck = await pool.query('SELECT id FROM customers WHERE phone = $1', [phone])
      if (phoneCheck.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Customer with this phone number already exists',
        })
        return
      }
    }

    // Generate customer code
    const customerCode = await generateCustomerCode()

    // Insert customer
    const result = await pool.query<DatabaseCustomer>(
      `INSERT INTO customers (
        customer_code, first_name, last_name, email, phone, address,
        city, state, zip_code, country, customer_type, credit_limit
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        customerCode,
        firstName,
        lastName || null,
        email || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        zipCode || null,
        country,
        customerType,
        creditLimit,
      ]
    )

    res.status(201).json({
      success: true,
      data: mapCustomer(result.rows[0]),
      message: 'Customer created successfully',
    })
  } catch (err) {
    next(err)
  }
}

// Update customer
export const updateCustomer = async (
  req: AuthenticatedRequest<{ id: string }, ApiResponse<Customer>, UpdateCustomerRequest>,
  res: Response<ApiResponse<Customer>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    // Validate input
    const { error, value } = updateCustomerSchema.validate(req.body)
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

    // Check if customer exists
    const customerCheck = await pool.query<DatabaseCustomer>(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    )

    if (customerCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Customer not found',
      })
      return
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      customerType,
      creditLimit,
      isActive,
    } = value

    // Check if email already exists (if being updated)
    if (email !== undefined) {
      const emailCheck = await pool.query(
        'SELECT id FROM customers WHERE email = $1 AND id != $2',
        [email, id]
      )
      if (emailCheck.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Customer with this email already exists',
        })
        return
      }
    }

    // Check if phone already exists (if being updated)
    if (phone !== undefined) {
      const phoneCheck = await pool.query(
        'SELECT id FROM customers WHERE phone = $1 AND id != $2',
        [phone, id]
      )
      if (phoneCheck.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Customer with this phone number already exists',
        })
        return
      }
    }

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramCount++}`)
      values.push(firstName)
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramCount++}`)
      values.push(lastName || null)
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`)
      values.push(email || null)
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`)
      values.push(phone || null)
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount++}`)
      values.push(address || null)
    }
    if (city !== undefined) {
      updates.push(`city = $${paramCount++}`)
      values.push(city || null)
    }
    if (state !== undefined) {
      updates.push(`state = $${paramCount++}`)
      values.push(state || null)
    }
    if (zipCode !== undefined) {
      updates.push(`zip_code = $${paramCount++}`)
      values.push(zipCode || null)
    }
    if (country !== undefined) {
      updates.push(`country = $${paramCount++}`)
      values.push(country)
    }
    if (customerType !== undefined) {
      updates.push(`customer_type = $${paramCount++}`)
      values.push(customerType)
    }
    if (creditLimit !== undefined) {
      updates.push(`credit_limit = $${paramCount++}`)
      values.push(creditLimit)
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`)
      values.push(isActive)
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await pool.query<DatabaseCustomer>(
      `UPDATE customers 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    )

    res.json({
      success: true,
      data: mapCustomer(result.rows[0]),
      message: 'Customer updated successfully',
    })
  } catch (err) {
    next(err)
  }
}

// Delete customer (soft delete)
export const deleteCustomer = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    // Check if customer exists
    const customerCheck = await pool.query('SELECT id FROM customers WHERE id = $1', [id])

    if (customerCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Customer not found',
      })
      return
    }

    // Check if customer has sales
    const salesCheck = await pool.query('SELECT id FROM sales WHERE customer_id = $1 LIMIT 1', [id])
    if (salesCheck.rows.length > 0) {
      // Soft delete (set is_active to false)
      await pool.query(
        'UPDATE customers SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      )
    } else {
      // Hard delete if no sales
      await pool.query('DELETE FROM customers WHERE id = $1', [id])
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    })
  } catch (err) {
    next(err)
  }
}

// Get customer sales
export const getCustomerSales = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<any[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    // Check if customer exists
    const customerCheck = await pool.query('SELECT id FROM customers WHERE id = $1', [id])
    if (customerCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Customer not found',
      })
      return
    }

    // Get sales for customer
    const result = await pool.query(
      `SELECT 
        s.id,
        s.invoice_number,
        s.sale_date,
        s.total_amount,
        s.payment_status,
        s.payment_method,
        COUNT(si.id) as item_count
       FROM sales s
       LEFT JOIN sale_items si ON s.id = si.sale_id
       WHERE s.customer_id = $1
       GROUP BY s.id
       ORDER BY s.sale_date DESC`,
      [id]
    )

    res.json({
      success: true,
      data: result.rows,
    })
  } catch (err) {
    next(err)
  }
}

