import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware'
import { asyncHandler } from '../../utils/async-handler'
import { LessonProgressController } from './lesson-progress.controller'

export const lessonProgressRouter = Router()

lessonProgressRouter.post(
    '/courses/:courseId/lessons/:lessonId/complete',
    requireAuth,
    asyncHandler(LessonProgressController.completeLesson)
)