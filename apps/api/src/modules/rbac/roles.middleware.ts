import type { NextFunction, Request, Response } from 'express'
import type { UserRole } from '@interactive-video-platform/shared'
import { HttpError } from '../../utils/http-error'

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new HttpError(401, 'Unauthorized'))
    }

    if (!roles.includes(req.auth.role)) {
      return next(new HttpError(403, 'Forbidden'))
    }

    return next()
  }
}