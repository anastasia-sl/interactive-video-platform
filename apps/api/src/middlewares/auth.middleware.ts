import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { HttpError } from '../utils/http-error'

const readBearerToken = (authorization?: string): string | null => {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null
  }

  return authorization.replace('Bearer ', '').trim()
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = readBearerToken(req.headers.authorization)

  if (!token) {
    return next(new HttpError(401, 'Unauthorized'))
  }

  try {
    const payload = verifyAccessToken(token)

    req.auth = {
      userId: payload.sub,
      role: payload.role
    }

    return next()
  } catch {
    return next(new HttpError(401, 'Invalid or expired token'))
  }
}

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = readBearerToken(req.headers.authorization)

  if (!token) {
    return next()
  }

  try {
    const payload = verifyAccessToken(token)

    req.auth = {
      userId: payload.sub,
      role: payload.role
    }

    return next()
  } catch {
    return next(new HttpError(401, 'Invalid or expired token'))
  }
}