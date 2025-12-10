import express from 'express'
import {
  getAllCategories,
  getCategoriesFlat,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getAllCategories)
router.get('/flat', getCategoriesFlat)
router.get('/:id', getCategoryById)

// Protected routes (require authentication)
router.post('/', authenticate, createCategory)
router.put('/:id', authenticate, updateCategory)
router.delete('/:id', authenticate, deleteCategory)

export default router

