import { Router } from 'express'
import { InteractiveQuestionController } from './interactive-question.controller'
import { asyncHandler } from '../../utils/async-handler'
import { optionalAuth, requireAuth } from '../../middlewares/auth.middleware'
import { requireRole } from '../rbac/roles.middleware'

export const interactiveQuestionRouter = Router()

interactiveQuestionRouter.get(
    '/lessons/:lessonId/questions',
    optionalAuth,
    asyncHandler(InteractiveQuestionController.getStudentQuestionsByLesson)
)

interactiveQuestionRouter.get(
    '/lessons/:lessonId/questions/editor',
    requireAuth,
    requireRole('teacher', 'admin'),
    asyncHandler(InteractiveQuestionController.getTeacherQuestionsByLesson)
)

interactiveQuestionRouter.post(
    '/lessons/:lessonId/questions',
    requireAuth,
    requireRole('teacher', 'admin'),
    asyncHandler(InteractiveQuestionController.createQuestion)
)

interactiveQuestionRouter.get(
    '/questions/:id',
    requireAuth,
    requireRole('teacher', 'admin'),
    asyncHandler(InteractiveQuestionController.getTeacherQuestionById)
)

interactiveQuestionRouter.patch(
    '/questions/:id',
    requireAuth,
    requireRole('teacher', 'admin'),
    asyncHandler(InteractiveQuestionController.updateQuestion)
)

interactiveQuestionRouter.delete(
    '/questions/:id',
    requireAuth,
    requireRole('teacher', 'admin'),
    asyncHandler(InteractiveQuestionController.deleteQuestion)
)

interactiveQuestionRouter.post(
    '/questions/reorder',
    requireAuth,
    requireRole('teacher', 'admin'),
    asyncHandler(InteractiveQuestionController.reorderQuestions)
)