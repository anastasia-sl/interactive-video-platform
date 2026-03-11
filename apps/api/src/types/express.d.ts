import type { UserRole } from '@interactive-video-platform/shared'

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string
        role: UserRole
      }
    }
  }
}

export {}