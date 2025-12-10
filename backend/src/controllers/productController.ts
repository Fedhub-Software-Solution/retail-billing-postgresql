import { Request, Response, NextFunction } from 'express'
import pool from '../config/database.js'
import Joi from 'joi'
import {
  ApiResponse,
  Product,
  DatabaseProduct,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
  PaginatedResponse,
  AuthenticatedRequest,
} from '../types/index.js'

// Validation schemas
const createProductSchema = Joi.object({
  sku: Joi.string().min(1).max(50).required(),
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).optional().allow(''),
  categoryId: Joi.number().integer().positive().optional().allow(null),
  barcode: Joi.string().max(100).optional().allow(''),
  unitPrice: Joi.number().positive().required(),
  costPrice: Joi.number().positive().optional().allow(null),
  stockQuantity: Joi.number().integer().min(0).default(0),
  minStockLevel: Joi.number().integer().min(0).default(0),
  unit: Joi.string().max(20).default('pcs'),
  taxRate: Joi.number().min(0).max(100).default(0),
})

const updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  description: Joi.string().max(1000).optional().allow(''),
  categoryId: Joi.number().integer().positive().optional().allow(null),
  barcode: Joi.string().max(100).optional().allow(''),
  unitPrice: Joi.number().positive().optional(),
  costPrice: Joi.number().positive().optional().allow(null),
  stockQuantity: Joi.number().integer().min(0).optional(),
  minStockLevel: Joi.number().integer().min(0).optional(),
  unit: Joi.string().max(20).optional(),
  imageUrl: Joi.string().uri().max(500).optional().allow(''),
  isActive: Joi.boolean().optional(),
  taxRate: Joi.number().min(0).max(100).optional(),
})

// Helper function to convert database product to API format
const mapProduct = (dbProduct: DatabaseProduct & { category_name?: string }): Product => ({
  id: dbProduct.id,
  sku: dbProduct.sku,
  name: dbProduct.name,
  description: dbProduct.description || undefined,
  categoryId: dbProduct.category_id || undefined,
  categoryName: dbProduct.category_name || undefined,
  barcode: dbProduct.barcode || undefined,
  unitPrice: parseFloat(dbProduct.unit_price.toString()),
  costPrice: dbProduct.cost_price ? parseFloat(dbProduct.cost_price.toString()) : undefined,
  stockQuantity: dbProduct.stock_quantity,
  minStockLevel: dbProduct.min_stock_level,
  unit: dbProduct.unit,
  imageUrl: dbProduct.image_url || undefined,
  isActive: dbProduct.is_active,
  taxRate: parseFloat(dbProduct.tax_rate.toString()),
  createdAt: dbProduct.created_at,
  updatedAt: dbProduct.updated_at,
})

// Get all products with pagination and filters
export const getProducts = async (
  req: Request<{}, ApiResponse<PaginatedResponse<Product>>, {}, ProductQueryParams>,
  res: Response<ApiResponse<PaginatedResponse<Product>>>,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      sortBy = 'name',
      order = 'asc',
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    // Build WHERE clause
    const conditions: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (search) {
      conditions.push(
        `(p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount} OR p.barcode ILIKE $${paramCount})`
      )
      params.push(`%${search}%`)
      paramCount++
    }

    if (categoryId) {
      conditions.push(`p.category_id = $${paramCount}`)
      params.push(categoryId)
      paramCount++
    }

    if (minPrice !== undefined) {
      conditions.push(`p.unit_price >= $${paramCount}`)
      params.push(minPrice)
      paramCount++
    }

    if (maxPrice !== undefined) {
      conditions.push(`p.unit_price <= $${paramCount}`)
      params.push(maxPrice)
      paramCount++
    }

    if (inStock !== undefined) {
      if (inStock) {
        conditions.push(`p.stock_quantity > 0`)
      } else {
        conditions.push(`p.stock_quantity = 0`)
      }
    }

    // Always filter by is_active = true to exclude deleted products
    conditions.push('p.is_active = true')
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Validate sortBy
    const validSortFields = ['name', 'sku', 'unit_price', 'stock_quantity', 'created_at']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name'
    const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC'

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM products p ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].total)

    // Get products
    const result = await pool.query<DatabaseProduct & { category_name?: string }>(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.${sortField} ${sortOrder}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, Number(limit), offset]
    )

    const products = result.rows.map(mapProduct)

    res.json({
      success: true,
      data: {
        data: products,
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

// Get product by ID
export const getProductById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Product>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const result = await pool.query<DatabaseProduct & { category_name?: string }>(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      })
      return
    }

    res.json({
      success: true,
      data: mapProduct(result.rows[0]),
    })
  } catch (err) {
    next(err)
  }
}

