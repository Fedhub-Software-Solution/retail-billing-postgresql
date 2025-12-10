import { Request, Response, NextFunction } from 'express'
import pool from '../config/database.js'
import { config } from '../config/env.js'
import Joi from 'joi'
import {
  ApiResponse,
  Category,
  DatabaseCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  AuthenticatedRequest,
} from '../types/index.js'

// Validation schemas
const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional().allow(''),
  parentId: Joi.number().integer().positive().optional().allow(null),
})

const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional().allow(''),
  parentId: Joi.number().integer().positive().optional().allow(null),
  isActive: Joi.boolean().optional(),
})

// Helper function to convert database category to API format
const mapCategory = (dbCategory: DatabaseCategory): Category => ({
  id: dbCategory.id,
  name: dbCategory.name,
  description: dbCategory.description || undefined,
  parentId: dbCategory.parent_id || undefined,
  isActive: dbCategory.is_active,
  createdAt: dbCategory.created_at,
  updatedAt: dbCategory.updated_at,
})

// Helper function to build category tree
const buildCategoryTree = (categories: DatabaseCategory[]): Category[] => {
  const categoryMap = new Map<number, Category>()
  const rootCategories: Category[] = []

  // First pass: create all category objects
  categories.forEach((dbCat) => {
    const category = mapCategory(dbCat)
    category.children = []
    categoryMap.set(category.id, category)
  })

  // Second pass: build tree structure
  categories.forEach((dbCat) => {
    const category = categoryMap.get(dbCat.id)!
    if (dbCat.parent_id) {
      const parent = categoryMap.get(dbCat.parent_id)
      if (parent) {
        parent.children!.push(category)
      } else {
        // Parent not found, treat as root
        rootCategories.push(category)
      }
    } else {
      rootCategories.push(category)
    }
  })

  return rootCategories
}

// Get all categories (tree structure)
export const getAllCategories = async (
  req: Request,
  res: Response<ApiResponse<Category[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query<DatabaseCategory>(
      'SELECT * FROM categories ORDER BY name ASC'
    )

    const categories = buildCategoryTree(result.rows)

    res.json({
      success: true,
      data: categories,
    })
  } catch (err) {
    next(err)
  }
}

// Get all categories (flat list)
export const getCategoriesFlat = async (
  req: Request,
  res: Response<ApiResponse<Category[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query<DatabaseCategory>(
      'SELECT * FROM categories ORDER BY name ASC'
    )

    const categories = result.rows.map(mapCategory)

    res.json({
      success: true,
      data: categories,
    })
  } catch (err) {
    next(err)
  }
}

// Get category by ID
export const getCategoryById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Category>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    const result = await pool.query<DatabaseCategory>(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      })
      return
    }

    res.json({
      success: true,
      data: mapCategory(result.rows[0]),
    })
  } catch (err) {
    next(err)
  }
}

// Create category
export const createCategory = async (
  req: AuthenticatedRequest<{}, ApiResponse<Category>, CreateCategoryRequest>,
  res: Response<ApiResponse<Category>>,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate input
    const { error, value } = createCategorySchema.validate(req.body)
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

    const { name, description, parentId } = value

    // Check if parent exists (if provided)
    if (parentId) {
      const parentCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [parentId])
      if (parentCheck.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Parent category not found',
        })
        return
      }
    }

    // Check if category with same name already exists (at same level)
    const duplicateCheck = await pool.query(
      'SELECT id FROM categories WHERE name = $1 AND (parent_id = $2 OR (parent_id IS NULL AND $2 IS NULL))',
      [name, parentId || null]
    )

    if (duplicateCheck.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Category with this name already exists at this level',
      })
      return
    }

    // Insert category
    const result = await pool.query<DatabaseCategory>(
      `INSERT INTO categories (name, description, parent_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, parentId || null]
    )

    res.status(201).json({
      success: true,
      data: mapCategory(result.rows[0]),
      message: 'Category created successfully',
    })
  } catch (err) {
    next(err)
  }
}

// Update category
export const updateCategory = async (
  req: AuthenticatedRequest<{ id: string }, ApiResponse<Category>, UpdateCategoryRequest>,
  res: Response<ApiResponse<Category>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    // Validate input
    const { error, value } = updateCategorySchema.validate(req.body)
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

    // Check if category exists
    const categoryCheck = await pool.query<DatabaseCategory>(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    )

    if (categoryCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      })
      return
    }

    const { name, description, parentId, isActive } = value

    // Prevent circular reference (category cannot be its own parent)
    if (parentId && parseInt(id) === parentId) {
      res.status(400).json({
        success: false,
        message: 'Category cannot be its own parent',
      })
      return
    }

    // Check if parent exists (if provided)
    if (parentId !== undefined) {
      if (parentId !== null) {
        const parentCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [parentId])
        if (parentCheck.rows.length === 0) {
          res.status(404).json({
            success: false,
            message: 'Parent category not found',
          })
          return
        }
      }

      // Check for circular reference in descendants
      const descendantsCheck = await pool.query(
        `WITH RECURSIVE descendants AS (
          SELECT id FROM categories WHERE parent_id = $1
          UNION ALL
          SELECT c.id FROM categories c
          INNER JOIN descendants d ON c.parent_id = d.id
        )
        SELECT id FROM descendants WHERE id = $2`,
        [id, parentId]
      )

      if (descendantsCheck.rows.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Cannot set parent to a descendant category',
        })
        return
      }
    }

    // Check for duplicate name (if name is being updated)
    if (name) {
      const currentCategory = categoryCheck.rows[0]
      const newParentId = parentId !== undefined ? parentId : currentCategory.parent_id

      const duplicateCheck = await pool.query(
        'SELECT id FROM categories WHERE name = $1 AND (parent_id = $2 OR (parent_id IS NULL AND $2 IS NULL)) AND id != $3',
        [name, newParentId || null, id]
      )

      if (duplicateCheck.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Category with this name already exists at this level',
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
    if (parentId !== undefined) {
      updates.push(`parent_id = $${paramCount++}`)
      values.push(parentId || null)
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`)
      values.push(isActive)
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await pool.query<DatabaseCategory>(
      `UPDATE categories 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    )

    res.json({
      success: true,
      data: mapCategory(result.rows[0]),
      message: 'Category updated successfully',
    })
  } catch (err) {
    next(err)
  }
}

// Delete category
export const deleteCategory = async (
  req: AuthenticatedRequest<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    // Check if category exists
    const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [id])

    if (categoryCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      })
      return
    }

    // Check if category has children
    const childrenCheck = await pool.query('SELECT id FROM categories WHERE parent_id = $1', [id])
    if (childrenCheck.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories. Please delete or move subcategories first.',
      })
      return
    }

    // Check if category is used by products
    const productsCheck = await pool.query('SELECT id FROM products WHERE category_id = $1 LIMIT 1', [id])
    if (productsCheck.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete category that is assigned to products. Please reassign products first.',
      })
      return
    }

    // Delete category
    await pool.query('DELETE FROM categories WHERE id = $1', [id])

    res.json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (err) {
    next(err)
  }
}

