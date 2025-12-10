import { Request, Response, NextFunction } from 'express'
import pool from '../config/database.js'
import { ApiResponse } from '../types/index.js'

// Dashboard statistics
export const getDashboardStats = async (
  req: Request,
  res: Response<ApiResponse<any>>,
  next: NextFunction
): Promise<void> => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    // Today's sales
    const todaySalesResult = await pool.query(
      `SELECT 
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM sales
       WHERE sale_date >= $1 AND sale_date < $2 AND payment_status != 'cancelled'`,
      [today, tomorrow]
    )

    // Month's sales
    const monthSalesResult = await pool.query(
      `SELECT 
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM sales
       WHERE sale_date >= $1 AND sale_date < $2 AND payment_status != 'cancelled'`,
      [startOfMonth, startOfNextMonth]
    )

    // Low stock products
    const lowStockResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM products
       WHERE stock_quantity <= min_stock_level AND is_active = true`
    )

    // Pending payments
    const pendingPaymentsResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM sales
       WHERE payment_status IN ('pending', 'partial')`
    )

    // Top products (last 30 days)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const topProductsResult = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.sku,
        SUM(si.quantity) as total_quantity,
        SUM(si.line_total) as total_revenue
       FROM sale_items si
       INNER JOIN sales s ON si.sale_id = s.id
       INNER JOIN products p ON si.product_id = p.id
       WHERE s.sale_date >= $1 AND s.payment_status != 'cancelled'
       GROUP BY p.id, p.name, p.sku
       ORDER BY total_quantity DESC
       LIMIT 5`,
      [thirtyDaysAgo]
    )

    // Recent sales
    const recentSalesResult = await pool.query(
      `SELECT 
        s.id,
        s.invoice_number,
        s.total_amount,
        s.sale_date,
        s.payment_status,
        c.first_name || ' ' || COALESCE(c.last_name, '') as customer_name
       FROM sales s
       LEFT JOIN customers c ON s.customer_id = c.id
       WHERE s.payment_status != 'cancelled'
       ORDER BY s.sale_date DESC
       LIMIT 10`
    )

    const stats = {
      todaySales: {
        count: parseInt(todaySalesResult.rows[0].count),
        revenue: parseFloat(todaySalesResult.rows[0].revenue.toString()),
      },
      monthSales: {
        count: parseInt(monthSalesResult.rows[0].count),
        revenue: parseFloat(monthSalesResult.rows[0].revenue.toString()),
      },
      lowStockProducts: parseInt(lowStockResult.rows[0].count),
      pendingPayments: parseInt(pendingPaymentsResult.rows[0].count),
      topProducts: topProductsResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        totalQuantity: parseInt(row.total_quantity),
        totalRevenue: parseFloat(row.total_revenue.toString()),
      })),
      recentSales: recentSalesResult.rows.map((row) => ({
        id: row.id,
        invoiceNumber: row.invoice_number,
        totalAmount: parseFloat(row.total_amount.toString()),
        saleDate: row.sale_date,
        paymentStatus: row.payment_status,
        customerName: row.customer_name || 'Walk-in',
      })),
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (err) {
    next(err)
  }
}

// Get sales trend (for charts)
export const getSalesTrend = async (
  req: Request<{}, ApiResponse<any>, {}, { period?: string; days?: string }>,
  res: Response<ApiResponse<any>>,
  next: NextFunction
): Promise<void> => {
  try {
    const period = req.query.period || '7' // days
    const days = parseInt(period)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const result = await pool.query(
      `SELECT 
        DATE(sale_date) as date,
        COUNT(*) as sales_count,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM sales
       WHERE sale_date >= $1 AND payment_status != 'cancelled'
       GROUP BY DATE(sale_date)
       ORDER BY date ASC`,
      [startDate]
    )

    const trend = result.rows.map((row) => ({
      date: row.date.toISOString().split('T')[0],
      salesCount: parseInt(row.sales_count),
      revenue: parseFloat(row.revenue.toString()),
    }))

    res.json({
      success: true,
      data: trend,
    })
  } catch (err) {
    next(err)
  }
}