// Get products with low stock
export const getLowStockProducts = async (
  req: Request<{}, ApiResponse<Product[]>, {}, { threshold?: string }>,
  res: Response<ApiResponse<Product[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold) : undefined

    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock_quantity <= p.min_stock_level
      AND p.is_active = true
    `

    const params: any[] = []
    if (threshold !== undefined) {
      query += ` AND p.stock_quantity <= $1`
      params.push(threshold)
    }

    query += ` ORDER BY p.stock_quantity ASC`

    const result = await pool.query<DatabaseProduct & { category_name?: string }>(query, params)

    res.json({
      success: true,
      data: result.rows.map(mapProduct),
    })
  } catch (err) {
    next(err)
  }
}

// Create product
export const createProduct = async (
  req: AuthenticatedRequest<{}, ApiResponse<Product>, CreateProductRequest>,
  res: Response<ApiResponse<Product>>,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate input
    const { error, value } = createProductSchema.validate(req.body)
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
      sku,
      name,
      description,
      categoryId,
      barcode,
      unitPrice,
      costPrice,
      stockQuantity = 0,
      minStockLevel = 0,
      unit = 'pcs',
      taxRate = 0,
    } = value

    // Check if SKU already exists
    const skuCheck = await pool.query('SELECT id FROM products WHERE sku = $1', [sku])
    if (skuCheck.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Product with this SKU already exists',
      })
      return
    }

    // Check if barcode already exists (if provided)
    if (barcode) {
      const barcodeCheck = await pool.query('SELECT id FROM products WHERE barcode = $1', [barcode])
      if (barcodeCheck.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Product with this barcode already exists',
        })
        return
      }
    }

    // Check if category exists (if provided)
    if (categoryId) {
      const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId])
      if (categoryCheck.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
        })
        return
      }
    }

    // Insert product
    const result = await pool.query<DatabaseProduct>(
      `INSERT INTO products (
        sku, name, description, category_id, barcode, unit_price, cost_price,
        stock_quantity, min_stock_level, unit, tax_rate
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        sku,
        name,
        description || null,
        categoryId || null,
        barcode || null,
        unitPrice,
        costPrice || null,
        stockQuantity,
        minStockLevel,
        unit,
        taxRate,
      ]
    )

    // Get category name if exists
    let categoryName: string | undefined
    if (categoryId) {
      const catResult = await pool.query('SELECT name FROM categories WHERE id = $1', [categoryId])
      if (catResult.rows.length > 0) {
        categoryName = catResult.rows[0].name
      }
    }

    const product = { ...result.rows[0], category_name: categoryName }

    res.status(201).json({
      success: true,
      data: mapProduct(product),
      message: 'Product created successfully',
    })
  } catch (err) {
    next(err)
  }
}

// Update product
export const updateProduct = async (
  req: AuthenticatedRequest<{ id: string }, ApiResponse<Product>, UpdateProductRequest>,
  res: Response<ApiResponse<Product>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    // Validate input
    const { error, value } = updateProductSchema.validate(req.body)
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

    // Check if product exists
    const productCheck = await pool.query<DatabaseProduct>(
      'SELECT * FROM products WHERE id = $1',
      [id]
    )

    if (productCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      })
      return
    }

    const {
      name,
      description,
      categoryId,
      barcode,
      unitPrice,
      costPrice,
      stockQuantity,
      minStockLevel,
      unit,
      imageUrl,
      isActive,
      taxRate,
    } = value

    // Check if barcode already exists (if being updated)
    if (barcode !== undefined) {
      const barcodeCheck = await pool.query(
        'SELECT id FROM products WHERE barcode = $1 AND id != $2',
        [barcode, id]
      )
      if (barcodeCheck.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Product with this barcode already exists',
        })
        return
      }
    }

    // Check if category exists (if provided)
    if (categoryId !== undefined && categoryId !== null) {
      const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId])
      if (categoryCheck.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
        })
        return
      }
    }

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`)
      values.push(name)
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`)
      values.push(description || null)
    }
    if (categoryId !== undefined) {
      updates.push(`category_id = $${paramCount++}`)
      values.push(categoryId || null)
    }
    if (barcode !== undefined) {
      updates.push(`barcode = $${paramCount++}`)
      values.push(barcode || null)
    }
    if (unitPrice !== undefined) {
      updates.push(`unit_price = $${paramCount++}`)
      values.push(unitPrice)
    }
    if (costPrice !== undefined) {
      updates.push(`cost_price = $${paramCount++}`)
      values.push(costPrice || null)
    }
    if (stockQuantity !== undefined) {
      updates.push(`stock_quantity = $${paramCount++}`)
      values.push(stockQuantity)
    }
    if (minStockLevel !== undefined) {
      updates.push(`min_stock_level = $${paramCount++}`)
      values.push(minStockLevel)
    }
    if (unit !== undefined) {
      updates.push(`unit = $${paramCount++}`)
      values.push(unit)
    }
    if (imageUrl !== undefined) {
      updates.push(`image_url = $${paramCount++}`)
      values.push(imageUrl || null)
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`)
      values.push(isActive)
    }
    if (taxRate !== undefined) {
      updates.push(`tax_rate = $${paramCount++}`)
      values.push(taxRate)
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await pool.query<DatabaseProduct>(
      `UPDATE products 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    )

    // Get category name if exists
    let categoryName: string | undefined
    const finalCategoryId = categoryId !== undefined ? categoryId : productCheck.rows[0].category_id
    if (finalCategoryId) {
      const catResult = await pool.query('SELECT name FROM categories WHERE id = $1', [finalCategoryId])
      if (catResult.rows.length > 0) {
        categoryName = catResult.rows[0].name
      }
    }

    const product = { ...result.rows[0], category_name: categoryName }

    res.json({
      success: true,
      data: mapProduct(product),
      message: 'Product updated successfully',
    })
  } catch (err) {
    next(err)
  }
}

// Delete product (soft delete)
export const deleteProduct = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    // Check if product exists
    const productCheck = await pool.query('SELECT id FROM products WHERE id = $1', [id])

    if (productCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      })
      return
    }

    // Soft delete (set is_active to false)
    await pool.query('UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id])

    res.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (err) {
    next(err)
  }
}

