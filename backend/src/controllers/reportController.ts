import { Request, Response, NextFunction } from 'express'
import pool from '../config/database.js'
import { ApiResponse } from '../types/index.js'

// Sales summary report
export const getSalesSummary = async (
  req: Request<{}, ApiResponse<any>, {}, { startDate?: string; endDate?: string; groupBy?: string }>,
  res: Response<ApiResponse<any>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query

    let dateFilter = ''
    const params: any[] = []
    let paramCount = 1

    if (startDate) {
      dateFilter += ` AND sale_date >= $${paramCount}`
      params.push(startDate)
      paramCount++
    }

    if (endDate) {
      dateFilter += ` AND sale_date <= $${paramCount}`
      params.push(endDate)
      paramCount++
    }

    let groupByClause = ''
    switch (groupBy) {
      case 'day':
        groupByClause = 'DATE(sale_date)'
        break
      case 'week':
        groupByClause = "DATE_TRUNC('week', sale_date)"
        break
      case 'month':
        groupByClause = "DATE_TRUNC('month', sale_date)"
        break
      case 'year':
        groupByClause = "DATE_TRUNC('year', sale_date)"
        break
      default:
        groupByClause = 'DATE(sale_date)'
    }

    const result = await pool.query(
      `SELECT 
        ${groupByClause} as period,
        COUNT(*) as total_sales,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(tax_amount), 0) as total_tax,
        COALESCE(SUM(discount_amount), 0) as total_discount,
        COALESCE(AVG(total_amount), 0) as average_order_value
       FROM sales
       WHERE payment_status != 'cancelled' ${dateFilter}
       GROUP BY ${groupByClause}
       ORDER BY period DESC`,
      params
    )

    const summary = result.rows.map((row) => ({
      period: row.period instanceof Date ? row.period.toISOString().split('T')[0] : row.period,
      totalSales: parseInt(row.total_sales),
      totalRevenue: parseFloat(row.total_revenue.toString()),
      totalTax: parseFloat(row.total_tax.toString()),
      totalDiscount: parseFloat(row.total_discount.toString()),
      averageOrderValue: parseFloat(row.average_order_value.toString()),
    }))

    // Overall totals
    const totalsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(tax_amount), 0) as total_tax,
        COALESCE(SUM(discount_amount), 0) as total_discount,
        COALESCE(AVG(total_amount), 0) as average_order_value
       FROM sales
       WHERE payment_status != 'cancelled' ${dateFilter}`,
      params
    )

    const totals = totalsResult.rows[0]

    res.json({
      success: true,
      data: {
        summary,
        totals: {
          totalSales: parseInt(totals.total_sales),
          totalRevenue: parseFloat(totals.total_revenue.toString()),
          totalTax: parseFloat(totals.total_tax.toString()),
          totalDiscount: parseFloat(totals.total_discount.toString()),
          averageOrderValue: parseFloat(totals.average_order_value.toString()),
        },
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

// Top products report
export const getTopProducts = async (
  req: Request<{}, ApiResponse<any>, {}, { limit?: string; startDate?: string; endDate?: string }>,
  res: Response<ApiResponse<any>>,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit || '10')
    const { startDate, endDate } = req.query

    let dateFilter = ''
    const params: any[] = []
    let paramCount = 1

    if (startDate) {
      dateFilter += ` AND s.sale_date >= $${paramCount}`
      params.push(startDate)
      paramCount++
    }

    if (endDate) {
      dateFilter += ` AND s.sale_date <= $${paramCount}`
      params.push(endDate)
      paramCount++
    }

    params.push(limit)

    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.sku,
        p.category_id,
        c.name as category_name,
        SUM(si.quantity) as total_quantity,
        SUM(si.line_total) as total_revenue,
        COUNT(DISTINCT s.id) as sale_count
       FROM sale_items si
       INNER JOIN sales s ON si.sale_id = s.id
       INNER JOIN products p ON si.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE s.payment_status != 'cancelled' ${dateFilter}
       GROUP BY p.id, p.name, p.sku, p.category_id, c.name
       ORDER BY total_quantity DESC
       LIMIT $${paramCount}`,
      params
    )

    const products = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      categoryId: row.category_id,
      categoryName: row.category_name,
      totalQuantity: parseInt(row.total_quantity),
      totalRevenue: parseFloat(row.total_revenue.toString()),
      saleCount: parseInt(row.sale_count),
    }))

    res.json({
      success: true,
      data: products,
    })
  } catch (err) {
    next(err)
  }
}

