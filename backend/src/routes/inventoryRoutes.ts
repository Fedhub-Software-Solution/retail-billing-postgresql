import express from 'express'
import {
  getInventoryTransactions,
  createInventoryTransaction,
  updateInventoryTransaction,
  deleteInventoryTransaction,
  getLowStockAlerts,
} from '../controllers/inventoryController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/transactions', getInventoryTransactions)
router.get('/low-stock', getLowStockAlerts)

// Protected routes (require authentication)
router.post('/transactions', authenticate, createInventoryTransaction)
router.put('/transactions/:id', authenticate, updateInventoryTransaction)
router.delete('/transactions/:id', authenticate, deleteInventoryTransaction)

export default router

