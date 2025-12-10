import express from 'express'
import { getDashboardStats, getSalesTrend } from '../controllers/dashboardController.js'

const router = express.Router()

router.get('/stats', getDashboardStats)
router.get('/sales-trend', getSalesTrend)

export default router