// Top customers report
export const getTopCustomers = async (
  req: Request<{}, ApiResponse<any>, {}, { limit?: string; startDate?: string; endDate?: string }>,
  res: Response<ApiResponse<any>>,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit || '10')
    const { startDate, endDate } = req.query

    let dateFilter = ''
    const params: any[] = []
    let paramCount = 1

    if (startDate) {
      dateFilter += ` AND s.sale_date >= $${paramCount}`
      params.push(startDate)
      paramCount++
    }

    if (endDate) {
      dateFilter += ` AND s.sale_date <= $${paramCount}`
      params.push(endDate)
      paramCount++
    }

    params.push(limit)

    const result = await pool.query(
      `SELECT 
        c.id,
        c.customer_code,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        COUNT(DISTINCT s.id) as purchase_count,
        COALESCE(SUM(s.total_amount), 0) as total_spent,
        COALESCE(AVG(s.total_amount), 0) as average_order_value
       FROM customers c
       INNER JOIN sales s ON c.id = s.customer_id
       WHERE s.payment_status != 'cancelled' ${dateFilter}
       GROUP BY c.id, c.customer_code, c.first_name, c.last_name, c.email, c.phone
       ORDER BY total_spent DESC
       LIMIT $${paramCount}`,
      params
    )

    const customers = result.rows.map((row) => ({
      id: row.id,
      customerCode: row.customer_code,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      purchaseCount: parseInt(row.purchase_count),
      totalSpent: parseFloat(row.total_spent.toString()),
      averageOrderValue: parseFloat(row.average_order_value.toString()),
    }))

    res.json({
      success: true,
      data: customers,
    })
  } catch (err) {
    next(err)
  }
}

// Inventory status report
export const getInventoryStatus = async (
  req: Request,
  res: Response<ApiResponse<any>>,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE stock_quantity = 0) as out_of_stock,
        COUNT(*) FILTER (WHERE stock_quantity > 0 AND stock_quantity <= min_stock_level) as low_stock,
        COUNT(*) FILTER (WHERE stock_quantity > min_stock_level) as in_stock,
        COUNT(*) FILTER (WHERE is_active = true) as active_products,
        COUNT(*) FILTER (WHERE is_active = false) as inactive_products,
        COALESCE(SUM(stock_quantity * cost_price), 0) as total_inventory_value
       FROM products`
    )

    const status = result.rows[0]

    // Low stock products detail
    const lowStockResult = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.sku,
        p.stock_quantity,
        p.min_stock_level,
        c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.stock_quantity <= p.min_stock_level AND p.is_active = true
       ORDER BY p.stock_quantity ASC
       LIMIT 20`
    )

    res.json({
      success: true,
      data: {
        summary: {
          outOfStock: parseInt(status.out_of_stock),
          lowStock: parseInt(status.low_stock),
          inStock: parseInt(status.in_stock),
          activeProducts: parseInt(status.active_products),
          inactiveProducts: parseInt(status.inactive_products),
          totalInventoryValue: parseFloat(status.total_inventory_value.toString()),
        },
        lowStockProducts: lowStockResult.rows.map((row) => ({
          id: row.id,
          name: row.name,
          sku: row.sku,
          stockQuantity: row.stock_quantity,
          minStockLevel: row.min_stock_level,
          categoryName: row.category_name,
        })),
      },
    })
  } catch (err) {
    next(err)
  }
}

// Daily sales breakdown
export const getDailySales = async (
  req: Request<{}, ApiResponse<any>, {}, { startDate?: string; endDate?: string }>,
  res: Response<ApiResponse<any>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query

    let dateFilter = ''
    const params: any[] = []
    let paramCount = 1

    if (startDate) {
      dateFilter += ` AND sale_date >= $${paramCount}`
      params.push(startDate)
      paramCount++
    }

    if (endDate) {
      dateFilter += ` AND sale_date <= $${paramCount}`
      params.push(endDate)
      paramCount++
    }

    const result = await pool.query(
      `SELECT 
        DATE(sale_date) as date,
        COUNT(*) as sales_count,
        COALESCE(SUM(total_amount), 0) as revenue,
        COALESCE(SUM(tax_amount), 0) as tax,
        COALESCE(SUM(discount_amount), 0) as discount,
        COALESCE(AVG(total_amount), 0) as avg_order_value
       FROM sales
       WHERE payment_status != 'cancelled' ${dateFilter}
       GROUP BY DATE(sale_date)
       ORDER BY date DESC`,
      params
    )

    const dailySales = result.rows.map((row) => ({
      date: row.date.toISOString().split('T')[0],
      salesCount: parseInt(row.sales_count),
      revenue: parseFloat(row.revenue.toString()),
      tax: parseFloat(row.tax.toString()),
      discount: parseFloat(row.discount.toString()),
      avgOrderValue: parseFloat(row.avg_order_value.toString()),
    }))

    res.json({
      success: true,
      data: dailySales,
    })
  } catch (err) {
    next(err)
  }
}

