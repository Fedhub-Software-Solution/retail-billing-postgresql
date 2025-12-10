import express from 'express'
import {
  getSalesSummary,
  getTopProducts,
  getTopCustomers,
  getInventoryStatus,
  getDailySales,
} from '../controllers/reportController.js'

const router = express.Router()

router.get('/sales-summary', getSalesSummary)
router.get('/top-products', getTopProducts)
router.get('/top-customers', getTopCustomers)
router.get('/inventory-status', getInventoryStatus)
router.get('/daily-sales', getDailySales)

export default router

