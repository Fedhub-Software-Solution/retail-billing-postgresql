import { Request, Response, NextFunction } from 'express'
import pool from '../config/database.js'
import Joi from 'joi'
import {
  ApiResponse,
  Setting,
  DatabaseSetting,
  UpdateSettingRequest,
  AuthenticatedRequest,
} from '../types/index.js'

// Validation schema
const updateSettingSchema = Joi.object({
  value: Joi.string().allow('', null).default(''),
})

// Helper function to convert database setting to API format
const mapSetting = (dbSetting: DatabaseSetting): Setting => ({
  id: dbSetting.id,
  key: dbSetting.key,
  value: dbSetting.value || '',
  type: dbSetting.type,
  description: dbSetting.description || undefined,
  updatedAt: dbSetting.updated_at,
})

// Get all settings
export const getSettings = async (
  req: Request,
  res: Response<ApiResponse<Setting[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await pool.query<DatabaseSetting>(
      'SELECT * FROM settings ORDER BY key ASC'
    )

    res.json({
      success: true,
      data: result.rows.map(mapSetting),
    })
  } catch (err) {
    next(err)
  }
}

// Get setting by key
export const getSettingByKey = async (
  req: Request<{ key: string }>,
  res: Response<ApiResponse<Setting>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { key } = req.params
    // Decode the key in case it was URL encoded
    const decodedKey = decodeURIComponent(key)

    const result = await pool.query<DatabaseSetting>(
      'SELECT * FROM settings WHERE key = $1',
      [decodedKey]
    )

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Setting not found',
      })
      return
    }

    res.json({
      success: true,
      data: mapSetting(result.rows[0]),
    })
  } catch (err) {
    next(err)
  }
}

// Update setting
export const updateSetting = async (
  req: AuthenticatedRequest<{ key: string }, ApiResponse<Setting>, UpdateSettingRequest>,
  res: Response<ApiResponse<Setting>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { key } = req.params
    // Decode the key in case it was URL encoded
    const decodedKey = decodeURIComponent(key)

    // Validate input
    const { error, value: validatedData } = updateSettingSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })
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

    const settingValue = validatedData.value || ''

    // Check if setting exists
    const settingCheck = await pool.query<DatabaseSetting>(
      'SELECT * FROM settings WHERE key = $1',
      [decodedKey]
    )

    if (settingCheck.rows.length === 0) {
      // Create setting if it doesn't exist
      const result = await pool.query<DatabaseSetting>(
        `INSERT INTO settings (key, value, type)
         VALUES ($1, $2, 'string')
         RETURNING *`,
        [decodedKey, settingValue]
      )

      res.json({
        success: true,
        data: mapSetting(result.rows[0]),
        message: 'Setting created successfully',
      })
      return
    }

    // Update setting
    const result = await pool.query<DatabaseSetting>(
      `UPDATE settings 
       SET value = $1, updated_at = CURRENT_TIMESTAMP
       WHERE key = $2
       RETURNING *`,
      [settingValue, decodedKey]
    )

    res.json({
      success: true,
      data: mapSetting(result.rows[0]),
      message: 'Setting updated successfully',
    })
  } catch (err) {
    next(err)
  }
}

