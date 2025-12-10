import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt, { SignOptions } from 'jsonwebtoken'
import pool from '../config/database.js'
import { config } from '../config/env.js'
import Joi from 'joi'
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  ApiResponse,
  UserPayload,
  DatabaseUser,
  AuthenticatedRequest,
} from '../types/index.js'

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  role: Joi.string().valid('admin', 'manager', 'cashier', 'staff').default('staff'),
  phone: Joi.string().optional(),
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

// Generate JWT tokens
const generateTokens = (user: DatabaseUser): { accessToken: string; refreshToken: string } => {
  const payload: UserPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  }

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn || '24h',
  } as SignOptions)

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn || '7d',
  } as SignOptions)

  return { accessToken, refreshToken }
}

// Register new user
export const register = async (
  req: Request<{}, ApiResponse, RegisterRequest>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body)
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

    const { username, email, password, firstName, lastName, role, phone } = value

    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    )

    if (userCheck.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'User already exists',
      })
      return
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Insert user
    const result = await pool.query<DatabaseUser>(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, email, first_name, last_name, role, phone, created_at`,
      [username, email, passwordHash, firstName, lastName, role, phone]
    )

    const user = result.rows[0]

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      message: 'User registered successfully',
    })
  } catch (err) {
    next(err)
  }
}

// Login user
export const login = async (
  req: Request<{}, ApiResponse<AuthResponse>, LoginRequest>,
  res: Response<ApiResponse<AuthResponse>>,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body)
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

    const { email, password } = value

    // Find user
    const result = await pool.query<DatabaseUser>(
      'SELECT id, username, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
      return
    }

    const user = result.rows[0]

    // Check if user is active
    if (!user.is_active) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      })
      return
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
      return
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id])

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user)

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
      message: 'Login successful',
    })
  } catch (err) {
    next(err)
  }
}

// Refresh token
export const refreshToken = async (
  req: Request<{}, ApiResponse<{ accessToken: string; refreshToken: string }>>,
  res: Response<ApiResponse<{ accessToken: string; refreshToken: string }>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      })
      return
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as UserPayload

    // Get user
    const result = await pool.query<DatabaseUser>(
      'SELECT id, username, email, first_name, last_name, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    )

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      })
      return
    }

    const user = result.rows[0]

    // Generate new tokens
    const tokens = generateTokens(user)

    res.json({
      success: true,
      data: tokens,
      message: 'Token refreshed successfully',
    })
  } catch (err) {
    if (err instanceof Error && (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      })
      return
    }
    next(err)
  }
}

// Logout
export const logout = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  // In a stateless JWT system, logout is handled client-side
  // But we can add token blacklisting here if needed
  res.json({
    success: true,
    message: 'Logout successful',
  })
}

// Get current user profile
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<User>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
      return
    }

    const result = await pool.query<DatabaseUser>(
      'SELECT id, username, email, first_name, last_name, role, phone, is_active, last_login, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    const user = result.rows[0]

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        phone: user.phone || undefined,
        isActive: user.is_active,
        lastLogin: user.last_login || undefined,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    })
  } catch (err) {
    next(err)
  }
}

// Update profile schema
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  phone: Joi.string().optional().allow('', null),
  email: Joi.string().email().optional(),
})

// Change password schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
})

// Update user profile
export const updateProfile = async (
  req: AuthenticatedRequest<{}, ApiResponse<User>, { firstName?: string; lastName?: string; phone?: string; email?: string }>,
  res: Response<ApiResponse<User>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
      return
    }

    // Validate input
    const { error, value } = updateProfileSchema.validate(req.body)
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

    const { firstName, lastName, phone, email } = value

    // Check if email is being changed and if it already exists
    if (email) {
      const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId])
      if (emailCheck.rows.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Email already exists',
        })
        return
      }
    }

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramCount++}`)
      values.push(firstName)
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramCount++}`)
      values.push(lastName)
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`)
      values.push(phone || null)
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`)
      values.push(email)
    }

    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No fields to update',
      })
      return
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId)

    // Update user
    const result = await pool.query<DatabaseUser>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, first_name, last_name, role, phone, is_active, last_login, created_at, updated_at`,
      values
    )

    const updatedUser = result.rows[0]

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: updatedUser.role,
        phone: updatedUser.phone || undefined,
        isActive: updatedUser.is_active,
        lastLogin: updatedUser.last_login || undefined,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      },
      message: 'Profile updated successfully',
    })
  } catch (err) {
    next(err)
  }
}

// Change password
export const changePassword = async (
  req: AuthenticatedRequest<{}, ApiResponse, { currentPassword: string; newPassword: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
      return
    }

    // Validate input
    const { error, value } = changePasswordSchema.validate(req.body)
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

    const { currentPassword, newPassword } = value

    // Get current user with password
    const userResult = await pool.query<DatabaseUser>(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash)

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      })
      return
    }

    // Hash new password
    const saltRounds = 10
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
      newPasswordHash,
      userId,
    ])

    res.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (err) {
    next(err)
  }
}

