import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env'
import type { UserRole } from '@interactive-video-platform/shared'

interface JwtPayload {
  sub: string
  role: UserRole
}

export const signAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn']
  }

  return jwt.sign(payload, env.JWT_SECRET, options)
}

export const verifyAccessToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET)

  if (typeof decoded === 'string' || !('sub' in decoded) || !('role' in decoded)) {
    throw new Error('Invalid token payload')
  }

  return {
    sub: String(decoded.sub),
    role: decoded.role as UserRole
  }
}