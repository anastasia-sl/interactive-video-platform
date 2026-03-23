import { Router } from 'express'
import { StorageController } from './storage.controller'
import { asyncHandler } from '../../utils/async-handler'
import { requireAuth } from '../../middlewares/auth.middleware'
import { requireRole } from '../rbac/roles.middleware'
import { uploadVideoMiddleware } from './upload.middleware'

export const storageRouter = Router()

storageRouter.post(
  '/video',
  requireAuth,
  requireRole('teacher', 'admin'),
  uploadVideoMiddleware,
  asyncHandler(StorageController.uploadVideo)
)