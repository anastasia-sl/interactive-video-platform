import express from 'express'
import cors from 'cors'
import { env } from '../config/env'
import { authRouter } from '../modules/auth/auth.routes'
import { coursesRouter } from '../modules/courses/course.routes'
import { errorMiddleware } from '../middlewares/error.middleware'
import { storageRouter } from '../modules/storage/storage.routes'
import { interactiveQuestionRouter } from '../modules/interactive-questions/interactive-question.routes'

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

  app.use(errorMiddleware)

  return app
}