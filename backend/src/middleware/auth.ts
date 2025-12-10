import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { UserPayload, AuthenticatedRequest } from '../types/index.js'

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthenticatedRequest
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      })
      return
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, config.jwt.secret) as UserPayload

    authReq.user = decoded
    next()
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expired',
      })
      return
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
  }
}

// Optional authentication - allows requests without token (for staff mode)
export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthenticatedRequest
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      try {
        const decoded = jwt.verify(token, config.jwt.secret) as UserPayload
        authReq.user = decoded
      } catch (error) {
        // Invalid token, but continue without authentication (staff mode)
        authReq.user = undefined
      }
    }
    // No token provided, continue without authentication (staff mode)
    next()
  } catch (error) {
    // Error parsing, continue without authentication
    next()
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
      return
    }

    if (!roles.includes(authReq.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions',
      })
      return
    }

    next()
  }
}


