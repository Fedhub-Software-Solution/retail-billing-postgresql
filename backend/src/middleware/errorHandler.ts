import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../types/index.js'

interface JoiError extends Error {
  isJoi?: boolean
  details?: Array<{
    path: (string | number)[]
    message: string
  }>
}

export const errorHandler = (
  err: Error | JoiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err)

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
    return
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
    })
    return
  }

  // Validation errors
  if ('isJoi' in err && err.isJoi) {
    const joiError = err as JoiError
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: joiError.details?.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    })
    return
  }

  // Database errors
  if ('code' in err && err.code === '23505') {
    // Unique constraint violation
    res.status(409).json({
      success: false,
      message: 'Duplicate entry',
    })
    return
  }

  // Default error
  const statusCode = 'statusCode' in err ? (err.statusCode as number) : 500
  const message = err.message || 'Internal server error'

  const response: ApiResponse = {
    success: false,
    message,
  }

  if (process.env.NODE_ENV === 'development' && 'stack' in err) {
    ;(response as any).stack = err.stack
  }

  res.status(statusCode).json(response)
}

