import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware'
import { asyncHandler } from '../../utils/async-handler'
import { CertificatesController } from './certificates.controller'

export const certificatesRouter = Router()

certificatesRouter.get(
    '/my',
    requireAuth,
    asyncHandler(CertificatesController.getMyCertificates)
)
certificatesRouter.get('/:certificateId/download', requireAuth, asyncHandler(CertificatesController.download))