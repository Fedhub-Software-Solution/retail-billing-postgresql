import express from 'express'
import { getSettings, getSettingByKey, updateSetting } from '../controllers/settingsController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getSettings)
router.get('/:key', getSettingByKey)

// Protected routes (require authentication)
router.put('/:key', authenticate, updateSetting)

export default router

