import express from 'express'
import cors from 'cors'
import { env } from '../config/env'
import { authRouter } from '../modules/auth/auth.routes'
import { coursesRouter } from '../modules/courses/course.routes'
import { errorMiddleware } from '../middlewares/error.middleware'
import { storageRouter } from '../modules/storage/storage.routes'
import { interactiveQuestionRouter } from '../modules/interactive-questions/interactive-question.routes'
import { questionAttemptRouter } from '../modules/interactive-question-attempts/question-attempt.routes'
import { certificatesRouter } from '../modules/certificates/certificates.routes'
import { lessonProgressRouter } from '../modules/lesson-progress/lesson-progress.routes'

export const createApp = () => {
  const app = express()

  app.use(
    cors({
      origin: (origin, callback) => {
        const allowed = env.CLIENT_URL.split(',').map((url) => url.trim())
        if (!origin || allowed.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error(`CORS: origin ${origin} is not allowed`))
        }
      },
      credentials: true
    })
  )

  app.use(express.json())

  app.get('/', (_req, res) => {
    res.status(200).json({
      message: 'API is running'
    })
  })

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok'
    })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/courses', coursesRouter)
  app.use('/api/storage', storageRouter)
  app.use('/api/interactive-questions', interactiveQuestionRouter)
  app.use('/api/question-attempts', questionAttemptRouter)
  app.use('/api/lesson-progress', lessonProgressRouter)
  app.use('/api/certificates', certificatesRouter)

  app.use(errorMiddleware)

  return app
}