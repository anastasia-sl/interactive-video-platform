import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { HttpError } from '../utils/http-error'

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Unauthorized'))
  }

  const token = authorization.replace('Bearer ', '').trim()

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