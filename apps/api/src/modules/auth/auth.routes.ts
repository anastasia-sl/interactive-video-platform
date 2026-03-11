import { Router } from 'express'
import { AuthController } from './auth.controller'
import { asyncHandler } from '../../utils/async-handler'
import { requireAuth } from '../../middlewares/auth.middleware'
import { requireRole } from '../rbac/roles.middleware'

export const authRouter = Router()

authRouter.post('/register', asyncHandler(AuthController.register))
authRouter.post('/login', asyncHandler(AuthController.login))
authRouter.get('/me', requireAuth, asyncHandler(AuthController.me))
authRouter.get('/admin', requireAuth, requireRole('admin'), asyncHandler(AuthController.adminOnly))
authRouter.get(
  '/teacher-area',
  requireAuth,
  requireRole('teacher', 'admin'),
  asyncHandler(AuthController.teacherOrAdmin)
)