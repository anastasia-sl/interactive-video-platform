import { Router } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { requireAuth } from '../../middlewares/auth.middleware'
import { QuestionAttemptController } from './question-attempt.controller'

export const questionAttemptRouter = Router()

questionAttemptRouter.post(
    '/answers',
    requireAuth,
    asyncHandler(QuestionAttemptController.submitAnswer)
)